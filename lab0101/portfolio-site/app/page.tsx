export default function HomePage() {
  return (
    <div className="text-center py-20 bg-gradient-to-b from-gray-50 to-white">
      <h1 className="text-6xl font-bold mb-6">Привет, я Иван Иванов</h1>
      <p className="text-2xl text-gray-600 mb-12">Фронтенд-разработчик</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto px-6">
        {[
          { title: "Next.js", desc: "Современный React-фреймворк" },
          { title: "TypeScript", desc: "Типобезопасная разработка" },
          { title: "Tailwind CSS", desc: "Быстрая и удобная стилизация" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
