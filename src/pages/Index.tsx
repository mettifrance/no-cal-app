import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProfile, UserProfile } from '@/lib/store';
import Onboarding from '@/components/Onboarding';
import WeeklyDashboard from '@/components/WeeklyDashboard';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile(user.id).then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, [user, authLoading, navigate]);

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

  if (!profile) {
    return <Onboarding onComplete={(p) => setProfile(p)} />;
  }

  return <WeeklyDashboard profile={profile} />;
};

export default Index;
