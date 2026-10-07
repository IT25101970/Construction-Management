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
    @Autowired com.example.Construction_Managemnet.task.service.TaskService tasks;
    @Autowired com.example.Construction_Managemnet.task.repository.TaskRepository taskRepository;
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

    private String taskBody(Long projectId, LocalDate start, LocalDate due, int progress) {
        return """
                {"title":"QA task","projectId":%d,"assignedTo":"Supervisor",
                 "startDate":"%s","dueDate":"%s","progressPercentage":%d}
                """.formatted(projectId, start, due, progress);
    }

    @Test
    void taskApiSupportsCreateSearchCompleteAndDelete() throws Exception {
        Long projectId = project("Other Organization").getId();
        MockHttpSession session = login("supervisor");
        String body = taskBody(projectId, LocalDate.now(), LocalDate.now().plusDays(2), 0);
        var created = mvc.perform(post("/api/tasks").session(session).with(csrf())
                .contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn();
        Number id = JsonPath.read(created.getResponse().getContentAsString(), "$.id");
        mvc.perform(get("/api/tasks").param("keyword", "QA task").param("projectId", projectId.toString())
                .session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(put("/api/tasks/" + id).session(session).with(csrf()).contentType("application/json")
                .content(taskBody(projectId, LocalDate.now(), LocalDate.now().plusDays(2), 100)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("DONE"));
        mvc.perform(get("/api/tasks/reports/weekly").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.completedTasks").value(1));
        mvc.perform(delete("/api/tasks/" + id).session(session).with(csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/tasks/" + id).session(session)).andExpect(status().isNotFound());
    }

    @Test
    void taskApiRejectsReversedDatesOnCreateAndUpdate() throws Exception {
        Long projectId = project("Other Organization").getId();
        MockHttpSession session = login("pm");
        String invalid = taskBody(projectId, LocalDate.now(), LocalDate.now().minusDays(1), 0);
        mvc.perform(post("/api/tasks").session(session).with(csrf()).contentType("application/json")
                .content(invalid)).andExpect(status().isBadRequest());
        var created = mvc.perform(post("/api/tasks").session(session).with(csrf()).contentType("application/json")
                .content(taskBody(projectId, LocalDate.now(), LocalDate.now(), 0)))
                .andExpect(status().isCreated()).andReturn();
        Number id = JsonPath.read(created.getResponse().getContentAsString(), "$.id");
        mvc.perform(put("/api/tasks/" + id).session(session).with(csrf()).contentType("application/json")
                .content(invalid)).andExpect(status().isBadRequest());
    }

    @Test
    void weeklyReportRecognizesTasksThatBecomeOverdueWithoutOpeningTaskList() {
        var task = new com.example.Construction_Managemnet.task.model.TaskItem();
        task.setTitle("Previously pending task"); task.setProject(project("Other Organization"));
        task.setAssignedTo("Supervisor"); task.setStartDate(LocalDate.now().minusDays(3));
        task.setDueDate(LocalDate.now().minusDays(1));
        task.setStatus(com.example.Construction_Managemnet.task.model.TaskStatus.TODO);
        taskRepository.saveAndFlush(task);
        assertEquals(1L, tasks.getWeeklyTaskReport(null).get("overdueTasksCount"));
        assertEquals(com.example.Construction_Managemnet.task.model.TaskStatus.DELAYED, tasks.getTaskById(task.getId()).getStatus());
    }

    @Test
    void logoutInvalidatesAuthenticatedSession() throws Exception {
        MockHttpSession session = login("client");
        mvc.perform(post("/api/auth/logout").session(session).with(csrf())).andExpect(status().isOk());
        assertTrue(session.isInvalid());
        mvc.perform(get("/api/auth/session")).andExpect(status().isUnauthorized());
    }

    @Test
    void roleReadAccessMatrixProtectsAdminAndClientEndpoints() throws Exception {
        for (String name : new String[]{"admin", "pm", "supervisor", "client"}) {
            MockHttpSession session = login(name);
            for (String endpoint : new String[]{"/api/projects", "/api/tasks", "/api/inspections",
                    "/api/materials", "/api/workers", "/api/expenses", "/api/users"}) {
                boolean allowed = name.equals("admin") ||
                        (!endpoint.equals("/api/users") && (!name.equals("client") || endpoint.equals("/api/projects")));
                mvc.perform(get(endpoint).session(session))
                        .andExpect(allowed ? status().isOk() : status().isForbidden());
            }
        }
    }

    @Test
    void projectApiRejectsInvalidDatesAndDeletedProjectsCannotReceiveTasks() throws Exception {
        MockHttpSession session = login("pm");
        String body = """
                {"name":"QA project","client":"Other Organization","location":"Colombo",
                 "startDate":"2026-10-10","endDate":"2026-10-09","estimatedBudget":100}
                """;
        mvc.perform(post("/api/projects").session(session).with(csrf()).contentType("application/json")
                .content(body)).andExpect(status().isBadRequest());
        Long id = project("Other Organization").getId();
        mvc.perform(delete("/api/projects/" + id).session(session).with(csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/projects/" + id).session(session)).andExpect(status().isNotFound());
        mvc.perform(post("/api/tasks").session(session).with(csrf()).contentType("application/json")
                .content(taskBody(id, LocalDate.now(), LocalDate.now(), 0))).andExpect(status().isNotFound());
    }

    @Test
    void expenseApiCreateEditDeleteRecalculatesBudget() throws Exception {
        Long projectId = project("Other Organization").getId();
        MockHttpSession session = login("pm");
        String body = """
                {"voucherNo":"QA-001","projectId":%d,"category":"Materials",
                 "status":"APPROVED","amount":25,"date":"%s"}
                """.formatted(projectId, LocalDate.now());
        var created = mvc.perform(post("/api/expenses").session(session).with(csrf())
                .contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn();
        Number id = JsonPath.read(created.getResponse().getContentAsString(), "$.id");
        mvc.perform(put("/api/expenses/" + id).session(session).with(csrf()).contentType("application/json")
                .content(body.replace("\"amount\":25", "\"amount\":40"))).andExpect(status().isOk());
        mvc.perform(get("/api/expenses/budgets").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].spentAmount").value(40));
        mvc.perform(delete("/api/expenses/" + id).session(session).with(csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/expenses/" + id).session(session)).andExpect(status().isNotFound());
        mvc.perform(get("/api/expenses/budgets").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].spentAmount").value(0));
    }

    @Test
    void materialApiRecordsStockMovementAndPreventsCatalogStockBypass() throws Exception {
        MockHttpSession session = login("supervisor");
        String body = """
                {"name":"QA cement","category":"Cement","unit":"Bags","currentStock":10,"reorderLevel":5}
                """;
        var created = mvc.perform(post("/api/materials").session(session).with(csrf()).contentType("application/json")
                .content(body)).andExpect(status().isCreated()).andReturn();
        Number id = JsonPath.read(created.getResponse().getContentAsString(), "$.id");
        mvc.perform(post("/api/materials/" + id + "/adjust").session(session).with(csrf()).contentType("application/json")
                .content("{\"quantity\":6,\"transactionType\":\"STOCK_OUT\",\"siteName\":\"Colombo\",\"issuedTo\":\"Supervisor\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.currentStock").value(4));
        mvc.perform(put("/api/materials/" + id).session(session).with(csrf()).contentType("application/json")
                .content(body.replace("QA cement", "QA renamed"))).andExpect(status().isBadRequest());
        mvc.perform(put("/api/materials/" + id).session(session).with(csrf()).contentType("application/json")
                .content(body.replace("QA cement", "QA renamed").replace("\"currentStock\":10", "\"currentStock\":4"))).andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStock").value(4));
        mvc.perform(get("/api/materials/logs").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantity").value(6));
        mvc.perform(delete("/api/materials/" + id).session(session).with(csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/materials/" + id).session(session)).andExpect(status().isNotFound());
    }

    @Test
    void workerApiAttendancePersistsAndDuplicateAndFutureDatesAreRejected() throws Exception {
        MockHttpSession session = login("supervisor");
        String body = "{\"fullName\":\"QA Worker\",\"nic\":\"123456789V\",\"tradeCategory\":\"Mason\",\"dailyWageRate\":100}";
        var created = mvc.perform(post("/api/workers").session(session).with(csrf()).contentType("application/json")
                .content(body)).andExpect(status().isCreated()).andReturn();
        Number id = JsonPath.read(created.getResponse().getContentAsString(), "$.id");
        String attendance = "{\"workerId\":%s,\"date\":\"%s\",\"status\":\"PRESENT\"}".formatted(id, LocalDate.now());
        mvc.perform(post("/api/workers/attendance").session(session).with(csrf()).contentType("application/json")
                .content(attendance)).andExpect(status().isCreated()).andExpect(jsonPath("$.calculatedWage").value(100));
        mvc.perform(post("/api/workers/attendance").session(session).with(csrf()).contentType("application/json")
                .content(attendance)).andExpect(status().isConflict());
        mvc.perform(post("/api/workers/attendance").session(session).with(csrf()).contentType("application/json")
                .content(attendance.replace(LocalDate.now().toString(), LocalDate.now().plusDays(1).toString())))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/workers/" + id).session(session).with(csrf()).contentType("application/json")
                .content(body.replace("QA Worker", "QA Updated Worker"))).andExpect(status().isOk());
        mvc.perform(get("/api/workers/" + id).session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("QA Updated Worker"));
        mvc.perform(delete("/api/workers/" + id).session(session).with(csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/workers/" + id).session(session)).andExpect(status().isNotFound());
    }

    @Test
    void adminApiCreatesUpdatesDisablesAndDeletesUserWithoutExposingPassword() throws Exception {
        MockHttpSession session = login("admin");
        String body = """
                {"username":"qa_user","fullName":"QA User","email":"qa@example.com","role":"PM","password":"TestPass123!"}
                """;
        var created = mvc.perform(post("/api/users").session(session).with(csrf()).contentType("application/json")
                .content(body)).andExpect(status().isCreated()).andExpect(jsonPath("$.password").doesNotExist()).andReturn();
        Number id = JsonPath.read(created.getResponse().getContentAsString(), "$.id");
        login("qa_user");
        mvc.perform(put("/api/users/" + id).session(session).with(csrf()).contentType("application/json")
                .content(body.replace("QA User", "Updated QA User"))).andExpect(status().isOk());
        mvc.perform(post("/api/users/" + id + "/toggle-status").session(session).with(csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("INACTIVE"));
        mvc.perform(delete("/api/users/" + id).session(session).with(csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/users/" + id).session(session)).andExpect(status().isNotFound());
    }

    @Test
    void inspectionApiCreatesUpdatesFiltersAndDeletes() throws Exception {
        Long projectId = project("Other Organization").getId();
        MockHttpSession session = login("supervisor");
        String body = """
                {"projectId":%d,"stage":"FOUNDATION","inspectorName":"QA Inspector","inspectionDate":"%s","status":"PENDING"}
                """.formatted(projectId, LocalDate.now());
        var created = mvc.perform(post("/api/inspections").session(session).with(csrf()).contentType("application/json")
                .content(body)).andExpect(status().isCreated()).andReturn();
        Number id = JsonPath.read(created.getResponse().getContentAsString(), "$.id");
        mvc.perform(put("/api/inspections/" + id).session(session).with(csrf()).contentType("application/json")
                .content(body.replace("PENDING", "PASSED"))).andExpect(status().isOk());
        mvc.perform(get("/api/inspections").session(session).param("projectId", projectId.toString()).param("status", "PASSED"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(delete("/api/inspections/" + id).session(session).with(csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/inspections/" + id).session(session)).andExpect(status().isNotFound());
    }
}
