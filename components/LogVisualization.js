'use client'
import { useState } from 'react';

export default function LogVisualization({ results }) {
  const [selectedCurves, setSelectedCurves] = useState([]);
  const [viewMode, setViewMode] = useState('overlay');

  if (!results || !results.curves) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📊</span>
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No Data to Visualize</h3>
          <p className="text-gray-400">Process a LAS file to see log visualization</p>
        </div>
      </div>
    );
  }

  const curveNames = Object.keys(results.curves);
  
  // Initialize selected curves if empty
  if (selectedCurves.length === 0 && curveNames.length > 0) {
    setSelectedCurves(curveNames.slice(0, 3)); // Show first 3 curves by default
  }

  const toggleCurve = (curveName) => {
    setSelectedCurves(prev => 
      prev.includes(curveName)
        ? prev.filter(name => name !== curveName)
        : [...prev, curveName]
    );
  };

  const colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#c2410c'];

  // Simple SVG chart component
  const SimpleChart = ({ curveName, data, color }) => {
    const curve = results.curves[curveName];
    const original = curve.original.filter(v => v !== null);
    const processed = curve.processed.filter(v => v !== null);
    
    if (original.length === 0) return null;

    const maxVal = Math.max(...original, ...processed);
    const minVal = Math.min(...original, ...processed);
    const range = maxVal - minVal || 1;
    
    const width = 800;
    const height = 200;
    const padding = 40;
    
    const getX = (index) => padding + (index / (original.length - 1)) * (width - 2 * padding);
    const getY = (value) => height - padding - ((value - minVal) / range) * (height - 2 * padding);
    
    const originalPath = original.map((val, i) => 
      `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`
    ).join(' ');
    
    const processedPath = processed.map((val, i) => 
      `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`
    ).join(' ');

    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900">{curveName}</h4>
            <p className="text-sm text-gray-500">
              {curve.description} ({curve.unit})
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Quality Metrics</div>
            <div className="text-xs text-gray-500">
              SNR: {results.qualityMetrics[curveName]?.snr.toFixed(2)} dB
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <svg width={width} height={height} className="border border-gray-100 rounded">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Original data line */}
            <path
              d={originalPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1"
              opacity="0.7"
            />
            
            {/* Processed data line */}
            <path
              d={processedPath}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            
            {/* Y-axis labels */}
            <text x="10" y="25" fontSize="10" fill="#666">{maxVal.toFixed(1)}</text>
            <text x="10" y={height - 10} fontSize="10" fill="#666">{minVal.toFixed(1)}</text>
            
            {/* Legend */}
            <g transform={`translate(${width - 150}, 20)`}>
              <rect x="0" y="0" width="140" height="40" fill="white" stroke="#ddd" rx="4"/>
              <line x1="10" y1="15" x2="25" y2="15" stroke="#94a3b8" strokeWidth="1"/>
              <text x="30" y="18" fontSize="10" fill="#666">Original</text>
              <line x1="10" y1="28" x2="25" y2="28" stroke={color} strokeWidth="2"/>
              <text x="30" y="31" fontSize="10" fill="#666">Processed</text>
            </g>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-blue-600">📊</span>
          Log Visualization
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'overlay' ? 'separate' : 'overlay')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {viewMode === 'overlay' ? 'Separate View' : 'Overlay View'}
          </button>
          
          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1">
            <span>📥</span>
            Export
          </button>
        </div>
      </div>

      {/* Curve Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Curves to Display</h3>
        <div className="flex flex-wrap gap-2">
          {curveNames.map((curveName, index) => {
            const isSelected = selectedCurves.includes(curveName);
            const color = colors[index % colors.length];
            
            return (
              <button
                key={curveName}
                onClick={() => toggleCurve(curveName)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: isSelected ? color : '#d1d5db' }}
                />
                <span className="text-sm font-medium">{curveName}</span>
                <span className="text-xs text-gray-500">
                  ({results.curves[curveName].unit})
                </span>
                <span className="text-sm">{isSelected ? '👁️' : '👁️‍🗨️'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-4">
        {selectedCurves.map((curveName, index) => {
          const color = colors[index % colors.length];
          return (
            <SimpleChart
              key={curveName}
              curveName={curveName}
              data={results.curves[curveName]}
              color={color}
            />
          );
        })}
      </div>

      {selectedCurves.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Select curves above to display visualization</p>
        </div>
      )}
    </div>
  );
}