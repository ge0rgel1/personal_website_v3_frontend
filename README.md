# George Li's Personal Website

A modern personal website built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Responsive Navigation**: Sticky navigation bar that works across all pages
- **Home Page**: Overview of all sections with quick access cards
- **About Page**: Personal introduction with skills and interests
- **Posts Page**: Blog posts with sample content and modern styling
- **Projects Page**: Showcase of personal projects with tech stacks and links
- **Reviews Page**: Reviews of books, movies, software with star ratings
- **Friends Page**: Network of friends and collaborators
- **Collection Page**: Personal collections with categories and stats

## Tech Stack

- **Next.js v15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React** - Component-based UI library

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
website/
├── app/                    # Next.js App Router pages
│   ├── about/page.tsx     # About page
│   ├── posts/page.tsx     # Blog posts page
│   ├── projects/page.tsx  # Projects showcase page
│   ├── reviews/page.tsx   # Reviews page
│   ├── friends/page.tsx   # Friends & network page
│   ├── collection/page.tsx # Collections page
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   └── Navigation.tsx    # Navigation bar component
└── public/               # Static assets
```

## Pages

- **/** - Home page with overview of all sections
- **/about** - Personal introduction and skills
- **/posts** - Blog posts and articles
- **/projects** - Personal projects showcase with tech stacks
- **/reviews** - Reviews with ratings
- **/collections** - Personal collections and interests

## Development

The website is built with a clean architecture in mind:

- **Components**: Reusable UI components in the `components/` directory
- **Pages**: Each page is a separate route using Next.js App Router
- **Styling**: Tailwind CSS for consistent and responsive design
- **TypeScript**: Full type safety throughout the application

## Next Steps

This is the MVP version. Future enhancements may include:

- PostgreSQL integration for dynamic content
- Blog post CMS
- Contact forms
- Enhanced animations and interactions
- Search functionality
- User authentication (if needed)
