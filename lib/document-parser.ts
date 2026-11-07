import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'unknown';

export interface ParsedDocument {
  text: string;
  type: DocumentType;
  name: string;
  size: number;
}

export interface DocumentPickerResult {
  success: boolean;
  document?: ParsedDocument;
  error?: string;
}

export class DocumentParser {
  // Pick a document from the device
  static async pickDocument(): Promise<DocumentPickerResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Document selection canceled' };
      }

      const asset = result.assets[0];
      const documentType = this.getDocumentType(asset.mimeType || asset.name);
      
      // Read the file content
      const fileContent = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      let extractedText = '';
      
      // Extract text based on document type
      switch (documentType) {
        case 'txt':
          extractedText = await this.parseTextFile(fileContent);
          break;
        case 'pdf':
          extractedText = await this.parsePDFFile(asset.uri);
          break;
        case 'docx':
          extractedText = await this.parseDocxFile(asset.uri);
          break;
        default:
          extractedText = await this.parseTextFile(fileContent);
          break;
      }

      const parsedDocument: ParsedDocument = {
        text: extractedText,
        type: documentType,
        name: asset.name,
        size: asset.size || 0,
      };

      return { success: true, document: parsedDocument };
    } catch (error) {
      console.error('Document picking error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to pick document' 
      };
    }
  }

  // Get document type from MIME type or file extension
  private static getDocumentType(mimeTypeOrName: string): DocumentType {
    const mimeType = mimeTypeOrName.toLowerCase();
    
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('wordprocessingml.document') || mimeType.includes('.docx')) return 'docx';
    if (mimeType.includes('text/plain') || mimeType.includes('.txt')) return 'txt';
    
    // Try to detect from file name
    if (mimeType.includes('.pdf')) return 'pdf';
    if (mimeType.includes('.docx')) return 'docx';
    if (mimeType.includes('.txt')) return 'txt';
    
    return 'unknown';
  }

  // Parse plain text file
  private static async parseTextFile(base64Content: string): Promise<string> {
    try {
      // Decode base64 to get the actual text content
      const decodedContent = Buffer.from(base64Content, 'base64').toString('utf-8');
      return decodedContent;
    } catch (error) {
      console.error('Text parsing error:', error);
      throw new Error('Failed to parse text file');
    }
  }

  // Parse PDF file (basic implementation)
  private static async parsePDFFile(uri: string): Promise<string> {
    try {
      // For React Native, we'll use a basic text extraction approach
      // In a production app, you might want to use a more sophisticated PDF library
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        throw new Error('PDF file not found');
      }

      // Read file as base64 and attempt basic text extraction
      const base64Content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // This is a simplified approach - in production you'd use a proper PDF parsing library
      // For now, we'll extract readable text strings from the binary content
      const decodedContent = Buffer.from(base64Content, 'base64').toString('latin1');
      
      // Extract text patterns commonly found in PDFs
      const textMatches = decodedContent.match(/[a-zA-Z0-9\s.,;:!?'"()-]+/g) || [];
      const extractedText = textMatches
        .filter(text => text.trim().length > 3)
        .join(' ')
        .substring(0, 10000); // Limit to prevent memory issues

      return extractedText || 'Unable to extract text from PDF. The document may contain images or complex formatting.';
    } catch (error) {
      console.error('PDF parsing error:', error);
      return 'Failed to parse PDF file. The document may be password-protected or contain complex formatting.';
    }
  }

  // Parse DOCX file (basic implementation)
  private static async parseDocxFile(uri: string): Promise<string> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        throw new Error('DOCX file not found');
      }

      // Read file as base64
      const base64Content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // This is a simplified approach - in production you'd use a proper DOCX parsing library
      // For now, we'll extract readable text from the XML structure
      const decodedContent = Buffer.from(base64Content, 'base64').toString('latin1');
      
      // Extract text from DOCX XML structure
      const textMatches = decodedContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
      const extractedText = textMatches
        .map(match => match.replace(/<[^>]*>/g, '')) // Remove XML tags
        .filter(text => text.trim().length > 0)
        .join(' ')
        .substring(0, 10000); // Limit to prevent memory issues

      return extractedText || 'Unable to extract text from DOCX file. The document may be corrupted or use complex formatting.';
    } catch (error) {
      console.error('DOCX parsing error:', error);
      return 'Failed to parse DOCX file. The document may be corrupted or use an unsupported format.';
    }
  }

  // Validate if document has enough content for flashcard generation
  static validateDocumentContent(document: ParsedDocument): {
    isValid: boolean;
    reason?: string;
    suggestedMinLength?: number;
  } {
    const { text, type } = document;
    
    if (!text || text.trim().length === 0) {
      return { isValid: false, reason: 'Document appears to be empty or contains no readable text' };
    }

    const wordCount = text.trim().split(/\s+/).length;
    
    if (wordCount < 20) {
      return { 
        isValid: false, 
        reason: 'Document is too short to generate meaningful flashcards',
        suggestedMinLength: 20
      };
    }

    if (wordCount > 10000) {
      return { 
        isValid: false, 
        reason: 'Document is very long. Consider using a shorter section for better results.',
        suggestedMinLength: 1000
      };
    }

    // Check if content has enough variety for flashcards
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length < 5) {
      return { 
        isValid: false, 
        reason: 'Document needs more complete sentences to generate good flashcards' 
      };
    }

    return { isValid: true };
  }

  // Extract a summary of the document for preview
  static generateDocumentPreview(document: ParsedDocument, maxLength: number = 300): string {
    const { text, type } = document;
    
    if (!text || text.trim().length === 0) {
      return 'No readable content found in document.';
    }

    // Clean up the text
    const cleanText = text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,;:!?'"()-]/g, '') // Remove special characters
      .trim();

    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    // Try to cut at a sentence boundary
    const truncated = cleanText.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );

    if (lastSentenceEnd > maxLength * 0.7) {
      return truncated.substring(0, lastSentenceEnd + 1) + '\n\n...';
    }

    return truncated + '...';
  }

  // Get document statistics
  static getDocumentStats(document: ParsedDocument): {
    wordCount: number;
    characterCount: number;
    estimatedReadingTime: number; // in minutes
    type: DocumentType;
  } {
    const { text, type } = document;
    
    const wordCount = text.trim().split(/\s+/).length;
    const characterCount = text.length;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

    return {
      wordCount,
      characterCount,
      estimatedReadingTime,
      type,
    };
  }
}
