import { useEffect } from 'react';

import { useTourStore } from '@/store/useTourStore';

export function AppTourInit() {
  const load = useTourStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  return null;
}
