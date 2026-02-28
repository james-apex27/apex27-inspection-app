import React, { useRef } from 'react';
import { Camera, X } from 'lucide-react';

export function PhotoCapture({ photos = [], onChange }) {
  const fileInputRef = useRef(null);

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result;
        onChange([...photos, base64String]);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="font-semibold text-gray-700">
          Photos {photos.length > 0 && `(${photos.length})`}
        </label>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold active:bg-blue-700 transition-colors"
        >
          <Camera size={20} />
          Add Photo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:opacity-100"
                aria-label="Remove photo"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Camera className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-sm text-gray-600">No photos yet</p>
        </div>
      )}
    </div>
  );
}
