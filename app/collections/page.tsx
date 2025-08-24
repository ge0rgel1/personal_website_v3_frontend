'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Footer from '../../components/Footer'
import Pagination from '../../components/Pagination'

interface Collection {
  id: number;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string;
  post_count: number;
  tags: {
    name: string;
    background_color: string;
    text_color: string;
  }[];
  created_at: string;
  updated_at: string;
}

interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function Collection() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(`/api/collections?page=${currentPage}&limit=6`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch collections')
        }
        
        const data = await response.json()
        
        if (data.success) {
          setCollections(data.data || [])
          setPagination(data.pagination)
        } else {
          throw new Error(data.error || 'Failed to load collections')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of collections section
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Collection</h1>
            <p className="mt-2 text-gray-600">
              Things I collect, build, and find interesting
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading collections...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No collections available.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="block"
                >
                  <article className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex gap-6">
                        {/* Cover Image - Left Side */}
                        <div className="flex-shrink-0">
                          {collection.cover_image_url ? (
                            <img
                              src={collection.cover_image_url}
                              alt={collection.title}
                              className="w-36 h-36 object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                console.log('Image failed to load:', collection.cover_image_url)
                                e.currentTarget.style.display = 'none'
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                if (fallback) fallback.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-36 h-36 bg-gray-200 rounded-lg flex items-center justify-center ${collection.cover_image_url ? 'hidden' : ''}`}>
                            <span className="text-gray-400 text-sm text-center">No Cover Image</span>
                          </div>
                        </div>

                        {/* Content - Right Side */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h2 className="text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                              {collection.title}
                            </h2>
                          </div>
                          
                          <p className="text-gray-600 mb-4">
                            {collection.description || 'No description available'}
                          </p>
                          
                          {/* Tags */}
                          {collection.tags && collection.tags.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {collection.tags.map((tag, index) => (
                                  <span
                                    key={`${collection.id}-${tag.name}-${index}`}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                                    style={{ backgroundColor: tag.background_color, color: tag.text_color }}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{collection.post_count} posts</span>
                              <span className="mx-2">•</span>
                              <span>Created {formatDate(collection.created_at)}</span>
                              {collection.updated_at !== collection.created_at && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Updated {formatDate(collection.updated_at)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
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
          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
