import React from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  MessageCircle, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2,
  TrendingUp,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/profile/${user?.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this story?")) return;
    try {
      await axios.delete(`/api/stories/${id}`);
      setProfile({ ...profile, stories: profile.stories.filter((s: any) => s.id !== id) });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-900">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-50">{user?.name}</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Participant since {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center space-x-8 px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl shadow-black/20">
           <div className="text-center">
              <p className="text-xl font-bold text-zinc-50">{profile.stories.length}</p>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Echos</p>
           </div>
           <div className="w-px h-6 bg-zinc-800" />
           <div className="text-center">
              <p className="text-xl font-bold text-zinc-50">1,204</p>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Influence</p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
             Personal Echos <span className="text-zinc-600 font-medium">({profile.stories.length})</span>
           </h2>
           <Link to="/create" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">Release New Echo</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.stories.length > 0 ? profile.stories.map((story: any) => (
            <div key={story.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-lg shadow-black/10">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded border border-blue-500/10">
                    {story.category.name}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Link to={`/edit/${story.id}`} className="p-2 text-zinc-500 hover:text-white transition-colors bg-zinc-950 border border-zinc-800 rounded-md"><Edit3 className="w-3.5 h-3.5" /></Link>
                    <button onClick={() => handleDelete(story.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors bg-zinc-950 border border-zinc-800 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <Link to={`/story/${story.id}`}>
                  <h3 className="text-lg font-bold mb-2 text-zinc-100 group-hover:text-blue-400 transition-colors">{story.title}</h3>
                  <p className="text-zinc-500 text-sm line-clamp-2 mb-4 leading-relaxed font-normal">{story.content}</p>
                </Link>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex items-center space-x-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(story.createdAt).toLocaleDateString()}</span>
                </div>
                <Link to={`/story/${story.id}`} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors border border-zinc-700">Open Node</Link>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl text-center">
              <p className="text-zinc-600 text-sm mb-6 font-medium">The silence is profound. Start your first echo.</p>
              <Link to="/create" className="px-8 py-3 bg-blue-500 text-white font-bold rounded-lg text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20">Initialize Narrative</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
