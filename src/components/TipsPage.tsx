import { useState } from 'react';
import {
  Music,
  Eye,
  Brain,
  Zap,
  Code2,
  Lightbulb,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Shield,
  Bug,
  Workflow,
  ChevronRight,
  AlertTriangle,
  Hash
} from 'lucide-react';

type SectionId = 'intro' | 'philosophy' | 'reading' | 'mental-models' | 'workflow' | 'debugging' | 'prompting' | 'security' | 'daily' | 'mistakes';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'intro', label: 'Introduction', icon: BookOpen },
  { id: 'philosophy', label: 'Philosophy', icon: Music },
  { id: 'reading', label: 'Reading Code', icon: Eye },
  { id: 'mental-models', label: 'Mental Models', icon: Brain },
  { id: 'workflow', label: 'The Workflow', icon: Workflow },
  { id: 'prompting', label: 'Prompting AI', icon: MessageSquare },
  { id: 'debugging', label: 'Debugging', icon: Bug },
  { id: 'security', label: 'Security Mindset', icon: Shield },
  { id: 'daily', label: 'Daily Practice', icon: Code2 },
  { id: 'mistakes', label: 'Common Mistakes', icon: AlertTriangle },
];

export function TipsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('intro');

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" />
        <div className="relative max-w-5xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 mb-6">
            <BookOpen className="w-4 h-4 text-[#22C55E]" />
            <span className="text-sm text-[#22C55E]">The Complete Guide</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#22C55E]">
              Vibe Coding Documentation
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A step-by-step guide to mastering the art of vibe coding — from philosophy to daily practice.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Hash className="w-4 h-4" />
            <span>10 chapters</span>
            <span className="mx-2">·</span>
            <span>~15 min read</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20 flex gap-8">
        {/* Sidebar Navigation */}
        <nav className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-6 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">On this page</p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                  activeSection === item.id
                    ? 'bg-[#22C55E]/10 text-[#22C55E] border-l-2 border-[#22C55E]'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 max-w-3xl space-y-16">

          {/* Chapter 1: Introduction */}
          <section id="intro" className="scroll-mt-8">
            <ChapterHeader number={1} title="Introduction" subtitle="What is this guide and who is it for?" color="purple" />
            <div className="mt-6 space-y-6">
              <DocParagraph>
                Welcome to the Vibe Coding Guide — a structured approach to becoming a better developer through
                reading, understanding, and intuitively creating code. Whether you are a complete beginner or an
                experienced developer looking to sharpen your instincts, this guide will walk you through the
                principles and practices that separate good coders from great ones.
              </DocParagraph>
              <Callout type="info" title="What you will learn">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> The philosophy behind vibe coding and why it works</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> How to read code effectively and build strong mental models</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> A step-by-step workflow you can follow for any coding task</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> How to write effective AI prompts for coding assistance</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> Debugging techniques that actually work</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> Security-first thinking for every line you write</li>
                </ul>
              </Callout>
              <DocParagraph>
                This guide is designed to be read in order, but each chapter also stands on its own.
                Use the sidebar to navigate to the topic you need most.
              </DocParagraph>
            </div>
          </section>

          {/* Chapter 2: Philosophy */}
          <section id="philosophy" className="scroll-mt-8">
            <ChapterHeader number={2} title="The Philosophy of Vibe Coding" subtitle="Understanding the mindset before the method" color="purple" />
            <div className="mt-6 space-y-6">
              <DocParagraph>
                Vibe coding is not about memorizing syntax or copying Stack Overflow answers. It is about developing
                a deep, intuitive understanding of how code works — to the point where writing code feels like
                a natural extension of your thought process.
              </DocParagraph>

              <StepBlock step={1} title="Reading comes before writing">
                Just as musicians learn by listening to thousands of songs before composing their own,
                great developers learn by reading thousands of lines of code before writing theirs.
                Reading builds the mental vocabulary you need to express ideas in code.
              </StepBlock>

              <StepBlock step={2} title="Understanding beats memorization">
                You do not need to memorize every method in every library. Instead, understand the
                underlying concepts — data flow, state management, error handling, separation of concerns.
                When you understand the <em className="text-[#22C55E]">why</em>, the <em className="text-[#22C55E]">how</em> follows naturally.
              </StepBlock>

              <StepBlock step={3} title="Flow state is the goal">
                The "vibe" in vibe coding refers to the flow state — that mental zone where code
                seems to write itself. You cannot force flow, but you can create the conditions for it:
                deep understanding, clear intent, and deliberate practice.
              </StepBlock>

              <Callout type="quote" title="The Core Principle">
                Code is read 10x more than it is written. The best investment you can make as a developer
                is learning to read code deeply and critically. Everything else follows from that skill.
              </Callout>
            </div>
          </section>

          {/* Chapter 3: Reading Code */}
          <section id="reading" className="scroll-mt-8">
            <ChapterHeader number={3} title="How to Read Code Effectively" subtitle="A systematic approach to understanding any codebase" color="cyan" />
            <div className="mt-6 space-y-6">
              <DocParagraph>
                Reading code is a skill that improves with practice. Here is a structured method
                you can apply to any codebase, function, or code snippet.
              </DocParagraph>

              <StepBlock step={1} title="Get the big picture first">
                Before reading a single line, understand the context. What does this code do?
                Read the file name, class names, function names, and docstrings. Look at imports to
                understand dependencies. Skim the structure before diving into details.
                <CodeExample>{`# Before reading the body, these names tell you a lot:
class PaymentProcessor:
    def validate_card(self, card_number: str) -> bool: ...
    def charge(self, amount: Decimal, currency: str) -> Transaction: ...
    def refund(self, transaction_id: str) -> bool: ...`}</CodeExample>
              </StepBlock>

              <StepBlock step={2} title="Trace the data flow">
                Follow the data. Where does the input come from? How is it transformed at each step?
                Where does the output go? Understanding data flow is the single most powerful
                technique for understanding code.
                <CodeExample>{`# Trace: user input → validation → transformation → storage
def create_user(request):
    data = request.json                    # 1. Input arrives
    email = data['email'].strip().lower()  # 2. Cleaned
    if not validate_email(email):          # 3. Validated
        raise ValueError("Invalid email")
    user = User(email=email)               # 4. Transformed
    db.session.add(user)                   # 5. Stored
    return user`}</CodeExample>
              </StepBlock>

              <StepBlock step={3} title="Identify the patterns">
                Experienced developers read fast because they recognize patterns instantly —
                guard clauses, factory methods, decorator patterns, middleware chains.
                The more patterns you know, the faster you read.
                <CodeExample>{`# Guard clause pattern — exit early for invalid cases
def process_order(order):
    if not order:                  # Guard: null check
        return None
    if order.status != 'pending':  # Guard: state check
        raise InvalidState()
    if order.total <= 0:           # Guard: value check
        raise ValueError()
    # Happy path continues here...`}</CodeExample>
              </StepBlock>

              <StepBlock step={4} title="Ask critical questions">
                As you read, actively question the code:
                <ul className="mt-3 space-y-1.5 text-gray-400">
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> What happens if this input is None or empty?</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> Is there an edge case that is not handled?</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> Could this fail silently instead of raising an error?</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> Is there a performance concern with this approach?</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-[#22C55E] mt-0.5 flex-shrink-0" /> Does this trust user input when it should not?</li>
                </ul>
              </StepBlock>

              <Callout type="tip" title="Pro Tip">
                When reading unfamiliar code, start from the entry point (main function, route handler, event listener)
                and work your way down the call stack. Do not try to understand helper functions in isolation —
                understand them in the context of how they are called.
              </Callout>
            </div>
          </section>

          {/* Chapter 4: Mental Models */}
          <section id="mental-models" className="scroll-mt-8">
            <ChapterHeader number={4} title="Building Mental Models" subtitle="How to develop intuition about code behavior" color="green" />
            <div className="mt-6 space-y-6">
              <DocParagraph>
                A mental model is your internal simulation of how code executes. Strong mental models
                let you predict what code will do before running it, spot bugs by "feeling"
                that something is wrong, and design solutions in your head before writing a single line.
              </DocParagraph>

              <StepBlock step={1} title="Visualize data structures">
                When you see a list, dictionary, or object — picture it. What does it look like in memory?
                How does it change as code executes?
                <CodeExample>{`# Visualize this step by step:
users = {"alice": [80, 90], "bob": [70]}
# Mental picture:
#   users → { "alice" → [80, 90]
#              "bob"   → [70]     }

users["alice"].append(95)
# Now:  { "alice" → [80, 90, 95]
#          "bob"   → [70]          }`}</CodeExample>
              </StepBlock>

              <StepBlock step={2} title="Simulate execution mentally">
                Practice running code in your head. Start with simple loops and conditionals.
                Track variable values at each step. This is the core skill that makes debugging intuitive.
                <CodeExample>{`# Run this in your head before reading the answer:
result = []
for i in range(5):
    if i % 2 == 0:
        result.append(i * i)

# Step through: i=0 → 0, i=1 → skip, i=2 → 4, i=3 → skip, i=4 → 16
# result = [0, 4, 16]`}</CodeExample>
              </StepBlock>

              <StepBlock step={3} title="Map concepts to analogies">
                Connect abstract concepts to things you already understand:
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> <strong className="text-[#E4E4E7]">Stack</strong> — A stack of plates. Last one placed is first one removed.</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> <strong className="text-[#E4E4E7]">Queue</strong> — A line at a store. First in, first out.</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> <strong className="text-[#E4E4E7]">Hash map</strong> — A phone book. Look up a name, get a number instantly.</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> <strong className="text-[#E4E4E7]">Recursion</strong> — Russian nesting dolls. Each doll contains a smaller version of itself.</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> <strong className="text-[#E4E4E7]">API</strong> — A waiter at a restaurant. Takes your order, brings back what you asked for.</li>
                </ul>
              </StepBlock>

              <StepBlock step={4} title="Test your models constantly">
                After predicting what code will do, run it and check. When your prediction is wrong,
                that is the most valuable learning moment — your mental model has a gap. Fix it, and
                you become permanently better.
              </StepBlock>
            </div>
          </section>

          {/* Chapter 5: The Workflow */}
          <section id="workflow" className="scroll-mt-8">
            <ChapterHeader number={5} title="The Vibe Coding Workflow" subtitle="A repeatable process for any coding task" color="yellow" />
            <div className="mt-6 space-y-6">
              <DocParagraph>
                Follow this workflow for any coding task — from fixing a bug to building a new feature.
                Each step builds on the previous one.
              </DocParagraph>

              <StepBlock step={1} title="Understand the problem">
                Before touching code, make sure you understand what you are trying to achieve.
                Write it down in plain English. What is the input? What is the expected output?
                What are the edge cases?
                <Callout type="example" title="Example">
                  <strong className="text-[#E4E4E7]">Task:</strong> "Fix the login bug"<br/>
                  <strong className="text-[#E4E4E7]">Clarified:</strong> "Users with uppercase letters in their email
                  cannot log in because the comparison is case-sensitive. The fix should normalize
                  email to lowercase before comparing."
                </Callout>
              </StepBlock>

              <StepBlock step={2} title="Read the existing code">
                Find and read the code related to your task. Understand the current behavior,
                the data flow, and the architecture around it. Never change code you do not understand.
              </StepBlock>

              <StepBlock step={3} title="Plan your approach">
                Before writing, outline your solution. Think about:
                <ul className="mt-3 space-y-1.5 text-gray-400">
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> Which files need to change?</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> What is the minimal change that solves the problem?</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> Could your change break anything else?</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> How will you test that it works?</li>
                </ul>
              </StepBlock>

              <StepBlock step={4} title="Write the code">
                Now write your solution. Because you have read the codebase and planned your approach,
                your code will naturally follow existing patterns and conventions. Write small,
                testable pieces.
              </StepBlock>

              <StepBlock step={5} title="Test thoroughly">
                Test the happy path, edge cases, and error cases. If the codebase has tests,
                run them. If it does not, test manually with different inputs. Think about
                what a malicious user might try.
              </StepBlock>

              <StepBlock step={6} title="Review your own code">
                Read your changes as if someone else wrote them. Is the intent clear?
                Are there unnecessary complications? Could you simplify anything?
                Sleep on it if the change is large.
              </StepBlock>
            </div>
          </section>

          {/* Chapter 6: Prompting AI */}
          <section id="prompting" className="scroll-mt-8">
            <ChapterHeader number={6} title="Prompting AI for Code" subtitle="How to get the best results from AI coding assistants" color="purple" />
            <div className="mt-6 space-y-6">
              <DocParagraph>
                AI assistants like Claude, ChatGPT, and Copilot are powerful tools — but only if you know
                how to talk to them. The quality of your prompt directly determines the quality of the output.
                Here is how to prompt effectively.
              </DocParagraph>

              <StepBlock step={1} title="Be specific about what you want">
                Vague prompts get vague answers. Instead of "write a login function", say exactly what you need.
                <div className="mt-3 space-y-3">
                  <Callout type="warning" title="Bad prompt">
                    "Write a login function"
                  </Callout>
                  <Callout type="tip" title="Good prompt">
                    "Write a Python Flask login endpoint that accepts username and password via POST JSON body,
                    validates against a PostgreSQL users table with bcrypt-hashed passwords, returns a JWT token
                    on success, and returns appropriate error codes (401 for wrong password, 404 for unknown user)."
                  </Callout>
                </div>
              </StepBlock>

              <StepBlock step={2} title="Provide context">
                Tell the AI about your project, tech stack, conventions, and constraints.
                The more context it has, the more relevant its output will be.
                <CodeExample>{`# Include context like:
# - "I'm using Flask with SQLAlchemy and PostgreSQL"
# - "The project follows this folder structure: ..."
# - "We use snake_case for all Python functions"
# - "Here's the existing User model: ..."
# - "This needs to work with Python 3.9+"`}</CodeExample>
              </StepBlock>

              <StepBlock step={3} title="Ask it to explain, not just generate">
                The real power of AI is learning from it. Ask it to explain its choices,
                trade-offs, and alternatives. This builds your understanding for next time.
                <Callout type="tip" title="Effective follow-ups">
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> "Why did you use bcrypt instead of SHA-256 here?"</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> "What would break if I removed this null check?"</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> "What are the security implications of this approach?"</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> "How would this change if we needed to handle 10,000 concurrent users?"</li>
                  </ul>
                </Callout>
              </StepBlock>

              <StepBlock step={4} title="Always verify AI output">
                AI can hallucinate — generate confident but incorrect code. Always:
                <ul className="mt-3 space-y-1.5 text-gray-400">
                  <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> Read and understand every line before using it</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> Test the code — do not assume it works</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> Check for security issues (SQL injection, hardcoded secrets, eval)</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> Verify that APIs and functions it references actually exist</li>
                </ul>
              </StepBlock>

              <StepBlock step={5} title="Iterate and refine">
                Treat AI like a junior developer on your team. Give feedback, ask for revisions,
                and guide it toward better solutions. A single prompt rarely produces the perfect answer —
                the conversation is the tool.
              </StepBlock>
            </div>
          </section>

          {/* Chapter 7: Debugging */}
          <section id="debugging" className="scroll-mt-8">
            <ChapterHeader number={7} title="The Art of Debugging" subtitle="Systematic techniques for finding and fixing bugs" color="red" />
            <div className="mt-6 space-y-6">
              <DocParagraph>
                Debugging is not about guessing. It is a systematic process of forming hypotheses
                and testing them. Here is a step-by-step method that works for any bug.
              </DocParagraph>

              <StepBlock step={1} title="Reproduce the bug">
                Before fixing anything, make sure you can reliably reproduce the issue.
                Write down the exact steps, inputs, and conditions that trigger it.
                If you cannot reproduce it, you cannot verify your fix.
              </StepBlock>

              <StepBlock step={2} title="Isolate the problem">
                Narrow down where the bug is. Use binary search: if the code has 10 steps,
                check the state at step 5. Is it correct? If yes, the bug is in steps 6-10.
                If no, it is in steps 1-5. Keep halving until you find the exact line.
                <CodeExample>{`# Add strategic print statements to isolate:
def process_order(order):
    print(f"DEBUG 1: order = {order}")        # Is input correct?
    validated = validate(order)
    print(f"DEBUG 2: validated = {validated}") # Did validation work?
    total = calculate_total(validated)
    print(f"DEBUG 3: total = {total}")         # Is total correct?
    result = charge(total)
    print(f"DEBUG 4: result = {result}")       # Did charging work?
    return result`}</CodeExample>
              </StepBlock>

              <StepBlock step={3} title="Understand why it happens">
                Finding the broken line is not enough. Understand WHY it is broken.
                What assumption was wrong? What edge case was missed? This understanding
                prevents similar bugs in the future.
              </StepBlock>

              <StepBlock step={4} title="Fix the root cause, not the symptom">
                Resist the urge to patch symptoms. If a function crashes on None input,
                do not just add a null check — ask why None is being passed in the first place.
                The real bug might be upstream.
                <div className="mt-3 space-y-3">
                  <Callout type="warning" title="Symptom fix (bad)">
                    <code className="text-sm text-red-300">if user is not None: process(user)  # Hides the real bug</code>
                  </Callout>
                  <Callout type="tip" title="Root cause fix (good)">
                    <code className="text-sm text-green-300">user = db.get_user(id) or raise UserNotFound(id)  # Fails fast at the source</code>
                  </Callout>
                </div>
              </StepBlock>

              <StepBlock step={5} title="Verify and prevent">
                After fixing, verify that:
                <ul className="mt-3 space-y-1.5 text-gray-400">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> The original bug is fixed</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> You have not introduced new bugs</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> Similar edge cases are also handled</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> You have written a test to prevent regression</li>
                </ul>
              </StepBlock>

              <Callout type="quote" title="The Debugging Mindset">
                Every bug is a gift — it reveals a gap in your understanding. Approach bugs with
                curiosity, not frustration. The developers who grow fastest are the ones who
                learn the most from their bugs.
              </Callout>
            </div>
          </section>

          {/* Chapter 8: Security */}
          <section id="security" className="scroll-mt-8">
            <ChapterHeader number={8} title="Security-First Thinking" subtitle="How to write code that does not get hacked" color="red" />
            <div className="mt-6 space-y-6">
              <DocParagraph>
                Security is not something you bolt on at the end. It is a way of thinking about
                every line of code you write. Here are the principles that matter most.
              </DocParagraph>

              <StepBlock step={1} title="Never trust user input">
                This is the #1 rule of secure coding. Every piece of data from outside your system
                — form fields, URL parameters, API bodies, file uploads, cookies — must be validated,
                sanitized, and escaped before use.
                <CodeExample>{`# NEVER do this:
query = f"SELECT * FROM users WHERE name = '{username}'"

# ALWAYS do this:
query = "SELECT * FROM users WHERE name = ?"
cursor.execute(query, (username,))`}</CodeExample>
              </StepBlock>

              <StepBlock step={2} title="Use the principle of least privilege">
                Every component should have only the minimum permissions it needs.
                Database users should not have admin rights. API tokens should be scoped.
                File permissions should be restrictive. If something gets compromised,
                the damage should be contained.
              </StepBlock>

              <StepBlock step={3} title="Keep secrets out of code">
                Never hardcode API keys, passwords, or tokens in source code.
                Use environment variables, secret managers, or configuration files that
                are excluded from version control.
                <CodeExample>{`# NEVER:
API_KEY = "sk-live-1234567890abcdef"

# ALWAYS:
import os
API_KEY = os.environ.get("API_KEY")
if not API_KEY:
    raise RuntimeError("API_KEY not set")`}</CodeExample>
              </StepBlock>

              <StepBlock step={4} title="Hash passwords properly">
                Use bcrypt, argon2, or scrypt — algorithms designed to be slow and include salting.
                Never use MD5, SHA-1, or SHA-256 for passwords. These fast hash functions can be
                brute-forced at billions of attempts per second.
              </StepBlock>

              <StepBlock step={5} title="Learn the OWASP Top 10">
                The OWASP Top 10 is the definitive list of the most critical web security risks.
                Every developer should know them:
                <ul className="mt-3 space-y-1.5 text-gray-400">
                  <li className="flex items-start gap-2"><span className="text-red-400 font-mono text-xs w-5 flex-shrink-0">01</span> Broken Access Control</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 font-mono text-xs w-5 flex-shrink-0">02</span> Cryptographic Failures</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 font-mono text-xs w-5 flex-shrink-0">03</span> Injection (SQL, Command, XSS)</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 font-mono text-xs w-5 flex-shrink-0">04</span> Insecure Design</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 font-mono text-xs w-5 flex-shrink-0">05</span> Security Misconfiguration</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 font-mono text-xs w-5 flex-shrink-0">06</span> Vulnerable and Outdated Components</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 font-mono text-xs w-5 flex-shrink-0">07</span> Authentication Failures</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 font-mono text-xs w-5 flex-shrink-0">08</span> Software and Data Integrity Failures</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 font-mono text-xs w-5 flex-shrink-0">09</span> Security Logging and Monitoring Failures</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 font-mono text-xs w-5 flex-shrink-0">10</span> Server-Side Request Forgery (SSRF)</li>
                </ul>
              </StepBlock>

              <Callout type="warning" title="Practice on TraceBack">
                VibeClub has 30+ security-focused problems that let you practice spotting and fixing
                real vulnerabilities — SQL injection, XSS, SSRF, command injection, and more.
                These are the exact bugs that cause data breaches in production.
              </Callout>
            </div>
          </section>

          {/* Chapter 9: Daily Practice */}
          <section id="daily" className="scroll-mt-8">
            <ChapterHeader number={9} title="Daily Practice Routine" subtitle="Habits that build lasting skill" color="green" />
            <div className="mt-6 space-y-6">
              <DocParagraph>
                Vibe coding is a skill, and skills require consistent practice. Here is a daily routine
                designed to maximize your growth as a developer.
              </DocParagraph>

              <div className="bg-[#111113] border border-[#1C1C1F] rounded-md overflow-hidden">
                <div className="p-4 bg-green-500/10 border-b border-[#1C1C1F]">
                  <h3 className="text-lg font-semibold text-[#E4E4E7] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    The 30-Minute Daily Routine
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  <TimeBlock time="10 min" title="Read code you did not write" color="cyan">
                    Pick an open-source project you admire. Read one file, one function, or one pull request.
                    Focus on understanding, not speed. Take notes on patterns you find interesting.
                  </TimeBlock>
                  <TimeBlock time="10 min" title="Solve one problem on VibeClub" color="purple">
                    Practice spotting bugs or fixing broken code. Each problem builds your pattern recognition
                    and security awareness. Try without hints first.
                  </TimeBlock>
                  <TimeBlock time="10 min" title="Reflect and journal" color="green">
                    Write down one thing you learned today. It can be a new pattern, a bug you found,
                    a concept that clicked, or a mistake you made. This reflection cements learning.
                  </TimeBlock>
                </div>
              </div>

              <StepBlock step={1} title="Read code from projects you admire">
                Some great codebases to read:
                <ul className="mt-3 space-y-1.5 text-gray-400">
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> <strong className="text-[#E4E4E7]">Flask</strong> — Clean, readable Python web framework</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> <strong className="text-[#E4E4E7]">Redis</strong> — Elegant C code with excellent comments</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> <strong className="text-[#E4E4E7]">React</strong> — Modern JavaScript patterns at scale</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> <strong className="text-[#E4E4E7]">FastAPI</strong> — Modern Python with excellent type hints</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> <strong className="text-[#E4E4E7]">Go standard library</strong> — Idiomatic, well-documented Go</li>
                </ul>
              </StepBlock>

              <StepBlock step={2} title="Review pull requests">
                Read pull requests on projects you use. See how experienced developers discuss code,
                what they catch in reviews, and how they suggest improvements. This is free mentorship.
              </StepBlock>

              <StepBlock step={3} title="Explain code to someone (or something)">
                The rubber duck technique works because explaining forces you to organize your understanding.
                If you cannot explain it clearly, you do not understand it yet. Explain to a friend,
                a rubber duck, or write a blog post.
              </StepBlock>
            </div>
          </section>

          {/* Chapter 10: Common Mistakes */}
          <section id="mistakes" className="scroll-mt-8">
            <ChapterHeader number={10} title="Common Mistakes to Avoid" subtitle="Pitfalls that slow down your growth" color="yellow" />
            <div className="mt-6 space-y-6">
              <DocParagraph>
                Knowing what NOT to do is just as important as knowing what to do.
                Here are the most common mistakes developers make.
              </DocParagraph>

              <MistakeBlock title="Copy-pasting without understanding" number={1}>
                If you copy code from AI, Stack Overflow, or a tutorial — read every line
                and understand it before using it. Code you do not understand will eventually
                break, and you will not know how to fix it. Worse, it may contain security vulnerabilities.
              </MistakeBlock>

              <MistakeBlock title="Skipping the reading step" number={2}>
                Jumping straight to writing code is the most common cause of bugs,
                technical debt, and wasted time. The 10 minutes you spend reading will
                save you hours of debugging.
              </MistakeBlock>

              <MistakeBlock title="Ignoring error handling" number={3}>
                Happy-path code works great in demos but breaks in production. Always think
                about what can go wrong: network failures, invalid input, race conditions,
                missing permissions, full disks, timeout errors.
              </MistakeBlock>

              <MistakeBlock title="Premature optimization" number={4}>
                Write correct, readable code first. Optimize only when you have measured
                a real performance problem. Most code runs once and is never the bottleneck.
              </MistakeBlock>

              <MistakeBlock title="Not testing edge cases" number={5}>
                Always test with: empty input, very large input, special characters,
                negative numbers, None/null, concurrent access, and boundary values.
                These are where bugs live.
              </MistakeBlock>

              <MistakeBlock title="Treating security as optional" number={6}>
                "We will add security later" is how data breaches happen.
                Every line of code that handles user input, authentication, or data storage
                is a potential attack surface. Think about security from line one.
              </MistakeBlock>

              <MistakeBlock title="Working in isolation" number={7}>
                Code reviews, pair programming, and discussions with other developers
                are not overhead — they are how you grow fastest. A fresh pair of eyes
                catches bugs your brain has learned to ignore.
              </MistakeBlock>
            </div>
          </section>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="bg-[#111113] border border-[#1C1C1F] rounded-lg p-8">
              <Sparkles className="w-10 h-10 text-[#22C55E] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#E4E4E7] mb-3">Ready to Practice?</h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Theory without practice is just trivia. Start solving real debugging challenges
                and put everything you have learned into action.
              </p>
              <a
                href="/problems"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#E4E4E7] font-semibold rounded-md transition-all"
              >
                Start Debugging
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function ChapterHeader({ number, title, subtitle, color }: { number: number; title: string; subtitle: string; color: string }) {
  const borderColor: Record<string, string> = {
    purple: 'border-[#22C55E]/20',
    cyan: 'border-[#22C55E]/20',
    green: 'border-[#1C1C1F]',
    yellow: 'border-[#1C1C1F]',
    red: 'border-[#1C1C1F]',
  };
  const numColor: Record<string, string> = {
    purple: 'text-[#22C55E]',
    cyan: 'text-[#22C55E]',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
  };
  return (
    <div className={`border-b ${borderColor[color] || borderColor.purple} pb-4`}>
      <span className={`font-mono text-sm ${numColor[color] || numColor.purple}`}>Chapter {String(number).padStart(2, '0')}</span>
      <h2 className="text-2xl font-bold text-[#E4E4E7] mt-1">{title}</h2>
      <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function DocParagraph({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 leading-relaxed text-[15px]">{children}</p>;
}

function StepBlock({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-10">
      <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center">
        <span className="text-xs font-bold text-[#22C55E]">{step}</span>
      </div>
      <h3 className="text-base font-semibold text-[#E4E4E7] mb-2">{title}</h3>
      <div className="text-gray-400 text-[15px] leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

function CodeExample({ children }: { children: string }) {
  return (
    <div className="mt-3 rounded-lg overflow-hidden border border-[#1C1C1F]" style={{ backgroundColor: '#0C0C0E' }}>
      <div className="px-3 py-1.5 bg-white/5 border-b border-[#1C1C1F] flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="text-[10px] text-gray-600 ml-2 font-mono">python</span>
      </div>
      <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed"><code>{children}</code></pre>
    </div>
  );
}

function Callout({ type, title, children }: { type: 'info' | 'tip' | 'warning' | 'quote' | 'example'; title: string; children: React.ReactNode }) {
  const styles: Record<string, { border: string; bg: string; icon: React.ReactNode; titleColor: string }> = {
    info: { border: 'border-[#22C55E]/20', bg: 'bg-[#22C55E]/5', icon: <Lightbulb className="w-4 h-4 text-[#22C55E]" />, titleColor: 'text-[#22C55E]' },
    tip: { border: 'border-green-500/30', bg: 'bg-green-500/5', icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, titleColor: 'text-green-400' },
    warning: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />, titleColor: 'text-yellow-400' },
    quote: { border: 'border-[#22C55E]/20', bg: 'bg-[#22C55E]/5', icon: <Sparkles className="w-4 h-4 text-[#22C55E]" />, titleColor: 'text-[#22C55E]' },
    example: { border: 'border-gray-500/30', bg: 'bg-gray-500/5', icon: <Code2 className="w-4 h-4 text-gray-400" />, titleColor: 'text-gray-400' },
  };
  const s = styles[type];
  return (
    <div className={`border ${s.border} ${s.bg} rounded-md p-4`}>
      <div className={`flex items-center gap-2 mb-2 ${s.titleColor} font-medium text-sm`}>
        {s.icon}
        {title}
      </div>
      <div className="text-gray-400 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function TimeBlock({ time, title, color, children }: { time: string; title: string; color: string; children: React.ReactNode }) {
  const textColor: Record<string, string> = { cyan: 'text-[#22C55E]', purple: 'text-[#22C55E]', green: 'text-green-400' };
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-16 text-right">
        <span className={`font-mono text-sm font-bold ${textColor[color] || 'text-gray-400'}`}>{time}</span>
      </div>
      <div className="flex-1 pb-4 border-b border-[#1C1C1F] last:border-0 last:pb-0">
        <h4 className="text-[#E4E4E7] font-medium text-sm mb-1">{title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function MistakeBlock({ title, number, children }: { title: string; number: number; children: React.ReactNode }) {
  return (
    <div className="bg-[#111113] border border-[#1C1C1F] rounded-md p-5">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-yellow-400">{number}</span>
        </div>
        <div>
          <h3 className="text-[#E4E4E7] font-semibold mb-2">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
}
