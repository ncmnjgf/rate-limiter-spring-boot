import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const [tokens, setTokens] = useState(20);
  const [allowed, setAllowed] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [reqsPerSec, setReqsPerSec] = useState(0);
  
  const [traffic, setTraffic] = useState(12);
  const [refill, setRefill] = useState(8);
  const [cap, setCap] = useState(20);
  const [paused, setPaused] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  
  const laneRef = useRef<HTMLDivElement>(null);


  const stateRef = useRef({
    tokens: 20,
    cap: 20,
    traffic: 12,
    refill: 8,
    paused: false,
    acc: 0,
    A: 0,
    B: 0,
    secA: 0,
    secB: 0,
    n: 0,
    lastOk: 0,
    lastNo: 0,
    lastLog: 0,
  });

  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sync state refs to state so animation loops can read them
  useEffect(() => {
    stateRef.current.cap = cap;
    stateRef.current.traffic = traffic;
    stateRef.current.refill = refill;
    stateRef.current.paused = paused;
    stateRef.current.tokens = Math.min(stateRef.current.tokens, cap);
    setTokens(Math.floor(stateRef.current.tokens));
  }, [cap, traffic, refill, paused]);

  const fly = (ok: boolean) => {
    if (!laneRef.current) return;
    const s = stateRef.current;
    s.n++;
    const e = document.createElement('div');
    const L = laneRef.current.clientWidth;
    const gx = L * 0.58;
    
    e.className = 'absolute grid place-items-center bg-brand-paper color-brand-ink border-[3px] border-brand-ink rounded-lg font-data font-bold text-[13px] z-[2] w-[84px] h-[44px]';
    e.textContent = `№ ${String(s.n % 1000).padStart(3, '0')}`;
    e.style.top = [10, 66, 122][Math.floor(Math.random() * 3)] + 'px';
    
    // Create 'Denied' stamp element
    const stamp = document.createElement('div');
    stamp.className = `absolute left-[12px] top-[8px] font-heading font-extrabold text-[17px] text-brand-red border-[3px] border-brand-red rounded-[5px] px-[6px] bg-[rgba(255,246,216,0.9)] -rotate-11 opacity-0 ${ok ? 'hidden' : ''}`;
    stamp.textContent = 'Denied';
    e.appendChild(stamp);

    laneRef.current.appendChild(e);

    if (RM) {
      if (!ok) {
        stamp.style.opacity = '1';
        stamp.style.transform = 'scale(1)';
      }
      e.style.left = (ok ? L - 100 : gx - 100) + 'px';
      setTimeout(() => e.remove(), 700);
      return;
    }

    if (ok) {
      e.animate([
        { transform: 'translateX(-90px)' },
        { transform: `translateX(${L + 10}px)` }
      ], { duration: 1900, easing: 'cubic-bezier(.4,0,.6,1)' }).onfinish = () => e.remove();
    } else {
      e.animate([
        { transform: 'translateX(-90px)' },
        { transform: `translateX(${gx - 98}px)` }
      ], { duration: 950, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }).onfinish = () => {
        stamp.animate([
          { opacity: 0, transform: 'scale(2.6)' },
          { opacity: 1, transform: 'scale(1)' }
        ], { duration: 300, easing: 'cubic-bezier(.3,1.6,.5,1)', fill: 'forwards' });

        setTimeout(() => {
          e.animate([
            { transform: `translate(${gx - 98}px,0) rotate(0)`, opacity: 1 },
            { transform: `translate(${gx - 140}px,170px) rotate(-26deg)`, opacity: 0 }
          ], { duration: 650, easing: 'ease-in', fill: 'forwards' }).onfinish = () => e.remove();
        }, 700);
      };
    }
  };

  const req = async () => {
    const s = stateRef.current;
    const now = performance.now();
    
    // Live mode vs Simulation Mode
    // To mix real backend into the simulation: for the burst/demo we can just simulate based on tokens
    // Real backend calls can be hooked in for actual 'Send Request' actions later, but the Gatekeeper page relies heavily on local state for the dashboard preview.
    
    // For pure UI gatekeeper behavior:
    let isAllowed = false;
    if (s.tokens >= 1) {
      s.tokens--;
      s.A++;
      s.secA++;
      isAllowed = true;
      if (now - s.lastOk > 200) {
        s.lastOk = now;
        fly(true);
      }
    } else {
      s.B++;
      s.secB++;
      if (now - s.lastNo > 420) {
        s.lastNo = now;
        fly(false);
      }
    }

    if (now - s.lastLog > 140) {
      s.lastLog = now;
      const routes = ['/v1/search','/v1/orders','/v1/users','/v1/events'];
      const route = routes[Math.floor(Math.random() * routes.length)];
      setLogs((prev) => [{
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString('en-GB'),
        route,
        status: isAllowed ? 200 : 429
      }, ...prev].slice(0, 8));
    }
  };

  const handleBurst = () => {
    for (let i = 0; i < 30; i++) req();
  };

  // Animation Loop
  useLayoutEffect(() => {
    let frameId: number;
    let last = performance.now();
    let sec = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      const s = stateRef.current;

      if (!s.paused) {
        s.tokens = Math.min(s.cap, s.tokens + s.refill * dt);
        s.acc += s.traffic * dt;
        while (s.acc >= 1) {
          s.acc--;
          req();
        }
        
        sec += dt;
        if (sec >= 1) {
          sec -= 1;
          setTokens(Math.floor(s.tokens));
          setAllowed((prev) => prev + s.A);
          setBlocked((prev) => prev + s.B);
          setReqsPerSec(s.secA + s.secB);
          s.A = 0;
          s.B = 0;
          s.secA = 0;
          s.secB = 0;
        }
      }
      
      // Fast UI sync
      setTokens(Math.floor(s.tokens));
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Set up Scroll interactions
  useLayoutEffect(() => {
    const panels = document.querySelectorAll('.rv');
    panels.forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = (i % 3) * 90 + 'ms';
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('opacity-100', 'translate-y-0', 'rotate-0'),
        once: true
      });
    });
  }, []);

  return (
    <main className="w-full relative bg-brand-sun text-brand-ink selection:bg-brand-red/30">
      
      {/* Nav */}
      <nav className="sticky top-0 z-20 flex justify-between items-center py-3 pad-x bg-brand-ink text-brand-paper overflow-hidden">
        <a href="#top" className="font-heading font-extrabold text-2xl text-brand-sun no-underline flex items-center gap-2.5 tracking-tight hover:opacity-90">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#FFC629" strokeWidth="3" strokeLinecap="round">
            <path d="M4 4v18M22 4v18M4 9h18M4 17h18"/>
          </svg>
          Gatekeeper
        </a>
        <div className="flex items-center gap-6 font-bold">
          <a href="#how" className="text-brand-paper hover:text-brand-sun transition-colors hidden md:inline">How it works</a>
          <a href="#booth" className="text-brand-paper hover:text-brand-sun transition-colors hidden md:inline">The booth</a>
          <a href="#receipt" className="text-brand-paper hover:text-brand-sun transition-colors hidden md:inline">Receipt</a>
          <a href="#booth" className="font-body font-bold text-brand-ink bg-brand-sun px-4 py-2 rounded-lg shadow-[4px_4px_0_var(--color-brand-red)] hover:shadow-[6px_6px_0_var(--color-brand-red)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all">
            Open admin
          </a>
        </div>
        <div className="absolute left-0 -bottom-1 h-1.5 w-full bg-brand-red origin-left" style={{ transform: 'scaleX(var(--h, 0))' }} />
      </nav>

      {/* Hero */}
      <section className="pad-x pt-[44px] pb-16 md:py-16 grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-[clamp(32px,5vw,72px)] items-center min-h-[calc(100svh-64px)] overflow-hidden">
        <div className="relative z-10" style={RM ? {} : { transform: 'translateY(calc(var(--h,0) * -80px))' }}>
          <h1>Your API needs a bouncer, not a bottleneck.</h1>
          <p className="my-6 text-xl max-w-[52ch]">
            Gatekeeper hands out a fixed number of tickets and refills them at a steady pace. Spend them fast if you like. When they run out, the request gets a 429 stamped on it.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a href="#booth" className="font-body font-bold text-white bg-brand-red px-5.5 py-3 rounded-lg border-[3px] border-brand-ink shadow-[4px_4px_0_var(--color-brand-ink)] hover:shadow-[6px_6px_0_var(--color-brand-ink)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_var(--color-brand-ink)] active:translate-y-0.5 active:translate-x-0.5 transition-all">
              Open the booth
            </a>
            <a href="#receipt" className="font-body font-bold text-brand-ink bg-brand-paper px-5.5 py-3 rounded-lg border-[3px] border-brand-ink shadow-[4px_4px_0_var(--color-brand-ink)] hover:shadow-[6px_6px_0_var(--color-brand-ink)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_var(--color-brand-ink)] active:translate-y-0.5 active:translate-x-0.5 transition-all">
              Read the receipt
            </a>
          </div>
        </div>

        <div className="relative pt-11 z-10">
          <div className="absolute left-[4%] top-0 -rotate-6 flex flex-col items-end gap-1 font-hand font-semibold text-[28px] leading-none">
            that number is live
            <svg width="70" height="54" viewBox="0 0 70 54" fill="none" stroke="#14110F" strokeWidth="3" strokeLinecap="round" className="rotate-2">
              <path d="M6 6C30 2 56 14 60 44" /><path d="M48 38l12 9 5-14" />
            </svg>
          </div>
          <div className="-rotate-3 drop-shadow-[9px_9px_0_var(--color-brand-ink)]">
            <div className="grid grid-cols-[68%_1fr] bg-brand-paper min-h-[clamp(260px,32vw,340px)] rounded-[14px]" style={{ mask: "radial-gradient(circle 14px at 68% 0, #0000 98%, #000), radial-gradient(circle 14px at 68% 100%, #0000 98%, #000)", maskComposite: "intersect" }}>
              <div className="p-6 flex flex-col justify-between">
                <small className="font-bold tracking-wider text-[15px]">Admit one, for now</small>
                <b className="block font-heading font-extrabold text-[clamp(96px,13vw,178px)] leading-[0.85] text-brand-red tabular-nums">{tokens}</b>
                <small className="font-bold tracking-wider text-[15px]">tickets left in the bin</small>
              </div>
              <div className="border-l-[2.5px] border-dashed border-brand-ink p-4 grid place-items-center text-center font-bold text-[15px] leadingsnug">
                {tokens < 1 ? 'Bin is empty. Stamping 429s.' : tokens < cap * 0.2 ? 'Running low. Refill is losing.' : tokens >= cap ? 'Bin is full.' : 'Serving traffic.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section-pad bg-brand-paper border-y-[3px] border-brand-ink">
        <div className="space-y-0">
          {[
            { phase: "first", title: "A request shows up", desc: "Every call to your API reaches the gate before it reaches your code. Nothing gets served yet." },
            { phase: "then", title: "It hands over a ticket", desc: "If there's a ticket in the bin, the request walks through and the bin loses one. Bursts are fine while the bin lasts." },
            { phase: "finally", title: "No tickets, no entry", desc: "An empty bin means an instant 429. Tickets drip back in at a steady rate, so traffic recovers without anyone touching a thing." },
          ].map((item, i) => (
            <div key={i} className="rv opacity-0 translate-y-6 md:translate-y-12 rotate-1 flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-[clamp(20px,5vw,80px)] items-start border-t-[3px] border-brand-ink py-10 transition-all duration-700" style={{ transitionTimingFunction: 'var(--ease-custom)' }}>
              <div>
                <span className="font-hand text-[28px] text-brand-red block mb-2">{item.phase}</span>
                <h2>{item.title}</h2>
              </div>
              <p className="text-xl pt-1.5">{item.desc}</p>
            </div>
          ))}
          <div className="border-t-[3px] border-brand-ink"></div>
        </div>
      </section>

      {/* Booth */}
      <section id="booth" className="section-pad bg-brand-blue text-white">
        <h2 className="rv opacity-0 translate-y-6 mb-4 transition-all duration-700" style={{ transitionTimingFunction: 'var(--ease-custom)' }}>Run the booth yourself</h2>
        <p className="rv opacity-0 translate-y-6 mb-11 text-xl transition-all duration-700" style={{ transitionTimingFunction: 'var(--ease-custom)' }}>Push traffic above the refill rate and watch the bin empty. Then watch the stamps start.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] gap-[clamp(24px,4vw,56px)] items-start">
          <div className="rv opacity-0 translate-y-6 flex flex-col gap-5.5 p-6 bg-brand-paper text-brand-ink border-[3px] border-brand-ink rounded-[14px] shadow-[7px_7px_0_var(--color-brand-ink)] transition-all duration-700" style={{ transitionTimingFunction: 'var(--ease-custom)' }}>
            <label className="grid gap-1.5 font-bold">
              <span className="flex justify-between gap-3">Incoming traffic <output className="font-data text-brand-red text-[14px]">{traffic} a second</output></span>
              <input type="range" min="1" max="60" value={traffic} onChange={(e)=>setTraffic(+e.target.value)} className="w-full h-7 accent-brand-red cursor-pointer" />
            </label>
            <label className="grid gap-1.5 font-bold">
              <span className="flex justify-between gap-3">Refill rate <output className="font-data text-brand-red text-[14px]">{refill} a second</output></span>
              <input type="range" min="1" max="30" value={refill} onChange={(e)=>setRefill(+e.target.value)} className="w-full h-7 accent-brand-red cursor-pointer" />
            </label>
            <label className="grid gap-1.5 font-bold">
              <span className="flex justify-between gap-3">Bin size <output className="font-data text-brand-red text-[14px]">{cap} tickets</output></span>
              <input type="range" min="5" max="50" value={cap} onChange={(e)=>setCap(+e.target.value)} className="w-full h-7 accent-brand-red cursor-pointer" />
            </label>
            <button onClick={handleBurst} className="font-body font-bold text-white bg-brand-red px-5.5 py-3 rounded-lg border-[3px] border-brand-ink shadow-[4px_4px_0_var(--color-brand-ink)] hover:shadow-[6px_6px_0_var(--color-brand-ink)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_var(--color-brand-ink)] active:translate-y-0.5 active:translate-x-0.5 transition-all">
              Send 30 at once
            </button>
            <button onClick={() => setPaused(!paused)} className="font-body font-bold text-brand-ink bg-brand-paper px-5.5 py-3 rounded-lg border-[3px] border-brand-ink shadow-[4px_4px_0_var(--color-brand-ink)] hover:shadow-[6px_6px_0_var(--color-brand-ink)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_var(--color-brand-ink)] active:translate-y-0.5 active:translate-x-0.5 transition-all">
              {paused ? 'Resume' : 'Pause'}
            </button>
          </div>

          <div className="rv opacity-0 translate-y-6 transition-all duration-700" style={{ transitionTimingFunction: 'var(--ease-custom)' }}>
            <div ref={laneRef} className="relative h-[190px] bg-brand-deep border-[3px] border-brand-ink rounded-[14px] overflow-hidden shadow-[7px_7px_0_var(--color-brand-ink)]" style={{ background: 'var(--color-brand-deep) linear-gradient(rgba(255,255,255,.16) 2px,transparent 2px) 0 24px/100% 56px' }}>
              <div className="absolute left-[58%] inset-y-0 w-[30px] border-x-[3px] border-brand-ink z-[1]" style={{ background: 'repeating-linear-gradient(45deg,var(--color-brand-ink) 0 11px,var(--color-brand-sun) 11px 22px)' }} />
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-5">
              {Array.from({length: cap}).map((_, i) => (
                <i key={i} className={`w-3.5 h-6 border-2 border-white rounded-[3px] transition-all ${i < tokens ? 'bg-brand-sun border-brand-sun scale-y-100 opacity-100' : 'bg-transparent scale-y-50 opacity-45'}`} style={{ transitionDuration: 'var(--duration-slow)', transitionTimingFunction: 'var(--ease-custom)' }} />
              ))}
            </div>
            <div className="mt-2 text-base opacity-90">{Math.floor(tokens)} tickets in the bin</div>
            
            <div className="flex flex-wrap gap-y-3 gap-x-[clamp(24px,5vw,64px)] mt-7 font-bold">
              <div><b className="block font-heading font-extrabold text-[clamp(48px,6vw,88px)] leading-[1] tabular-nums text-brand-mint">{allowed}</b><span className="text-base font-normal">let through</span></div>
              <div><b className="block font-heading font-extrabold text-[clamp(48px,6vw,88px)] leading-[1] tabular-nums text-brand-sun">{blocked}</b><span className="text-base font-normal">turned away</span></div>
              <div><b className="block font-heading font-extrabold text-[clamp(48px,6vw,88px)] leading-[1] tabular-nums">{reqsPerSec}</b><span className="text-base font-normal">requests last second</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Receipt */}
      <section id="receipt" className="section-pad">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(0,440px)] gap-[clamp(24px,5vw,80px)] items-start">
          <div className="rv opacity-0 translate-y-6 transition-all duration-700" style={{ transitionTimingFunction: 'var(--ease-custom)' }}>
            <h2>Every request leaves a receipt</h2>
            <p className="mt-5 text-xl">One line per visitor: when they came, where they were headed, and whether they got in. That's the whole audit trail.</p>
          </div>
          
          <div className="rv opacity-0 translate-y-6 rotate-[1.5deg] drop-shadow-[7px_7px_0_var(--color-brand-ink)] transition-all duration-700" style={{ transitionTimingFunction: 'var(--ease-custom)' }}>
            <div className="bg-white p-6 pb-10 font-data font-normal text-[13px] leading-snug" style={{ mask: "radial-gradient(circle 8px at 50% 100%, #0000 98%, #000) 0 0/20px 100%", WebkitMask: "radial-gradient(circle 8px at 50% 100%, #0000 98%, #000) 0 0/20px 100%" }}>
              <h3 className="m-0 mb-3 text-center border-b-2 border-dashed border-brand-ink pb-3 font-heading font-extrabold text-[20px]">Front door, live</h3>
              <div>
                {logs.map((log) => (
                  <div key={log.id} className={`grid grid-cols-[72px_1fr_auto] gap-2 py-0.5 animate-in fade-in slide-in-from-top-3 duration-500`}>
                    <span>{log.time}</span>
                    <span>{log.route}</span>
                    <b className={log.status === 429 ? 'text-brand-red' : ''}>{log.status}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-brand-ink text-brand-paper py-11 pb-14 pad-x flex justify-between gap-4 flex-wrap items-end">
        <span className="font-hand font-semibold text-[34px] text-brand-sun">made by hand, tested with real traffic</span>
        <span className="font-bold">Gatekeeper simulates everything in your browser.</span>
      </footer>
    </main>
  );
}
