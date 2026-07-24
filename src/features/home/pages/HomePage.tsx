import { Home } from 'lucide-react';

import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { TourOverlay } from '@/components/tutorial/TourOverlay';

export function HomePage() {
  return (
    <>
      <TourOverlay tourId="home" />
      <PlaceholderPage icon={Home} titleKey="nav.home" />
    </>
  );
}
