const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { createWorker } = Tesseract;

async function extractTextFromPDF(buffer) {
  try {
    console.log('📄 Attempting text extraction from PDF...');
    
    // First try: standard text extraction
    const data = await pdf(buffer);
    
    if (data.text && data.text.trim().length > 100) {
      console.log(`✅ Text extracted successfully (${data.text.length} characters)`);
      return {
        text: data.text,
        pageCount: data.numpages,
        method: 'standard',
      };
    }

    console.log('⚠️ Standard extraction yielded minimal text, trying OCR...');
    
    // Second try: OCR for scanned PDFs
    const ocrText = await performOCR(buffer);
    
    return {
      text: ocrText,
      pageCount: data.numpages || 1,
      method: 'ocr',
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF document.');
  }
}

async function performOCR(buffer) {
  try {
    console.log('🔍 Starting OCR process with Tesseract.js...');
    
    const worker = await createWorker('eng');
    
    // Convert PDF buffer to image (simplified approach)
    // Note: For production, you may need pdf-to-png or similar library
    // This is a basic implementation
    const { data: { text } } = await worker.recognize(buffer);
    
    await worker.terminate();
    
    if (!text || text.trim().length < 50) {
      throw new Error('OCR produced minimal text. The PDF may be blank or corrupted.');
    }
    
    console.log(`✅ OCR complete (${text.length} characters extracted)`);
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('OCR processing failed. Please try pasting the text directly.');
  }
}

module.exports = {
  extractTextFromPDF,
};
