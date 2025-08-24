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
      // Get all tags with their post counts (only for published posts)
      const tagsQuery = `
        SELECT 
          t.name,
          COUNT(pt.post_id) as count
        FROM tags t
        LEFT JOIN post_tags pt ON t.id = pt.tag_id
        LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
        GROUP BY t.id, t.name
        HAVING COUNT(pt.post_id) > 0
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
