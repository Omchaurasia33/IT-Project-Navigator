import React, { useState } from 'react';
import './project-navigator.css';
import AddEditTaskModal from './components/AddEditTaskModal';
import ProjectNode from './components/ProjectNode';
import GanttChart from './components/GanttChart';
import { useTasks } from './hooks/useTasks';
import { calculateProgress } from './utils/helpers';

const ProjectNavigator = () => {
	const [view, setView] = useState('tree');
	const { tasks, handleAddTask, handleEditTask, handleDeleteTask, setTasks } = useTasks();
	const [statusFilter, setStatusFilter] = useState('all');
	const [assigneeFilter, setAssigneeFilter] = useState('all');
	const [editingTask, setEditingTask] = useState(null);
	const [addingToParent, setAddingToParent] = useState(null);
	const [expandedNodes, setExpandedNodes] = useState([1, 2]); // Initially expanded nodes
	const [isAddingRootTask, setIsAddingRootTask] = useState(false);

	const { total, completed } = calculateProgress(tasks);
	const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

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

	const onAddTask = (newTask, parent) => {
		handleAddTask(newTask, parent);
		if (parent && parent._id && !expandedNodes.includes(parent._id)) {
			setExpandedNodes([...expandedNodes, parent._id]);
		}
		setIsAddingRootTask(false);
		setAddingToParent(null);
	};

	const handleToggleExpand = (nodeId) => {
		if (expandedNodes.includes(nodeId)) {
			setExpandedNodes(expandedNodes.filter((id) => id !== nodeId));
		} else {
			setExpandedNodes([...expandedNodes, nodeId]);
		}
	};

	const openAddModal = (parent = null) => {
		if (parent) {
			setAddingToParent(parent);
			setIsAddingRootTask(false);
		} else {
			setIsAddingRootTask(true);
			setAddingToParent(null);
		}
		setEditingTask(null);
	};

	const closeModal = () => {
		setEditingTask(null);
		setAddingToParent(null);
		setIsAddingRootTask(false);
	};

	return (
		<div className="min-h-screen bg-background text-foreground font-body antialiased">
			<div className="container mx-auto p-4 md:p-8">
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

					{view === 'tree' ? (
						<div
							id="tree-view"
							className="rounded-lg border bg-card text-card-foreground shadow-sm"
						>
							<div className="space-y-1 p-2">
								{filteredTasks.map((task) => (
									<ProjectNode
										key={task._id}
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

				{(editingTask || addingToParent !== null || isAddingRootTask) && (
					<AddEditTaskModal
						task={editingTask}
						parentId={addingToParent}
						onSave={editingTask ? handleEditTask : onAddTask}
						onClose={closeModal}
					/>
				)}
			</div>
		</div>
	);
};

export default ProjectNavigator;
