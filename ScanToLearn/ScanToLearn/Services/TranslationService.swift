import Foundation

/// Result of a translation request
struct TranslationResult: Equatable {
    let originalText: String
    let translatedText: String
    let meaning: String
    let partOfSpeech: String?
    let exampleSentence: String?
}

/// Protocol defining translation service capabilities
protocol TranslationService {
    /// Translates a single word/phrase from source to target language
    func translate(
        text: String,
        from sourceLanguage: Language,
        to targetLanguage: Language
    ) async throws -> TranslationResult

    /// Translates multiple texts (batch operation)
    func translateBatch(
        texts: [String],
        from sourceLanguage: Language,
        to targetLanguage: Language
    ) async throws -> [TranslationResult]
}

/// Errors that can occur during translation
enum TranslationError: Error, LocalizedError {
    case translationFailed(String)
    case networkError(Error)
    case invalidResponse

    var errorDescription: String? {
        switch self {
        case .translationFailed(let message):
            return "Translation failed: \(message)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .invalidResponse:
            return "Invalid response from translation service"
        }
    }
}

// MARK: - Hardcoded Translation Service (Stub Implementation)

/// A stub translation service that returns placeholder translations
/// Use this for development and testing without API keys
final class HardcodedTranslationService: TranslationService {
    /// In-memory cache for translations
    private var cache: [String: TranslationResult] = [:]
    private let cacheQueue = DispatchQueue(label: "com.scantolearn.translationcache")

    /// Sample translations for common Japanese words (for demo purposes)
    private let sampleTranslations: [String: (meaning: String, pos: String?, example: String?)] = [
        "こんにちは": ("Hello", "interjection", "こんにちは、元気ですか? (Hello, how are you?)"),
        "ありがとう": ("Thank you", "interjection", "ありがとうございます。(Thank you very much.)"),
        "日本": ("Japan", "noun", "日本は美しい国です。(Japan is a beautiful country.)"),
        "食べる": ("to eat", "verb", "私はりんごを食べる。(I eat an apple.)"),
        "本": ("book", "noun", "この本は面白い。(This book is interesting.)"),
        "水": ("water", "noun", "水を飲みます。(I drink water.)"),
        "猫": ("cat", "noun", "猫が好きです。(I like cats.)"),
        "犬": ("dog", "noun", "犬は忠実です。(Dogs are loyal.)"),
        "学校": ("school", "noun", "学校に行きます。(I go to school.)"),
        "先生": ("teacher", "noun", "先生は優しい。(The teacher is kind.)"),
        "Hello": ("こんにちは", "interjection", "Hello, how are you?"),
        "Thank": ("感謝", "noun/verb", "Thank you for your help."),
        "you": ("あなた", "pronoun", "You are my friend."),
        "World": ("世界", "noun", "The world is beautiful."),
        "Book": ("本", "noun", "I read a book."),
        "Learn": ("学ぶ", "verb", "I learn Japanese every day."),
    ]

    func translate(
        text: String,
        from sourceLanguage: Language,
        to targetLanguage: Language
    ) async throws -> TranslationResult {
        let cacheKey = "\(text)_\(sourceLanguage.rawValue)_\(targetLanguage.rawValue)"

        // Check cache first
        if let cached = getCached(key: cacheKey) {
            return cached
        }

        // Simulate network delay
        try await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds

        let result: TranslationResult

        // Check if we have a sample translation
        if let sample = sampleTranslations[text] {
            result = TranslationResult(
                originalText: text,
                translatedText: "[\(targetLanguage.languageCode.uppercased())] \(text)",
                meaning: sample.meaning,
                partOfSpeech: sample.pos,
                exampleSentence: sample.example
            )
        } else {
            // Generate placeholder translation
            result = TranslationResult(
                originalText: text,
                translatedText: "[\(targetLanguage.languageCode.uppercased())] \(text)",
                meaning: "meaning: \(text)",
                partOfSpeech: "unknown",
                exampleSentence: "Example sentence with '\(text)' goes here."
            )
        }

        // Cache the result
        setCache(key: cacheKey, value: result)

        return result
    }

    func translateBatch(
        texts: [String],
        from sourceLanguage: Language,
        to targetLanguage: Language
    ) async throws -> [TranslationResult] {
        var results: [TranslationResult] = []

        for text in texts {
            let result = try await translate(text: text, from: sourceLanguage, to: targetLanguage)
            results.append(result)
        }

        return results
    }

    // MARK: - Cache Operations

    private func getCached(key: String) -> TranslationResult? {
        cacheQueue.sync {
            cache[key]
        }
    }

    private func setCache(key: String, value: TranslationResult) {
        cacheQueue.async { [weak self] in
            self?.cache[key] = value
        }
    }

    /// Clears all cached translations
    func clearCache() {
        cacheQueue.async { [weak self] in
            self?.cache.removeAll()
        }
    }

    /// Returns the current cache count (for testing)
    func getCacheCount() -> Int {
        cacheQueue.sync {
            cache.count
        }
    }
}

// MARK: - API Translation Service (Scaffold)

/// A translation service that uses a real API (e.g., DeepL, Google Translate)
/// This is a scaffold implementation - configure with your API key to use
final class APITranslationService: TranslationService {
    private let apiKey: String
    private let baseURL: URL
    private var cache: [String: TranslationResult] = [:]
    private let cacheQueue = DispatchQueue(label: "com.scantolearn.apitranslationcache")

    /// Supported API providers
    enum Provider {
        case deepL
        case googleTranslate
        case custom(URL)

        var baseURL: URL {
            switch self {
            case .deepL:
                return URL(string: "https://api-free.deepl.com/v2/translate")!
            case .googleTranslate:
                return URL(string: "https://translation.googleapis.com/language/translate/v2")!
            case .custom(let url):
                return url
            }
        }
    }

    init(apiKey: String, provider: Provider = .deepL) {
        self.apiKey = apiKey
        self.baseURL = provider.baseURL
    }

    func translate(
        text: String,
        from sourceLanguage: Language,
        to targetLanguage: Language
    ) async throws -> TranslationResult {
        let cacheKey = "\(text)_\(sourceLanguage.rawValue)_\(targetLanguage.rawValue)"

        // Check cache first
        if let cached = getCached(key: cacheKey) {
            return cached
        }

        // TODO: Implement actual API call
        // This is a scaffold - replace with real implementation

        /*
        var request = URLRequest(url: baseURL)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        request.setValue("DeepL-Auth-Key \(apiKey)", forHTTPHeaderField: "Authorization")

        let body = "text=\(text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? text)"
            + "&source_lang=\(sourceLanguage.languageCode.uppercased())"
            + "&target_lang=\(targetLanguage.languageCode.uppercased())"
        request.httpBody = body.data(using: .utf8)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw TranslationError.invalidResponse
        }

        // Parse response and create TranslationResult
        */

        // For now, fall back to placeholder
        let result = TranslationResult(
            originalText: text,
            translatedText: "[API] \(text)",
            meaning: "API translation not configured",
            partOfSpeech: nil,
            exampleSentence: nil
        )

        setCache(key: cacheKey, value: result)
        return result
    }

    func translateBatch(
        texts: [String],
        from sourceLanguage: Language,
        to targetLanguage: Language
    ) async throws -> [TranslationResult] {
        // For batch, we could use a single API call for efficiency
        // For now, iterate through texts
        var results: [TranslationResult] = []

        for text in texts {
            let result = try await translate(text: text, from: sourceLanguage, to: targetLanguage)
            results.append(result)
        }

        return results
    }

    // MARK: - Cache Operations

    private func getCached(key: String) -> TranslationResult? {
        cacheQueue.sync {
            cache[key]
        }
    }

    private func setCache(key: String, value: TranslationResult) {
        cacheQueue.async { [weak self] in
            self?.cache[key] = value
        }
    }
}
