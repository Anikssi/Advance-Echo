import React from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  ChevronLeft,
  MoreVertical,
  Trash2,
  Edit,
  Send
} from "lucide-react";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: { id: number; name: string };
}

interface Story {
  id: number;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
  user: { id: number; name: string };
  category: { id: number; name: string };
  comments: Comment[];
  votes: any[];
}

export default function StoryDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [story, setStory] = React.useState<Story | null>(null);
  const [comment, setComment] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [voting, setVoting] = React.useState(false);

  const fetchStory = async () => {
    try {
      const res = await axios.get(`/api/stories/${id}`);
      setStory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStory();
  }, [id]);

  const handleVote = async (type: "UPVOTE" | "DOWNVOTE") => {
    if (!user) return navigate("/login");
    setVoting(true);
    try {
      await axios.post(`/api/stories/${id}/vote`, { type });
      await fetchStory();
    } catch (err) {
      console.error(err);
    } finally {
      setVoting(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!comment.trim()) return;
    try {
      await axios.post(`/api/stories/${id}/comments`, { content: comment });
      setComment("");
      await fetchStory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      await axios.delete(`/api/stories/${id}`);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!story) return <div className="text-center py-20">Story not found.</div>;

  const upvotes = story.votes.filter(v => v.type === 'UPVOTE').length;
  const downvotes = story.votes.filter(v => v.type === 'DOWNVOTE').length;
  const userVote = story.votes.find(v => v.user.id === user?.id)?.type;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors mb-8 group text-xs font-bold uppercase tracking-widest">
         <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to nexus
      </button>

      <div className="flex gap-10">
         {/* Vertical Vote Control */}
         <div className="hidden sm:flex flex-col items-center gap-1 w-10 sticky top-24 h-fit">
            <div 
              onClick={() => handleVote('UPVOTE')}
              className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-bottom-[14px] cursor-pointer transition-all ${userVote === 'UPVOTE' ? 'border-b-blue-500' : 'border-b-zinc-700 hover:border-b-blue-400'}`} 
            />
            <span className="text-lg font-bold text-zinc-50 my-2">{upvotes - downvotes}</span>
            <div 
              onClick={() => handleVote('DOWNVOTE')}
              className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-top-[14px] cursor-pointer transition-all ${userVote === 'DOWNVOTE' ? 'border-t-red-500' : 'border-t-zinc-700 hover:border-t-blue-400'}`} 
            />
         </div>

         <article className="flex-1 space-y-8">
            <header className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center font-bold text-zinc-200">
                    {story.user.name[0]}
                  </div>
                  <div>
                    <h4 className="text-zinc-50 font-bold text-sm">@{story.user.name.toLowerCase().replace(/\s/g, '_')}</h4>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black leading-none mt-0.5">{new Date(story.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {(user?.id === story.user.id || user?.role === 'system_marshal') && (
                  <div className="flex items-center space-x-2">
                     <Link to={`/edit/${story.id}`} className="p-2.5 text-zinc-500 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 rounded-lg"><Edit className="w-4 h-4" /></Link>
                     <button onClick={handleDelete} className="p-2.5 text-zinc-500 hover:text-red-500 transition-colors bg-zinc-900 border border-zinc-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <span className="inline-block px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-500/20">
                   {story.category.name}
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter text-zinc-50">{story.title}</h1>
              </div>
            </header>

            {story.image && (
              <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                 <img src={story.image} alt={story.title} className="w-full object-cover max-h-[600px] opacity-90" referrerPolicy="no-referrer" />
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-zinc-400 whitespace-pre-wrap font-normal">
                {story.content}
              </p>
            </div>

            {/* Comment Section */}
            <section className="pt-12 border-t border-zinc-900 space-y-10">
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
                   Discussion <span className="text-zinc-600 font-medium">({story.comments.length})</span>
                 </h3>
               </div>

               {user && (
                 <form onSubmit={handleComment} className="flex gap-4 items-start bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl shadow-black/20">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-zinc-400 border border-zinc-700">{user.name[0]}</div>
                    <div className="flex-1 relative">
                       <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Join the collective discussion..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 text-sm focus:outline-none focus:border-blue-500 min-h-[120px] placeholder:text-zinc-700"
                       />
                       <button className="absolute bottom-4 right-4 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-xs">
                         Post Comment
                       </button>
                    </div>
                 </form>
               )}

               <div className="space-y-6">
                 {story.comments.length > 0 ? story.comments.map(c => (
                   <div key={c.id} className="flex gap-4">
                      <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-zinc-500">{c.user.name[0]}</div>
                      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm shadow-black/10">
                         <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-bold text-zinc-100">@{c.user.name.toLowerCase().replace(/\s/g, '_')}</h5>
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(c.createdAt).toLocaleString()}</span>
                         </div>
                         <p className="text-sm text-zinc-400 leading-relaxed font-normal">{c.content}</p>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
                     <p className="text-zinc-600 text-sm font-medium">Be the first to echo in this discussion.</p>
                   </div>
                 )}
               </div>
            </section>
         </article>
      </div>
    </div>
  );
}
