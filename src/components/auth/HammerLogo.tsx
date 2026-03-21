import { useEffect, useRef } from 'react';

import upSrc      from '../../assets/images/up.svg';
import downSrc    from '../../assets/images/down.svg';
import heart1Src  from '../../assets/images/heart1.svg';
import heart2Src  from '../../assets/images/heart2.svg';

const FILTER = 'drop-shadow(0 0 5px rgba(215,171,197,0.95)) drop-shadow(0 0 12px rgba(215,171,197,0.55)) drop-shadow(0 0 24px rgba(215,171,197,0.25))';

const imgStyle: React.CSSProperties = {
  position:   'absolute',
  top:        0,
  left:       0,
  width:      '100%',
  height:     '100%',
  filter:     FILTER,
  transition: 'opacity 0.04s',
};

export default function HammerLogo({ useHeart = false }: { useHeart?: boolean }) {
  const frame1Ref    = useRef<HTMLImageElement>(null);
  const frame2Ref    = useRef<HTMLImageElement>(null);
  const bubblyCount  = useRef(0);

  useEffect(() => {
    bubblyCount.current = 0;
    let show = true;
    const ms = useHeart ? 500 : 1000;
    const interval = setInterval(() => {
      show = !show;
      if (frame1Ref.current) frame1Ref.current.style.opacity = show ? '1' : '0';
      if (frame2Ref.current) frame2Ref.current.style.opacity = show ? '0' : '1';
      if (useHeart && show && bubblyCount.current < 2) {
        bubblyCount.current += 1;
        import('../../assets/sounds/bubbly.wav').then(m => {
          new Audio(m.default).play().catch(() => {});
        }).catch(() => {});
      }
    }, ms);
    return () => {
      clearInterval(interval);
      bubblyCount.current = 0;
    };
  }, [useHeart]);

  return (
    <>
      <style>{`
        @keyframes hammerFlicker {
          0%,  100% { opacity: 1;    }
          92%        { opacity: 1;    }
          93%        { opacity: 0.6;  }
          94%        { opacity: 1;    }
          97%        { opacity: 0.75; }
          98%        { opacity: 1;    }
        }
      `}</style>

      <div style={{
        position:  'relative',
        width:     '70px',
        height:    '55px',
        animation: 'hammerFlicker 7s infinite',
      }}>
        <img
          ref={frame1Ref}
          src={useHeart ? heart1Src : upSrc}
          alt=""
          draggable={false}
          style={{ ...imgStyle, opacity: 1 }}
        />
        <img
          ref={frame2Ref}
          src={useHeart ? heart2Src : downSrc}
          alt=""
          draggable={false}
          style={{ ...imgStyle, opacity: 0 }}
        />
      </div>
    </>
  );
}
