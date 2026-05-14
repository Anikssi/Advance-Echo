import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Home, 
  LayoutDashboard, 
  FilePlus, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  MessageSquare,
  TrendingUp,
  Search,
  ChevronRight,
  User as UserIcon,
  CircleAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-8 h-16 flex items-center">
      <div className="w-full flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold tracking-tighter text-blue-500">ECHO</span>
        </Link>

        {/* Global Search Mockup from design */}
        <div className="hidden lg:block relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            className="block w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-3 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            placeholder="Search stories or users..."
          />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/create" className="px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 transition-colors">Create Story</Link>
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold">{user.name}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{user.role.replace('system_', '')}</span>
                </div>
                <Link to="/profile" className="w-8 h-8 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center overflow-hidden">
                  <UserIcon className="w-4 h-4 text-zinc-400" />
                </Link>
                <button onClick={() => { logout(); navigate("/"); }} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="px-5 py-2 bg-zinc-50 text-zinc-950 text-sm font-bold rounded-md hover:bg-zinc-200 transition-colors">Join Community</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-neutral-900 border-b border-white/10 p-4 md:hidden flex flex-col space-y-4"
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-white font-medium">Home</Link>
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-white font-medium">Dashboard</Link>
                <Link to="/create" onClick={() => setIsMenuOpen(false)} className="text-orange-500 font-bold">New Story</Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-white font-medium">Profile</Link>
                {user.role === 'system_marshal' && (
                   <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-red-400 font-medium font-bold">Admin Panel</Link>
                )}
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left text-neutral-400 font-medium">Logout</button>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-white font-medium">Login</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-white font-medium">Register</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/trending", icon: TrendingUp, label: "Trending Stories" },
    { to: "/categories", icon: MessageSquare, label: "Explore Categories" },
    { to: "/profile", icon: UserIcon, label: "My Profile", private: true },
  ];

  const adminLinks = [
    { to: "/admin", icon: ShieldCheck, label: "Admin Dashboard" },
    { to: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[240px] fixed left-0 top-16 bottom-0 border-r border-zinc-800 p-6 flex-shrink-0">
      <nav className="flex flex-col gap-2">
        {links.filter(l => !l.private || (l.private && user)).map((link) => (
          <Link 
            key={link.to} 
            to={link.to}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
              location.pathname === link.to ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
          >
            <link.icon className={`w-5 h-5 ${location.pathname === link.to ? 'text-blue-500' : ''}`} />
            <span className="text-sm">{link.label}</span>
          </Link>
        ))}
      </nav>

      {user?.role === 'system_marshal' && (
        <div className="mt-auto space-y-4">
          <p className="text-[10px] uppercase tracking-widest font-black text-zinc-600 ml-3">System Marshal</p>
          <div className="space-y-1">
            {adminLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-all group"
              >
                <link.icon className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

const RightRail = () => {
  const { user } = useAuth();
  return (
    <aside className="hidden xl:flex flex-col w-[280px] fixed right-0 top-16 bottom-0 border-l border-zinc-800 p-6 gap-6 flex-shrink-0">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-zinc-50">Community Analytics</h4>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Total Active Echos</p>
          <p className="text-2xl font-bold">42,891</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Global Participants</p>
          <p className="text-2xl font-bold">12.4k</p>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <h4 className="text-sm font-semibold text-zinc-50 mb-4">Trending Categories</h4>
        <div className="flex flex-wrap gap-2">
          {["Technology", "Humanities", "Space", "Philosophy", "AI"].map(tag => (
            <span key={tag} className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {user?.role === 'system_marshal' && (
        <div className="mt-auto bg-blue-500/5 border border-dashed border-blue-500/20 rounded-xl p-4">
          <h5 className="text-xs font-bold text-blue-400 flex items-center gap-2 mb-1">
            <CircleAlert className="w-3 h-3" /> Marshal Notice
          </h5>
          <p className="text-[11px] text-blue-300/80 leading-relaxed">
            You have 4 pending story reports that require moderation in the Cyberpunk category.
          </p>
        </div>
      )}
    </aside>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <div className="pt-16 flex">
        <Sidebar />
        <main className="flex-1 lg:ml-[240px] xl:mr-[280px] p-8 max-w-4xl mx-auto w-full">
          {children}
        </main>
        <RightRail />
      </div>
    </div>
  );
};
