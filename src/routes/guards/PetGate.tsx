import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '@/config/routes.config';
import { getPets } from '@/lib/supabase/queries/pets';
import { AuthLoadingScreen } from '@/routes/AuthLoadingScreen';

type PetsGateState = {
  loading: boolean;
  hasPet: boolean;
};

function usePetsGate(): PetsGateState {
  const [state, setState] = useState<PetsGateState>({ loading: true, hasPet: false });

  useEffect(() => {
    let active = true;
    getPets()
      .then((pets) => {
        if (active) setState({ loading: false, hasPet: pets.length > 0 });
      })
      .catch(() => {
        if (active) setState({ loading: false, hasPet: false });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

type PetGateProps = {
  /** 'has-pet' → /onboarding if the user has none yet. 'no-pet' → /home once they already have one. */
  require: 'has-pet' | 'no-pet';
};

/** logado sem pet → /onboarding; logado com pet → /home. Nested under RequireAuth. */
export function PetGate({ require }: PetGateProps) {
  const { loading, hasPet } = usePetsGate();

  if (loading) return <AuthLoadingScreen />;
  if (require === 'has-pet' && !hasPet) return <Navigate to={ROUTES.onboarding} replace />;
  if (require === 'no-pet' && hasPet) return <Navigate to={ROUTES.home} replace />;
  return <Outlet />;
}
