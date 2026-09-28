package com.example.relief_camp_api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.relief_camp_api.entity.Family;
import com.example.relief_camp_api.service.FamilyService;

@RestController
@RequestMapping("/api/camps/{campId}/families")
public class FamilyController {
    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    @PostMapping
    public ResponseEntity<Family> checkIn(@PathVariable Long campId, @RequestBody Family family) {
        Family savedFamily = familyService.checkIn(campId, family);
        return ResponseEntity.created(URI.create("/api/families/" + savedFamily.getId())).body(savedFamily);
    }

    @GetMapping
    public List<Family> findHousedFamilies(@PathVariable Long campId) {
        return familyService.findHousedAtCamp(campId);
    }

    @PutMapping("/{familyId}")
    public Family update(@PathVariable Long campId, @PathVariable Long familyId, @RequestBody Family family) {
        return familyService.update(campId, familyId, family);
    }

    @DeleteMapping("/{familyId}")
    public ResponseEntity<Void> delete(@PathVariable Long campId, @PathVariable Long familyId) {
        familyService.delete(campId, familyId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{familyId}/checkout")
    public Family checkOut(@PathVariable Long campId, @PathVariable Long familyId) {
        return familyService.checkOut(campId, familyId);
    }
}