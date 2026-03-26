import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../hooks/useTheme';

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
  'Directory': '/dashboard',
  'Profiles': '/dashboard',
  'Activity': '/dashboard',
  'Business Units': '/dashboard',
  'Departments': '/dashboard',
  'Client List': '/clients',
  'Onboarding': '/clients/onboard',
  'Active': '/dashboard',
  'Archived': '/dashboard',
  'Proposals': '/pre-alignment',
  'Values': '/dashboard',
  'Events': '/dashboard',
  'Recognition': '/dashboard',
  'Resources': '/dashboard',
  'Templates': '/dashboard',
  'Integrations': '/dashboard',
  // Client nav
  'Completed': '/dashboard',
  'Pending': '/dashboard',
  'Approved': '/dashboard',
  'Archive': '/dashboard',
  'Milestones': '/dashboard',
  'Schedule': '/dashboard',
  'Pending Review': '/dashboard',
  'History': '/dashboard',
  'Contact': '/dashboard',
  'FAQs': '/dashboard',
  // Vendor nav
  'Upcoming': '/vendors',
  'Upload': '/vendors',
  'Downloads': '/vendors',
  'Calendar': '/dashboard',
  'Overdue': '/vendors',
  'Paid': '/vendors',
  'Submit': '/vendors',
  'Guidelines': '/vendors',
  // C-Suite nav
  'Portfolio': '/dashboard',
  'Metrics': '/dashboard',
  'Reports': '/dashboard',
  'Performance': '/dashboard',
  'Capacity': '/dashboard',
  'Hiring': '/dashboard',
  'Health': '/finance',
  'Revenue': '/finance',
  'Pipeline': '/dashboard',
  'Status': '/dashboard',
  'Risk': '/dashboard',
  'Roadmap': '/dashboard',
  'Costs': '/finance',
  'Forecasts': '/finance',
  'OKRs': '/dashboard',
  'Initiatives': '/dashboard',
  'Board': '/dashboard',
  // Admin nav
  'Users': '/dashboard',
  'Roles': '/dashboard',
  'Settings': '/dashboard',
  'Logs': '/dashboard',
  'Virtual Office': '/device',
  'Avatar Creator': '/device/avatar-creator',
};

/* ------------------------------------------------------------------ */
/*  Theme Toggle Pill                                                  */
/* ------------------------------------------------------------------ */

const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useThemeStore();
  const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

  return (
    <div
      style={{
        display: 'flex',
        border: '1px solid #EAF2D7',
        borderRadius: '75.641px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={theme === 'light' ? toggle : undefined}
        style={{
          padding: '6px 16px',
          fontFamily: "'Owners Wide', sans-serif",
          fontSize: '12.55px',
          letterSpacing: '1.004px',
          textTransform: 'uppercase',
          color: theme === 'dark' ? '#000000' : '#EAF2D7',
          background: theme === 'dark' ? '#D7ABC5' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: `background 200ms ${easing}, color 200ms ${easing}`,
        }}
      >
        Dark
      </button>
      <button
        onClick={theme === 'dark' ? toggle : undefined}
        style={{
          padding: '6px 16px',
          fontFamily: "'Owners Wide', sans-serif",
          fontSize: '12.55px',
          letterSpacing: '1.004px',
          textTransform: 'uppercase',
          color: theme === 'light' ? '#000000' : '#EAF2D7',
          background: theme === 'light' ? '#D7ABC5' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: `background 200ms ${easing}, color 200ms ${easing}`,
        }}
      >
        Light
      </button>
    </div>
  );
};

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
  const issuesInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
        {/* Top-left: Dark/Light toggle */}
        <div className="absolute top-8 left-10">
          <ThemeToggle />
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

        {/* Bottom-left: "Having Issues?" input — Owners Wide */}
        <div className="absolute bottom-8 left-10">
          <input
            ref={issuesInputRef}
            type="text"
            placeholder="Having Issues?"
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '13px',
              letterSpacing: '0.96px',
              background: 'transparent',
              border: '1px solid #EAF2D7',
              borderRadius: '75.641px',
              padding: '10px 20px',
              color: '#EAF2D7',
              outline: 'none',
              minWidth: '220px',
            }}
          />
        </div>
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
        {/* Top-left: Back arrow */}
        <button
          onClick={() => {
            setLayer(1);
            setSelectedCategory(null);
          }}
          className="absolute top-8 left-10 font-kaio"
          style={{ color: '#000000', fontSize: '24px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Back to categories"
        >
          &larr;
        </button>

        {/* Top-right: Close button */}
        <button
          onClick={closeOverlay}
          className="absolute top-8 right-10 font-kaio"
          style={{ color: '#000000', fontSize: '24px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Close navigation"
        >
          &times;
        </button>

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

        {/* Centre: Sub-items */}
        <div className="flex flex-col items-center justify-center h-full gap-4">
          {selectedCategory?.subItems.map((item) => (
            <button
              key={item}
              onClick={() => handleSubItemClick(item)}
              className="font-kaio uppercase"
              style={{
                fontWeight: 800,
                fontSize: 'clamp(20px, 3.5vw, 40px)',
                color: '#000000',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: `opacity 200ms ${easing}`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </NavOverlayContext.Provider>
  );
};

export default NavOverlayProvider;
