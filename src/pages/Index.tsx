import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProfile, UserProfile } from '@/lib/store';
import { getLocalProfile } from '@/lib/localStore';
import Onboarding from '@/components/Onboarding';
import WeeklyDashboard from '@/components/WeeklyDashboard';
import Landing from './Landing';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Authenticated user: fetch from cloud
      fetchProfile(user.id).then((p) => {
        if (p) {
          setProfile(p);
        } else {
          // Check if there's a local profile to show (will be migrated on save)
          const local = getLocalProfile();
          if (local) setProfile(local);
        }
        setLoading(false);
      });
    } else {
      // Anonymous: check local profile
      const local = getLocalProfile();
      if (local) setProfile(local);
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl">🌿</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // No profile at all (not onboarded) and not logged in → landing
  if (!user && !profile) {
    return <Landing />;
  }

  // Has user (logged in) but no profile → onboarding
  if (user && !profile) {
    return <Onboarding onComplete={(p) => setProfile(p)} />;
  }

  // Has profile (local or cloud) → dashboard
  if (profile) {
    return <WeeklyDashboard profile={profile} />;
  }

  return <Landing />;
};

export default Index;
