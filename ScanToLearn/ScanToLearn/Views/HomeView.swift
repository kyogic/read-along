import SwiftUI

/// The main home screen with scan and upload options
struct HomeView: View {
    @Binding var sourceLanguage: Language
    @Binding var targetLanguage: Language
    @Binding var navigationPath: NavigationPath

    @State private var showingImagePicker = false
    @State private var showingCamera = false
    @State private var selectedImage: UIImage?

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // App logo/title
            VStack(spacing: 8) {
                Image(systemName: "text.viewfinder")
                    .font(.system(size: 80))
                    .foregroundColor(.blue)

                Text("ScanToLearn")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("Scan text to learn vocabulary")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Language selector
            LanguageSelectorView(
                sourceLanguage: $sourceLanguage,
                targetLanguage: $targetLanguage
            )
            .padding(.horizontal)

            Spacer()

            // Action buttons
            VStack(spacing: 16) {
                // Scan button
                Button(action: {
                    showingCamera = true
                }) {
                    Label("Scan with Camera", systemImage: "camera.fill")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }

                // Upload button
                Button(action: {
                    showingImagePicker = true
                }) {
                    Label("Upload from Photos", systemImage: "photo.fill")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
            }
            .padding(.horizontal, 32)

            Spacer()
        }
        .sheet(isPresented: $showingImagePicker) {
            ImagePicker(image: $selectedImage, sourceType: .photoLibrary)
        }
        .sheet(isPresented: $showingCamera) {
            ImagePicker(image: $selectedImage, sourceType: .camera)
        }
        .onChange(of: selectedImage) { oldValue, newValue in
            if let image = newValue {
                navigationPath.append(ReviewDestination(image: image))
                selectedImage = nil
            }
        }
    }
}

/// Language selector component
struct LanguageSelectorView: View {
    @Binding var sourceLanguage: Language
    @Binding var targetLanguage: Language

    var body: some View {
        VStack(spacing: 12) {
            Text("Languages")
                .font(.headline)
                .foregroundColor(.secondary)

            HStack(spacing: 20) {
                // Source language
                VStack(spacing: 4) {
                    Text("From")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Picker("Source", selection: $sourceLanguage) {
                        ForEach(Language.allCases) { language in
                            Text(language.rawValue).tag(language)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(.primary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                }

                // Swap button
                Button(action: {
                    let temp = sourceLanguage
                    sourceLanguage = targetLanguage
                    targetLanguage = temp
                }) {
                    Image(systemName: "arrow.left.arrow.right")
                        .font(.title3)
                        .foregroundColor(.blue)
                }

                // Target language
                VStack(spacing: 4) {
                    Text("To")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Picker("Target", selection: $targetLanguage) {
                        ForEach(Language.allCases) { language in
                            Text(language.rawValue).tag(language)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(.primary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
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

/// Navigation destination for the review screen
struct ReviewDestination: Hashable {
    let id = UUID()
    let image: UIImage

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: ReviewDestination, rhs: ReviewDestination) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        HomeView(
            sourceLanguage: .constant(.japanese),
            targetLanguage: .constant(.english),
            navigationPath: .constant(NavigationPath())
        )
    }
}
