import React, { useState, useEffect, useMemo } from 'react';
import './project-navigator.css';
import AddEditTaskModal from './components/AddEditTaskModal';
import ProjectNode from './components/ProjectNode';
import GanttChart from './components/GanttChart';
import { useTasks } from './hooks/useTasks';
import { calculateProgress } from './utils/helpers';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

const ProjectNavigator = () => {
	const [view, setView] = useState('tree');
	const { tasks, handleAddTask, handleEditTask, handleDeleteTask, setTasks } = useTasks(undefined, true);
	const [statusFilter, setStatusFilter] = useState('all');
	const [assigneeFilter, setAssigneeFilter] = useState('all');
	const [editingTask, setEditingTask] = useState(null);
	const [addingToParent, setAddingToParent] = useState(null);
	const [expandedNodes, setExpandedNodes] = useState([1, 2]); // Initially expanded nodes
	const [isAddingRootTask, setIsAddingRootTask] = useState(false);

	// Project selection support when no projectId in URL
	const navigate = useNavigate();
	const [projects, setProjects] = useState([]);
	const [projectsLoading, setProjectsLoading] = useState(false);
	const [selectedProjectId, setSelectedProjectId] = useState('');

	// Read projectId from URL and fetch project name for header
	const [searchParams] = useSearchParams();
	const projectId = searchParams.get('projectId') || searchParams.get('projectid');
	const [projectTitle, setProjectTitle] = useState('');
	const [projectAssignees, setProjectAssignees] = useState([]);

	useEffect(() => {
		if (!projectId) {
			setProjectTitle('');
			setProjectAssignees([]);
			setProjectsLoading(true);
			apiFetch('/projects')
				.then((res) => (res.ok ? res.json() : []))
				.then((list) => {
					setProjects(Array.isArray(list) ? list : []);
					setProjectsLoading(false);
				})
				.catch(() => {
					setProjects([]);
					setProjectsLoading(false);
				});
			return;
		}
		apiFetch(`/projects/${projectId}`)
			.then((res) => (res.ok ? res.json() : null))
			.then((proj) => {
				setProjectTitle(proj?.name || '');
				const list = Array.isArray(proj?.assigneeIds) ? proj.assigneeIds : [];
				const normalized = list
					.map((a) => (typeof a === 'string' ? { _id: a, name: 'Unassigned' } : a))
					.filter(Boolean);
				setProjectAssignees(normalized);
			})
			.catch(() => {
				setProjectTitle('');
				setProjectAssignees([]);
			});
	}, [projectId]);

	// Default to first project when options load and none selected yet
	useEffect(() => {
		if (!projectId && projects.length > 0 && !selectedProjectId) {
			setSelectedProjectId(String(projects[0]._id));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projects, projectId]);

	const { total, completed } = calculateProgress(tasks);
	const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

	const filterTasks = (taskList) => {
		const selectedAssigneeName =
			assigneeFilter !== 'all'
				? (projectAssignees.find((a) => String(a._id) === String(assigneeFilter))?.name || '')
				: '';

		return taskList.filter((task) => {
			const statusMatch =
				statusFilter === 'all' ||
				(task.status && task.status.toLowerCase().replace(' ', '-') === statusFilter);

			const assigneeMatch =
				assigneeFilter === 'all' ||
				(task.assigneeId && String(task.assigneeId) === String(assigneeFilter)) ||
				(task.assignee && selectedAssigneeName && task.assignee === selectedAssigneeName);

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

	const enhancedTasks = useMemo(() => {
		const resolveName = (assigneeId, fallbackName) => {
			if (!assigneeId) return fallbackName || '';
			const found = projectAssignees.find((a) => String(a._id) === String(assigneeId));
			return found?.name || fallbackName || '';
		};

		const mapTree = (list) =>
			list.map((t) => ({
				...t,
				assignee: resolveName(t.assigneeId, t.assignee),
				subtasks: t.subtasks ? mapTree(t.subtasks) : [],
			}));
		return mapTree(tasks || []);
	}, [tasks, projectAssignees]);

	const filteredTasks = filterTasks(enhancedTasks);

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

	// If no projectId in URL, show project selector UI
	if (!projectId) {
		return (
			<div className="min-h-screen bg-background text-foreground font-body antialiased">
				<div className="container mx-auto p-4 md:p-8">
					<header className="mb-8">
						<h1 className="text-4xl font-bold tracking-tight mb-2 font-headline">Select a Project</h1>
						<p className="text-muted-foreground">Choose a project to view its tasks.</p>
					</header>
					<div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
						<select
							value={selectedProjectId}
							onChange={(e) => setSelectedProjectId(e.target.value)}
							className="w-full sm:w-[360px] bg-background border border-input rounded-md h-10 px-3 text-sm"
							disabled={projectsLoading}
						>
							{projectsLoading && <option>Loading projects...</option>}
							{!projectsLoading && projects.length === 0 && <option>No projects available</option>}
							{!projectsLoading && projects.map((p) => (
								<option key={String(p._id)} value={String(p._id)}>{p.name}</option>
							))}
						</select>
						<button
							onClick={() => selectedProjectId && navigate(`/tasks?projectId=${selectedProjectId}`)}
							disabled={!selectedProjectId || projectsLoading}
							className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
						>
							View Tasks
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground font-body antialiased">
			<div className="container mx-auto p-4 md:p-8">
				<header className="mb-8">
					<h1 className="text-4xl font-bold tracking-tight mb-2 font-headline">
						{projectTitle || 'IT Project Navigator'}
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
						className="w-[220px] bg-background border border-input rounded-md h-10 px-3 text-sm"
						>
						<option value="all">All Assignees</option>
						{projectAssignees.map((a) => (
						<option key={a._id} value={a._id}>{a.name}</option>
						))}
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
						key={editingTask?._id || 'new'}
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
