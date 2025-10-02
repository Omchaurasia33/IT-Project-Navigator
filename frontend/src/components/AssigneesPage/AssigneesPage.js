// components/AssigneesPage/AssigneesPage.js
import React, { useState } from "react";
import "./AssigneesPage.css";

const AssigneesPage = () => {
  const [assignees, setAssignees] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Developer" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Project Manager" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" | "edit" | "delete"
  const [currentAssignee, setCurrentAssignee] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });

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

    if (modalType === "add") {
      setAssignees([
        ...assignees,
        { id: Date.now(), name: name.trim(), email: email.trim(), role: role.trim() },
      ]);
    } else if (modalType === "edit" && currentAssignee) {
      setAssignees(
        assignees.map((a) =>
          a.id === currentAssignee.id
            ? { ...a, name: name.trim(), email: email.trim(), role: role.trim() }
            : a
        )
      );
    }

    closeModal();
  };

  // Delete Assignee
  const handleDelete = () => {
    if (!currentAssignee) return;
    setAssignees(assignees.filter((a) => a.id !== currentAssignee.id));
    closeModal();
  };

  return (
    <div className="assignees-container">
      <h2>Assignees Management</h2>

      <button onClick={openAddModal} className="add-assignee-btn">
        + Add Assignee
      </button>

      {/* Assignee Table */}
      <table className="assignees-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignees.map((assignee) => (
            <tr key={assignee.id}>
              <td>{assignee.name}</td>
              <td>{assignee.email}</td>
              <td>{assignee.role}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => openEditModal(assignee)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => openDeleteModal(assignee)}
                >
                  Delete
                </button>
              </td>
            </tr>
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
                  <button onClick={closeModal} className="btn-cancel">
                    Cancel
                  </button>
                  <button onClick={handleDelete} className="btn-delete">
                    Delete
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
                  <button onClick={closeModal} className="btn-cancel">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="btn-save">
                    {modalType === "add" ? "Add Assignee" : "Save Changes"}
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

export default AssigneesPage;