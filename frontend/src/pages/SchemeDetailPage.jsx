import { useCallback, useEffect, useState } from "react";
import { downloadSchemeDoc } from "../utils/downloadSchemeDocs";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SchemeCard from "../components/SchemeCard";
import SchemeFormModal from "../components/SchemeFormModal";

export default function SchemeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchScheme = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}schemes/${id}/`);
      setScheme(res.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "This scheme could not be found."
          : "Could not load this scheme. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchScheme();
  }, [fetchScheme]);

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!toast) return;
    const timeoutId = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeoutId);
  }, [toast]);

  const handleSaved = () => {
    setModalOpen(false);
    setToast("Scheme updated successfully.");
    fetchScheme();
  };

  return (
    <div>
      <button
        onClick={() => navigate("/schemes")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0A2472] mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Schemes
      </button>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading scheme...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center py-20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && scheme && (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setModalOpen(true)}
              className="text-sm font-medium text-[#0A2472] border border-[#0A2472]/20 px-3 py-1.5 rounded-lg hover:bg-[#0A2472]/5 whitespace-nowrap"
            >
              Edit Scheme
            </button>
            <button
              onClick={() => downloadSchemeDoc(scheme)}
              className="ml-2 text-sm font-medium text-[#0A2472] border border-[#0A2472]/20 px-3 py-1.5 rounded-lg hover:bg-[#0A2472]/5 whitespace-nowrap"
            >
              Download Document
            </button>
          </div>

          <SchemeCard scheme={scheme} />
        </div>
      )}

      <SchemeFormModal
        open={modalOpen}
        scheme={scheme}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}