import Foundation
import CoreGraphics

/// Represents a recognized text token from OCR
struct Token: Identifiable, Equatable, Hashable {
    let id: UUID
    let text: String
    let confidence: Float
    let boundingBox: CGRect // Normalized coordinates (0-1)

    // Computed property for sorting - center Y position
    var centerY: CGFloat {
        boundingBox.midY
    }

    // Computed property for sorting - center X position
    var centerX: CGFloat {
        boundingBox.midX
    }

    init(id: UUID = UUID(), text: String, confidence: Float, boundingBox: CGRect) {
        self.id = id
        self.text = text
        self.confidence = confidence
        self.boundingBox = boundingBox
    }
}

/// Represents a translated token with meaning information
struct TranslatedToken: Identifiable, Equatable {
    let id: UUID
    let originalToken: Token
    let targetLanguageText: String
    let meaning: String
    let partOfSpeech: String?
    let exampleSentence: String?

    init(
        id: UUID = UUID(),
        originalToken: Token,
        targetLanguageText: String,
        meaning: String,
        partOfSpeech: String? = nil,
        exampleSentence: String? = nil
    ) {
        self.id = id
        self.originalToken = originalToken
        self.targetLanguageText = targetLanguageText
        self.meaning = meaning
        self.partOfSpeech = partOfSpeech
        self.exampleSentence = exampleSentence
    }
}

/// Supported languages for the app
enum Language: String, CaseIterable, Identifiable {
    case japanese = "Japanese"
    case english = "English"
    case spanish = "Spanish"
    case french = "French"
    case german = "German"
    case chinese = "Chinese"
    case korean = "Korean"

    var id: String { rawValue }

    /// ISO language code for Vision framework
    var languageCode: String {
        switch self {
        case .japanese: return "ja"
        case .english: return "en"
        case .spanish: return "es"
        case .french: return "fr"
        case .german: return "de"
        case .chinese: return "zh"
        case .korean: return "ko"
        }
    }
}
