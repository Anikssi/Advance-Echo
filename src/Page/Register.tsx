import React from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight, Lock, Mail, User } from "lucide-react";

export default function Register() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/register", { name, email, password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-900/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
           <Link to="/" className="inline-flex items-center space-x-2 mb-8">
             <span className="text-3xl font-extrabold tracking-tighter text-blue-500">ECHO</span>
           </Link>
           <h2 className="text-2xl font-bold text-zinc-50 mb-2">Join the nexus.</h2>
           <p className="text-zinc-500 text-sm font-medium">Start sharing your experiences today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-5 shadow-2xl shadow-black/50">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase tracking-wider rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-600 ml-1">Universal ID (Name)</label>
              <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                 <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 text-zinc-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-medium text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-600 ml-1">Identity (Email)</label>
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                 <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 text-zinc-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-medium text-sm"
                  placeholder="name@nexus.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-600 ml-1">Access Key</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                 <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 text-zinc-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-medium text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button className="w-full py-3.5 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center group shadow-lg shadow-blue-500/20">
              CREATE IDENTITY <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-xs text-zinc-500">
          Already registered? <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">SignIn here</Link>
        </p>
      </motion.div>
    </div>
  );
}
