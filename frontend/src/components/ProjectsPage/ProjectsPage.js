// components/ProjectsPage/ProjectsPage.js
import React, { useState } from "react";
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

  // Form state (used for both add and edit)
  const [form, setForm] = useState({
    name: "",
    description: "",
    manager: "",
    startDate: "",
    endDate: "",
    priority: "Medium",
  });

  // Open Add Modal
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

  // Open Edit Modal
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

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save Project (Add or Edit)
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
      const updatedProjects = projects.map((p) =>
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
      );
      setProjects(updatedProjects);
    }

    closeModal();
  };

  // Delete Project
  const handleDeleteProject = () => {
    if (!currentProject) return;
    setProjects(projects.filter((p) => p.id !== currentProject.id));
    closeModal();
  };

  // Open Delete Confirmation
  const openDeleteModal = (project) => {
    setModalType("delete");
    setCurrentProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="projects-container">
      <h2>Projects</h2>

      {/* Add Project Button */}
      <button onClick={openAddModal} className="add-project-btn">
        + Add Project
      </button>

      {/* Project List */}
      <div className="project-list">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div
              className="project-header"
              onClick={() =>
                setExpandedProject(expandedProject === project.id ? null : project.id)
              }
            >
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(project);
                  }}
                  className="icon-btn edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(project);
                  }}
                  className="icon-btn delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>

            {expandedProject === project.id && (
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

export default ProjectsPage;