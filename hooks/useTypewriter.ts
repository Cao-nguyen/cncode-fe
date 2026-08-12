import { useEffect, useRef, useState } from 'react';

interface UseTypewriterOptions {
  content: string;
  enabled: boolean;
  charsPerSecond?: number;
  onComplete?: () => void;
  onTick?: () => void;
}

export function useTypewriter({
  content,
  enabled,
  charsPerSecond = 70,
  onComplete,
  onTick,
}: UseTypewriterOptions) {
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  onCompleteRef.current = onComplete;
  onTickRef.current = onTick;

  useEffect(() => {
    if (!enabled || !content) {
      setDisplayed('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayed('');
    startRef.current = performance.now();

    const speed = Math.min(180, charsPerSecond + content.length / 40);

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      const nextLen = Math.min(content.length, Math.floor(elapsed * speed));

      setDisplayed(content.slice(0, nextLen));
      onTickRef.current?.();

      if (nextLen < content.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIsTyping(false);
        onCompleteRef.current?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [content, enabled, charsPerSecond]);

  return { displayed, isTyping };
}
