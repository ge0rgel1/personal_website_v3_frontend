import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) as total FROM collections WHERE is_public = true';
    const countResult = await pool.query(countQuery);
    const totalCollections = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalCollections / limit);

    // First query: Get collections with post counts (with pagination)
    const collectionsQuery = `
      SELECT 
        c.id,
        c.slug,
        c.title,
        c.description,
        c.cover_image_url,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT cp.post_id) as post_count
      FROM collections c
      LEFT JOIN collection_posts cp ON c.id = cp.collection_id
      WHERE c.is_public = true
      GROUP BY c.id, c.slug, c.title, c.description, c.cover_image_url, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `
    
    // Second query: Get tags for current page collections only
    const tagsQuery = `
      SELECT 
        ct.collection_id,
        json_agg(json_build_object('name', t.name, 'background_color', t.background_color, 'text_color', t.text_color) ORDER BY t.name) as tags
      FROM collection_tags ct
      JOIN tags t ON ct.tag_id = t.id
      WHERE ct.collection_id IN (
        SELECT c.id FROM collections c WHERE c.is_public = true
        ORDER BY c.created_at DESC
        LIMIT $1 OFFSET $2
      )
      GROUP BY ct.collection_id
    `
    
    const [collectionsResult, tagsResult] = await Promise.all([
      pool.query(collectionsQuery, [limit, offset]),
      pool.query(tagsQuery, [limit, offset])
    ])
    
    // Create a map of collection_id -> tags
    const tagsMap = new Map()
    tagsResult.rows.forEach(row => {
      tagsMap.set(row.collection_id, row.tags || [])
    })
    
    const collections = collectionsResult.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      cover_image_url: row.cover_image_url,
      post_count: parseInt(row.post_count) || 0,
      tags: tagsMap.get(row.id) || [],
      created_at: row.created_at,
      updated_at: row.updated_at
    }))
    
    // Get unique post count across all collections
    const uniquePostsQuery = `
      SELECT COUNT(DISTINCT cp.post_id) as unique_post_count
      FROM collection_posts cp
      JOIN collections c ON cp.collection_id = c.id
      WHERE c.is_public = true
    `
    
    const uniquePostsResult = await pool.query(uniquePostsQuery)
    const uniquePostCount = parseInt(uniquePostsResult.rows[0]?.unique_post_count) || 0
    
    return NextResponse.json({
      success: true,
      data: collections,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCollections,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      meta: {
        unique_post_count: uniquePostCount
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch collections' 
      },
      { status: 500 }
    )
  }
}
