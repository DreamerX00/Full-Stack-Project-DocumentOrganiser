package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    boolean existsByEmail(String email);

    boolean existsByGoogleId(String googleId);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.userSettings WHERE u.id = :id")
    Optional<User> findByIdWithSettings(@Param("id") UUID id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.userSettings WHERE u.email = :email")
    Optional<User> findByEmailWithSettings(@Param("email") String email);
}
