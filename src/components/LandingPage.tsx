import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Terminal, Eye, RefreshCw, Bug } from 'lucide-react';
import { AuthForm } from './AuthForm';

type AuthResult = { success: boolean; error?: string };

interface LandingPageProps {
  onRegister: (username: string, password: string, email: string) => AuthResult | Promise<AuthResult>;
  onLogin: (username: string, password: string) => AuthResult | Promise<AuthResult>;
}

const codeLines = [
  { num: 1, text: 'def calculate_total(items):', color: 'text-[#EDEDED]/80' },
  { num: 2, text: '    total = 0', color: 'text-[#EDEDED]/60' },
  { num: 3, text: '    for item in items:', color: 'text-[#EDEDED]/60' },
  { num: 4, text: '        total += item["price"]', color: 'text-[#EDEDED]/60', bug: false },
  { num: 5, text: '        if item["discount"]:', color: 'text-[#EDEDED]/60' },
  { num: 6, text: '            total =- item["discount"]', color: 'text-red-400', bug: true },
  { num: 7, text: '    return total', color: 'text-[#EDEDED]/60' },
];

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [visibleLines, setVisibleLines] = useState(0);
  const [showBugHighlight, setShowBugHighlight] = useState(false);

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= codeLines.length) {
          clearInterval(lineTimer);
          setTimeout(() => setShowBugHighlight(true), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(lineTimer);
  }, []);

  const handleRegisterClick = () => {
    setAuthMode('register');
    setShowAuth(true);
  };

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    window.location.reload();
  };

  if (showAuth) {
    return (
      <AuthForm
        onLogin={onLogin}
        onRegister={onRegister}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-[#4F8CFF]">&lt;v/&gt;</span>
          <span className="text-sm font-semibold text-[#EDEDED]">vibeclub</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => navigate('/problems')}
            variant="ghost"
            className="text-[#666] hover:text-[#EDEDED] hover:bg-transparent text-sm hidden sm:inline-flex"
          >
            Problems
          </Button>
          <Button
            onClick={() => navigate('/tips')}
            variant="ghost"
            className="text-[#666] hover:text-[#EDEDED] hover:bg-transparent text-sm hidden sm:inline-flex"
          >
            Tips
          </Button>
          <div className="w-px h-5 bg-[#1E1E1E] mx-2 hidden sm:block" />
          <Button
            onClick={handleLoginClick}
            variant="ghost"
            className="text-[#666] hover:text-[#EDEDED] hover:bg-transparent text-sm"
          >
            Log in
          </Button>
          <Button
            onClick={handleRegisterClick}
            className="bg-[#4F8CFF] hover:bg-[#3D7AED] text-white text-sm px-4 h-8 rounded-md"
          >
            Get started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <p className="text-[#4F8CFF] text-xs font-mono mb-6 tracking-wide">140 challenges &middot; 3 modes &middot; 12 categories</p>

            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-[1.1] tracking-tight text-[#EDEDED]">
              Build code intuition<br />
              by reading real bugs
            </h1>

            <p className="text-[#666] mb-10 leading-relaxed max-w-md">
              Find bugs, fix them, write solutions from scratch. The fastest way to develop the instinct you need to ship real code.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-14">
              <Button
                onClick={handleRegisterClick}
                className="bg-[#4F8CFF] hover:bg-[#3D7AED] text-white text-sm px-6 h-10 rounded-md"
              >
                Start for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => navigate('/problems')}
                variant="ghost"
                className="text-[#666] hover:text-[#EDEDED] text-sm h-10"
              >
                Browse problems
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 text-sm">
              <div>
                <div className="text-xl font-bold text-[#EDEDED] font-mono">140</div>
                <div className="text-[#555] text-xs">Problems</div>
              </div>
              <div className="w-px h-8 bg-[#1E1E1E]" />
              <div>
                <div className="text-xl font-bold text-[#EDEDED] font-mono">3</div>
                <div className="text-[#555] text-xs">Modes</div>
              </div>
              <div className="w-px h-8 bg-[#1E1E1E]" />
              <div>
                <div className="text-xl font-bold text-[#EDEDED] font-mono">12</div>
                <div className="text-[#555] text-xs">Categories</div>
              </div>
            </div>
          </div>

          {/* Right: Code Preview */}
          <div className="rounded-lg border border-[#1E1E1E] overflow-hidden bg-[#111]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E1E1E]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <span className="ml-3 text-xs text-[#555] font-mono">bug_challenge.py</span>
            </div>
            {/* Code */}
            <div className="p-5 font-mono text-sm leading-7">
              {codeLines.map((line, i) => (
                <div
                  key={line.num}
                  className={`flex transition-all duration-300 rounded px-2 -mx-2 ${
                    i < visibleLines ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  } ${showBugHighlight && line.bug ? 'bg-red-500/5' : ''}`}
                >
                  <span className="w-8 text-[#333] select-none flex-shrink-0">{line.num}</span>
                  <span className={`${showBugHighlight && line.bug ? 'text-red-400' : line.color}`}>
                    {line.text}
                  </span>
                  {showBugHighlight && line.bug && line.num === 6 && (
                    <span className="ml-3 text-xs text-red-400/60 self-center">
                      &larr; =- should be -=
                    </span>
                  )}
                </div>
              ))}
            </div>
            {showBugHighlight && (
              <div className="px-5 py-3 border-t border-[#1E1E1E] flex items-center gap-2">
                <Bug className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-[#666]">Bug found on line 6 — assignment operator error</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Three Modes */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 border-t border-[#1E1E1E]">
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-[#EDEDED] mb-2 tracking-tight">Three ways to learn</h2>
          <p className="text-[#555] text-sm">Each mode builds a different skill</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Eye,
              title: 'Find',
              desc: 'Read Python code and identify the buggy lines. Train your eye for production issues.',
            },
            {
              icon: Terminal,
              title: 'Fix',
              desc: 'Edit code in the built-in editor and submit your fix. Run it against expected output.',
            },
            {
              icon: RefreshCw,
              title: 'Recall',
              desc: 'Start with a blank page and write the full solution. Validated against test cases.',
            },
          ].map((mode) => (
            <div
              key={mode.title}
              onClick={() => navigate('/problems')}
              className="group rounded-lg border border-[#1E1E1E] p-6 hover:border-[#2A2A2A] transition-colors cursor-pointer"
            >
              <mode.icon className="w-5 h-5 text-[#4F8CFF] mb-4" />
              <h3 className="text-sm font-semibold text-[#EDEDED] mb-2">{mode.title}</h3>
              <p className="text-[#555] text-xs leading-relaxed">{mode.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 border-t border-[#1E1E1E]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#EDEDED] mb-3 tracking-tight">Start building your intuition</h2>
          <p className="text-[#555] text-sm mb-8">140 problems. 3 modes. No setup. Free.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleRegisterClick}
              className="bg-[#4F8CFF] hover:bg-[#3D7AED] text-white text-sm px-6 h-10 rounded-md"
            >
              Get started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => navigate('/problems')}
              variant="ghost"
              className="text-[#666] hover:text-[#EDEDED] text-sm h-10 border border-[#1E1E1E] hover:border-[#2A2A2A] hover:bg-transparent"
            >
              Explore first
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1E1E1E] py-8">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#4F8CFF]">&lt;v/&gt;</span>
            <span className="text-[#333] text-xs">vibeclub</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#333]">
            <span onClick={() => navigate('/problems')} className="hover:text-[#666] cursor-pointer transition-colors">Problems</span>
            <span onClick={() => navigate('/tips')} className="hover:text-[#666] cursor-pointer transition-colors">Tips</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
