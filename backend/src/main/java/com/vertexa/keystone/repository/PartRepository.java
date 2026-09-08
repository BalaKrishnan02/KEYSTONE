package com.vertexa.keystone.repository;

import com.vertexa.keystone.domain.Part;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {

    Optional<Part> findByPartCode(String partCode);

    Page<Part> findByActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Part p WHERE p.active = true AND (LOWER(p.partCode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Part> searchActiveParts(@Param("search") String search, Pageable pageable);

    List<Part> findByActiveTrueAndAvailableStockGreaterThan(int threshold);

    List<Part> findByAvailableStockLessThanEqual(int threshold);

    boolean existsByPartCode(String partCode);

    @Query("SELECT p FROM Part p WHERE p.active = true ORDER BY p.availableStock ASC")
    List<Part> findActivePartsOrderedByStock();
}