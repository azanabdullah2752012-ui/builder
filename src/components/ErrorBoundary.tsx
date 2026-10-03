import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Craft Studio ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleHardReset = () => {
    try {
      localStorage.removeItem('visual_website_builder_project_v14');
      localStorage.removeItem('craft_auth_user');
      localStorage.removeItem('craft_editor_complexity');
      localStorage.removeItem('craft_onboarding_completed');
      sessionStorage.clear();
    } catch {}
    window.location.href = window.location.pathname;
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleTryRecover = () => {
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (err) {
        console.error('Error in onReset:', err);
      }
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[360px] flex items-center justify-center p-6 bg-[#0a0c12] text-zinc-100 select-none">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#131622] border border-[#232a3d] shadow-2xl flex flex-col items-center text-center animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1.5">
              {this.props.fallbackTitle || 'Workspace Recovered'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              An unexpected render conflict was prevented from crashing the studio. You can restore default state or reload safely.
            </p>

            {this.state.error && (
              <div className="w-full p-2.5 mb-5 rounded-lg bg-[#0d0f17] border border-[#1e2436] text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
              <button
                type="button"
                onClick={this.handleTryRecover}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Recover</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-[#262e44] bg-[#161a29] hover:bg-[#1c2236] text-zinc-300 text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>
            </div>

            <button
              type="button"
              onClick={this.handleHardReset}
              className="mt-3 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3 h-3" />
              <span>Reset saved state & start fresh</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
