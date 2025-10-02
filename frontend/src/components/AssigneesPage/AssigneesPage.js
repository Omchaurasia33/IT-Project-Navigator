// components/AssigneesPage/AssigneesPage.js
import React, { useState } from "react";
import "./AssigneesPage.css";

const AssigneesPage = () => {
  const [assignees, setAssignees] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Developer" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Project Manager" },
  ]);

  const [newAssignee, setNewAssignee] = useState({ name: "", email: "", role: "" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", role: "" });

  // Add new assignee
  const handleAdd = () => {
    if (!newAssignee.name || !newAssignee.email || !newAssignee.role) return;
    setAssignees([...assignees, { id: Date.now(), ...newAssignee }]);
    setNewAssignee({ name: "", email: "", role: "" });
  };

  // Delete assignee
  const handleDelete = (id) => {
    setAssignees(assignees.filter((a) => a.id !== id));
  };

  // Start editing
  const handleEditStart = (assignee) => {
    setEditingId(assignee.id);
    setEditData({ ...assignee });
  };

  // Save edited data
  const handleEditSave = () => {
    setAssignees(
      assignees.map((a) => (a.id === editingId ? { ...a, ...editData } : a))
    );
    setEditingId(null);
    setEditData({ name: "", email: "", role: "" });
  };

  return (
    <div className="assignees-container">
      <h2>Assignees Management</h2>

      {/* Add Form */}
      <div className="add-form">
        <input
          type="text"
          placeholder="Name"
          value={newAssignee.name}
          onChange={(e) => setNewAssignee({ ...newAssignee, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newAssignee.email}
          onChange={(e) => setNewAssignee({ ...newAssignee, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Role"
          value={newAssignee.role}
          onChange={(e) => setNewAssignee({ ...newAssignee, role: e.target.value })}
        />
        <button onClick={handleAdd}>+ Add</button>
      </div>

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
              {editingId === assignee.id ? (
                <>
                  <td>
                    <input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editData.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    />
                  </td>
                  <td>
                    <button className="save" onClick={handleEditSave}>Save</button>
                    <button className="cancel" onClick={() => setEditingId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{assignee.name}</td>
                  <td>{assignee.email}</td>
                  <td>{assignee.role}</td>
                  <td>
                    <button className="edit" onClick={() => handleEditStart(assignee)}>Edit</button>
                    <button className="delete" onClick={() => handleDelete(assignee.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssigneesPage;
