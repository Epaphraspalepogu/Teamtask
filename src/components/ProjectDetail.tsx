import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, Task, TeamMember } from '../lib/types';
import { ArrowLeft, Plus, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { TeamPanel } from './TeamPanel';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  userId: string;
}

export function ProjectDetail({ project, onBack, userId }: ProjectDetailProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'member'>('member');

  useEffect(() => {
    loadProjectData();
  }, [project.id, userId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);

      // Load tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      // Load team members
      const { data: membersData } = await supabase
        .from('team_members')
        .select('*')
        .eq('project_id', project.id);

      // Check user role
      const userMember = membersData?.find((m) => m.user_id === userId);
      if (userMember) {
        setUserRole(userMember.role);
      }

      setTasks(tasksData || []);
      setTeamMembers(membersData || []);
    } catch (err) {
      console.error('Error loading project data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStats = () => {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      pending: tasks.filter((t) => t.status === 'pending').length,
    };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {project.name}
        </h1>
        {project.description && (
          <p className="text-slate-600 text-lg mb-6">{project.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-1">Total Tasks</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-1">
              <Clock className="w-4 h-4" />
              In Progress
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-1">
              <CheckCircle className="w-4 h-4" />
              Completed
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-1">
              <AlertCircle className="w-4 h-4" />
              Pending
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg hover:shadow-lg transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
          <button
            onClick={() => setShowTeamPanel(!showTeamPanel)}
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-2.5 rounded-lg transition font-semibold"
          >
            <Users className="w-5 h-5" />
            Team ({teamMembers.length})
          </button>
        </div>
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <TaskForm
          projectId={project.id}
          userId={userId}
          onTaskCreated={(task) => {
            setTasks([task, ...tasks]);
            setShowTaskForm(false);
          }}
        />
      )}

      {/* Team Panel */}
      {showTeamPanel && (
        <TeamPanel
          projectId={project.id}
          teamMembers={teamMembers}
          userRole={userRole}
          onTeamUpdated={loadProjectData}
        />
      )}

      {/* Tasks */}
      <TaskList
        tasks={tasks}
        onTaskUpdated={loadProjectData}
        userId={userId}
      />
    </div>
  );
}
