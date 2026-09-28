import { Button } from '@alfalab/core-components/button';
import type { ReactNode, MouseEvent } from 'react';

function validOrigin(value: string) {
  try {
    if (!value) return null;
    const u = new URL(value, window.location.href);
    return u.origin === window.location.origin && u.pathname === window.location.pathname && u.searchParams.get('role') === 'mass' && ['home', 'learning'].includes(u.searchParams.get('section') ?? '') ? u.pathname + u.search : null;
  } catch { return null; }
}
export function dailyReturn(fallback: string) {
  try { return validOrigin(sessionStorage.getItem(`daily-origin:${location.pathname}${location.search}`) ?? '') || fallback; } catch { return fallback; }
}
export function DailyLink(props: { href: string; children: ReactNode; size: 32 | 40; view: 'text' | 'secondary'; remember?: boolean }) {
  const { remember, ...buttonProps } = props;
  return <Button {...buttonProps} onClick={(event: MouseEvent<HTMLAnchorElement>) => {
    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && props.href && remember !== false) {
      const current = location.pathname + location.search;
      const target = validOrigin(props.href);
      if (target && target !== current) {
        history.replaceState({ ...history.state, dailyScroll: window.scrollY }, '');
        try { sessionStorage.setItem(`daily-origin:${target}`, current); sessionStorage.setItem(`learning-scroll:${current}`, String(window.scrollY)); } catch { /* navigation works without storage */ }
      }
    }
  }} />;
}
