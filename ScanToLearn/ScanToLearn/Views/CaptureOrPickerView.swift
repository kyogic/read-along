import SwiftUI
import UIKit
import PhotosUI

/// UIKit wrapper for UIImagePickerController to handle both camera and photo library
struct ImagePicker: UIViewControllerRepresentable {
    @Environment(\.dismiss) private var dismiss
    @Binding var image: UIImage?
    let sourceType: UIImagePickerController.SourceType

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = sourceType
        picker.allowsEditing = false

        if sourceType == .camera {
            picker.cameraCaptureMode = .photo
        }

        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker

        init(_ parent: ImagePicker) {
            self.parent = parent
        }

        func imagePickerController(
            _ picker: UIImagePickerController,
            didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
        ) {
            if let uiImage = info[.originalImage] as? UIImage {
                parent.image = uiImage
            }
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

/// Modern PhotosPicker wrapper using PhotosUI framework
struct ModernImagePicker: View {
    @Binding var selectedImage: UIImage?
    @State private var selectedItem: PhotosPickerItem?

    var body: some View {
        PhotosPicker(
            selection: $selectedItem,
            matching: .images,
            photoLibrary: .shared()
        ) {
            Label("Select Photo", systemImage: "photo.fill")
        }
        .onChange(of: selectedItem) { oldValue, newValue in
            Task {
                if let data = try? await newValue?.loadTransferable(type: Data.self),
                   let uiImage = UIImage(data: data) {
                    selectedImage = uiImage
                }
            }
        }
    }
}

/// A combined view that offers both camera and photo library options
struct CaptureOrPickerView: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var selectedImage: UIImage?

    @State private var showingCamera = false
    @State private var showingPhotoLibrary = false
    @State private var selectedItem: PhotosPickerItem?

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Text("Add an Image")
                    .font(.title2)
                    .fontWeight(.semibold)

                Text("Choose how you want to add an image for text recognition")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                Spacer()

                // Camera option
                if UIImagePickerController.isSourceTypeAvailable(.camera) {
                    Button(action: {
                        showingCamera = true
                    }) {
                        OptionCard(
                            icon: "camera.fill",
                            title: "Take Photo",
                            description: "Use your camera to capture text",
                            color: .blue
                        )
                    }
                    .buttonStyle(PlainButtonStyle())
                }

                // Photo library option
                PhotosPicker(selection: $selectedItem, matching: .images) {
                    OptionCard(
                        icon: "photo.fill",
                        title: "Choose from Library",
                        description: "Select an existing photo",
                        color: .green
                    )
                }
                .buttonStyle(PlainButtonStyle())

                Spacer()
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showingCamera) {
                ImagePicker(image: $selectedImage, sourceType: .camera)
            }
            .onChange(of: selectedItem) { oldValue, newValue in
                Task {
                    if let data = try? await newValue?.loadTransferable(type: Data.self),
                       let uiImage = UIImage(data: data) {
                        selectedImage = uiImage
                        dismiss()
                    }
                }
            }
            .onChange(of: selectedImage) { oldValue, newValue in
                if newValue != nil {
                    dismiss()
                }
            }
        }
    }
}

/// A card-style option button
struct OptionCard: View {
    let icon: String
    let title: String
    let description: String
    let color: Color

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundColor(color)
                .frame(width: 60, height: 60)
                .background(color.opacity(0.1))
                .cornerRadius(12)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.primary)

                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundColor(.secondary)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.gray.opacity(0.05))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - Preview

#Preview {
    CaptureOrPickerView(selectedImage: .constant(nil))
}
