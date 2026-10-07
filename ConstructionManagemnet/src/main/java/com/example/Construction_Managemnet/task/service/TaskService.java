package com.example.Construction_Managemnet.task.service;

import com.example.Construction_Managemnet.common.exception.ResourceNotFoundException;
import com.example.Construction_Managemnet.project.model.Project;
import com.example.Construction_Managemnet.project.repository.ProjectRepository;
import com.example.Construction_Managemnet.task.model.*;
import com.example.Construction_Managemnet.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public List<TaskItem> getAllTasks() {
        List<TaskItem> tasks = taskRepository.findByIsDeletedFalseOrderByDueDateAsc();
        checkAndApplyOverdueStatus(tasks);
        return tasks;
    }

    public List<TaskItem> searchTasks(Long projectId, TaskStatus status, String assignee, String keyword) {
        String ass = (assignee != null && !assignee.trim().isEmpty()) ? assignee.trim() : null;
        String kw = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        List<TaskItem> tasks = taskRepository.searchTasks(projectId, status, ass, kw);
        checkAndApplyOverdueStatus(tasks);
        return tasks;
    }

    public TaskItem getTaskById(Long id) {
        TaskItem task = taskRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        checkSingleTaskOverdue(task);
        return task;
    }

    public TaskItem createTask(TaskDto dto) {
        Project project = projectRepository.findByIdAndIsDeletedFalse(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjectId()));

        TaskItem task = new TaskItem();
        mapDtoToEntity(dto, task, project);
        checkSingleTaskOverdue(task);
        return taskRepository.save(task);
    }

    public TaskItem updateTask(Long id, TaskDto dto) {
        TaskItem task = getTaskById(id);
        Project project = projectRepository.findByIdAndIsDeletedFalse(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjectId()));

        mapDtoToEntity(dto, task, project);
        checkSingleTaskOverdue(task);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        TaskItem task = getTaskById(id);
        task.setIsDeleted(true);
        taskRepository.save(task);
    }

    public Map<String, Object> getWeeklyTaskReport(Long projectId) {
        List<TaskItem> tasks = projectId != null
                ? taskRepository.searchTasks(projectId, null, null, null)
                : taskRepository.findByIsDeletedFalseOrderByDueDateAsc();

        checkAndApplyOverdueStatus(tasks);

        long total = tasks.size();
        long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long delayed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DELAYED || Boolean.TRUE.equals(t.getIsOverdue())).count();

        double adherenceRate = total > 0 ? ((double) completed / total) * 100.0 : 100.0;

        List<TaskItem> overdueTasks = tasks.stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsOverdue()) || t.getStatus() == TaskStatus.DELAYED)
                .toList();

        Map<String, Object> report = new HashMap<>();
        report.put("totalTasks", total);
        report.put("completedTasks", completed);
        report.put("inProgressTasks", inProgress);
        report.put("overdueTasksCount", delayed);
        report.put("scheduleAdherencePercentage", Math.round(adherenceRate * 10.0) / 10.0);
        report.put("overdueTaskList", overdueTasks);
        report.put("allTasks", tasks);

        return report;
    }

    private void checkAndApplyOverdueStatus(List<TaskItem> tasks) {
        LocalDate today = LocalDate.now();
        for (TaskItem task : tasks) {
            if (task.getDueDate() != null && task.getDueDate().isBefore(today) && task.getStatus() != TaskStatus.DONE) {
                task.setIsOverdue(true);
                if (task.getStatus() != TaskStatus.DELAYED) {
                    task.setStatus(TaskStatus.DELAYED);
                    taskRepository.save(task);
                }
            } else {
                task.setIsOverdue(false);
            }
        }
    }

    private void checkSingleTaskOverdue(TaskItem task) {
        LocalDate today = LocalDate.now();
        if (task.getDueDate() != null && task.getDueDate().isBefore(today) && task.getStatus() != TaskStatus.DONE) {
            task.setIsOverdue(true);
            task.setStatus(TaskStatus.DELAYED);
        } else {
            task.setIsOverdue(false);
        }
    }

    private void mapDtoToEntity(TaskDto dto, TaskItem task, Project project) {
        if (dto.getStartDate() != null && dto.getDueDate() != null && dto.getDueDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("Task due date must be on or after start date");
        }
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setProject(project);
        task.setAssignedTo(dto.getAssignedTo());
        if (dto.getPriority() != null) {
            task.setPriority(dto.getPriority());
        }
        task.setStartDate(dto.getStartDate());
        task.setDueDate(dto.getDueDate());
        if (dto.getStatus() != null) {
            task.setStatus(dto.getStatus());
        }
        if (dto.getProgressPercentage() != null) {
            task.setProgressPercentage(dto.getProgressPercentage());
            if (dto.getProgressPercentage() == 100) {
                task.setStatus(TaskStatus.DONE);
            }
        }
        task.setWorkNotes(dto.getWorkNotes());
    }
}
