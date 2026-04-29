import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, ShieldCheck, Sparkles, Zap, Users,
  Image as ImageIcon, FileText, Bell, Lock, ArrowRight, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLogo from '../components/AuthLogo';
void motion;

const features = [
  {
    icon: <Zap className="h-5 w-5 text-indigo-400" />,
    bg: 'bg-indigo-500/10',
    title: 'Real-time messaging',
    desc: 'Messages delivered instantly via WebSocket. No refresh needed — conversations flow naturally.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    bg: 'bg-emerald-500/10',
    title: 'Secure authentication',
    desc: 'JWT-based auth with bcrypt password hashing. OTP email verification for password resets.',
  },
  {
    icon: <ImageIcon className="h-5 w-5 text-sky-400" />,
    bg: 'bg-sky-500/10',
    title: 'Image sharing',
    desc: 'Send photos directly in chat. Images are stored securely on Cloudinary CDN.',
  },
  {
    icon: <FileText className="h-5 w-5 text-violet-400" />,
    bg: 'bg-violet-500/10',
    title: 'Document sharing',
    desc: 'Share PDFs, Word docs, spreadsheets and more. Opens natively in the browser.',
  },
  {
    icon: <Bell className="h-5 w-5 text-amber-400" />,
    bg: 'bg-amber-500/10',
    title: 'Unread notifications',
    desc: 'Badge counters on the sidebar show unread messages from each conversation.',
  },
  {
    icon: <Users className="h-5 w-5 text-rose-400" />,
    bg: 'bg-rose-500/10',
    title: 'Online presence',
    desc: 'See who is active right now with live green indicators powered by Socket.IO.',
  },
];

const steps = [
  { step: '01', title: 'Create an account', desc: 'Sign up with your name and email in seconds.' },
  { step: '02', title: 'Find someone to chat', desc: 'Browse users in the sidebar and open a conversation.' },
  { step: '03', title: 'Start messaging', desc: 'Send text, images, and documents in real time.' },
];

const techStack = [
  { label: 'React', color: 'text-sky-400' },
  { label: 'Node.js', color: 'text-emerald-400' },
  { label: 'Express', color: 'text-gray-400' },
  { label: 'MongoDB', color: 'text-green-400' },
  { label: 'Socket.IO', color: 'text-indigo-400' },
  { label: 'Cloudinary', color: 'text-blue-400' },
  { label: 'SendGrid', color: 'text-cyan-400' },
  { label: 'JWT', color: 'text-amber-400' },
  { label: 'Tailwind CSS', color: 'text-teal-400' },
  { label: 'Zustand', color: 'text-orange-400' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#080b10] text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080b10]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#0d1117] border border-white/[0.08] flex items-center justify-center">
              <AuthLogo className="h-5 w-5 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight">Nexora</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-1.5 text-[13px] text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]">
              Log in
            </Link>
            <Link to="/register" className="px-4 py-1.5 text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors">
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs text-indigo-300 mb-6">
            <Sparkles className="h-3 w-3" /> Full-stack real-time chat app
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Chat that feels{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              instant
            </span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Nexora is a modern real-time messaging app built with React, Node.js, and Socket.IO.
            Send messages, images, and documents — all in a clean dark interface.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-[14px] font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/[0.1] hover:bg-white/[0.05] text-gray-300 text-[14px] font-medium rounded-xl transition-all">
              Sign in
            </Link>
          </div>
        </motion.div>

        {/* Mock chat preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-14 mx-auto max-w-2xl bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
        >
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-sm font-semibold">A</div>
            <div>
              <p className="text-[13px] font-semibold text-white">Alex</p>
              <p className="text-[11px] text-emerald-400">● Active now</p>
            </div>
          </div>
          {/* Messages */}
          <div className="px-4 py-4 space-y-3">
            <div className="flex justify-start">
              <div className="bg-white/[0.07] text-gray-200 text-[13px] px-3.5 py-2 rounded-2xl rounded-bl-md max-w-[70%]">
                Hey! Did you check the new design? 👀
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-indigo-500 text-white text-[13px] px-3.5 py-2 rounded-2xl rounded-br-md max-w-[70%]">
                Yes! Looks amazing. Love the dark theme 🔥
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white/[0.07] text-gray-200 text-[13px] px-3.5 py-2 rounded-2xl rounded-bl-md max-w-[70%]">
                Built with Socket.IO so it's real-time ⚡
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-indigo-500 text-white text-[13px] px-3.5 py-2 rounded-2xl rounded-br-md max-w-[70%]">
                Ship it! 🚀
              </div>
            </div>
          </div>
          {/* Input */}
          <div className="px-4 py-3 border-t border-white/[0.06]">
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5 text-[13px] text-gray-600">
              Message Alex...
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 border-t border-white/[0.05]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Everything you need to chat</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">A complete messaging experience built from scratch with modern web technologies.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors"
            >
              <div className={`h-10 w-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-[14px] font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-[12.5px] text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 border-t border-white/[0.05]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">How it works</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">Get up and running in under a minute.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative text-center"
            >
              <div className="text-[11px] font-bold text-indigo-500 tracking-widest mb-3">{s.step}</div>
              <div className="h-12 w-12 rounded-2xl bg-[#0d1117] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                <Check className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-[14px] font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-[12.5px] text-gray-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 border-t border-white/[0.05]">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Built with modern tech</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">A full-stack project using industry-standard tools.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {techStack.map((t, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`px-4 py-2 bg-[#0d1117] border border-white/[0.07] rounded-xl text-[13px] font-medium ${t.color}`}
            >
              {t.label}
            </motion.span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-20 border-t border-white/[0.05]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-500 text-[14px] max-w-sm mx-auto leading-relaxed mb-8">
            Create a free account and start messaging in seconds.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-[14px] font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-2.5 border border-white/[0.1] hover:bg-white/[0.04] text-gray-400 hover:text-white text-[14px] font-medium rounded-xl transition-all"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AuthLogo className="h-5 w-5 text-white" />
            <span className="text-[13px] font-semibold text-white">Nexora</span>
          </div>
          <p className="text-[12px] text-gray-600">Built with React · Node.js · Socket.IO · MongoDB</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[12px] text-gray-600 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="text-[12px] text-gray-600 hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
