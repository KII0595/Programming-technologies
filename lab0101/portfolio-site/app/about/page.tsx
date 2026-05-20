export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-bold mb-12">Обо мне</h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Навыки</h2>
          <ul className="space-y-3 text-lg">
            <li>✅ React, Next.js, TypeScript</li>
            <li>✅ Tailwind CSS, Vite</li>
            <li>✅ Zustand, TanStack Query</li>
            <li>✅ Git, Docker, Linux</li>
            <li>✅ REST API, GraphQL</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-6">Опыт работы</h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-medium">Фронтенд-разработчик — ООО "TechCorp"</h3>
              <p className="text-gray-500">2024 — настоящее время</p>
              <p className="mt-2">Разработка высоконагруженных веб-приложений на Next.js.</p>
            </div>
            <div>
              <h3 className="font-medium">Junior Frontend Developer — StartupHub</h3>
              <p className="text-gray-500">2023 — 2024</p>
              <p className="mt-2">Создание SPA-приложений на React + Vite.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
