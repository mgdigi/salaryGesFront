import React, { useState } from 'react';

const ColorPicker = ({ value, onChange, label, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const predefinedColors = [
    '#f97316', // Orange (défaut)
    '#3b82f6', // Blue
    '#10b981', // Green
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#f59e0b', // Yellow
    '#ec4899', // Pink
    '#6b7280', // Gray
    '#059669', // Emerald
    '#dc2626', // Red-600
    '#2563eb', // Blue-600
    '#7c3aed', // Violet
  ];

  const handleColorSelect = (color) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <div
          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="#f97316"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          🎨
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="grid grid-cols-6 gap-2 mb-3">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-md border-2 transition-all ${
                  value === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                title={color}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 text-center">
            Cliquez pour sélectionner
          </div>
        </div>
      )}

      {/* Overlay pour fermer le picker */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ColorPicker;