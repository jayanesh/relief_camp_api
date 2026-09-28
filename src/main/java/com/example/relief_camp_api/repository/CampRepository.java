package com.example.relief_camp_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.relief_camp_api.entity.Camp;

public interface CampRepository extends JpaRepository<Camp, Long> {
}