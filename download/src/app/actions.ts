'use server';

import { upsertTask as dbUpsertTask, deleteTask as dbDeleteTask } from '@/lib/data';
import { suggestResources as suggestResourcesFlow } from '@/ai/flows/realtime-resource-suggestions';
import type { Task } from '@/types';
import { revalidatePath } from 'next/cache';

export async function upsertTask(taskData: Omit<Task, 'subtasks' | 'createdAt'> & { parentId?: string | null }) {
  try {
    const result = await dbUpsertTask(taskData);
    revalidatePath('/');
    return { success: true, task: result };
  } catch (error) {
    console.error('Error upserting task:', error);
    return { success: false, message: 'Failed to save task.' };
  }
}

export async function deleteTask(taskId: string) {
    try {
        await dbDeleteTask(taskId);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false, message: 'Failed to delete task.' };
    }
}


export async function suggestResourcesAction(taskDescription: string) {
  if (!taskDescription || taskDescription.trim().length < 20) {
    return { suggestions: [] };
  }
  try {
    const result = await suggestResourcesFlow({ taskDescription });
    return { suggestions: result.suggestedResources };
  } catch (error) {
    console.error('Error suggesting resources:', error);
    return { suggestions: [], error: 'Failed to get suggestions.' };
  }
}
