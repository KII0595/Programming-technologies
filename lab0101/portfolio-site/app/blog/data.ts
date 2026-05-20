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
    excerpt: 'Основы Next.js и преимущества серверного рендеринга',
    content: 'Next.js — это мощный мета-фреймворк, который значительно упрощает разработку React-приложений...',
    date: '2026-05-01',
    author: 'Иван Иванов'
  },
  {
    id: 2,
    title: 'Почему TypeScript must have в 2026 году',
    slug: 'typescript-in-2026',
    excerpt: 'Преимущества статической типизации в современных фронтенд-проектах',
    content: 'TypeScript стал стандартом де-факто...',
    date: '2026-04-15',
    author: 'Иван Иванов'
  },
  {
    id: 3,
    title: 'Островная архитектура в Astro',
    slug: 'astro-islands',
    excerpt: 'Как Astro радикально улучшает производительность веб-сайтов',
    content: 'Astro — это новый подход к построению веб-сайтов...',
    date: '2026-03-20',
    author: 'Иван Иванов'
  }
]
