import React, { useState, useEffect } from 'react';

const statuses = ['To Do', 'In Progress', 'Done', 'Canceled'];
const assignees = ['Alice', 'Bob', 'Charlie', 'Unassigned'];

const AddEditTaskModal = ({ task, parentId, onSave, onClose }) => {
	const isEditing = !!task;
	const initialTaskState = {
		title: '',
		status: 'To Do',
		assignee: 'Unassigned',
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

export default AddEditTaskModal;
