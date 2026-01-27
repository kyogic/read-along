import XCTest
@testable import ScanToLearn

final class ScanToLearnTests: XCTestCase {

    // MARK: - Token Sorting Tests

    func testTokenSortingEmptyArray() {
        let ocrService = OCRService()
        let tokens: [Token] = []
        let sorted = ocrService.sortTokensInReadingOrder(tokens)

        XCTAssertTrue(sorted.isEmpty, "Empty array should return empty array")
    }

    func testTokenSortingSingleToken() {
        let ocrService = OCRService()
        let token = Token(
            text: "Hello",
            confidence: 0.95,
            boundingBox: CGRect(x: 0.1, y: 0.5, width: 0.2, height: 0.1)
        )
        let sorted = ocrService.sortTokensInReadingOrder([token])

        XCTAssertEqual(sorted.count, 1)
        XCTAssertEqual(sorted[0].text, "Hello")
    }

    func testTokenSortingLeftToRight() {
        // Tokens on the same line (similar Y) should be sorted left to right
        let ocrService = OCRService()

        let token1 = Token(
            text: "First",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.1, y: 0.5, width: 0.1, height: 0.05)
        )
        let token2 = Token(
            text: "Second",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.3, y: 0.5, width: 0.1, height: 0.05)
        )
        let token3 = Token(
            text: "Third",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.5, y: 0.5, width: 0.1, height: 0.05)
        )

        // Shuffle the order
        let unsorted = [token2, token3, token1]
        let sorted = ocrService.sortTokensInReadingOrder(unsorted)

        XCTAssertEqual(sorted.count, 3)
        XCTAssertEqual(sorted[0].text, "First")
        XCTAssertEqual(sorted[1].text, "Second")
        XCTAssertEqual(sorted[2].text, "Third")
    }

    func testTokenSortingTopToBottom() {
        // Tokens on different lines should be sorted top to bottom
        // Note: Vision uses bottom-left origin, so higher Y = higher on screen
        let ocrService = OCRService()

        let topToken = Token(
            text: "Top",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.1, y: 0.8, width: 0.1, height: 0.05) // Higher Y = top
        )
        let middleToken = Token(
            text: "Middle",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.1, y: 0.5, width: 0.1, height: 0.05)
        )
        let bottomToken = Token(
            text: "Bottom",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.1, y: 0.2, width: 0.1, height: 0.05) // Lower Y = bottom
        )

        let unsorted = [middleToken, bottomToken, topToken]
        let sorted = ocrService.sortTokensInReadingOrder(unsorted)

        XCTAssertEqual(sorted.count, 3)
        XCTAssertEqual(sorted[0].text, "Top")
        XCTAssertEqual(sorted[1].text, "Middle")
        XCTAssertEqual(sorted[2].text, "Bottom")
    }

    func testTokenSortingMultipleLines() {
        // Test a realistic multi-line scenario
        let ocrService = OCRService()

        // Line 1 (top): "Hello World"
        let hello = Token(
            text: "Hello",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.1, y: 0.7, width: 0.15, height: 0.05)
        )
        let world = Token(
            text: "World",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.3, y: 0.7, width: 0.15, height: 0.05)
        )

        // Line 2 (bottom): "Good Morning"
        let good = Token(
            text: "Good",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.1, y: 0.4, width: 0.12, height: 0.05)
        )
        let morning = Token(
            text: "Morning",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.3, y: 0.4, width: 0.2, height: 0.05)
        )

        let unsorted = [morning, hello, good, world]
        let sorted = ocrService.sortTokensInReadingOrder(unsorted)

        XCTAssertEqual(sorted.count, 4)
        XCTAssertEqual(sorted[0].text, "Hello")
        XCTAssertEqual(sorted[1].text, "World")
        XCTAssertEqual(sorted[2].text, "Good")
        XCTAssertEqual(sorted[3].text, "Morning")
    }

    func testTokenSortingWithSlightYVariation() {
        // Tokens with slight Y variation should still be grouped on the same line
        let ocrService = OCRService()

        let token1 = Token(
            text: "First",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.1, y: 0.50, width: 0.1, height: 0.05)
        )
        let token2 = Token(
            text: "Second",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.3, y: 0.51, width: 0.1, height: 0.05) // Slight Y variation
        )
        let token3 = Token(
            text: "Third",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.5, y: 0.49, width: 0.1, height: 0.05) // Slight Y variation
        )

        let unsorted = [token3, token1, token2]
        let sorted = ocrService.sortTokensInReadingOrder(unsorted)

        XCTAssertEqual(sorted.count, 3)
        XCTAssertEqual(sorted[0].text, "First")
        XCTAssertEqual(sorted[1].text, "Second")
        XCTAssertEqual(sorted[2].text, "Third")
    }

    // MARK: - Translation Caching Tests

    func testTranslationCacheHit() async throws {
        let service = HardcodedTranslationService()

        // First translation - should be a cache miss
        let result1 = try await service.translate(
            text: "Hello",
            from: .english,
            to: .japanese
        )

        // Second translation of same text - should be a cache hit
        let result2 = try await service.translate(
            text: "Hello",
            from: .english,
            to: .japanese
        )

        XCTAssertEqual(result1.originalText, result2.originalText)
        XCTAssertEqual(result1.meaning, result2.meaning)
        XCTAssertEqual(service.getCacheCount(), 1, "Cache should have one entry")
    }

    func testTranslationCacheDifferentLanguages() async throws {
        let service = HardcodedTranslationService()

        // Translate to Japanese
        _ = try await service.translate(
            text: "Hello",
            from: .english,
            to: .japanese
        )

        // Translate to Spanish (different target)
        _ = try await service.translate(
            text: "Hello",
            from: .english,
            to: .spanish
        )

        XCTAssertEqual(service.getCacheCount(), 2, "Cache should have two entries for different language pairs")
    }

    func testTranslationCacheDifferentTexts() async throws {
        let service = HardcodedTranslationService()

        _ = try await service.translate(text: "Hello", from: .english, to: .japanese)
        _ = try await service.translate(text: "World", from: .english, to: .japanese)
        _ = try await service.translate(text: "Test", from: .english, to: .japanese)

        XCTAssertEqual(service.getCacheCount(), 3, "Cache should have three entries")
    }

    func testTranslationCacheClear() async throws {
        let service = HardcodedTranslationService()

        _ = try await service.translate(text: "Hello", from: .english, to: .japanese)
        _ = try await service.translate(text: "World", from: .english, to: .japanese)

        XCTAssertEqual(service.getCacheCount(), 2)

        service.clearCache()

        // Give the async operation time to complete
        try await Task.sleep(nanoseconds: 100_000_000)

        XCTAssertEqual(service.getCacheCount(), 0, "Cache should be empty after clear")
    }

    func testTranslationBatch() async throws {
        let service = HardcodedTranslationService()
        let texts = ["Hello", "World", "Test"]

        let results = try await service.translateBatch(
            texts: texts,
            from: .english,
            to: .japanese
        )

        XCTAssertEqual(results.count, 3)
        XCTAssertEqual(results[0].originalText, "Hello")
        XCTAssertEqual(results[1].originalText, "World")
        XCTAssertEqual(results[2].originalText, "Test")
        XCTAssertEqual(service.getCacheCount(), 3)
    }

    func testTranslationResultContainsMeaning() async throws {
        let service = HardcodedTranslationService()

        let result = try await service.translate(
            text: "こんにちは",
            from: .japanese,
            to: .english
        )

        // This is a known sample translation
        XCTAssertEqual(result.meaning, "Hello")
        XCTAssertEqual(result.partOfSpeech, "interjection")
        XCTAssertNotNil(result.exampleSentence)
    }

    func testTranslationPlaceholderForUnknownWord() async throws {
        let service = HardcodedTranslationService()

        let result = try await service.translate(
            text: "UnknownWord123",
            from: .english,
            to: .japanese
        )

        // Unknown words get placeholder translation
        XCTAssertEqual(result.originalText, "UnknownWord123")
        XCTAssertEqual(result.meaning, "meaning: UnknownWord123")
        XCTAssertEqual(result.partOfSpeech, "unknown")
    }

    // MARK: - Token Model Tests

    func testTokenEquality() {
        let id = UUID()
        let token1 = Token(id: id, text: "Hello", confidence: 0.9, boundingBox: .zero)
        let token2 = Token(id: id, text: "Hello", confidence: 0.9, boundingBox: .zero)

        XCTAssertEqual(token1, token2)
    }

    func testTokenCenterCalculation() {
        let token = Token(
            text: "Test",
            confidence: 0.9,
            boundingBox: CGRect(x: 0.2, y: 0.4, width: 0.2, height: 0.1)
        )

        XCTAssertEqual(token.centerX, 0.3, accuracy: 0.001)
        XCTAssertEqual(token.centerY, 0.45, accuracy: 0.001)
    }

    // MARK: - Language Model Tests

    func testLanguageCode() {
        XCTAssertEqual(Language.japanese.languageCode, "ja")
        XCTAssertEqual(Language.english.languageCode, "en")
        XCTAssertEqual(Language.spanish.languageCode, "es")
        XCTAssertEqual(Language.french.languageCode, "fr")
        XCTAssertEqual(Language.german.languageCode, "de")
        XCTAssertEqual(Language.chinese.languageCode, "zh")
        XCTAssertEqual(Language.korean.languageCode, "ko")
    }

    func testAllLanguagesHaveUniqueIds() {
        let ids = Language.allCases.map { $0.id }
        let uniqueIds = Set(ids)
        XCTAssertEqual(ids.count, uniqueIds.count, "All languages should have unique IDs")
    }
}
