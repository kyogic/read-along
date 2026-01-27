/**
 * ScanToLearn Web App
 * Main application logic
 */

class ScanToLearnApp {
    constructor() {
        // Services
        this.ocrService = new OCRService();
        this.translationService = new TranslationService();

        // State
        this.currentImage = null;
        this.tokens = [];
        this.translatedTokens = [];
        this.revealedTokenIds = new Set();

        // DOM Elements
        this.screens = {
            home: document.getElementById('home-screen'),
            processing: document.getElementById('processing-screen'),
            review: document.getElementById('review-screen')
        };

        this.elements = {
            fileInput: document.getElementById('file-input'),
            pasteBtn: document.getElementById('paste-btn'),
            sourceLanguage: document.getElementById('source-language'),
            targetLanguage: document.getElementById('target-language'),
            swapLanguages: document.getElementById('swap-languages'),
            processingStatus: document.getElementById('processing-status'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            backBtn: document.getElementById('back-btn'),
            revealAllBtn: document.getElementById('reveal-all-btn'),
            hideAllBtn: document.getElementById('hide-all-btn'),
            previewImage: document.getElementById('preview-image'),
            expandImageBtn: document.getElementById('expand-image-btn'),
            tokensContainer: document.getElementById('tokens-container'),
            tokensCount: document.getElementById('tokens-count'),
            imageModal: document.getElementById('image-modal'),
            modalImage: document.getElementById('modal-image'),
            closeModalBtn: document.getElementById('close-modal-btn'),
            tokenPopover: document.getElementById('token-popover')
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.setupDragAndDrop();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // File input
        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleImageUpload(e.target.files[0]);
            }
        });

        // Paste from clipboard
        this.elements.pasteBtn.addEventListener('click', () => this.handlePaste());

        // Language swap
        this.elements.swapLanguages.addEventListener('click', () => this.swapLanguages());

        // Back button
        this.elements.backBtn.addEventListener('click', () => this.showScreen('home'));

        // Reveal/Hide all
        this.elements.revealAllBtn.addEventListener('click', () => this.revealAll());
        this.elements.hideAllBtn.addEventListener('click', () => this.hideAll());

        // Image modal
        this.elements.expandImageBtn.addEventListener('click', () => this.openImageModal());
        this.elements.closeModalBtn.addEventListener('click', () => this.closeImageModal());
        this.elements.imageModal.addEventListener('click', (e) => {
            if (e.target === this.elements.imageModal) {
                this.closeImageModal();
            }
        });

        // Close popover on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.token') && !e.target.closest('.popover')) {
                this.hidePopover();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeImageModal();
                this.hidePopover();
            }
            // Ctrl/Cmd + V to paste
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                this.handlePaste();
            }
        });

        // Global paste event
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (items) {
                for (const item of items) {
                    if (item.type.startsWith('image/')) {
                        e.preventDefault();
                        const file = item.getAsFile();
                        if (file) {
                            this.handleImageUpload(file);
                        }
                        break;
                    }
                }
            }
        });
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        // Create drag overlay
        const overlay = document.createElement('div');
        overlay.className = 'drag-overlay';
        overlay.innerHTML = `
            <div class="drag-overlay-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <h3>Drop image here</h3>
            </div>
        `;
        document.body.appendChild(overlay);

        let dragCounter = 0;

        document.addEventListener('dragenter', (e) => {
            e.preventDefault();
            dragCounter++;
            overlay.classList.add('active');
        });

        document.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dragCounter--;
            if (dragCounter === 0) {
                overlay.classList.remove('active');
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;
            overlay.classList.remove('active');

            const files = e.dataTransfer?.files;
            if (files && files[0] && files[0].type.startsWith('image/')) {
                this.handleImageUpload(files[0]);
            }
        });
    }

    /**
     * Handle image upload
     * @param {File} file - Image file
     */
    async handleImageUpload(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        // Store image
        this.currentImage = file;

        // Create image URL for preview
        const imageUrl = URL.createObjectURL(file);
        this.elements.previewImage.src = imageUrl;
        this.elements.modalImage.src = imageUrl;

        // Show processing screen
        this.showScreen('processing');

        try {
            // Perform OCR
            const sourceLanguage = this.elements.sourceLanguage.value;
            const targetLanguage = this.elements.targetLanguage.value;

            this.tokens = await this.ocrService.recognizeTokens(
                file,
                sourceLanguage,
                (status, progress) => this.updateProgress(status, progress)
            );

            if (this.tokens.length === 0) {
                throw new Error('No text found in the image');
            }

            // Translate tokens
            this.updateProgress('Translating...', 0.9);
            this.translatedTokens = [];

            for (const token of this.tokens) {
                const translation = await this.translationService.translate(
                    token.text,
                    sourceLanguage,
                    targetLanguage
                );

                this.translatedTokens.push({
                    ...token,
                    translation
                });
            }

            // Reset revealed state
            this.revealedTokenIds.clear();

            // Show review screen
            this.showScreen('review');
            this.renderTokens();

        } catch (error) {
            console.error('OCR Error:', error);
            this.showError(error.message);
        }
    }

    /**
     * Handle paste from clipboard
     */
    async handlePaste() {
        try {
            const clipboardItems = await navigator.clipboard.read();

            for (const item of clipboardItems) {
                for (const type of item.types) {
                    if (type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        const file = new File([blob], 'pasted-image.png', { type });
                        this.handleImageUpload(file);
                        return;
                    }
                }
            }

            alert('No image found in clipboard. Copy an image first, then try again.');
        } catch (error) {
            console.error('Paste error:', error);
            alert('Could not read from clipboard. Please use the file upload button instead.');
        }
    }

    /**
     * Swap source and target languages
     */
    swapLanguages() {
        const source = this.elements.sourceLanguage.value;
        const target = this.elements.targetLanguage.value;
        this.elements.sourceLanguage.value = target;
        this.elements.targetLanguage.value = source;
    }

    /**
     * Update progress display
     */
    updateProgress(status, progress) {
        this.elements.processingStatus.textContent = status;
        const percent = Math.round(progress * 100);
        this.elements.progressFill.style.width = `${percent}%`;
        this.elements.progressText.textContent = `${percent}%`;
    }

    /**
     * Show a specific screen
     */
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }

        // Reset file input when going back to home
        if (screenName === 'home') {
            this.elements.fileInput.value = '';
        }
    }

    /**
     * Render tokens in the review screen
     */
    renderTokens() {
        this.elements.tokensContainer.innerHTML = '';

        if (this.translatedTokens.length === 0) {
            this.elements.tokensContainer.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <h3>No text found</h3>
                    <p>Try another image with clearer text</p>
                </div>
            `;
            return;
        }

        for (const token of this.translatedTokens) {
            const isRevealed = this.revealedTokenIds.has(token.id);
            const tokenEl = this.createTokenElement(token, isRevealed);
            this.elements.tokensContainer.appendChild(tokenEl);
        }

        this.updateTokensCount();
    }

    /**
     * Create a token DOM element
     */
    createTokenElement(token, isRevealed) {
        const el = document.createElement('div');
        el.className = `token${isRevealed ? ' revealed' : ''}`;
        el.dataset.tokenId = token.id;

        el.innerHTML = `
            <div class="token-text">${this.escapeHtml(token.text)}</div>
            <div class="token-meaning">${this.escapeHtml(token.translation.meaning)}</div>
            ${token.translation.partOfSpeech ?
                `<div class="token-pos">${this.escapeHtml(token.translation.partOfSpeech)}</div>` :
                ''}
        `;

        // Click to toggle reveal
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleToken(token.id);
        });

        // Long press / right click for popover
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showPopover(token, el);
        });

        // Touch and hold for mobile
        let touchTimer;
        el.addEventListener('touchstart', (e) => {
            touchTimer = setTimeout(() => {
                this.showPopover(token, el);
            }, 500);
        });

        el.addEventListener('touchend', () => {
            clearTimeout(touchTimer);
        });

        el.addEventListener('touchmove', () => {
            clearTimeout(touchTimer);
        });

        return el;
    }

    /**
     * Toggle a token's revealed state
     */
    toggleToken(tokenId) {
        if (this.revealedTokenIds.has(tokenId)) {
            this.revealedTokenIds.delete(tokenId);
        } else {
            this.revealedTokenIds.add(tokenId);
        }

        // Update DOM
        const tokenEl = this.elements.tokensContainer.querySelector(`[data-token-id="${tokenId}"]`);
        if (tokenEl) {
            tokenEl.classList.toggle('revealed', this.revealedTokenIds.has(tokenId));
        }

        this.updateTokensCount();
    }

    /**
     * Reveal all tokens
     */
    revealAll() {
        this.translatedTokens.forEach(token => {
            this.revealedTokenIds.add(token.id);
        });

        this.elements.tokensContainer.querySelectorAll('.token').forEach(el => {
            el.classList.add('revealed');
        });

        this.updateTokensCount();
    }

    /**
     * Hide all tokens
     */
    hideAll() {
        this.revealedTokenIds.clear();

        this.elements.tokensContainer.querySelectorAll('.token').forEach(el => {
            el.classList.remove('revealed');
        });

        this.updateTokensCount();
    }

    /**
     * Update the tokens count display
     */
    updateTokensCount() {
        const revealed = this.revealedTokenIds.size;
        const total = this.translatedTokens.length;
        this.elements.tokensCount.textContent = `${revealed}/${total}`;
    }

    /**
     * Show token detail popover
     */
    showPopover(token, anchorEl) {
        const popover = this.elements.tokenPopover;

        // Update content
        document.getElementById('popover-word').textContent = token.text;
        document.getElementById('popover-meaning').textContent = token.translation.meaning;

        const posSection = document.getElementById('popover-pos-section');
        const posEl = document.getElementById('popover-pos');
        if (token.translation.partOfSpeech) {
            posEl.textContent = token.translation.partOfSpeech;
            posSection.style.display = 'block';
        } else {
            posSection.style.display = 'none';
        }

        const exampleSection = document.getElementById('popover-example-section');
        const exampleEl = document.getElementById('popover-example');
        if (token.translation.exampleSentence) {
            exampleEl.textContent = token.translation.exampleSentence;
            exampleSection.style.display = 'block';
        } else {
            exampleSection.style.display = 'none';
        }

        // Confidence
        const confidence = token.confidence;
        const confidenceFill = document.getElementById('popover-confidence-fill');
        const confidenceText = document.getElementById('popover-confidence-text');

        confidenceFill.style.width = `${confidence * 100}%`;
        confidenceFill.className = 'confidence-fill';
        if (confidence >= 0.9) {
            confidenceFill.classList.add('high');
        } else if (confidence >= 0.7) {
            confidenceFill.classList.add('medium');
        } else {
            confidenceFill.classList.add('low');
        }
        confidenceText.textContent = `${Math.round(confidence * 100)}%`;

        // Position popover
        const rect = anchorEl.getBoundingClientRect();
        popover.style.left = `${rect.left}px`;
        popover.style.top = `${rect.bottom + 8}px`;

        // Adjust if off screen
        popover.classList.remove('hidden');
        const popoverRect = popover.getBoundingClientRect();

        if (popoverRect.right > window.innerWidth) {
            popover.style.left = `${window.innerWidth - popoverRect.width - 16}px`;
        }

        if (popoverRect.bottom > window.innerHeight) {
            popover.style.top = `${rect.top - popoverRect.height - 8}px`;
        }
    }

    /**
     * Hide the popover
     */
    hidePopover() {
        this.elements.tokenPopover.classList.add('hidden');
    }

    /**
     * Open image modal
     */
    openImageModal() {
        this.elements.imageModal.classList.add('active');
    }

    /**
     * Close image modal
     */
    closeImageModal() {
        this.elements.imageModal.classList.remove('active');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.elements.tokensContainer.innerHTML = `
            <div class="error-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h3>Something went wrong</h3>
                <p>${this.escapeHtml(message)}</p>
                <button class="btn btn-primary" onclick="app.showScreen('home')">Try Again</button>
            </div>
        `;
        this.showScreen('review');
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ScanToLearnApp();
});
