'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'

interface DraggableTOCButtonProps {
  onClick: () => void
  isOpen: boolean
}

export default function DraggableTOCButton({ onClick, isOpen }: DraggableTOCButtonProps) {
  const [position, setPosition] = useState({ x: 50, y: 80 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialMouseX: 0,
    initialMouseY: 0
  })

  // Set initial position to top right on client side
  useEffect(() => {
    setPosition({ x: window.innerWidth - 120, y: 80 })
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const drag = dragStateRef.current
    const deltaX = Math.abs(e.clientX - drag.initialMouseX)
    const deltaY = Math.abs(e.clientY - drag.initialMouseY)
    
    // Mark as dragging if moved more than 3 pixels
    if (!drag.isDragging && (deltaX > 3 || deltaY > 3)) {
      drag.isDragging = true
    }

    // Update position immediately during drag
    if (drag.isDragging) {
      const newX = e.clientX - drag.startX
      const newY = e.clientY - drag.startY

      // Get viewport constraints
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const buttonSize = 56

      // Apply constraints
      const constrainedX = Math.max(0, Math.min(viewportWidth - buttonSize, newX))
      const constrainedY = Math.max(0, Math.min(viewportHeight - buttonSize, newY))

      setPosition({ x: constrainedX, y: constrainedY })
    }
  }, [])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // Check if it was a click (not a drag)
    if (!dragStateRef.current.isDragging) {
      onClick()
    }

    // Reset drag state
    dragStateRef.current.isDragging = false
  }, [onClick])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    // Store initial positions
    dragStateRef.current = {
      isDragging: false,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      initialMouseX: e.clientX,
      initialMouseY: e.clientY
    }
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove, handleMouseUp])

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    dragStateRef.current = {
      isDragging: false,
      startX: touch.clientX - rect.left,
      startY: touch.clientY - rect.top,
      initialMouseX: touch.clientX,
      initialMouseY: touch.clientY
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const drag = dragStateRef.current
    
    const deltaX = Math.abs(touch.clientX - drag.initialMouseX)
    const deltaY = Math.abs(touch.clientY - drag.initialMouseY)
    
    if (!drag.isDragging && (deltaX > 3 || deltaY > 3)) {
      drag.isDragging = true
    }

    if (drag.isDragging) {
      const newX = touch.clientX - drag.startX
      const newY = touch.clientY - drag.startY

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const buttonSize = 56

      const constrainedX = Math.max(0, Math.min(viewportWidth - buttonSize, newX))
      const constrainedY = Math.max(0, Math.min(viewportHeight - buttonSize, newY))

      setPosition({ x: constrainedX, y: constrainedY })
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!dragStateRef.current.isDragging) {
      onClick()
    }
    dragStateRef.current.isDragging = false
  }, [onClick])

  return (
    <button
      ref={buttonRef}
      className={`
        fixed z-50 w-14 h-14 text-white rounded-full shadow-lg 
        transition-colors duration-200 flex items-center justify-center 
        select-none active:scale-95 hover:shadow-xl
        ${isOpen ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'}
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
        cursor: 'grab'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      title="Table of Contents"
      aria-label="Toggle Table of Contents"
    >
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 6h16M4 12h16M4 18h16" 
        />
      </svg>
    </button>
  )
}
