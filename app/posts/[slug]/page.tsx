'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import Footer from '../../../components/Footer'
import { markdownComponents } from '../../../lib/markdownComponents'
import { preprocessMathContent } from '../../../lib/markdownUtils'

interface PostData {
  id: number
  slug: string
  title: string
  content_md: string
  read_time_minutes: number
  author: string
  created_at: string
  view_count: number
  comment_count: number
  tags: {
    name: string;
    background_color: string;
    text_color: string;
  }[];
}

export default function PostDetail() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        setLoading(true)
        setError(null)
        try {
          const response = await fetch(`/api/posts/${slug}`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          if (data.success) {
            setPost(data.data)
          } else {
            throw new Error(data.error || 'Post not found')
          }
        } catch (err) {
          console.error('Error fetching post:', err)
          setError(err instanceof Error ? err.message : 'Failed to load post')
        } finally {
          setLoading(false)
        }
      }
      fetchPost()
    }
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading post...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">An Error Occurred</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/posts" className="text-blue-600 hover:text-blue-800">
            ← Back to Posts
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
                <p className="text-gray-600 mb-4">The post you are looking for could not be loaded.</p>
                <Link href="/posts" className="text-blue-600 hover:text-blue-800">
                    ← Back to Posts
                </Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/posts" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              ← Back to Posts
            </Link>
          </div>

          <article className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-8 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <span>By {post.author}</span>
                <span>•</span>
                <time>{formatDate(post.created_at)}</time>
                <span>•</span>
                <span>{post.read_time_minutes} min read</span>
                <span>•</span>
                <span>{post.view_count} views</span>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: tag.background_color, color: tag.text_color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                {post.content_md ? (
                  <ReactMarkdown
                    remarkPlugins={[
                      remarkGfm, 
                      [remarkMath, { 
                        singleDollarTextMath: true,
                        inlineMathDouble: false,
                        blockMathDouble: true
                      }]
                    ]}
                    rehypePlugins={[
                      rehypeRaw,
                      rehypeHighlight,
                      [rehypeKatex, { 
                        output: 'html',
                        strict: false,
                        trust: false,
                        throwOnError: false,
                        fleqn: false,
                        macros: {
                          "\\RR": "\\mathbb{R}",
                          "\\NN": "\\mathbb{N}",
                          "\\ZZ": "\\mathbb{Z}",
                          "\\QQ": "\\mathbb{Q}",
                          "\\CC": "\\mathbb{C}"
                        }
                      }]
                    ]}
                    components={markdownComponents}
                    unwrapDisallowed={true}
                  >
                    {preprocessMathContent(post.content_md)}
                  </ReactMarkdown>
                ) : (
                  <div className="text-gray-400 italic">No content available...</div>
                )}
              </div>
            </div>
          </article>
        </div>
      </main>
      <div className="mt-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  )
}
