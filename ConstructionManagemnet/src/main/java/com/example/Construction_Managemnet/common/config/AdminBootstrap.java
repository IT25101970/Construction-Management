package com.example.Construction_Managemnet.common.config;

import com.example.Construction_Managemnet.user.model.UserAccount;
import com.example.Construction_Managemnet.user.repository.UserAccountRepository;
import com.example.Construction_Managemnet.user.service.UserAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/** Optional first administrator for a fresh database, without enabling demo data. */
@Component
@Order(1)
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {
    private final UserAccountRepository users;
    private final UserAccountService accounts;
    @Value("${app.bootstrap-admin-password:}") private String password;

    @Override
    public void run(String... args) {
        if (!password.isBlank() && users.count() == 0) {
            UserAccount admin = new UserAccount();
            admin.setUsername("admin");
            admin.setFullName("Administrator");
            admin.setEmail("admin@example.com");
            admin.setRole("ADMIN");
            admin.setPassword(password);
            accounts.createUser(admin);
        }
    }
}
