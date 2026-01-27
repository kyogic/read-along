# ScanToLearn Web

A browser-based app for learning vocabulary from images. Upload an image containing text, and the app will recognize the text using OCR and display it as interactive word tokens. Tap any word to reveal its meaning.

**Works on Windows, Mac, and Linux** - Just open in a browser!

## Features

- **OCR Text Recognition**: Uses Tesseract.js for client-side text recognition
- **Multi-language Support**: Japanese, English, Spanish, French, German, Chinese, Korean
- **Interactive Learning**: Click tokens to reveal meanings, parts of speech, and example sentences
- **Multiple Input Methods**:
  - File upload
  - Drag and drop
  - Paste from clipboard (Ctrl+V)
- **No Server Required**: Runs entirely in the browser

## Quick Start (Windows)

### Option 1: Direct File Open

1. Navigate to the `ScanToLearnWeb` folder
2. Double-click `index.html` to open in your default browser
3. Start using the app!

> **Note**: Some browsers may restrict features when opening files directly. If you experience issues, use Option 2.

### Option 2: Local Server (Recommended)

#### Using Python (if installed)

```cmd
cd ScanToLearnWeb
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

#### Using Node.js (if installed)

```cmd
cd ScanToLearnWeb
npx serve
```
Then open the URL shown in the terminal.

#### Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Open the `ScanToLearnWeb` folder in VS Code
3. Right-click `index.html` and select "Open with Live Server"

## How to Use

### 1. Select Languages

On the home screen, choose your **source language** (the language in your image) and **target language** (the language for translations).

Default: Japanese → English

### 2. Upload an Image

Three ways to add an image:

- **Click "Upload Image"** - Select an image file from your computer
- **Drag and Drop** - Drag an image file onto the browser window
- **Paste** - Copy an image to clipboard and press Ctrl+V (or click "Paste from Clipboard")

Supported formats: JPG, PNG, GIF, WebP

### 3. Wait for OCR

The app will:
1. Download language data (first time only, ~10-30MB depending on language)
2. Process the image to recognize text
3. Translate each word

### 4. Review Words

- **Click a word** to reveal/hide its meaning
- **Right-click (or long-press on mobile)** to see full details including:
  - Meaning
  - Part of speech
  - Example sentence
  - OCR confidence score
- Use **Reveal All / Hide All** buttons to toggle all words

## Project Structure

```
ScanToLearnWeb/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── app.js              # Main application logic
│   ├── ocr-service.js      # Tesseract.js OCR wrapper
│   └── translation-service.js  # Translation with caching
└── README.md
```

## Technical Details

### OCR Engine

Uses [Tesseract.js](https://tesseract.projectnaptha.com/) v5, which runs entirely in the browser using WebAssembly. Language data is downloaded on first use and cached by the browser.

### Token Sorting

Tokens are sorted in reading order:
1. Grouped into lines based on Y-position (with threshold for slight variations)
2. Lines sorted top-to-bottom
3. Words within each line sorted left-to-right

### Translation

Uses a stub `TranslationService` with:
- In-memory caching (Map-based)
- Sample translations for common words
- Placeholder translations for unknown words

To integrate a real translation API, modify `js/translation-service.js`.

## Browser Compatibility

Tested on:
- Chrome 90+
- Firefox 90+
- Edge 90+
- Safari 15+

Requires:
- JavaScript enabled
- WebAssembly support (all modern browsers)

## Troubleshooting

### "No text found in image"

- Ensure the image contains clear, readable text
- Try a higher resolution image
- Ensure the correct source language is selected

### OCR is slow

- First-time OCR downloads language data (~10-30MB)
- Subsequent uses are faster (data is cached)
- Large images take longer to process

### Clipboard paste not working

- Some browsers require HTTPS for clipboard access
- Try using a local server (see Option 2 above)
- Use file upload or drag-and-drop instead

### Translations are placeholders

This is expected! The app uses stub translations for demo purposes. To get real translations, integrate a translation API (DeepL, Google Translate, etc.) in `translation-service.js`.

## Offline Use

After the first use, the app works offline:
- Tesseract language data is cached by the browser
- All processing happens locally
- No server communication required

## License

This project is provided as-is for educational purposes.
