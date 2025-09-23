'use client';

import type { Task, User } from '@/types';
import { TaskItem } from './task-item';

interface TaskTreeProps {
  tasks: Task[];
  users: User[];
  onEdit: (task: Task) => void;
  onAddSubtask: (parentId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskTree({ tasks, users, onEdit, onAddSubtask, onDelete }: TaskTreeProps) {
  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          users={users}
          level={0}
          onEdit={onEdit}
          onAddSubtask={onAddSubtask}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
