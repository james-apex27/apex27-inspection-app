import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { useInspection } from '../context/InspectionContext.jsx';
import { saveAgentName } from '../utils/storage.js';
import { ChevronRight } from 'lucide-react';

export function InspectionDetails() {
  const navigate = useNavigate();
  const { state, setStep, setDetails } = useInspection();

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  const handleDetailsChange = (field, value) => {
    setDetails({ [field]: value });
  };

  const handleAgentNameChange = (value) => {
    handleDetailsChange('agentName', value);
    saveAgentName(value);
  };

  const handleNext = () => {
    if (!state.details.agentName || !state.details.inspectionDate) {
      alert('Please fill in all required fields');
      return;
    }
    setStep(3);
    navigate('/inspection/rooms');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header
        title="Inspection Details"
        onBack={() => navigate('/search')}
      />
      <ProgressBar currentStep={2} />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Property info */}
        {state.listing && (
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
            <p className="text-xs text-gray-600 mb-1">Property</p>
            <p className="font-semibold text-gray-900">
              {state.listing.displayAddress || `${state.listing.address1}${state.listing.city ? ', ' + state.listing.city : ''}`}
            </p>
            {state.listing.reference && (
              <p className="text-sm text-gray-600 mt-1">Ref: {state.listing.reference}</p>
            )}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4">
          {/* Agent name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              value={state.details.agentName}
              onChange={(e) => handleAgentNameChange(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Inspection date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Inspection Date *
            </label>
            <input
              type="date"
              value={state.details.inspectionDate}
              onChange={(e) => handleDetailsChange('inspectionDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Inspection type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Inspection Type
            </label>
            <select
              value={state.details.inspectionType}
              onChange={(e) => handleDetailsChange('inspectionType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="routine">Routine</option>
              <option value="checkin">Check-in</option>
              <option value="checkout">Check-out</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={state.details.notes}
              onChange={(e) => handleDetailsChange('notes', e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            />
          </div>

          {/* Notify tenants */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="notifyTenants"
              checked={state.details.notifyTenants}
              onChange={(e) => handleDetailsChange('notifyTenants', e.target.checked)}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
            <label htmlFor="notifyTenants" className="flex-1 text-sm font-semibold text-gray-700 cursor-pointer">
              Notify tenants when inspection is complete
            </label>
          </div>
        </form>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 active:bg-blue-700 transition-colors mt-6"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
