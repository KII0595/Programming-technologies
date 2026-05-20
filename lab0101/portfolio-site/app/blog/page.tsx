import Link from 'next/link'
import { blogPosts } from './data'

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-bold mb-12">Блог</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-white border rounded-2xl p-8 hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold mb-3">
              <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-6">{post.excerpt}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{post.date}</span>
              <span>{post.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
