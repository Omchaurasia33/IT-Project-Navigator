import React, { useState } from 'react';

const GanttChart = ({ tasks }) => {
    const [zoomLevel, setZoomLevel] = useState('weeks');
    const [hoveredTask, setHoveredTask] = useState(null);
    
    const getAllTasks = (tasks) => {
        let allTasks = [];
        const traverse = (taskList, depth = 0) => {
            taskList.forEach((task) => {
                allTasks.push({ ...task, depth });
                if (task.subtasks && task.subtasks.length > 0) {
                    traverse(task.subtasks, depth + 1);
                }
            });
        };
        traverse(tasks);
        return allTasks;
    };

    const flatTasks = getAllTasks(tasks);

    // Calculate date range with smart buffering
    if (flatTasks.length === 0) {
        return (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Gantt Chart</h3>
                    </div>
                    <div className="text-center py-12 text-muted-foreground">
                        <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p>No tasks to display in timeline</p>
                        <p className="text-sm mt-1">Add some tasks to see them in the Gantt chart</p>
                    </div>
                </div>
            </div>
        );
    }

    const dates = flatTasks.flatMap((task) => [new Date(task.startDate), new Date(task.endDate)]);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Smart buffering based on project duration
    const projectDuration = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    const bufferDays = Math.min(Math.max(projectDuration * 0.1, 3), 14);
    
    minDate.setDate(minDate.getDate() - bufferDays);
    maxDate.setDate(maxDate.getDate() + bufferDays);
    
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

    // Generate date labels with intelligent scaling
    const getDateLabels = () => {
        const labels = [];
        let step, format;
        
        switch (zoomLevel) {
            case 'days':
                step = 1;
                format = { month: 'short', day: 'numeric' };
                break;
            case 'weeks':
                step = 7;
                format = { month: 'short', day: 'numeric' };
                break;
            case 'months':
                step = 30;
                format = { month: 'short', year: '2-digit' };
                break;
            default:
                // Auto-scale based on total days
                if (totalDays <= 30) {
                    step = 1;
                    format = { month: 'short', day: 'numeric' };
                } else if (totalDays <= 90) {
                    step = 7;
                    format = { month: 'short', day: 'numeric' };
                } else if (totalDays <= 365) {
                    step = 14;
                    format = { month: 'short', day: 'numeric' };
                } else {
                    step = 30;
                    format = { month: 'short', year: '2-digit' };
                }
        }
        
        let current = new Date(minDate);
        while (current <= maxDate) {
            labels.push({ date: new Date(current), format });
            current.setDate(current.getDate() + step);
        }
        
        return labels;
    };

    const dateLabels = getDateLabels();

    // Calculate precise bar positioning
    const calculateBarPosition = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalRange = maxDate - minDate;
        
        const startOffset = Math.max(0, (start - minDate) / totalRange);
        const endOffset = Math.min(1, (end - minDate) / totalRange);
        
        return {
            left: `${startOffset * 100}%`,
            width: `${Math.max(0.5, (endOffset - startOffset) * 100)}%`
        };
    };

    const today = new Date();
    const todayPosition = ((today - minDate) / (maxDate - minDate)) * 100;

    // Enhanced status colors with gradients
    const getStatusStyles = (status, isOverdue = false) => {
        if (isOverdue) {
            return {
                backgroundColor: '#ef4444',
                borderLeft: '4px solid #dc2626',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            };
        }
        
        switch (status) {
            case 'Done':
                return {
                    backgroundColor: '#22c55e',
                    borderLeft: '4px solid #16a34a',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                };
            case 'In Progress':
                return {
                    backgroundColor: '#3b82f6',
                    borderLeft: '4px solid #2563eb',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                };
            case 'Canceled':
                return {
                    backgroundColor: '#f87171',
                    borderLeft: '4px solid #ef4444',
                    background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                    opacity: '0.7'
                };
            default: // To Do
                return {
                    backgroundColor: '#94a3b8',
                    borderLeft: '4px solid #64748b',
                    background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                };
        }
    };

    // Check if date is weekend
    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
                {/* Header with controls */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Gantt Chart</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">Zoom:</span>
                        <div className="inline-flex rounded-md border border-border">
                            {['days', 'weeks', 'months'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setZoomLevel(level)}
                                    className={`px-3 py-1 text-xs first:rounded-l-md last:rounded-r-md border-r border-border last:border-r-0 transition-colors ${
                                        zoomLevel === level
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background hover:bg-muted'
                                    }`}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {/* Sticky header */}
                    <div className="sticky top-0 bg-card z-30 border-b border-border pb-2 mb-4">
                        <div className="flex">
                            {/* Task column header */}
                            <div className="w-80 pr-6 flex items-center">
                                <span className="font-medium text-sm">Task</span>
                                <div className="ml-auto flex gap-4 text-xs text-muted-foreground">
                                    <span>Duration (days)</span>
                                </div>
                            </div>
                            {/* Timeline header */}
                            <div className="flex-1 relative min-w-0 overflow-x-auto">
                                <div
                                    className="flex"
                                    style={{
                                        minWidth: `${dateLabels.length * 80}px`,
                                    }}
                                >
                                    {dateLabels.map((label, i) => (
                                        <div
                                            key={i}
                                            className={`text-center text-xs py-2 border-r border-border/30 last:border-r-0 font-medium ${
                                                isWeekend(label.date) ? 'bg-muted/20' : ''
                                            }`}
                                            style={{ minWidth: '80px', flex: '0 0 80px' }}
                                        >
                                            {label.date.toLocaleDateString(undefined, label.format)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="relative overflow-x-auto">
                        <div className="flex">
                            {/* Task info column (left) */}
                            <div className="w-80 pr-6 flex-shrink-0">
                                {flatTasks.map((task, idx) => {
                                    const duration = calculateDuration(task.startDate, task.endDate);
                                    const isOverdue = task.status !== 'Done' && new Date(task.endDate) < today;
                                    const statusStyles = getStatusStyles(task.status, isOverdue);
                                    return (
                                        <div
                                            key={task.id}
                                            className="flex items-center group hover:bg-muted/30 rounded-lg transition-colors duration-200 border-b border-border/30"
                                            style={{ height: '48px' }}
                                        >
                                            <div className="flex-1 min-w-0" style={{ paddingLeft: `${task.depth * 1.5}rem` }}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusStyles.backgroundColor }} />
                                                    <span className={`font-medium text-sm truncate ${task.depth === 0 ? 'text-foreground' : 'text-muted-foreground'}`} title={task.title}>
                                                        {task.title}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 text-xs text-muted-foreground ml-2">
                                                <span className="w-12 text-right">{duration}d</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Timeline bars area */}
                            <div className="flex-1 relative" style={{ minWidth: `${dateLabels.length * 80}px` }}>
                                {/* Background grid lines */}
                                {dateLabels.map((label, i) => (
                                    <div
                                        key={`grid-${i}`}
                                        className={`absolute top-0 bottom-0 w-px ${isWeekend(label.date) ? 'bg-muted/40' : 'bg-border/30'}`}
                                        style={{ left: `${(i / (dateLabels.length - 1)) * 100}%` }}
                                    />
                                ))}
                                
                                {/* Task bars */}
                                {flatTasks.map((task, idx) => {
                                    const barPosition = calculateBarPosition(task.startDate, task.endDate);
                                    const isOverdue = task.status !== 'Done' && new Date(task.endDate) < today;
                                    const statusStyles = getStatusStyles(task.status, isOverdue);
                                    const duration = calculateDuration(task.startDate, task.endDate);
                                    const progressPercentage = task.status === 'Done' ? 100 :
                                        task.status === 'In Progress' ? 65 :
                                        task.status === 'Canceled' ? 0 : 25;
                                    
                                    return (
                                        <div
                                            key={task.id}
                                            className="absolute h-5 rounded-md cursor-pointer transition-all duration-200 flex items-center px-2 shadow-sm"
                                            style={{
                                                top: `${idx * 48 + 14}px`,
                                                left: barPosition.left,
                                                width: barPosition.width,
                                                ...statusStyles,
                                                transform: hoveredTask === task.id ? 'translateY(-1px)' : 'translateY(0)',
                                                boxShadow: hoveredTask === task.id ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
                                                zIndex: hoveredTask === task.id ? 50 : 10
                                            }}
                                            onMouseEnter={() => setHoveredTask(task.id)}
                                            onMouseLeave={() => setHoveredTask(null)}
                                            title={`${task.title}\nStatus: ${task.status}\nDuration: ${duration} days\nAssignee: ${task.assignee}`}
                                        >
                                            {/* Progress fill for in-progress tasks */}
                                            {task.status === 'In Progress' && (
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-white/20 rounded-l-md transition-all duration-300"
                                                    style={{ width: '65%' }}
                                                />
                                            )}
                                            <span className="text-white text-xs font-medium truncate z-10 relative">
                                                {task.title}
                                            </span>
                                            {task.avatar && (
                                                <img
                                                    src={task.avatar}
                                                    alt={task.assignee}
                                                    className="w-4 h-4 rounded-full ml-auto flex-shrink-0 border border-white/50"
                                                />
                                            )}
                                            {/* Enhanced tooltip on hover */}
                                            {hoveredTask === task.id && (
                                                <div className="absolute z-[100]" style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }}>
                                                    <div className="bg-card border border-border rounded-lg shadow-xl p-4 min-w-72">
                                                        <div className="space-y-2">
                                                            <div className="font-semibold text-foreground flex items-center gap-2">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: statusStyles.backgroundColor }}
                                                                />
                                                                {task.title}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                                                <div className="space-y-1">
                                                                    <div><span className="font-medium">Status:</span> {task.status}</div>
                                                                    <div><span className="font-medium">Assignee:</span> {task.assignee}</div>
                                                                    <div><span className="font-medium">Priority:</span> {task.priority || 'Medium'}</div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div><span className="font-medium">Duration:</span> {duration} days</div>
                                                                    <div><span className="font-medium">Progress:</span> {progressPercentage}%</div>
                                                                    <div><span className="font-medium">Start:</span> {new Date(task.startDate).toLocaleDateString()}</div>
                                                                </div>
                                                            </div>
                                                            <div className="pt-2 border-t border-border">
                                                                <div className="text-xs text-muted-foreground">
                                                                    <span className="font-medium">End:</span> {new Date(task.endDate).toLocaleDateString()}
                                                                    {isOverdue && (
                                                                        <span className="ml-2 text-red-500 font-medium">(Overdue)</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Tooltip arrow */}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                                        <div className="w-3 h-3 bg-card border-r border-b border-border transform rotate-45"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Legend with statistics */}
                    <div className="mt-8 pt-6 border-t border-border">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Status Legend */}
                            <div className="flex-1">
                                <h4 className="font-medium mb-3 text-sm">Status Legend</h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {[
                                        { status: 'To Do', color: '#94a3b8', count: flatTasks.filter(t => t.status === 'To Do').length },
                                        { status: 'In Progress', color: '#3b82f6', count: flatTasks.filter(t => t.status === 'In Progress').length },
                                        { status: 'Done', color: '#22c55e', count: flatTasks.filter(t => t.status === 'Done').length },
                                        { status: 'Canceled', color: '#f87171', count: flatTasks.filter(t => t.status === 'Canceled').length },
                                        { status: 'Overdue', color: '#ef4444', count: flatTasks.filter(t => t.status !== 'Done' && new Date(t.endDate) < today).length }
                                    ].map(({ status, color, count }) => (
                                        <div key={status} className="flex items-center gap-2 text-sm">
                                            <div
                                                className="w-4 h-4 rounded-sm flex-shrink-0"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="truncate">{status}</span>
                                            <span className="text-muted-foreground">({count})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Project Stats */}
                            <div className="lg:w-80">
                                <h4 className="font-medium mb-3 text-sm">Project Stats</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-foreground">{flatTasks.length}</div>
                                        <div className="text-muted-foreground">Total Tasks</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-blue-600">
                                            {Math.round(((flatTasks.filter(t => t.status === 'Done').length) / flatTasks.length) * 100) || 0}%
                                        </div>
                                        <div className="text-muted-foreground">Progress</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttChart;