package com.vertexa.keystone.repository;

import com.vertexa.keystone.domain.Customer;
import com.vertexa.keystone.domain.Site;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {

    List<Site> findByCustomer(Customer customer);

    Page<Site> findByCustomer(Customer customer, Pageable pageable);

    List<Site> findByCustomerAndActiveTrue(Customer customer);

    Page<Site> findByCustomerAndActiveTrue(Customer customer, Pageable pageable);

    @Query("SELECT s FROM Site s WHERE s.active = true AND s.customer = :customer AND (LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.address) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Site> searchByCustomer(@Param("customer") Customer customer, @Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Site s WHERE s.active = true AND (:customer IS NULL OR s.customer = :customer) AND (:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.address) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Site> searchAllSites(@Param("customer") Customer customer, @Param("search") String search, Pageable pageable);

    Optional<Site> findByCustomerAndName(Customer customer, String name);

    boolean existsByCustomerAndName(Customer customer, String name);

    long countByCustomerAndActiveTrue(Customer customer);
}