import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Иван Иванов | Веб-разработчик',
  description: 'Портфолио фронтенд-разработчика',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <header className="bg-gray-900 text-white sticky top-0 z-50">
          <nav className="container mx-auto px-6 py-5">
            <ul className="flex gap-8 justify-center text-lg">
              <li><a href="/" className="hover:text-blue-400 transition">Главная</a></li>
              <li><a href="/about" className="hover:text-blue-400 transition">Обо мне</a></li>
              <li><a href="/blog" className="hover:text-blue-400 transition">Блог</a></li>
              <li><a href="/projects" className="hover:text-blue-400 transition">Проекты</a></li>
            </ul>
          </nav>
        </header>
        
        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-gray-900 text-white py-8 text-center">
          <p>© 2026 Иван Иванов. Все права защищены.</p>
        </footer>
      </body>
    </html>
  )
}
