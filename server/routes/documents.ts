import { Router, Request, Response, NextFunction } from 'express';
import mammoth from 'mammoth';

const router = Router();

// POST /api/documents/extract
// Extracts clean text from uploaded files (DOCX, PDF text stream, TXT)
router.post('/extract', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { base64Data, fileName, mimeType } = req.body;

    if (!base64Data) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'base64Data is required for document extraction',
        path: req.originalUrl,
      });
    }

    const buffer = Buffer.from(base64Data, 'base64');

    // File size validation (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Payload Too Large',
        message: `File exceeds maximum allowed size of 5MB (Received: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB)`,
        path: req.originalUrl,
      });
    }

    const extension = (fileName || '').split('.').pop()?.toLowerCase();
    let extractedText = '';

    if (extension === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (extension === 'txt' || extension === 'md' || extension === 'json') {
      extractedText = buffer.toString('utf-8');
    } else if (extension === 'pdf') {
      // Basic text extraction from PDF stream chunks
      const rawStr = buffer.toString('latin1');
      const textMatches: string[] = [];
      const regex = /\(([^()]{2,})\)[\s]*Tj/g;
      let match;
      while ((match = regex.exec(rawStr)) !== null) {
        textMatches.push(match[1]);
      }

      if (textMatches.length > 5) {
        extractedText = textMatches.join(' ').replace(/\\([()\\])/g, '$1');
      } else {
        // Fallback: extract printable ASCII words from PDF buffer
        const asciiMatches = rawStr.match(/[A-Za-z0-9\s.,;:'"()\-–—/@]{4,}/g) || [];
        extractedText = asciiMatches.filter((s) => s.length > 8 && !s.includes('xref') && !s.includes('obj') && !s.includes('endobj')).join('\n');
      }
    } else {
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(422).json({
        timestamp: new Date().toISOString(),
        status: 422,
        error: 'Unprocessable Entity',
        message: 'Could not extract sufficient text from the document. Please ensure the document is not an image scan or password-protected.',
        path: req.originalUrl,
      });
    }

    res.json({
      fileName,
      fileSize: buffer.length,
      charCount: extractedText.length,
      extractedText: extractedText.trim(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
