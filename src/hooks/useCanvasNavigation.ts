import { useEffect, useRef, useState } from 'react';

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

export function useCanvasNavigation() {
  const [scale,      setScale]      = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isPanning,  setIsPanning]  = useState(false);

  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  // Keep live refs so event handlers always see current values
  const scaleRef      = useRef(scale);
  const translateXRef = useRef(translateX);
  const translateYRef = useRef(translateY);
  const isPanningRef  = useRef(isPanning);

  useEffect(() => { scaleRef.current      = scale;      }, [scale]);
  useEffect(() => { translateXRef.current = translateX; }, [translateX]);
  useEffect(() => { translateYRef.current = translateY; }, [translateY]);
  useEffect(() => { isPanningRef.current  = isPanning;  }, [isPanning]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta    = e.deltaY * -0.001;
      const newScale = clamp(scaleRef.current + delta * scaleRef.current, 0.25, 3);
      setScale(newScale);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
      panStart.current = {
        x:  e.clientX,
        y:  e.clientY,
        tx: translateXRef.current,
        ty: translateYRef.current,
      };
      setIsPanning(true);
      document.body.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      setTranslateX(panStart.current.tx + (e.clientX - panStart.current.x));
      setTranslateY(panStart.current.ty + (e.clientY - panStart.current.y));
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 1 && !isPanningRef.current) return;
      setIsPanning(false);
      document.body.style.cursor = 'default';
    };

    const onMouseLeave = () => {
      if (!isPanningRef.current) return;
      setIsPanning(false);
      document.body.style.cursor = 'default';
    };

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('mousedown',  onMouseDown);
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseup',    onMouseUp);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('mousedown',  onMouseDown);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseup',    onMouseUp);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    transform:       `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    transformOrigin: 'center center',
    transition:      isPanning ? 'none' : 'transform 0.05s ease-out',
    willChange:      'transform',
  };

  return { scale, translateX, translateY, containerStyle };
}
