import React, { useState } from 'react';
import { useEditor } from '../../context/useEditor';
import { databaseService } from '../../services/databaseService';
import {
  X,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentUser, setEditorMode, showToast } = useEditor();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      const res = await databaseService.signInWithGoogle();
      if (!res.success && res.error) {
        setErrorMsg(res.error);
        setGoogleLoading(false);
      } else if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize Google authentication');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'signup') {
        const res = await databaseService.signup({
          name: fullName.trim() || email.split('@')[0],
          email: email.trim(),
          password,
          plan: 'Free Trial',
        });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setEditorMode('design');
          showToast(`Welcome ${res.user.name}! Account connected to Supabase.`, 'success');
          onClose();
        } else {
          setErrorMsg(res.message || 'Failed to complete registration');
        }
      } else {
        const res = await databaseService.signin({
          email: email.trim(),
          password,
        });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setEditorMode('design');
          showToast(`Welcome back, ${res.user.name}!`, 'success');
          onClose();
        } else {
          setErrorMsg(res.message || 'Invalid email or password');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12141a] border border-[#262c3d] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#202533] flex items-center justify-between bg-[#151923]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {mode === 'signin' ? 'Sign In to Craft Studio' : 'Create Your Studio Account'}
              </h2>
              <p className="text-[11px] text-zinc-400">
                Cloud persistence, multi-project sync & version rollbacks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-[#1b212f] border border-[#2c364c] hover:border-indigo-400/50 hover:bg-[#202738] text-white text-xs font-medium transition-all shadow-sm group"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px flex-1 bg-[#222838]" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
              Or email & password
            </span>
            <div className="h-px flex-1 bg-[#222838]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Azan Abdullah"
                  className="w-full px-3 py-2 bg-[#171b26] border border-[#273042] rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-zinc-500">Supabase Connected</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#171b26] border border-[#273042] rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 bg-[#171b26] border border-[#273042] rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all mt-4"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Studio Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="pt-2 text-center text-xs text-zinc-400">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline-offset-2 hover:underline ml-1"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline-offset-2 hover:underline ml-1"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0d0f14] border-t border-[#1a1f2b] flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-medium">Supabase Auth & RLS Protected</span>
          </div>
          <span>v2.197.0</span>
        </div>
      </div>
    </div>
  );
};
