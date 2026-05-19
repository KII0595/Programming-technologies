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
    <div className="border rounded-lg p-6 shadow-sm">

      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>

      <p className="text-gray-600 mb-4">
        {description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">

        {technologies.map((tech) => (
          <span
            key={tech}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
          >
            {tech}
          </span>
        ))}

      </div>

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600"
        >
          Посмотреть проект →
        </a>
      )}

    </div>
  )
}
