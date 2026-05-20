import ProjectCard from '../components/ProjectCard'

const projects = [
  {
    title: 'Интернет-магазин электроники',
    description: 'Полноценный e-commerce с корзиной, оплатой и админ-панелью',
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'Prisma'],
    link: 'https://example.com'
  },
  {
    title: 'Корпоративный портал',
    description: 'Внутренняя система управления задачами и документами',
    technologies: ['React', 'Tailwind', 'Zustand'],
    link: '#'
  },
  {
    title: 'Платформа онлайн-обучения',
    description: 'Интерактивные курсы с прогрессом и сертификатами',
    technologies: ['Next.js', 'Astro', 'MDX'],
  }
]

export default function ProjectsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-bold mb-12">Мои проекты</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, i) => (
          <ProjectCard key={i} {...project} />
        ))}
      </div>
    </div>
  )
}
