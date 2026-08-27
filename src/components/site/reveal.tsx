import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "left" | "right" | "scale" | "fade";

const variantClasses: Record<RevealVariant, { hidden: string; visible: string }> = {
  up: { hidden: "opacity-0 translate-y-10", visible: "opacity-100 translate-y-0" },
  left: { hidden: "opacity-0 -translate-x-10", visible: "opacity-100 translate-x-0" },
  right: { hidden: "opacity-0 translate-x-10", visible: "opacity-100 translate-x-0" },
  scale: { hidden: "opacity-0 scale-90", visible: "opacity-100 scale-100" },
  fade: { hidden: "opacity-0", visible: "opacity-100" },
};

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = 600,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = variantClasses[variant];

  return (
    <Tag
      ref={ref as Ref<never>}
      className={cn(
        "transition-[opacity,transform] ease-out will-change-transform",
        visible ? classes.visible : classes.hidden,
        className,
      )}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function useParallax<T extends HTMLElement = HTMLElement>(factor = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;
    function update() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offset = rect.top * factor;
      el.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`;
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [factor]);

  return ref;
}

export function CountUp({
  value,
  suffix = "",
  duration = 1200,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let frame: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
