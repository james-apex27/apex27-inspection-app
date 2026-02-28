import React from 'react';
import { Check } from 'lucide-react';

const conditions = [
  { value: 'good', label: 'Good', color: 'bg-green-500' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-400' },
  { value: 'poor', label: 'Poor', color: 'bg-red-500' },
  { value: 'na', label: 'N/A', color: 'bg-gray-400' },
];

export function ConditionSelector({ value, onChange }) {
  return (
    <div className="flex gap-2 mt-3">
      {conditions.map((condition) => (
        <button
          key={condition.value}
          onClick={() => onChange(condition.value)}
          className={`flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 ${
            value === condition.value
              ? `${condition.color} ring-2 ring-offset-2 ring-offset-white ring-blue-600`
              : `${condition.color} opacity-60`
          }`}
        >
          {value === condition.value && <Check size={20} />}
          <span className="text-sm">{condition.label}</span>
        </button>
      ))}
    </div>
  );
}
