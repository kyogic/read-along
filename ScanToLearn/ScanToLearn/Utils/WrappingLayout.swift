import SwiftUI

/// A custom layout that wraps its children horizontally, flowing to new lines as needed
/// Similar to CSS flexbox with flex-wrap: wrap
struct WrappingLayout: Layout {
    /// Horizontal spacing between items
    var horizontalSpacing: CGFloat = 8

    /// Vertical spacing between rows
    var verticalSpacing: CGFloat = 8

    /// Alignment of items within each row
    var alignment: VerticalAlignment = .center

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = computeLayout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = computeLayout(proposal: proposal, subviews: subviews)

        for (index, position) in result.positions.enumerated() {
            guard index < subviews.count else { break }
            let subview = subviews[index]
            let size = subview.sizeThatFits(.unspecified)

            subview.place(
                at: CGPoint(
                    x: bounds.minX + position.x,
                    y: bounds.minY + position.y
                ),
                proposal: ProposedViewSize(size)
            )
        }
    }

    private struct LayoutResult {
        var size: CGSize
        var positions: [CGPoint]
    }

    private func computeLayout(proposal: ProposedViewSize, subviews: Subviews) -> LayoutResult {
        var positions: [CGPoint] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var currentRowHeight: CGFloat = 0
        var totalWidth: CGFloat = 0
        var rowItems: [(index: Int, size: CGSize, x: CGFloat)] = []

        let maxWidth = proposal.width ?? .infinity

        for (index, subview) in subviews.enumerated() {
            let size = subview.sizeThatFits(.unspecified)

            // Check if we need to wrap to next line
            if currentX + size.width > maxWidth && currentX > 0 {
                // Finalize current row
                finalizeRow(rowItems: rowItems, rowHeight: currentRowHeight, positions: &positions)
                rowItems.removeAll()

                // Move to next line
                currentY += currentRowHeight + verticalSpacing
                currentX = 0
                currentRowHeight = 0
            }

            // Add item to current row
            rowItems.append((index: index, size: size, x: currentX))
            currentRowHeight = max(currentRowHeight, size.height)
            currentX += size.width + horizontalSpacing
            totalWidth = max(totalWidth, currentX - horizontalSpacing)
        }

        // Finalize last row
        if !rowItems.isEmpty {
            finalizeRow(rowItems: rowItems, rowHeight: currentRowHeight, positions: &positions)
        }

        let totalHeight = currentY + currentRowHeight

        return LayoutResult(
            size: CGSize(width: totalWidth, height: totalHeight),
            positions: positions
        )
    }

    private func finalizeRow(
        rowItems: [(index: Int, size: CGSize, x: CGFloat)],
        rowHeight: CGFloat,
        positions: inout [CGPoint]
    ) {
        // Ensure positions array has enough space
        let maxIndex = rowItems.map(\.index).max() ?? 0
        while positions.count <= maxIndex {
            positions.append(.zero)
        }

        for item in rowItems {
            let yOffset: CGFloat
            switch alignment {
            case .top:
                yOffset = 0
            case .bottom:
                yOffset = rowHeight - item.size.height
            default: // center
                yOffset = (rowHeight - item.size.height) / 2
            }

            let currentY = positions.isEmpty ? 0 : (positions.last?.y ?? 0)
            // Calculate actual Y based on previous rows
            let baseY: CGFloat
            if item.index == 0 {
                baseY = 0
            } else if let lastPosition = positions.dropLast().last {
                // Check if this is a new row
                if item.x == 0 && item.index > 0 {
                    baseY = positions[item.index - 1].y + rowHeight + verticalSpacing - (rowHeight)
                } else {
                    baseY = positions[item.index - 1].y
                }
            } else {
                baseY = 0
            }

            positions[item.index] = CGPoint(x: item.x, y: yOffset)
        }
    }
}

/// A simpler wrapping layout using ViewThatFits and GeometryReader
/// This is an alternative approach that works well for simpler cases
struct FlowLayout: View {
    let items: [AnyView]
    let horizontalSpacing: CGFloat
    let verticalSpacing: CGFloat

    init<Data: RandomAccessCollection, Content: View>(
        data: Data,
        horizontalSpacing: CGFloat = 8,
        verticalSpacing: CGFloat = 8,
        @ViewBuilder content: @escaping (Data.Element) -> Content
    ) where Data.Element: Identifiable {
        self.items = data.map { AnyView(content($0)) }
        self.horizontalSpacing = horizontalSpacing
        self.verticalSpacing = verticalSpacing
    }

    var body: some View {
        GeometryReader { geometry in
            self.generateContent(in: geometry)
        }
    }

    private func generateContent(in geometry: GeometryProxy) -> some View {
        var width = CGFloat.zero
        var height = CGFloat.zero

        return ZStack(alignment: .topLeading) {
            ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                item
                    .padding(.horizontal, horizontalSpacing / 2)
                    .padding(.vertical, verticalSpacing / 2)
                    .alignmentGuide(.leading) { dimension in
                        if abs(width - dimension.width) > geometry.size.width {
                            width = 0
                            height -= dimension.height
                        }
                        let result = width
                        if index == items.count - 1 {
                            width = 0
                        } else {
                            width -= dimension.width
                        }
                        return result
                    }
                    .alignmentGuide(.top) { _ in
                        let result = height
                        if index == items.count - 1 {
                            height = 0
                        }
                        return result
                    }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    ScrollView {
        WrappingLayout(horizontalSpacing: 8, verticalSpacing: 8) {
            ForEach(0..<20) { index in
                Text("Word \(index)")
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(8)
            }
        }
        .padding()
    }
}
