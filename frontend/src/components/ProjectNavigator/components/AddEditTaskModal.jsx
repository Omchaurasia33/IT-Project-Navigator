import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../../lib/api';

const statuses = ['To Do', 'In Progress', 'Done', 'Canceled'];

const AddEditTaskModal = ({ task, parentId, onSave, onClose }) => {
	const isEditing = !!task;
	const initialTaskState = {
		title: '',
		status: 'To Do',
		assignee: 'Unassigned',
		assigneeId: '',
		priority: 'Medium',
		startDate: new Date().toISOString().split('T')[0],
		endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		avatar: 'https://picsum.photos/seed/8/40/40',
		comments: 0,
		// ...add other fields as needed
	};
	const [editedTask, setEditedTask] = useState(isEditing && task ? {
		...initialTaskState,
		...task,
		assigneeId: task.assigneeId ? String(task.assigneeId) : '',
		startDate: task.startDate ? task.startDate.slice(0, 10) : initialTaskState.startDate,
		endDate: task.endDate ? task.endDate.slice(0, 10) : initialTaskState.endDate,
	} : initialTaskState);

	// Prefill modal fields when editing
	const [searchParams] = useSearchParams();
	const projectId = searchParams.get('projectId') || searchParams.get('projectid');
	const [projectAssignees, setProjectAssignees] = useState([]);

	useEffect(() => {
		const load = async () => {
			try {
				// Load assignees for this project first
				if (projectId) {
					const resProj = await apiFetch(`/projects/${projectId}`);
					if (resProj.ok) {
						const proj = await resProj.json();
						const list = Array.isArray(proj?.assigneeIds) ? proj.assigneeIds : [];
						const normalized = list
							.map((a) => (typeof a === 'string' ? { _id: a, name: 'Unassigned' } : a))
							.filter(Boolean);
						setProjectAssignees(normalized);
					}
				}

				if (isEditing && task && (task._id || task.id)) {
					// Load individual task to prefill exactly as requested
					const res = await apiFetch(`/tasks/${task._id || task.id}`);
					if (res.ok) {
						const t = await res.json();
						setEditedTask({
							...initialTaskState,
							...t,
							assigneeId: t.assignee ? String(t.assignee) : '',
							startDate: t.startDate ? String(t.startDate).slice(0, 10) : initialTaskState.startDate,
							endDate: t.endDate ? String(t.endDate).slice(0, 10) : initialTaskState.endDate,
						});
						return;
					}
				}

				// Fallback to given task or new
				if (isEditing && task) {
					setEditedTask({
						...initialTaskState,
						...task,
						assigneeId: task.assigneeId ? String(task.assigneeId) : '',
						startDate: task.startDate ? task.startDate.slice(0, 10) : initialTaskState.startDate,
						endDate: task.endDate ? task.endDate.slice(0, 10) : initialTaskState.endDate,
					});
				} else if (!isEditing) {
					setEditedTask(initialTaskState);
				}
			} catch (e) {
				setEditedTask(isEditing && task ? { ...initialTaskState, ...task } : initialTaskState);
			}
		};
		load();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [task, isEditing, projectId]);

	const handleSave = () => {
		// If an assigneeId is selected, map it to name as well for UI; backend will store id via hook
		const payload = { ...editedTask };
		if (payload.assigneeId) {
			const found = projectAssignees.find((a) => a && String(a._id) === String(payload.assigneeId));
			if (found) payload.assignee = found.name;
		}
		onSave(payload, parentId);
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
						value={editedTask.assigneeId || ''}
						onChange={(e) => {
						const assigneeId = e.target.value;
						const found = projectAssignees.find((a) => a && String(a._id) === String(assigneeId));
						setEditedTask({ ...editedTask, assigneeId, assignee: found?.name || 'Unassigned' });
						}}
						className="w-full bg-background text-foreground rounded px-3 py-2 border border-input focus:border-ring focus:outline-none"
						>
						<option value="">Unassigned</option>
						{projectAssignees.map((a) => (
						<option key={String(a._id)} value={String(a._id)}>{a.name}</option>
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

export default AddEditTaskModal;
