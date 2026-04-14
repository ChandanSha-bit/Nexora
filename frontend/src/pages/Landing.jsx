import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import AuthLogo from '../components/AuthLogo';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0F1115] text-white px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#161B22]/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <AuthLogo className="h-6 w-6 text-indigo-300" />
            <span className="text-sm font-semibold tracking-tight sm:text-base">Nexora Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm text-gray-200 transition hover:bg-white/10">
              Log in
            </Link>
            <Link to="/register" className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-400">
              Sign up
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" /> Modern secure messaging
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Private conversations in a clean, focused workspace.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-gray-300 sm:text-base">
              Sign up or log in to access your chats and profile. All protected features require authentication for better account safety.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/register" className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400">
                Get started
              </Link>
              <Link to="/login" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10">
                I already have an account
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#161B22] p-4">
              <MessageSquare className="h-5 w-5 text-indigo-300" />
              <h3 className="mt-2 text-sm font-semibold">Real-time chat</h3>
              <p className="mt-1 text-xs text-gray-400">Fast, responsive, and minimal conversation interface.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#161B22] p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <h3 className="mt-2 text-sm font-semibold">Protected access</h3>
              <p className="mt-1 text-xs text-gray-400">Chat and profile are accessible only after authentication.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;
