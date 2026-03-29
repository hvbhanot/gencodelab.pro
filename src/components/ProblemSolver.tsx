import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import { 
  ArrowLeft, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
  BookOpen,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  Play,
  Terminal,
  Bug
} from 'lucide-react';
import type { Problem, Difficulty, ProblemProgress, SubmissionResult } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// GitHub One Dark theme colors
const oneDarkTheme: Parameters<Monaco['editor']['defineTheme']>[1] = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '#5C6370', fontStyle: 'italic' },
    { token: 'keyword', foreground: '#C678DD' },
    { token: 'identifier', foreground: '#E06C75' },
    { token: 'string', foreground: '#98C379' },
    { token: 'number', foreground: '#D19A66' },
    { token: 'operator', foreground: '#56B6C2' },
    { token: 'function', foreground: '#61AFEF' },
    { token: 'type', foreground: '#E5C07B' },
    { token: 'variable', foreground: '#ABB2BF' },
    { token: 'constant', foreground: '#D19A66' },
  ],
  colors: {
    'editor.background': '#282C34',
    'editor.foreground': '#ABB2BF',
    'editorLineNumber.foreground': '#4B5263',
    'editorLineNumber.activeForeground': '#ABB2BF',
    'editor.selectionBackground': '#3E4451',
    'editor.inactiveSelectionBackground': '#3E4451',
    'editorCursor.foreground': '#528BFF',
    'editor.lineHighlightBackground': '#2C313C',
    'editorLineNumber.background': '#282C34',
  }
};

// Points per difficulty
const POINTS_PER_DIFFICULTY = {
  easy: 10,
  medium: 20,
  hard: 30
};

// Hint penalty = 25% of max points, Solution penalty = 50%
const HINT_PENALTY_FRACTION = 0.25;
const SOLUTION_PENALTY_FRACTION = 0.50;

interface ProblemSolverProps {
  problem: Problem;
  userProgress: ProblemProgress | undefined;
  onBack: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: (problemId: number, score: number, solved: boolean, solutionViewed: boolean) => void | Promise<void>;
  hasNext: boolean;
  hasPrevious: boolean;
}

type Tab = 'description' | 'hint' | 'solution';

export function ProblemSolver({
  problem,
  userProgress,
  onBack,
  onNext,
  onPrevious,
  onSubmit,
  hasNext,
  hasPrevious,
}: ProblemSolverProps) {
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [fixedCode, setFixedCode] = useState(problem.code);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [showResult, setShowResult] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [attempts, setAttempts] = useState(userProgress?.attempts || 0);
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [hasViewedSolution, setHasViewedSolution] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [terminalError, setTerminalError] = useState<string | null>(null);
  const [lastExecutionResult, setLastExecutionResult] = useState<{ output: string[]; error?: string } | null>(null);
  const [testResults, setTestResults] = useState<{ id: number; passed: boolean; actual: string; expected: string; error: string | null }[]>([]);

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('one-dark', oneDarkTheme);
  };

  useEffect(() => {
    setSelectedLines([]);
    setFixedCode(problem.type === 'recall' ? (problem.starterCode || '') : problem.code);
    setShowHint(false);
    setShowSolution(false);
    setActiveTab('description');
    setShowResult(false);
    setSubmissionResult(null);
    setHasUsedHint(false);
    setHasViewedSolution(false);
    setTerminalOutput([]);
    setTerminalError(null);
    setLastExecutionResult(null);
    setTestResults([]);
  }, [problem]);

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'badge-easy';
      case 'medium': return 'badge-medium';
      case 'hard': return 'badge-hard';
    }
  };

  const getMaxPoints = () => POINTS_PER_DIFFICULTY[problem.difficulty];
  const getHintPenalty = () => Math.round(getMaxPoints() * HINT_PENALTY_FRACTION);
  const getSolutionPenalty = () => Math.round(getMaxPoints() * SOLUTION_PENALTY_FRACTION);

  const handleLineClick = (lineNumber: number) => {
    if (showResult) return;
    
    setSelectedLines(prev => 
      prev.includes(lineNumber)
        ? prev.filter(l => l !== lineNumber)
        : [...prev, lineNumber]
    );
  };

  // Server-side Python code execution
  const runPythonCode = async (code: string): Promise<{ output: string[]; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return {
        output: data.output,
        error: data.error,
      };
    } catch (error) {
      return {
        output: [],
        error: `Failed to connect to server: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setTerminalOutput([]);
    setTerminalError(null);

    const result = await runPythonCode(fixedCode);

    setTerminalOutput(result.output);
    setLastExecutionResult(result);

    if (result.error) {
      setTerminalError(result.error);
    }

    setIsRunning(false);
  };

  const handleRunTests = async () => {
    if (!problem.testCases || problem.testCases.length === 0) return;
    setIsRunning(true);
    setTestResults([]);
    setTerminalOutput([]);
    setTerminalError(null);

    try {
      const response = await fetch(`${API_BASE}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fixedCode, testCases: problem.testCases }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setTestResults(data.results || []);

      const passed = (data.results || []).filter((r: { passed: boolean }) => r.passed).length;
      const total = problem.testCases.length;
      setTerminalOutput([`${passed}/${total} test cases passed`]);
      if (data.error) setTerminalError(data.error);

      setLastExecutionResult({
        output: [`${passed}/${total}`],
        error: data.error || undefined,
      });
    } catch (error) {
      const msg = `Failed to connect to test server: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setTerminalError(msg);
      setLastExecutionResult({ output: [], error: msg });
    }
    setIsRunning(false);
  };

  const calculateScore = useCallback((): SubmissionResult => {
    const maxPoints = getMaxPoints();
    
    // Fix mode - check code output against expected
    if (problem.type === 'fix') {
      const result = lastExecutionResult;
      
      if (!result) {
        return {
          score: 0,
          passed: false,
          correctFinds: [],
          missedBugs: problem.bugLines,
          falsePositives: [],
          explanations: { 0: 'Please run the code first before submitting' },
        };
      }
      
      // Check for errors first
      if (result.error) {
        return {
          score: 0,
          passed: false,
          correctFinds: [],
          missedBugs: problem.bugLines,
          falsePositives: [],
          explanations: { 0: `Your code has an error: ${result.error}` },
        };
      }
      
      // Check output against expected
      if (problem.expectedOutput) {
        const normalizedActual = result.output.join('\n').trim();
        const normalizedExpected = problem.expectedOutput.trim();
        
        if (normalizedActual !== normalizedExpected) {
          return {
            score: 0,
            passed: false,
            correctFinds: [],
            missedBugs: problem.bugLines,
            falsePositives: [],
            explanations: { 
              0: `Output doesn't match!\nExpected: "${normalizedExpected}"\nGot: "${normalizedActual}"` 
            },
          };
        }
      }
      
      // Code runs correctly and output matches
      let finalScore = maxPoints;
      if (hasUsedHint) finalScore -= getHintPenalty();
      if (hasViewedSolution) finalScore -= getSolutionPenalty();
      
      return {
        score: Math.max(0, finalScore),
        passed: true,
        correctFinds: problem.bugLines,
        missedBugs: [],
        falsePositives: [],
        explanations: problem.bugExplanations,
      };
    }

    // Recall mode - check test case results
    if (problem.type === 'recall') {
      if (testResults.length === 0) {
        return {
          score: 0,
          passed: false,
          correctFinds: [],
          missedBugs: [],
          falsePositives: [],
          explanations: { 0: 'Please run tests first before submitting' },
        };
      }

      const totalTests = problem.testCases?.length || 0;
      const passedTests = testResults.filter(r => r.passed).length;
      const allPassed = passedTests === totalTests;

      if (!allPassed) {
        const failedExplanations: Record<number, string> = {};
        testResults.forEach(r => {
          if (!r.passed) {
            const tc = problem.testCases?.find(t => t.id === r.id);
            failedExplanations[r.id] = r.error
              ? `Test "${tc?.description}": Error — ${r.error}`
              : `Test "${tc?.description}": Expected "${r.expected}" but got "${r.actual}"`;
          }
        });

        return {
          score: 0,
          passed: false,
          correctFinds: [],
          missedBugs: [],
          falsePositives: [],
          explanations: failedExplanations,
        };
      }

      let finalScore = maxPoints;
      if (hasUsedHint) finalScore -= getHintPenalty();
      if (hasViewedSolution) finalScore -= getSolutionPenalty();

      return {
        score: Math.max(0, finalScore),
        passed: true,
        correctFinds: [],
        missedBugs: [],
        falsePositives: [],
        explanations: { 0: `All ${totalTests} test cases passed!` },
      };
    }

    // Find mode - check selected lines
    if (!problem.hasBugs) {
      const falsePositives = selectedLines.length;
      // No bugs - any selection is wrong
      if (falsePositives > 0) {
        return {
          score: 0,
          passed: false,
          correctFinds: [],
          missedBugs: [],
          falsePositives: selectedLines,
          explanations: { 0: "This code has no bugs! It's a trick question to test your careful reading." },
        };
      }
      // Correct - no bugs found
      let finalScore = maxPoints;
      if (hasUsedHint) finalScore -= getHintPenalty();
      if (hasViewedSolution) finalScore -= getSolutionPenalty();
      
      return {
        score: Math.max(0, finalScore),
        passed: true,
        correctFinds: [],
        missedBugs: [],
        falsePositives: [],
        explanations: { 0: "This code has no bugs! It's a trick question to test your careful reading. In production, always verify before assuming code is buggy." },
      };
    }

    const correctFinds = selectedLines.filter(line => problem.bugLines.includes(line));
    const missedBugs = problem.bugLines.filter(line => !selectedLines.includes(line));
    const falsePositives = selectedLines.filter(line => !problem.bugLines.includes(line));

    const totalBugs = problem.bugLines.length;
    const foundBugs = correctFinds.length;
    
    // Must find ALL bugs to get points
    if (foundBugs !== totalBugs || falsePositives.length > 0) {
      return {
        score: 0,
        passed: false,
        correctFinds,
        missedBugs,
        falsePositives,
        explanations: problem.bugExplanations,
      };
    }

    // All bugs found correctly
    let finalScore = maxPoints;
    if (hasUsedHint) finalScore -= getHintPenalty();
    if (hasViewedSolution) finalScore -= getSolutionPenalty();

    return {
      score: Math.max(0, finalScore),
      passed: true,
      correctFinds,
      missedBugs,
      falsePositives,
      explanations: problem.bugExplanations,
    };
  }, [problem, selectedLines, hasUsedHint, hasViewedSolution, lastExecutionResult, testResults]);

  const handleSubmit = () => {
    const result = calculateScore();
    setSubmissionResult(result);
    setShowResult(true);
    setAttempts(prev => prev + 1);
    
    onSubmit(problem.id, result.score, result.passed, hasViewedSolution);
  };

  const handleRetry = () => {
    setSelectedLines([]);
    setShowResult(false);
    setSubmissionResult(null);
    setTerminalOutput([]);
    setTerminalError(null);
    setLastExecutionResult(null);
    setTestResults([]);
  };

  const handleUseHint = () => {
    setShowHint(true);
    setHasUsedHint(true);
    setActiveTab('hint');
  };

  const handleShowSolution = () => {
    setShowSolution(true);
    setHasViewedSolution(true);
    setActiveTab('solution');
  };

  // Simple Python syntax highlighter for find-mode code display
  const highlightPython = (line: string) => {
    const tokens: { text: string; className: string }[] = [];
    let remaining = line;

    const keywords = /^(def|class|return|if|elif|else|for|while|in|not|and|or|is|import|from|as|try|except|finally|raise|with|yield|lambda|pass|break|continue|global|nonlocal|assert|del|True|False|None)\b/;
    const builtins = /^(print|len|str|int|float|list|dict|set|tuple|range|sorted|enumerate|zip|map|filter|type|isinstance|hasattr|getattr|setattr|super|property|staticmethod|classmethod|abs|sum|min|max|round|pow|any|all|reversed|next|iter|open|input|repr|id|hash|callable|bool|bytes|frozenset|complex|hex|oct|bin|chr|ord|format|vars|dir)\b/;
    const decoratorRe = /^@\w[\w.]*/;

    while (remaining.length > 0) {
      let matched = false;

      // String (double or single quoted, including f-strings)
      const strMatch = remaining.match(/^(f?r?b?)("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/);
      if (strMatch) {
        tokens.push({ text: strMatch[0], className: 'text-[#98C379]' });
        remaining = remaining.slice(strMatch[0].length);
        matched = true;
      }

      // Comment
      if (!matched && remaining.startsWith('#')) {
        tokens.push({ text: remaining, className: 'text-[#5C6370] italic' });
        remaining = '';
        matched = true;
      }

      // Decorator
      if (!matched) {
        const decMatch = remaining.match(decoratorRe);
        if (decMatch) {
          tokens.push({ text: decMatch[0], className: 'text-[#E5C07B]' });
          remaining = remaining.slice(decMatch[0].length);
          matched = true;
        }
      }

      // Keywords
      if (!matched) {
        const kwMatch = remaining.match(keywords);
        if (kwMatch) {
          tokens.push({ text: kwMatch[0], className: 'text-[#C678DD]' });
          remaining = remaining.slice(kwMatch[0].length);
          matched = true;
        }
      }

      // Builtins
      if (!matched) {
        const biMatch = remaining.match(builtins);
        if (biMatch) {
          tokens.push({ text: biMatch[0], className: 'text-[#61AFEF]' });
          remaining = remaining.slice(biMatch[0].length);
          matched = true;
        }
      }

      // Numbers
      if (!matched) {
        const numMatch = remaining.match(/^(\d+\.?\d*|\.\d+)/);
        if (numMatch) {
          tokens.push({ text: numMatch[0], className: 'text-[#D19A66]' });
          remaining = remaining.slice(numMatch[0].length);
          matched = true;
        }
      }

      // Function call name (word followed by open paren)
      if (!matched) {
        const fnMatch = remaining.match(/^(\w+)(?=\()/);
        if (fnMatch) {
          tokens.push({ text: fnMatch[0], className: 'text-[#61AFEF]' });
          remaining = remaining.slice(fnMatch[0].length);
          matched = true;
        }
      }

      // Self keyword
      if (!matched) {
        const selfMatch = remaining.match(/^self\b/);
        if (selfMatch) {
          tokens.push({ text: 'self', className: 'text-[#E06C75]' });
          remaining = remaining.slice(4);
          matched = true;
        }
      }

      // Operators
      if (!matched) {
        const opMatch = remaining.match(/^(==|!=|<=|>=|->|:=|\*\*|\/\/|[+\-*/%=<>!&|^~:,.])/);
        if (opMatch) {
          tokens.push({ text: opMatch[0], className: 'text-[#56B6C2]' });
          remaining = remaining.slice(opMatch[0].length);
          matched = true;
        }
      }

      // Default - single character
      if (!matched) {
        tokens.push({ text: remaining[0], className: 'text-[#ABB2BF]' });
        remaining = remaining.slice(1);
      }
    }

    return tokens.map((t, i) => (
      <span key={i} className={t.className}>{t.text}</span>
    ));
  };

  const renderCodeLines = () => {
    const lines = problem.code.split('\n');
    return lines.map((line, index) => {
      const lineNumber = index + 1;
      const isSelected = selectedLines.includes(lineNumber);
      const isBugLine = problem.bugLines.includes(lineNumber);
      const showBug = showResult && isBugLine;
      const showFalsePositive = showResult && isSelected && !isBugLine && problem.hasBugs;
      const showCorrect = showResult && isSelected && isBugLine;

      return (
        <div
          key={lineNumber}
          className={`flex cursor-pointer transition-all ${
            showResult ? 'cursor-default' : 'hover:bg-white/5'
          }`}
          onClick={() => problem.type === 'find' && handleLineClick(lineNumber)}
        >
          <span className={`w-12 text-right pr-4 select-none font-mono text-sm ${
            showBug ? 'text-red-400 font-bold' :
            showCorrect ? 'text-green-400 font-bold' :
            showFalsePositive ? 'text-yellow-400' :
            'text-gray-600'
          }`}>
            {lineNumber}
          </span>
          <div className={`flex-1 pl-4 border-l-2 font-mono text-sm ${
            showBug ? 'bg-red-500/10 border-red-500' :
            showCorrect ? 'bg-green-500/10 border-green-500' :
            showFalsePositive ? 'bg-yellow-500/10 border-yellow-500' :
            isSelected ? 'bg-purple-500/10 border-purple-500' :
            'border-transparent'
          }`}>
            <pre className="whitespace-pre-wrap break-all">{line ? highlightPython(line) : ' '}</pre>
          </div>
        </div>
      );
    });
  };

  const hintPenalty = getHintPenalty();
  const solutionPenalty = getSolutionPenalty();
  const maxPoints = getMaxPoints();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#09090B] border-b border-[#1C1C1F] sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-[#71717A] hover:text-[#E4E4E7] hover:bg-[#1C1C1F]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="h-6 w-px bg-[#1C1C1F]" />
              
              <div className="flex items-center gap-3">
                <span className="text-[#52525B] font-mono text-sm">#{String(problem.id).padStart(3, '0')}</span>
                <h1 className="text-base font-medium text-[#E4E4E7]">{problem.title}</h1>
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getDifficultyBadge(problem.difficulty)}`}>
                  {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                </span>
                <span className="text-xs text-[#71717A]">
                  {maxPoints} pts
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="text-[#71717A] hover:text-[#E4E4E7] hover:bg-[#1C1C1F] disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                disabled={!hasNext}
                className="text-[#71717A] hover:text-[#E4E4E7] hover:bg-[#1C1C1F] disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Description */}
        <div className="w-[45%] border-r border-[#1C1C1F] flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-[#1C1C1F]">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex items-center gap-2 px-5 py-3 text-sm transition-colors ${
                activeTab === 'description'
                  ? 'text-[#E4E4E7] border-b-2 border-[#22C55E]'
                  : 'text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Description
            </button>
            <button
              onClick={() => setActiveTab('hint')}
              className={`flex items-center gap-2 px-5 py-3 text-sm transition-colors ${
                activeTab === 'hint'
                  ? 'text-[#E4E4E7] border-b-2 border-[#22C55E]'
                  : 'text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Hint
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`flex items-center gap-2 px-5 py-3 text-sm transition-colors ${
                activeTab === 'solution'
                  ? 'text-[#E4E4E7] border-b-2 border-[#22C55E]'
                  : 'text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Solution
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-[#22C55E]" />
                    <h2 className="text-lg font-semibold text-white">The Scenario</h2>
                  </div>
                  <p className="text-[#A1A1AA] leading-relaxed">{problem.description}</p>
                </div>

                {problem.type === 'find' && (
                  <div className="p-4 bg-[#0C0C0E] border border-[#1C1C1F] rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#22C55E] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#E4E4E7] mb-1">Your Mission</p>
                        <p className="text-sm text-[#71717A]">
                          Click on line numbers to mark bugs. Click again to unselect. 
                          Submit when you think you have found all bugs. Remember: some problems may have no bugs!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {problem.type === 'fix' && problem.expectedOutput && (
                  <div className="p-4 bg-[#0C0C0E] border border-[#1C1C1F] rounded-md">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#E4E4E7] mb-1">Expected Output</p>
                        <pre className="text-sm text-[#A1A1AA] font-mono">{problem.expectedOutput}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {problem.type === 'recall' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#0C0C0E] border border-[#1C1C1F] rounded-md">
                      <div className="flex items-start gap-3">
                        <Terminal className="w-5 h-5 text-[#22C55E] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-[#E4E4E7] mb-1">Blank Page Challenge</p>
                          <p className="text-sm text-[#71717A]">
                            Write your solution from scratch in the editor. No starter code is provided beyond the function signature.
                            Click "Run Tests" to validate against {problem.testCases?.length || 0} test cases. All tests must pass to earn points.
                          </p>
                        </div>
                      </div>
                    </div>

                    {problem.testCases && (
                      <div>
                        <p className="text-sm font-medium text-white mb-2">Test Cases</p>
                        <div className="space-y-2">
                          {problem.testCases.map((tc) => {
                            const result = testResults.find(r => r.id === tc.id);
                            return (
                              <div key={tc.id} className={`p-3 rounded-lg border text-sm font-mono ${
                                result
                                  ? result.passed
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-red-500/10 border-red-500/30'
                                  : 'bg-white/5 border-white/10'
                              }`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-gray-300 text-xs font-sans">{tc.description}</span>
                                  {result && (
                                    result.passed
                                      ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                                      : <XCircle className="w-4 h-4 text-red-400" />
                                  )}
                                </div>
                                <div className="text-[#71717A] text-xs">
                                  <span className="text-gray-600">Input:</span> <code>{tc.input}</code>
                                </div>
                                <div className="text-[#71717A] text-xs">
                                  <span className="text-gray-600">Expected:</span> <code>{tc.expectedOutput}</code>
                                </div>
                                {result && !result.passed && (
                                  <div className="text-red-400 text-xs mt-1">
                                    <span className="text-red-500">Got:</span> <code>{result.error || result.actual || '(empty)'}</code>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {userProgress && (
                  <div className="pt-4 border-t border-[#1C1C1F]">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckSquare className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-sm font-medium text-white">Your Progress</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#0C0C0E] border border-[#1C1C1F] p-4 rounded-md">
                        <div className="text-xs text-[#71717A]">Best Score</div>
                        <div className="text-2xl font-bold text-green-400">{userProgress.bestScore} pts</div>
                      </div>
                      <div className="bg-[#0C0C0E] border border-[#1C1C1F] p-4 rounded-md">
                        <div className="text-xs text-[#71717A]">Attempts</div>
                        <div className="text-2xl font-bold text-white">{attempts}</div>
                      </div>
                    </div>
                    {userProgress.solved && (
                      <div className="mt-3 flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Solved</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hint' && (
              <div className="space-y-4">
                {!showHint ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center mx-auto mb-5">
                      <Lightbulb className="w-6 h-6 text-[#FBBF24]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#E4E4E7] mb-2">Need a nudge?</h3>
                    <p className="text-sm text-[#A1A1AA] mb-1 max-w-xs mx-auto">
                      Hints give you a direction to investigate without revealing the answer.
                    </p>
                    <p className="text-xs text-[#FBBF24] mb-6">
                      Using a hint costs {hintPenalty} of your {maxPoints} possible points
                    </p>
                    <Button
                      onClick={handleUseHint}
                      className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Reveal Hint (-{hintPenalty} pts)
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[#FBBF24]" />
                      <h3 className="text-sm font-semibold text-[#FBBF24]">Hint</h3>
                    </div>

                    <div className="p-4 bg-[#FBBF24]/5 border border-[#FBBF24]/15 rounded-lg">
                      <p className="text-sm text-[#E4E4E7] leading-relaxed">{problem.hint}</p>
                    </div>

                    <div className="p-4 bg-[#0C0C0E] border border-[#1C1C1F] rounded-lg">
                      <h4 className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-3">Questions to ask yourself</h4>
                      <ul className="space-y-2.5">
                        <li className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
                          <ChevronRight className="w-3.5 h-3.5 text-[#FBBF24] mt-0.5 shrink-0" />
                          <span>What does this code assume about its inputs?</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
                          <ChevronRight className="w-3.5 h-3.5 text-[#FBBF24] mt-0.5 shrink-0" />
                          <span>What would happen with edge cases or unexpected values?</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
                          <ChevronRight className="w-3.5 h-3.5 text-[#FBBF24] mt-0.5 shrink-0" />
                          <span>Is there a Python-specific behavior being misused here?</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="space-y-4">
                {!showSolution ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                      <BookOpen className="w-6 h-6 text-[#F87171]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#E4E4E7] mb-2">View the full lesson</h3>
                    <p className="text-sm text-[#A1A1AA] mb-1 max-w-xs mx-auto">
                      See what went wrong, why it matters, and the correct approach — explained step by step.
                    </p>
                    <p className="text-xs text-[#F87171] mb-6">
                      Viewing costs {solutionPenalty} of your {maxPoints} possible points
                    </p>
                    <Button
                      onClick={handleShowSolution}
                      variant="outline"
                      className="border-red-500/20 text-[#F87171] hover:bg-red-500/10 hover:text-[#F87171]"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Show Solution (-{solutionPenalty} pts)
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Section 1: What went wrong */}
                    {problem.bugLines.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 rounded-md bg-[#F87171]/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#F87171]">1</span>
                          </div>
                          <h3 className="text-sm font-semibold text-[#E4E4E7]">What went wrong</h3>
                        </div>
                        {problem.bugLines.map(line => (
                          <div key={line} className="mb-4 rounded-lg border border-[#1C1C1F] overflow-hidden">
                            <div className="px-4 py-2 bg-[#F87171]/5 border-b border-[#1C1C1F] flex items-center gap-2">
                              <Bug className="w-3.5 h-3.5 text-[#F87171]" />
                              <span className="text-xs font-semibold text-[#F87171] font-mono">Line {line}</span>
                            </div>
                            <div className="p-4">
                              <p className="text-sm text-[#A1A1AA] leading-relaxed">{problem.bugExplanations[line]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 rounded-md bg-[#22C55E]/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#22C55E]">1</span>
                          </div>
                          <h3 className="text-sm font-semibold text-[#E4E4E7]">No bugs here</h3>
                        </div>
                        <div className="p-4 bg-[#22C55E]/5 border border-[#22C55E]/15 rounded-lg">
                          <p className="text-sm text-[#A1A1AA] leading-relaxed">
                            This code has no bugs — it was a test of careful reading. In real code reviews,
                            not every file has issues. Knowing when code is correct is just as important as
                            finding what's wrong.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Section 2: Why it matters */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-md bg-[#FBBF24]/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#FBBF24]">2</span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#E4E4E7]">Why this matters</h3>
                      </div>
                      <div className="p-4 bg-[#0C0C0E] border border-[#1C1C1F] rounded-lg">
                        <p className="text-sm text-[#A1A1AA] leading-relaxed">
                          {problem.category === 'security' && 'Security bugs like this can expose user data, enable injection attacks, or bypass authentication. In production, these are the bugs that make headlines.'}
                          {problem.category === 'type' && 'Type errors are the most common class of Python bugs. They silently pass in development but crash in production when real data hits unexpected code paths.'}
                          {problem.category === 'logic' && 'Logic bugs are insidious because the code runs without errors — it just produces wrong results. These are the hardest to catch in code review and the most expensive to fix in production.'}
                          {problem.category === 'scope' && 'Scope bugs come from misunderstanding how Python resolves variable names. They cause data to leak between function calls or disappear unexpectedly.'}
                          {problem.category === 'pitfall' && 'Python pitfalls are language-specific traps that catch even experienced developers. Understanding these makes you fluent in Python, not just familiar with it.'}
                          {problem.category === 'performance' && 'Performance bugs don\'t crash your app — they make it slow. In production with thousands of users, an O(n²) loop or unnecessary allocation can bring down your entire service.'}
                          {problem.category === 'concurrency' && 'Concurrency bugs are among the hardest to debug because they\'re non-deterministic. They work fine in testing and fail randomly in production under load.'}
                          {problem.category === 'algorithm' && 'Algorithm bugs produce wrong results for specific inputs. They often pass basic tests but fail on edge cases, making them dangerous in production.'}
                          {problem.category === 'syntax' && 'Syntax traps in Python look correct at a glance but behave differently than expected. Knowing these separates Python experts from beginners.'}
                          {problem.category === 'edge-case' && 'Edge case bugs hide in the boundaries — empty inputs, zero values, None, single elements. Production data is messy, and these cases always show up.'}
                          {problem.category === 'oop' && 'OOP bugs come from misunderstanding inheritance, method resolution, or class vs instance attributes. They create subtle, hard-to-trace behavior.'}
                          {problem.category === 'advanced' && 'Advanced Python features like decorators, generators, and metaclasses are powerful but error-prone. Misusing them creates bugs that are very hard to diagnose.'}
                        </p>
                      </div>
                    </div>

                    {/* Section 3: The correct code */}
                    {problem.fixedCode && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 rounded-md bg-[#22C55E]/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#22C55E]">3</span>
                          </div>
                          <h3 className="text-sm font-semibold text-[#E4E4E7]">The correct approach</h3>
                        </div>
                        <div className="rounded-lg border border-[#1C1C1F] overflow-hidden">
                          <div className="px-4 py-2 bg-[#111113] border-b border-[#1C1C1F] flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                            <span className="text-xs text-[#52525B] font-mono">fixed_code.py</span>
                          </div>
                          <div className="p-4 bg-[#0C0C0E] overflow-x-auto">
                            <pre className="text-[13px] text-[#D4D4D8] font-mono leading-6">
                              <code>{problem.fixedCode}</code>
                            </pre>
                          </div>
                        </div>
                        {(problem.type === 'fix' || problem.type === 'recall') && (
                          <Button
                            onClick={() => {
                              setFixedCode(problem.fixedCode!);
                              setActiveTab('description');
                            }}
                            className="mt-4 bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Apply to Editor
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Section 4: Key takeaway */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-md bg-[#A78BFA]/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#A78BFA]">4</span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#E4E4E7]">Key takeaway</h3>
                      </div>
                      <div className="p-4 bg-[#A78BFA]/5 border border-[#A78BFA]/15 rounded-lg">
                        <p className="text-sm text-[#A1A1AA] leading-relaxed">
                          {problem.difficulty === 'easy' && 'This is a foundational concept. If you got it wrong, don\'t worry — now you know the pattern. You\'ll recognize it instantly next time.'}
                          {problem.difficulty === 'medium' && 'This requires deeper Python knowledge. Understanding this pattern will help you write more robust code and catch similar issues in code reviews.'}
                          {problem.difficulty === 'hard' && 'This is an advanced concept that trips up even senior developers. Mastering it puts you ahead of most Python programmers.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col bg-black/30">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1C1C1F]">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#71717A]">Python</span>
              {problem.type === 'find' && selectedLines.length > 0 && (
                <span className="text-sm text-[#A1A1AA]">
                  {selectedLines.length} line(s) selected
                </span>
              )}
              {attempts > 0 && (
                <span className="text-xs text-[#52525B] font-mono">
                  attempt #{attempts + (showResult ? 0 : 1)}
                </span>
              )}
              {hasUsedHint && !showResult && (
                <span className="text-xs text-[#FBBF24]/60">hint used</span>
              )}
              {hasViewedSolution && !showResult && (
                <span className="text-xs text-[#F87171]/60">solution viewed</span>
              )}
            </div>
            <div className="flex gap-2">
              {problem.type === 'fix' && !showResult && (
                <Button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  variant="outline"
                  className="border-[#1C1C1F] text-green-400 hover:bg-[#1C1C1F] text-sm h-8"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
              )}
              {problem.type === 'recall' && !showResult && (
                <Button
                  onClick={handleRunTests}
                  disabled={isRunning}
                  variant="outline"
                  className="border-[#1C1C1F] text-green-400 hover:bg-[#1C1C1F] text-sm h-8"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run Tests'}
                </Button>
              )}
              {!showResult && (
                <Button
                  onClick={handleSubmit}
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm h-8"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              )}
            </div>
          </div>

          {/* Code Area */}
          <div className="flex-1 overflow-auto p-4">
            {problem.type === 'find' ? (
              <div className="font-mono text-sm rounded-md overflow-hidden border border-[#1C1C1F] p-4" style={{ backgroundColor: '#111' }}>
                {renderCodeLines()}
              </div>
            ) : (
              <div className="h-full rounded-md overflow-hidden border border-[#1C1C1F]" style={{ backgroundColor: '#111' }}>
                <Editor
                  key={`editor-${problem.id}`}
                  height="100%"
                  defaultLanguage="python"
                  value={fixedCode}
                  onChange={(value) => setFixedCode(value || '')}
                  theme="one-dark"
                  beforeMount={handleEditorWillMount}
                  loading={<div style={{ backgroundColor: '#282C34', height: '100%' }} />}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    readOnly: showResult,
                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'all',
                    renderWhitespace: 'selection',
                  }}
                />
              </div>
            )}
          </div>

          {/* Terminal Output Panel - Always visible for fix and recall problems */}
          {(problem.type === 'fix' || problem.type === 'recall') && !showResult && (
            <div className="border-t border-[#1C1C1F] bg-[#09090B] h-[200px] flex flex-col">
              <div className="px-4 py-2 border-b border-[#1C1C1F] flex items-center gap-2 shrink-0">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Terminal Output</span>
                {isRunning && (
                  <span className="text-xs text-yellow-400 ml-auto">Running...</span>
                )}
                {terminalError && (
                  <span className="text-xs text-red-400 ml-auto">Error</span>
                )}
                {!isRunning && terminalOutput.length > 0 && !terminalError && (
                  <span className="text-xs text-green-400 ml-auto">Done</span>
                )}
              </div>
              <div className="flex-1 p-4 overflow-auto font-mono text-sm">
                {terminalOutput.length === 0 && !terminalError && !isRunning && (
                  <span className="text-[#52525B] italic">Click "Run Code" to see output...</span>
                )}
                {isRunning && (
                  <span className="text-[#22C55E]">Running code...</span>
                )}
                {terminalOutput.map((line, idx) => (
                  <div key={idx} className="text-[#E4E4E7]/80">
                    {line || <span className="text-[#3F3F46]">(empty line)</span>}
                  </div>
                ))}
                {terminalError && (
                  <div className="mt-2 pt-2 border-t border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="text-red-400 font-semibold text-xs">Runtime Error</span>
                    </div>
                    <pre className="text-red-400 whitespace-pre-wrap text-xs leading-relaxed">{terminalError}</pre>
                  </div>
                )}
                {problem.expectedOutput && !terminalError && terminalOutput.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#1C1C1F]">
                    {terminalOutput.join('\n').trim() === problem.expectedOutput.trim() ? (
                      <span className="text-green-400 text-xs">Output matches expected</span>
                    ) : (
                      <>
                        <span className="text-yellow-400 text-xs">Output differs from expected</span>
                        <div className="text-[#71717A] text-xs mt-1">
                          Expected: {problem.expectedOutput}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Panel */}
          {showResult && submissionResult && (
            <div className="border-t border-[#1C1C1F] bg-[#0C0C0E] max-h-[300px] overflow-auto">
              <div className="p-4 space-y-4">
                {/* Score */}
                <div className={`p-4 rounded-lg ${
                  submissionResult.passed
                    ? 'bg-green-500/5 border border-green-500/20'
                    : 'bg-red-500/5 border border-red-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${
                      submissionResult.passed ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {submissionResult.passed ? (
                        <><CheckCircle2 className="w-5 h-5 inline mr-2" />Solved!</>
                      ) : (
                        <><XCircle className="w-5 h-5 inline mr-2" />Not Quite Right</>
                      )}
                    </h3>
                    <span className={`text-2xl font-bold font-mono ${
                      submissionResult.passed ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {submissionResult.score}/{maxPoints}
                    </span>
                  </div>

                  {/* Score breakdown */}
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between text-[#A1A1AA]">
                      <span>Attempts</span>
                      <span className="font-mono">{attempts}</span>
                    </div>
                    {submissionResult.passed && (
                      <div className="flex items-center justify-between text-[#A1A1AA]">
                        <span>Base score</span>
                        <span className="font-mono text-[#E4E4E7]">{maxPoints} pts</span>
                      </div>
                    )}
                    {hasUsedHint && (
                      <div className="flex items-center justify-between text-[#FBBF24]">
                        <span>Hint penalty</span>
                        <span className="font-mono">-{hintPenalty} pts</span>
                      </div>
                    )}
                    {hasViewedSolution && (
                      <div className="flex items-center justify-between text-[#F87171]">
                        <span>Solution viewed</span>
                        <span className="font-mono">-{solutionPenalty} pts</span>
                      </div>
                    )}
                    {submissionResult.passed && (hasUsedHint || hasViewedSolution) && (
                      <div className="flex items-center justify-between pt-1.5 border-t border-[#1C1C1F] text-[#22C55E] font-medium">
                        <span>Final score</span>
                        <span className="font-mono">{submissionResult.score} pts</span>
                      </div>
                    )}
                  </div>

                  {!submissionResult.passed && (
                    <p className="text-sm text-[#71717A] mt-3">
                      You must find ALL bugs correctly to earn points. No partial credit.
                    </p>
                  )}
                </div>

                {/* Breakdown */}
                <div className="space-y-2">
                  {submissionResult.correctFinds.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Found bugs on line(s): {submissionResult.correctFinds.join(', ')}</span>
                    </div>
                  )}

                  {submissionResult.missedBugs.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-red-400">
                      <XCircle className="w-4 h-4" />
                      <span>Missed bugs on line(s): {submissionResult.missedBugs.join(', ')}</span>
                    </div>
                  )}

                  {submissionResult.falsePositives.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-yellow-400">
                      <XCircle className="w-4 h-4" />
                      <span>False positives on line(s): {submissionResult.falsePositives.join(', ')}</span>
                    </div>
                  )}

                  {!problem.hasBugs && submissionResult.falsePositives.length === 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct! This code has no bugs.</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {!submissionResult.passed && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="border-[#1C1C1F] text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#E4E4E7]"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  )}
                  {hasNext && (
                    <Button
                      onClick={onNext}
                      className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
