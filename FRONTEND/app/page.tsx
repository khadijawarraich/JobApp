"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Toaster, toast } from "sonner";
import { Draggable } from "./draggable";
import { Droppable } from "./droppable";
import { getApplications, updateApplicationStatus } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const board = ["Wishlist", "Applied", "Interviewing", "Offer", "Rejected"];

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const [form, setForm] = useState({
    companyName: "",
    jobTitle: "",
    location: "",
    jobLink: "",
    notes: "",
    status: "Wishlist",
  });

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (token) loadApplications();
  }, [token]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const result = await res.json();

    localStorage.setItem("token", result.token);
    setToken(result.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setData([]);
  };

  const loadApplications = async () => {
    const res = await getApplications();
    setData(res);
  };

  const addApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      toast.error("Failed to add application");
      return;
    }

    setForm({
      companyName: "",
      jobTitle: "",
      location: "",
      jobLink: "",
      notes: "",
      status: "Wishlist",
    });

    await loadApplications();
    toast.success("Application added");
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const appId = String(active.id);
    const newStatus = String(over.id);

    const application = data.find((item) => item._id === appId);
    if (!application || application.status === newStatus) return;

    await updateApplicationStatus(appId, newStatus);

    setData((prev) =>
      prev.map((item) =>
        item._id === appId ? { ...item, status: newStatus } : item
      )
    );
  };

  if (!token) {
    return (
      <main className="loginPage">
        <Toaster />
        <form onSubmit={login} className="loginBox">
          <h1>Job Tracker Login</h1>
          <input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button>Login</button>
        </form>
        <Styles />
      </main>
    );
  }

  return (
    <main className="page">
      <Toaster />

      <div className="topBar">
        <h1>Job Application Kanban Board</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <form onSubmit={addApplication} className="form">
        <input
          placeholder="Company Name"
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          required
        />
        <input
          placeholder="Job Title"
          value={form.jobTitle}
          onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          required
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          placeholder="Job Link"
          value={form.jobLink}
          onChange={(e) => setForm({ ...form, jobLink: e.target.value })}
        />
        <input
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="Wishlist">Wishlist</option>
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button>Add Application</button>
      </form>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          {board.map((status) => (
            <Droppable key={status} id={status}>
              <div className="column">
                <h2>
                  {status} {data.filter((item) => item.status === status).length}
                </h2>

                {data
                  .filter((item) => item.status === status)
                  .map((item) => (
                    <Draggable key={item._id} id={item._id}>
                      <JobCard data={item} refresh={loadApplications} />
                    </Draggable>
                  ))}
              </div>
            </Droppable>
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <JobCard data={data.find((item) => item._id === activeId)} refresh={loadApplications} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Styles />
    </main>
  );
}

function JobCard({ data, refresh }: { data: any; refresh: () => void }) {
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    companyName: data.companyName || "",
    jobTitle: data.jobTitle || "",
    location: data.location || "",
    jobLink: data.jobLink || "",
    notes: data.notes || "",
    status: data.status || "Wishlist",
  });

  if (!data) return null;

  const deleteApp = async () => {
    const confirmDelete = confirm("Delete this application?");
    if (!confirmDelete) return;

    await fetch(`${API_URL}/applications/${data._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    refresh();
    toast.success("Application deleted");
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`${API_URL}/applications/${data._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(editForm),
    });

    setIsEditing(false);
    refresh();
    toast.success("Application updated");
  };

  return (
    <>
      <div className="card">
        <h3>{data.companyName}</h3>
        <p>{data.jobTitle}</p>
        <p>{data.location}</p>
        {data.notes && <p>{data.notes}</p>}
        {data.jobLink && (
          <a href={data.jobLink} target="_blank">
            Job Link
          </a>
        )}

        <div className="cardActions" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            onPointerDown={(e) => e.stopPropagation()}
            className="editBtn"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={deleteApp}
            onPointerDown={(e) => e.stopPropagation()}
            className="deleteBtn"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing && (
        <div
            className="modalOverlay"
            onPointerDown={(e) => e.stopPropagation()}
        >
          <form className="editModal" onSubmit={saveEdit}>
            <h2>Edit Application</h2>

            <input
              placeholder="Company Name"
              value={editForm.companyName}
              onChange={(e) =>
                setEditForm({ ...editForm, companyName: e.target.value })
              }
            />

            <input
              placeholder="Job Title"
              value={editForm.jobTitle}
              onChange={(e) =>
                setEditForm({ ...editForm, jobTitle: e.target.value })
              }
            />

            <input
              placeholder="Location"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
            />

            <input
              placeholder="Job Link"
              value={editForm.jobLink}
              onChange={(e) =>
                setEditForm({ ...editForm, jobLink: e.target.value })
              }
            />

            <textarea
              placeholder="Notes"
              value={editForm.notes}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
            />

            <select
              value={editForm.status}
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value })
              }
            >
              <option value="Wishlist">Wishlist</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>

            <div className="modalButtons">
              <button type="submit" className="saveBtn">
                Save
              </button>
              <button
                type="button"
                className="cancelBtn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}


function Styles() {
  return (
    <style jsx global>{`
      body {
        margin: 0;
        background: #1a2238;
        color: white;
        font-family: Arial, sans-serif;
      }

      .page {
        min-height: 100vh;
        padding: 35px;
        max-width: 1300px;
        margin: auto;
      }

      .topBar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
      }

      .topBar h1 {
        color: #c084fc;
        font-size: 24px;
      }

      button {
        background: #8b5cf6;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 14px;
        cursor: pointer;
      }

      .form {
        background: #191a23;
        border: 1px solid #292a37;
        border-radius: 10px;
        padding: 15px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 30px;
      }

      .form input,
      .form select,
      .loginBox input {
        padding: 10px;
        border-radius: 6px;
        border: none;
      }

      .board {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 14px;
      }

      .column {
        background: #191a23;
        border: 1px solid #292a37;
        border-radius: 8px;
        min-height: 550px;
        padding: 12px;
      }

      .column h2 {
        font-size: 14px;
        margin-bottom: 15px;
        color: #c084fc;
      }

      .card {
        background: #1d1e2b;
        border: 1px solid #313248;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        cursor: grab;
      }

      .card h3 {
        margin: 0 0 6px;
        font-size: 15px;
      }

      .card p {
        margin: 4px 0;
        color: #d1d5db;
        font-size: 13px;
      }

      .card a {
        color: #60a5fa;
        font-size: 13px;
      }

      .loginPage {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .loginBox {
        background: #191a23;
        padding: 30px;
        border-radius: 12px;
        border: 1px solid #292a37;
        width: 330px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .loginBox h1 {
        text-align: center;
        color: #c084fc;
      }
      
      .cardActions {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }

    .cardActions button {
      font-size: 12px;
      padding: 6px 8px;
      cursor: pointer;
    }

    .editBtn {
      background: #3b82f6;
    }

    .deleteBtn {
      background: #ef4444;
    }

    .modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.editModal {
  background: #191a23;
  border: 1px solid #313248;
  border-radius: 12px;
  padding: 24px;
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editModal h2 {
  color: #c084fc;
  margin-top: 0;
  text-align: center;
}

.editModal input,
.editModal textarea,
.editModal select {
  padding: 10px;
  border-radius: 6px;
  border: none;
  background: white;
  color: black;
}

.editModal textarea {
  min-height: 90px;
  resize: vertical;
}

.modalButtons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.saveBtn {
  background: #8b5cf6;
  flex: 1;
}

.cancelBtn {
  background: #6b7280;
  flex: 1;
}
    `}</style>
  );
}