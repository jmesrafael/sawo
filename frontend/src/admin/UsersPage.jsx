// src/admin/UsersPage.jsx
import React, { useEffect, useState } from "react";
import { apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser } from "../lib/api";
import { Toast, useToast, Field, Select, Btn, Modal, Confirm, PageShell, Badge, Card, EmptyState, C } from "./ui";

const F = "'Inter', 'Montserrat', system-ui, sans-serif";
const EMPTY = { username: "", full_name: "", email: "", password: "", role: "admin" };

export default function UsersPage({ currentUser }) {
  const { toasts, add, remove } = useToast();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [confirmDel, setConfirmDel] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const load = async () => {
    try { setUsers(await apiGetUsers()); }
    catch (err) { add(err.message, "error"); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowPass(false); setModalOpen(true); };
  const openEdit   = (row) => { setEditing(row); setForm({ username: row.username, full_name: row.full_name || "", email: row.email || "", password: "", role: row.role || "admin" }); setShowPass(false); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing && !form.username) return add("Username is required.", "error");
    if (!editing && (!form.password || form.password.length < 6)) return add("Password must be at least 6 characters.", "error");
    setLoading(true);
    try {
      if (editing) {
        const body = { full_name: form.full_name, email: form.email, role: form.role };
        if (form.password) body.password = form.password;
        await apiUpdateUser(editing.id, body);
        add("User updated.", "success");
      } else {
        await apiCreateUser({ username: form.username, full_name: form.full_name, email: form.email, password: form.password, role: form.role });
        add("User created.", "success");
      }
      closeModal(); load();
    } catch (err) { add(err.message, "error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try { await apiDeleteUser(confirmDel.id); add("User deleted.", "success"); }
    catch (err) { add(err.message, "error"); }
    finally { setConfirmDel(null); load(); }
  };

  return (
    <PageShell
      title="Users"
      subtitle="Manage admin accounts"
      action={<Btn icon="fa-user-plus" label="New User" onClick={openCreate} />}
    >
      <Toast toasts={toasts} remove={remove} />

      <Card>
        {users.length === 0
          ? <EmptyState icon="fa-users" title="No users yet" message="Create the first admin user." action={<Btn icon="fa-user-plus" label="New User" onClick={openCreate} />} />
          : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F, fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "#FAFAF8", borderBottom: `2px solid ${C.border}` }}>
                  {["Username", "Full Name", "Email", "Role", "Created", "Actions"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: h === "Actions" ? "right" : "left", color: C.textLight, fontWeight: 600, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FDFAF7"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <i className="fa-solid fa-user" style={{ color: C.textLight, fontSize: "0.7rem" }} />
                        </div>
                        <span style={{ fontWeight: 600, color: C.text }}>@{u.username}</span>
                        {u.id === currentUser?.id && <Badge label="You" color="blue" />}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", color: C.textMid }}>{u.full_name || "—"}</td>
                    <td style={{ padding: "10px 14px", color: C.textLight, fontSize: "0.78rem" }}>{u.email || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <Badge label={u.role} color={u.role === "admin" ? "brown" : "green"} />
                    </td>
                    <td style={{ padding: "10px 14px", color: C.textLight, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <Btn size="sm" icon="fa-pen" label="Edit" onClick={() => openEdit(u)} />
                        {u.id !== currentUser?.id && (
                          <Btn size="sm" icon="fa-trash" label="Delete" variant="danger" onClick={() => setConfirmDel(u)} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? `Edit @${editing.username}` : "New User"}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {!editing && (
            <Field label="Username" value={form.username} onChange={set("username")} placeholder="e.g. jcruz" required
              helper="Login username — lowercase, no spaces" />
          )}
          <Field label="Full Name" value={form.full_name} onChange={set("full_name")} placeholder="Juan Cruz" />
          <Field label="Email" type="email" value={form.email} onChange={set("email")} placeholder="Optional — for password reset reference" />

          {/* Password with show/hide */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: F }}>
              {editing ? "New Password" : "Password"}{!editing && <span style={{ color: C.danger, marginLeft: 3 }}>*</span>}
            </label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={form.password} onChange={set("password")}
                placeholder={editing ? "Leave blank to keep current" : "Min. 6 characters"}
                style={{ width: "100%", padding: "8px 36px 8px 10px", borderRadius: 6, border: `1.5px solid ${C.border}`, fontFamily: F, fontSize: "0.875rem", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textLight }}>
                <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
          </div>

          <Select label="Role" value={form.role} onChange={set("role")}
            options={[{ value: "admin", label: "Admin" }, { value: "user", label: "User" }]} />

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <Btn label="Cancel" variant="ghost" onClick={closeModal} />
            <Btn loading={loading} label={editing ? "Save Changes" : "Create User"} icon="fa-check" />
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        title="Delete User?"
        message={`Delete @${confirmDel?.username}? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </PageShell>
  );
}
