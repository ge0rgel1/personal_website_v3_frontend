'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Footer from '../../components/Footer'
import Pagination from '../../components/Pagination'

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  read_time_minutes: number;
  cover_image_url: string;
  view_count: number;
  published_at: string;
  created_at: string;
  tags: {
    name: string;
    background_color: string;
    text_color: string;
  }[];
  comment_count: number;
}

interface Tag {
  name: string;
  count: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Posts() {
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' | null }>({
    field: '',
    direction: null
  })
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData | null>(null)

    // Fetch data on component mount and when page changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [postsRes, tagsRes] = await Promise.all([
          fetch(`/api/posts?page=${currentPage}&limit=10`),
          fetch('/api/tags')
        ])
        
        if (!postsRes.ok || !tagsRes.ok) {
          throw new Error('Failed to fetch data')
        }
        
        const [postsData, tagsData] = await Promise.all([
          postsRes.json(),
          tagsRes.json()
        ])
        
        setPosts(postsData.data || [])
        setPagination(postsData.pagination || null)
        // Only update tags on first load to avoid overwriting
        if (currentPage === 1) {
          setAllTags(tagsData.data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage]) // Re-fetch when page changes

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setShowSortDropdown(false)
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatReadTime = (minutes: number) => {
    return `${minutes} min read`
  }

  const handleSort = (field: string) => {
    if (sortBy.field === field) {
      if (sortBy.direction === null) {
        setSortBy({ field, direction: 'asc' })
      } else if (sortBy.direction === 'asc') {
        setSortBy({ field, direction: 'desc' })
      } else {
        setSortBy({ field: '', direction: null })
      }
    } else {
      setSortBy({ field, direction: 'asc' })
    }
  }

  const toggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter(t => t !== tag))
    } else {
      setActiveTags([...activeTags, tag])
    }
  }

  const resetDateFilter = () => {
    setDateRange({ start: '', end: '' })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Filter and sort posts based on current filters
  const filteredPosts = Array.isArray(posts) ? posts.filter(post => {
    // Search filter - only apply if searchTerm is not empty
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      const matchesTitle = post.title.toLowerCase().includes(searchLower)
      const matchesExcerpt = post.excerpt.toLowerCase().includes(searchLower)
      const matchesTags = post.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
      
      if (!matchesTitle && !matchesExcerpt && !matchesTags) {
        return false
      }
    }

    // Tags filter
    if (activeTags.length > 0) {
      const hasActiveTag = activeTags.some(activeTag => post.tags.some(t => t.name === activeTag))
      if (!hasActiveTag) {
        return false
      }
    }

    // Date filter
    if (dateRange.start || dateRange.end) {
      const postDate = new Date(post.created_at)
      if (dateRange.start && postDate < new Date(dateRange.start)) {
        return false
      }
      if (dateRange.end && postDate > new Date(dateRange.end)) {
        return false
      }
    }

    return true
  }).sort((a, b) => {
    if (!sortBy.field || sortBy.direction === null) {
      return 0
    }

    let aValue: any, bValue: any

    switch (sortBy.field) {
      case 'views':
        aValue = a.view_count
        bValue = b.view_count
        break
      case 'Comments':
        aValue = a.comment_count
        bValue = b.comment_count
        break
      case 'Date':
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
        break
      default:
        return 0
    }

    if (sortBy.direction === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  }) : []

  const getSortIcon = (field: string) => {
    if (sortBy.field !== field || sortBy.direction === null) {
      return null
    }
    return sortBy.direction === 'asc' ? '▲' : '▼'
  }

  const getSortButtonClass = (field: string) => {
    const isActive = sortBy.field === field && sortBy.direction !== null
    return `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
            <p className="mt-2 text-gray-600">
              Thoughts, tutorials, and insights on technology and development
            </p>
          </div>

          <div className="flex gap-8">
            {/* Left Sidebar - Tags */}
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="space-y-2">
                    {loading ? (
                      <p className="text-xs text-gray-500">Loading tags...</p>
                    ) : (
                      Array.isArray(allTags) && allTags.map((tag) => (
                        <button
                          key={tag.name}
                          onClick={() => toggleTag(tag.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                            activeTags.includes(tag.name)
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span>{tag.name}</span>
                          <span className="text-xs">{tag.count}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Clean Search Bar with Action Buttons */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
                <div className="flex items-center gap-3">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search posts by title, excerpt, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  {/* Sort Button */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                        sortBy.field 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      Sort
                      {sortBy.field && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">1</span>
                      )}
                    </button>

                    {/* Sort Dropdown */}
                    {showSortDropdown && (
                      <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">Sort By</div>
                          {[
                            { value: '', label: 'Default (Newest)' },
                            { value: 'Date-desc', label: 'Date (Newest First)' },
                            { value: 'Date-asc', label: 'Date (Oldest First)' },
                            { value: 'views-desc', label: 'Views (Highest First)' },
                            { value: 'views-asc', label: 'Views (Lowest First)' },
                            { value: 'Comments-desc', label: 'Comments (Most First)' },
                            { value: 'Comments-asc', label: 'Comments (Least First)' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                if (option.value === '') {
                                  setSortBy({ field: '', direction: null })
                                } else {
                                  const [field, direction] = option.value.split('-')
                                  setSortBy({ field, direction: direction as 'asc' | 'desc' })
                                }
                                setShowSortDropdown(false)
                              }}
                              className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                                (sortBy.field ? `${sortBy.field}-${sortBy.direction}` : '') === option.value
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Filter Button */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                        (activeTags.length > 0 || dateRange.start || dateRange.end)
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                      </svg>
                      Filter
                      {(activeTags.length > 0 || dateRange.start || dateRange.end) && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                          {activeTags.length + (dateRange.start || dateRange.end ? 1 : 0)}
                        </span>
                      )}
                    </button>

                    {/* Filter Dropdown */}
                    {showFilterDropdown && (
                      <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80">
                        <div className="p-4">
                          {/* Date Range Filter */}
                          <div className="mb-4">
                            <div className="text-xs font-medium text-gray-500 mb-2">Date Range</div>
                            <div className="flex gap-2">
                              <input
                                type="date"
                                placeholder="From"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <input
                                type="date"
                                placeholder="To"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          {/* Active Tags in Filter */}
                          {activeTags.length > 0 && (
                            <div className="mb-4">
                              <div className="text-xs font-medium text-gray-500 mb-2">Active Tags</div>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(activeTags) && activeTags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {tag}
                                    <button
                                      onClick={() => toggleTag(tag)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Clear Filters */}
                          {(activeTags.length > 0 || dateRange.start || dateRange.end) && (
                            <div className="pt-3 border-t border-gray-200">
                              <button
                                onClick={() => {
                                  setActiveTags([])
                                  setDateRange({ start: '', end: '' })
                                  setShowFilterDropdown(false)
                                }}
                                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-1"
                              >
                                Clear all filters
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-3 text-sm text-gray-600">
                  Showing {filteredPosts.length} of {posts.length} posts
                </div>
              </div>

              {/* Posts List */}
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading posts...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error: {error}</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No posts available.</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No posts found matching your criteria.</p>
                    {(searchTerm || activeTags.length > 0 || dateRange.start || dateRange.end || sortBy.field) && (
                      <button
                        onClick={() => {
                          setSearchTerm('')
                          setActiveTags([])
                          setDateRange({ start: '', end: '' })
                          setSortBy({ field: '', direction: null })
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-6">
                        {/* Header with title and date */}
                        <div className="flex items-start justify-between mb-4">
                          <Link href={`/posts/${post.slug}`}>
                            <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer flex-1">
                              {post.title}
                            </h2>
                          </Link>
                          <time className="text-sm text-gray-500 ml-4">{formatDate(post.created_at)}</time>
                        </div>                        {/* Content with thumbnail and excerpt */}
                        <div className="flex gap-4 mb-4">
                          <div className="flex-shrink-0">
                            {post.cover_image_url ? (
                              <img 
                                src={post.cover_image_url} 
                                alt={post.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {Array.isArray(post.tags) && post.tags.map((tag) => (
                            <span
                              key={`${post.id}-${tag.name}`}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: tag.background_color, color: tag.text_color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>

                        {/* Footer with stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatReadTime(post.read_time_minutes)}</span>
                          <span>{post.view_count} views</span>
                          <span>{post.comment_count} comments</span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
                onPageChange={handlePageChange}
              />
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
