# George Li's Personal Website Frontend

A modern personal website frontend built with Next.js 15, TypeScript, and Tailwind CSS. This frontend application connects to a separate backend API for dynamic content management.

## Features

- **Responsive Navigation**: Sticky navigation bar that works across all pages
- **Database Integration**: PostgreSQL database with Neon for dynamic content management
- **Home Page**: Overview of all sections with quick access cards
- **About Page**: Personal introduction with skills and interests
- **Posts Page**: Dynamic blog posts fetched from database with filtering, search, and pagination
- **Projects Page**: Showcase of personal projects with tech stacks and links
- **Reviews Page**: Reviews of books, movies, software with star ratings
- **Collections Page**: Personal collections with categories and stats
- **Tag System**: Smart tag filtering that shows only tags from published posts

## Tech Stack

- **Next.js v15** - React framework with App Router and API routes for data fetching
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React** - Component-based UI library
- **pg** - PostgreSQL client for connecting to backend database

## Getting Started

### Prerequisites
- Node.js 18+ 
- Access to backend database (PostgreSQL on Neon)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env.local` file in the root directory:
   ```bash
   # Database Configuration (connects to backend database)
   DATABASE_URL=your_neon_connection_string_here
   
   # Alternative format
   POSTGRES_URL=your_postgres_connection_string_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Connection

This frontend connects directly to the PostgreSQL database for data fetching:

- **Production**: Set `DATABASE_URL` in your deployment platform (Vercel, Netlify, etc.)
- **Local Development**: Add the connection string to `.env.local`
- **SSL Configuration**: Automatically handled for Neon connections

The frontend successfully fetches dynamic content including posts, tags, and metadata from the database.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for database queries
│   │   ├── posts/         # Posts data fetching
│   │   ├── tags/          # Tags data fetching
│   │   └── ...            # Other data endpoints
│   ├── about/page.tsx     # About page
│   ├── posts/             # Blog posts pages
│   │   ├── page.tsx       # Posts listing with search/filter
│   │   └── [slug]/        # Individual post pages
│   ├── projects/page.tsx  # Projects showcase page
│   ├── reviews/page.tsx   # Reviews page
│   ├── collections/       # Collections pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # Reusable UI components
│   ├── Navigation.tsx    # Navigation bar component
│   ├── Footer.tsx        # Footer component
│   └── Pagination.tsx    # Pagination component
├── lib/                  # Utility libraries
│   ├── db.ts            # Database connection configuration
│   └── ...              # Other utilities
└── public/              # Static assets
```

## Pages

- **/** - Home page with overview of all sections
- **/about** - Personal introduction and skills
- **/posts** - Dynamic blog posts with search, filtering, and pagination
- **/posts/[slug]** - Individual blog post pages with markdown rendering
- **/projects** - Personal projects showcase with tech stacks
- **/reviews** - Reviews with ratings
- **/collections** - Personal collections and interests

## API Endpoints

The frontend includes these data-fetching endpoints:

- **GET /api/posts** - Fetch paginated blog posts with metadata
- **GET /api/posts/[slug]** - Fetch individual post content
- **GET /api/tags** - Fetch tags from published posts only
- **GET /api/projects** - Fetch project data
- **GET /api/reviews** - Fetch reviews data
- **GET /api/collections** - Fetch collections data

## Next Steps

1. dark mode
2. dual language
3. comment section
4. put about page in database