import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { PhotoCapture } from '../components/PhotoCapture.jsx';
import { useInspection } from '../context/InspectionContext.jsx';
import { ChevronRight, Plus, X } from 'lucide-react';

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
];

export function MaintenanceIssues() {
  const navigate = useNavigate();
  const { state, setStep, addIssue, updateIssue, removeIssue } = useInspection();
  const [editingIssueId, setEditingIssueId] = useState(null);

  useEffect(() => {
    setStep(5);
  }, [setStep]);

  const handleAddIssue = () => {
    addIssue();
    setEditingIssueId(state.issues.length);
  };

  const handleNext = () => {
    setStep(6);
    navigate('/inspection/review');
  };

  const roomNames = state.rooms.map(r => r.name);

  const getPriorityColor = (priority) => {
    return priorities.find(p => p.value === priority)?.color || '';
  };

  const getPriorityLabel = (priority) => {
    return priorities.find(p => p.value === priority)?.label || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header
        title="Maintenance Issues"
        onBack={() => navigate('/inspection/utilities')}
      />
      <ProgressBar currentStep={5} />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Issues list */}
        {state.issues.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200 mt-4">
            <Plus className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="text-gray-600 font-semibold mb-4">No issues recorded</p>
            <p className="text-sm text-gray-600">Add issues as you find them during the inspection</p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.issues.map((issue, index) => {
              const isEditing = editingIssueId === issue.id;

              if (isEditing) {
                return (
                  <div key={issue.id} className="bg-white rounded-lg shadow-sm p-4 border border-blue-300 space-y-4">
                    {/* Location */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location/Room
                      </label>
                      <input
                        type="text"
                        list="roomList"
                        value={issue.room}
                        onChange={(e) => updateIssue(issue.id, { room: e.target.value })}
                        placeholder="e.g. Kitchen, Bedroom 1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                      <datalist id="roomList">
                        {roomNames.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={issue.description}
                        onChange={(e) => updateIssue(issue.id, { description: e.target.value })}
                        placeholder="What needs to be fixed?"
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Priority
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {priorities.map((p) => (
                          <button
                            key={p.value}
                            onClick={() => updateIssue(issue.id, { priority: p.value })}
                            className={`py-2 px-2 rounded-lg font-semibold text-xs transition-all ${
                              issue.priority === p.value
                                ? `${p.color} ring-2 ring-offset-2 ring-offset-white ring-blue-600`
                                : `${p.color} opacity-60`
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Photos */}
                    <PhotoCapture
                      photos={issue.photos}
                      onChange={(photos) => updateIssue(issue.id, { photos })}
                    />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIssueId(null)}
                        className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg active:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          removeIssue(issue.id);
                          setEditingIssueId(null);
                        }}
                        className="bg-red-100 text-red-700 p-2 rounded-lg active:bg-red-200 transition-colors flex items-center justify-center"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={issue.id}
                  onClick={() => setEditingIssueId(issue.id)}
                  className="w-full bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-left hover:border-blue-400 active:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{issue.room || 'Unlabeled'}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {issue.description || 'No description'}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2 ${getPriorityColor(issue.priority)}`}>
                      {getPriorityLabel(issue.priority)}
                    </span>
                  </div>
                  {issue.photos.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">{issue.photos.length} photo(s)</p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Add Issue button */}
        {editingIssueId === null && (
          <button
            onClick={handleAddIssue}
            className="w-full border-2 border-dashed border-gray-300 text-gray-600 font-semibold py-3 px-4 rounded-lg active:border-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Issue
          </button>
        )}

        {/* Next button */}
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 active:bg-blue-700 transition-colors"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
