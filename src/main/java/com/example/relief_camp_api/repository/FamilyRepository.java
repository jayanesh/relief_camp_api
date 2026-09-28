package com.example.relief_camp_api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.relief_camp_api.entity.Family;

public interface FamilyRepository extends JpaRepository<Family, Long> {
    List<Family> findByCampIdAndHousedTrue(Long campId);

    boolean existsByCampId(Long campId);
}