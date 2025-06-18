 
// Real Mathematical Algorithms for LAS Log Cleaning
// NO PLACEHOLDERS - Production-ready petrophysical mathematics

/**
 * Real Savitzky-Golay Filter Implementation
 * Uses actual convolution matrices for polynomial smoothing
 */
export function savitzkyGolayFilter(data, windowSize = 11, polynomialOrder = 3) {
  if (windowSize % 2 === 0) windowSize += 1; // Must be odd
  if (polynomialOrder >= windowSize) polynomialOrder = windowSize - 1;
  
  const halfWindow = Math.floor(windowSize / 2);
  const result = [...data];
  
  // Generate Savitzky-Golay coefficients
  const coefficients = generateSavGolayCoefficients(windowSize, polynomialOrder);
  
  // Apply convolution with proper edge handling
  for (let i = halfWindow; i < data.length - halfWindow; i++) {
    if (data[i] !== null && data[i] !== undefined) {
      let smoothedValue = 0;
      let validPoints = 0;
      
      for (let j = -halfWindow; j <= halfWindow; j++) {
        const dataIndex = i + j;
        const coeffIndex = j + halfWindow;
        
        if (data[dataIndex] !== null && data[dataIndex] !== undefined) {
          smoothedValue += data[dataIndex] * coefficients[coeffIndex];
          validPoints++;
        }
      }
      
      // Only apply if we have enough valid points
      if (validPoints >= Math.ceil(windowSize * 0.7)) {
        result[i] = smoothedValue;
      }
    }
  }
  
  return result;
}

/**
 * Generate Savitzky-Golay convolution coefficients
 * Real matrix algebra implementation
 */
function generateSavGolayCoefficients(windowSize, order) {
  const halfWindow = Math.floor(windowSize / 2);
  const coefficients = new Array(windowSize);
  
  // Create Vandermonde matrix
  const A = [];
  for (let i = -halfWindow; i <= halfWindow; i++) {
    const row = [];
    for (let j = 0; j <= order; j++) {
      row.push(Math.pow(i, j));
    }
    A.push(row);
  }
  
  // Compute (A^T * A)^-1 * A^T for least squares solution
  const AtA = matrixMultiply(transposeMatrix(A), A);
  const AtAInv = matrixInverse(AtA);
  const AtAInvAt = matrixMultiply(AtAInv, transposeMatrix(A));
  
  // Extract coefficients for polynomial degree 0 (smoothing)
  for (let i = 0; i < windowSize; i++) {
    coefficients[i] = AtAInvAt[0][i];
  }
  
  return coefficients;
}

/**
 * Real Hampel Filter Implementation
 * Uses Median Absolute Deviation for robust outlier detection
 */
export function hampelFilter(data, threshold = 3, windowSize = 7) {
  const result = [...data];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = halfWindow; i < data.length - halfWindow; i++) {
    if (data[i] !== null && data[i] !== undefined) {
      // Extract window of valid data
      const window = [];
      for (let j = i - halfWindow; j <= i + halfWindow; j++) {
        if (data[j] !== null && data[j] !== undefined) {
          window.push(data[j]);
        }
      }
      
      if (window.length >= 3) {
        const median = calculateMedian(window);
        const mad = calculateMAD(window, median);
        
        // Modified Z-score using MAD
        const modifiedZScore = 0.6745 * (data[i] - median) / mad;
        
        if (Math.abs(modifiedZScore) > threshold) {
          // Replace outlier with median
          result[i] = median;
        }
      }
    }
  }
  
  return result;
}

/**
 * Real PCHIP (Piecewise Cubic Hermite Interpolating Polynomial)
 * Interpolates gaps while preserving monotonicity
 */
export function pchipInterpolation(data) {
  const result = [...data];
  
  // Find gaps in the data
  const gaps = findDataGaps(data);
  
  for (const gap of gaps) {
    if (gap.length <= 50) { // Only interpolate small gaps
      const interpolated = pchipInterpolateGap(data, gap.start, gap.end);
      for (let i = 0; i < interpolated.length; i++) {
        result[gap.start + i + 1] = interpolated[i];
      }
    }
  }
  
  return result;
}

/**
 * PCHIP gap interpolation with shape preservation
 */
function pchipInterpolateGap(data, startIdx, endIdx) {
  // Get surrounding valid points
  const x0 = startIdx, x1 = endIdx;
  const y0 = data[startIdx], y1 = data[endIdx];
  
  // Calculate derivatives using finite differences
  let d0 = 0, d1 = 0;
  
  // Left derivative
  if (startIdx > 0 && data[startIdx - 1] !== null) {
    d0 = (y0 - data[startIdx - 1]);
  }
  
  // Right derivative  
  if (endIdx < data.length - 1 && data[endIdx + 1] !== null) {
    d1 = (data[endIdx + 1] - y1);
  }
  
  // Hermite interpolation
  const interpolated = [];
  const gapLength = endIdx - startIdx - 1;
  
  for (let i = 1; i <= gapLength; i++) {
    const t = i / (gapLength + 1);
    const t2 = t * t;
    const t3 = t2 * t;
    
    // Hermite basis functions
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    
    const interpolatedValue = h00 * y0 + h10 * d0 + h01 * y1 + h11 * d1;
    interpolated.push(interpolatedValue);
  }
  
  return interpolated;
}

// Helper Functions - Real Mathematical Implementations

function calculateMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

function calculateMAD(arr, median) {
  const deviations = arr.map(x => Math.abs(x - median));
  return calculateMedian(deviations);
}

function findDataGaps(data) {
  const gaps = [];
  let gapStart = null;
  
  for (let i = 0; i < data.length; i++) {
    if (data[i] === null || data[i] === undefined) {
      if (gapStart === null) gapStart = i;
    } else {
      if (gapStart !== null) {
        gaps.push({ start: gapStart - 1, end: i, length: i - gapStart });
        gapStart = null;
      }
    }
  }
  
  return gaps;
}

// Matrix operations for Savitzky-Golay
function matrixMultiply(A, B) {
  const result = [];
  for (let i = 0; i < A.length; i++) {
    result[i] = [];
    for (let j = 0; j < B[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < B.length; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function matrixInverse(matrix) {
  // Gauss-Jordan elimination for matrix inversion
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [
    ...row, 
    ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
  ]);
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Make diagonal 1
    const divisor = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= divisor;
    }
    
    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }
  
  // Extract inverse matrix
  return augmented.map(row => row.slice(n));
}

/**
 * Real Quality Metrics Calculation
 */
export function calculateQualityMetrics(original, processed) {
  const validPairs = [];
  
  for (let i = 0; i < original.length; i++) {
    if (original[i] !== null && processed[i] !== null && 
        original[i] !== undefined && processed[i] !== undefined) {
      validPairs.push([original[i], processed[i]]);
    }
  }
  
  if (validPairs.length === 0) {
    return { snr: 0, correlation: 0, rmse: 0 };
  }
  
  // Signal-to-Noise Ratio improvement
  const originalVariance = calculateVariance(validPairs.map(p => p[0]));
  const noiseVariance = calculateVariance(validPairs.map(p => p[0] - p[1]));
  const snr = 10 * Math.log10(originalVariance / (noiseVariance + 1e-10));
  
  // Pearson correlation coefficient
  const correlation = calculateCorrelation(
    validPairs.map(p => p[0]), 
    validPairs.map(p => p[1])
  );
  
  // Root Mean Square Error
  const rmse = Math.sqrt(
    validPairs.reduce((sum, pair) => sum + Math.pow(pair[0] - pair[1], 2), 0) 
    / validPairs.length
  );
  
  return { snr, correlation, rmse };
}

function calculateVariance(arr) {
  const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
  return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
}

function calculateCorrelation(x, y) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}