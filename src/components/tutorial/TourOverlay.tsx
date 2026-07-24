import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { EventData } from 'react-joyride';
import { useTranslation } from 'react-i18next';

import type { TourId } from '@/store/useTourStore';
import { useTourStore } from '@/store/useTourStore';
import { buildTourOptions, buildTourStyles } from './tourStyles';
import { getTourSteps } from './tourSteps';

type TourOverlayProps = {
  tourId: TourId;
};

export function TourOverlay({ tourId }: TourOverlayProps) {
  const { t } = useTranslation('tutorial');
  const loaded = useTourStore((s) => s.loaded);
  const isTourCompleted = useTourStore((s) => s.completedTours.includes(tourId));
  const markCompleted = useTourStore((s) => s.markCompleted);

  const [run, setRun] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!loaded || hasStarted.current || isTourCompleted) return;
    hasStarted.current = true;
    const timer = setTimeout(() => setRun(true), 350);
    return () => clearTimeout(timer);
  }, [loaded, isTourCompleted, tourId]);

  const handleEvent = useCallback(
    (data: EventData) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        setRun(false);
        void markCompleted(tourId);
      }
    },
    [markCompleted, tourId],
  );

  const steps = useMemo(() => getTourSteps(tourId, t), [tourId, t]);
  const styles = useMemo(() => buildTourStyles(), []);
  const options = useMemo(() => buildTourOptions(), []);

  const locale = {
    next: t('buttons.next'),
    back: t('buttons.back'),
    skip: t('buttons.skip'),
    last: t('buttons.finish'),
    close: t('buttons.finish'),
    open: t('buttons.next'),
  };

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      onEvent={handleEvent}
      styles={styles}
      locale={locale}
      options={options}
    />
  );
}
