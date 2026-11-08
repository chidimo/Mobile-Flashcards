import { useEffect, useRef, useState } from "react";

const secondsLeft = (endsAt: number) =>
  Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));

/** Seconds until `endsAt` (a timestamp), or null without one. Calls `onExpire` once when it reaches 0. */
export const useCountdown = (endsAt: number | null, onExpire: () => void) => {
  const [remaining, setRemaining] = useState<number | null>(
    endsAt === null ? null : secondsLeft(endsAt),
  );
  const expire = useRef(onExpire);
  expire.current = onExpire;

  useEffect(() => {
    if (endsAt === null) {
      setRemaining(null);
      return;
    }
    let expired = false;
    const tick = () => {
      const left = secondsLeft(endsAt);
      setRemaining(left);
      if (left === 0 && !expired) {
        expired = true;
        expire.current();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsAt]);

  return remaining;
};
