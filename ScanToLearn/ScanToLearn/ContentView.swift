import SwiftUI

/// Main content view that handles navigation
struct ContentView: View {
    @State private var navigationPath = NavigationPath()
    @State private var sourceLanguage: Language = .japanese
    @State private var targetLanguage: Language = .english

    var body: some View {
        NavigationStack(path: $navigationPath) {
            HomeView(
                sourceLanguage: $sourceLanguage,
                targetLanguage: $targetLanguage,
                navigationPath: $navigationPath
            )
            .navigationDestination(for: ReviewDestination.self) { destination in
                ReviewView(
                    image: destination.image,
                    sourceLanguage: sourceLanguage,
                    targetLanguage: targetLanguage
                )
            }
        }
    }
}

#Preview {
    ContentView()
}
