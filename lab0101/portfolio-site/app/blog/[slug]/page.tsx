import { notFound } from 'next/navigation'
import Link from 'next/link'
import { blogPosts } from '../data'

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-16 prose prose-lg">
      <header className="mb-12">
        <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
        <div className="flex gap-4 text-gray-500">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.author}</span>
        </div>
      </header>
      
      <div className="prose prose-slate">
        <p>{post.content}</p>
        <p>Полный текст статьи будет здесь. В реальном проекте контент можно загружать из MDX или базы данных.</p>
      </div>

      <div className="mt-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
          ← Вернуться к блогу
        </Link>
      </div>
    </article>
  )
}
