'use client'
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Download, Eye, EyeOff } from 'lucide-react';

export default function LogVisualization({ results }) {
  const [selectedCurves, setSelectedCurves] = useState([]);
  const [viewMode, setViewMode] = useState('overlay'); // 'overlay' or 'separate'

  if (!results || !results.curves) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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

  // Prepare data for visualization
  const prepareChartData = (curveName) => {
    const curve = results.curves[curveName];
    const data = [];
    
    for (let i = 0; i < curve.original.length; i++) {
      if (curve.original[i] !== null && curve.processed[i] !== null) {
        data.push({
          depth: i,
          original: curve.original[i],
          processed: curve.processed[i]
        });
      }
    }
    
    return data.filter((_, index) => index % Math.max(1, Math.floor(data.length / 500)) === 0); // Downsample for performance
  };

  const toggleCurve = (curveName) => {
    setSelectedCurves(prev => 
      prev.includes(curveName)
        ? prev.filter(name => name !== curveName)
        : [...prev, curveName]
    );
  };

  const colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#c2410c'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
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
            <Download className="w-4 h-4" />
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
                {isSelected ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-8">
        {selectedCurves.map((curveName, index) => {
          const chartData = prepareChartData(curveName);
          const color = colors[index % colors.length];
          const curve = results.curves[curveName];
          
          return (
            <div key={curveName} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{curveName}</h4>
                  <p className="text-sm text-gray-500">
                    {curve.description} ({curve.unit})
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Quality Metrics
                  </div>
                  <div className="text-xs text-gray-500">
                    SNR: {results.qualityMetrics[curveName]?.snr.toFixed(2)} dB
                  </div>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="depth" 
                      stroke="#666"
                      fontSize={12}
                      label={{ value: 'Depth Index', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                      label={{ value: curve.unit, angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="original"
                      stroke="#94a3b8"
                      strokeWidth={1}
                      dot={false}
                      name="Original"
                      strokeOpacity={0.7}
                    />
                    <Line
                      type="monotone"
                      dataKey="processed"
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      name="Processed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
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