interface ProjectCardProps {
  title: string
  description: string
  technologies: string[]
  link?: string
}

export default function ProjectCard({ 
  title, 
  description, 
  technologies, 
  link 
}: ProjectCardProps) {
  return (
    <div className="border rounded-2xl p-8 hover:shadow-xl transition group">
      <h3 className="text-2xl font-semibold mb-4 group-hover:text-blue-600 transition">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {technologies.map((tech, i) => (
          <span key={i} className="px-4 py-1 bg-gray-100 text-sm rounded-full">
            {tech}
          </span>
        ))}
      </div>

      {link && (
        <a 
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          Посмотреть проект →
        </a>
      )}
    </div>
  )
}
