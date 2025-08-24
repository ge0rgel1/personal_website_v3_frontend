import { visit } from 'unist-util-visit'
import { generateHeadingId } from './tocUtils'

// Rehype plugin to add IDs to headings
export function rehypeAddHeadingIds() {
  return (tree: any) => {
    visit(tree, 'element', (node) => {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) {
        // Extract text content from the heading
        let text = ''
        visit(node, 'text', (textNode) => {
          text += textNode.value
        })
        
        if (text.trim()) {
          const id = generateHeadingId(text.trim())
          node.properties = node.properties || {}
          node.properties.id = id
        }
      }
    })
  }
}
