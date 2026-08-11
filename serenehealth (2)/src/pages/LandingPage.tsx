import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { ArrowRight, UserCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAppContext } from '@/context/AppContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { login, signup, continueAsGuest } = useAppContext();

  const [mode, setMode] = useState<'initial' | 'login' | 'signup'>('initial');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (e) {
      alert("Login failed");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(name || "User", email, password);
      navigate('/dashboard');
    } catch (e) {
      alert("Signup failed");
    }
  };

  const handleGuest = async () => {
    continueAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF7] via-[#EAE4F8]/30 to-[#DDEBF7]/40 flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* Decorative blobs */}
      <motion.div 
        className="absolute top-10 right-[10%] w-[400px] h-[400px] bg-pastel-lavender/50 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 left-[10%] w-[500px] h-[500px] bg-pastel-mint/40 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="max-w-3xl w-full text-center relative z-10 mt-[-10vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-black/5 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-pastel-mint shadow-[0_0_8px_rgba(221,242,232,0.8)]" />
            <span className="text-sm font-medium tracking-tight">Introducing SereneHealth</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-primary leading-[1.1] mb-6">
            Your health history, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
              finally in one place.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Securely store your medical records, understand your reports, and track your health journey with AI-powered insights.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              {mode === 'initial' && (
                <motion.div 
                  key="initial"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="w-full flex flex-col gap-4"
                >
                  <Button size="lg" className="w-full gap-2 shadow-lg py-6 text-lg" onClick={() => setMode('login')}>
                    <UserCircle className="w-5 h-5" />
                    Log In
                  </Button>
                  <Button size="lg" variant="secondary" className="w-full gap-2 bg-white/60 hover:bg-white border border-black/[0.03] py-6 text-lg" onClick={() => setMode('signup')}>
                    Sign Up
                  </Button>
                  
                  <div className="w-full relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/10" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-transparent text-text-secondary">or</span></div>
                  </div>
                  
                  <button 
                    onClick={handleGuest}
                    className="text-text-secondary hover:text-text-primary font-medium flex items-center gap-2 group transition-colors mx-auto"
                  >
                    Continue as Guest
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <div className="text-sm text-text-secondary mt-2 p-4 bg-white/40 rounded-xl border border-black/5 text-left">
                    <span className="font-semibold text-text-primary">Guest Mode:</span>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>Explore the dashboard and sample data</li>
                      <li>View the AI analysis interface</li>
                      <li><span className="text-pastel-coral font-medium">Cannot</span> upload or save records</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {mode === 'login' && (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="w-full bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-black/5 shadow-xl text-left"
                >
                  <button onClick={() => setMode('initial')} className="mb-4 text-text-secondary hover:text-text-primary flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Welcome back</h2>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Email or Phone</label>
                      <input type="text" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-xl border border-black/10 bg-white" placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                      <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl border border-black/10 bg-white" placeholder="••••••••" />
                    </div>
                    <Button type="submit" className="w-full py-6 text-lg mt-2">Log In</Button>
                  </form>
                </motion.div>
              )}

              {mode === 'signup' && (
                <motion.div 
                  key="signup"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="w-full bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-black/5 shadow-xl text-left"
                >
                  <button onClick={() => setMode('initial')} className="mb-4 text-text-secondary hover:text-text-primary flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Create Account</h2>
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl border border-black/10 bg-white" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Email or Phone</label>
                      <input type="text" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-xl border border-black/10 bg-white" placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                      <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl border border-black/10 bg-white" placeholder="••••••••" />
                    </div>
                    <Button type="submit" className="w-full py-6 text-lg mt-2">Sign Up</Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      
      {/* Abstract medical UI illustration */}
      <motion.div 
        className="absolute bottom-0 w-full max-w-5xl h-[30vh] md:h-[40vh] bg-gradient-to-t from-white/80 to-transparent flex items-end justify-center px-4"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-full h-full max-h-[300px] bg-white rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.03)] border-t border-x border-black/[0.03] p-8 flex gap-6 overflow-hidden relative">
          {/* Mock UI elements */}
          <div className="w-1/3 h-full flex flex-col gap-4">
            <div className="w-full h-8 bg-pastel-bg rounded-lg animate-pulse opacity-50" />
            <div className="w-3/4 h-6 bg-pastel-lavender rounded-lg animate-pulse opacity-50" />
            <div className="w-full flex-1 bg-pastel-mint/30 rounded-2xl border border-black/[0.02]" />
          </div>
          <div className="flex-1 h-full flex flex-col gap-4">
             <div className="w-1/2 h-10 bg-pastel-blue/30 rounded-xl" />
             <div className="w-full flex-1 bg-pastel-bg rounded-2xl relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-pastel-peach/20 to-transparent" />
             </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
