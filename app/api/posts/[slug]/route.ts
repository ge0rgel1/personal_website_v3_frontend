import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export interface PostDetail {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  read_time_minutes: number;
  cover_image_url: string;
  view_count: number;
  author: string;
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const client = await pool.connect();
    
    try {
      // Get the post by slug
      const postQuery = `
        SELECT 
          p.id,
          p.slug,
          p.title,
          p.excerpt,
          p.content_md,
          p.read_time_minutes,
          p.cover_image_url,
          p.view_count,
          p.author,
          p.created_at,
          p.updated_at,
          p.published_at
        FROM posts p
        WHERE p.slug = $1 AND p.status = 'published'
      `;
      
      const postResult = await client.query(postQuery, [slug]);
      
      if (postResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Post not found' },
          { status: 404 }
        );
      }
      
      const post = postResult.rows[0];
      
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
      
      // Increment view count and get the updated value
      const updateViewQuery = `
        UPDATE posts 
        SET view_count = view_count + 1 
        WHERE id = $1
        RETURNING view_count
      `;
      const viewResult = await client.query(updateViewQuery, [post.id]);
      const updated_view_count = viewResult.rows[0].view_count;
      
      const postDetail: PostDetail = {
        ...post,
        tags,
        comment_count,
        view_count: updated_view_count // Use the actual updated count from database
      };
      
      return NextResponse.json({
        success: true,
        data: postDetail
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
