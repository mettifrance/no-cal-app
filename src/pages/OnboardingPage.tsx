import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/lib/store';
import Onboarding from '@/components/Onboarding';

export default function OnboardingPage() {
  const navigate = useNavigate();

  function handleComplete(profile: UserProfile) {
    // After onboarding, go to main dashboard
    navigate('/');
  }

  return <Onboarding onComplete={handleComplete} />;
}
