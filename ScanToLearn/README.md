# ScanToLearn

An iOS app that helps you learn vocabulary by scanning text from images. Take a photo or select an image, and the app will recognize the text using OCR, display it as tappable word tokens, and reveal meanings on tap.

## Features

- **OCR Text Recognition**: Uses Apple Vision framework for accurate text recognition
- **Multi-language Support**: Japanese, English, Spanish, French, German, Chinese, Korean
- **Interactive Learning**: Tap tokens to reveal meanings, parts of speech, and example sentences
- **Camera & Photo Library**: Capture new images or select existing photos
- **Reading Order**: Intelligent sorting of recognized text in natural reading order

## Requirements

- **Xcode 15.0+**
- **iOS 17.0+**
- **macOS Sonoma 14.0+** (for development)

## Running in iPhone Simulator

### Step 1: Open the Project

1. Open Xcode
2. Select **File > Open** (or press `Cmd + O`)
3. Navigate to `ScanToLearn/ScanToLearn.xcodeproj` and click **Open**

### Step 2: Select a Simulator

1. In the Xcode toolbar, click on the device selector (next to the Play button)
2. Under **iOS Simulators**, select an iPhone (e.g., "iPhone 15" or "iPhone 15 Pro")
3. Make sure it shows iOS 17.0 or later

### Step 3: Build and Run

1. Click the **Play** button (▶) or press `Cmd + R`
2. Wait for the build to complete
3. The simulator will launch with the ScanToLearn app

### Step 4: Test the App

Since the camera is not available in the simulator, use **Upload from Photos**:

1. In the simulator, open the **Photos** app
2. Drag and drop an image containing text onto the simulator window to add it to Photos
3. Return to ScanToLearn and tap **Upload from Photos**
4. Select your image
5. The app will perform OCR and display the recognized words as tappable tokens
6. Tap any token to reveal its meaning

## Running on a Real Device

### Step 1: Configure Signing

1. Open the project in Xcode
2. Select the **ScanToLearn** target in the project navigator
3. Go to the **Signing & Capabilities** tab
4. Select your **Team** from the dropdown
5. If you don't have a team, sign in with your Apple ID (free account works)

### Step 2: Connect Your Device

1. Connect your iPhone via USB
2. Trust the computer on your iPhone if prompted
3. Select your iPhone from the device selector in Xcode

### Step 3: Build and Run

1. Click the **Play** button (▶) or press `Cmd + R`
2. If prompted, trust the developer profile on your iPhone:
   - Go to **Settings > General > VPN & Device Management**
   - Tap your developer profile and select **Trust**
3. The app will install and launch on your device

### Using Camera on Real Device

On a real device, you can use the **Scan with Camera** button to:
1. Point your camera at text (books, signs, menus, etc.)
2. Take a photo
3. The app will process and display the recognized text

## Project Structure

```
ScanToLearn/
├── ScanToLearn.xcodeproj/
├── ScanToLearn/
│   ├── ScanToLearnApp.swift      # App entry point
│   ├── ContentView.swift         # Main navigation container
│   ├── Info.plist                # App configuration
│   ├── Models/
│   │   └── Token.swift           # Token and Language models
│   ├── Services/
│   │   ├── OCRService.swift      # Apple Vision OCR integration
│   │   └── TranslationService.swift  # Translation protocol & implementations
│   ├── Views/
│   │   ├── HomeView.swift        # Home screen with language selector
│   │   ├── CaptureOrPickerView.swift  # Camera/Photo picker
│   │   ├── ReviewView.swift      # Token review screen
│   │   └── TokenView.swift       # Individual token display
│   └── Utils/
│       └── WrappingLayout.swift  # Custom flow layout for tokens
├── ScanToLearnTests/
│   └── ScanToLearnTests.swift    # Unit tests
└── README.md
```

## Running Tests

### In Xcode

1. Open the project in Xcode
2. Press `Cmd + U` to run all tests
3. Or go to **Product > Test**

### From Command Line

```bash
cd ScanToLearn
xcodebuild test \
  -project ScanToLearn.xcodeproj \
  -scheme ScanToLearn \
  -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Configuration

### Default Language Pair

The app defaults to **Japanese → English**. You can change this on the home screen using the language selectors.

### Adding a Real Translation API

The app uses a stub `HardcodedTranslationService` by default. To use a real API:

1. Open `Services/TranslationService.swift`
2. Uncomment and configure the `APITranslationService` implementation
3. Add your API key
4. Update `ReviewView.swift` to use `APITranslationService` instead

Example for DeepL:
```swift
let translationService = APITranslationService(
    apiKey: "your-api-key-here",
    provider: .deepL
)
```

## Troubleshooting

### Build Errors

- **Missing frameworks**: Ensure you're using Xcode 15+ and targeting iOS 17+
- **Signing errors**: Configure your development team in Signing & Capabilities

### Camera Not Working

- Camera is **not available** in the iOS Simulator
- On real devices, ensure you granted camera permission when prompted
- Check **Settings > Privacy > Camera** on your device

### No Text Recognized

- Ensure the image has clear, readable text
- Try with better lighting or a higher resolution image
- The Vision framework works best with printed text

## License

This project is provided as-is for educational purposes.
