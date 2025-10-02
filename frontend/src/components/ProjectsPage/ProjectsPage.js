// components/ProjectsPage/ProjectsPage.js
import React, { useState, useRef, useEffect } from "react";
import "./ProjectsPage.css";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Project Management Module",
      description: "Build internal PM tool with task tracking and sidebar navigation.",
      manager: "Alex Rivera",
      startDate: "2024-06-01",
      endDate: "2024-08-30",
      priority: "High",
      status: "In Progress",
      tasks: [
        { id: 1, title: "In App.js remove ProjectNavigator component", status: "To Do" },
        { id: 2, title: "Add sidebar component in App.js and create it", status: "To Do" },
        { id: 3, title: "Add 4 tabs in sidebar", status: "To Do" },
      ],
    },
    {
      id: 2,
      name: "Website Revamp",
      description: "Modernize company website for better UX and mobile responsiveness.",
      manager: "Samira Khan",
      startDate: "2024-07-01",
      endDate: "2024-09-15",
      priority: "Medium",
      status: "To Do",
      tasks: [
        { id: 1, title: "Update homepage UI", status: "To Do" },
        { id: 2, title: "Fix navigation issues", status: "In Progress" },
      ],
    },
  ]);

  const [expandedProject, setExpandedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" | "edit" | "delete"
  const [currentProject, setCurrentProject] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    manager: "",
    startDate: "",
    endDate: "",
    priority: "Medium",
  });

  const openAddModal = () => {
    setModalType("add");
    setForm({
      name: "",
      description: "",
      manager: "",
      startDate: "",
      endDate: "",
      priority: "Medium",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setModalType("edit");
    setCurrentProject(project);
    setForm({
      name: project.name,
      description: project.description,
      manager: project.manager,
      startDate: project.startDate,
      endDate: project.endDate,
      priority: project.priority,
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (project) => {
    setModalType("delete");
    setCurrentProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProject = () => {
    const { name, description, manager, startDate, endDate, priority } = form;
    if (!name.trim()) return;

    if (modalType === "add") {
      const newProject = {
        id: Date.now(),
        name: name.trim(),
        description: description.trim() || "No description provided.",
        manager: manager.trim() || "Unassigned",
        startDate,
        endDate,
        priority,
        status: "To Do",
        tasks: [],
      };
      setProjects([...projects, newProject]);
    } else if (modalType === "edit" && currentProject) {
      setProjects(
        projects.map((p) =>
          p.id === currentProject.id
            ? {
                ...p,
                name: name.trim(),
                description: description.trim() || "No description provided.",
                manager: manager.trim() || "Unassigned",
                startDate,
                endDate,
                priority,
              }
            : p
        )
      );
    }
    closeModal();
  };

  const handleDeleteProject = () => {
    if (!currentProject) return;
    setProjects(projects.filter((p) => p.id !== currentProject.id));
    closeModal();
  };

  return (
    <div className="projects-container">
      <h2>Projects</h2>
      <button onClick={openAddModal} className="add-project-btn">
        + Add Project
      </button>

      <div className="project-list">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isExpanded={expandedProject === project.id}
            onToggleExpand={() =>
              setExpandedProject(expandedProject === project.id ? null : project.id)
            }
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalType === "add"
                ? "Add New Project"
                : modalType === "edit"
                ? "Edit Project"
                : "Confirm Deletion"}
            </h3>

            {modalType === "delete" ? (
              <>
                <p>
                  Are you sure you want to delete <strong>"{currentProject?.name}"</strong>?
                  This action cannot be undone.
                </p>
                <div className="modal-actions">
                  <button onClick={handleDeleteProject} className="btn-delete">
                    Delete
                  </button>
                  <button onClick={closeModal} className="btn-cancel">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Project Manager</label>
                  <input
                    type="text"
                    name="manager"
                    value={form.manager}
                    onChange={handleInputChange}
                    placeholder="Enter project manager name"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" value={form.priority} onChange={handleInputChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Enter project description (optional)"
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleSaveProject} className="btn-save">
                    {modalType === "add" ? "Add Project" : "Save Changes"}
                  </button>
                  <button onClick={closeModal} className="btn-cancel">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted ProjectCard component with three-dot menu
const ProjectCard = ({ project, isExpanded, onToggleExpand, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="project-card group">
      <div className="project-header" onClick={onToggleExpand}>
        <div>
          <span className="project-name">{project.name}</span>
          <span className="project-manager"> • {project.manager}</span>
        </div>
        <div className="header-actions">
          <span className={`priority-badge priority-${project.priority.toLowerCase()}`}>
            {project.priority}
          </span>
          <span className={`status-badge status-${project.status.toLowerCase().replace(" ", "-")}`}>
            {project.status}
          </span>

          {/* Three-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="menu-button"
              aria-label="Project actions"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>

            {showMenu && (
              <div className="dropdown-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(project);
                    setShowMenu(false);
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project);
                    setShowMenu(false);
                  }}
                  className="delete-option"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="project-details">
          <p className="description">{project.description}</p>
          <div className="dates">
            <span>Start: {project.startDate || "—"} </span>
            <span>End: {project.endDate || "—"}</span>
          </div>
          <div className="task-section">
            <h4>Tasks</h4>
            {project.tasks.length > 0 ? (
              project.tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <span>{task.title}</span>
                  <span className={`task-status status-${task.status.toLowerCase().replace(" ", "-")}`}>
                    {task.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-tasks">No tasks yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;