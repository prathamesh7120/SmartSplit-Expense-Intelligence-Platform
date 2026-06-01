package com.smartsplit.backend.repository;

import com.smartsplit.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring reads this method name and generate SQL:
    // SELECT * FROM users WHERE email=? LIMIT 1
    Optional<User> findByEmail(String email);

    // SELECT COUNT(*) FROM users WHERE email = ?
    boolean existsByEmail(String email);

}
