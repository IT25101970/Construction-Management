import { request } from './client';

// Helper to normalize task response from backend to frontend-friendly format
const normalizeTask = (task) => ({
  ...task,
  // Map nested project object to flat projectId/projectName
  projectId: task.project ? task.project.id : task.projectId,
  projectName: task.project ? task.project.name : (task.projectName || ''),
  // Map assignedTo → assignee for display
  assignee: task.assignedTo || task.assignee || '',
});

const normalizeTasks = (tasks) => tasks.map(normalizeTask);

export const taskApi = {
  getAll: (projectId = null) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return request(`/tasks${query}`).then(normalizeTasks);
  },

  getById: (id) => request(`/tasks/${id}`).then(normalizeTask),

  create: (task) => {
    // Map frontend field names → backend DTO field names
    const dto = {
      title: task.title,
      description: task.description,
      projectId: Number(task.projectId),
      assignedTo: task.assignee || task.assignedTo,
      priority: task.priority,
      status: task.status === 'TO_DO' ? 'TODO' : task.status,
      startDate: task.startDate,
      dueDate: task.dueDate,
      progressPercentage: Number(task.progressPercentage || 0),
      workNotes: task.workNotes || task.description || '',
    };
    return request('/tasks', { method: 'POST', body: JSON.stringify(dto) }).then(normalizeTask);
  },

  update: (id, task) => {
    const dto = {
      title: task.title,
      description: task.description,
      projectId: Number(task.projectId),
      assignedTo: task.assignee || task.assignedTo,
      priority: task.priority,
      status: task.status === 'TO_DO' ? 'TODO' : task.status,
      startDate: task.startDate,
      dueDate: task.dueDate,
      progressPercentage: Number(task.progressPercentage || 0),
      workNotes: task.workNotes || task.description || '',
    };
    return request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(dto) }).then(normalizeTask);
  },

  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
