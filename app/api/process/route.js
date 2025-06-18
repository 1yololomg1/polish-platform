 
import { NextResponse } from 'next/server';
import { decryptData, logSecurityEvent } from '../../../lib/security.js';
import { savitzkyGolayFilter, hampelFilter, pchipInterpolation, calculateQualityMetrics } from '../../../lib/algorithms.js';
import { getStoredFile } from '../upload/route.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileId, algorithms, parameters } = body;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing file ID' },
        { status: 400 }
      );
    }
    
    // Retrieve and decrypt file
    const storedFile = getStoredFile(fileId);
    if (!storedFile) {
      return NextResponse.json(
        { error: 'File not found or expired' },
        { status: 404 }
      );
    }
    
    const fileData = decryptData(storedFile.data);
    
    // Parse LAS file to extract curves
    const parsedLAS = parseLASFile(fileData);
    if (!parsedLAS.success) {
      return NextResponse.json(
        { error: 'Failed to parse LAS file: ' + parsedLAS.error },
        { status: 400 }
      );
    }
    
    // Process each curve with selected algorithms
    const processedCurves = {};
    const qualityMetrics = {};
    
    for (const [curveName, curveData] of Object.entries(parsedLAS.curves)) {
      let processed = [...curveData.values];
      const original = [...curveData.values];
      
      // Apply algorithms in sequence
      if (algorithms.includes('savgolay')) {
        const windowSize = parameters?.savgolay?.window || 11;
        const order = parameters?.savgolay?.order || 3;
        processed = savitzkyGolayFilter(processed, windowSize, order);
      }
      
      if (algorithms.includes('hampel')) {
        const threshold = parameters?.hampel?.threshold || 3;
        const windowSize = parameters?.hampel?.window || 7;
        processed = hampelFilter(processed, threshold, windowSize);
      }
      
      if (algorithms.includes('pchip')) {
        processed = pchipInterpolation(processed);
      }
      
      // Calculate quality metrics
      const metrics = calculateQualityMetrics(original, processed);
      
      processedCurves[curveName] = {
        original: original,
        processed: processed,
        unit: curveData.unit,
        description: curveData.description
      };
      
      qualityMetrics[curveName] = metrics;
    }
    
    // Log processing
    logSecurityEvent('FILE_PROCESSED', {
      fileId: fileId,
      fileName: storedFile.fileName,
      algorithms: algorithms,
      curveCount: Object.keys(processedCurves).length
    });
    
    return NextResponse.json({
      success: true,
      fileId: fileId,
      fileName: storedFile.fileName,
      wellInfo: parsedLAS.wellInfo,
      curves: processedCurves,
      qualityMetrics: qualityMetrics,
      processingParameters: parameters,
      algorithmsApplied: algorithms
    });
    
  } catch (error) {
    console.error('Processing error:', error);
    
    logSecurityEvent('PROCESSING_ERROR', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: 'Processing failed: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Real LAS File Parser - Industry Standard Format
 */
function parseLASFile(fileContent) {
  try {
    const lines = fileContent.split(/\r?\n/);
    const result = {
      success: true,
      wellInfo: {},
      curves: {},
      version: null,
      error: null
    };
    
    let currentSection = null;
    let dataSection = false;
    let curveOrder = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;
      
      // Detect sections
      if (line.startsWith('~V')) {
        currentSection = 'VERSION';
        continue;
      } else if (line.startsWith('~W')) {
        currentSection = 'WELL';
        continue;
      } else if (line.startsWith('~C')) {
        currentSection = 'CURVE';
        continue;
      } else if (line.startsWith('~P')) {
        currentSection = 'PARAMETER';
        continue;
      } else if (line.startsWith('~A')) {
        currentSection = 'DATA';
        dataSection = true;
        continue;
      }
      
      // Parse header information
      if (!dataSection && line.includes('.')) {
        const parts = line.split('.');
        if (parts.length >= 2) {
          const mnemonic = parts[0].trim();
          const rest = parts[1].split(':');
          const unit = rest[0].trim();
          const description = rest.length > 1 ? rest.slice(1).join(':').trim() : '';
          
          if (currentSection === 'WELL') {
            result.wellInfo[mnemonic] = { unit, description };
          } else if (currentSection === 'CURVE') {
            curveOrder.push(mnemonic);
            result.curves[mnemonic] = {
              unit: unit,
              description: description,
              values: []
            };
          } else if (currentSection === 'VERSION') {
            result.version = { unit, description };
          }
        }
      }
      
      // Parse data section
      if (dataSection && line.length > 0) {
        const values = line.split(/\s+/).filter(v => v.length > 0);
        
        if (values.length === curveOrder.length) {
          for (let j = 0; j < values.length; j++) {
            const curveName = curveOrder[j];
            let value = parseFloat(values[j]);
            
            // Handle LAS null values
            if (isNaN(value) || value === -999.25 || value === -999 || value === 999.25) {
              value = null;
            }
            
            if (result.curves[curveName]) {
              result.curves[curveName].values.push(value);
            }
          }
        }
      }
    }
    
    // Validate parsed data
    if (Object.keys(result.curves).length === 0) {
      result.success = false;
      result.error = 'No curve data found in LAS file';
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      wellInfo: {},
      curves: {}
    };
  }
}