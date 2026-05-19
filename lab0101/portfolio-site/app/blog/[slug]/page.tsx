import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts } from '../data'

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {

  const post = blogPosts.find(
    (p) => p.slug === params.slug
  )

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-4">
        {post.title}
      </h1>

      <p className="text-gray-600 mb-4">
        {post.date}
      </p>

      <p>{post.content}</p>

      <div className="mt-8">
        <Link href="/blog">
          ← Назад
        </Link>
      </div>

    </article>
  )
}
