'use client'

import React, { useState } from 'react'
import { TOCItem, scrollToHeading } from '../lib/tocUtils'

interface TOCPanelProps {
  isOpen: boolean
  tocItems: TOCItem[]
  activeHeading?: string
  onClose: () => void
}

interface TOCItemComponentProps {
  item: TOCItem
  activeHeading?: string
  onItemClick: (id: string) => void
}

// Individual TOC item component (recursive for nested structure)
function TOCItemComponent({ item, activeHeading, onItemClick }: TOCItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = item.children.length > 0
  const isActive = activeHeading === item.id

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleClick = () => {
    onItemClick(item.id)
    scrollToHeading(item.id)
  }

  // Calculate indentation based on heading level
  const indentClass = {
    1: 'pl-0',
    2: 'pl-4',
    3: 'pl-8',
    4: 'pl-12',
    5: 'pl-16',
    6: 'pl-20'
  }[item.level] || 'pl-0'

  return (
    <div className="select-none">
      <div
        className={`
          flex items-start py-2 px-2 rounded-md cursor-pointer group
          hover:bg-gray-100 transition-colors duration-150
          ${indentClass}
          ${isActive ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500' : 'text-gray-700'}
        `}
        onClick={handleClick}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="flex-shrink-0 w-4 h-4 mr-2 mt-0.5 flex items-center justify-center hover:bg-gray-200 rounded"
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : 'rotate-0'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        
        {/* Heading Text */}
        <span
          className={`
            flex-1 text-sm leading-5 font-medium break-words
            ${item.level === 1 ? 'font-semibold' : ''}
            ${item.level >= 4 ? 'text-xs' : ''}
          `}
          title={item.text}
        >
          {item.text}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {item.children.map((child, index) => (
            <TOCItemComponent
              key={`${child.id}-${index}`}
              item={child}
              activeHeading={activeHeading}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TOCPanel({ isOpen, tocItems, activeHeading, onClose }: TOCPanelProps) {
  const handleItemClick = (id: string) => {
    // On mobile, close the panel after navigation
    if (window.innerWidth < 768) {
      setTimeout(() => onClose(), 300)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={handleBackdropClick}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          w-72 md:w-64 lg:w-72 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">Table of Contents</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-md transition-colors"
            aria-label="Close Table of Contents"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {tocItems.length > 0 ? (
            <div className="space-y-1">
              {tocItems.map((item, index) => (
                <TOCItemComponent
                  key={`${item.id}-${index}`}
                  item={item}
                  activeHeading={activeHeading}
                  onItemClick={handleItemClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No headings found in this post</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
