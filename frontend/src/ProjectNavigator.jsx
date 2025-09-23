import React, { useState, useRef, useEffect } from 'react';
import './styles/project-navigator.css';

const statuses = ['To Do', 'In Progress', 'Done', 'Canceled'];
const assignees = ['Alice', 'Bob', 'Charlie', 'Unassigned'];

const AddEditTaskModal = ({ task, parentId, onSave, onClose }) => {
	const isEditing = !!task;
	const initialTaskState = {
		id: Date.now() + Math.random(),
		title: '',
		status: 'To Do',
		assignee: 'Unassigned',
		priority: 'Medium',
		startDate: new Date().toISOString().split('T')[0],
		endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		avatar: 'https://picsum.photos/seed/8/40/40',
		comments: 0,
		subtasks: [],
		// ...add other fields as needed
	};
	const [editedTask, setEditedTask] = useState(isEditing && task ? {
		...initialTaskState,
		...task,
		startDate: task.startDate ? task.startDate.slice(0, 10) : initialTaskState.startDate,
		endDate: task.endDate ? task.endDate.slice(0, 10) : initialTaskState.endDate,
	} : initialTaskState);

	// Prefill modal fields when editing
	useEffect(() => {
		if (isEditing && task) {
			setEditedTask({
				...initialTaskState,
				...task,
				startDate: task.startDate ? task.startDate.slice(0, 10) : initialTaskState.startDate,
				endDate: task.endDate ? task.endDate.slice(0, 10) : initialTaskState.endDate,
			});
		} else if (!isEditing) {
			setEditedTask(initialTaskState);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [task, isEditing]);

	const handleSave = () => {
		onSave(editedTask, parentId);
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-card rounded-lg p-6 w-96 max-w-90vw border border-border">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-card-foreground">
						{isEditing ? 'Edit Task' : 'Add Task'}
					</h3>
					<button
						onClick={onClose}
						className="text-muted-foreground hover:text-foreground"
					>
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
							className="h-5 w-5"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-card-foreground mb-1">
							Title
						</label>
						<input
							type="text"
							value={editedTask.title}
							onChange={(e) =>
								setEditedTask({ ...editedTask, title: e.target.value })
							}
							className="w-full bg-background text-foreground rounded px-3 py-2 border border-input focus:border-ring focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-card-foreground mb-1">
							Status
						</label>
						<select
							value={editedTask.status}
							onChange={(e) =>
								setEditedTask({ ...editedTask, status: e.target.value })
							}
							className="w-full bg-background text-foreground rounded px-3 py-2 border border-input focus:border-ring focus:outline-none"
						>
							{statuses.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-card-foreground mb-1">
							Assignee
						</label>
						<select
							value={editedTask.assignee}
							onChange={(e) =>
								setEditedTask({ ...editedTask, assignee: e.target.value })
							}
							className="w-full bg-background text-foreground rounded px-3 py-2 border border-input focus:border-ring focus:outline-none"
						>
							{assignees.map((assignee) => (
								<option key={assignee} value={assignee}>
									{assignee}
								</option>
							))}
						</select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-card-foreground mb-1">
								Start Date
							</label>
							<input
								type="date"
								value={editedTask.startDate}
								onChange={(e) =>
									setEditedTask({ ...editedTask, startDate: e.target.value })
								}
								className="w-full bg-background text-foreground rounded px-3 py-2 border border-input focus:border-ring focus:outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-card-foreground mb-1">
								End Date
							</label>
							<input
								type="date"
								value={editedTask.endDate}
								onChange={(e) =>
									setEditedTask({ ...editedTask, endDate: e.target.value })
								}
								className="w-full bg-background text-foreground rounded px-3 py-2 border border-input focus:border-ring focus:outline-none"
							/>
						</div>
					</div>
				</div>

				<div className="flex gap-3 mt-6">
					<button
						onClick={handleSave}
						className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary/90 transition-colors"
					>
						{isEditing ? 'Save Changes' : 'Add Task'}
					</button>
					<button
						onClick={onClose}
						className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded hover:bg-secondary/90 transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

const ProjectNode = ({
	node,
	depth = 0,
	onAddSubtask,
	onEdit,
	onDelete,
	onToggleExpand,
	expandedNodes,
}) => {
	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const isExpanded = expandedNodes.includes(node.id);
	const hasSubtasks = node.subtasks && node.subtasks.length > 0;

	const getStatusIcon = (status) => {
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

	const formatDate = (dateStr) => {
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

	return (
		<div className="group flex flex-col items-start rounded-lg transition-colors hover:bg-card/50">
			<div
				className="flex items-center w-full py-2 px-2"
				style={{ paddingLeft: `${depth * 1.5}rem` }}
			>
				{/* Expand/Collapse Button */}
				{hasSubtasks ? (
					<button
						className="w-6 h-6 mr-2"
						onClick={() => onToggleExpand(node.id)}
					>
						{isExpanded ? (
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
								className="h-4 w-4 transform rotate-180"
							>
								<path d="m6 9 6 6 6-6"></path>
							</svg>
						) : (
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
								className="h-4 w-4"
							>
								<path d="m6 9 6 6 6-6"></path>
							</svg>
						)}
					</button>
				) : (
					<div className="w-6 h-6 mr-2"></div>
				)}

				{/* Status Icon and Task Details */}
				<div className="flex items-center gap-2 flex-grow">
					{getStatusIcon(node.status)}
					<span className="font-medium">{node.title}</span>
					<span
						className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
							node.status === 'Done'
								? 'border-green-500 text-green-500'
								: node.status === 'In Progress'
								? 'border-blue-500 text-blue-500'
								: node.status === 'Canceled'
								? 'border-red-500 text-red-500'
								: 'border-gray-500 text-gray-500'
						}`}
					>
						{node.status}
					</span>
					<div className="text-muted-foreground flex items-center gap-1">
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
							<path d="M12 5v14"></path>
							<path d="m19 12-7 7-7-7"></path>
						</svg>
					</div>
				</div>

				{/* Date and Assignee */}
				<div className="flex items-center gap-2 ml-auto">
					<span className="text-sm text-muted-foreground hidden md:inline">
						{formatDate(node.endDate)}
					</span>
					{node.avatar ? (
						<div className="relative flex h-6 w-6 shrink-0 overflow-hidden rounded-full">
							<img
								className="aspect-square h-full w-full"
								src={node.avatar}
								alt={node.assignee}
							/>
						</div>
					) : (
						<div className="relative flex h-6 w-6 shrink-0 overflow-hidden rounded-full bg-muted">
							<span className="flex h-full w-full items-center justify-center rounded-full text-xs">
								{node.assignee.charAt(0)}
							</span>
						</div>
					)}

					{/* Menu Button */}
					<div className="relative" ref={menuRef}>
						<button
							onClick={() => setShowMenu(!showMenu)}
							className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
						>
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
								className="h-4 w-4"
							>
								<circle cx="12" cy="12" r="1"></circle>
								<circle cx="12" cy="5" r="1"></circle>
								<circle cx="12" cy="19" r="1"></circle>
							</svg>
						</button>

						{showMenu && (
							<div className="absolute right-0 mt-1 w-32 bg-card border border-border rounded shadow-lg z-10">
								<button
									onClick={() => {
										onAddSubtask(node.id);
										setShowMenu(false);
									}}
									className="w-full px-3 py-2 text-left text-sm text-card-foreground hover:bg-secondary transition-colors"
								>
									Add Subtask
								</button>
								<button
									onClick={() => {
										onEdit(node);
										setShowMenu(false);
									}}
									className="w-full px-3 py-2 text-left text-sm text-card-foreground hover:bg-secondary transition-colors"
								>
									Edit
								</button>
								<button
									onClick={() => {
										onDelete(node.id);
										setShowMenu(false);
									}}
									className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-secondary transition-colors"
								>
									Delete
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Subtasks */}
			{isExpanded && hasSubtasks && (
				<div className="w-full">
					{node.subtasks.map((subtask) => (
						<ProjectNode
							key={subtask.id}
							node={subtask}
							depth={depth + 1}
							onAddSubtask={onAddSubtask}
							onEdit={onEdit}
							onDelete={onDelete}
							onToggleExpand={onToggleExpand}
							expandedNodes={expandedNodes}
						/>
					))}
				</div>
			)}
		</div>
	);
};

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

    // Generate grid lines for better visual guidance
    const generateGridLines = () => {
        const lines = [];
        for (let i = 0; i < dateLabels.length; i++) {
            const position = (i / (dateLabels.length - 1)) * 100;
            lines.push(
                <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-border/30"
                    style={{ left: `${position}%` }}
                />
            );
        }
        return lines;
    };

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return days;
    };

    const getProgressColor = (task) => {
        if (task.status === 'Done') return 'text-green-600';
        if (task.status === 'In Progress') return 'text-blue-600';
        if (task.status === 'Canceled') return 'text-red-600';
        return 'text-gray-600';
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
							{/* Timeline header as grid */}
							<div className="flex-1 relative min-w-0 overflow-x-auto">
								<div
									className="grid"
									style={{
										gridTemplateColumns: `repeat(${dateLabels.length}, 80px)`,
										minWidth: `${dateLabels.length * 80}px`,
										position: 'relative',
									}}
								>
									{dateLabels.map((label, i) => (
										<div
											key={i}
											className={`text-center text-xs py-2 border-r border-border/30 last:border-r-0 font-medium ${
												isWeekend(label.date) ? 'bg-muted/20' : ''
											}`}
											style={{ minWidth: '80px', maxWidth: '80px', overflow: 'hidden', whiteSpace: 'nowrap' }}
										>
											{label.date.toLocaleDateString(undefined, label.format)}
										</div>
									))}
									{/* Today marker in header removed */}
								</div>
							</div>
						</div>
					</div>

					{/* Scrollable content as grid */}
					<div className="relative overflow-x-auto">
						<div
							className="grid"
							style={{
								gridTemplateColumns: `320px repeat(${dateLabels.length}, 80px)`,
								minWidth: `${dateLabels.length * 80 + 320}px`,
								position: 'relative',
							}}
						>
							{/* Task info column (left) */}
							<div className="flex flex-col">
								{flatTasks.map((task, idx) => {
									const duration = calculateDuration(task.startDate, task.endDate);
									const progressPercentage = task.status === 'Done' ? 100 :
										task.status === 'In Progress' ? 65 :
										task.status === 'Canceled' ? 0 : 25;
									const isOverdue = task.status !== 'Done' && new Date(task.endDate) < today;
									const statusStyles = getStatusStyles(task.status, isOverdue);
									return (
										<div
											key={task.id}
											className="flex items-center h-12 group hover:bg-muted/30 rounded-lg transition-colors duration-200 border-b border-border/30"
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
							{/* Timeline grid columns (right) */}
							{dateLabels.map((label, colIdx) => (
								<div key={colIdx} className="flex flex-col relative">
									{flatTasks.map((task, rowIdx) => {
										// Bar rendering logic
										const start = new Date(task.startDate);
										const end = new Date(task.endDate);
										const colDate = label.date;
										const nextColDate = dateLabels[colIdx + 1]?.date;
										const isBarStart = start <= colDate && end >= colDate && (colIdx === 0 || start > dateLabels[colIdx - 1].date);
										const isBarActive = start <= colDate && end >= colDate;
										const isBarEnd = end <= colDate && (colIdx === dateLabels.length - 1 || end < nextColDate);
										const isOverdue = task.status !== 'Done' && new Date(task.endDate) < today;
										const statusStyles = getStatusStyles(task.status, isOverdue);
										const duration = calculateDuration(task.startDate, task.endDate);
										const progressPercentage = task.status === 'Done' ? 100 :
											task.status === 'In Progress' ? 65 :
											task.status === 'Canceled' ? 0 : 25;
										// Only render bar in the columns it spans
										if (!isBarActive) return <div key={task.id} style={{ height: '48px' }} />;
										// Only render the bar at the start column
										if (isBarStart) {
											// Calculate how many columns the bar should span
											let span = 1;
											let i = colIdx + 1;
											while (i < dateLabels.length && end >= dateLabels[i].date) {
												span++;
												i++;
											}
											return (
												<div
													key={task.id}
													className="absolute h-5 rounded-md cursor-pointer transition-all duration-200 flex items-center px-2 shadow-sm z-30"
													style={{
														top: `${rowIdx * 48 + 6}px`,
														left: 0,
														width: `calc(${span} * 80px - 8px)`,
														...statusStyles,
														transform: hoveredTask === task.id ? 'translateY(-1px)' : 'translateY(0)',
														boxShadow: hoveredTask === task.id ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
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
														{span > 2 ? task.title : ''}
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
														<div
															className="absolute z-[100] bg-card border border-border rounded-lg shadow-xl p-4 min-w-72"
															style={{
																top: '-140px',
																left: '50%',
																transform: 'translateX(-50%)'
															}}
														>
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
															{/* Tooltip arrow */}
															<div className="absolute top-full left-1/2 transform -translate-x-1/2">
																<div className="w-3 h-3 bg-card border-r border-b border-border transform rotate-45"></div>
															</div>
														</div>
													)}
												</div>
											);
										}
										// Fill empty cell for bar span
										return <div key={task.id} style={{ height: '48px' }} />;
									})}
									{/* Today marker line spanning full height removed */}
								</div>
							))}
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

const ProjectNavigator = () => {
	const [view, setView] = useState('tree');
	const [tasks, setTasks] = useState([]);

	// Fetch tasks from backend API
	useEffect(() => {
		fetch('/tasks')
			.then((res) => res.json())
			.then((data) => setTasks(data))
			.catch((err) => console.error('Failed to fetch tasks:', err));
	}, []);
	const [statusFilter, setStatusFilter] = useState('all');
	const [assigneeFilter, setAssigneeFilter] = useState('all');
	const [editingTask, setEditingTask] = useState(null);
	const [addingToParentId, setAddingToParentId] = useState(null);
	const [expandedNodes, setExpandedNodes] = useState([1, 2]); // Initially expanded nodes
	const [isAddingRootTask, setIsAddingRootTask] = useState(false);

	// Calculate progress
	const calculateProgress = (nodes) => {
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

	const { total, completed } = calculateProgress(tasks);
	const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

	// Filter tasks based on selected filters
	const filterTasks = (taskList) => {
		return taskList.filter((task) => {
			const statusMatch =
				statusFilter === 'all' ||
				task.status.toLowerCase().replace(' ', '-') === statusFilter;
			const assigneeMatch =
				assigneeFilter === 'all' ||
				(assigneeFilter === 'user-1' && task.assignee === 'Alice') ||
				(assigneeFilter === 'user-2' && task.assignee === 'Bob') ||
				(assigneeFilter === 'user-3' && task.assignee === 'Charlie');

			// If task doesn't match, check if any subtasks match
			if (!statusMatch && !assigneeMatch) {
				if (task.subtasks && task.subtasks.length > 0) {
					const filteredSubtasks = filterTasks(task.subtasks);
					return filteredSubtasks.length > 0;
				}
				return false;
			}

			return true;
		});
	};

	const filteredTasks = filterTasks(tasks);

	const handleAddTask = (newTask, parentId) => {
		// Add new task or subtask via API
		const payload = parentId ? { ...newTask, parentId } : newTask;
		fetch('/tasks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})
			.then((res) => res.json())
			.then((data) => {
				// Refetch all tasks after add
				fetch('/tasks')
					.then((res) => res.json())
					.then((data) => setTasks(data));
				// Optionally expand the parent node if not already expanded
				if (parentId && !expandedNodes.includes(parentId)) {
					setExpandedNodes([...expandedNodes, parentId]);
				}
			})
			.catch((err) => console.error('Failed to add task:', err));
		setIsAddingRootTask(false);
		setAddingToParentId(null);
	};

	const handleEditTask = (updatedTask) => {
		fetch(`/tasks/${updatedTask.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updatedTask),
		})
			.then((res) => res.json())
			.then((data) => {
				// Refetch all tasks after edit
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
				// Refetch all tasks after delete
				fetch('/tasks')
					.then((res) => res.json())
					.then((data) => setTasks(data));
			})
			.catch((err) => console.error('Failed to delete task:', err));
	};

	const handleToggleExpand = (nodeId) => {
		if (expandedNodes.includes(nodeId)) {
			setExpandedNodes(expandedNodes.filter((id) => id !== nodeId));
		} else {
			setExpandedNodes([...expandedNodes, nodeId]);
		}
	};

	const openAddModal = (parentId = null) => {
		if (parentId) {
			setAddingToParentId(parentId);
			setIsAddingRootTask(false);
		} else {
			setIsAddingRootTask(true);
			setAddingToParentId(null);
		}
		setEditingTask(null);
	};

	const closeModal = () => {
		setEditingTask(null);
		setAddingToParentId(null);
		setIsAddingRootTask(false);
	};

	return (
		<div className="min-h-screen bg-background text-foreground font-body antialiased">
			<div className="container mx-auto p-4 md:p-8">
				{/* Header */}
				<header className="mb-8">
					<h1 className="text-4xl font-bold tracking-tight mb-2 font-headline">
						IT Project Navigator
					</h1>
					<div className="flex items-center gap-4">
						<div className="w-1/3 bg-secondary rounded-full h-4">
							<div
								className="bg-primary h-4 rounded-full transition-all duration-300"
								style={{ width: `${progressPercentage}%` }}
							></div>
						</div>
						<span className="text-sm text-muted-foreground">
							{completed} / {total} tasks completed
						</span>
					</div>
				</header>

				{/* Filters and Add Button */}
				<div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
					<div className="flex gap-4">
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-[180px] bg-background border border-input rounded-md h-10 px-3 text-sm"
						>
							<option value="all">All Statuses</option>
							<option value="todo">To Do</option>
							<option value="in-progress">In Progress</option>
							<option value="done">Done</option>
							<option value="canceled">Canceled</option>
						</select>
						<select
							value={assigneeFilter}
							onChange={(e) => setAssigneeFilter(e.target.value)}
							className="w-[180px] bg-background border border-input rounded-md h-10 px-3 text-sm"
						>
							<option value="all">All Assignees</option>
							<option value="user-1">Alice</option>
							<option value="user-2">Bob</option>
							<option value="user-3">Charlie</option>
						</select>
					</div>
					<button
						onClick={() => openAddModal()}
						className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
					>
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
							className="h-4 w-4"
						>
							<path d="M5 3v16"></path>
							<path d="m19 3-6 6"></path>
							<path d="m13 3 6 6"></path>
							<path d="M5 21v-2"></path>
						</svg>
						Add Task
					</button>
				</div>

				{/* View Toggle */}
				<div className="w-full">
					<div className="mb-4 inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
						<button
							onClick={() => setView('tree')}
							className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ${
								view === 'tree' ? 'bg-background text-foreground shadow-sm' : ''
							}`}
						>
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
								className="mr-2 h-4 w-4"
							>
								<path d="M10 3v18"></path>
								<path d="M14 3v18"></path>
								<path d="M3 8h18"></path>
								<path d="M3 16h18"></path>
							</svg>
							Tree View
						</button>
						<button
							onClick={() => setView('gantt')}
							className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ${
								view === 'gantt' ? 'bg-background text-foreground shadow-sm' : ''
							}`}
						>
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
								className="mr-2 h-4 w-4"
							>
								<path d="M3 3v18h18"></path>
								<path d="m18 9-5 5"></path>
								<path d="m17 14 4-4"></path>
							</svg>
							Gantt Chart
						</button>
					</div>

					{/* Content */}
					{view === 'tree' ? (
						<div
							id="tree-view"
							className="rounded-lg border bg-card text-card-foreground shadow-sm"
						>
							<div className="space-y-1 p-2">
								{filteredTasks.map((task) => (
									<ProjectNode
										key={task.id}
										node={task}
										onAddSubtask={openAddModal}
										onEdit={setEditingTask}
										onDelete={handleDeleteTask}
										onToggleExpand={handleToggleExpand}
										expandedNodes={expandedNodes}
									/>
								))}
								{filteredTasks.length === 0 && (
									<div className="p-4 text-center text-muted-foreground">
										No tasks match the current filters.
									</div>
								)}
							</div>
						</div>
					) : (
						<GanttChart tasks={filteredTasks} />
					)}
				</div>

				{/* Modal for adding/editing */}
				{(editingTask || addingToParentId !== null || isAddingRootTask) && (
					<AddEditTaskModal
						task={editingTask}
						parentId={addingToParentId}
						onSave={editingTask ? handleEditTask : handleAddTask}
						onClose={closeModal}
					/>
				)}
			</div>
		</div>
	);
};

export default ProjectNavigator;