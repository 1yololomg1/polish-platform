'use client'
import { useState } from 'react';

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      try {
        const fileContent = await file.text();
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: fileContent,
            fileName: file.name
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setUploadedFiles(prev => [...prev, {
            id: result.fileId,
            name: result.fileName,
            uploaded: true
          }]);
        } else {
          alert(`Upload failed: ${result.error}`);
        }
        
      } catch (error) {
        alert(`Upload error: ${error.message}`);
      }
    }
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload LAS files first');
      return;
    }

    setProcessing(true);
    
    try {
      const fileId = uploadedFiles[0].id; // Process first file for demo
      
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: fileId,
          algorithms: ['savgolay', 'hampel'],
          parameters: {
            savgolay: { window: 11, order: 3 },
            hampel: { threshold: 3, window: 7 }
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setResults(result);
      } else {
        alert(`Processing failed: ${result.error}`);
      }
      
    } catch (error) {
      alert(`Processing error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛢️ POLISH Platform
          </h1>
          <p className="text-xl text-gray-600">
            Professional LAS File Cleaning with Real Mathematical Algorithms
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Upload LAS Files</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept=".las,.LAS"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="text-4xl mb-4">📁</div>
              <div className="text-lg font-medium text-gray-700 mb-2">
                Drop LAS files here or click to browse
              </div>
              <div className="text-sm text-gray-500">
                Supports multiple files, max 100MB each
              </div>
            </label>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Uploaded Files:</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center p-3 bg-green-50 rounded border">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="font-medium">{file.name}</span>
                    <span className="ml-auto text-sm text-gray-500">Ready for processing</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Processing Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Algorithm Selection</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Savitzky-Golay Filter</h3>
              <p className="text-sm text-gray-600 mb-3">
                Polynomial smoothing that preserves geological features
              </p>
              <div className="text-sm">
                <div>Window: 11 points</div>
                <div>Order: 3rd polynomial</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Hampel Filter</h3>
              <p className="text-sm text-gray-600 mb-3">
                Robust outlier detection using median absolute deviation
              </p>
              <div className="text-sm">
                <div>Threshold: 3σ</div>
                <div>Window: 7 points</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">PCHIP Interpolation</h3>
              <p className="text-sm text-gray-600 mb-3">
                Shape-preserving gap filling for missing data
              </p>
              <div className="text-sm">
                <div>Max gap: 50 points</div>
                <div>Monotonic: Preserved</div>
              </div>
            </div>
          </div>

          <button
            onClick={processFiles}
            disabled={uploadedFiles.length === 0 || processing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {processing ? '🔄 Processing...' : '🚀 Process Files'}
          </button>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Processing Results</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Quality Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Quality Improvements</h3>
                <div className="space-y-3">
                  {Object.entries(results.qualityMetrics).map(([curve, metrics]) => (
                    <div key={curve} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-gray-800">{curve}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>SNR: {metrics.snr.toFixed(2)} dB</div>
                        <div>Correlation: {(metrics.correlation * 100).toFixed(1)}%</div>
                        <div>RMSE: {metrics.rmse.toFixed(4)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Well Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Well Information</h3>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium text-gray-800">{results.fileName}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>Curves: {Object.keys(results.curves).length}</div>
                    <div>Algorithms: {results.algorithmsApplied.join(', ')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Export Options</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                  📄 Export Report ($150)
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                  📊 Complete Package ($600)
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                * All processing and visualization free. Pay only for exports.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}