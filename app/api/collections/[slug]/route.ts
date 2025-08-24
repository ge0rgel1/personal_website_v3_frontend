import { NextResponse } from 'next/server'
import pool from '../../../../lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get collection details
    const collectionQuery = `
      SELECT 
        c.id,
        c.slug,
        c.title,
        c.description,
        c.cover_image_url,
        c.created_at,
        c.updated_at
      FROM collections c
      WHERE c.slug = $1 AND c.is_public = true
    `
    
    const collectionResult = await pool.query(collectionQuery, [slug])
    
    if (collectionResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Collection not found' 
        },
        { status: 404 }
      )
    }
    
    const collection = collectionResult.rows[0]
    
    // Get collection tags
    const tagsQuery = `
      SELECT 
        json_agg(
          json_build_object(
            'name', t.name,
            'background_color', t.background_color,
            'text_color', t.text_color
          )
        ) as tags
      FROM collection_tags ct
      JOIN tags t ON ct.tag_id = t.id
      WHERE ct.collection_id = $1
    `
    
    const tagsResult = await pool.query(tagsQuery, [collection.id])
    const collectionTags = tagsResult.rows[0].tags || []
    
    // Get posts in this collection with their details
    const postsQuery = `
      SELECT 
        p.id,
        p.slug,
        p.title,
        p.excerpt,
        p.read_time_minutes,
        p.cover_image_url,
        p.view_count,
        p.published_at,
        cp.position,
        (
          SELECT json_agg(
            json_build_object(
              'name', t.name,
              'background_color', t.background_color,
              'text_color', t.text_color
            )
          )
          FROM post_tags pt
          JOIN tags t ON pt.tag_id = t.id
          WHERE pt.post_id = p.id
        ) as tags,
        COUNT(DISTINCT c.id) as comment_count
      FROM collection_posts cp
      JOIN posts p ON cp.post_id = p.id
      LEFT JOIN comments c ON p.id = c.post_id AND c.status = 'visible'
      WHERE cp.collection_id = $1 AND p.status = 'published'
      GROUP BY p.id, p.slug, p.title, p.excerpt, p.read_time_minutes, 
               p.cover_image_url, p.view_count, p.published_at, cp.position
      ORDER BY cp.position ASC, p.published_at DESC
    `
    
    const postsResult = await pool.query(postsQuery, [collection.id])
    
    const posts = postsResult.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      read_time_minutes: row.read_time_minutes,
      cover_image_url: row.cover_image_url,
      view_count: parseInt(row.view_count) || 0,
      published_at: row.published_at,
      tags: row.tags || [],
      comment_count: parseInt(row.comment_count) || 0
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        collection: {
          ...collection,
          tags: collectionTags
        },
        posts
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch collection' 
      },
      { status: 500 }
    )
  }
}
