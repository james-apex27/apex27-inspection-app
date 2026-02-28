import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { useInspection } from '../context/InspectionContext.jsx';
import { loadDraft, clearDraft } from '../utils/storage.js';
import { getInspections } from '../utils/api.js';
import { Plus, Trash2, RefreshCw, AlertCircle, Clock } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { resetInspection, state } = useInspection();
  const [draft, setDraft] = useState(null);
  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedDraft = loadDraft();
    if (savedDraft && savedDraft.listing) {
      setDraft(savedDraft);
    }

    const fetchInspections = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7); // Last 7 days

        const params = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };

        const result = await getInspections(params);
        if (Array.isArray(result)) {
          setRecentInspections(result.slice(0, 10));
        }
      } catch (err) {
        console.error('Failed to fetch inspections:', err);
        setError('Could not load recent inspections');
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, []);

  const handleStartNew = () => {
    resetInspection();
    navigate('/search');
  };

  const handleResume = () => {
    navigate('/inspection/details');
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setDraft(null);
    resetInspection();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { label: 'Booked', color: 'bg-blue-100 text-blue-800' },
      1: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      2: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };
    const s = statusMap[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.color}`}>{s.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header title="Dashboard" />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Logo */}
        <div className="text-center pt-4">
          <img src="/logo.svg" alt="Logo" className="h-16 mx-auto" />
        </div>

        {/* Resume Draft */}
        {draft && (
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-yellow-400 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Resume Draft</h3>
            <p className="text-sm text-gray-600 mb-3">
              {draft.listing?.displayAddress || draft.listing?.address1}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResume}
                className="flex-1 bg-yellow-400 text-gray-900 font-semibold py-2 px-4 rounded-lg active:bg-yellow-500 transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleDiscardDraft}
                className="bg-red-100 text-red-700 p-2 rounded-lg active:bg-red-200 transition-colors"
                aria-label="Discard draft"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Start New */}
        <button
          onClick={handleStartNew}
          className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 active:bg-blue-700 transition-colors text-lg"
        >
          <Plus size={24} />
          Start New Inspection
        </button>

        {/* Recent Inspections */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Inspections</h2>

          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw size={20} className="animate-spin text-blue-600" />
                <span className="text-gray-600">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-lg shadow-sm p-4 flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          ) : recentInspections.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Clock className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600 text-sm">No recent inspections</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentInspections.map((inspection) => (
                <div key={inspection.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {inspection.address || inspection.listing?.displayAddress || 'Property'}
                    </h3>
                    {getStatusBadge(inspection.status)}
                  </div>
                  <p className="text-xs text-gray-600">
                    {new Date(inspection.dtsInspection).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
