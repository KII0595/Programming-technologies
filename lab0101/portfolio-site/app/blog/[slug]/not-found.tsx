import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="text-6xl font-bold mb-6">404</h1>
      <p className="text-2xl mb-8">Статья не найдена</p>
      <Link 
        href="/blog"
        className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg hover:bg-blue-700 transition"
      >
        Вернуться к блогу
      </Link>
    </div>
  )
}
