import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, Task } from '../lib/types';
import { LogOut, Plus, Menu, X } from 'lucide-react';
import { ProjectList } from './ProjectList';
import { ProjectDetail } from './ProjectDetail';

interface DashboardProps {
  onLogout: () => void;
  userId: string;
}

export function Dashboard({ onLogout, userId }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            created_by: userId,
            name: newProjectName,
            description: newProjectDesc,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add user as admin
      await supabase.from('team_members').insert([
        {
          project_id: data.id,
          user_id: userId,
          role: 'admin',
        },
      ]);

      setProjects([data, ...projects]);
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProjectForm(false);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">TM</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Task Manager</h1>
          </div>

          <button
            onClick={onLogout}
            className="hidden md:flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-600"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 px-4 py-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedProject ? (
          <ProjectDetail
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
            userId={userId}
          />
        ) : (
          <div>
            {/* New Project Section */}
            {!showNewProjectForm ? (
              <button
                onClick={() => setShowNewProjectForm(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105 mb-8 font-semibold"
              >
                <Plus className="w-5 h-5" />
                New Project
              </button>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Create New Project
                </h2>
                <form onSubmit={createProject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g., Website Redesign"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder="Brief description of your project"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewProjectForm(false);
                        setNewProjectName('');
                        setNewProjectDesc('');
                      }}
                      className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Projects List */}
            <ProjectList
              projects={projects}
              onSelectProject={setSelectedProject}
            />
          </div>
        )}
      </div>
    </div>
  );
}
