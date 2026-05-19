import Link from 'next/link'
import { blogPosts } from './data'

export default function BlogPage() {
  return (
    <div>

      <h1 className="text-3xl font-bold mb-8">
        Блог
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {blogPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-6 rounded-lg shadow-lg"
          >

            <h2 className="text-xl font-semibold mb-2">
              <Link href={`/blog/${post.slug}`}>
                {post.title}
              </Link>
            </h2>

            <p className="text-gray-600 mb-3">
              {post.excerpt}
            </p>

          </div>
        ))}

      </div>
    </div>
  )
}
