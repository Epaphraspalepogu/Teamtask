import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TeamMember, Profile } from '../lib/types';
import { Users, Plus, Trash2, Crown } from 'lucide-react';

interface TeamPanelProps {
  projectId: string;
  teamMembers: TeamMember[];
  userRole: 'admin' | 'member';
  onTeamUpdated: () => void;
}

export function TeamPanel({
  projectId,
  teamMembers,
  userRole,
  onTeamUpdated,
}: TeamPanelProps) {
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfiles();
  }, [teamMembers]);

  const loadProfiles = async () => {
    try {
      const userIds = teamMembers.map((m) => m.user_id);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (data) {
        const map = new Map();
        data.forEach((p) => map.set(p.id, p));
        setProfiles(map);
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
    }
  };

  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError('');

      // Get user by email
      const { data: authData } = await supabase.auth.admin.listUsers();

      const user = authData?.users.find((u) => u.email === email.trim());

      if (!user) {
        setError('User not found. Make sure the email is registered.');
        return;
      }

      // Check if already a member
      const existingMember = teamMembers.find(
        (m) => m.user_id === user.id
      );
      if (existingMember) {
        setError('This user is already a team member.');
        return;
      }

      const { error: err } = await supabase
        .from('team_members')
        .insert([
          {
            project_id: projectId,
            user_id: user.id,
            role: 'member',
          },
        ]);

      if (err) throw err;

      setEmail('');
      setShowAddForm(false);
      onTeamUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!window.confirm('Remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      onTeamUpdated();
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {showAddForm && userRole === 'admin' && (
        <form onSubmit={addTeamMember} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter member email"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {/* Team Members List */}
      <div className="space-y-3">
        {teamMembers.map((member) => {
          const profile = profiles.get(member.user_id);
          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    {member.role === 'admin' && (
                      <Crown className="w-3 h-3 text-yellow-600" />
                    )}
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </p>
                </div>
              </div>
              {userRole === 'admin' && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Remove member"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
