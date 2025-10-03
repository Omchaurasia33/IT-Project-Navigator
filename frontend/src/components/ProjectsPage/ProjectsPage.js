// components/ProjectsPage/ProjectsPage.js
import React, { useState, useRef, useEffect } from "react";
import "./ProjectsPage.css";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedProject, setExpandedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" | "edit" | "delete"
  const [currentProject, setCurrentProject] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    managerId: "",
    startDate: "",
    endDate: "",
    priority: "Medium",
  });

  // Fetch projects and assignees for manager dropdown
  useEffect(() => {
    Promise.all([
      fetch('/projects').then(res => {
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
      }),
      fetch('/assignees').then(res => {
        if (!res.ok) throw new Error('Failed to fetch assignees');
        return res.json();
      })
    ])
      .then(([fetchedProjects, fetchedAssignees]) => {
        setProjects(fetchedProjects);
        setAssigneesForFilter(fetchedAssignees);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);

  const [assigneesForFilter, setAssigneesForFilter] = useState([]);

  const openAddModal = () => {
    setModalType("add");
    setForm({
      name: "",
      description: "",
      managerId: "",
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
      description: project.description || "",
      managerId: project.managerId || "",
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
      priority: project.priority || "Medium",
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
    const { name, description, managerId, startDate, endDate, priority } = form;
    if (!name.trim()) return;

    // Convert dates to ISO strings if provided
    const payload = {
      name: name.trim(),
      description: description.trim() || "",
      managerId: managerId || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      priority,
      assigneeIds: [], // You can extend this later with multi-select
    };

    if (modalType === "add") {
      fetch('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to add project');
          return res.json();
        })
        .then(newProject => {
          setProjects(prev => [...prev, newProject]);
          closeModal();
        })
        .catch(err => {
          console.error('Failed to add project:', err);
          alert('Failed to add project. Please try again.');
        });
    } else if (modalType === "edit" && currentProject) {
      fetch(`/projects/${currentProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update project');
          return res.json();
        })
        .then(updatedProject => {
          setProjects(prev =>
            prev.map(p => (p._id === updatedProject._id ? updatedProject : p))
          );
          closeModal();
        })
        .catch(err => {
          console.error('Failed to update project:', err);
          alert('Failed to update project. Please try again.');
        });
    }
  };

  const handleDeleteProject = () => {
    if (!currentProject) return;

    fetch(`/projects/${currentProject._id}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete project');
        return res.json();
      })
      .then(() => {
        setProjects(prev => prev.filter(p => p._id !== currentProject._id));
        closeModal();
      })
      .catch(err => {
        console.error('Failed to delete project:', err);
        alert('Failed to delete project. Please try again.');
      });
  };

  // Get unique statuses and managers for filter options
  const uniqueStatuses = [...new Set(projects.map(p => p.status || "To Do"))];
  
  const uniqueManagers = assigneesForFilter.map(a => ({
    id: a._id,
    name: a.name
  }));

  // Filter projects based on selected filters
  const filteredProjects = projects.map(project => {
    // Resolve manager name for display
    const managerAssignee = assigneesForFilter.find(a => a._id === project.managerId);
    return {
      ...project,
      managerName: managerAssignee ? managerAssignee.name : "Unassigned"
    };
  }).filter(project => {
    const statusMatch = statusFilter === "All" || (project.status || "To Do") === statusFilter;
    const assigneeMatch = assigneeFilter === "All" || 
      (assigneeFilter === "Unassigned" ? !project.managerId : project.managerId === assigneeFilter);
    return statusMatch && assigneeMatch;
  });

  if (loading) {
    return <div className="projects-container">Loading projects...</div>;
  }

  return (
    <div className="projects-container">
      <h2>Projects</h2>
      
      {/* Filter row */}
      <div className="filter-row">
        <div className="filter-group">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select 
            value={assigneeFilter} 
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Assignees</option>
            <option value="Unassigned">Unassigned</option>
            {uniqueManagers.map(manager => (
              <option key={manager.id} value={manager.id}>{manager.name}</option>
            ))}
          </select>
        </div>
        
        <button onClick={openAddModal} className="add-project-btn">
          + Add Project
        </button>
      </div>

      <div className="project-list">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            isExpanded={expandedProject === project._id}
            onToggleExpand={() =>
              setExpandedProject(expandedProject === project._id ? null : project._id)
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
                  <select
                    name="managerId"
                    value={form.managerId}
                    onChange={handleInputChange}
                  >
                    <option value="">Unassigned</option>
                    {assigneesForFilter.map(assignee => (
                      <option key={assignee._id} value={assignee._id}>
                        {assignee.name}
                      </option>
                    ))}
                  </select>
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
          <span className="project-manager"> • {project.managerName}</span>
        </div>
        <div className="header-actions">
          <span className={`priority-badge priority-${project.priority?.toLowerCase() || 'medium'}`}>
            {project.priority || "Medium"}
          </span>
          <span className={`status-badge status-${(project.status || "To Do").toLowerCase().replace(" ", "-")}`}>
            {project.status || "To Do"}
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
          <p className="description">{project.description || "No description provided."}</p>
          <div className="dates">
            <span>Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"} </span>
            <span>End: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</span>
          </div>
          <div className="task-section">
            <h4>Tasks</h4>
            {project.tasks && project.tasks.length > 0 ? (
              project.tasks.map((task) => (
                <div key={task._id} className="task-item">
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