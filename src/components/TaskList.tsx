import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../lib/types';
import {
  CheckCircle2,
  Circle,
  Trash2,
  Flag,
  Calendar,
  FileText,
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated: () => void;
  userId: string;
}

export function TaskList({ tasks, onTaskUpdated, userId }: TaskListProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const updateTaskStatus = async (
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed'
  ) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
      onTaskUpdated();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      onTaskUpdated();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
        <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No tasks yet
        </h3>
        <p className="text-slate-600">Create a task to get started</p>
      </div>
    );
  }

  const groupedTasks = {
    completed: tasks.filter((t) => t.status === 'completed'),
    inProgress: tasks.filter((t) => t.status === 'in_progress'),
    pending: tasks.filter((t) => t.status === 'pending'),
  };

  return (
    <div className="space-y-6">
      {/* Active Tasks */}
      {(groupedTasks.inProgress.length > 0 || groupedTasks.pending.length > 0) && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Active Tasks</h2>
          <div className="space-y-3">
            {[...groupedTasks.inProgress, ...groupedTasks.pending].map(
              (task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() =>
                          updateTaskStatus(
                            task.id,
                            task.status === 'in_progress' ? 'pending' : 'in_progress'
                          )
                        }
                        className="mt-1 text-slate-400 hover:text-blue-600 transition"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {task.title}
                        </h3>
                        {task.description && (
                          <button
                            onClick={() =>
                              setExpandedTask(
                                expandedTask === task.id ? null : task.id
                              )
                            }
                            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 mt-1"
                          >
                            <FileText className="w-4 h-4" />
                            {expandedTask === task.id ? 'Hide' : 'Show'} details
                          </button>
                        )}
                        {expandedTask === task.id && (
                          <p className="text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded border border-slate-200">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-3">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${getPriorityColor(task.priority)}`}
                          >
                            <Flag className="w-3 h-3" />
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Mark as completed"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete task"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {groupedTasks.completed.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Completed ({groupedTasks.completed.length})
          </h2>
          <div className="space-y-3">
            {groupedTasks.completed.map((task) => (
              <div
                key={task.id}
                className="bg-slate-50 rounded-lg border border-slate-200 p-4 opacity-75"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => updateTaskStatus(task.id, 'pending')}
                      className="text-green-600 hover:text-slate-400 transition"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-600 line-through">
                        {task.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
