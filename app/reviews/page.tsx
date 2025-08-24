'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Footer from '../../components/Footer'
import Pagination from '../../components/Pagination'

interface ReviewData {
  id: number
  object: string
  author: string | null
  score: number
  review_text: string
  thumbnail: string | null
  created_at: string
  tags: {
    name: string;
    background_color: string;
    text_color: string;
  }[];
}

interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function Reviews() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])

  // Fetch reviews data
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/reviews?page=${currentPage}&limit=6`)
        const data = await response.json()
        
        if (data.success) {
          setReviews(data.data)
          setPagination(data.pagination)
          
          // Extract all unique tags from current page
          const pageTags = data.data.flatMap((review: ReviewData) => review.tags.map(t => t.name))
          setAllTags(prev => {
            const combined = [...new Set([...prev, ...pageTags])].sort()
            return combined
          })
        } else {
          throw new Error(data.error || 'Failed to load reviews')
        }
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError(err instanceof Error ? err.message : 'Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }
    
    fetchReviews()
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of reviews section
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50'
    if (score >= 6) return 'text-yellow-600 bg-yellow-50'
    if (score >= 4) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  // Filter and sort reviews based on current filters
  const filteredReviews = reviews.filter(review => {
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      const matchesObject = review.object.toLowerCase().includes(searchLower)
      const matchesAuthor = review.author?.toLowerCase().includes(searchLower) || false
      const matchesReview = review.review_text.toLowerCase().includes(searchLower)
      const matchesTags = review.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
      
      if (!matchesObject && !matchesAuthor && !matchesReview && !matchesTags) {
        return false
      }
    }

    // Tag filter
    if (selectedTag && !review.tags.some(t => t.name === selectedTag)) {
      return false
    }

    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-20">
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Reviews</h1>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Reviews</h1>
            <p className="text-gray-600 max-w-2xl">
              My thoughts and opinions on various games, books, movies, places, and experiences.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search reviews, objects, authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Tag Filter */}
              <div className="sm:w-64">
                <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Tag
                </label>
                <select
                  id="tag-filter"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {pagination ? (
                  <>
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} reviews
                    {(searchTerm || selectedTag) && ` (filtered from ${pagination.totalItems} total)`}
                  </>
                ) : (
                  `Showing ${filteredReviews.length} reviews`
                )}
              </p>
              {(searchTerm || selectedTag) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedTag('')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Reviews Grid */}
          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <article
                  key={review.id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex gap-6">
                      {/* Thumbnail - Left Side */}
                      <div className="flex-shrink-0">
                        {review.thumbnail ? (
                          <img
                            src={review.thumbnail}
                            alt={review.object}
                            className="w-32 h-32 object-contain rounded-lg shadow-sm bg-gray-50"
                            onError={(e) => {
                              console.log('Image failed to load:', review.thumbnail)
                              e.currentTarget.style.display = 'none'
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement
                              if (fallback) fallback.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center ${review.thumbnail ? 'hidden' : ''}`}>
                          <span className="text-gray-400 text-xs text-center">No Image</span>
                        </div>
                      </div>

                      {/* Content - Right Side */}
                      <div className="flex-1 min-w-0">
                        {/* Header with object name, author, and score */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 truncate">
                              {review.object}
                            </h3>
                            {review.author && (
                              <p className="text-sm text-gray-600 mt-1">
                                by {review.author}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(review.score)}`}>
                              {review.score}/10
                            </div>
                            <time className="text-sm text-gray-500 whitespace-nowrap">
                              {formatDate(review.created_at)}
                            </time>
                          </div>
                        </div>

                        {/* Review text */}
                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                          {review.review_text}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {review.tags.map((tag) => (
                            <span
                              key={`${review.id}-${tag.name}`}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: tag.background_color, color: tag.text_color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedTag 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "No reviews have been published yet."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNext={pagination.hasNextPage}
                hasPrev={pagination.hasPreviousPage}
              />
            </div>
          )}

          {/* Footer */}
          <div className="mt-12">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}

