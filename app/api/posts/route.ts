import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

export interface PostWithDetails {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  read_time_minutes: number;
  cover_image_url: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  tags: {
    name: string;
    background_color: string;
    text_color: string;
  }[];
  comment_count: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    
    try {
      // First, get the total count of published posts
      const countQuery = `
        SELECT COUNT(*) as total
        FROM posts p
        WHERE p.status = 'published'
      `;
      const countResult = await client.query(countQuery);
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      // Get paginated published posts with their details
      const postsQuery = `
        SELECT 
          p.id,
          p.slug,
          p.title,
          p.excerpt,
          p.read_time_minutes,
          p.cover_image_url,
          p.view_count,
          p.created_at,
          p.updated_at,
          p.published_at
        FROM posts p
        WHERE p.status = 'published'
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const postsResult = await client.query(postsQuery, [limit, offset]);
      const posts = postsResult.rows;
      
      // Get tags for each post
      const postsWithDetails: PostWithDetails[] = await Promise.all(
        posts.map(async (post) => {
          // Get tags for this post
          const tagsQuery = `
            SELECT t.name, t.background_color, t.text_color
            FROM post_tags pt
            JOIN tags t ON pt.tag_id = t.id
            WHERE pt.post_id = $1
            ORDER BY t.name
          `;
          const tagsResult = await client.query(tagsQuery, [post.id]);
          const tags = tagsResult.rows;
          
          // Get comment count for this post
          const commentQuery = `
            SELECT COUNT(*) as count
            FROM comments
            WHERE post_id = $1 AND status = 'visible'
          `;
          const commentResult = await client.query(commentQuery, [post.id]);
          const comment_count = parseInt(commentResult.rows[0].count);
          
          return {
            ...post,
            tags,
            comment_count
          };
        })
      );
      
      return NextResponse.json({
        success: true,
        data: postsWithDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
