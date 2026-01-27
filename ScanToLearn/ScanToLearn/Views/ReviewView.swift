import SwiftUI

/// The review screen that shows recognized text as tappable tokens
struct ReviewView: View {
    let image: UIImage
    let sourceLanguage: Language
    let targetLanguage: Language

    @StateObject private var viewModel: ReviewViewModel

    @State private var showingImage = false
    @State private var revealedTokenIds: Set<UUID> = []

    init(image: UIImage, sourceLanguage: Language, targetLanguage: Language) {
        self.image = image
        self.sourceLanguage = sourceLanguage
        self.targetLanguage = targetLanguage
        self._viewModel = StateObject(wrappedValue: ReviewViewModel(
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage
        ))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Image thumbnail
                ImageThumbnailView(image: image, showingFullImage: $showingImage)

                // Status/loading indicator
                if viewModel.isProcessing {
                    ProcessingView()
                } else if let error = viewModel.error {
                    ErrorView(error: error) {
                        Task {
                            await viewModel.processImage(image)
                        }
                    }
                } else if viewModel.translatedTokens.isEmpty {
                    EmptyStateView()
                } else {
                    // Token display
                    TokensDisplayView(
                        tokens: viewModel.translatedTokens,
                        revealedTokenIds: $revealedTokenIds
                    )

                    // Actions
                    ActionButtonsView(
                        revealedCount: revealedTokenIds.count,
                        totalCount: viewModel.translatedTokens.count,
                        onRevealAll: revealAll,
                        onHideAll: hideAll
                    )
                }
            }
            .padding()
        }
        .navigationTitle("Review")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button(action: revealAll) {
                        Label("Reveal All", systemImage: "eye.fill")
                    }
                    Button(action: hideAll) {
                        Label("Hide All", systemImage: "eye.slash.fill")
                    }
                    Divider()
                    Button(action: {
                        showingImage = true
                    }) {
                        Label("View Full Image", systemImage: "photo")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showingImage) {
            FullImageView(image: image)
        }
        .task {
            await viewModel.processImage(image)
        }
    }

    private func revealAll() {
        withAnimation {
            revealedTokenIds = Set(viewModel.translatedTokens.map(\.id))
        }
    }

    private func hideAll() {
        withAnimation {
            revealedTokenIds.removeAll()
        }
    }
}

/// Image thumbnail with tap to expand
struct ImageThumbnailView: View {
    let image: UIImage
    @Binding var showingFullImage: Bool

    var body: some View {
        Button(action: {
            showingFullImage = true
        }) {
            Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(maxHeight: 150)
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )
                .overlay(
                    Image(systemName: "arrow.up.left.and.arrow.down.right")
                        .font(.caption)
                        .padding(6)
                        .background(Color.black.opacity(0.5))
                        .foregroundColor(.white)
                        .cornerRadius(6)
                        .padding(8),
                    alignment: .bottomTrailing
                )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

/// Full-screen image view
struct FullImageView: View {
    let image: UIImage
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView([.horizontal, .vertical]) {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
            }
            .navigationTitle("Original Image")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

/// Processing indicator view
struct ProcessingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)

            Text("Recognizing text...")
                .font(.headline)
                .foregroundColor(.secondary)

            Text("This may take a moment")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

/// Error display view
struct ErrorView: View {
    let error: String
    let onRetry: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 48))
                .foregroundColor(.orange)

            Text("Something went wrong")
                .font(.headline)

            Text(error)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Button(action: onRetry) {
                Label("Try Again", systemImage: "arrow.clockwise")
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }
}

/// Empty state view
struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "text.magnifyingglass")
                .font(.system(size: 48))
                .foregroundColor(.secondary)

            Text("No text found")
                .font(.headline)

            Text("Try taking another photo with clearer text")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }
}

/// Wrapping token display using custom layout
struct TokensDisplayView: View {
    let tokens: [TranslatedToken]
    @Binding var revealedTokenIds: Set<UUID>

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Recognized Words")
                    .font(.headline)

                Spacer()

                Text("\(revealedTokenIds.count)/\(tokens.count)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            WrappingLayout(horizontalSpacing: 8, verticalSpacing: 8) {
                ForEach(tokens) { token in
                    TokenView(
                        translatedToken: token,
                        isRevealed: Binding(
                            get: { revealedTokenIds.contains(token.id) },
                            set: { isRevealed in
                                if isRevealed {
                                    revealedTokenIds.insert(token.id)
                                } else {
                                    revealedTokenIds.remove(token.id)
                                }
                            }
                        )
                    )
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.gray.opacity(0.05))
        )
    }
}

/// Action buttons for reveal/hide all
struct ActionButtonsView: View {
    let revealedCount: Int
    let totalCount: Int
    let onRevealAll: () -> Void
    let onHideAll: () -> Void

    var body: some View {
        HStack(spacing: 16) {
            Button(action: onRevealAll) {
                Label("Reveal All", systemImage: "eye.fill")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green.opacity(0.1))
                    .foregroundColor(.green)
                    .cornerRadius(12)
            }
            .disabled(revealedCount == totalCount)

            Button(action: onHideAll) {
                Label("Hide All", systemImage: "eye.slash.fill")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .foregroundColor(.primary)
                    .cornerRadius(12)
            }
            .disabled(revealedCount == 0)
        }
    }
}

// MARK: - ViewModel

@MainActor
class ReviewViewModel: ObservableObject {
    @Published var tokens: [Token] = []
    @Published var translatedTokens: [TranslatedToken] = []
    @Published var isProcessing = false
    @Published var error: String?

    private let ocrService: OCRService
    private let translationService: TranslationService
    private let sourceLanguage: Language
    private let targetLanguage: Language

    init(
        sourceLanguage: Language,
        targetLanguage: Language,
        ocrService: OCRService? = nil,
        translationService: TranslationService? = nil
    ) {
        self.sourceLanguage = sourceLanguage
        self.targetLanguage = targetLanguage
        self.ocrService = ocrService ?? OCRService(
            recognitionLanguages: [sourceLanguage.languageCode, targetLanguage.languageCode]
        )
        self.translationService = translationService ?? HardcodedTranslationService()
    }

    func processImage(_ image: UIImage) async {
        guard let cgImage = image.cgImage else {
            error = "Failed to process image"
            return
        }

        isProcessing = true
        error = nil

        do {
            // Perform OCR
            let recognizedTokens = try await ocrService.recognizeTokens(from: cgImage)
            self.tokens = recognizedTokens

            // Translate tokens
            var translated: [TranslatedToken] = []
            for token in recognizedTokens {
                let result = try await translationService.translate(
                    text: token.text,
                    from: sourceLanguage,
                    to: targetLanguage
                )

                translated.append(TranslatedToken(
                    originalToken: token,
                    targetLanguageText: result.translatedText,
                    meaning: result.meaning,
                    partOfSpeech: result.partOfSpeech,
                    exampleSentence: result.exampleSentence
                ))
            }

            self.translatedTokens = translated
        } catch {
            self.error = error.localizedDescription
        }

        isProcessing = false
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        ReviewView(
            image: UIImage(systemName: "text.viewfinder")!,
            sourceLanguage: .japanese,
            targetLanguage: .english
        )
    }
}
