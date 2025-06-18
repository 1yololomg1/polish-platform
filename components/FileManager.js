'use client'
import { useState } from 'react';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function FileManager({ uploadedFiles, setUploadedFiles, onFileSelect }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.las')) {
        alert(`${file.name} is not a LAS file`);
        continue;
      }

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
            size: file.size,
            uploaded: true,
            uploadedAt: new Date(),
            status: 'ready'
          }]);
        } else {
          alert(`Upload failed: ${result.error}`);
        }
        
      } catch (error) {
        alert(`Upload error: ${error.message}`);
      }
    }
    
    setUploading(false);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          File Management
        </h2>
        <div className="text-sm text-gray-500">
          {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".las,.LAS"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center">
          <Upload className={`w-12 h-12 mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <div className="text-lg font-semibold text-gray-700 mb-2">
            {uploading ? 'Uploading...' : 'Drop LAS files here or click to browse'}
          </div>
          <div className="text-sm text-gray-500">
            Supports multiple files, max 100MB each
          </div>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onFileSelect && onFileSelect(file)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {file.status === 'ready' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {file.status === 'processing' && <Clock className="w-5 h-5 text-yellow-500 animate-spin" />}
                    {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {file.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • Uploaded {file.uploadedAt?.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    file.status === 'ready' ? 'bg-green-100 text-green-800' :
                    file.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {file.status}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}