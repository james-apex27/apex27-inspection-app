import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { useInspection } from '../context/InspectionContext.jsx';
import { generateInspectionPDF } from '../utils/pdfGenerator.js';
import { CheckCircle, Download, RefreshCw, Home } from 'lucide-react';

export function Confirmation() {
  const navigate = useNavigate();
  const { state, resetInspection, setStep } = useInspection();

  useEffect(() => {
    setStep(7);
  }, [setStep]);

  const handleDownloadPDF = async () => {
    try {
      await generateInspectionPDF(state);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF');
    }
  };

  const handleStartNew = () => {
    resetInspection();
    navigate('/');
  };

  const totalPhotos = state.rooms.reduce((sum, room) => sum + room.photos.length, 0) +
    state.issues.reduce((sum, issue) => sum + issue.photos.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header title="Inspection Complete" />

      <div className="max-w-2xl mx-auto p-4 space-y-6 pt-8">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="text-green-600" size={64} />
          </div>
        </div>

        {/* Success message */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inspection Submitted!
          </h1>
          <p className="text-gray-600 mb-4">
            Your inspection has been successfully recorded and submitted to the system.
          </p>

          {state.listing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600">Property:</p>
              <p className="font-semibold text-gray-900">
                {state.listing.displayAddress || `${state.listing.address1}${state.listing.city ? ', ' + state.listing.city : ''}`}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(state.details.inspectionDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{state.rooms.length}</p>
            <p className="text-sm text-gray-600 mt-2">Rooms Inspected</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{totalPhotos}</p>
            <p className="text-sm text-gray-600 mt-2">Photos Captured</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{state.issues.length}</p>
            <p className="text-sm text-gray-600 mt-2">Issues Raised</p>
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3 text-sm">
          <div className="border-b border-gray-200 pb-3">
            <p className="text-gray-600">Inspector</p>
            <p className="font-semibold text-gray-900">{state.details.agentName}</p>
          </div>
          <div className="border-b border-gray-200 pb-3">
            <p className="text-gray-600">Inspection Type</p>
            <p className="font-semibold text-gray-900 capitalize">{state.details.inspectionType}</p>
          </div>
          <div>
            <p className="text-gray-600">Date & Time</p>
            <p className="font-semibold text-gray-900">
              {new Date(state.details.inspectionDate).toLocaleDateString()} at{' '}
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadPDF}
            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 active:bg-blue-700 transition-colors"
          >
            <Download size={20} />
            Download PDF Report
          </button>

          <button
            onClick={handleStartNew}
            className="w-full bg-green-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 active:bg-green-700 transition-colors"
          >
            <RefreshCw size={20} />
            Start New Inspection
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 active:bg-gray-50 transition-colors"
          >
            <Home size={20} />
            Back to Dashboard
          </button>
        </div>

        {/* Footer message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm text-green-800">
            All data has been securely stored. You can access this inspection from the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
