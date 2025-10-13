// components/ProjectsPage/ProjectsPage.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { apiFetch } from "../../lib/api";
import "./ProjectsPage.css";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // State for Add Assignees modal
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  // Fetch projects and assignees for manager dropdown
  useEffect(() => {
    Promise.all([
      apiFetch('/projects').then(res => {
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
      }),
      apiFetch('/assignees').then(res => {
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
      managerId: (project.managerId && typeof project.managerId === 'object') ? (project.managerId._id || "") : (project.managerId || ""),
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

  const openAssignModal = async (project) => {
    setModalType("assign");
    setCurrentProject(project);
    // Refresh the assignee list when opening the modal
    try {
      const res = await apiFetch('/assignees');
      if (res.ok) {
        const list = await res.json();
        setAssigneesForFilter(list);
      }
    } catch (err) {
      console.error('Failed to refresh assignees:', err);
    }
    const preselectedRaw = Array.isArray(project?.assigneeIds)
      ? project.assigneeIds
      : Array.isArray(project?.assignees)
        ? project.assignees.map(a => (typeof a === 'string' ? a : a._id)).filter(Boolean)
        : [];
    const preselected = preselectedRaw.map(v => String((v && v._id) ? v._id : v)).filter(Boolean);
    setSelectedAssigneeIds(preselected);
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

  // Provide defaults for required fields
  const payload = {
    name: name.trim(),
    description: description.trim() || "No description provided",  // ✅ Default text
    managerId: managerId || null,
    startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),  // ✅ Default to today
    endDate: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 30*24*60*60*1000).toISOString(),  // ✅ Default to 30 days from now
    priority
  };

  // rest of the code...

    if (modalType === "add") {
      apiFetch('/projects', {
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
      // FIX: Changed fetch to apiFetch to include auth headers
      apiFetch(`/projects/${currentProject._id}`, {
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

    // FIX: Changed fetch to apiFetch to include auth headers
    apiFetch(`/projects/${currentProject._id}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete project');
        // DELETE might not return a body, check for that
        return res.status === 204 ? {} : res.json();
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

  // New functions for assignee assignment
  const toggleAssigneeSelection = (id) => {
    const key = String((id && id._id) ? id._id : id);
    setSelectedAssigneeIds(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    );
  };

  const handleSaveAssignees = () => {
    if (!currentProject) return;
    setAssignLoading(true);
    const p = currentProject;
    const payload = {
      name: p.name,
      description: p.description || "",
      managerId: p.managerId || null,
      startDate: p.startDate ? new Date(p.startDate).toISOString() : null,
      endDate: p.endDate ? new Date(p.endDate).toISOString() : null,
      priority: p.priority || "Medium",
      assigneeIds: selectedAssigneeIds,
    };

    // FIX: Changed fetch to apiFetch to include auth headers
    apiFetch(`/projects/${p._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update project assignees');
        return res.json();
      })
      .then(updatedProject => {
        setProjects(prev =>
          prev.map(pr => (pr._id === updatedProject._id ? updatedProject : pr))
        );
        setAssignLoading(false);
        closeModal();
      })
      .catch(err => {
        console.error('Failed to update project assignees:', err);
        setAssignLoading(false);
        alert('Failed to update project assignees. Please try again.');
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
    // Normalize managerId and resolve manager name whether populated or id
    const managerObj = (project.managerId && typeof project.managerId === 'object') ? project.managerId : null;
    const managerIdStr = managerObj ? String(managerObj._id) : (project.managerId ? String(project.managerId) : '');
    const managerFromDir = assigneesForFilter.find(a => String(a._id) === managerIdStr);
    return {
      ...project,
      managerName: managerObj?.name || managerFromDir?.name || "Unassigned",
      _managerIdStr: managerIdStr,
    };
  }).filter(project => {
    const statusMatch = statusFilter === "All" || (project.status || "To Do") === statusFilter;
    const managerIdStr = (project.managerId && typeof project.managerId === 'object') ? String(project.managerId._id) : (project.managerId ? String(project.managerId) : '');
    const assigneeMatch = assigneeFilter === "All" || 
      (assigneeFilter === "Unassigned" ? !managerIdStr : String(managerIdStr) === String(assigneeFilter));
    return statusMatch && assigneeMatch;
  });

  const handleViewTasks = (projectId) => {
    navigate(`/tasks?projectId=${projectId}`);
  };

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
            <option value="All">All Project Manager</option>
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
            onAddAssignees={openAssignModal}
            onViewTasks={handleViewTasks}
            assigneesDirectory={assigneesForFilter}
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
                : modalType === "assign"
                ? "Add Assignees"
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
            ) : modalType === "assign" ? (
              <>
                <div className="form-group">
                  <label>Select Assignees</label>
                  <div className="assignees-list">
                    {assigneesForFilter && assigneesForFilter.length > 0 ? (
                      assigneesForFilter.map((a) => (
                        <label key={a._id} className="assignee-item">
                          <input
                          type="checkbox"
                          style={{ width: '10%' }}
                          checked={selectedAssigneeIds.includes(String(a._id))}
                          onChange={() => toggleAssigneeSelection(a._id)}
                          />
                          <span>
                            {a.name}
                            {a.email ? ` • ${a.email}` : ''}
                            {a.role ? ` • ${a.role}` : ''}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p>Loading assignees...</p>
                    )}
                  </div>
                </div>
                <div className="modal-actions">
                  <button onClick={handleSaveAssignees} className="btn-save" disabled={assignLoading}>
                    {assignLoading ? 'Saving...' : 'Save Assignees'}
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
const ProjectCard = ({ project, isExpanded, onToggleExpand, onEdit, onDelete, onAddAssignees, onViewTasks, assigneesDirectory }) => {
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

  // Build normalized assignees list using directory
  const directory = Array.isArray(assigneesDirectory) ? assigneesDirectory : [];
  const rawAssignees = Array.isArray(project?.assigneeIds)
    ? project.assigneeIds
    : (Array.isArray(project?.assignees) ? project.assignees : []);
  const normalizedAssignees = rawAssignees.map((a) => {
    if (a && typeof a === 'object') return a;
    const found = directory.find((x) => String(x._id) === String(a));
    return found || null;
  }).filter(Boolean);
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  };

  return (
    <div className="project-card group">
      <div className="project-header" onClick={onToggleExpand}>
        <div>
          <span className="project-name">{project?.name ?? "Untitled Project"}</span>
          <span className="project-manager"> • {project.managerName}</span>
        </div>
        <div className="header-actions">
          <span className={`priority-badge priority-${((project?.priority ?? 'Medium') + '').toLowerCase()}`}>
            {project.priority || "Medium"}
          </span>
          <span className={`status-badge status-${((project?.status ?? "To Do") + "").toLowerCase().replace(/\s+/g, "-")}`}>
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
                    onAddAssignees(project);
                    setShowMenu(false);
                  }}
                >
                  Add Assignees
                </button>
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

          <div className="assignees-section">
            <div className="assignees-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Assignees</h4>
              <button
                className="manage-assignees-btn"
                onClick={(e) => { e.stopPropagation(); onAddAssignees(project); }}
              >
                Manage
              </button>
            </div>
            {normalizedAssignees.length > 0 ? (
              <ul className="assignees-grid" style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '8px' }}>
                {normalizedAssignees.map((a) => (
                  <li key={a._id} className="assignee-chip" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px' }} title={`${a.name}${a.email ? ' • ' + a.email : ''}${a.role ? ' • ' + a.role : ''}`}>
                    <div className="assignee-avatar" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--muted, #f3f4f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                      <span>{getInitials(a.name)}</span>
                    </div>
                    <div className="assignee-info" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className="assignee-name" style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</div>
                      {a.email && <div className="assignee-email" style={{ fontSize: 12, color: 'var(--muted-foreground, #6b7280)' }}>{a.email}</div>}
                      {a.role && <div className="assignee-role" style={{ fontSize: 12, color: 'var(--muted-foreground, #6b7280)' }}>{a.role}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-assignees" style={{ marginTop: 8 }}>No assignees yet</p>
            )}
          </div>

          <div className="actions-row">
            <button
              className="view-tasks-btn"
              onClick={(e) => { e.stopPropagation(); onViewTasks(project._id); }}
            >
              View Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;