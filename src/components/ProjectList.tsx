import { Project } from '../lib/types';
import { ChevronRight, Folder } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export function ProjectList({ projects, onSelectProject }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
        <Folder className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No projects yet
        </h3>
        <p className="text-slate-600">
          Create your first project to get started managing tasks
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <button
          key={project.id}
          onClick={() => onSelectProject(project)}
          className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg hover:border-blue-300 transition transform hover:scale-105 text-left"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6 text-blue-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-slate-600 text-sm line-clamp-2">
              {project.description}
            </p>
          )}
          <p className="text-xs text-slate-500 mt-4">
            {new Date(project.created_at).toLocaleDateString()}
          </p>
        </button>
      ))}
    </div>
  );
}
