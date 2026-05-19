export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  date: string
  author: string
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Введение в Next.js',
    slug: 'introduction-to-nextjs',
    excerpt: 'Основы Next.js',
    content: 'Полный текст статьи...',
    date: '2026-01-15',
    author: 'Иван Иванов'
  },
  {
    id: 2,
    title: 'Что такое TypeScript',
    slug: 'what-is-typescript',
    excerpt: 'Преимущества TypeScript',
    content: 'TypeScript делает код надежнее.',
    date: '2026-02-10',
    author: 'Иван Иванов'
  }
]
