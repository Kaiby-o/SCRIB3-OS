import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';

/* ------------------------------------------------------------------ */
/*  Plan v4 §4D — "What Good Looks Like" Library (Nick)                */
/*  Build the framework now. Populate with examples over time.         */
/*  Section headers (shells — no AI-generated examples).               */
/*  Seed content from Culture Book POE modules.                        */
/* ------------------------------------------------------------------ */

interface WGLLSection {
  id: string;
  title: string;
  description: string;
  exampleSlots: number;
  seedContent: string; // from Culture Book
  examples: { title: string; addedBy: string; date: string }[];
}

const sections: WGLLSection[] = [
  {
    id: 'client-facilitation', title: 'Client Facilitation',
    description: 'How to run client calls, manage expectations, and navigate difficult conversations with grace and clarity.',
    exampleSlots: 5, seedContent: 'Trust & Accountability & Influence — building client trust through consistent delivery and transparent communication. The account lead owns the relationship; all comms route through them.',
    examples: [{ title: 'Rootstock QBR presentation — clear structure, data-led', addedBy: 'Omar Anwar', date: '2026-03-10' }],
  },
  {
    id: 'communication', title: 'Communication',
    description: 'Internal and external communication standards. Clear briefs, clean handovers, async-first.',
    exampleSlots: 5, seedContent: 'Communication (from Culture Book) — say what you mean, mean what you say. Default to written, default to public channels. If it\'s not documented, it didn\'t happen.',
    examples: [{ title: 'Elena\'s weekly client update format — concise, actionable', addedBy: 'Ben Lydiat', date: '2026-02-28' }],
  },
  {
    id: 'brief-writing', title: 'Brief Writing',
    description: 'The Five-Bullet Brief standard. Every creative task starts here. No brief = no work.',
    exampleSlots: 5, seedContent: 'Get Lit (from Culture Book) — passion starts with understanding the problem. A great brief inspires the creative team; a bad brief wastes everyone\'s time.',
    examples: [{ title: 'Samantha\'s Franklin Templeton BENJI brief — perfect Five-Bullet', addedBy: 'Nick Mitchell', date: '2026-03-15' }],
  },
  {
    id: 'content-strategy', title: 'Content Strategy',
    description: 'How to think about content pillars, audience mapping, and editorial calendars in the crypto/Web3 space.',
    exampleSlots: 5, seedContent: 'Strategic thinking applied to content. Every piece should ladder to the client\'s macro strategy. If you can\'t explain why this post exists, it shouldn\'t.',
    examples: [],
  },
  {
    id: 'social-content', title: 'Social Content (Crypto-Native)',
    description: 'What great crypto social looks like — CT voice, engagement hooks, thread craft, visual standards.',
    exampleSlots: 5, seedContent: 'Speed > Craft Ritual — ship fast, iterate faster. But "fast" doesn\'t mean sloppy. The bar is: would you be proud to show this to the client\'s CEO?',
    examples: [{ title: 'Jake\'s Cardano thread — 2.4K engagements, on-brand', addedBy: 'Kevin Moran', date: '2026-03-12' }],
  },
  {
    id: 'animation-motion', title: 'Animation / Motion',
    description: 'Motion design standards — explainer quality, social clips, brand motion systems.',
    exampleSlots: 5, seedContent: 'Craft matters. Motion should feel intentional, not decorative. Every animation serves the message.',
    examples: [{ title: 'Tolani\'s Rootstock explainer — clean, 60s, narrative-driven', addedBy: 'Ben Lydiat', date: '2026-02-20' }],
  },
  {
    id: 'brand-work', title: 'Brand Work',
    description: 'Visual identity, brand systems, typography, and design execution standards.',
    exampleSlots: 5, seedContent: 'Effective Feedback (from Culture Book) — critiquing brand work constructively. Lead with what\'s working, then what could be stronger, then specific next steps.',
    examples: [{ title: 'Kevin\'s Rootstock refresh — system thinking, not just a logo', addedBy: 'Sixtyne Perez', date: '2026-03-01' }],
  },
  {
    id: 'campaign-concepting', title: 'Campaign Concepting',
    description: 'From insight to idea to execution plan. How to concept campaigns that resonate in Web3.',
    exampleSlots: 5, seedContent: 'Managing Conflict (from Culture Book) — creative disagreements are healthy. The best campaigns survive debate. But once decided, everyone commits.',
    examples: [],
  },
  {
    id: 'pr-pitch', title: 'PR Pitch',
    description: 'Media pitching, story angles, journalist relationships, and coverage tracking.',
    exampleSlots: 5, seedContent: 'Know your audience. A CoinDesk editor and a Bloomberg journalist need completely different angles. Research before you pitch.',
    examples: [{ title: 'Matt\'s Cardano Consensus pitch — secured 3 tier-1 interviews', addedBy: 'Elena Zheng', date: '2026-03-08' }],
  },
  {
    id: 'account-management', title: 'Account Management',
    description: 'Client retention, upselling, health monitoring, and proactive relationship management.',
    exampleSlots: 5, seedContent: 'Trust & Accountability & Influence — the account lead is the client\'s voice inside SCRIB3 and SCRIB3\'s voice to the client. Both directions require honesty.',
    examples: [],
  },
];

const WhatGoodLooksLikePage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>What Good Looks Like</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
      <BurgerButton />
      </header>

      <div style={{ padding: isMobile ? '16px' : '40px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: isMobile ? '24px' : '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 8px 0' }}>
          What Good Looks Like
        </h1>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, marginBottom: '32px' }}>
          The SCRIB3 quality standard. Each section defines what "good" means + real examples added by the team.
        </p>

        <div className="flex flex-col gap-3">
          {sections.map((section) => (
            <div key={section.id} style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', overflow: 'hidden' }}>
              {/* Header */}
              <div
                onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                className="flex items-center justify-between"
                style={{ padding: '20px 24px', cursor: 'pointer', transition: 'background 0.15s', background: expandedId === section.id ? 'var(--bg-surface)' : 'transparent' }}
                onMouseEnter={(e) => { if (expandedId !== section.id) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                onMouseLeave={(e) => { if (expandedId !== section.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>
                    {section.title}
                  </span>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '75.641px', border: '1px solid var(--border-default)', opacity: 0.5 }}>
                    {section.examples.length} / {section.exampleSlots} examples
                  </span>
                </div>
                <span style={{ fontFamily: "'Kaio', sans-serif", fontSize: '14px', opacity: 0.4, transform: expandedId === section.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
              </div>

              {/* Expanded */}
              {expandedId === section.id && (
                <div style={{ padding: '0 24px 24px 24px', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                  <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, opacity: 0.7, margin: '16px 0' }}>
                    {section.description}
                  </p>

                  {/* Culture Book seed content */}
                  <div style={{ background: 'rgba(215,171,197,0.08)', border: '1px solid rgba(215,171,197,0.2)', borderRadius: '10.258px', padding: '16px 20px', marginBottom: '16px' }}>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '6px' }}>From the Culture Book</span>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', lineHeight: 1.5 }}>{section.seedContent}</span>
                  </div>

                  {/* Examples */}
                  {section.examples.length > 0 && (
                    <div>
                      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45, display: 'block', marginBottom: '8px' }}>Examples</span>
                      {section.examples.map((ex) => (
                        <div key={ex.title} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{ex.title}</span>
                          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.5 }}>{ex.addedBy} · {ex.date}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty slots */}
                  {section.examples.length < section.exampleSlots && (
                    <div style={{ marginTop: '12px', padding: '16px', border: '1px dashed var(--border-default)', borderRadius: '10.258px', opacity: 0.3, textAlign: 'center' }}>
                      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {section.exampleSlots - section.examples.length} example slot{section.exampleSlots - section.examples.length > 1 ? 's' : ''} remaining — added by Ben / CSuite
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatGoodLooksLikePage;
