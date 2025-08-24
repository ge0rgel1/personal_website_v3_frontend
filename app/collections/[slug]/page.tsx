'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Footer from '../../../components/Footer'

interface Tag {
  name: string;
  background_color: string;
  text_color: string;
}

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  read_time_minutes: number;
  cover_image_url: string;
  view_count: number;
  published_at: string;
  tags: Tag[];
  comment_count: number;
}

interface Collection {
  id: number;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export default function CollectionDetail() {
  const params = useParams()
  const slug = params.slug as string
  
  const [collection, setCollection] = useState<Collection | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const response = await fetch(`/api/collections/${slug}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch collection')
        }
        
        const data = await response.json()
        setCollection(data.data.collection)
        setPosts(data.data.posts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCollectionData()
    }
  }, [slug])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-8">
              <p className="text-gray-600">Loading collection...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-8">
              <p className="text-red-600">Error: {error || 'Collection not found'}</p>
              <Link href="/collections" className="text-purple-600 hover:text-purple-800 mt-4 inline-block">
                ← Back to Collections
              </Link>
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
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link href="/collections" className="hover:text-purple-600">
                Collections
              </Link>
              <span>›</span>
              <span className="text-gray-900">{collection.title}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{collection.title}</h1>
            
            {/* Cover Image */}
            {collection.cover_image_url && (
              <div className="mb-6">
                <img
                  src={collection.cover_image_url}
                  alt={collection.title}
                  className="w-full max-w-2xl h-64 object-cover rounded-lg shadow-sm"
                />
              </div>
            )}
            
            {collection.description && (
              <p className="text-lg text-gray-600 mb-4">{collection.description}</p>
            )}

            {/* Collection Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>{posts.length} posts</span>
              <span>Created {formatDate(collection.created_at)}</span>
              {collection.updated_at !== collection.created_at && (
                <span>Updated {formatDate(collection.updated_at)}</span>
              )}
            </div>
            {/* Collection Tags */}
            {collection.tags && collection.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {collection.tags.map((tag) => (
                        <span
                            key={tag.name}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: tag.background_color, color: tag.text_color }}
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}
          </div>

          {/* Posts in Collection */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No posts in this collection yet.</p>
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Header with title and date */}
                    <div className="flex items-start justify-between mb-4">
                      <Link href={`/posts/${post.slug}`}>
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-purple-600 cursor-pointer flex-1">
                          {post.title}
                        </h2>
                      </Link>
                      <time className="text-sm text-gray-500 ml-4">{formatDate(post.published_at)}</time>
                    </div>

                    {/* Content with thumbnail and excerpt */}
                    <div className="flex gap-4 mb-4">
                      <div className="flex-shrink-0">
                        {post.cover_image_url ? (
                          <img 
                            src={post.cover_image_url} 
                            alt={post.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {Array.isArray(post.tags) && post.tags.map((tag) => (
                        <span
                          key={tag.name}
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
          
          {/* Footer */}
          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
