'use client'
import { useState } from 'react';
import FileManager from '../components/FileManager';
import AlgorithmPanel from '../components/AlgorithmPanel';
import LogVisualization from '../components/LogVisualization';
import ReportGenerator from '../components/ReportGenerator';

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('files');

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setActiveTab('algorithms');
  };

  const processFile = async (fileId, algorithms, parameters) => {
    setProcessing(true);
    
    // Update file status
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, status: 'processing' }
          : file
      )
    );
    
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: fileId,
          algorithms: algorithms,
          parameters: parameters
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setResults(result);
        setActiveTab('visualization');
        
        // Update file status to ready
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, status: 'ready' }
              : file
          )
        );
      } else {
        alert(`Processing failed: ${result.error}`);
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, status: 'error' }
              : file
          )
        );
      }
      
    } catch (error) {
      alert(`Processing error: ${error.message}`);
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'error' }
            : file
        )
      );
    } finally {
      setProcessing(false);
    }
  };

  const tabs = [
    { id: 'files', label: 'File Management', icon: '📁' },
    { id: 'algorithms', label: 'Processing', icon: '⚙️' },
    { id: 'visualization', label: 'Visualization', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📄' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                🛢️ POLISH Platform
              </h1>
              <p className="text-xl text-gray-600 mt-1">
                Professional LAS File Cleaning with Real Mathematical Algorithms
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="w-4 h-4 text-green-500">🛡️</span>
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-4 h-4 text-yellow-500">⚡</span>
                <span>Real-time Processing</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-4 h-4 text-blue-500">🏆</span>
                <span>Industry Standard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8 border border-gray-200">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'files' && (
            <FileManager
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              onFileSelect={handleFileSelect}
            />
          )}

          {activeTab === 'algorithms' && (
            <AlgorithmPanel
              onProcess={processFile}
              processing={processing}
              selectedFile={selectedFile}
            />
          )}

          {activeTab === 'visualization' && (
            <LogVisualization results={results} />
          )}

          {activeTab === 'reports' && (
            <ReportGenerator results={results} selectedFile={selectedFile} />
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">👥</span>
              <h3 className="font-semibold text-gray-900 mb-1">Trusted by Professionals</h3>
              <p className="text-sm text-gray-600">Used by petroleum engineers worldwide</p>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">🛡️</span>
              <h3 className="font-semibold text-gray-900 mb-1">Enterprise Security</h3>
              <p className="text-sm text-gray-600">Bank-level encryption and data protection</p>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">🏆</span>
              <h3 className="font-semibold text-gray-900 mb-1">Industry Standard</h3>
              <p className="text-sm text-gray-600">Real mathematical algorithms, not approximations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}