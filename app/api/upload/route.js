import { NextResponse } from 'next/server';
import { validateLASFile, encryptData, generateSecureFileId, logSecurityEvent, checkRateLimit, logDataAccess, generateFileHash } from '../../../lib/security.js';

// Temporary file storage
const fileStorage = new Map();

// Auto-cleanup expired files every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (let [fileId, file] of fileStorage) {
    if (now > file.expiry) {
      fileStorage.delete(fileId);
    }
  }
}, 15 * 60 * 1000);

export async function POST(request) {
  try {
    // Enhanced security logging
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIP = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    const country = request.headers.get('cf-ipcountry') || 
                   request.headers.get('x-vercel-ip-country') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const body = await request.json();
    const { fileData, fileName } = body;
    
    if (!fileData || !fileName) {
      return NextResponse.json(
        { error: 'Missing file data or filename' },
        { status: 400 }
      );
    }
    
    // Generate secure file hash for logging
    const fileHash = generateFileHash(fileName, fileData.length);
    
    // Log data access attempt
    logDataAccess('UPLOAD_ATTEMPT', {
      ip: clientIP,
      country: country,
      userAgent: userAgent,
      fileHash: fileHash,
      fileSize: fileData.length
    });
    
    // Rate limiting
    const rateCheck = checkRateLimit(clientIP, fileData.length);
    if (!rateCheck.allowed) {
      logDataAccess('RATE_LIMIT_VIOLATION', {
        ip: clientIP,
        country: country,
        error: rateCheck.error
      });
      
      return NextResponse.json(
        { error: rateCheck.error },
        { status: 429 }
      );
    }
    
    // Validate LAS file
    const validation = validateLASFile(fileData, fileName);
    if (!validation.isValid) {
      logDataAccess('INVALID_FILE_REJECTED', {
        ip: clientIP,
        country: country,
        fileHash: fileHash,
        error: validation.error
      });
      
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Encrypt and store
    const encryptedData = encryptData(fileData);
    const fileId = generateSecureFileId();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    fileStorage.set(fileId, {
      data: encryptedData,
      fileName: fileName,
      fileHash: fileHash,
      expiry: expiresAt.getTime(),
      clientIP: clientIP,
      country: country
    });
    
    // Log successful upload
    logDataAccess('UPLOAD_SUCCESS', {
      ip: clientIP,
      country: country,
      fileHash: fileHash,
      fileId: fileId
    });
    
    return NextResponse.json({
      success: true,
      fileId: fileId,
      fileName: fileName,
      expiresAt: expiresAt.toISOString(),
      message: 'File uploaded and encrypted successfully'
    });
    
  } catch (error) {
    logDataAccess('UPLOAD_ERROR', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: 'Upload failed - please try again' },
      { status: 500 }
    );
  }
}

// Export storage access for other APIs
export function getStoredFile(fileId) {
  const file = fileStorage.get(fileId);
  if (!file || Date.now() > file.expiry) {
    fileStorage.delete(fileId);
    return null;
  }
  return file;
}