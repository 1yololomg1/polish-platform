'use client'
import { useState } from 'react';
import { Settings, Play, Zap, Filter, TrendingUp } from 'lucide-react';

export default function AlgorithmPanel({ onProcess, processing, selectedFile }) {
  const [selectedAlgorithms, setSelectedAlgorithms] = useState(['savgolay', 'hampel']);
  const [parameters, setParameters] = useState({
    savgolay: { window: 11, order: 3 },
    hampel: { threshold: 3, window: 7 },
    pchip: { maxGap: 50 }
  });

  const algorithms = [
    {
      id: 'savgolay',
      name: 'Savitzky-Golay Filter',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Polynomial smoothing that preserves geological features',
      color: 'blue',
      parameters: [
        { key: 'window', label: 'Window Size', min: 5, max: 21, step: 2 },
        { key: 'order', label: 'Polynomial Order', min: 2, max: 5, step: 1 }
      ]
    },
    {
      id: 'hampel',
      name: 'Hampel Filter',
      icon: <Filter className="w-5 h-5" />,
      description: 'Robust outlier detection using median absolute deviation',
      color: 'green',
      parameters: [
        { key: 'threshold', label: 'Threshold (σ)', min: 1, max: 5, step: 0.5 },
        { key: 'window', label: 'Window Size', min: 3, max: 15, step: 2 }
      ]
    },
    {
      id: 'pchip',
      name: 'PCHIP Interpolation',
      icon: <Zap className="w-5 h-5" />,
      description: 'Shape-preserving gap filling for missing data',
      color: 'purple',
      parameters: [
        { key: 'maxGap', label: 'Max Gap Size', min: 10, max: 100, step: 10 }
      ]
    }
  ];

  const toggleAlgorithm = (algorithmId) => {
    setSelectedAlgorithms(prev => 
      prev.includes(algorithmId)
        ? prev.filter(id => id !== algorithmId)
        : [...prev, algorithmId]
    );
  };

  const updateParameter = (algorithmId, paramKey, value) => {
    setParameters(prev => ({
      ...prev,
      [algorithmId]: {
        ...prev[algorithmId],
        [paramKey]: parseFloat(value)
      }
    }));
  };

  const handleProcess = () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    
    if (selectedAlgorithms.length === 0) {
      alert('Please select at least one algorithm');
      return;
    }

    onProcess(selectedFile.id, selectedAlgorithms, parameters);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Algorithm Configuration
        </h2>
        {selectedFile && (
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Selected: {selectedFile.name}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {algorithms.map((algorithm) => {
          const isSelected = selectedAlgorithms.includes(algorithm.id);
          const colorClasses = {
            blue: 'border-blue-200 bg-blue-50',
            green: 'border-green-200 bg-green-50',
            purple: 'border-purple-200 bg-purple-50'
          };

          return (
            <div
              key={algorithm.id}
              className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                isSelected 
                  ? colorClasses[algorithm.color]
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleAlgorithm(algorithm.id)}
                    className={`flex items-center justify-center w-6 h-6 rounded border-2 transition-colors ${
                      isSelected
                        ? `bg-${algorithm.color}-500 border-${algorithm.color}-500`
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-3 h-3 bg-white rounded-sm" />}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`text-${algorithm.color}-600`}>
                      {algorithm.icon}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {algorithm.name}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 ml-9">
                {algorithm.description}
              </p>

              {isSelected && (
                <div className="ml-9 space-y-3">
                  {algorithm.parameters.map((param) => (
                    <div key={param.key} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {param.label}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={parameters[algorithm.id][param.key]}
                          onChange={(e) => updateParameter(algorithm.id, param.key, e.target.value)}
                          className="w-24"
                        />
                        <span className="text-sm font-mono bg-white px-2 py-1 rounded border min-w-[3rem] text-center">
                          {parameters[algorithm.id][param.key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          onClick={handleProcess}
          disabled={!selectedFile || selectedAlgorithms.length === 0 || processing}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
        >
          <Play className="w-5 h-5" />
          <span>
            {processing ? 'Processing...' : 'Process Selected File'}
          </span>
        </button>
      </div>
    </div>
  );
}