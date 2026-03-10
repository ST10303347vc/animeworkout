// Auto-generated chapter text content extracted from PDFs
// Import the raw JSON data
const chapterTexts: Record<string, string> = require('./chapterTexts.json');

/**
 * Get the extracted text for a given chapter PDF filename.
 * Returns cleaned-up text with tabs replaced by spaces.
 */
export function getChapterText(pdfFilename: string): string {
    const raw = chapterTexts[pdfFilename] || '';
    // Clean up: replace tabs with spaces, normalize whitespace
    return raw
        .replace(/\t/g, ' ')
        .replace(/ {2,}/g, ' ')
        .trim();
}

export default chapterTexts;
