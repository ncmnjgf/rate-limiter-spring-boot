import { useEffect } from 'react';
import Lenis from 'lenis';
import Landing from './features/landing/Landing';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="min-h-screen font-body bg-brand-navy text-white selection:bg-brand-cyan/30">
      <Landing />
    </div>
  );
}

export default App;
