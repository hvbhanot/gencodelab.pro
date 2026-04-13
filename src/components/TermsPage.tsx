import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, BookOpen, Database, AlertTriangle } from 'lucide-react';

const sections = [
  {
    title: 'Eligibility',
    icon: Shield,
    points: [
      'This beta is intended for TAMUCC students and approved users.',
      'You must provide accurate signup information and keep your account credentials private.',
    ],
  },
  {
    title: 'Acceptable Use',
    icon: BookOpen,
    points: [
      'Use the platform for learning, practice, and legitimate academic or personal skill development.',
      'Do not abuse the code runner, attempt to disrupt the service, scrape restricted data, or interfere with other users.',
      'Do not impersonate another person or share access to accounts that are not yours.',
    ],
  },
  {
    title: 'Data & Progress',
    icon: Database,
    points: [
      'We store account details, problem progress, scores, bookmarks, and streak data needed to operate the product.',
      'Because this product is in beta, features and stored progress may change as the platform evolves.',
    ],
  },
  {
    title: 'Beta Service Notice',
    icon: AlertTriangle,
    points: [
      'The service is provided as-is during beta and may be updated, limited, or unavailable at times.',
      'Accounts may be suspended or removed for misuse, abuse, or violations of these terms.',
    ],
  },
];

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0C10] text-white/90">
      <div className="max-w-4xl mx-auto px-6 py-10 md:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8 text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="rounded-2xl border border-white/[0.08] bg-[#12141A] overflow-hidden">
          <div className="px-6 md:px-8 py-8 border-b border-white/[0.06] bg-gradient-to-br from-[#4ADE80]/10 via-transparent to-transparent">
            <div className="font-mono text-sm text-[#4ADE80] mb-3">&lt;g/&gt; Terms</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Terms & Conditions</h1>
            <p className="max-w-2xl text-sm md:text-base text-white/55 leading-relaxed">
              By creating an account and using gencodelab.pro, you agree to the following terms for access,
              acceptable use, and operation of this beta product.
            </p>
          </div>

          <div className="px-6 md:px-8 py-8 space-y-6">
            {sections.map((section) => (
              <section key={section.title} className="rounded-xl border border-white/[0.06] bg-[#0D0F14] p-5 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#4ADE80]/10 border border-[#4ADE80]/20">
                    <section.icon className="w-5 h-5 text-[#4ADE80]" />
                  </div>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>
                <div className="space-y-2">
                  {section.points.map((point) => (
                    <p key={point} className="text-sm leading-relaxed text-white/60">
                      {point}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <p className="text-xs text-white/35 leading-relaxed">
              These terms may be updated as the beta evolves. Continued use of the service after changes means you accept the updated terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
