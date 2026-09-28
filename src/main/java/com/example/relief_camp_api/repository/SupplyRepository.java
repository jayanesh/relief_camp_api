package com.example.relief_camp_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.relief_camp_api.entity.Supply;
import com.example.relief_camp_api.entity.SupplyType;

public interface SupplyRepository extends JpaRepository<Supply, Long> {
    List<Supply> findByCampId(Long campId);

    Optional<Supply> findByCampIdAndType(Long campId, SupplyType type);

    boolean existsByCampId(Long campId);
}