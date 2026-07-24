import type { Step } from 'react-joyride';

import type { TourId } from '@/store/useTourStore';

type TFn = (key: string) => string;

function makeStep(
  target: string,
  title: string,
  content: string,
  placement?: Step['placement'],
): Step {
  return { target, title, content, placement: placement ?? 'auto', skipBeacon: true };
}

export function getTourSteps(tourId: TourId, t: TFn): Step[] {
  switch (tourId) {
    case 'home':
      return [
        makeStep('body', t('tours.home.steps.welcome.title'), t('tours.home.steps.welcome.body'), 'center'),
        makeStep('[data-tour="bottom-nav"]', t('tours.home.steps.nav.title'), t('tours.home.steps.nav.body'), 'top'),
        makeStep('body', t('tours.home.steps.checkin.title'), t('tours.home.steps.checkin.body'), 'center'),
        makeStep('body', t('tours.home.steps.ready.title'), t('tours.home.steps.ready.body'), 'center'),
      ];
    case 'checkin':
      return [
        makeStep('[data-tour="checkin-header"]', t('tours.checkin.steps.header.title'), t('tours.checkin.steps.header.body'), 'bottom'),
        makeStep('[data-tour="checkin-form"]', t('tours.checkin.steps.form.title'), t('tours.checkin.steps.form.body'), 'bottom'),
        makeStep('[data-tour="checkin-submit"]', t('tours.checkin.steps.submit.title'), t('tours.checkin.steps.submit.body'), 'top'),
      ];
    case 'guides':
      return [
        makeStep('[data-tour="guides-header"]', t('tours.guides.steps.header.title'), t('tours.guides.steps.header.body'), 'bottom'),
        makeStep('[data-tour="guides-list"]', t('tours.guides.steps.list.title'), t('tours.guides.steps.list.body'), 'bottom'),
        makeStep('[data-tour="vet-button"]', t('tours.guides.steps.vet.title'), t('tours.guides.steps.vet.body'), 'top'),
      ];
    case 'agenda':
      return [
        makeStep('[data-tour="agenda-header"]', t('tours.agenda.steps.header.title'), t('tours.agenda.steps.header.body'), 'bottom'),
        makeStep('[data-tour="agenda-add-btn"]', t('tours.agenda.steps.addBtn.title'), t('tours.agenda.steps.addBtn.body'), 'bottom-end'),
        makeStep('body', t('tours.agenda.steps.colors.title'), t('tours.agenda.steps.colors.body'), 'center'),
      ];
    case 'profile':
      return [
        makeStep('[data-tour="profile-pet-card"]', t('tours.profile.steps.petCard.title'), t('tours.profile.steps.petCard.body'), 'bottom'),
        makeStep('[data-tour="profile-streak"]', t('tours.profile.steps.streak.title'), t('tours.profile.steps.streak.body'), 'bottom'),
        makeStep('[data-tour="profile-weight"]', t('tours.profile.steps.weight.title'), t('tours.profile.steps.weight.body'), 'bottom'),
        makeStep('[data-tour="profile-preferences"]', t('tours.profile.steps.preferences.title'), t('tours.profile.steps.preferences.body'), 'top'),
      ];
    default:
      return [];
  }
}
