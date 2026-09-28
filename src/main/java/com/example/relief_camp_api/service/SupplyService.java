package com.example.relief_camp_api.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.relief_camp_api.entity.Camp;
import com.example.relief_camp_api.entity.Supply;
import com.example.relief_camp_api.repository.DistributionRepository;
import com.example.relief_camp_api.repository.SupplyRepository;

@Service
public class SupplyService {
    private final CampService campService;
    private final SupplyRepository supplyRepository;
    private final DistributionRepository distributionRepository;

    public SupplyService(CampService campService, SupplyRepository supplyRepository,
                         DistributionRepository distributionRepository) {
        this.campService = campService;
        this.supplyRepository = supplyRepository;
        this.distributionRepository = distributionRepository;
    }

    @Transactional
    public Supply receive(Long campId, Supply incomingSupply) {
        Camp camp = campService.findById(campId);
        incomingSupply.setId(null);

        Supply supply = supplyRepository.findByCampIdAndType(campId, incomingSupply.getType())
                .orElseGet(Supply::new);
        supply.setCamp(camp);
        supply.setType(incomingSupply.getType());
        supply.setQuantity(supply.getQuantity() + incomingSupply.getQuantity());
        return supplyRepository.save(supply);
    }

    public List<Supply> findForCamp(Long campId) {
        campService.findById(campId);
        return supplyRepository.findByCampId(campId);
    }

    public Supply findById(Long id) {
        return supplyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supply not found"));
    }

    public Supply save(Supply supply) {
        return supplyRepository.save(supply);
    }

    @Transactional
    public Supply update(Long campId, Long supplyId, Supply updatedSupply) {
        campService.findById(campId);
        Supply supply = findInCamp(campId, supplyId);
        supplyRepository.findByCampIdAndType(campId, updatedSupply.getType())
                .filter(existing -> !existing.getId().equals(supplyId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "This camp already has a supply with that type");
                });

        if (updatedSupply.getQuantity() < 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Supply quantity cannot be negative");
        }

        supply.setType(updatedSupply.getType());
        supply.setQuantity(updatedSupply.getQuantity());
        return supplyRepository.save(supply);
    }

    @Transactional
    public void delete(Long campId, Long supplyId) {
        campService.findById(campId);
        Supply supply = findInCamp(campId, supplyId);
        if (!distributionRepository.findBySupplyId(supplyId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Supply cannot be deleted while it has distribution records");
        }
        supplyRepository.delete(supply);
    }

    private Supply findInCamp(Long campId, Long supplyId) {
        Supply supply = findById(supplyId);
        if (!supply.getCamp().getId().equals(campId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supply not found in this camp");
        }
        return supply;
    }
}