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
    // Extract text content from heading, being careful about math content
    let text = ''
    visit(node, (childNode: any) => {
      // Only collect text from actual text nodes
      if (childNode.type === 'text') {
        text += childNode.value
      }
      // Skip known math node types (if they exist)
      if (childNode.type === 'inlineMath' || 
          childNode.type === 'math' || 
          childNode.type === 'mathBlock') {
        return 'skip'
      }
    })
    
    // Clean up the text and validate it's a real heading
    const cleanText = text.trim()
    
    // Skip if:
    // 1. No text content
    // 2. Contains LaTeX patterns (as fallback)
    // 3. Is too long (likely not a heading)
    if (cleanText && 
        !isLaTeXContent(cleanText) && 
        cleanText.length < 200) {
      const id = generateHeadingId(cleanText)
      headings.push({
        level: node.depth,
        text: cleanText,
        id
      })
    }
  })
  
  // Build hierarchical structure
  return buildTOCTree(headings)
}

// Helper function to detect LaTeX content
function isLaTeXContent(text: string): boolean {
  // Common LaTeX patterns that shouldn't be headings
  const latexPatterns = [
    /\\begin\{.*\}/,           // \begin{...}
    /\\end\{.*\}/,             // \end{...}
    /\$\$.*\$\$/,              // $$...$$
    /\\\w+\{.*\}/,             // \command{...}
    /\\[a-zA-Z]+/,             // \command
    /[_{}\^\\]/,               // Common LaTeX symbols
    /\bpmatrix\b/,             // matrix environments
    /\bmatrix\b/,
    /\bbmatrix\b/,
    /\bvmatrix\b/,
    /\bVmatrix\b/,
    /\balign\b/,               // align environments
    /\bequation\b/,
    /\bgather\b/
  ]
  
  return latexPatterns.some(pattern => pattern.test(text))
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
