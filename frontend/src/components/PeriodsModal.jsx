import { useEffect, useState } from "react";
import axios from "axios";
import { periodOptionLabel } from "../utils/timetableHelpers";

const EMPTY = { id: null, name: "", start_time: "", end_time: "", order: "" };

export default function PeriodsModal({ open, onClose, periods = [], onSaved }) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  const API = import.meta.env.VITE_API_URL;

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ id: p.id, name: p.name || "", start_time: p.start_time?.slice(0,5) || "", end_time: p.end_time?.slice(0,5) || "", order: String(p.order || "") });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY);
  };

  const handleChange = (field) => (e) => setForm((s) => ({ ...s, [field]: e.target.value }));

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name,
      start_time: form.start_time ? `${form.start_time}:00` : "",
      end_time: form.end_time ? `${form.end_time}:00` : "",
      order: form.order ? Number(form.order) : null,
    };

    try {
      if (editing) {
        await axios.put(`${API}timetable/periods/${form.id}/`, payload);
      } else {
        await axios.post(`${API}timetable/periods/`, payload);
      }

      resetForm();
      onSaved && onSaved();
    } catch (err) {
      setError(err?.response?.data || "Could not save period.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this period? This cannot be undone.")) return;
    setLoading(true);
    try {
      await axios.delete(`${API}timetable/periods/${id}/`);
      onSaved && onSaved();
    } catch (err) {
      setError("Could not delete period.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[760px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Manage Periods</h2>
          <div className="flex items-center gap-2">
            <button onClick={resetForm} className="text-sm px-3 py-1.5 bg-slate-100 rounded">New</button>
            <button onClick={onClose} className="text-sm px-3 py-1.5">Close</button>
          </div>
        </div>

        <div className="px-6 py-5">
          {error && <div className="mb-3 text-sm text-red-600">{String(error)}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <form onSubmit={submit} className="space-y-2">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Name</label>
                <input value={form.name} onChange={handleChange("name")} className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Start time</label>
                <input type="time" value={form.start_time} onChange={handleChange("start_time")} className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">End time</label>
                <input type="time" value={form.end_time} onChange={handleChange("end_time")} className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Order</label>
                <input type="number" value={form.order} onChange={handleChange("order")} className="w-full border rounded px-3 py-2" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={resetForm} className="px-3 py-2 text-sm">Reset</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-[#0A2472] text-white rounded">
                  {editing ? (loading ? "Saving..." : "Save") : (loading ? "Creating..." : "Create")}
                </button>
              </div>
            </form>

            <div>
              <div className="text-sm text-slate-600 mb-2">Existing periods</div>
              <div className="space-y-2">
                {periods.length === 0 && <div className="text-sm text-slate-400">No periods configured.</div>}
                {periods.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 border p-2 rounded">
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.start_time} — {p.end_time} · {p.order}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(p)} className="text-sm px-2 py-1 bg-slate-100 rounded">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-sm px-2 py-1 text-red-600">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
