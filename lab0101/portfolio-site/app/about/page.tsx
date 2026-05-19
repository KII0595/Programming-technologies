export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Обо мне
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">

        <h2 className="text-xl font-semibold mb-3">
          Навыки
        </h2>

        <ul className="list-disc pl-5 space-y-1">
          <li>React</li>
          <li>Next.js</li>
          <li>TypeScript</li>
          <li>Tailwind CSS</li>
          <li>Node.js</li>
        </ul>

      </div>

    </div>
  )
}
