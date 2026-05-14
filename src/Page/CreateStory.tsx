import React from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FilePlus, Image as ImageIcon, Tag, Send, AlertCircle, ChevronRight } from "lucide-react";

export default function StoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [image, setImage] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [categories, setCategories] = React.useState<any[]>([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchCats = async () => {
      const res = await axios.get("/api/categories");
      setCategories(res.data);
    };
    
    const fetchStory = async () => {
      if (id) {
        const res = await axios.get(`/api/stories/${id}`);
        setTitle(res.data.title);
        setContent(res.data.content);
        setImage(res.data.image || "");
        setCategoryId(res.data.category.id.toString());
      }
    };

    fetchCats();
    fetchStory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return setError("Please select a category");
    setLoading(true);
    try {
      const data = { title, content, image, categoryId: parseInt(categoryId) };
      if (id) {
        await axios.put(`/api/stories/${id}`, data);
      } else {
        await axios.post("/api/stories", data);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-50 mb-3 flex items-center gap-3">
          {id ? "Refine your echo." : "Voice your narrative."}
        </h1>
        <p className="text-zinc-500 text-sm font-medium">Capture the moment. Make it resonate with the nexus.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-3">
             <AlertCircle className="w-5 h-5" /> <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-600 ml-1">Echo Title</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A resonance that catches attention..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-6 text-xl font-semibold text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-600 ml-1">Collective (Category)</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 appearance-none focus:border-blue-500 focus:outline-none transition-all text-sm font-semibold text-zinc-300"
                required
              >
                <option value="" className="bg-zinc-950">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-zinc-950">{cat.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-zinc-600 rotate-90" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-600 ml-1">Visual Anchor (Image URL)</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://visuals.nexus/echo-01"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 focus:border-blue-500 focus:outline-none transition-all text-sm text-zinc-300 placeholder:text-zinc-700"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-600 ml-1">Narrative Content</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Translate your thoughts into strings. Markdown support active..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-6 px-6 min-h-[400px] text-zinc-300 text-base leading-relaxed focus:border-blue-500 focus:outline-none transition-all resize-none placeholder:text-zinc-700"
            required
          />
        </div>

        <div className="pt-6 flex items-center justify-between border-t border-zinc-900">
           <div className="flex flex-col">
             <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">Protocol</span>
             <p className="text-[10px] text-zinc-700">Auto-sync active • Content must adhere to nexus guidelines.</p>
           </div>
           <button 
            disabled={loading}
            className="px-8 py-3.5 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50 shadow-lg shadow-blue-500/20"
           >
            {loading ? "Syncing..." : id ? "Update Reflection" : "Release Echo"}
            <Send className="w-4 h-4" />
           </button>
        </div>
      </form>
    </div>
  );
}
