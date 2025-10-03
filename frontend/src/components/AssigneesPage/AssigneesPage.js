// components/AssigneesPage/AssigneesPage.js
import React, { useState, useRef, useEffect } from "react";
import "./AssigneesPage.css";

const AssigneesPage = () => {
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" | "edit" | "delete"
  const [currentAssignee, setCurrentAssignee] = useState(null);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  // Fetch assignees on mount
  useEffect(() => {
    fetch('/assignees')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch assignees');
        return res.json();
      })
      .then((data) => {
        setAssignees(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch assignees:', err);
        setLoading(false);
      });
  }, []);

  // Open Add Modal
  const openAddModal = () => {
    setModalType("add");
    setForm({ name: "", email: "", role: "" });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (assignee) => {
    setModalType("edit");
    setCurrentAssignee(assignee);
    setForm({
      name: assignee.name,
      email: assignee.email,
      role: assignee.role,
    });
    setIsModalOpen(true);
  };

  // Open Delete Confirmation
  const openDeleteModal = (assignee) => {
    setModalType("delete");
    setCurrentAssignee(assignee);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAssignee(null);
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save (Add or Edit)
  const handleSave = () => {
    const { name, email, role } = form;
    if (!name.trim() || !email.trim() || !role.trim()) return;

    const payload = { name: name.trim(), email: email.trim(), role: role.trim() };

    if (modalType === "add") {
      fetch('/assignees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to add assignee');
          return res.json();
        })
        .then((newAssignee) => {
          setAssignees((prev) => [...prev, newAssignee]);
          closeModal();
        })
        .catch((err) => {
          console.error('Failed to add assignee:', err);
          alert('Failed to add assignee. Please try again.');
        });
    } else if (modalType === "edit" && currentAssignee) {
      fetch(`/assignees/${currentAssignee._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to update assignee');
          return res.json();
        })
        .then((updatedAssignee) => {
          setAssignees((prev) =>
            prev.map((a) => (a._id === updatedAssignee._id ? updatedAssignee : a))
          );
          closeModal();
        })
        .catch((err) => {
          console.error('Failed to update assignee:', err);
          alert('Failed to update assignee. Please try again.');
        });
    }
  };

  // Delete Assignee
  const handleDelete = () => {
    if (!currentAssignee) return;

    fetch(`/assignees/${currentAssignee._id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete assignee');
        return res.json();
      })
      .then(() => {
        setAssignees((prev) => prev.filter((a) => a._id !== currentAssignee._id));
        closeModal();
      })
      .catch((err) => {
        console.error('Failed to delete assignee:', err);
        alert('Failed to delete assignee. Please try again.');
      });
  };

  // Get unique roles for filter options
  const uniqueRoles = [...new Set(assignees.map(a => a.role))];

  // Filter assignees based on selected filters
  const filteredAssignees = assignees.filter(assignee => {
    const matchesRole = roleFilter === "All" || assignee.role === roleFilter;
    const matchesSearch = assignee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          assignee.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return <div className="assignees-container">Loading assignees...</div>;
  }

  return (
    <div className="assignees-container">
      <h2>Assignees Management</h2>

      {/* Filter row */}
      <div className="filter-row">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search assignees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        
        <button onClick={openAddModal} className="add-assignee-btn">
          + Add Assignee
        </button>
      </div>

      {/* Assignee Table */}
      <table className="assignees-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredAssignees.map((assignee) => (
            <AssigneeRow
              key={assignee._id}
              assignee={assignee}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalType === "add"
                ? "Add New Assignee"
                : modalType === "edit"
                ? "Edit Assignee"
                : "Confirm Deletion"}
            </h3>

            {modalType === "delete" ? (
              <>
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{currentAssignee?.name}</strong>?<br />
                  This may affect projects they are assigned to.
                </p>
                <div className="modal-actions">
                  <button onClick={handleDelete} className="btn-delete">
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
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    placeholder="e.g., Developer, PM"
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleSave} className="btn-save">
                    {modalType === "add" ? "Add Assignee" : "Save Changes"}
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

// Extracted row component with dropdown menu
const AssigneeRow = ({ assignee, onEdit, onDelete }) => {
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
    <tr className="group">
      <td>{assignee.name}</td>
      <td>{assignee.email}</td>
      <td>{assignee.role}</td>
      <td className="relative">
        <div ref={menuRef} className="inline-block relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-secondary transition-colors focus:outline-none"
            aria-label="More options"
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
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
              <button
                onClick={() => {
                  onEdit(assignee);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(assignee);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-gray-100 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default AssigneesPage;