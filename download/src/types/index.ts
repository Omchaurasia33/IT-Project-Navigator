export type User = {
  id: string;
  name: string;
  avatar: string;
};

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'canceled';

export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  startDate: string; // ISO string
  dueDate: string; // ISO string
  createdAt: string; // ISO string
  subtasks: Task[];
};
