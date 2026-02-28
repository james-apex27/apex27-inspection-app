import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { useInspection } from '../context/InspectionContext.jsx';
import {
  createInspection,
  updateInspection,
  uploadInspectionMedia,
  createIssue,
  uploadIssueMedia,
  sendNotification,
} from '../utils/api.js';
import { generateInspectionPDF } from '../utils/pdfGenerator.js';
import { ChevronRight, AlertCircle, Loader } from 'lucide-react';

export function ReviewSubmit() {
  const navigate = useNavigate();
  const { state, setStep, setSubmitted } = useInspection();
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  const getConditionLabel = (condition) => {
    const labels = {
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      na: 'N/A',
    };
    return labels[condition] || '';
  };

  const getConditionColor = (condition) => {
    const colors = {
      good: 'bg-green-100 text-green-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
      na: 'bg-gray-100 text-gray-800',
    };
    return colors[condition] || '';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || '';
  };

  const handleSubmit = async () => {
    if (!state.listing || !state.listing.id) {
      setError('Missing listing information');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const listingId = state.listing.id;

      // 1. Create inspection record
      setSubmitStatus('Creating inspection record...');
      const inspectionData = {
        dtsInspection: state.details.inspectionDate,
        status: 0,
        notes: state.details.notes,
        notifyTenants: state.details.notifyTenants,
        userId: null,
      };

      const inspectionResponse = await createInspection(listingId, inspectionData);
      const inspectionId = inspectionResponse.id;

      // 2. Upload room photos
      setSubmitStatus('Uploading room photos...');
      for (const room of state.rooms) {
        for (const photo of room.photos) {
          try {
            await uploadInspectionMedia(listingId, inspectionId, photo);
          } catch (e) {
            console.error('Failed to upload room photo:', e);
          }
        }
      }

      // 3. Update inspection status to completed
      setSubmitStatus('Finalizing inspection...');
      await updateInspection(listingId, inspectionId, {
        ...inspectionData,
        status: 1,
      });

      // 4. Create issues
      setSubmitStatus('Recording maintenance issues...');
      const priorityMap = { low: 1, medium: 2, high: 3, urgent: 3 };
      for (const issue of state.issues) {
        const issueData = {
          type: 12, // Miscellaneous
          status: 0, // New
          reportedSource: 4, // Visit (physical inspection)
          notes: issue.description || 'Issue identified during inspection',
          progressNotes: issue.room ? `Location: ${issue.room}` : '',
          priority: priorityMap[issue.priority] || 2,
        };

        const issueResponse = await createIssue(listingId, issueData);
        const issueId = issueResponse.id;

        // Upload issue photos
        for (const photo of issue.photos) {
          try {
            await uploadIssueMedia(listingId, issueId, photo);
          } catch (e) {
            console.error('Failed to upload issue photo:', e);
          }
        }
      }

      // 5. Send notification
      setSubmitStatus('Sending notifications...');
      try {
        await sendNotification({
          listingId,
          title: 'Inspection Completed',
          body: `Inspection completed for ${state.listing.displayAddress || state.listing.address1} by ${state.details.agentName}`,
          icon: 'clipboard-check',
        });
      } catch (e) {
        console.error('Failed to send notification:', e);
      }

      // 6. Generate PDF
      setSubmitStatus('Generating PDF report...');
      await generateInspectionPDF(state);

      setSubmitStatus('');
      setSubmitted({
        success: true,
        inspectionId,
        timestamp: new Date().toISOString(),
      });
      setStep(7);
      navigate('/inspection/complete');
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.message || 'Failed to submit inspection. Please try again.');
      setSubmitStatus('');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPhotos = state.rooms.reduce((sum, room) => sum + room.photos.length, 0) +
    state.issues.reduce((sum, issue) => sum + issue.photos.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header
        title="Review & Submit"
        onBack={() => navigate('/inspection/issues')}
      />
      <ProgressBar currentStep={6} />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-700 font-semibold text-sm">Submission Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Property Summary */}
        {state.listing && (
          <section className="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Property</h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-600">Address:</span>{' '}
                <span className="font-semibold">
                  {state.listing.displayAddress || `${state.listing.address1}${state.listing.city ? ', ' + state.listing.city : ''}`}
                </span>
              </p>
              {state.listing.reference && (
                <p>
                  <span className="text-gray-600">Reference:</span>{' '}
                  <span className="font-semibold">{state.listing.reference}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* Inspection Summary */}
        <section className="bg-white rounded-lg shadow-sm p-4 space-y-2 text-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Inspection Details</h2>
          <div>
            <span className="text-gray-600">Date:</span>{' '}
            <span className="font-semibold">{new Date(state.details.inspectionDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Agent:</span>{' '}
            <span className="font-semibold">{state.details.agentName}</span>
          </div>
          <div>
            <span className="text-gray-600">Type:</span>{' '}
            <span className="font-semibold capitalize">{state.details.inspectionType}</span>
          </div>
        </section>

        {/* Rooms Summary */}
        {state.rooms.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Rooms ({state.rooms.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2">Room</th>
                    <th className="text-left py-2 px-2">Condition</th>
                    <th className="text-left py-2 px-2">Photos</th>
                  </tr>
                </thead>
                <tbody>
                  {state.rooms.map((room) => (
                    <tr key={room.id} className="border-b border-gray-100">
                      <td className="py-2 px-2 font-semibold text-gray-900">{room.name}</td>
                      <td className="py-2 px-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getConditionColor(room.condition)}`}>
                          {getConditionLabel(room.condition)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-600">{room.photos.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Utilities Summary */}
        <section className="bg-white rounded-lg shadow-sm p-4 text-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Utilities & Safety</h2>
          <div className="space-y-1">
            <div>
              <span className="text-gray-600">Gas:</span>{' '}
              <span className="font-semibold">{state.utilities.gas.reading || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-gray-600">Electric:</span>{' '}
              <span className="font-semibold">{state.utilities.electric.reading || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-gray-600">Water:</span>{' '}
              <span className="font-semibold">{state.utilities.water.reading || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-gray-600">Smoke Alarm:</span>{' '}
              <span className="font-semibold">{state.utilities.smokeAlarm ? 'Tested' : 'Not tested'}</span>
            </div>
            <div>
              <span className="text-gray-600">CO Alarm:</span>{' '}
              <span className="font-semibold">{state.utilities.coAlarm ? 'Tested' : 'Not tested'}</span>
            </div>
          </div>
        </section>

        {/* Issues Summary */}
        {state.issues.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Issues ({state.issues.length})</h2>
            <div className="space-y-2">
              {state.issues.map((issue) => (
                <div key={issue.id} className="border border-gray-200 rounded p-2 text-sm">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-gray-900">{issue.room || 'Unlabeled'}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{issue.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{state.rooms.length}</p>
            <p className="text-xs text-gray-600 mt-1">Rooms</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-2xl font-bold text-purple-600">{totalPhotos}</p>
            <p className="text-xs text-gray-600 mt-1">Photos</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-2xl font-bold text-red-600">{state.issues.length}</p>
            <p className="text-xs text-gray-600 mt-1">Issues</p>
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 active:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader className="animate-spin" size={20} />
              Submitting...
            </>
          ) : (
            <>
              Submit Inspection
              <ChevronRight size={20} />
            </>
          )}
        </button>

        {/* Status message */}
        {submitStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 items-center">
            <Loader className="animate-spin text-blue-600 flex-shrink-0" size={18} />
            <p className="text-sm text-blue-700 font-semibold">{submitStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}
