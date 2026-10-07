package com.example.Construction_Managemnet.common.config;

import com.example.Construction_Managemnet.finance.model.Expense;
import com.example.Construction_Managemnet.finance.repository.ExpenseRepository;
import com.example.Construction_Managemnet.inspection.model.*;
import com.example.Construction_Managemnet.inspection.repository.InspectionRepository;
import com.example.Construction_Managemnet.inventory.model.Material;
import com.example.Construction_Managemnet.inventory.model.MaterialStockLog;
import com.example.Construction_Managemnet.inventory.repository.MaterialRepository;
import com.example.Construction_Managemnet.inventory.repository.MaterialStockLogRepository;
import com.example.Construction_Managemnet.project.model.*;
import com.example.Construction_Managemnet.project.repository.ProjectRepository;
import com.example.Construction_Managemnet.task.model.*;
import com.example.Construction_Managemnet.task.repository.TaskRepository;
import com.example.Construction_Managemnet.user.model.UserAccount;
import com.example.Construction_Managemnet.user.repository.UserAccountRepository;
import com.example.Construction_Managemnet.workforce.model.AttendanceLog;
import com.example.Construction_Managemnet.workforce.model.Worker;
import com.example.Construction_Managemnet.workforce.repository.AttendanceLogRepository;
import com.example.Construction_Managemnet.workforce.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@org.springframework.core.annotation.Order(0)
@Component
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.seed-demo", havingValue = "true")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final InspectionRepository inspectionRepository;
    private final MaterialRepository materialRepository;
    private final MaterialStockLogRepository stockLogRepository;
    private final ExpenseRepository expenseRepository;
    private final WorkerRepository workerRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final UserAccountRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (projectRepository.count() == 0) {
            seedProjects();
        }
        if (taskRepository.count() == 0) {
            seedTasks();
        }
        if (inspectionRepository.count() == 0) {
            seedInspections();
        }
        if (materialRepository.count() == 0) {
            seedInventory();
        }
        if (expenseRepository.count() == 0) {
            seedExpenses();
        }
        if (workerRepository.count() == 0) {
            seedWorkforce();
        }
        if (userRepository.count() == 0) {
            seedUsers();
        }
        // Older demonstration databases had demo users without passwords.
        // Initialize only those known demo accounts when demonstration mode is explicitly enabled.
        for (String username : List.of("admin_sys", "pm_kamal", "sup_perera", "client_road_auth", "pm_sarath")) {
            userRepository.findByUsernameAndIsDeletedFalse(username).ifPresent(user -> {
                if (user.getPassword() == null || user.getPassword().isBlank()) {
                    user.setPassword(passwordEncoder.encode("DemoPass123!"));
                    userRepository.save(user);
                }
            });
        }
    }

    private void seedProjects() {
        Project p1 = new Project();
        p1.setName("Lotus Horizon Commercial Complex");
        p1.setClient("Apex Residencies Ltd");
        p1.setLocation("Colombo 03, Sri Lanka");
        p1.setStartDate(LocalDate.now().minusMonths(6));
        p1.setEndDate(LocalDate.now().plusMonths(12));
        p1.setEstimatedBudget(7500000000.0);
        p1.setStatus(ProjectStatus.ONGOING);
        p1.setProgressPercentage(60);
        p1.setDescription("22-story commercial office and retail hub featuring deep basement parking and curtain glass facade.");

        Milestone m1 = new Milestone();
        m1.setTitle("Piling & Deep Foundation");
        m1.setTargetDate(LocalDate.now().minusMonths(4));
        m1.setStatus(MilestoneStatus.COMPLETED);
        m1.setDescription("Cast-in-situ bored piles verified by core test.");
        m1.setProject(p1);

        Milestone m2 = new Milestone();
        m2.setTitle("Basement & Substructure Concrete");
        m2.setTargetDate(LocalDate.now().minusMonths(2));
        m2.setStatus(MilestoneStatus.COMPLETED);
        m2.setDescription("Grade 40 concrete with waterproofing admixtures.");
        m2.setProject(p1);

        Milestone m3 = new Milestone();
        m3.setTitle("Superstructure Columns & Slabs (L1-L10)");
        m3.setTargetDate(LocalDate.now().plusMonths(2));
        m3.setStatus(MilestoneStatus.IN_PROGRESS);
        m3.setDescription("Floor formwork, rebar placement and post-tensioning.");
        m3.setProject(p1);

        Milestone m4 = new Milestone();
        m4.setTitle("Curtain Wall & Glazing Handover");
        m4.setTargetDate(LocalDate.now().plusMonths(8));
        m4.setStatus(MilestoneStatus.PENDING);
        m4.setDescription("Double-glazed thermal acoustic curtain walls.");
        m4.setProject(p1);

        p1.setMilestones(List.of(m1, m2, m3, m4));
        projectRepository.save(p1);

        Project p2 = new Project();
        p2.setName("Green Valley Eco Luxury Villas");
        p2.setClient("EcoLiving Holdings");
        p2.setLocation("Kandy Road, Kadawatha");
        p2.setStartDate(LocalDate.now().minusMonths(3));
        p2.setEndDate(LocalDate.now().plusMonths(5));
        p2.setEstimatedBudget(2550000000.0);
        p2.setStatus(ProjectStatus.ONGOING);
        p2.setProgressPercentage(40);
        p2.setDescription("Gated community of 18 sustainable eco-friendly luxury residential villas.");

        Milestone vm1 = new Milestone();
        vm1.setTitle("Road Grading & Stormwater Culverts");
        vm1.setTargetDate(LocalDate.now().minusMonths(1));
        vm1.setStatus(MilestoneStatus.COMPLETED);
        vm1.setProject(p2);

        Milestone vm2 = new Milestone();
        vm2.setTitle("Block A Superstructure & Roof Truss");
        vm2.setTargetDate(LocalDate.now().plusMonths(1));
        vm2.setStatus(MilestoneStatus.IN_PROGRESS);
        vm2.setProject(p2);

        p2.setMilestones(List.of(vm1, vm2));
        projectRepository.save(p2);

        Project p3 = new Project();
        p3.setName("Southern Highway Overpass & Bridge");
        p3.setClient("Road Development Authority");
        p3.setLocation("Galle Outer Circular Section");
        p3.setStartDate(LocalDate.now().plusDays(15));
        p3.setEndDate(LocalDate.now().plusMonths(18));
        p3.setEstimatedBudget(12600000000.0);
        p3.setStatus(ProjectStatus.PLANNED);
        p3.setProgressPercentage(0);
        p3.setDescription("Prestressed concrete girder bridge spans across 4 traffic lanes.");
        projectRepository.save(p3);
    }

    private void seedTasks() {
        List<Project> projects = projectRepository.findAll();
        if (projects.isEmpty()) return;

        Project p1 = projects.get(0);
        Project p2 = projects.size() > 1 ? projects.get(1) : p1;
        Project p3 = projects.size() > 2 ? projects.get(2) : p1;

        TaskItem t1 = new TaskItem();
        t1.setProject(p1);
        t1.setTitle("Foundation Rebar Reinforcement & Inspection");
        t1.setDescription("Inspect Grade 60 rebar cage for basement B2 core wall before concrete pouring.");
        t1.setPriority(TaskPriority.HIGH);
        t1.setStatus(TaskStatus.IN_PROGRESS);
        t1.setAssignedTo("K. Perera (Site Supervisor)");
        t1.setStartDate(LocalDate.now().minusDays(16));
        t1.setDueDate(LocalDate.now().plusDays(3));
        t1.setProgressPercentage(75);
        t1.setIsOverdue(false);
        taskRepository.save(t1);

        TaskItem t2 = new TaskItem();
        t2.setProject(p1);
        t2.setTitle("Basement Dewatering & Trench Excavation");
        t2.setDescription("Continuous dewatering pump operation and trench shoring installation.");
        t2.setPriority(TaskPriority.MEDIUM);
        t2.setStatus(TaskStatus.DONE);
        t2.setAssignedTo("M. Fernando (Heavy Machinery)");
        t2.setStartDate(LocalDate.now().minusDays(30));
        t2.setDueDate(LocalDate.now().minusDays(15));
        t2.setProgressPercentage(100);
        t2.setIsOverdue(false);
        taskRepository.save(t2);

        TaskItem t3 = new TaskItem();
        t3.setProject(p2);
        t3.setTitle("Roof Truss Timber Treatment & Erection");
        t3.setDescription("Apply anti-termite treatment to treated teak timber roof trusses for Villa 04-08.");
        t3.setPriority(TaskPriority.HIGH);
        t3.setStatus(TaskStatus.TODO);
        t3.setAssignedTo("S. Silva (Master Carpenter)");
        t3.setStartDate(LocalDate.now().minusDays(7));
        t3.setDueDate(LocalDate.now().minusDays(2));
        t3.setProgressPercentage(0);
        t3.setIsOverdue(true);
        taskRepository.save(t3);

        TaskItem t4 = new TaskItem();
        t4.setProject(p3);
        t4.setTitle("Pier Cap Post-Tensioning Cable Ducting");
        t4.setDescription("Install high-tensile strand ducts for pier 03 cap beam post-tensioning.");
        t4.setPriority(TaskPriority.HIGH);
        t4.setStatus(TaskStatus.IN_PROGRESS);
        t4.setAssignedTo("R. Jayawardena (Structural Tech)");
        t4.setStartDate(LocalDate.now().minusDays(12));
        t4.setDueDate(LocalDate.now().plusDays(8));
        t4.setProgressPercentage(40);
        t4.setIsOverdue(false);
        taskRepository.save(t4);
    }

    private void seedInspections() {
        List<Project> projects = projectRepository.findAll();
        if (projects.isEmpty()) return;

        Project p1 = projects.get(0);

        Inspection i1 = new Inspection();
        i1.setProject(p1);
        i1.setStage(InspectionStage.FOUNDATION);
        i1.setInspectorName("Eng. Samantha Perera (Chartered Structural Eng)");
        i1.setInspectionDate(LocalDate.now().minusDays(10));
        i1.setStatus(InspectionStatus.PASSED);
        i1.setChecklistNotes("Foundation rebar spacing, concrete cover blocks (50mm), and cleanliness verified.");
        i1.setDefectRemarks("Minor debris in core box cleared before sign-off.");
        i1.setIsReInspection(false);
        inspectionRepository.save(i1);

        Inspection i2 = new Inspection();
        i2.setProject(p1);
        i2.setStage(InspectionStage.CONCRETE_POURING);
        i2.setInspectorName("K. Gunathilake (QC Lead)");
        i2.setInspectionDate(LocalDate.now().minusDays(2));
        i2.setStatus(InspectionStatus.PENDING);
        i2.setChecklistNotes("Slump test target 120mm +/- 25mm. 6 cube samples taken for 7 & 28 day crush tests.");
        i2.setIsReInspection(false);
        inspectionRepository.save(i2);
    }

    private void seedInventory() {
        Material m1 = new Material();
        m1.setName("Ordinary Portland Cement (50kg)");
        m1.setCategory("Cement");
        m1.setUnit("Bags");
        m1.setCurrentStock(120.0);
        m1.setReorderLevel(250.0);
        m1.setUnitPrice(3750.00);
        m1.setSupplier("Tokyo Cement Lanka PLC");
        m1.setLocation("Lotus Horizon Site Yard");
        m1.computeLowStock();
        Material saved1 = materialRepository.save(m1);

        Material m2 = new Material();
        m2.setName("TMT Steel Rebar (16mm Fe500)");
        m2.setCategory("Steel");
        m2.setUnit("Tons");
        m2.setCurrentStock(48.0);
        m2.setReorderLevel(20.0);
        m2.setUnitPrice(285000.00);
        m2.setSupplier("Ceylon Steel Corporation");
        m2.setLocation("Lotus Horizon Site Yard");
        m2.computeLowStock();
        Material saved2 = materialRepository.save(m2);

        Material m3 = new Material();
        m3.setName("Washed River Sand (Grade A)");
        m3.setCategory("Aggregate");
        m3.setUnit("Cubic Meters");
        m3.setCurrentStock(15.0);
        m3.setReorderLevel(40.0);
        m3.setUnitPrice(11400.00);
        m3.setSupplier("Kelani Mining Services");
        m3.setLocation("Green Valley Villa Site");
        m3.computeLowStock();
        materialRepository.save(m3);

        Material m4 = new Material();
        m4.setName("Clay Bricks (Standard 9x4x3)");
        m4.setCategory("Bricks");
        m4.setUnit("Units");
        m4.setCurrentStock(8500.0);
        m4.setReorderLevel(3000.0);
        m4.setUnitPrice(135.00);
        m4.setSupplier("Dankotuwa Brick Industries");
        m4.setLocation("Green Valley Villa Site");
        m4.computeLowStock();
        materialRepository.save(m4);

        Material m5 = new Material();
        m5.setName("Prestressed Concrete Girders");
        m5.setCategory("Precast");
        m5.setUnit("Units");
        m5.setCurrentStock(8.0);
        m5.setReorderLevel(10.0);
        m5.setUnitPrice(1260000.00);
        m5.setSupplier("State Development & Construction");
        m5.setLocation("Southern Highway Overpass Site");
        m5.computeLowStock();
        materialRepository.save(m5);

        // Seed initial stock logs
        MaterialStockLog l1 = new MaterialStockLog();
        l1.setMaterialId(saved1.getId());
        l1.setMaterialName(saved1.getName());
        l1.setQuantity(80.0);
        l1.setTransactionType("STOCK_OUT");
        l1.setSiteName("Lotus Horizon Commercial Complex");
        l1.setIssuedTo("Block A Concreting Crew");
        l1.setDate(LocalDate.now().minusDays(2).toString());
        l1.setRemarks("Cast-in-situ slab pouring L3");
        stockLogRepository.save(l1);

        MaterialStockLog l2 = new MaterialStockLog();
        l2.setMaterialId(saved2.getId());
        l2.setMaterialName(saved2.getName());
        l2.setQuantity(15.0);
        l2.setTransactionType("STOCK_IN");
        l2.setSiteName("Lotus Horizon Commercial Complex");
        l2.setIssuedTo("Main Yard Receiver");
        l2.setDate(LocalDate.now().minusDays(3).toString());
        l2.setRemarks("Batch delivery invoice #CS-8891");
        stockLogRepository.save(l2);
    }

    private void seedExpenses() {
        List<Project> projects = projectRepository.findAll();
        Long p1Id = !projects.isEmpty() ? projects.get(0).getId() : 1L;
        String p1Name = !projects.isEmpty() ? projects.get(0).getName() : "Lotus Horizon Commercial Complex";
        Long p2Id = projects.size() > 1 ? projects.get(1).getId() : 2L;
        String p2Name = projects.size() > 1 ? projects.get(1).getName() : "Green Valley Eco Luxury Villas";
        Long p3Id = projects.size() > 2 ? projects.get(2).getId() : 3L;
        String p3Name = projects.size() > 2 ? projects.get(2).getName() : "Southern Highway Overpass & Bridge";

        Expense e1 = new Expense();
        e1.setVoucherNo("EX-2026-0891");
        e1.setProjectId(p1Id);
        e1.setProjectName(p1Name);
        e1.setCategory("Materials");
        e1.setAmount(43500000.00);
        e1.setDate(LocalDate.now().minusDays(7));
        e1.setDescription("Batch purchase of Fe500 TMT Steel rebar and 500 bags cement.");
        e1.setApprovedBy("Finance PM");
        e1.setStatus("APPROVED");
        expenseRepository.save(e1);

        Expense e2 = new Expense();
        e2.setVoucherNo("EX-2026-0892");
        e2.setProjectId(p1Id);
        e2.setProjectName(p1Name);
        e2.setCategory("Labour Wages");
        e2.setAmount(14550000.00);
        e2.setDate(LocalDate.now().minusDays(5));
        e2.setDescription("Bi-weekly masonry and concreting labour wage payroll.");
        e2.setApprovedBy("Site Supervisor");
        e2.setStatus("APPROVED");
        expenseRepository.save(e2);

        Expense e3 = new Expense();
        e3.setVoucherNo("EX-2026-0893");
        e3.setProjectId(p2Id);
        e3.setProjectName(p2Name);
        e3.setCategory("Subcontractor");
        e3.setAmount(24600000.00);
        e3.setDate(LocalDate.now().minusDays(3));
        e3.setDescription("Advance payment for timber roof truss fabrication subcontractor.");
        e3.setApprovedBy("Finance PM");
        e3.setStatus("APPROVED");
        expenseRepository.save(e3);

        Expense e4 = new Expense();
        e4.setVoucherNo("EX-2026-0894");
        e4.setProjectId(p3Id);
        e4.setProjectName(p3Name);
        e4.setCategory("Equipment Rental");
        e4.setAmount(28800000.00);
        e4.setDate(LocalDate.now().minusDays(2));
        e4.setDescription("Monthly rental for 150-ton mobile hydraulic crane for girder placement.");
        e4.setApprovedBy("Finance PM");
        e4.setStatus("PENDING");
        expenseRepository.save(e4);
    }

    private void seedWorkforce() {
        Worker w1 = new Worker();
        w1.setFullName("Sunil Shantha");
        w1.setNic("198234509122");
        w1.setTradeCategory("Mason");
        w1.setDailyWageRate(10500.00);
        w1.setPhone("+94 77 123 4567");
        w1.setAssignedSite("Lotus Horizon Commercial Complex");
        w1.setStatus("ACTIVE");
        w1.setDaysPresentThisMonth(0);
        w1.setTotalEarnedWage(0.0);
        Worker saved1 = workerRepository.save(w1);

        Worker w2 = new Worker();
        w2.setFullName("Nimal Bandara");
        w2.setNic("198754120988");
        w2.setTradeCategory("Electrician");
        w2.setDailyWageRate(13500.00);
        w2.setPhone("+94 71 987 6543");
        w2.setAssignedSite("Lotus Horizon Commercial Complex");
        w2.setStatus("ACTIVE");
        w2.setDaysPresentThisMonth(0);
        w2.setTotalEarnedWage(0.0);
        Worker saved2 = workerRepository.save(w2);

        Worker w3 = new Worker();
        w3.setFullName("Kamal Pushpakumara");
        w3.setNic("199011234887");
        w3.setTradeCategory("Plumber");
        w3.setDailyWageRate(12000.00);
        w3.setPhone("+94 75 444 3322");
        w3.setAssignedSite("Green Valley Eco Luxury Villas");
        w3.setStatus("ACTIVE");
        w3.setDaysPresentThisMonth(0);
        w3.setTotalEarnedWage(0.0);
        Worker saved3 = workerRepository.save(w3);

        Worker w4 = new Worker();
        w4.setFullName("Ruwan Dissanayake");
        w4.setNic("198599887123");
        w4.setTradeCategory("Carpenter");
        w4.setDailyWageRate(11400.00);
        w4.setPhone("+94 78 555 1199");
        w4.setAssignedSite("Green Valley Eco Luxury Villas");
        w4.setStatus("ACTIVE");
        w4.setDaysPresentThisMonth(0);
        w4.setTotalEarnedWage(0.0);
        workerRepository.save(w4);

        Worker w5 = new Worker();
        w5.setFullName("Anura Wickramasinghe");
        w5.setNic("199277881234");
        w5.setTradeCategory("Site Helper");
        w5.setDailyWageRate(7500.00);
        w5.setPhone("+94 72 333 8811");
        w5.setAssignedSite("Southern Highway Overpass & Bridge");
        w5.setStatus("ACTIVE");
        w5.setDaysPresentThisMonth(0);
        w5.setTotalEarnedWage(0.0);
        workerRepository.save(w5);

        // Seed initial attendance logs
        AttendanceLog a1 = new AttendanceLog();
        a1.setWorkerId(saved1.getId());
        a1.setWorkerName(saved1.getFullName());
        a1.setTrade("Mason");
        a1.setDate(LocalDate.now().minusDays(1));
        a1.setSiteName("Lotus Horizon Commercial Complex");
        a1.setStatus("PRESENT");
        a1.setHoursWorked(8);
        a1.setCalculatedWage(10500.00);
        attendanceLogRepository.save(a1);

        AttendanceLog a2 = new AttendanceLog();
        a2.setWorkerId(saved2.getId());
        a2.setWorkerName(saved2.getFullName());
        a2.setTrade("Electrician");
        a2.setDate(LocalDate.now().minusDays(1));
        a2.setSiteName("Lotus Horizon Commercial Complex");
        a2.setStatus("PRESENT");
        a2.setHoursWorked(8);
        a2.setCalculatedWage(13500.00);
        attendanceLogRepository.save(a2);

        AttendanceLog a3 = new AttendanceLog();
        a3.setWorkerId(saved3.getId());
        a3.setWorkerName(saved3.getFullName());
        a3.setTrade("Plumber");
        a3.setDate(LocalDate.now().minusDays(1));
        a3.setSiteName("Green Valley Eco Luxury Villas");
        a3.setStatus("ABSENT");
        a3.setHoursWorked(0);
        a3.setCalculatedWage(0.00);
        attendanceLogRepository.save(a3);
    }

    private void seedUsers() {
        UserAccount u1 = new UserAccount();
        u1.setUsername("admin_sys");
        u1.setPassword(passwordEncoder.encode("DemoPass123!"));
        u1.setFullName("System Administrator");
        u1.setEmail("admin@buildtrack.aero");
        u1.setRole("ADMIN");
        u1.setStatus("ACTIVE");
        u1.setLastLogin(LocalDate.now().toString());
        userRepository.save(u1);

        UserAccount u2 = new UserAccount();
        u2.setUsername("pm_kamal");
        u2.setPassword(passwordEncoder.encode("DemoPass123!"));
        u2.setFullName("Eng. Kamal Jayasuriya");
        u2.setEmail("kamal.p@buildtrack.aero");
        u2.setRole("PM");
        u2.setStatus("ACTIVE");
        u2.setLastLogin(LocalDate.now().toString());
        userRepository.save(u2);

        UserAccount u3 = new UserAccount();
        u3.setUsername("sup_perera");
        u3.setPassword(passwordEncoder.encode("DemoPass123!"));
        u3.setFullName("K. Perera (Site Supervisor)");
        u3.setEmail("perera.k@buildtrack.aero");
        u3.setRole("SUPERVISOR");
        u3.setStatus("ACTIVE");
        u3.setLastLogin(LocalDate.now().minusDays(1).toString());
        userRepository.save(u3);

        UserAccount u4 = new UserAccount();
        u4.setUsername("client_road_auth");
        u4.setPassword(passwordEncoder.encode("DemoPass123!"));
        u4.setFullName("Road Development Authority");
        u4.setEmail("rda.client@gov.lk");
        u4.setRole("CLIENT");
        u4.setStatus("ACTIVE");
        u4.setLastLogin(LocalDate.now().minusDays(2).toString());
        userRepository.save(u4);

        UserAccount u5 = new UserAccount();
        u5.setUsername("pm_sarath");
        u5.setPassword(passwordEncoder.encode("DemoPass123!"));
        u5.setFullName("Eng. Sarath Fonseka");
        u5.setEmail("sarath.f@buildtrack.aero");
        u5.setRole("PM");
        u5.setStatus("INACTIVE");
        u5.setLastLogin("2026-07-20");
        userRepository.save(u5);
    }
}
