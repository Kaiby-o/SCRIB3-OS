import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from './LogoScrib3';
import { mockTeam } from '../lib/team';
import { priorityClients } from '../lib/clients';
import { mockProjects } from '../lib/projects';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Category {
  label: string;
  subItems: string[];
}

interface NavOverlayContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

interface NavOverlayProviderProps {
  categories: Category[];
  children: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const NavOverlayContext = createContext<NavOverlayContextValue>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export const useNavOverlay = () => useContext(NavOverlayContext);

/* ------------------------------------------------------------------ */
/*  Sub-item → route mapping                                           */
/* ------------------------------------------------------------------ */

const subItemRoutes: Record<string, string> = {
  // Team nav
  'Directory': '/team',
  // Units nav
  'Accounts': '/units',
  'C-Suite': '/units',
  'Brand': '/units',
  'Media': '/units',
  'Ops': '/units',
  'PR': '/units',
  // Clients nav
  'Directory ': '/clients', // trailing space to differentiate from team Directory
  // Projects nav
  'All Projects': '/projects',
  'Tasks': '/tasks',
  // Team nav extra
  'Dapps': '/dapps',
  // Tools nav
  'Tools Directory': '/tools',
  'Systems Map': '/tools', // TODO: build /systems-map route
  // Culture nav
  'Proof of Excellence': '/culture',
  'Operating Principles': '/culture',
  'Culture Book': '/culture',
  // Client portal nav
  'Completed': '/projects',
  'Pending': '/projects',
  'Approved': '/projects',
  'Archive': '/projects',
  'Milestones': '/projects',
  'Schedule': '/projects',
  'Pending Review': '/projects',
  'History': '/projects',
  'Contact': '/clients',
  'FAQs': '/clients',
  // Vendor nav
  'Upcoming': '/vendors',
  'Upload': '/vendors',
  'Downloads': '/vendors',
  'Calendar': '/projects',
  'Overdue': '/vendors',
  'Paid': '/vendors',
  'Submit': '/vendors',
  'Guidelines': '/vendors',
  // C-Suite nav
  'Portfolio': '/finance',
  'Metrics': '/finance',
  'Reports': '/finance',
  'Performance': '/bandwidth',
  'Capacity': '/bandwidth',
  'Hiring': '/team',
  'Health': '/finance',
  'Revenue': '/finance',
  'Pipeline': '/clients',
  'Status': '/projects',
  'Risk': '/scope-watch',
  'Roadmap': '/projects',
  'Costs': '/finance',
  'Forecasts': '/finance',
  'OKRs': '/culture',
  'Initiatives': '/projects',
  'Board': '/culture',
};

// Items that show "Coming Soon" — only truly unbuilt features
const comingSoonItems = new Set([
  'Feedback', 'Office', 'Prof Dev',
]);

// Items that render as search fields
const searchItems = new Set(['Search Team', 'Search Clients', 'Search Projects']);

/* ------------------------------------------------------------------ */
/*  Provider + Overlay                                                 */
/* ------------------------------------------------------------------ */

export const NavOverlayProvider: React.FC<NavOverlayProviderProps> = ({
  categories,
  children,
}) => {
  const [layer, setLayer] = useState<0 | 1 | 2>(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categoryOrigin, setCategoryOrigin] = useState({ x: '100%', y: '0%' });
  const [searchQuery, setSearchQuery] = useState('');
  const [comingSoonToast, setComingSoonToast] = useState(false);
  const issuesInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const showComingSoon = () => { setComingSoonToast(true); setTimeout(() => setComingSoonToast(false), 1500); };

  /* helpers */
  const openOverlay = useCallback(() => setLayer(1), []);
  const closeOverlay = useCallback(() => {
    setLayer(0);
    setSelectedCategory(null);
  }, []);

  /* body scroll lock */
  useEffect(() => {
    if (layer > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [layer]);

  /* escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (layer === 2) {
          setLayer(1);
          setSelectedCategory(null);
        } else if (layer === 1) {
          closeOverlay();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [layer, closeOverlay]);

  /* category click */
  const handleCategoryClick = (
    cat: Category,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setCategoryOrigin({ x: `${x}px`, y: `${y}px` });
    setSelectedCategory(cat);
    setLayer(2);
  };

  /* sub-item click */
  const handleSubItemClick = (item: string) => {
    const route = subItemRoutes[item] ?? '/dashboard';
    closeOverlay();
    navigate(route);
  };

  /* mechanical easing */
  const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

  return (
    <NavOverlayContext.Provider
      value={{ open: openOverlay, close: closeOverlay, isOpen: layer > 0 }}
    >
      {children}

      {/* ---- Layer 1: Black overlay ---- */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 50,
          background: '#000000',
          clipPath:
            layer >= 1
              ? 'circle(150% at 100% 0%)'
              : 'circle(0% at 100% 0%)',
          transition: `clip-path 400ms ${easing}`,
          pointerEvents: layer >= 1 ? 'auto' : 'none',
        }}
      >
        {/* Top-left: SCRIB3 logo */}
        <div className="absolute top-8 left-10">
          <LogoScrib3 height={20} color="#EAF2D7" />
        </div>

        {/* Top-right: Close button */}
        <button
          onClick={closeOverlay}
          className="absolute top-8 right-10 font-kaio"
          style={{ color: '#EAF2D7', fontSize: '24px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Close navigation"
        >
          &times;
        </button>

        {/* Centre: Category labels — Kaio Black 80px, line-height 90% */}
        <div className="flex flex-col items-center justify-center h-full" style={{ gap: '16px' }}>
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={(e) => handleCategoryClick(cat, e)}
              style={{
                fontFamily: "'Kaio', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(36px, 5.5vw, 80px)',
                lineHeight: '0.9',
                letterSpacing: '0px',
                color: '#EAF2D7',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase' as const,
                transition: `opacity 200ms ${easing}`,
                fontFeatureSettings: "'ordn' 1, 'dlig' 1",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Bottom-left: "Having Issues?" — matches landing page format */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = issuesInputRef.current?.value?.trim();
            if (!val || !val.includes('@')) return;
            const subject = encodeURIComponent('SCRIB3 OS — Having Issues');
            const body = encodeURIComponent(`${val} is having issues with the SCRIB3 OS site.`);
            window.open(`mailto:ben.lydiat@scrib3.co?subject=${subject}&body=${body}`, '_blank');
            if (issuesInputRef.current) issuesInputRef.current.value = '';
          }}
          className="absolute flex flex-col"
          style={{ bottom: 32, left: 40, gap: '8px' }}
        >
          <span style={{ fontFamily: "'Owners Wide', sans-serif", color: '#EAF2D7', opacity: 0.7, fontSize: '13px', letterSpacing: '0.96px' }}>
            Having Issues?
          </span>
          <div
            className="flex items-center gap-2"
            style={{ border: '1px solid #EAF2D7', borderRadius: '75.641px', padding: '10px 20px', minWidth: '240px' }}
          >
            <svg width="18" height="14" viewBox="0 0 24 18" fill="none" stroke="#EAF2D7" strokeWidth="1.5">
              <rect x="1" y="1" width="22" height="16" rx="2" />
              <path d="M1 1l11 9 11-9" />
            </svg>
            <input
              ref={issuesInputRef}
              type="email"
              placeholder="Enter email here"
              style={{
                fontFamily: "'Owners Wide', sans-serif",
                background: 'transparent',
                border: 'none',
                color: '#EAF2D7',
                outline: 'none',
                flex: 1,
                fontSize: '13px',
                letterSpacing: '0.96px',
              }}
            />
          </div>
        </form>
      </div>

      {/* ---- Layer 2: Pink overlay ---- */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 60,
          background: '#D7ABC5',
          clipPath:
            layer === 2
              ? `circle(150% at ${categoryOrigin.x} ${categoryOrigin.y})`
              : `circle(0% at ${categoryOrigin.x} ${categoryOrigin.y})`,
          transition: `clip-path 400ms ${easing}`,
          pointerEvents: layer === 2 ? 'auto' : 'none',
        }}
      >
        {/* Top-right: Back arrow + Close button */}
        <div className="absolute top-8 right-10 flex items-center gap-4">
          <button
            onClick={() => {
              setLayer(1);
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className="font-kaio"
            style={{ color: '#000000', fontSize: '24px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Back to categories"
          >
            &larr;
          </button>
          <button
            onClick={closeOverlay}
            className="font-kaio"
            style={{ color: '#000000', fontSize: '24px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Close navigation"
          >
            &times;
          </button>
        </div>

        {/* Category heading */}
        <div
          className="absolute top-8"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#000',
            opacity: 0.5,
          }}
        >
          {selectedCategory?.label}
        </div>

        {/* Coming soon toast */}
        {comingSoonToast && (
          <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#EAF2D7', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '75.641px', zIndex: 70 }}>
            Coming Soon
          </div>
        )}

        {/* Centre: Sub-items */}
        <div className="flex flex-col items-center justify-center h-full gap-4" style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          {selectedCategory?.subItems.length === 0 && (
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', color: '#000', opacity: 0.4 }}>Coming Soon</span>
          )}
          {selectedCategory?.subItems.map((item) => {
            // Search fields
            if (searchItems.has(item)) {
              const searchType = item.replace('Search ', '').toLowerCase();
              const getResults = (): { name: string; id: string; slug?: string; code?: string }[] => {
                if (!searchQuery.trim()) return [];
                const q = searchQuery.toLowerCase();
                if (searchType === 'team') return mockTeam.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 5).map((m) => ({ name: m.name, id: m.id }));
                if (searchType === 'clients') return priorityClients.filter((c) => c.companyName.toLowerCase().includes(q)).slice(0, 5).map((c) => ({ name: c.companyName, id: c.id, slug: c.slug }));
                if (searchType === 'projects') return mockProjects.filter((p) => p.code.toLowerCase().includes(q) || p.title.toLowerCase().includes(q)).slice(0, 5).map((p) => ({ name: p.title, id: p.id, code: p.code }));
                return [];
              };
              const results = getResults();
              return (
                <div key={item} style={{ width: '100%', position: 'relative' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${searchType}...`}
                    style={{
                      fontFamily: "'Owners Wide', sans-serif", fontSize: '16px', width: '100%',
                      background: 'rgba(0,0,0,0.08)', border: '2px solid #000', borderRadius: '75.641px',
                      padding: '12px 24px', color: '#000', outline: 'none', letterSpacing: '0.5px',
                    }}
                  />
                  {results.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: '10.258px', marginTop: '4px', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 10 }}>
                      {results.map((r) => {
                        const route = searchType === 'team' ? `/team/${r.id}` : searchType === 'clients' ? `/clients/${r.slug ?? r.id}/hub` : `/projects`;
                        return (
                          <button key={r.id} onClick={() => { closeOverlay(); setSearchQuery(''); navigate(route); }}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 24px', fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', color: '#000' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                            {r.code ? `${r.code} — ${r.name}` : r.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Coming soon items
            if (comingSoonItems.has(item)) {
              return (
                <button key={item} onClick={showComingSoon} className="font-kaio uppercase"
                  style={{ fontWeight: 800, fontSize: 'clamp(20px, 3.5vw, 40px)', lineHeight: 1.05, color: '#000000', background: 'none', border: 'none', cursor: 'pointer', transition: `opacity 200ms ${easing}`, opacity: 0.4 }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.4')}>
                  {item}
                </button>
              );
            }

            // Normal navigation items
            return (
              <button key={item} onClick={() => handleSubItemClick(item)} className="font-kaio uppercase"
                style={{ fontWeight: 800, fontSize: 'clamp(20px, 3.5vw, 40px)', lineHeight: 1.05, color: '#000000', background: 'none', border: 'none', cursor: 'pointer', transition: `opacity 200ms ${easing}` }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </NavOverlayContext.Provider>
  );
};

export default NavOverlayProvider;
