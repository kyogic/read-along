import SwiftUI

/// A view that displays a single word token
/// Shows the target language text by default, reveals meaning on tap/long-press
struct TokenView: View {
    let translatedToken: TranslatedToken
    @Binding var isRevealed: Bool

    @State private var showingPopover = false

    var body: some View {
        Button(action: {
            withAnimation(.easeInOut(duration: 0.2)) {
                isRevealed.toggle()
            }
        }) {
            VStack(spacing: 4) {
                // Main word display
                Text(translatedToken.originalToken.text)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.primary)

                // Revealed content
                if isRevealed {
                    VStack(spacing: 2) {
                        Text(translatedToken.meaning)
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)

                        if let pos = translatedToken.partOfSpeech {
                            Text(pos)
                                .font(.system(size: 11))
                                .foregroundColor(.blue)
                                .italic()
                        }
                    }
                    .transition(.opacity.combined(with: .scale(scale: 0.8)))
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(isRevealed ? Color.green.opacity(0.15) : Color.gray.opacity(0.1))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(isRevealed ? Color.green.opacity(0.5) : Color.gray.opacity(0.3), lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture {
            showingPopover = true
        }
        .popover(isPresented: $showingPopover) {
            TokenDetailPopover(translatedToken: translatedToken)
        }
    }
}

/// Detailed popover shown on long press
struct TokenDetailPopover: View {
    let translatedToken: TranslatedToken

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Original text
            Text(translatedToken.originalToken.text)
                .font(.title2)
                .fontWeight(.bold)

            Divider()

            // Meaning
            VStack(alignment: .leading, spacing: 4) {
                Text("Meaning")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(translatedToken.meaning)
                    .font(.body)
            }

            // Part of speech
            if let pos = translatedToken.partOfSpeech {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Part of Speech")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(pos)
                        .font(.body)
                        .foregroundColor(.blue)
                }
            }

            // Example sentence
            if let example = translatedToken.exampleSentence {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Example")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(example)
                        .font(.body)
                        .italic()
                }
            }

            // Confidence score
            VStack(alignment: .leading, spacing: 4) {
                Text("OCR Confidence")
                    .font(.caption)
                    .foregroundColor(.secondary)
                ProgressView(value: Double(translatedToken.originalToken.confidence))
                    .tint(confidenceColor)
                Text("\(Int(translatedToken.originalToken.confidence * 100))%")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .frame(minWidth: 250)
        .presentationCompactAdaptation(.popover)
    }

    private var confidenceColor: Color {
        let confidence = translatedToken.originalToken.confidence
        if confidence >= 0.9 {
            return .green
        } else if confidence >= 0.7 {
            return .yellow
        } else {
            return .red
        }
    }
}

/// A simple token view for preview/loading states
struct TokenPlaceholderView: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.system(size: 18, weight: .medium))
            .foregroundColor(.primary)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.gray.opacity(0.1))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
            )
            .redacted(reason: .placeholder)
    }
}

// MARK: - Preview

#Preview("Token - Hidden") {
    TokenView(
        translatedToken: TranslatedToken(
            originalToken: Token(text: "こんにちは", confidence: 0.95, boundingBox: .zero),
            targetLanguageText: "[EN] こんにちは",
            meaning: "Hello",
            partOfSpeech: "interjection",
            exampleSentence: "こんにちは、元気ですか?"
        ),
        isRevealed: .constant(false)
    )
    .padding()
}

#Preview("Token - Revealed") {
    TokenView(
        translatedToken: TranslatedToken(
            originalToken: Token(text: "こんにちは", confidence: 0.95, boundingBox: .zero),
            targetLanguageText: "[EN] こんにちは",
            meaning: "Hello",
            partOfSpeech: "interjection",
            exampleSentence: "こんにちは、元気ですか?"
        ),
        isRevealed: .constant(true)
    )
    .padding()
}
