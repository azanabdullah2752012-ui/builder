import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import { X, User, Mail, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, showToast } = useEditor();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('owner');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setRole(currentUser.role || 'owner');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name', 'warning');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }

    const updated = {
      name: name.trim(),
      email: email.trim(),
      plan: 'Free (All Features Unlocked)',
      role: role.trim() || 'owner',
    };

    setCurrentUser(updated);
    showToast(`✅ Profile updated! Logged in as ${updated.name}`, 'success');
    onClose();
  };

  const getInitials = (n: string) => {
    if (!n) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12141a] border border-[#262c3d] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-zinc-100 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#222736] flex items-center justify-between bg-[#161a24]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {getInitials(name || currentUser?.name || '')}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Account & Profile Settings</h2>
              <p className="text-[11px] text-zinc-400">Manage your creator credentials and subscription</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-[#0a0c12] border border-[#262c3d] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                className="w-full bg-[#0a0c12] border border-[#262c3d] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Subscription Plan Selection - 100% Free with all features */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Subscription Plan
            </label>
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Free Forever • All Features Unlocked</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  No subscriptions, no tier restrictions, and no paywalls. Unlimited projects and full code export included.
                </p>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-500/30">
                $0 / Free
              </span>
            </div>
          </div>

          {/* Account Role */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Role & Permissions
            </label>
            <div className="flex gap-2">
              {['owner', 'admin', 'designer'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs capitalize transition-all ${
                    role === r
                      ? 'border-purple-500/60 bg-purple-500/15 text-purple-200 font-medium'
                      : 'border-[#262c3d] bg-[#0c0e14] text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
