package com.vertexa.keystone.repository;

import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.domain.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(UserRole role);

    Page<User> findByRole(UserRole role, Pageable pageable);

    List<User> findByCustomerId(Long customerId);

    Page<User> findByCustomerId(Long customerId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.active = true AND u.role = :role AND u.customerId IS NULL")
    List<User> findActiveTechnicians(@Param("role") UserRole role);

    boolean existsByEmail(String email);

    long countByCustomerId(Long customerId);
}