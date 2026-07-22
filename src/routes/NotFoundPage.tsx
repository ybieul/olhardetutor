import { TriangleAlert } from 'lucide-react';

import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export function NotFoundPage() {
  return <PlaceholderPage icon={TriangleAlert} titleKey="placeholder.notFound" />;
}
