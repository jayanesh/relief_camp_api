package com.example.relief_camp_api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.relief_camp_api.entity.Distribution;
import com.example.relief_camp_api.service.DistributionService;

@RestController
@RequestMapping("/api")
public class DistributionController {
    private final DistributionService distributionService;

    public DistributionController(DistributionService distributionService) {
        this.distributionService = distributionService;
    }

    @PostMapping("/families/{familyId}/distributions/{supplyId}")
    public ResponseEntity<Distribution> distribute(@PathVariable Long familyId, @PathVariable Long supplyId,
                                                   @RequestParam int quantity) {
        Distribution distribution = distributionService.distribute(familyId, supplyId, quantity);
        return ResponseEntity.created(URI.create("/api/distributions/" + distribution.getId())).body(distribution);
    }

    @GetMapping("/camps/{campId}/distributions")
    public List<Distribution> findForCamp(@PathVariable Long campId) {
        return distributionService.findForCamp(campId);
    }

    @GetMapping("/distributions/{distributionId}")
    public Distribution findById(@PathVariable Long distributionId) {
        return distributionService.findById(distributionId);
    }

    @PutMapping("/distributions/{distributionId}")
    public Distribution update(@PathVariable Long distributionId,
                               @RequestBody Distribution distribution) {
        return distributionService.update(distributionId, distribution);
    }

    @DeleteMapping("/distributions/{distributionId}")
    public ResponseEntity<Void> delete(@PathVariable Long distributionId) {
        distributionService.delete(distributionId);
        return ResponseEntity.noContent().build();
    }
}