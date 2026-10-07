package com.example.Construction_Managemnet.project.service;

import com.example.Construction_Managemnet.common.exception.ResourceNotFoundException;
import com.example.Construction_Managemnet.project.model.*;
import com.example.Construction_Managemnet.project.repository.MilestoneRepository;
import com.example.Construction_Managemnet.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;
    private final com.example.Construction_Managemnet.user.repository.UserAccountRepository userRepository;

    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return visibleProjects(projectRepository.findByIsDeletedFalseOrderByCreatedAtDesc());
    }

    @Transactional(readOnly = true)
    public List<Project> searchProjects(String keyword, String client, ProjectStatus status) {
        String kw = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cl = (client != null && !client.trim().isEmpty()) ? client.trim() : null;
        return visibleProjects(projectRepository.searchProjects(kw, cl, status));
    }

    @Transactional(readOnly = true)
    public Project getProjectById(Long id) {
        return projectRepository.findByIdAndIsDeletedFalse(id)
                .filter(this::canReadProject)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    public Project createProject(ProjectDto dto) {
        Project project = new Project();
        mapDtoToEntity(dto, project);
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, ProjectDto dto) {
        Project project = getProjectById(id);
        mapDtoToEntity(dto, project);
        return projectRepository.save(project);
    }

    public void softDeleteProject(Long id) {
        Project project = getProjectById(id);
        project.setIsDeleted(true);
        projectRepository.save(project);
    }

    public Project archiveProject(Long id) {
        Project project = getProjectById(id);
        project.setStatus(ProjectStatus.ARCHIVED);
        return projectRepository.save(project);
    }

    public Milestone addMilestone(Long projectId, MilestoneDto dto) {
        Project project = getProjectById(projectId);
        Milestone milestone = new Milestone();
        milestone.setTitle(dto.getTitle());
        milestone.setDescription(dto.getDescription());
        milestone.setTargetDate(dto.getTargetDate());
        milestone.setStatus(dto.getStatus() != null ? dto.getStatus() : MilestoneStatus.PENDING);
        milestone.setProject(project);

        Milestone saved = milestoneRepository.save(milestone);
        project.getMilestones().add(saved);
        updateProjectProgressFromMilestones(project);
        return saved;
    }

    public Milestone updateMilestone(Long milestoneId, MilestoneDto dto) {
        Milestone milestone = milestoneRepository.findByIdAndIsDeletedFalse(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));

        milestone.setTitle(dto.getTitle());
        milestone.setDescription(dto.getDescription());
        milestone.setTargetDate(dto.getTargetDate());
        if (dto.getStatus() != null) {
            milestone.setStatus(dto.getStatus());
        }

        Milestone updated = milestoneRepository.save(milestone);
        updateProjectProgressFromMilestones(milestone.getProject());
        return updated;
    }

    public void deleteMilestone(Long milestoneId) {
        Milestone milestone = milestoneRepository.findByIdAndIsDeletedFalse(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));
        milestone.setIsDeleted(true);
        milestoneRepository.save(milestone);
        updateProjectProgressFromMilestones(milestone.getProject());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProjectSummaryReport() {
        List<Project> all = projectRepository.findByIsDeletedFalseOrderByCreatedAtDesc();
        long totalProjects = all.size();
        long planned = all.stream().filter(p -> p.getStatus() == ProjectStatus.PLANNED).count();
        long ongoing = all.stream().filter(p -> p.getStatus() == ProjectStatus.ONGOING).count();
        long onHold = all.stream().filter(p -> p.getStatus() == ProjectStatus.ON_HOLD).count();
        long completed = all.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();

        double totalBudget = all.stream().mapToDouble(p -> p.getEstimatedBudget() != null ? p.getEstimatedBudget() : 0.0).sum();
        double avgProgress = totalProjects > 0 ? all.stream().mapToInt(p -> p.getProgressPercentage() != null ? p.getProgressPercentage() : 0).average().orElse(0.0) : 0.0;

        Map<String, Object> report = new HashMap<>();
        report.put("totalProjects", totalProjects);
        report.put("plannedCount", planned);
        report.put("ongoingCount", ongoing);
        report.put("onHoldCount", onHold);
        report.put("completedCount", completed);
        report.put("totalEstimatedBudget", totalBudget);
        report.put("averageProgressPercentage", Math.round(avgProgress * 10.0) / 10.0);
        report.put("projects", all);
        return report;
    }

    private List<Project> visibleProjects(List<Project> projects) {
        return projects.stream().filter(this::canReadProject).toList();
    }

    private boolean canReadProject(Project project) {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_CLIENT"))) return true;
        return userRepository.findByUsernameAndIsDeletedFalse(authentication.getName())
                .map(user -> user.getFullName().trim().equalsIgnoreCase(project.getClient().trim())).orElse(false);
    }

    private void updateProjectProgressFromMilestones(Project project) {
        List<Milestone> activeMilestones = project.getMilestones().stream()
                .filter(m -> !Boolean.TRUE.equals(m.getIsDeleted()))
                .toList();
        if (activeMilestones.isEmpty()) {
            project.setProgressPercentage(0);
            if (project.getStatus() == ProjectStatus.COMPLETED) project.setStatus(ProjectStatus.ONGOING);
            projectRepository.save(project);
        } else {
            long completedCount = activeMilestones.stream()
                    .filter(m -> m.getStatus() == MilestoneStatus.COMPLETED)
                    .count();
            int calcPercentage = (int) Math.round(((double) completedCount / activeMilestones.size()) * 100);
            project.setProgressPercentage(calcPercentage);
            if (calcPercentage == 100 && project.getStatus() == ProjectStatus.ONGOING) {
                project.setStatus(ProjectStatus.COMPLETED);
            }
            if (calcPercentage < 100 && project.getStatus() == ProjectStatus.COMPLETED) project.setStatus(ProjectStatus.ONGOING);
            projectRepository.save(project);
        }
    }

    private void mapDtoToEntity(ProjectDto dto, Project project) {
        if (dto.getStartDate() != null && dto.getEndDate() != null && dto.getEndDate().isBefore(dto.getStartDate())) throw new IllegalArgumentException("Project end date must be on or after start date");
        project.setName(dto.getName());
        project.setClient(dto.getClient());
        project.setLocation(dto.getLocation());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setEstimatedBudget(dto.getEstimatedBudget());
        if (dto.getStatus() != null) {
            project.setStatus(dto.getStatus());
        }
        if (dto.getProgressPercentage() != null) {
            project.setProgressPercentage(dto.getProgressPercentage());
        }
        project.setDescription(dto.getDescription());
    }
}
