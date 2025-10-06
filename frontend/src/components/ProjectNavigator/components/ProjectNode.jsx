import React, { useState, useRef, useEffect } from 'react';
import { getStatusIcon, formatDate } from '../utils/helpers';



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

	const isExpanded = expandedNodes.includes(node._id);
	const hasSubtasks = node.subtasks && node.subtasks.length > 0;

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
						onClick={() => onToggleExpand(node._id)}
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
							{node?.assignee ? node.assignee.charAt(0) : "?"}
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
										onAddSubtask(node);
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
										onDelete(node._id);
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
					{node.subtasks.filter(Boolean).map((subtask) => (
						<ProjectNode
							key={subtask._id}
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

export default ProjectNode;
