'use client'
import { useState } from 'react';
import { FileText, Download, Mail, Share2, CheckCircle } from 'lucide-react';

export default function ReportGenerator({ results, selectedFile }) {
  const [reportType, setReportType] = useState('summary');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  if (!results) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No Results Available</h3>
          <p className="text-gray-400">Process a file to generate reports</p>
        </div>
      </div>
    );
  }

  const generateReport = async () => {
    setGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGenerating(false);
    setGenerated(true);
    
    // Reset after 3 seconds
    setTimeout(() => setGenerated(false), 3000);
  };

  const reportTypes = [
    {
      id: 'summary',
      name: 'Executive Summary',
      description: 'High-level overview with key metrics and recommendations',
      price: 150,
      pages: '2-3 pages',
      features: ['Quality metrics', 'Processing summary', 'Recommendations']
    },
    {
      id: 'detailed',
      name: 'Technical Report',
      description: 'Comprehensive analysis with detailed methodology',
      price: 350,
      pages: '8-12 pages',
      features: ['Detailed methodology', 'Statistical analysis', 'Quality assessment', 'Curve comparisons']
    },
    {
      id: 'complete',
      name: 'Complete Package',
      description: 'Full report with processed data and visualizations',
      price: 600,
      pages: '15+ pages',
      features: ['Complete technical report', 'Processed LAS files', 'High-res visualizations', 'Raw data export']
    }
  ];

  const selectedReportType = reportTypes.find(type => type.id === reportType);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Professional Reports
        </h2>
        
        {selectedFile && (
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {selectedFile.name}
          </div>
        )}
      </div>

      {/* Report Type Selection */}
      <div className="space-y-4 mb-8">
        {reportTypes.map((type) => (
          <div
            key={type.id}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              reportType === type.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setReportType(type.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    reportType === type.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {reportType === type.id && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {type.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {type.pages}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3 ml-7">
                  {type.description}
                </p>
                
                <div className="ml-7">
                  <div className="flex flex-wrap gap-2">
                    {type.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${type.price}
                </div>
                <div className="text-sm text-gray-500">
                  USD
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Processing Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Processing Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Curves Processed</div>
            <div className="font-semibold">{Object.keys(results.curves).length}</div>
          </div>
          <div>
            <div className="text-gray-500">Algorithms Applied</div>
            <div className="font-semibold">{results.algorithmsApplied.join(', ')}</div>
          </div>
          <div>
            <div className="text-gray-500">Average SNR</div>
            <div className="font-semibold">
              {Object.values(results.qualityMetrics)
                .reduce((sum, metric) => sum + metric.snr, 0) / Object.keys(results.qualityMetrics).length
              } dB
            </div>
          </div>
          <div>
            <div className="text-gray-500">Processing Time</div>
            <div className="font-semibold">< 1 min</div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="space-y-4">
        <button
          onClick={generateReport}
          disabled={generating || generated}
          className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
            generated
              ? 'bg-green-500 text-white'
              : generating
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
          }`}
        >
          {generated ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Report Generated Successfully!</span>
            </>
          ) : generating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Generate {selectedReportType?.name} - ${selectedReportType?.price}</span>
            </>
          )}
        </button>

        {generated && (
          <div className="flex space-x-2">
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email Report</span>
            </button>
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="text-yellow-600 mt-0.5">💡</div>
          <div className="text-sm text-yellow-800">
            <strong>Note:</strong> All processing and visualization is completely free. 
            You only pay when you need to export professional reports or processed data files.
          </div>
        </div>
      </div>
    </div>
  );
}