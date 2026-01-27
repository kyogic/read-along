/**
 * OCR Service for ScanToLearn
 * Uses Tesseract.js for text recognition
 */

class OCRService {
    constructor() {
        this.worker = null;
        this.currentLanguage = 'jpn';
        this.lineGroupingThreshold = 0.5; // Fraction of average character height
    }

    /**
     * Initialize or reinitialize the Tesseract worker with a specific language
     * @param {string} language - Tesseract language code (e.g., 'jpn', 'eng')
     * @param {Function} progressCallback - Callback for progress updates
     */
    async initWorker(language, progressCallback) {
        // Terminate existing worker if language changed
        if (this.worker && this.currentLanguage !== language) {
            await this.worker.terminate();
            this.worker = null;
        }

        if (!this.worker) {
            this.worker = await Tesseract.createWorker(language, 1, {
                logger: (m) => {
                    if (progressCallback && m.status) {
                        let statusText = m.status;
                        let progress = m.progress || 0;

                        // Map Tesseract status to user-friendly text
                        if (m.status === 'loading tesseract core') {
                            statusText = 'Loading OCR engine...';
                        } else if (m.status === 'initializing tesseract') {
                            statusText = 'Initializing...';
                        } else if (m.status === 'loading language traineddata') {
                            statusText = `Loading ${this.getLanguageName(language)} language data...`;
                        } else if (m.status === 'initializing api') {
                            statusText = 'Preparing OCR...';
                        } else if (m.status === 'recognizing text') {
                            statusText = 'Recognizing text...';
                        }

                        progressCallback(statusText, progress);
                    }
                }
            });
            this.currentLanguage = language;
        }

        return this.worker;
    }

    /**
     * Recognize text tokens from an image
     * @param {string|File|Blob} image - Image source
     * @param {string} language - Language code
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Array>} Array of token objects
     */
    async recognizeTokens(image, language, progressCallback) {
        const worker = await this.initWorker(language, progressCallback);

        // Perform OCR
        const result = await worker.recognize(image);

        // Extract tokens from result
        const tokens = this.processResult(result);

        // Sort tokens in reading order
        const sortedTokens = this.sortTokensInReadingOrder(tokens);

        return sortedTokens;
    }

    /**
     * Process Tesseract result into token objects
     * @param {Object} result - Tesseract recognition result
     * @returns {Array} Array of token objects
     */
    processResult(result) {
        const tokens = [];

        if (!result.data || !result.data.words) {
            return tokens;
        }

        for (const word of result.data.words) {
            // Skip empty or whitespace-only words
            if (!word.text || !word.text.trim()) {
                continue;
            }

            // Calculate normalized bounding box (0-1 range)
            const pageWidth = result.data.width || 1;
            const pageHeight = result.data.height || 1;

            const boundingBox = {
                x: word.bbox.x0 / pageWidth,
                y: 1 - (word.bbox.y1 / pageHeight), // Flip Y to match Vision coordinate system
                width: (word.bbox.x1 - word.bbox.x0) / pageWidth,
                height: (word.bbox.y1 - word.bbox.y0) / pageHeight
            };

            tokens.push({
                id: this.generateId(),
                text: word.text.trim(),
                confidence: word.confidence / 100, // Normalize to 0-1
                boundingBox: boundingBox,
                // Computed properties for sorting
                centerX: boundingBox.x + boundingBox.width / 2,
                centerY: boundingBox.y + boundingBox.height / 2
            });
        }

        return tokens;
    }

    /**
     * Sort tokens in reading order (top-to-bottom, left-to-right)
     * Groups tokens into lines based on Y position
     * @param {Array} tokens - Array of token objects
     * @returns {Array} Sorted array of tokens
     */
    sortTokensInReadingOrder(tokens) {
        if (tokens.length === 0) {
            return [];
        }

        // Calculate average token height for line grouping threshold
        const avgHeight = tokens.reduce((sum, t) => sum + t.boundingBox.height, 0) / tokens.length;
        const threshold = avgHeight * this.lineGroupingThreshold;

        // Group tokens into lines based on Y position
        const lines = [];

        for (const token of tokens) {
            let addedToLine = false;

            for (let i = 0; i < lines.length; i++) {
                // Check if token belongs to this line (similar Y position)
                if (lines[i].length > 0) {
                    const firstInLine = lines[i][0];
                    const yDiff = Math.abs(token.centerY - firstInLine.centerY);

                    if (yDiff <= threshold) {
                        lines[i].push(token);
                        addedToLine = true;
                        break;
                    }
                }
            }

            if (!addedToLine) {
                lines.push([token]);
            }
        }

        // Sort lines by Y position (descending - higher Y = top of page in our coordinate system)
        lines.sort((line1, line2) => {
            if (line1.length === 0 || line2.length === 0) return 0;
            return line2[0].centerY - line1[0].centerY;
        });

        // Sort tokens within each line by X position (left to right)
        for (const line of lines) {
            line.sort((a, b) => a.centerX - b.centerX);
        }

        // Flatten into single array
        return lines.flat();
    }

    /**
     * Generate a unique ID for a token
     */
    generateId() {
        return 'token_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get human-readable language name
     */
    getLanguageName(code) {
        const names = {
            'jpn': 'Japanese',
            'eng': 'English',
            'spa': 'Spanish',
            'fra': 'French',
            'deu': 'German',
            'chi_sim': 'Chinese (Simplified)',
            'kor': 'Korean'
        };
        return names[code] || code;
    }

    /**
     * Terminate the worker when done
     */
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
    }
}

// Export for use in other modules
window.OCRService = OCRService;
