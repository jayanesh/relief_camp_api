package com.example.relief_camp_api.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.relief_camp_api.entity.Camp;
import com.example.relief_camp_api.repository.CampRepository;
import com.example.relief_camp_api.repository.FamilyRepository;
import com.example.relief_camp_api.repository.SupplyRepository;

@Service
public class CampService {
    private final CampRepository campRepository;
    private final FamilyRepository familyRepository;
    private final SupplyRepository supplyRepository;

    public CampService(CampRepository campRepository, FamilyRepository familyRepository,
                       SupplyRepository supplyRepository) {
        this.campRepository = campRepository;
        this.familyRepository = familyRepository;
        this.supplyRepository = supplyRepository;
    }

    public Camp register(Camp camp) {
        camp.setId(null);
        return campRepository.save(camp);
    }

    public List<Camp> findAll() {
        return campRepository.findAll();
    }

    public Camp findById(Long id) {
        return campRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Camp not found"));
    }

    public Camp update(Long id, Camp updatedCamp) {
        Camp camp = findById(id);
        int occupiedPlaces = familyRepository.findByCampIdAndHousedTrue(id).stream()
                .mapToInt(family -> family.getHeadcount())
                .sum();
        if (updatedCamp.getCapacity() < occupiedPlaces) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Camp capacity cannot be lower than its current occupancy");
        }

        camp.setName(updatedCamp.getName());
        camp.setLocation(updatedCamp.getLocation());
        camp.setCapacity(updatedCamp.getCapacity());
        return campRepository.save(camp);
    }

    public void delete(Long id) {
        Camp camp = findById(id);
        if (familyRepository.existsByCampId(id) || supplyRepository.existsByCampId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Camp cannot be deleted while it has families or supplies");
        }
        campRepository.delete(camp);
    }
}