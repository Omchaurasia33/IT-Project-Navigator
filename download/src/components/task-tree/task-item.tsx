'use client';

import type { Task, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Circle,
  CircleDotDashed,
  CheckCircle2,
  XCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  MessageSquarePlus,
  Pencil,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskItemProps {
  task: Task;
  users: User[];
  level: number;
  onEdit: (task: Task) => void;
  onAddSubtask: (parentId: string) => void;
  onDelete: (taskId: string) => void;
}

const statusIcons = {
  todo: <Circle className="w-4 h-4" />,
  'in-progress': <CircleDotDashed className="w-4 h-4" />,
  done: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  canceled: <XCircle className="w-4 h-4 text-red-500" />,
};

const statusLabels: { [key: string]: string } = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
    canceled: 'Canceled',
};

const priorityIcons = {
  low: <ArrowDown className="w-4 h-4" />,
  medium: <ArrowRight className="w-4 h-4" />,
  high: <ArrowUp className="w-4 h-4" />,
};

export function TaskItem({ task, users, level, onEdit, onAddSubtask, onDelete }: TaskItemProps) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const assignee = users.find((user) => user.id === task.assigneeId);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className="group flex flex-col items-start rounded-lg transition-colors hover:bg-card/50"
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        <div className="flex items-center w-full py-2 px-2">
          {hasSubtasks ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="w-6 h-6 mr-2">
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-6 h-6 mr-2" />
          )}

          <div className="flex items-center gap-2 flex-grow">
            <div className="text-muted-foreground">{statusIcons[task.status]}</div>
            <span className="font-medium">{task.title}</span>
            <Badge variant="outline" className="h-5 capitalize">{statusLabels[task.status]}</Badge>
            <div title={`Priority: ${task.priority}`} className="text-muted-foreground capitalize flex items-center gap-1">
              {priorityIcons[task.priority]}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
             <span className="text-sm text-muted-foreground hidden md:inline">
              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
            </span>
            {assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onAddSubtask(task.id)}>
                    <MessageSquarePlus className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onEdit(task)}>
                    <Pencil className="w-4 h-4" />
                </Button>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-7 h-7">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onAddSubtask(task.id)}>Add Subtask</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {hasSubtasks && (
        <CollapsibleContent>
          {task.subtasks.map((subtask) => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              users={users}
              level={level + 1}
              onEdit={onEdit}
              onAddSubtask={onAddSubtask}
              onDelete={onDelete}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
