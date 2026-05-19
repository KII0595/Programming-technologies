import ProjectCard from '../components/ProjectCard'

const projects = [
  {
    title: 'Интернет-магазин',
    description: 'E-commerce приложение',
    technologies: ['Next.js', 'TypeScript'],
    link: 'https://example.com'
  },
  {
    title: 'To-Do App',
    description: 'Приложение задач',
    technologies: ['React', 'Tailwind'],
    link: 'https://example.com'
  }
]

export default function ProjectsPage() {
  return (
    <div>

      <h1 className="text-3xl font-bold mb-8">
        Мои проекты
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {projects.map((project) => (
          <ProjectCard
            key={project.title}
            title={project.title}
            description={project.description}
            technologies={project.technologies}
            link={project.link}
          />
        ))}

      </div>

    </div>
  )
}
