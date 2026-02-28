import React from 'react';

export function ProgressBar({ currentStep, totalSteps = 7 }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-200">
      <div className="mb-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 text-center font-medium">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}
