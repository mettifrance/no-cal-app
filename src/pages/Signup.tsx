import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
    } else if (data.session) {
      // Auto-confirmed, go to onboarding
      navigate('/');
    } else {
      setConfirmSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="text-4xl">🌿</div>
          <h1 className="text-3xl font-serif">Create Account</h1>
          <p className="text-muted-foreground">Start building better nutrition awareness.</p>
        </div>

        {confirmSent ? (
          <div className="bg-card rounded-2xl p-6 border text-center space-y-3">
            <div className="text-3xl">✉️</div>
            <p className="text-foreground font-medium">Confirm your email</p>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to <strong>{email}</strong>. Check your inbox to activate your account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 rounded-xl h-12"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 rounded-xl h-12"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full rounded-2xl py-5" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
