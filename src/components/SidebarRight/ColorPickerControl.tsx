import React, { useState } from 'react';
import { COLOR_PALETTES } from '../../constants/defaults';

interface ColorPickerControlProps {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const ColorPickerControl: React.FC<ColorPickerControlProps> = ({
  label,
  value = '#ffffff',
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const displayColor = value === 'transparent' ? 'transparent' : value;

  return (
    <div className="relative">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-400 font-medium">{label}</span>
        {value === 'transparent' ? (
          <span className="text-[10px] text-slate-500 font-mono">transparent</span>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono uppercase">{value}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-7 h-7 rounded border shrink-0 relative overflow-hidden transition-all ${
            disabled
              ? 'opacity-50 cursor-not-allowed border-slate-700'
              : 'border-slate-700 hover:border-blue-500 shadow-sm'
          }`}
          style={{
            backgroundColor: displayColor,
            backgroundImage:
              value === 'transparent'
                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                : 'none',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          }}
          title="Pick color"
        />

        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 px-2.5 py-1 text-xs bg-slate-950 border rounded font-mono text-slate-200 outline-none transition-colors ${
            disabled
              ? 'border-slate-800 text-slate-600 bg-slate-900 cursor-not-allowed'
              : 'border-slate-800 focus:border-blue-500'
          }`}
          placeholder="#000000"
        />

        <input
          type="color"
          disabled={disabled}
          value={value.startsWith('#') && value.length === 7 ? value : '#2563eb'}
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 absolute w-0 h-0 pointer-events-none"
          id={`native_color_${label}`}
        />
        <label
          htmlFor={`native_color_${label}`}
          className={`px-2 py-1 text-[11px] font-medium rounded border border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors ${
            disabled ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          Pipette
        </label>
      </div>

      {/* Swatches Popover */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 w-64 animate-scale-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-slate-300">Preset Colors</span>
            <button
              onClick={() => {
                onChange('transparent');
                setIsOpen(false);
              }}
              className="text-[10px] text-blue-400 hover:text-blue-300"
            >
              Clear / Transparent
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {COLOR_PALETTES.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                className={`w-6 h-6 rounded border transition-transform hover:scale-110 ${
                  value.toLowerCase() === color.toLowerCase()
                    ? 'border-white scale-110 shadow-sm'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
