import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from '@/routes/AppRoutes';

function DocumentMetaSync() {
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = t('app.name');
  }, [i18n.language, t]);

  return null;
}

function App() {
  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        <DocumentMetaSync />
        <AppRoutes />
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
