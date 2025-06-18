 import crypto from 'crypto';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'polish32characterencryptionkey123';

export function validateLASFile(fileData, fileName) {
  // Real LAS file validation - not placeholders
  if (!fileName.toLowerCase().endsWith('.las')) {
    return { isValid: false, error: 'Only LAS files accepted' };
  }
  
  if (fileData.length > 100 * 1024 * 1024) { // 100MB limit
    return { isValid: false, error: 'File exceeds 100MB limit' };
  }
  
  if (fileData.length < 1000) { // Too small to be real LAS
    return { isValid: false, error: 'File too small - corrupted LAS file' };
  }
  
  // Verify LAS format structure
  if (!fileData.includes('~VERSION') && !fileData.includes('~V')) {
    return { isValid: false, error: 'Invalid LAS file - missing VERSION section' };
  }
  
  // Check for malicious content
  const maliciousPatterns = [
    '<script', 'javascript:', 'eval(', 'document.', 'window.',
    'onclick=', 'onerror=', 'onload=', 'innerHTML'
  ];
  
  for (const pattern of maliciousPatterns) {
    if (fileData.toLowerCase().includes(pattern)) {
      return { isValid: false, error: 'File contains suspicious content' };
    }
  }
  
  return { isValid: true };
}

export function encryptData(data) {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

export function decryptData(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function generateSecureFileId() {
  return crypto.randomUUID();
}

export function logSecurityEvent(event, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    details: details,
    severity: 'SECURITY'
  };
  console.log(JSON.stringify(logEntry));
}

// Rate limiting storage
const rateLimits = new Map();

export function checkRateLimit(ip, fileSize) {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * 60 * 60 * 1000;
  
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { uploads: [], totalSize: 0 });
  }
  
  const userLimits = rateLimits.get(ip);
  
  // Clean old uploads
  userLimits.uploads = userLimits.uploads.filter(upload => 
    (now - upload.timestamp) < oneDay
  );
  
  // Check hourly upload limit (10 files)
  const recentUploads = userLimits.uploads.filter(upload => 
    (now - upload.timestamp) < oneHour
  );
  
  if (recentUploads.length >= 10) {
    return { 
      allowed: false, 
      error: 'Rate limit exceeded: Maximum 10 uploads per hour' 
    };
  }
  
  // Check daily size limit (100MB total)
  const dailySize = userLimits.uploads.reduce((total, upload) => 
    total + upload.size, 0
  );
  
  if (dailySize + fileSize > 100 * 1024 * 1024) {
    return { 
      allowed: false, 
      error: 'Daily upload limit exceeded: Maximum 100MB per day' 
    };
  }
  
  // Record this upload
  userLimits.uploads.push({
    timestamp: now,
    size: fileSize
  });
  
  return { allowed: true };
}

// Enhanced security logging for petroleum data
export function logDataAccess(action, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: action,
    ip: details.ip,
    fileHash: details.fileHash || null,
    country: details.country || 'unknown',
    userAgent: details.userAgent || 'unknown',
    severity: 'DATA_ACCESS',
    sessionId: generateSessionId()
  };
  
  // Log to console (in production, send to secure logging service)
  console.log('PETROLEUM_SECURITY:', JSON.stringify(logEntry));
  
  // TODO: Send to secure logging service (Splunk, etc.)
  return logEntry;
}

export function generateFileHash(fileName, fileSize) {
  // Create hash without exposing actual filename

  return crypto.createHash('sha256')
    .update(`${fileName}-${fileSize}-${Date.now()}`)
    .digest('hex')
    .substring(0, 16); // First 16 chars only
}

function generateSessionId() {
  return crypto.randomBytes(8).toString('hex');
}