import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  MessageCircle, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter,
  Flame,
  Clock,
  Sparkles
} from "lucide-react";

interface Story {
  id: number;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
  user: { name: string };
  category: { id: number; name: string };
  upvotes: number;
  downvotes: number;
  commentCount: number;
}

const Home = () => {
  const [stories, setStories] = React.useState<Story[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({ categoryId: "", search: "", dateRange: "all" });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [storiesRes, catsRes] = await Promise.all([
          axios.get(`/api/stories?categoryId=${filter.categoryId}&search=${filter.search}&dateRange=${filter.dateRange}`),
          axios.get("/api/categories")
        ]);
        setStories(storiesRes.data);
        setCategories(catsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-900 rounded-2xl p-10 flex flex-col justify-center overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full" />
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Echo your story.</h1>
          <p className="text-blue-100 text-lg opacity-90 mb-6">Share experiences and connect with the community.</p>
          <Link to="/create" className="inline-flex px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all border border-blue-400/30">
            Create New Story
          </Link>
        </motion.div>
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-3 border-b border-zinc-800 sticky top-16 z-40 bg-zinc-950/90 backdrop-blur-sm">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
          <button 
            onClick={() => setFilter({ ...filter, categoryId: "" })}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter.categoryId === "" ? 'bg-blue-500 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'}`}
          >
             All Echos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setFilter({ ...filter, categoryId: cat.id })}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${Number(filter.categoryId) === cat.id ? 'bg-blue-500 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setFilter({ ...filter, dateRange: range.id })}
              className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter.dateRange === range.id
                  ? 'bg-zinc-800 text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stories.length > 0 ? (
          stories.map((story, i) => (
            <motion.div 
              key={story.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all shadow-xl shadow-black/20"
            >
              <div className="flex gap-6">
                {/* Vote Column */}
                <div className="hidden sm:flex flex-col items-center gap-1 w-10">
                   <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-bottom-[8px] border-b-blue-500 cursor-pointer hover:border-b-white transition-colors" />
                   <span className="text-sm font-bold text-zinc-100 my-1">{story.upvotes - story.downvotes}</span>
                   <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-top-[8px] border-t-zinc-500 cursor-pointer hover:border-t-blue-500 transition-colors" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/10">
                        {story.category.name}
                      </span>
                      <span className="text-zinc-500 text-xs font-medium">
                        Posted by <span className="text-zinc-300">@{story.user.name.toLowerCase().replace(/\s/g, '_')}</span> • {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link to={`/story/${story.id}`}>
                    <h2 className="text-xl font-semibold group-hover:text-blue-400 transition-colors leading-tight mb-2">
                       {story.title}
                    </h2>
                    <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed font-normal">
                      {story.content}
                    </p>
                  </Link>

                  {story.image && (
                    <div className="rounded-lg overflow-hidden h-40 border border-zinc-800 mt-2 bg-zinc-950">
                       <img src={story.image} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 grayscale-[20%] group-hover:grayscale-0" referrerPolicy="no-referrer" />
                    </div>
                  )}

                  <div className="flex items-center space-x-6 pt-3 border-t border-zinc-800/50">
                    <Link to={`/story/${story.id}`} className="flex items-center space-x-2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-semibold">
                      <MessageCircle className="w-4 h-4" />
                      <span>{story.commentCount} Comments</span>
                    </Link>
                    <button className="flex items-center space-x-2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-semibold">
                      <span>🔖 Save Story</span>
                    </button>
                    <button className="flex items-center space-x-2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-semibold">
                      <span>📢 Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-sm font-medium">The echoes are silent here. Try another category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
