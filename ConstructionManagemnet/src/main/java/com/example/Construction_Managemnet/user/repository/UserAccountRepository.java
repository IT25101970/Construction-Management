package com.example.Construction_Managemnet.user.repository;

import com.example.Construction_Managemnet.user.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    List<UserAccount> findByIsDeletedFalseOrderByIdAsc();
    Optional<UserAccount> findByUsername(String username);
    Optional<UserAccount> findByUsernameAndIsDeletedFalse(String username);
    long countByRoleAndStatusAndIsDeletedFalse(String role, String status);
}
