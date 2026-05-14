import React from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  Layers, 
  BarChart3, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Plus, 
  ShieldAlert
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<any>(null);
  const [users, setUsers] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [newCategory, setNewCategory] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, catsRes] = await Promise.all([
        axios.get("/api/admin/stats"),
        axios.get("/api/admin/users"),
        axios.get("/api/categories")
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleBan = async (userId: number) => {
    try {
      await axios.put(`/api/admin/users/${userId}/ban`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await axios.post("/api/categories", { name: newCategory });
      setNewCategory("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (catId: number) => {
    try {
      await axios.delete(`/api/categories/${catId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-zinc-50 tracking-tighter">
             <ShieldAlert className="text-blue-500 w-8 h-8" /> SYSTEM MARSHAL
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1 opacity-70">Nexus Core Control • Authenticated Access Only</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Active Nodes", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
          { label: "Synced Echos", value: stats.totalStories, icon: FileText, color: "text-blue-500" },
          { label: "Data Segments", value: stats.totalCategories, icon: Layers, color: "text-blue-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between shadow-xl shadow-black/20 group hover:border-zinc-700 transition-all">
            <div>
              <p className="text-[10px] uppercase font-black text-zinc-600 mb-1 tracking-widest">{stat.label}</p>
              <p className="text-3xl font-bold text-zinc-50 tracking-tighter">{stat.value.toLocaleString()}</p>
            </div>
            <stat.icon className={`w-12 h-12 ${stat.color} opacity-10 group-hover:opacity-30 transition-opacity`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* User Management */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
             <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2 uppercase tracking-widest">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> Identity Oversight
             </h3>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl shadow-black/20">
             <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-500">
                  <tr>
                    <th className="p-4 font-black uppercase tracking-widest">Identity</th>
                    <th className="p-4 font-black uppercase tracking-widest">Protocol</th>
                    <th className="p-4 font-black uppercase tracking-widest">State</th>
                    <th className="p-4 font-black uppercase tracking-widest text-right">Interrupt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-zinc-400 border border-zinc-700">{u.name[0]}</div>
                          <div>
                            <p className="font-bold text-zinc-100 italic">@{u.name.toLowerCase().replace(/\s/g, '_')}</p>
                            <p className="text-[10px] text-zinc-600 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                         <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${u.role === 'system_marshal' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                           {u.role.split('_').pop()}
                         </span>
                      </td>
                      <td className="p-4">
                         {u.isBanned ? 
                          <span className="text-red-500 flex items-center gap-1 font-bold text-[10px]"><Ban className="w-3 h-3" /> VOIDED</span> : 
                          <span className="text-blue-500 flex items-center gap-1 font-bold text-[10px]"><CheckCircle className="w-3 h-3" /> ACTIVE</span>
                         }
                      </td>
                      <td className="p-4 text-right">
                         {u.id !== user?.id && (
                           <button 
                            onClick={() => handleBan(u.id)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-widest transition-all ${u.isBanned ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-transparent text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30'}`}
                           >
                             {u.isBanned ? "RESTORE" : "INTERRUPT"}
                           </button>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>

        {/* Category Management */}
        <div className="space-y-6">
           <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2 uppercase tracking-widest">
             <div className="w-2 h-2 bg-blue-600 rounded-full" /> Taxonomy Injection
           </h3>
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-8 shadow-xl shadow-black/20">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                 <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Inject new narrative category..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 text-xs focus:border-blue-500 focus:outline-none transition-all placeholder:text-zinc-800 text-zinc-300 font-medium"
                 />
                 <button className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4" />
                 </button>
              </form>

              <div className="grid grid-cols-2 gap-3">
                 {categories.map(cat => (
                   <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg group hover:border-blue-500/30 transition-all">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{cat.name}</span>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 text-zinc-800 hover:text-red-500 transition-all"
                      >
                         <Trash2 className="w-3 h-3" />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
