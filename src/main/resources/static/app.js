const campSelect = document.querySelector('#camp-select');
const notice = document.querySelector('#notice');

let selectedCampId = '';
let currentTab = 'families';
let families = [];
let inventory = [];

// Send a request and turn unsuccessful HTTP responses into readable errors.
async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(data?.detail || data?.message || `Request failed (${response.status})`);
    }

    return data;
}

function jsonOptions(method, body) {
    return {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
}

function showNotice(message, isError = false) {
    notice.textContent = message;
    notice.classList.toggle('error', isError);
    notice.hidden = false;
}

function clearNotice() {
    notice.hidden = true;
    notice.textContent = '';
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

function selectedCamp() {
    return campSelect.value;
}

async function loadCamps(preferredCampId) {
    const camps = await apiRequest('/api/camps');
    campSelect.innerHTML = '<option value="">Choose a camp</option>';

    for (const camp of camps) {
        const option = document.createElement('option');
        option.value = camp.id;
        option.textContent = `${camp.name} · ${camp.location}`;
        campSelect.append(option);
    }

    const nextCampId = preferredCampId || selectedCamp() || camps[0]?.id || '';
    campSelect.value = String(nextCampId);
    selectedCampId = campSelect.value;
    await loadCampDetails();
}

async function loadCampDetails() {
    const summary = document.querySelector('#camp-summary');
    const actions = document.querySelector('#camp-actions');

    if (!selectedCamp()) {
        summary.innerHTML = '<p class="empty-state">Create a camp or choose one to get started.</p>';
        actions.hidden = true;
        await loadCurrentTab();
        return;
    }

    const camp = await apiRequest(`/api/camps/${selectedCamp()}`);
    summary.innerHTML = `
        <div class="summary-grid">
            <div class="summary-item"><span class="summary-label">Camp</span><strong class="summary-value large">${escapeHtml(camp.name)}</strong></div>
            <div class="summary-item"><span class="summary-label">Location</span><strong class="summary-value">${escapeHtml(camp.location)}</strong></div>
            <div class="summary-item"><span class="summary-label">Capacity</span><strong class="summary-value">${camp.capacity} people</strong></div>
            <div class="summary-item"><span class="summary-label">People housed</span><strong class="summary-value" id="occupancy-value">Loading</strong></div>
        </div>`;
    actions.hidden = false;
    await loadCurrentTab();
}

async function loadCurrentTab() {
    if (!selectedCamp()) {
        families = [];
        inventory = [];
        document.querySelector('#families-list').innerHTML = '<tr><td colspan="4" class="empty-state">Create or choose a camp first.</td></tr>';
        document.querySelector('#inventory-list').innerHTML = '<tr><td colspan="3" class="empty-state">Create or choose a camp first.</td></tr>';
        document.querySelector('#distributions-list').innerHTML = '<tr><td colspan="4" class="empty-state">Create or choose a camp first.</td></tr>';
        document.querySelector('#distribution-family').innerHTML = '<option value="">Choose a family</option>';
        document.querySelector('#distribution-supply').innerHTML = '<option value="">Choose a supply</option>';
        document.querySelector('#occupancy-value')?.replaceChildren(document.createTextNode('0 people'));
        return;
    }

    if (currentTab === 'families') await loadFamilies();
    if (currentTab === 'inventory') await loadInventory();
    if (currentTab === 'distributions') await loadDistributions();
}

async function loadFamilies() {
    families = await apiRequest(`/api/camps/${selectedCamp()}/families`);
    const list = document.querySelector('#families-list');
    const housedPeople = families.reduce((total, family) => total + family.headcount, 0);
    document.querySelector('#family-count').textContent = `${families.length} ${families.length === 1 ? 'family' : 'families'}`;
    document.querySelector('#occupancy-value')?.replaceChildren(document.createTextNode(`${housedPeople} people`));

    if (families.length === 0) {
        list.innerHTML = '<tr><td colspan="4" class="empty-state">No families are checked in at this camp.</td></tr>';
        return;
    }

    list.innerHTML = families.map(family => `
        <tr>
            <td>${escapeHtml(family.familyName)}</td>
            <td>${family.headcount}</td>
            <td><span class="status">Housed</span></td>
            <td><div class="row-actions">
                <button class="small-button" data-action="edit-family" data-id="${family.id}">Edit</button>
                <button class="small-button" data-action="checkout-family" data-id="${family.id}">Check out</button>
                <button class="small-button danger" data-action="delete-family" data-id="${family.id}">Delete</button>
            </div></td>
        </tr>`).join('');
}

async function loadInventory() {
    inventory = await apiRequest(`/api/camps/${selectedCamp()}/inventory`);
    const list = document.querySelector('#inventory-list');
    if (inventory.length === 0) {
        list.innerHTML = '<tr><td colspan="3" class="empty-state">No supplies have been received at this camp.</td></tr>';
        return;
    }

    list.innerHTML = inventory.map(supply => `
        <tr>
            <td>${escapeHtml(supply.type)}</td>
            <td>${supply.quantity}</td>
            <td><div class="row-actions">
                <button class="small-button" data-action="edit-supply" data-id="${supply.id}">Edit</button>
                <button class="small-button danger" data-action="delete-supply" data-id="${supply.id}">Delete</button>
            </div></td>
        </tr>`).join('');
}

async function loadDistributions() {
    const [distributionList, familyList, supplyList] = await Promise.all([
        apiRequest(`/api/camps/${selectedCamp()}/distributions`),
        apiRequest(`/api/camps/${selectedCamp()}/families`),
        apiRequest(`/api/camps/${selectedCamp()}/inventory`)
    ]);
    families = familyList;
    inventory = supplyList;
    fillOptions('#distribution-family', families, family => family.id, family => family.familyName, 'Choose a family');
    fillOptions('#distribution-supply', inventory, supply => supply.id, supply => `${supply.type} (${supply.quantity} available)`, 'Choose a supply');

    const list = document.querySelector('#distributions-list');
    if (distributionList.length === 0) {
        list.innerHTML = '<tr><td colspan="4" class="empty-state">No distributions have been recorded.</td></tr>';
        return;
    }

    list.innerHTML = distributionList.map(distribution => `
        <tr>
            <td>${escapeHtml(distribution.family.familyName)}</td>
            <td>${escapeHtml(distribution.supply.type)}</td>
            <td>${distribution.quantity}</td>
            <td><div class="row-actions">
                <button class="small-button" data-action="view-distribution" data-id="${distribution.id}">Details</button>
                <button class="small-button" data-action="edit-distribution" data-id="${distribution.id}">Edit</button>
                <button class="small-button danger" data-action="delete-distribution" data-id="${distribution.id}">Delete</button>
            </div></td>
        </tr>`).join('');
}

function fillOptions(selector, items, getValue, getLabel, placeholder) {
    const select = document.querySelector(selector);
    select.innerHTML = `<option value="">${placeholder}</option>`;
    for (const item of items) {
        const option = document.createElement('option');
        option.value = getValue(item);
        option.textContent = getLabel(item);
        select.append(option);
    }
}

async function runAction(action, id) {
    if (action === 'edit-camp') {
        const camp = await apiRequest(`/api/camps/${selectedCamp()}`);
        const name = prompt('Camp name:', camp.name);
        if (name === null) return;
        const location = prompt('Location:', camp.location);
        if (location === null) return;
        const capacity = prompt('Capacity:', camp.capacity);
        if (capacity === null) return;
        await apiRequest(`/api/camps/${selectedCamp()}`, jsonOptions('PUT', { name, location, capacity: Number(capacity) }));
        await loadCamps(selectedCamp());
        showNotice('Camp details updated.');
    }

    if (action === 'delete-camp' && confirm('Delete this camp? A camp with families or supplies cannot be deleted.')) {
        await apiRequest(`/api/camps/${selectedCamp()}`, { method: 'DELETE' });
        await loadCamps();
        showNotice('Camp deleted.');
    }

    if (action === 'edit-family') {
        const family = families.find(item => String(item.id) === id);
        const familyName = prompt('Family name:', family.familyName);
        if (familyName === null) return;
        const headcount = prompt('Number of people:', family.headcount);
        if (headcount === null) return;
        await apiRequest(`/api/camps/${selectedCamp()}/families/${id}`, jsonOptions('PUT', { familyName, headcount: Number(headcount) }));
        await loadFamilies();
        showNotice('Family details updated.');
    }

    if (action === 'checkout-family' && confirm('Check this family out of the camp?')) {
        await apiRequest(`/api/camps/${selectedCamp()}/families/${id}/checkout`, { method: 'PUT' });
        await loadFamilies();
        showNotice('Family checked out.');
    }

    if (action === 'delete-family' && confirm('Delete this family? Families with distribution records cannot be deleted.')) {
        await apiRequest(`/api/camps/${selectedCamp()}/families/${id}`, { method: 'DELETE' });
        await loadFamilies();
        showNotice('Family deleted.');
    }

    if (action === 'edit-supply') {
        const supply = inventory.find(item => String(item.id) === id);
        const type = prompt('Supply type (FOOD, WATER, BLANKETS):', supply.type);
        if (type === null) return;
        const quantity = prompt('Available quantity:', supply.quantity);
        if (quantity === null) return;
        await apiRequest(`/api/camps/${selectedCamp()}/supplies/${id}`, jsonOptions('PUT', { type: type.toUpperCase(), quantity: Number(quantity) }));
        await loadInventory();
        showNotice('Inventory updated.');
    }

    if (action === 'delete-supply' && confirm('Delete this supply? Supplies with distribution records cannot be deleted.')) {
        await apiRequest(`/api/camps/${selectedCamp()}/supplies/${id}`, { method: 'DELETE' });
        await loadInventory();
        showNotice('Supply deleted.');
    }

    if (action === 'view-distribution') {
        const distribution = await apiRequest(`/api/distributions/${id}`);
        showNotice(`Distribution #${distribution.id}: ${distribution.quantity} ${distribution.supply.type} for ${distribution.family.familyName}.`);
    }

    if (action === 'edit-distribution') {
        const distribution = await apiRequest(`/api/distributions/${id}`);
        const quantity = prompt('New distributed quantity:', distribution.quantity);
        if (quantity === null) return;
        await apiRequest(`/api/distributions/${id}`, jsonOptions('PUT', { quantity: Number(quantity) }));
        await loadDistributions();
        showNotice('Distribution updated and inventory adjusted.');
    }

    if (action === 'delete-distribution' && confirm('Delete this distribution? Its quantity will be returned to inventory.')) {
        await apiRequest(`/api/distributions/${id}`, { method: 'DELETE' });
        await loadDistributions();
        showNotice('Distribution deleted and inventory restored.');
    }
}

document.querySelector('#camp-form').addEventListener('submit', async event => {
    event.preventDefault();
    clearNotice();
    const form = new FormData(event.currentTarget);
    try {
        const camp = await apiRequest('/api/camps', jsonOptions('POST', {
            name: form.get('name'),
            location: form.get('location'),
            capacity: Number(form.get('capacity'))
        }));
        event.currentTarget.reset();
        await loadCamps(camp.id);
        showNotice('Camp created.');
    } catch (error) {
        showNotice(error.message, true);
    }
});

document.querySelector('#family-form').addEventListener('submit', async event => {
    event.preventDefault();
    clearNotice();
    if (!selectedCamp()) return showNotice('Create or choose a camp first.', true);
    const form = new FormData(event.currentTarget);
    try {
        await apiRequest(`/api/camps/${selectedCamp()}/families`, jsonOptions('POST', {
            familyName: form.get('familyName'),
            headcount: Number(form.get('headcount'))
        }));
        event.currentTarget.reset();
        await loadFamilies();
        showNotice('Family checked in.');
    } catch (error) {
        showNotice(error.message, true);
    }
});

document.querySelector('#supply-form').addEventListener('submit', async event => {
    event.preventDefault();
    clearNotice();
    if (!selectedCamp()) return showNotice('Create or choose a camp first.', true);
    const form = new FormData(event.currentTarget);
    try {
        await apiRequest(`/api/camps/${selectedCamp()}/supplies`, jsonOptions('POST', {
            type: form.get('type'),
            quantity: Number(form.get('quantity'))
        }));
        event.currentTarget.reset();
        await loadInventory();
        showNotice('Supplies received and inventory updated.');
    } catch (error) {
        showNotice(error.message, true);
    }
});

document.querySelector('#distribution-form').addEventListener('submit', async event => {
    event.preventDefault();
    clearNotice();
    if (!selectedCamp()) return showNotice('Create or choose a camp first.', true);
    const form = new FormData(event.currentTarget);
    const familyId = form.get('familyId');
    const supplyId = form.get('supplyId');
    const quantity = Number(form.get('quantity'));
    try {
        await apiRequest(`/api/families/${familyId}/distributions/${supplyId}?quantity=${quantity}`, { method: 'POST' });
        event.currentTarget.reset();
        await loadDistributions();
        showNotice('Distribution recorded and inventory reduced.');
    } catch (error) {
        showNotice(error.message, true);
    }
});

campSelect.addEventListener('change', async () => {
    selectedCampId = campSelect.value;
    clearNotice();
    try {
        await loadCampDetails();
    } catch (error) {
        showNotice(error.message, true);
    }
});

document.querySelector('.tabs').addEventListener('click', async event => {
    const button = event.target.closest('[data-tab]');
    if (!button) return;
    currentTab = button.dataset.tab;
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button));
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.hidden = panel.id !== `${currentTab}-panel`;
    });
    clearNotice();
    try {
        await loadCurrentTab();
    } catch (error) {
        showNotice(error.message, true);
    }
});

document.addEventListener('click', async event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    clearNotice();
    try {
        await runAction(button.dataset.action, button.dataset.id);
    } catch (error) {
        showNotice(error.message, true);
    }
});

loadCamps().catch(error => showNotice(`Could not load camps: ${error.message}`, true));