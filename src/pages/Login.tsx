import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [magicSent, setMagicSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      navigate('/');
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setMagicSent(true);
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
          <h1 className="text-3xl font-serif">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue your journey.</p>
        </div>

        {magicSent ? (
          <div className="bg-card rounded-2xl p-6 border text-center space-y-3">
            <div className="text-3xl">✉️</div>
            <p className="text-foreground font-medium">Check your email</p>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
            <Button variant="outline" className="rounded-xl" onClick={() => setMagicSent(false)}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
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

              {mode === 'password' && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 rounded-xl h-12"
                    required
                  />
                </div>
              )}

              <Button type="submit" size="lg" className="w-full rounded-2xl py-5" disabled={loading}>
                {loading ? 'Signing in...' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
                className="text-sm text-muted-foreground underline"
              >
                {mode === 'password' ? 'Sign in with magic link instead' : 'Sign in with password instead'}
              </button>
            </div>
          </>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary underline font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
