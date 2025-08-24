import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../lib/db'

export interface Project {
  id: number;
  slug: string;
  title: string;
  description: string;
  year: number;
  github_url: string;
  live_demo_url: string;
  status: string;
  tags: {
    name: string;
    background_color: string;
    text_color: string;
  }[];
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = (page - 1) * limit;

    const client = await pool.connect()
    
    try {
      // Get total count for pagination
      const countQuery = 'SELECT COUNT(*) as total FROM projects';
      const countResult = await client.query(countQuery);
      const totalProjects = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalProjects / limit);

      // Get projects with pagination
      const projectsQuery = `
        SELECT DISTINCT
          p.id,
          p.slug,
          p.title,
          p.description,
          p.year,
          p.github_url,
          p.live_demo_url,
          p.created_at,
          p.updated_at
        FROM projects p
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `
      
      const projectsResult = await client.query(projectsQuery, [limit, offset])
      
      // Get the latest status for each project
      const statusQuery = `
        SELECT DISTINCT ON (ps.project_id)
          ps.project_id,
          s.status
        FROM project_status ps
        INNER JOIN statuses s ON ps.status_id = s.id
        ORDER BY ps.project_id, ps.created_at DESC
      `
      
      const statusResult = await client.query(statusQuery)
      
      // Get all tags for all projects
      const tagsQuery = `
        SELECT 
          pt.project_id,
          t.name as tag_name,
          t.background_color,
          t.text_color
        FROM project_tag pt
        INNER JOIN tags t ON pt.tag_id = t.id
        ORDER BY pt.project_id, t.name
      `
      
      const tagsResult = await client.query(tagsQuery)
      
      // Create status lookup map
      const statusMap = new Map()
      statusResult.rows.forEach(row => {
        statusMap.set(row.project_id, row.status)
      })
      
      // Create tags lookup map
      const tagsMap = new Map()
      tagsResult.rows.forEach(row => {
        if (!tagsMap.has(row.project_id)) {
          tagsMap.set(row.project_id, [])
        }
        tagsMap.get(row.project_id).push({
          name: row.tag_name,
          background_color: row.background_color,
          text_color: row.text_color
        })
      })
      
      // Combine all data
      const projects: Project[] = projectsResult.rows.map(project => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description || '',
        year: project.year,
        github_url: project.github_url || '',
        live_demo_url: project.live_demo_url || '',
        status: statusMap.get(project.id) || 'Unknown',
        tags: tagsMap.get(project.id) || [],
        created_at: project.created_at,
        updated_at: project.updated_at
      }))
      
      return NextResponse.json({
        success: true,
        data: projects,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalProjects,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
