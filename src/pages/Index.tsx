import { useState, useEffect } from 'react';
import { getProfile, clearProfile, UserProfile } from '@/lib/store';
import Onboarding from '@/components/Onboarding';
import WeeklyDashboard from '@/components/WeeklyDashboard';

const Index = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProfile(getProfile());
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!profile) {
    return <Onboarding onComplete={(p) => setProfile(p)} />;
  }

  return (
    <WeeklyDashboard
      profile={profile}
      onReset={() => {
        clearProfile();
        setProfile(null);
      }}
    />
  );
};

export default Index;
