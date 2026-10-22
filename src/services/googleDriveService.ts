import { Auth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { googleProvider } from '../lib/firebase.js';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  trashed?: boolean;
  parents?: string[];
}

// In-memory token caching (MANDATORY: Never stored in localStorage or sessionStorage)
let cachedDriveAccessToken: string | null = null;
const listeners = new Set<(connected: boolean) => void>();

function notifyListeners() {
  const connected = !!cachedDriveAccessToken;
  listeners.forEach((listener) => listener(connected));
}

export const googleDriveService = {
  /**
   * Subscribe to Google Drive connection state changes
   */
  subscribe(listener: (connected: boolean) => void) {
    listeners.add(listener);
    listener(!!cachedDriveAccessToken);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Get current cached access token (in-memory only)
   */
  getAccessToken(): string | null {
    return cachedDriveAccessToken;
  },

  /**
   * Set or clear the cached access token
   */
  setAccessToken(token: string | null) {
    cachedDriveAccessToken = token;
    notifyListeners();
  },

  /**
   * Check if Drive is currently connected with a valid token
   */
  isConnected(): boolean {
    return !!cachedDriveAccessToken;
  },

  /**
   * Disconnect Google Drive
   */
  disconnect() {
    cachedDriveAccessToken = null;
    notifyListeners();
  },

  /**
   * Request Google Drive access using Firebase Auth GoogleAuthProvider
   */
  async connectDrive(auth: Auth): Promise<string> {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Google OAuth succeeded, but no Drive access token was returned.');
    }

    cachedDriveAccessToken = credential.accessToken;
    notifyListeners();
    return cachedDriveAccessToken;
  },

  /**
   * List files from Google Drive
   */
  async listFiles(options: { query?: string; folderId?: string; filterDocTypes?: boolean } = {}): Promise<DriveFile[]> {
    const token = cachedDriveAccessToken;
    if (!token) {
      throw new Error('Google Drive is not connected. Please connect Google Drive first.');
    }

    const queryParts: string[] = ['trashed = false'];

    if (options.folderId) {
      queryParts.push(`'${options.folderId}' in parents`);
    }

    if (options.query?.trim()) {
      queryParts.push(`name contains '${options.query.trim().replace(/'/g, "\\'")}'`);
    }

    if (options.filterDocTypes) {
      queryParts.push(
        "(mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType = 'text/plain' or mimeType = 'application/msword' or mimeType = 'application/vnd.google-apps.folder')"
      );
    }

    const q = encodeURIComponent(queryParts.join(' and '));
    const fields = encodeURIComponent('files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink, parents)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=folder,modifiedTime desc&pageSize=50`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      cachedDriveAccessToken = null;
      notifyListeners();
      throw new Error('Google Drive access token expired. Please reconnect your Google Drive.');
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Failed to fetch files from Google Drive (${res.status})`);
    }

    const data = await res.json();
    return data.files || [];
  },

  /**
   * Get or create the dedicated 'JobHub Pro Career Suite' folder
   */
  async getOrCreateJobHubFolder(): Promise<string> {
    const token = cachedDriveAccessToken;
    if (!token) throw new Error('Google Drive not connected');

    // Search for existing folder
    const folderName = 'JobHub Pro Career Suite';
    const q = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id, name)`;

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Dedicated folder for JobHub Pro exported resumes, cover letters, and application materials',
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Failed to create JobHub Pro Career Suite folder in Drive');
    }

    const folder = await createRes.json();
    return folder.id;
  },

  /**
   * Upload file into Google Drive (multipart upload)
   */
  async uploadFile(fileName: string, mimeType: string, content: Blob | string, folderId?: string): Promise<DriveFile> {
    const token = cachedDriveAccessToken;
    if (!token) throw new Error('Google Drive not connected');

    // Ensure we have a target folder
    const targetFolderId = folderId || (await this.getOrCreateJobHubFolder());

    const metadata = {
      name: fileName,
      mimeType,
      parents: [targetFolderId],
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    let fileBlob: Blob;
    if (content instanceof Blob) {
      fileBlob = content;
    } else {
      fileBlob = new Blob([content], { type: mimeType });
    }

    const metadataPart = new Blob(
      [`${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n${delimiter}Content-Type: ${mimeType}\r\n\r\n`],
      { type: 'text/plain' }
    );

    const closePart = new Blob([closeDelimiter], { type: 'text/plain' });
    const multipartBody = new Blob([metadataPart, fileBlob, closePart]);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Upload to Google Drive failed (${res.status})`);
    }

    return await res.json();
  },

  /**
   * Read text content from a Google Drive file (for AI Resume / Cover Letter Parsing)
   */
  async downloadFileAsText(fileId: string, mimeType?: string): Promise<string> {
    const token = cachedDriveAccessToken;
    if (!token) throw new Error('Google Drive not connected');

    let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    // If it's a native Google Doc, export as plain text
    if (mimeType === 'application/vnd.google-apps.document') {
      url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to download file content from Google Drive (${res.status})`);
    }

    return await res.text();
  },

  /**
   * Delete a file from Google Drive (Mandatory user confirmation required prior to calling)
   */
  async deleteFile(fileId: string): Promise<void> {
    const token = cachedDriveAccessToken;
    if (!token) throw new Error('Google Drive not connected');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok && res.status !== 204 && res.status !== 404) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to delete file from Google Drive (${res.status})`);
    }
  },
};
