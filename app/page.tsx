'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Footer from '../components/Footer'

interface PostData {
  id: number
  slug: string
  title: string
  excerpt: string
  read_time_minutes: number
  cover_image_url: string
  view_count: number
  published_at: string
  tags: {
    name: string;
    background_color: string;
    text_color: string;
  }[];
  comment_count: number
}

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

interface ProjectData {
  id: number
  slug: string
  title: string
  description: string
  year: number
  github_url: string
  live_demo_url: string
  status: string
  tags: {
    name: string;
    background_color: string;
    text_color: string;
  }[];
  created_at: string
  updated_at: string
}

interface CollectionData {
  id: number
  slug: string
  title: string
  description: string
  cover_image_url: string
  post_count: number
  tags: {
    name: string;
    background_color: string;
    text_color: string;
  }[];
  created_at: string
  updated_at: string
}

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<PostData[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [recentReviews, setRecentReviews] = useState<ReviewData[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [recentProjects, setRecentProjects] = useState<ProjectData[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [collections, setCollections] = useState<CollectionData[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)

  // Fetch recent posts from API
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await fetch('/api/posts')
        const data = await response.json()
        
        if (data.success) {
          // Get only the 2 most recent posts
          setRecentPosts(data.data.slice(0, 2))
        }
      } catch (error) {
        console.error('Error fetching recent posts:', error)
      } finally {
        setPostsLoading(false)
      }
    }

    fetchRecentPosts()
  }, [])

  // Fetch recent reviews from API
  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const response = await fetch('/api/reviews')
        const data = await response.json()
        
        if (data.success) {
          // Get only the most recent review
          setRecentReviews(data.data.slice(0, 1))
        }
      } catch (error) {
        console.error('Error fetching recent reviews:', error)
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchRecentReviews()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatReadTime = (minutes: number) => {
    return `${minutes} min read`
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    if (score >= 4) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  // Fetch recent projects from API
  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        const result = await response.json()
        
        if (result.success && result.data) {
          const activeProjects = result.data.filter((project: ProjectData) => 
            project.status.toLowerCase() === 'in-progress' || 
            project.status.toLowerCase() === 'complete' ||
            project.status.toLowerCase() === 'completed'
          );

          if (activeProjects.length > 0) {
            activeProjects.sort((a: ProjectData, b: ProjectData) => {
              // 1. Sort by year descending
              if (b.year !== a.year) {
                return b.year - a.year;
              }

              // 2. Sort by status ('in-progress' is higher priority)
              const statusA = a.status.toLowerCase();
              const statusB = b.status.toLowerCase();
              const isAInProgress = statusA === 'in-progress';
              const isBInProgress = statusB === 'in-progress';

              if (isAInProgress && !isBInProgress) {
                return -1; // a comes first
              }
              if (!isAInProgress && isBInProgress) {
                return 1; // b comes first
              }

              // 3. Sort by updated_at ascending (least recent update)
              const dateA = new Date(a.updated_at).getTime();
              const dateB = new Date(b.updated_at).getTime();
              return dateA - dateB;
            });
            
            // After sorting, take the first one.
            setRecentProjects([activeProjects[0]]);
          } else {
            setRecentProjects([]);
          }
        }
      } catch (error) {
        console.error('Error fetching recent projects:', error)
      } finally {
        setProjectsLoading(false)
      }
    }

    fetchRecentProjects()
  }, [])

  // Fetch collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections')
        const result = await response.json()
        
        // Get the first 3 collections
        setCollections(result.data?.slice(0, 3) || [])
      } catch (error) {
        console.error('Error fetching collections:', error)
      } finally {
        setCollectionsLoading(false)
      }
    }

    fetchCollections()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          
          {/* Hero Section with Image and Introduction */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">My Image</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Chuangji (George) Li&apos;s Personal Website
                </h1>
                <div className="prose max-w-none text-gray-600">
                  <p className="text-lg leading-relaxed">
                    I'm an AI enthusiast and software developer with a background in Statistics and Machine Learning from Carnegie Mellon University. This is my personal space where I share projects, ideas, and experiments at the intersection of machine learning, natural language processing, and scalable systems.
                  </p>
                  {/* <p>
                    Explore my latest posts, check out my projects, read my reviews, and see 
                    what I&apos;ve been collecting.
                  </p> */}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Posts Section */}
          <div className="mb-8">
            <Link href="/posts">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 hover:text-blue-600 cursor-pointer transition-colors">Recent Posts</h2>
            </Link>
            {postsLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {recentPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      {/* Header with title and date */}
                      <div className="mb-4">
                        <Link href={`/posts/${post.slug}`}>
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer mb-2">
                            {post.title}
                          </h3>
                        </Link>
                        <time className="text-sm text-gray-500">{formatDate(post.published_at)}</time>
                      </div>

                      {/* Excerpt */}
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.name}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: tag.background_color, color: tag.text_color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
                        )}
                      </div>

                      {/* Footer with stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatReadTime(post.read_time_minutes)}</span>
                        <span>{post.view_count} views</span>
                        <span>{post.comment_count} comments</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-600">No posts available yet.</p>
              </div>
            )}
          </div>

          {/* Recent Reviews Section */}
          <div className="mb-8">
            <Link href="/reviews">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 hover:text-blue-600 cursor-pointer transition-colors">Recent Reviews</h2>
            </Link>
            {reviewsLoading ? (
              <div className="bg-white shadow rounded-lg p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-32 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : recentReviews.length > 0 ? (
              <div className="space-y-6">
                {recentReviews.map((review) => (
                  <article
                    key={review.id}
                    className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      {/* Header - all in same line */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-bold text-gray-900">
                            {review.object}
                          </h3>
                          {review.author && (
                            <span className="text-sm text-gray-600">
                              by {review.author}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(review.score)}`}>
                            {review.score}/10
                          </span>
                        </div>
                        {review.tags.length > 0 && (
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: review.tags[0].background_color, color: review.tags[0].text_color }}
                          >
                            {review.tags[0].name}
                          </span>
                        )}
                      </div>

                      {/* Content with thumbnail */}
                      <div className="flex gap-4 mb-4">
                        <div className="flex-shrink-0">
                          {review.thumbnail ? (
                            <img
                              src={review.thumbnail}
                              alt={review.object}
                              className="w-24 h-32 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center ${review.thumbnail ? 'hidden' : ''}`}>
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                            {review.review_text}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <time className="text-xs text-gray-500">
                        Reviewed on {formatDate(review.created_at)}
                      </time>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-600">No reviews available yet.</p>
              </div>
            )}
          </div>

          {/* Collections Section */}
          <div className="mb-8">
            <Link href="/collections">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 hover:text-blue-600 cursor-pointer transition-colors">Collections</h2>
            </Link>
            {collectionsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="w-3/4 h-5 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="w-full h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="w-2/3 h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                      <div className="flex items-center justify-between">
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No collections available
              </div>
            ) : (
              <div className="space-y-4">
                {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="block"
                >
                  <article className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="p-4">
                      <div className="flex gap-4">
                        {/* Cover Image - Left Side */}
                        <div className="flex-shrink-0">
                          {collection.cover_image_url ? (
                            <img
                              src={collection.cover_image_url}
                              alt={collection.title}
                              className="w-24 h-24 object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                console.log('Image failed to load:', collection.cover_image_url)
                                e.currentTarget.style.display = 'none'
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                if (fallback) fallback.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center ${collection.cover_image_url ? 'hidden' : ''}`}>
                            <span className="text-gray-400 text-xs text-center">No Cover</span>
                          </div>
                        </div>

                        {/* Content - Right Side */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                              {collection.title}
                            </h3>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {collection.description}
                          </p>
                          
                          {/* Tags */}
                          {collection.tags && collection.tags.length > 0 && (
                            <div className="mb-2">
                              <div className="flex flex-wrap gap-1">
                                {collection.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={`${collection.id}-${tag.name}-${index}`}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                    style={{ backgroundColor: tag.background_color, color: tag.text_color }}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                                {collection.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">+{collection.tags.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{collection.post_count} posts</span>
                            <span className="mx-1">•</span>
                            <span>Created {formatDate(collection.created_at)}</span>
                            {collection.updated_at !== collection.created_at && (
                              <>
                                <span className="mx-1">•</span>
                                <span>Updated {formatDate(collection.updated_at)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            )}
          </div>

          {/* Recent Projects Section */}
          <div className="mb-8">
            <Link href="/projects">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 hover:text-blue-600 cursor-pointer transition-colors">Recent Projects</h2>
            </Link>
            {projectsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <article key={i} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="w-3/4 h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="w-full h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="w-2/3 h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                      <div className="flex items-center justify-between">
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No projects available
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <article
                    key={project.id}
                    className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {project.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 text-sm whitespace-pre-wrap">
                        {project.description}
                      </p>
                      
                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, index) => (
                              <span
                                key={`${project.id}-${tag.name}-${index}`}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                                style={{ backgroundColor: tag.background_color, color: tag.text_color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex space-x-4">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800 font-medium"
                            >
                              GitHub
                            </a>
                          )}
                          {project.live_demo_url && (
                            <a
                              href={project.live_demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Live Demo
                            </a>
                          )}
                        </div>
                        <span className="text-gray-500">{project.year}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
