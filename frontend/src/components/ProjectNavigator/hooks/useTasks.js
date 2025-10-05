import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const location = useLocation();

    // helper to read query params
    const params = new URLSearchParams(location.search);
    const projectId = params.get('projectId') || params.get('projectid') || '';

    const fetchTasks = () => {
        const url = projectId ? `/tasks?projectId=${encodeURIComponent(projectId)}` : '/tasks';
        return fetch(url)
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
        fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then(() => fetchTasks())
            .catch((err) => console.error('Failed to add task:', err));
    };

    const handleEditTask = (updatedTask) => {
        fetch(`/tasks/${updatedTask._id || updatedTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
        })
            .then((res) => res.json())
            .then(() => fetchTasks())
            .catch((err) => console.error('Failed to update task:', err));
    };

    const handleDeleteTask = (taskId) => {
        fetch(`/tasks/${taskId}`, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then(() => fetchTasks())
            .catch((err) => console.error('Failed to delete task:', err));
    };

    return { tasks, handleAddTask, handleEditTask, handleDeleteTask, setTasks };
};