package com.example.Construction_Managemnet;

import com.example.Construction_Managemnet.finance.model.Expense;
import com.example.Construction_Managemnet.finance.service.FinanceService;
import com.example.Construction_Managemnet.inspection.model.*;
import com.example.Construction_Managemnet.inspection.service.InspectionService;
import com.example.Construction_Managemnet.inventory.model.*;
import com.example.Construction_Managemnet.inventory.service.MaterialService;
import com.example.Construction_Managemnet.project.model.*;
import com.example.Construction_Managemnet.project.service.ProjectService;
import com.example.Construction_Managemnet.user.model.UserAccount;
import com.example.Construction_Managemnet.user.repository.UserAccountRepository;
import com.example.Construction_Managemnet.user.service.UserAccountService;
import com.example.Construction_Managemnet.workforce.model.*;
import com.example.Construction_Managemnet.workforce.service.WorkforceService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:integration;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop", "app.seed-demo=false"
})
@Transactional
class IntegrationTests {
    @Autowired WebApplicationContext context;
    @Autowired UserAccountService accounts;
    @Autowired UserAccountRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired ProjectService projects;
    @Autowired MaterialService materials;
    @Autowired FinanceService finance;
    @Autowired WorkforceService workforce;
    @Autowired InspectionService inspections;
    MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        account("admin", "ADMIN", "Administrator");
        account("pm", "PM", "Project Manager");
        account("client", "CLIENT", "Client Organization");
        account("supervisor", "SUPERVISOR", "Supervisor");
    }

    private UserAccount account(String name, String role, String fullName) {
        UserAccount user = new UserAccount();
        user.setUsername(name);
        user.setFullName(fullName);
        user.setEmail(name + "@example.com");
        user.setRole(role);
        user.setPassword("TestPass123!");
        return accounts.createUser(user);
    }

    private MockHttpSession login(String name) throws Exception {
        var tokenResponse = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        MockHttpSession session = (MockHttpSession) tokenResponse.getRequest().getSession();
        String token = JsonPath.read(tokenResponse.getResponse().getContentAsString(), "$.token");
        String header = JsonPath.read(tokenResponse.getResponse().getContentAsString(), "$.headerName");
        var result = mvc.perform(post("/api/auth/login").session(session).header(header, token)
                        .contentType("application/json").content("{\"username\":\"" + name + "\",\"password\":\"TestPass123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.password").doesNotExist()).andReturn();
        return (MockHttpSession) result.getRequest().getSession();
    }

    private Project project(String client) {
        ProjectDto dto = new ProjectDto();
        dto.setName("Test construction project");
        dto.setClient(client);
        dto.setLocation("Colombo");
        dto.setStartDate(LocalDate.now());
        dto.setEndDate(LocalDate.now().plusMonths(1));
        dto.setEstimatedBudget(100.0);
        dto.setStatus(ProjectStatus.ONGOING);
        return projects.createProject(dto);
    }

    private Expense expense(Project project, String status, double amount) {
        Expense expense = new Expense();
        expense.setVoucherNo("EX-" + status);
        expense.setProjectId(project.getId());
        expense.setProjectName("Incorrect supplied name");
        expense.setCategory("Materials");
        expense.setStatus(status);
        expense.setAmount(amount);
        expense.setDate(LocalDate.now());
        return expense;
    }

    @Test
    void loginRequiresRealCredentialsAndSessionSurvivesRequests() throws Exception {
        mvc.perform(get("/api/projects")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType("application/json")
                .content("{\"username\":\"admin\",\"password\":\"wrong\"}")).andExpect(status().isUnauthorized());
        MockHttpSession session = login("admin");
        mvc.perform(get("/api/auth/session").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("ADMIN"));
        mvc.perform(get("/api/users").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$[0].password").doesNotExist());
        assertTrue(encoder.matches("TestPass123!", users.findByUsername("admin").orElseThrow().getPassword()));
    }

    @Test
    void developmentFrontendOriginCanRequestSessionToken() throws Exception {
        mvc.perform(get("/api/auth/csrf").header("Origin", "http://127.0.0.1:5174"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:5174"));
    }

    @Test
    void csrfAndRolesAreEnforced() throws Exception {
        MockHttpSession session = login("pm");
        mvc.perform(get("/api/users").session(session)).andExpect(status().isForbidden());
        mvc.perform(post("/api/projects").session(session).contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/expenses").session(session)).andExpect(status().isOk());
        MockHttpSession supervisor = login("supervisor");
        mvc.perform(post("/api/expenses").session(supervisor).with(csrf()).contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void inactiveAccountsCannotLoginAndDisablingAccountRevokesExistingSession() throws Exception {
        MockHttpSession session = login("pm");
        accounts.toggleStatus(users.findByUsername("pm").orElseThrow().getId());
        mvc.perform(get("/api/projects").session(session)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType("application/json")
                .content("{\"username\":\"pm\",\"password\":\"TestPass123!\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clientCanOnlyReadTheirOwnProjects() throws Exception {
        Project owned = project("Client Organization");
        Project other = project("Other Organization");
        MockHttpSession session = login("client");
        mvc.perform(get("/api/projects").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/projects/" + owned.getId()).session(session)).andExpect(status().isOk());
        mvc.perform(get("/api/projects/" + other.getId()).session(session)).andExpect(status().isNotFound());
        mvc.perform(get("/api/expenses").session(session)).andExpect(status().isForbidden());
        mvc.perform(post("/api/projects").session(session).with(csrf()).contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void lastAdministratorCannotBeDisabledOrDeleted() {
        Long id = users.findByUsername("admin").orElseThrow().getId();
        assertThrows(ResponseStatusException.class, () -> accounts.toggleStatus(id));
        assertThrows(ResponseStatusException.class, () -> accounts.deleteUser(id));
    }

    @Test
    void invalidExpenseAndBudgetReturnBadRequest() throws Exception {
        MockHttpSession session = login("pm");
        mvc.perform(post("/api/expenses").session(session).with(csrf()).contentType("application/json")
                .content("{\"amount\":-1}")).andExpect(status().isBadRequest());
        mvc.perform(put("/api/expenses/budgets/1").session(session).with(csrf()).contentType("application/json")
                .content("{\"allocatedBudget\":-10}")).andExpect(status().isBadRequest());
    }

    @Test
    void budgetsOnlyIncludeApprovedExpensesAndShowNegativeRemaining() {
        Project project = project("Other Organization");
        Expense approved = finance.createExpense(expense(project, "APPROVED", 120.0));
        finance.createExpense(expense(project, "PENDING", 500.0));
        finance.createExpense(expense(project, "REJECTED", 900.0));
        assertEquals(project.getName(), approved.getProjectName());
        var budget = finance.getBudgets().get(0);
        assertEquals(120.0, budget.get("spentAmount"));
        assertEquals(-20.0, budget.get("remainingBudget"));
        assertEquals(true, budget.get("isOverrunWarning"));
    }

    @Test
    void expensesCannotSilentlyFallBackToUnrelatedProject() {
        Project project = project("Other Organization");
        Expense expense = expense(project, "APPROVED", 10.0);
        expense.setProjectId(null);
        assertThrows(IllegalArgumentException.class, () -> finance.createExpense(expense));
    }

    @Test
    void stockAdjustmentsRejectNegativeOrExcessQuantitiesAndProduceAccurateLog() {
        Material material = new Material();
        material.setName("Cement"); material.setCategory("Cement"); material.setUnit("Bags"); material.setCurrentStock(10.0);
        material = materials.createMaterial(material);
        Long id = material.getId();
        assertThrows(IllegalArgumentException.class, () -> materials.adjustStock(id, new StockAdjustment(-1.0, StockAdjustment.Type.STOCK_OUT, "Site", "Worker", "")));
        assertThrows(IllegalArgumentException.class, () -> materials.adjustStock(id, new StockAdjustment(20.0, StockAdjustment.Type.STOCK_OUT, "Site", "Worker", "")));
        assertEquals(6.0, materials.adjustStock(id, new StockAdjustment(4.0, StockAdjustment.Type.STOCK_OUT, "Site", "Worker", "")).getCurrentStock());
        assertEquals(4.0, materials.getAllStockLogs().get(0).getQuantity());
        materials.deleteMaterial(id);
        assertThrows(com.example.Construction_Managemnet.common.exception.ResourceNotFoundException.class, () -> materials.getMaterialById(id));
    }

    @Test
    void halfDayWagesUseHalfRateAndDuplicateAttendanceIsRejected() {
        Worker worker = new Worker(); worker.setFullName("Worker"); worker.setNic("123456789V"); worker.setTradeCategory("Mason"); worker.setDailyWageRate(100.0);
        worker = workforce.createWorker(worker);
        AttendanceLog log = new AttendanceLog(); log.setWorkerId(worker.getId()); log.setDate(LocalDate.now()); log.setStatus("HALF_DAY");
        AttendanceLog saved = workforce.logAttendance(log);
        assertEquals(50.0, saved.getCalculatedWage()); assertEquals(4, saved.getHoursWorked());
        worker.setDailyWageRate(200.0);
        workforce.updateWorker(worker.getId(), worker);
        assertEquals(50.0, workforce.getAllWorkers().get(0).getTotalEarnedWage());
        assertThrows(ResponseStatusException.class, () -> workforce.logAttendance(log));
    }

    @Test
    void historicalAttendanceDoesNotInflateCurrentMonthTotals() {
        Worker worker = new Worker(); worker.setFullName("Worker"); worker.setNic("987654321V"); worker.setTradeCategory("Mason"); worker.setDailyWageRate(100.0);
        worker = workforce.createWorker(worker);
        AttendanceLog log = new AttendanceLog(); log.setWorkerId(worker.getId()); log.setDate(LocalDate.now().withDayOfMonth(1).minusDays(1)); log.setStatus("PRESENT");
        workforce.logAttendance(log);
        assertEquals(0.0, workforce.getAllWorkers().get(0).getTotalEarnedWage());
        assertEquals(0, workforce.getAllWorkers().get(0).getDaysPresentThisMonth());
    }

    @Test
    void failedInspectionSchedulesFollowUp() {
        Project project = project("Other Organization");
        InspectionDto dto = new InspectionDto(); dto.setProjectId(project.getId()); dto.setStage(InspectionStage.FOUNDATION);
        dto.setInspectorName("Inspector"); dto.setInspectionDate(LocalDate.now()); dto.setStatus(InspectionStatus.FAILED);
        Inspection failed = inspections.createInspection(dto);
        var all = inspections.getAllInspections();
        assertEquals(2, all.size());
        assertTrue(all.stream().anyMatch(i -> Boolean.TRUE.equals(i.getIsReInspection()) && failed.getId().equals(i.getOriginalInspectionId())));
        Inspection followUp = all.stream().filter(i -> Boolean.TRUE.equals(i.getIsReInspection())).findFirst().orElseThrow();
        dto.setStatus(InspectionStatus.PASSED);
        dto.setInspectionDate(followUp.getInspectionDate());
        inspections.updateInspection(followUp.getId(), dto);
        assertEquals(0, ((java.util.List<?>) inspections.getInspectionSummaryReport().get("openDefects")).size());
    }

    @Test
    void removingLastMilestoneResetsCompletion() {
        Project project = project("Other Organization");
        MilestoneDto dto = new MilestoneDto(); dto.setTitle("Deliverable"); dto.setTargetDate(LocalDate.now()); dto.setStatus(MilestoneStatus.COMPLETED);
        Milestone milestone = projects.addMilestone(project.getId(), dto);
        assertEquals(100, projects.getProjectById(project.getId()).getProgressPercentage());
        projects.deleteMilestone(milestone.getId());
        assertEquals(0, projects.getProjectById(project.getId()).getProgressPercentage());
        assertEquals(ProjectStatus.ONGOING, projects.getProjectById(project.getId()).getStatus());
    }
}
