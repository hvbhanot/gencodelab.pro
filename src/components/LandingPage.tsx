import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Terminal, Eye, RefreshCw, Bug, CheckCircle2, Code2, Shield, Zap, Brain, ChevronRight, ExternalLink } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { DiscordLogo } from './DiscordLogo';
import { problems } from '@/data/problems';

type AuthResult = { success: boolean; error?: string };

interface LandingPageProps {
  onRegister: (username: string, password: string, email: string) => AuthResult | Promise<AuthResult>;
  onLogin: (username: string, password: string) => AuthResult | Promise<AuthResult>;
}

const codeLines = [
  { num: 1, text: 'def calculate_total(items):', type: 'keyword' },
  { num: 2, text: '    total = 0', type: 'normal' },
  { num: 3, text: '    for item in items:', type: 'normal' },
  { num: 4, text: '        total += item["price"]', type: 'normal' },
  { num: 5, text: '        if item["discount"]:', type: 'normal' },
  { num: 6, text: '            total =- item["discount"]', type: 'bug' },
  { num: 7, text: '    return total', type: 'normal' },
];

const DISCORD_URL = 'https://discord.gg/UveSX7Wz';

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [visibleLines, setVisibleLines] = useState(0);
  const [showBugHighlight, setShowBugHighlight] = useState(false);
  const [terminalText, setTerminalText] = useState('');

  const totalProblems = problems.length;
  const easyCount = problems.filter(p => p.difficulty === 'easy').length;
  const mediumCount = problems.filter(p => p.difficulty === 'medium').length;
  const hardCount = problems.filter(p => p.difficulty === 'hard').length;

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= codeLines.length) {
          clearInterval(lineTimer);
          setTimeout(() => setShowBugHighlight(true), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 180);
    return () => clearInterval(lineTimer);
  }, []);

  useEffect(() => {
    if (!showBugHighlight) return;
    const fullText = '$ gencodelab scan --file bug_challenge.py\n  Found 1 bug on line 6: assignment operator =- should be -=\n  Severity: high | Category: syntax\n  Fix: Replace =- with -=';
    let i = 0;
    const typeTimer = setInterval(() => {
      if (i <= fullText.length) {
        setTerminalText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(typeTimer);
      }
    }, 15);
    return () => clearInterval(typeTimer);
  }, [showBugHighlight]);

  const handleRegisterClick = () => { setAuthMode('register'); setShowAuth(true); };
  const handleLoginClick = () => { setAuthMode('login'); setShowAuth(true); };
  const handleAuthSuccess = () => { setShowAuth(false); window.location.reload(); };

  if (showAuth) {
    return <AuthForm onLogin={onLogin} onRegister={onRegister} initialMode={authMode} onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E4E4E7]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-base font-bold text-[#22C55E]">&lt;g/&gt;</span>
          <span className="text-base font-semibold tracking-tight">gencodelab.pro</span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/problems')} variant="ghost" className="text-[#A1A1AA] hover:text-white hover:bg-white/5 text-sm hidden sm:inline-flex">
            Problems
          </Button>
          <Button onClick={() => navigate('/tips')} variant="ghost" className="text-[#A1A1AA] hover:text-white hover:bg-white/5 text-sm hidden sm:inline-flex">
            Tips
          </Button>
          <Button asChild variant="ghost" className="text-[#A1A1AA] hover:text-white hover:bg-white/5 text-sm hidden sm:inline-flex">
            <a href={DISCORD_URL} target="_blank" rel="noreferrer">
              <DiscordLogo className="w-4 h-4" />
              Discord
            </a>
          </Button>
          <div className="w-px h-5 bg-[rgba(255,255,255,0.1)] mx-1 hidden sm:block" />
          <Button onClick={handleLoginClick} variant="ghost" className="text-[#A1A1AA] hover:text-white hover:bg-white/5 text-sm">
            Log in
          </Button>
          <Button onClick={handleRegisterClick} className="bg-[#22C55E] hover:bg-[#16A34A] text-black text-sm font-semibold px-4 h-9 rounded-lg">
            Get started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-28 pb-20">
        <div className="grid lg:grid-cols-[1fr,1.1fr] gap-12 lg:gap-20 items-start">
          {/* Left — copy */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs font-medium text-[#22C55E]">{totalProblems} challenges &middot; 3 modes &middot; free</span>
            </div>

            <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight mb-6">
              Train your eye.<br />
              <span className="text-[#22C55E]">Spot the bug.</span>
            </h1>

            <p className="text-lg text-[#A1A1AA] mb-10 leading-relaxed max-w-lg">
              {totalProblems} Python challenges that build the instinct real developers rely on.
              Read code, find bugs, fix them, write solutions from scratch — no hand-holding.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-12">
              <Button onClick={handleRegisterClick} className="bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold text-sm px-6 h-11 rounded-lg">
                Start training — free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button onClick={() => navigate('/problems')} variant="ghost" className="text-[#A1A1AA] hover:text-white text-sm h-11 border border-[rgba(255,255,255,0.1)] hover:border-[#3F3F46] hover:bg-white/5 rounded-lg">
                Browse problems
              </Button>
            </div>

            {/* Inline stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-white">{totalProblems}</span>
                <span className="text-sm text-[#71717A]">problems</span>
              </div>
              <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-white">3</span>
                <span className="text-sm text-[#71717A]">modes</span>
              </div>
              <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-white">12</span>
                <span className="text-sm text-[#71717A]">categories</span>
              </div>
            </div>
          </div>

          {/* Right — interactive terminal */}
          <div className="space-y-3">
            {/* Code editor pane */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden bg-[#0D0F14]">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[#12141A]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#F87171]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#FBBF24]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#4ADE80]/80" />
                </div>
                <span className="ml-2 text-xs text-[#52525B] font-mono">bug_challenge.py</span>
              </div>
              <div className="p-4 font-mono text-[13px] leading-7">
                {codeLines.map((line, i) => (
                  <div
                    key={line.num}
                    className={`flex transition-all duration-300 rounded px-2 -mx-2 ${
                      i < visibleLines ? 'opacity-100' : 'opacity-0 translate-y-1'
                    } ${showBugHighlight && line.type === 'bug' ? 'bg-red-500/8 border-l-2 border-red-400 pl-3' : 'border-l-2 border-transparent pl-3'}`}
                  >
                    <span className="w-6 text-[#3F3F46] select-none mr-4 text-right">{line.num}</span>
                    <span className={
                      showBugHighlight && line.type === 'bug' ? 'text-[#F87171]' :
                      line.type === 'keyword' ? 'text-[#A78BFA]' :
                      'text-[#D4D4D8]'
                    }>
                      {line.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal output pane */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden bg-[#0D0F14]">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[#12141A]">
                <Terminal className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-xs text-[#52525B] font-mono">terminal</span>
              </div>
              <div className="p-4 font-mono text-[13px] min-h-[100px]">
                {terminalText ? (
                  <pre className="whitespace-pre-wrap text-[#A1A1AA]">
                    {terminalText.split('\n').map((line, i) => (
                      <div key={i} className={
                        line.includes('Found 1 bug') ? 'text-[#F87171]' :
                        line.includes('Fix:') ? 'text-[#22C55E]' :
                        line.startsWith('$') ? 'text-[#E4E4E7]' :
                        'text-[#71717A]'
                      }>{line}</div>
                    ))}
                    <span className="cursor-blink text-[#22C55E]">_</span>
                  </pre>
                ) : (
                  <span className="text-[#3F3F46]">Waiting for scan...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — 3 modes */}
      <section className="border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">How it works</h2>
            <p className="text-[#A1A1AA] leading-relaxed">
              Every problem drops you into real Python code. No multiple choice. No hints unless you ask.
              Three modes, each training a different part of your developer instinct.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                title: 'Find mode',
                subtitle: 'Train your eye',
                desc: 'You see real code. Some lines have bugs, some don\'t. Click the lines you think are broken. Must find every bug — no partial credit.',
                detail: 'Builds the skill of reading code critically, the same way you\'d review a pull request.',
                color: '#A78BFA',
              },
              {
                icon: Terminal,
                title: 'Fix mode',
                subtitle: 'Train your hands',
                desc: 'The code is buggy. You edit it in a live editor, run it, and your output must match expected. Real execution, real feedback.',
                detail: 'Builds the skill of debugging under pressure — the code runs on our server in a sandbox.',
                color: '#22C55E',
              },
              {
                icon: RefreshCw,
                title: 'Recall mode',
                subtitle: 'Train your memory',
                desc: 'Blank editor. Function signature. Test cases. You write the entire solution from scratch and it runs against all tests.',
                detail: 'Builds the skill of producing correct code without reference — interview-ready.',
                color: '#FBBF24',
              },
            ].map((mode) => (
              <div key={mode.title} className="rounded-xl border border-[rgba(255,255,255,0.06)] p-6 bg-[#0D0F14] hover:border-[rgba(255,255,255,0.1)] transition-colors group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${mode.color}10`, border: `1px solid ${mode.color}25` }}>
                    <mode.icon className="w-4 h-4" style={{ color: mode.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{mode.title}</h3>
                    <p className="text-xs text-[#71717A]">{mode.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">{mode.desc}</p>
                <p className="text-xs text-[#52525B] leading-relaxed italic">{mode.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem breakdown */}
      <section className="border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Real problems, real code</h2>
              <p className="text-[#A1A1AA] leading-relaxed mb-8">
                Not toy examples. Every problem is inspired by bugs that actually happen in production —
                from operator errors to race conditions. Across 12 categories that cover the full spectrum
                of what goes wrong in real software.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Bug, label: 'Logic errors', count: 'Most common' },
                  { icon: Shield, label: 'Security flaws', count: 'Critical' },
                  { icon: Zap, label: 'Performance', count: 'Subtle' },
                  { icon: Brain, label: 'Edge cases', count: 'Tricky' },
                  { icon: Code2, label: 'Syntax traps', count: 'Python gotchas' },
                  { icon: RefreshCw, label: 'Async bugs', count: 'Concurrency' },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0D0F14]">
                    <cat.icon className="w-4 h-4 text-[#22C55E]" />
                    <div>
                      <div className="text-sm font-medium">{cat.label}</div>
                      <div className="text-xs text-[#52525B]">{cat.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0D0F14] p-8">
              <h3 className="text-lg font-semibold mb-6">Difficulty breakdown</h3>
              <div className="space-y-5">
                {[
                  { label: 'Easy', count: easyCount, color: '#4ADE80', pts: '10 pts each' },
                  { label: 'Medium', count: mediumCount, color: '#FBBF24', pts: '20 pts each' },
                  { label: 'Hard', count: hardCount, color: '#F87171', pts: '30 pts each' },
                ].map((d) => (
                  <div key={d.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-sm font-medium">{d.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#52525B]">{d.pts}</span>
                        <span className="text-sm font-mono font-semibold" style={{ color: d.color }}>{d.count}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ background: d.color, width: `${(d.count / totalProblems) * 100}%`, opacity: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                <span className="text-sm text-[#71717A]">Total points available</span>
                <span className="text-lg font-bold font-mono text-[#22C55E]">
                  {easyCount * 10 + mediumCount * 20 + hardCount * 30}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring system */}
      <section className="border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">The scoring system</h2>
            <p className="text-[#A1A1AA] leading-relaxed">
              Earn points for clean solves. Lose points for using crutches. The system rewards
              independence — the same thing that makes you valuable on a real team.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Clean solve', value: '100%', desc: 'Solve without hints or viewing the solution', icon: CheckCircle2, color: '#22C55E' },
              { label: 'Hint used', value: '-25%', desc: 'Hints point you in the right direction', icon: Brain, color: '#FBBF24' },
              { label: 'Solution viewed', value: '-50%', desc: 'Viewing the answer before solving', icon: Eye, color: '#F87171' },
              { label: 'No partial credit', value: '0 pts', desc: 'Must find ALL bugs or pass ALL tests', icon: Bug, color: '#71717A' },
            ].map((rule) => (
              <div key={rule.label} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0D0F14] p-5">
                <rule.icon className="w-5 h-5 mb-3" style={{ color: rule.color }} />
                <div className="text-xl font-bold font-mono mb-1" style={{ color: rule.color }}>{rule.value}</div>
                <div className="text-sm font-medium mb-1">{rule.label}</div>
                <div className="text-xs text-[#52525B] leading-relaxed">{rule.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="rounded-2xl border border-[#22C55E]/15 bg-[#22C55E]/[0.03] p-12 md:p-16 text-center">
            <div className="font-mono text-3xl font-bold text-[#22C55E] mb-4">&lt;g/&gt;</div>
            <h2 className="text-3xl font-bold tracking-tight mb-3">Start building your intuition</h2>
            <p className="text-[#A1A1AA] mb-8 max-w-md mx-auto">
              {totalProblems} problems. 3 modes. No setup required. Completely free.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={handleRegisterClick} className="bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold text-sm px-6 h-11 rounded-lg">
                Create your account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button onClick={() => navigate('/problems')} variant="ghost" className="text-[#A1A1AA] hover:text-white text-sm h-11 border border-[rgba(255,255,255,0.1)] hover:border-[#3F3F46] hover:bg-white/5 rounded-lg">
                Explore problems
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm text-[#22C55E]">&lt;g/&gt;</span>
            <span className="text-sm text-[#3F3F46]">gencodelab.pro</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#3F3F46]">
            <span onClick={() => navigate('/problems')} className="hover:text-[#A1A1AA] cursor-pointer transition-colors">Problems</span>
            <span onClick={() => navigate('/tips')} className="hover:text-[#A1A1AA] cursor-pointer transition-colors">Tips</span>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[#A1A1AA] transition-colors"
            >
              <DiscordLogo className="w-4 h-4" />
              Discord
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
