package com.example.Construction_Managemnet;

import com.example.Construction_Managemnet.project.service.ProjectService;
import com.example.Construction_Managemnet.user.repository.UserAccountRepository;
import com.example.Construction_Managemnet.workforce.service.WorkforceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

@org.springframework.test.context.ActiveProfiles("demo")
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:demo;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop", "app.seed-demo=true"
})
class DemoSeedTests {
    @Autowired UserAccountRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired ProjectService projects;
    @Autowired WorkforceService workforce;
    @Autowired com.example.Construction_Managemnet.common.config.DataSeeder seeder;

    @Test
    void demoStartupCreatesProjectsAndHashedLoginAccountsWithAccurateMonthlyWages() {
        assertEquals(3, projects.getAllProjects().size());
        assertTrue(encoder.matches("DemoPass123!", users.findByUsername("admin_sys").orElseThrow().getPassword()));
        assertEquals(24000.0, workforce.getAllWorkers().stream().mapToDouble(worker -> worker.getTotalEarnedWage()).sum());
    }

    @Test
    @org.springframework.transaction.annotation.Transactional
    void existingDemoUsersWithoutPasswordsCanLoginWithoutReplacingOtherPasswords() {
        var admin = users.findByUsername("admin_sys").orElseThrow();
        admin.setPassword(null);
        users.saveAndFlush(admin);
        var pm = users.findByUsername("pm_kamal").orElseThrow();
        String existingHash = encoder.encode("ExistingPass123!");
        pm.setPassword(existingHash);
        users.saveAndFlush(pm);
        seeder.run();
        assertTrue(encoder.matches("DemoPass123!", users.findByUsername("admin_sys").orElseThrow().getPassword()));
        assertEquals(existingHash, users.findByUsername("pm_kamal").orElseThrow().getPassword());
    }
}
