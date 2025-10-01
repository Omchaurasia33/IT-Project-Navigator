import { useState, useEffect } from 'react';

export const useTasks = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetch('/tasks')
            .then((res) => res.json())
            .then((data) => setTasks(data))
            .catch((err) => console.error('Failed to fetch tasks:', err));
    }, []);

    const handleAddTask = (newTask, parent) => {
        const payload = parent && parent._id ? { ...newTask, parentTask: parent._id } : newTask;
        fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then((data) => {
                fetch('/tasks')
                    .then((res) => res.json())
                    .then((data) => setTasks(data));
            })
            .catch((err) => console.error('Failed to add task:', err));
    };

    const handleEditTask = (updatedTask) => {
        fetch(`/tasks/${updatedTask._id || updatedTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
        })
            .then((res) => res.json())
            .then((data) => {
                fetch('/tasks')
                    .then((res) => res.json())
                    .then((data) => setTasks(data));
            })
            .catch((err) => console.error('Failed to update task:', err));
    };

    const handleDeleteTask = (taskId) => {
        fetch(`/tasks/${taskId}`, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then((data) => {
                fetch('/tasks')
                    .then((res) => res.json())
                    .then((data) => setTasks(data));
            })
            .catch((err) => console.error('Failed to delete task:', err));
    };

    return { tasks, handleAddTask, handleEditTask, handleDeleteTask, setTasks };
};