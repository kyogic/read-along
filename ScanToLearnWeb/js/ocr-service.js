/**
 * OCR Service for ScanToLearn
 * Uses Tesseract.js for text recognition
 */

class OCRService {
    constructor(options = {}) {
        this.worker = null;
        this.currentLanguage = 'jpn';
        this.lineGroupingThreshold = 0.5;

        // Configurable filtering options
        this.options = {
            // Minimum confidence threshold (0-1). Words below this are filtered out.
            minConfidence: options.minConfidence ?? 0.50,

            // Minimum word length (characters)
            minWordLength: options.minWordLength ?? 1,

            // Filter out pure punctuation/symbols
            filterPunctuation: options.filterPunctuation ?? true,

            // Filter out pure numbers (often misdetections)
            filterNumbers: options.filterNumbers ?? false,

            // Minimum bounding box size (fraction of image). Filters tiny artifacts.
            minBboxSize: options.minBboxSize ?? 0.001,

            // Characters to always filter out (common OCR artifacts)
            filterCharacters: options.filterCharacters ?? ['|', '/', '\\', '_', '-', '—', '~', '*', '`', '"', "'", '.', ',', '!', '?', ':', ';', '(', ')', '[', ']', '{', '}', '<', '>', '=', '+'],

            ...options
        };
    }

    /**
     * Update OCR options
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
    }

    /**
     * Initialize or reinitialize the Tesseract worker with a specific language
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
     */
    async recognizeTokens(image, language, progressCallback) {
        const worker = await this.initWorker(language, progressCallback);

        // Perform OCR
        const result = await worker.recognize(image);

        // Extract and filter tokens
        const tokens = this.processResult(result);

        // Sort tokens in reading order
        const sortedTokens = this.sortTokensInReadingOrder(tokens);

        return sortedTokens;
    }

    /**
     * Process Tesseract result into token objects with filtering
     */
    processResult(result) {
        const tokens = [];

        if (!result.data || !result.data.words) {
            return tokens;
        }

        const pageWidth = result.data.width || 1;
        const pageHeight = result.data.height || 1;

        for (const word of result.data.words) {
            // Skip empty words
            if (!word.text || !word.text.trim()) {
                continue;
            }

            const text = word.text.trim();
            const confidence = word.confidence / 100;

            // Calculate bounding box
            const bboxWidth = (word.bbox.x1 - word.bbox.x0) / pageWidth;
            const bboxHeight = (word.bbox.y1 - word.bbox.y0) / pageHeight;
            const bboxSize = bboxWidth * bboxHeight;

            // Apply filters
            if (!this.passesFilters(text, confidence, bboxSize)) {
                continue;
            }

            const boundingBox = {
                x: word.bbox.x0 / pageWidth,
                y: 1 - (word.bbox.y1 / pageHeight),
                width: bboxWidth,
                height: bboxHeight
            };

            tokens.push({
                id: this.generateId(),
                text: text,
                confidence: confidence,
                boundingBox: boundingBox,
                centerX: boundingBox.x + boundingBox.width / 2,
                centerY: boundingBox.y + boundingBox.height / 2
            });
        }

        return tokens;
    }

    /**
     * Check if a word passes all configured filters
     */
    passesFilters(text, confidence, bboxSize) {
        // Confidence filter
        if (confidence < this.options.minConfidence) {
            return false;
        }

        // Minimum length filter
        if (text.length < this.options.minWordLength) {
            return false;
        }

        // Bounding box size filter (filter tiny artifacts)
        if (bboxSize < this.options.minBboxSize) {
            return false;
        }

        // Filter single characters that are common OCR artifacts
        if (this.options.filterCharacters.includes(text)) {
            return false;
        }

        // Filter pure punctuation
        if (this.options.filterPunctuation && this.isPunctuation(text)) {
            return false;
        }

        // Filter pure numbers (optional)
        if (this.options.filterNumbers && /^[0-9]+$/.test(text)) {
            return false;
        }

        // Filter strings that are only symbols/artifacts
        if (this.isLikelyArtifact(text)) {
            return false;
        }

        return true;
    }

    /**
     * Check if text is only punctuation/symbols
     */
    isPunctuation(text) {
        // Common punctuation and symbols
        const punctuationRegex = /^[\s\.,!?\-_=+*\/\\|@#$%^&()[\]{}<>:;"'`~]+$/;
        return punctuationRegex.test(text);
    }

    /**
     * Check if text looks like an OCR artifact
     */
    isLikelyArtifact(text) {
        // Single character that's just a line or dot
        if (text.length === 1) {
            const artifacts = ['|', '/', '\\', '-', '_', '.', ',', '`', "'", '"', '*', '~', '^'];
            if (artifacts.includes(text)) {
                return true;
            }
        }

        // Repeated single characters (often artifacts)
        if (text.length > 1 && /^(.)\1+$/.test(text)) {
            return true;
        }

        // Only whitespace and punctuation
        if (/^[\s\p{P}\p{S}]+$/u.test(text)) {
            return true;
        }

        // Very short strings of only ASCII that aren't real words
        if (text.length <= 2 && /^[^a-zA-Z\u3040-\u9FFF]+$/.test(text)) {
            return true;
        }

        return false;
    }

    /**
     * Sort tokens in reading order (top-to-bottom, left-to-right)
     */
    sortTokensInReadingOrder(tokens) {
        if (tokens.length === 0) {
            return [];
        }

        const avgHeight = tokens.reduce((sum, t) => sum + t.boundingBox.height, 0) / tokens.length;
        const threshold = avgHeight * this.lineGroupingThreshold;

        const lines = [];

        for (const token of tokens) {
            let addedToLine = false;

            for (let i = 0; i < lines.length; i++) {
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

        lines.sort((line1, line2) => {
            if (line1.length === 0 || line2.length === 0) return 0;
            return line2[0].centerY - line1[0].centerY;
        });

        for (const line of lines) {
            line.sort((a, b) => a.centerX - b.centerX);
        }

        return lines.flat();
    }

    /**
     * Generate a unique ID
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
     * Terminate the worker
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
