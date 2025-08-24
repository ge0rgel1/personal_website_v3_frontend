import { remark } from 'remark'
import { visit } from 'unist-util-visit'

export interface TOCItem {
  id: string
  text: string
  level: number
  children: TOCItem[]
}

// Generate a unique ID from heading text
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Extract table of contents from markdown content
export function extractTOC(markdownContent: string): TOCItem[] {
  const headings: { level: number; text: string; id: string }[] = []
  
  // Parse markdown and extract headings
  const processor = remark()
  const tree = processor.parse(markdownContent)
  
  visit(tree, 'heading', (node) => {
    // Extract text content from heading
    let text = ''
    visit(node, 'text', (textNode) => {
      text += textNode.value
    })
    
    if (text.trim()) {
      const id = generateHeadingId(text)
      headings.push({
        level: node.depth,
        text: text.trim(),
        id
      })
    }
  })
  
  // Build hierarchical structure
  return buildTOCTree(headings)
}

// Build a hierarchical tree structure from flat headings array
function buildTOCTree(headings: { level: number; text: string; id: string }[]): TOCItem[] {
  const root: TOCItem[] = []
  const stack: TOCItem[] = []
  
  for (const heading of headings) {
    const item: TOCItem = {
      id: heading.id,
      text: heading.text,
      level: heading.level,
      children: []
    }
    
    // Find the correct parent based on heading levels
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop()
    }
    
    if (stack.length === 0) {
      // Top-level heading
      root.push(item)
    } else {
      // Child heading
      stack[stack.length - 1].children.push(item)
    }
    
    stack.push(item)
  }
  
  return root
}

// Scroll to a specific heading
export function scrollToHeading(headingId: string) {
  const element = document.getElementById(headingId)
  if (element) {
    const yOffset = -80 // Account for sticky header
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
    
    window.scrollTo({
      top: y,
      behavior: 'smooth'
    })
  }
}
