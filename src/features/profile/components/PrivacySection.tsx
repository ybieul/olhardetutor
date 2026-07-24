import { Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import type { ProfileData } from '../hooks/useProfileData';

type PrivacySectionProps = {
  data: ProfileData;
  onExportPdf: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
};

export function PrivacySection({ onExportPdf, onDeleteAccount }: PrivacySectionProps) {
  const { t } = useTranslation('profile');
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await onExportPdf();
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDeleteAccount();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card padding="md" shadow="sm">
        <div className="flex flex-col gap-16">
          <p className="font-semibold text-foreground">{t('privacy.title')}</p>

          <div className="flex flex-col gap-4">
            <Button
              variant="secondary"
              icon={Download}
              loading={exporting}
              onClick={() => void handleExport()}
              fullWidth
            >
              {exporting ? t('privacy.exportLoading') : t('privacy.export')}
            </Button>
            <p className="text-xs text-neutral-400">{t('privacy.exportHint')}</p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
              fullWidth
            >
              {t('privacy.deleteAccount')}
            </Button>
            <p className="text-xs text-neutral-400">{t('privacy.deleteHint')}</p>
          </div>
        </div>
      </Card>

      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('privacy.confirmDelete')}
        closeLabel={t('privacy.close')}
      >
        <div className="flex flex-col gap-16">
          <p className="text-sm text-neutral-600">{t('privacy.confirmDeleteMessage')}</p>
          <div className="flex flex-col gap-8 pt-8">
            <Button variant="danger" fullWidth loading={deleting} onClick={() => void handleDelete()}>
              {t('privacy.confirmButton')}
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setShowDeleteConfirm(false)}>
              {t('privacy.cancelButton')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
