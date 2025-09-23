'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Task, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskTree } from '@/components/task-tree';
import { TaskDialog } from '@/components/task-dialog';
import GanttView from './gantt-view';
import { GitBranchPlus, GanttChart, ListTree, Loader2 } from 'lucide-react';
import { deleteTask } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProjectPageProps {
  initialTasks: Task[];
  users: User[];
}

function filterTasks(tasks: Task[], filters: { status: string; assigneeId: string }): Task[] {
  if (filters.status === 'all' && filters.assigneeId === 'all') {
    return tasks;
  }
  return tasks.reduce((acc: Task[], task) => {
    const selfMatches =
      (filters.status === 'all' || task.status === filters.status) &&
      (filters.assigneeId === 'all' || task.assigneeId === filters.assigneeId);

    const subtasks = filterTasks(task.subtasks, filters);

    if (selfMatches || subtasks.length > 0) {
      acc.push({ ...task, subtasks });
    }
    return acc;
  }, []);
}

function findAndUpsertTask(tasks: Task[], taskToUpsert: Task, parentId?: string | null): Task[] {
    if (parentId === null || parentId === undefined) {
        const existingIndex = tasks.findIndex(t => t.id === taskToUpsert.id);
        if (existingIndex > -1) {
            tasks[existingIndex] = { ...tasks[existingIndex], ...taskToUpsert };
            return tasks;
        } else {
            return [...tasks, taskToUpsert];
        }
    }

    return tasks.map(task => {
        if (task.id === parentId) {
            const existingSubtaskIndex = task.subtasks.findIndex(st => st.id === taskToUpsert.id);
            if (existingSubtaskIndex > -1) {
                task.subtasks[existingSubtaskIndex] = { ...task.subtasks[existingSubtaskIndex], ...taskToUpsert };
            } else {
                task.subtasks.push(taskToUpsert);
            }
            return task;
        }
        if (task.subtasks.length > 0) {
            return { ...task, subtasks: findAndUpsertTask(task.subtasks, taskToUpsert, parentId) };
        }
        return task;
    });
}

function findAndRemoveTask(tasks: Task[], taskId: string): Task[] {
    return tasks.filter(task => task.id !== taskId).map(task => {
        if (task.subtasks) {
            return { ...task, subtasks: findAndRemoveTask(task.subtasks, taskId) };
        }
        return task;
    });
}


export default function ProjectPage({ initialTasks, users }: ProjectPageProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [filters, setFilters] = useState({ status: 'all', assigneeId: 'all' });
  const { toast } = useToast();

  const handleOpenDialogForNew = (parentId: string | null = null) => {
    setEditingTask(null);
    setCurrentParentId(parentId);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    // Find parent to correctly handle edit dialog logic
    const findParent = (searchTask: Task, taskList: Task[]): string | null => {
        for(const t of taskList) {
            if (t.subtasks.some(st => st.id === searchTask.id)) return t.id;
            const parentId = findParent(searchTask, t.subtasks);
            if (parentId) return parentId;
        }
        return null;
    }
    const parentId = findParent(task, tasks);
    setCurrentParentId(parentId);
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsAlertOpen(true);
  };
  
  const confirmDelete = () => {
      if (!taskToDelete) return;
      startDeleteTransition(async () => {
          const result = await deleteTask(taskToDelete);
          if (result.success) {
              setTasks(prevTasks => findAndRemoveTask(prevTasks, taskToDelete));
              toast({ title: 'Task deleted successfully' });
          } else {
              toast({ title: 'Error', description: result.message, variant: 'destructive' });
          }
          setIsAlertOpen(false);
          setTaskToDelete(null);
      });
  };

  const handleTaskUpserted = (upsertedTask: Task) => {
    setTasks(prevTasks => findAndUpsertTask(prevTasks, upsertedTask, upsertedTask.id === editingTask?.id ? currentParentId : (currentParentId || undefined)));
  };

  const { totalTasks, completedTasks, progress } = useMemo(() => {
    const flatten = (tasks: Task[]): Task[] => tasks.flatMap(t => [t, ...flatten(t.subtasks)]);
    const allTasks = flatten(tasks);
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'done').length;
    return {
      totalTasks: total,
      completedTasks: completed,
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [tasks]);
  
  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2 font-headline">IT Project Navigator</h1>
        <div className="flex items-center gap-4">
          <Progress value={progress} className="w-1/3" />
          <span className="text-sm text-muted-foreground">{completedTasks} / {totalTasks} tasks completed</span>
        </div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-4">
          <Select value={filters.status} onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.assigneeId} onValueChange={(value) => setFilters(f => ({ ...f, assigneeId: value }))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleOpenDialogForNew(null)}>
          <GitBranchPlus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <Tabs defaultValue="tree" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tree"><ListTree className="mr-2 h-4 w-4"/> Tree View</TabsTrigger>
          <TabsTrigger value="gantt"><GanttChart className="mr-2 h-4 w-4"/> Gantt Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="tree">
          <Card>
            <TaskTree tasks={filteredTasks} users={users} onEdit={handleEditTask} onAddSubtask={(parentId) => handleOpenDialogForNew(parentId)} onDelete={handleDeleteRequest} />
          </Card>
        </TabsContent>
        <TabsContent value="gantt">
            <GanttView tasks={filteredTasks} users={users} />
        </TabsContent>
      </Tabs>
      
      <TaskDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onTaskUpserted={handleTaskUpserted}
        task={editingTask}
        parentId={currentParentId}
        users={users}
      />

       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the task and any subtasks.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
