package com.vertexa.keystone.repository;

import com.vertexa.keystone.domain.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByOrganizationName(String organizationName);

    Page<Customer> findByActiveTrue(Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.active = true AND (LOWER(c.organizationName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.contactName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Customer> searchActiveCustomers(@Param("search") String search, Pageable pageable);

    List<Customer> findByActiveTrue();

    boolean existsByOrganizationName(String organizationName);

    long countByActiveTrue();
}