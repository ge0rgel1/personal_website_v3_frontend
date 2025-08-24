'use client'

import React from 'react'
import Image from 'next/image'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { ImgHTMLAttributes, ClassAttributes } from 'react'

// Define the props for the custom components
interface ImageProps extends ImgHTMLAttributes<HTMLImageElement>, ClassAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Custom component for rendering images
const MarkdownImage: React.FC<ImageProps> = ({ src, alt }) => {
  if (!src) {
    return null
  }
  return (
    <span className="block w-full text-center my-6">
      <Image
        src={src}
        alt={alt || 'Image from post'}
        width={800}
        height={600}
        className="max-w-full h-auto inline-block rounded-lg shadow-md"
        style={{ objectFit: 'contain' }}
      />
      {alt && <span className="text-sm text-gray-500 italic block mt-2">{alt}</span>}
    </span>
  )
}

// Custom component for rendering code blocks
const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children }) => {
  if (inline) {
    return (
      <code className="bg-gray-200 text-red-600 font-mono text-sm px-1 rounded-md">
        {children}
      </code>
    );
  }

  const language = className?.replace(/language-/, '') || 'plaintext'
  const code = String(children).replace(/\n$/, '')

  const highlightedCode = hljs.getLanguage(language)
    ? hljs.highlight(code, { language, ignoreIllegals: true }).value
    : hljs.highlightAuto(code).value

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="my-4 rounded-md overflow-hidden bg-gray-800 text-white">
      <div className="flex justify-between items-center px-4 py-1 bg-gray-700 text-gray-300 text-xs">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 m-0 overflow-x-auto">
        <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  )
}

export const markdownComponents = {
  img: (props: ImageProps) => <MarkdownImage {...props} />,
  code: (props: CodeBlockProps) => <CodeBlock {...props} />,
}
