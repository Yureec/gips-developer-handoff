import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { LearningAdapter, LearningRead } from '../../domain/learning';

// Q1/Q2/Q4/Q8: no authenticated source, mapping, policy or launch target has been supplied.
const adapter: LearningAdapter = {
  read: async () => ({ state: 'unavailable' }),
  resolveLaunchTarget: async () => null,
};
const Context = createContext<{ read: LearningRead; refresh: () => void; adapter: LearningAdapter }>({ read: { state: 'loading' }, refresh: () => {}, adapter });
export function LearningProvider({ children, source = adapter }: { children: ReactNode; source?: LearningAdapter }) {
  const [read, setRead] = useState<LearningRead>({ state: 'loading' });
  const request = useRef(0);
  const refresh = useCallback(() => {
    const id = ++request.current;
    setRead({ state: 'loading' });
    source.read().then(value => { if (id === request.current) setRead(value); }).catch(() => { if (id === request.current) setRead({ state: 'error' }); });
  }, [source]);
  useEffect(() => {
    refresh();
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', visible);
    return () => { ++request.current; window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', visible); };
  }, [refresh]);
  return <Context.Provider value={{ read, refresh, adapter: source }}>{children}</Context.Provider>;
}
export const useLearning = () => useContext(Context);
