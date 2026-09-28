package com.example.relief_camp_api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.relief_camp_api.entity.Distribution;

public interface DistributionRepository extends JpaRepository<Distribution, Long> {
    List<Distribution> findBySupplyCampId(Long campId);

    List<Distribution> findByFamilyId(Long familyId);

    List<Distribution> findBySupplyId(Long supplyId);
}