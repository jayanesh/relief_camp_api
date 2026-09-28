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

import com.example.relief_camp_api.entity.Camp;
import com.example.relief_camp_api.service.CampService;

@RestController
@RequestMapping("/api/camps")
public class CampController {
    private final CampService campService;

    public CampController(CampService campService) {
        this.campService = campService;
    }

    @PostMapping
    public ResponseEntity<Camp> register(@RequestBody Camp camp) {
        Camp savedCamp = campService.register(camp);
        return ResponseEntity.created(URI.create("/api/camps/" + savedCamp.getId())).body(savedCamp);
    }

    @GetMapping
    public List<Camp> findAll() {
        return campService.findAll();
    }

    @GetMapping("/{campId}")
    public Camp findById(@PathVariable Long campId) {
        return campService.findById(campId);
    }

    @PutMapping("/{campId}")
    public Camp update(@PathVariable Long campId, @RequestBody Camp camp) {
        return campService.update(campId, camp);
    }

    @DeleteMapping("/{campId}")
    public ResponseEntity<Void> delete(@PathVariable Long campId) {
        campService.delete(campId);
        return ResponseEntity.noContent().build();
    }
}