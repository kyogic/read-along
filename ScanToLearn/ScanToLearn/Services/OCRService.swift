import Foundation
import Vision
import CoreGraphics

/// Errors that can occur during OCR processing
enum OCRError: Error, LocalizedError {
    case imageProcessingFailed
    case noTextFound
    case recognitionFailed(Error)

    var errorDescription: String? {
        switch self {
        case .imageProcessingFailed:
            return "Failed to process the image for text recognition."
        case .noTextFound:
            return "No text was found in the image."
        case .recognitionFailed(let error):
            return "Text recognition failed: \(error.localizedDescription)"
        }
    }
}

/// Service responsible for performing OCR on images using Apple Vision
final class OCRService {
    /// Recognition level - accurate is slower but more precise
    private let recognitionLevel: VNRequestTextRecognitionLevel

    /// Languages to recognize (ISO codes)
    private let recognitionLanguages: [String]

    /// Threshold for grouping tokens into the same line (as fraction of average character height)
    private let lineGroupingThreshold: CGFloat = 0.5

    init(
        recognitionLevel: VNRequestTextRecognitionLevel = .accurate,
        recognitionLanguages: [String] = ["ja", "en"]
    ) {
        self.recognitionLevel = recognitionLevel
        self.recognitionLanguages = recognitionLanguages
    }

    /// Recognizes text tokens from an image
    /// - Parameter image: The CGImage to process
    /// - Returns: Array of Token objects sorted in reading order
    func recognizeTokens(from image: CGImage) async throws -> [Token] {
        return try await withCheckedThrowingContinuation { continuation in
            let request = VNRecognizeTextRequest { request, error in
                if let error = error {
                    continuation.resume(throwing: OCRError.recognitionFailed(error))
                    return
                }

                guard let observations = request.results as? [VNRecognizedTextObservation],
                      !observations.isEmpty else {
                    continuation.resume(throwing: OCRError.noTextFound)
                    return
                }

                let tokens = self.processObservations(observations)
                let sortedTokens = self.sortTokensInReadingOrder(tokens)
                continuation.resume(returning: sortedTokens)
            }

            request.recognitionLevel = recognitionLevel
            request.recognitionLanguages = recognitionLanguages
            request.usesLanguageCorrection = true

            let handler = VNImageRequestHandler(cgImage: image, options: [:])

            do {
                try handler.perform([request])
            } catch {
                continuation.resume(throwing: OCRError.recognitionFailed(error))
            }
        }
    }

    /// Processes Vision observations into Token objects
    private func processObservations(_ observations: [VNRecognizedTextObservation]) -> [Token] {
        var tokens: [Token] = []

        for observation in observations {
            guard let candidate = observation.topCandidates(1).first else { continue }

            let text = candidate.string
            let confidence = candidate.confidence
            let boundingBox = observation.boundingBox

            // Split the recognized text into individual words
            let words = text.components(separatedBy: .whitespaces).filter { !$0.isEmpty }

            if words.count == 1 {
                // Single word - use the observation's bounding box
                tokens.append(Token(
                    text: text,
                    confidence: confidence,
                    boundingBox: boundingBox
                ))
            } else {
                // Multiple words - try to estimate individual bounding boxes
                let wordTokens = splitIntoWordTokens(
                    text: text,
                    words: words,
                    confidence: confidence,
                    boundingBox: boundingBox
                )
                tokens.append(contentsOf: wordTokens)
            }
        }

        return tokens
    }

    /// Splits a multi-word observation into individual word tokens with estimated bounding boxes
    private func splitIntoWordTokens(
        text: String,
        words: [String],
        confidence: Float,
        boundingBox: CGRect
    ) -> [Token] {
        var tokens: [Token] = []
        let totalLength = words.reduce(0) { $0 + $1.count }

        guard totalLength > 0 else { return tokens }

        var currentX = boundingBox.minX
        let totalWidth = boundingBox.width

        for word in words {
            let wordProportion = CGFloat(word.count) / CGFloat(totalLength)
            let wordWidth = totalWidth * wordProportion

            let wordBoundingBox = CGRect(
                x: currentX,
                y: boundingBox.minY,
                width: wordWidth,
                height: boundingBox.height
            )

            tokens.append(Token(
                text: word,
                confidence: confidence,
                boundingBox: wordBoundingBox
            ))

            currentX += wordWidth
        }

        return tokens
    }

    /// Sorts tokens in reading order (top-to-bottom, left-to-right)
    /// Uses a heuristic to group tokens into lines based on Y position
    func sortTokensInReadingOrder(_ tokens: [Token]) -> [Token] {
        guard !tokens.isEmpty else { return [] }

        // Calculate average token height for line grouping threshold
        let avgHeight = tokens.reduce(0) { $0 + $1.boundingBox.height } / CGFloat(tokens.count)
        let threshold = avgHeight * lineGroupingThreshold

        // Group tokens into lines based on Y position
        var lines: [[Token]] = []

        for token in tokens {
            var addedToLine = false

            for i in 0..<lines.count {
                // Check if token belongs to this line (similar Y position)
                if let firstInLine = lines[i].first {
                    // Vision uses bottom-left origin, so higher Y = higher on screen
                    let yDiff = abs(token.centerY - firstInLine.centerY)
                    if yDiff <= threshold {
                        lines[i].append(token)
                        addedToLine = true
                        break
                    }
                }
            }

            if !addedToLine {
                lines.append([token])
            }
        }

        // Sort lines by Y position (descending - top of image first in Vision coordinates)
        lines.sort { line1, line2 in
            guard let first1 = line1.first, let first2 = line2.first else { return false }
            return first1.centerY > first2.centerY
        }

        // Sort tokens within each line by X position (left to right)
        for i in 0..<lines.count {
            lines[i].sort { $0.centerX < $1.centerX }
        }

        // Flatten into single array
        return lines.flatMap { $0 }
    }
}
