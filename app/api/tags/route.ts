import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export interface TagWithCount {
  name: string;
  count: number;
}

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // Step 1: Get all post IDs that have status 'published'
      // Step 2: Use those post_ids to get tag_ids from post_tags table
      // Step 3: Use tag_ids to get tag names from tags table
      // This ensures we only return tags that are actually used by published posts
      const tagsQuery = `
        SELECT 
          t.name,
          COUNT(DISTINCT p.id) as count
        FROM posts p
        INNER JOIN post_tags pt ON p.id = pt.post_id
        INNER JOIN tags t ON pt.tag_id = t.id
        WHERE p.status = 'published'
        GROUP BY t.id, t.name
        ORDER BY count DESC, t.name ASC
      `;
      
      const result = await client.query(tagsQuery);
      const tags: TagWithCount[] = result.rows.map(row => ({
        name: row.name,
        count: parseInt(row.count)
      }));
      
      return NextResponse.json({
        success: true,
        data: tags
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tags',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
