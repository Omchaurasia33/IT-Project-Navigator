import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiFetch } from '../../../lib/api';

// Optional params:
// - overrideProjectId: string | undefined -> force a specific project id
// - requireProject: boolean -> if true, don't fetch when no project id is set
export const useTasks = (overrideProjectId, requireProject = false) => {
    const [tasks, setTasks] = useState([]);
    const location = useLocation();

    // helper to read query params
    const params = new URLSearchParams(location.search);
    const urlProjectId = params.get('projectId') || params.get('projectid') || '';
    const projectId = overrideProjectId || urlProjectId;

    const fetchTasks = () => {
        if (requireProject && !projectId) {
            setTasks([]);
            return Promise.resolve();
        }
        const url = projectId ? `/tasks?projectId=${encodeURIComponent(projectId)}` : '/tasks';
        return apiFetch(url)
            .then((res) => res.json())
            .then((data) => setTasks(data))
            .catch((err) => console.error('Failed to fetch tasks:', err));
    };

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const handleAddTask = (newTask, parent) => {
        const payloadBase = parent && parent._id ? { ...newTask, parentTask: parent._id } : newTask;
        const payload = projectId ? { ...payloadBase, project: projectId } : payloadBase;
        apiFetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then(() => fetchTasks())
            .catch((err) => console.error('Failed to add task:', err));
    };

    const handleEditTask = (updatedTask) => {
        apiFetch(`/tasks/${updatedTask._id || updatedTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
        })
            .then((res) => res.json())
            .then(() => fetchTasks())
            .catch((err) => console.error('Failed to update task:', err));
    };

    const handleDeleteTask = (taskId) => {
        apiFetch(`/tasks/${taskId}`, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then(() => fetchTasks())
            .catch((err) => console.error('Failed to delete task:', err));
    };

    return { tasks, handleAddTask, handleEditTask, handleDeleteTask, setTasks };
};