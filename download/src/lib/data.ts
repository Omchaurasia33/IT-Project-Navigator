import type { Task, User } from '@/types';
import { addDays, subDays } from 'date-fns';

const users: User[] = [
  { id: 'user-1', name: 'Alice', avatar: 'https://picsum.photos/seed/1/40/40' },
  { id: 'user-2', name: 'Bob', avatar: 'https://picsum.photos/seed/2/40/40' },
  { id: 'user-3', name: 'Charlie', avatar: 'https://picsum.photos/seed/3/40/40' },
  { id: 'user-4', name: 'David', avatar: 'https://picsum.photos/seed/4/40/40' },
  { id: 'user-5', name: 'Eve', avatar: 'https://picsum.photos/seed/5/40/40' },
];

let tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Project Kick-off and Planning',
    status: 'done',
    priority: 'high',
    assigneeId: 'user-1',
    createdAt: subDays(new Date(), 30).toISOString(),
    startDate: subDays(new Date(), 30).toISOString(),
    dueDate: subDays(new Date(), 25).toISOString(),
    subtasks: [
      {
        id: 'task-1-1',
        title: 'Define Project Scope and Objectives',
        status: 'done',
        priority: 'high',
        assigneeId: 'user-1',
        createdAt: subDays(new Date(), 29).toISOString(),
        startDate: subDays(new Date(), 29).toISOString(),
        dueDate: subDays(new Date(), 28).toISOString(),
        subtasks: [],
      },
      {
        id: 'task-1-2',
        title: 'Assemble Project Team',
        status: 'done',
        priority: 'medium',
        assigneeId: 'user-2',
        createdAt: subDays(new Date(), 28).toISOString(),
        startDate: subDays(new Date(), 28).toISOString(),
        dueDate: subDays(new Date(), 27).toISOString(),
        subtasks: [],
      },
    ],
  },
  {
    id: 'task-2',
    title: 'Design Phase',
    status: 'in-progress',
    priority: 'high',
    assigneeId: 'user-3',
    createdAt: subDays(new Date(), 24).toISOString(),
    startDate: subDays(new Date(), 24).toISOString(),
    dueDate: addDays(new Date(), 5).toISOString(),
    description: "This task involves creating the UI/UX mockups for the new dashboard feature. We should follow the new design system guidelines. Relevant documents include the 'Odyssey Design System' PDF and the discussion thread in #design-reviews channel.",
    subtasks: [
      {
        id: 'task-2-1',
        title: 'Create Wireframes',
        status: 'done',
        priority: 'high',
        assigneeId: 'user-3',
        createdAt: subDays(new Date(), 23).toISOString(),
        startDate: subDays(new Date(), 23).toISOString(),
        dueDate: subDays(new Date(), 18).toISOString(),
        subtasks: [],
      },
      {
        id: 'task-2-2',
        title: 'Develop High-Fidelity Mockups',
        status: 'in-progress',
        priority: 'high',
        assigneeId: 'user-3',
        createdAt: subDays(new Date(), 17).toISOString(),
        startDate: subDays(new Date(), 17).toISOString(),
        dueDate: addDays(new Date(), 2).toISOString(),
        subtasks: [],
      },
      {
        id: 'task-2-3',
        title: 'Design Review and Feedback',
        status: 'todo',
        priority: 'medium',
        assigneeId: 'user-1',
        createdAt: subDays(new Date(), 10).toISOString(),
        startDate: addDays(new Date(), 3).toISOString(),
        dueDate: addDays(new Date(), 5).toISOString(),
        subtasks: [],
      },
    ],
  },
  {
    id: 'task-3',
    title: 'Development Phase',
    status: 'todo',
    priority: 'high',
    assigneeId: 'user-2',
    createdAt: subDays(new Date(), 5).toISOString(),
    startDate: new Date().toISOString(),
    dueDate: addDays(new Date(), 30).toISOString(),
    subtasks: [
        {
        id: 'task-3-1',
        title: 'Setup Backend Services',
        status: 'todo',
        priority: 'high',
        assigneeId: 'user-4',
        createdAt: subDays(new Date(), 4).toISOString(),
        startDate: addDays(new Date(), 1).toISOString(),
        dueDate: addDays(new Date(), 10).toISOString(),
        subtasks: [
          {
            id: 'task-3-1-1',
            title: 'Initialize Database Schema',
            status: 'todo',
            priority: 'high',
            assigneeId: 'user-4',
            createdAt: subDays(new Date(), 4).toISOString(),
            startDate: addDays(new Date(), 2).toISOString(),
            dueDate: addDays(new Date(), 5).toISOString(),
            subtasks: [],
          },
        ]
      },
      {
        id: 'task-3-2',
        title: 'Implement Frontend Components',
        status: 'todo',
        priority: 'high',
        assigneeId: 'user-5',
        createdAt: subDays(new Date(), 3).toISOString(),
        startDate: addDays(new Date(), 6).toISOString(),
        dueDate: addDays(new Date(), 20).toISOString(),
        subtasks: [],
      },
    ]
  },
  {
    id: 'task-4',
    title: 'Deployment',
    status: 'canceled',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    startDate: addDays(new Date(), 31).toISOString(),
    dueDate: addDays(new Date(), 35).toISOString(),
    subtasks: [],
  },
];

// Simulate a database
export const getTasks = async (): Promise<Task[]> => {
  return Promise.resolve(JSON.parse(JSON.stringify(tasks)));
};

export const getUsers = async (): Promise<User[]> => {
  return Promise.resolve(JSON.parse(JSON.stringify(users)));
};

const findTask = (tasks: Task[], taskId: string): Task | null => {
  for (const task of tasks) {
    if (task.id === taskId) return task;
    const found = findTask(task.subtasks, taskId);
    if (found) return found;
  }
  return null;
}

const findParent = (tasks: Task[], taskId: string): Task[] | null => {
    for (const task of tasks) {
        if (task.subtasks.some(sub => sub.id === taskId)) return task.subtasks;
        const found = findParent(task.subtasks, taskId);
        if (found) return found;
    }
    return null;
}

export const upsertTask = async (taskData: Omit<Task, 'subtasks' | 'createdAt'> & { parentId?: string | null }) => {
  const { parentId, ...data } = taskData;
  const existingTask = findTask(tasks, data.id);

  if (existingTask) {
    // Update
    Object.assign(existingTask, data);
    return Promise.resolve(existingTask);
  } else {
    // Create
    const newTask: Task = {
      ...data,
      subtasks: [],
      createdAt: new Date().toISOString(),
    };
    if (parentId) {
      const parent = findTask(tasks, parentId);
      if (parent) {
        parent.subtasks.push(newTask);
      } else {
        // Fallback to root if parent not found
        tasks.push(newTask);
      }
    } else {
      tasks.push(newTask);
    }
    return Promise.resolve(newTask);
  }
};

export const deleteTask = async (taskId: string) => {
    let parentArray = findParent(tasks, taskId);
    if (parentArray) {
        const index = parentArray.findIndex(t => t.id === taskId);
        if (index > -1) {
            parentArray.splice(index, 1);
            return Promise.resolve({ success: true });
        }
    } else {
        // Check if it's a root task
        const index = tasks.findIndex(t => t.id === taskId);
        if (index > -1) {
            tasks.splice(index, 1);
            return Promise.resolve({ success: true });
        }
    }
    return Promise.resolve({ success: false });
}
