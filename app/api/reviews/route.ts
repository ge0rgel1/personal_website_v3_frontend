import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

export interface ReviewWithDetails {
  id: number;
  object: string;
  author: string | null;
  score: number;
  review_text: string;
  thumbnail: string | null;
  created_at: string;
  tags: {
    name: string;
    background_color: string;
    text_color: string;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    
    try {
      // Get total count for pagination
      const countQuery = 'SELECT COUNT(*) as total FROM reviews';
      const countResult = await client.query(countQuery);
      const totalReviews = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalReviews / limit);

      // Get reviews with pagination
      const reviewsQuery = `
        SELECT 
          r.id,
          r.object,
          r.author,
          r.score,
          r.review_text,
          r.thumbnail,
          r.created_at
        FROM reviews r
        ORDER BY r.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const reviewsResult = await client.query(reviewsQuery, [limit, offset]);
      const reviews = reviewsResult.rows;
      
      // Get tags for each review
      const reviewsWithDetails: ReviewWithDetails[] = await Promise.all(
        reviews.map(async (review) => {
          // Get tags for this review
          const tagsQuery = `
            SELECT t.name, t.background_color, t.text_color
            FROM review_tags rt
            JOIN tags t ON rt.tag_id = t.id
            WHERE rt.review_id = $1
            ORDER BY t.name
          `;
          const tagsResult = await client.query(tagsQuery, [review.id]);
          const tags = tagsResult.rows;
          
          return {
            ...review,
            tags
          };
        })
      );
      
      return NextResponse.json({
        success: true,
        data: reviewsWithDetails,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalReviews,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
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
        error: 'Failed to fetch reviews',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
