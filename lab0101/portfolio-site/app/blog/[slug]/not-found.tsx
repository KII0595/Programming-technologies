import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-12">

      <h1 className="text-4xl font-bold mb-4">
        Статья не найдена
      </h1>

      <Link
        href="/blog"
        className="text-blue-600"
      >
        Вернуться к блогу
      </Link>

    </div>
  )
}
