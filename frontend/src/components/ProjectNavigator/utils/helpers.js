import React from 'react';

export const getStatusIcon = (status) => {
    switch (status) {
        case 'Done':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-green-500"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            );
        case 'In Progress':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                >
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.88.99 6.62 2.62"></path>
                    <path d="M12 12H8"></path>
                </svg>
            );
        case 'Canceled':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-red-500"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            );
        default: // To Do
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                </svg>
            );
    }
};

export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
};

export const calculateProgress = (nodes) => {
    let total = 0;
    let completed = 0;

    const countTasks = (taskList) => {
        taskList.forEach((task) => {
            total++;
            if (task.status === 'Done') completed++;
            if (task.subtasks && task.subtasks.length > 0) {
                countTasks(task.subtasks);
            }
        });
    };

    countTasks(nodes);
    return { total, completed };
};
