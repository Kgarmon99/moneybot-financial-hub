import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Star, ExternalLink, X, Heart, ChevronRight, TrendingUp, Zap, Target, Award } from 'lucide-react';
import { resources, categoryLabels } from './data/resources';
import type { Resource, ResourceCategory, ResourceSubmission } from './types/resource';

const categories: { id: ResourceCategory; label: string; emoji: string; color: string }[] = [
  { id: 'calculator', label: 'Calculators', emoji: '🧮', color: 'from-emerald-400 to-emerald-600' },
  { id: 'tool', label: 'Tools', emoji: '🛠️', color: 'from-blue-400 to-blue-600' },
  { id: 'resource', label: 'Learn', emoji: '📚', color: 'from-violet-400 to-violet-600' },
  { id: 'podcast', label: 'Podcasts', emoji: '🎧', color: 'from-orange-400 to-orange-600' },
  { id: 'book', label: 'Books', emoji: '📖', color: 'from-pink-400 to-pink-600' },
  { id: 'course', label: 'Courses', emoji: '🎓', color: 'from-cyan-400 to-cyan-600' },
];

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// Particle effect component
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }
    
    let animationId: number;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 230, 118, ${p.alpha})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    }
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// MoneyBot Mascot with animations
function MoneyBotMascot({ message, mood = 'happy' }: { message?: string; mood?: 'happy' | 'excited' | 'thinking' }) {
  const moodEmojis = { happy: '🤖', excited: '✨', thinking: '🤔' };
  return (
    <div className="flex items-start gap-4">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-slow">
          <span className="text-3xl">{moodEmojis[mood]}</span>
        </div>
        <div className="absolute -inset-2 bg-emerald-500 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-emerald-300 rounded-full"></div>
        </div>
      </div>
      {message && (
        <div className="relative">
          <div className="bg-slate-800/90 backdrop-blur border border-emerald-500/30 rounded-2xl rounded-tl-sm px-5 py-4 max-w-sm shadow-2xl">
            <p className="text-sm text-slate-100 leading-relaxed">{message}</p>
          </div>
          <div className="absolute -bottom-2 left-4 w-4 h-4 bg-slate-800/90 border-r border-b border-emerald-500/30 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

// Stat Card
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const animatedValue = useAnimatedCounter(value);
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-4 hover:border-emerald-500/50 transition-all group">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{animatedValue.toLocaleString()}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

// Achievement Badge
function AchievementBadge({ icon, label, unlocked }: { icon: React.ReactNode; label: string; unlocked: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition ${
      unlocked 
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20' 
        : 'bg-slate-800 text-slate-500 border border-slate-700'
    }`}>
      {icon}
      {label}
    </div>
  );
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('moneybot-favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [view, setView] = useState<'home' | 'category' | 'favorites'>('home');
  const [mascotMessage, setMascotMessage] = useState('Welcome to MoneyBot Hub! 🚀 I\'ve curated the best financial resources just for you.');
  const [mascotMood, setMascotMood] = useState<'happy' | 'excited' | 'thinking'>('excited');
  const [streak, setStreak] = useState(1);

  const [submission, setSubmission] = useState<Partial<ResourceSubmission>>({
    category: 'resource',
    level: 'beginner',
    free: true,
  });

  useEffect(() => {
    localStorage.setItem('moneybot-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Achievement calculation
  const achievements = useMemo(() => ({
    explorer: favorites.size >= 5,
    collector: favorites.size >= 10,
    scholar: resources.filter(r => ['book', 'course'].includes(r.category) && favorites.has(r.id)).length >= 3,
    listener: resources.filter(r => r.category === 'podcast' && favorites.has(r.id)).length >= 2,
  }), [favorites]);

  const achievementCount = Object.values(achievements).filter(Boolean).length;

  useEffect(() => {
    if (view === 'favorites') {
      setMascotMood('happy');
      setMascotMessage(favorites.size === 0 ? 'Start saving your favorite resources! Click the 💚 on any card.' : `Nice collection! You have ${favorites.size} favorites ⭐`);
    } else if (selectedCategory) {
      setMascotMood('thinking');
      setMascotMessage(`Browsing ${categoryLabels[selectedCategory]}... Found some gems for you! 💎`);
    } else if (searchQuery) {
      setMascotMood('thinking');
      setMascotMessage(`Searching for "${searchQuery}"... 🔍`);
    } else {
      setMascotMood('excited');
      setMascotMessage('Welcome to MoneyBot Hub! 🚀 I\'ve curated the best financial resources just for you.');
    }
  }, [view, selectedCategory, searchQuery, favorites.size]);

  const featuredResources = useMemo(() => resources.filter(r => r.featured).slice(0, 4), []);
  const trendingResources = useMemo(() => [...resources].sort((a, b) => b.tags.length - a.tags.length).slice(0, 4), []);
  
  const filteredResources = useMemo(() => {
    let filtered = resources;
    if (selectedCategory) filtered = filtered.filter(r => r.category === selectedCategory);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query));
    }
    if (view === 'favorites') filtered = filtered.filter(r => favorites.has(r.id));
    return filtered;
  }, [selectedCategory, searchQuery, view, favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setMascotMessage('Removed from collection 💔');
      } else {
        next.add(id);
        setMascotMessage('Added to your collection! 💚');
        setStreak(s => s + 1);
      }
      return next;
    });
  };

  const handleCategoryClick = (cat: ResourceCategory) => {
    setSelectedCategory(cat);
    setView('category');
    setSearchQuery('');
  };

  const goHome = () => {
    setView('home');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMascotMessage('Thanks for contributing! 🎉 You\'re helping others learn!');
    setShowSubmitForm(false);
    setSubmission({ category: 'resource', level: 'beginner', free: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-x-hidden">
      <Particles />
      
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,230,118,0.08),transparent_50%)] pointer-events-none"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={goHome} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition"></div>
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">MoneyBot Hub</h1>
                <p className="text-xs text-slate-500">Financial Resources</p>
              </div>
            </button>
            
            <div className="flex items-center gap-3">
              {/* Streak indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-full">
                <Zap size={16} className="text-orange-400" />
                <span className="text-sm font-medium text-orange-300">{streak} saved</span>
              </div>
              
              <button
                onClick={() => setView('favorites')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  view === 'favorites' 
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Heart size={18} className={favorites.size > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                <span className="hidden sm:inline font-medium">{favorites.size}</span>
              </button>
              
              <button
                onClick={() => setShowSubmitForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Submit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* MoneyBot Guide */}
        <div className="mb-10">
          <MoneyBotMascot message={mascotMessage} mood={mascotMood} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<Target size={20} className="text-emerald-400" />} label="Total Resources" value={resources.length} color="bg-emerald-500/20" />
          <StatCard icon={<Heart size={20} className="text-pink-400" />} label="Your Favorites" value={favorites.size} color="bg-pink-500/20" />
          <StatCard icon={<Award size={20} className="text-amber-400" />} label="Achievements" value={achievementCount} color="bg-amber-500/20" />
          <StatCard icon={<Zap size={20} className="text-orange-400" />} label="Saved Streak" value={streak} color="bg-orange-500/20" />
        </div>

        {/* Achievements */}
        {achievementCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <AchievementBadge icon={<Target size={14} />} label="Explorer" unlocked={achievements.explorer} />
            <AchievementBadge icon={<Star size={14} />} label="Collector" unlocked={achievements.collector} />
            <AchievementBadge icon={<BookOpen size={14} />} label="Scholar" unlocked={achievements.scholar} />
            <AchievementBadge icon={<TrendingUp size={14} />} label="Listener" unlocked={achievements.listener} />
          </div>
        )}

        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="What do you want to learn today?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-14 py-5 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition text-lg placeholder:text-slate-600"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full transition">
              <X size={18} className="text-slate-500" />
            </button>
          )}
        </div>

        {/* Category Grid */}
        {!searchQuery && view === 'home' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {categories.map(cat => {
              const count = resources.filter(r => r.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="group relative bg-slate-900/50 backdrop-blur border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition`}></div>
                  <div className="relative">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition">{cat.emoji}</div>
                    <h3 className="font-semibold text-sm mb-1">{cat.label}</h3>
                    <p className="text-xs text-slate-500">{count} items</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Breadcrumb */}
        {view === 'category' && selectedCategory && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <button onClick={goHome} className="text-slate-500 hover:text-emerald-400 transition">Home</button>
            <ChevronRight size={16} className="text-slate-700" />
            <span className="text-emerald-400 font-medium">{categoryLabels[selectedCategory]}</span>
          </div>
        )}

        {/* Content */}
        {view === 'home' && !searchQuery && (
          <div className="space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Star size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold">Featured</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredResources.map(r => (
                  <ResourceCard key={r.id} resource={r} isFavorite={favorites.has(r.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold">Trending</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingResources.map(r => (
                  <ResourceCard key={r.id} resource={r} isFavorite={favorites.has(r.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Results */}
        {(searchQuery || view === 'category' || view === 'favorites') && (
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {view === 'favorites' ? 'My Collection 💚' : searchQuery ? `Results for "${searchQuery}"` : categoryLabels[selectedCategory!]}
            </h2>
            <p className="text-slate-500 mb-8">{filteredResources.length} resources found</p>
            
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map(r => (
                  <ResourceCard key={r.id} resource={r} isFavorite={favorites.has(r.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-slate-600" />
                </div>
                <p className="text-xl font-medium mb-2">No resources found</p>
                <p className="text-slate-500 mb-6">Try a different search or category</p>
                <button onClick={goHome} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl font-bold transition">Browse All</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Submit Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl shadow-emerald-500/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MoneyBotMascot mood="happy" />
                  <h2 className="text-xl font-bold">Submit Resource</h2>
                </div>
                <button onClick={() => setShowSubmitForm(false)} className="p-2 hover:bg-white/5 rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required type="text" placeholder="Resource name" value={submission.title || ''} onChange={(e) => setSubmission({...submission, title: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 outline-none transition" />
                <textarea required placeholder="What does it do?" value={submission.description || ''} onChange={(e) => setSubmission({...submission, description: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 outline-none transition" rows={3} />
                <input required type="url" placeholder="https://..." value={submission.url || ''} onChange={(e) => setSubmission({...submission, url: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 outline-none transition" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={submission.category} onChange={(e) => setSubmission({...submission, category: e.target.value as ResourceCategory})} className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 outline-none">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <select value={submission.level} onChange={(e) => setSubmission({...submission, level: e.target.value as any})} className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 outline-none">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 py-4 rounded-xl font-bold transition shadow-lg shadow-emerald-500/20">Submit Resource</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource, isFavorite, onToggleFavorite }: { resource: Resource; isFavorite: boolean; onToggleFavorite: (id: string, e: React.MouseEvent) => void }) {
  return (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="group flex gap-4 p-5 bg-slate-900/50 backdrop-blur border border-slate-800 hover:border-emerald-500/30 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition line-clamp-1">{resource.title}</h3>
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{resource.description}</p>
          </div>
          <button onClick={(e) => onToggleFavorite(resource.id, e)} className="p-2 hover:bg-pink-500/10 rounded-xl transition shrink-0">
            <Heart size={18} className={isFavorite ? 'fill-pink-500 text-pink-500' : 'text-slate-600'} />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${resource.free ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{resource.free ? 'FREE' : 'PAID'}</span>
          <span className="text-xs text-slate-500">{categoryLabels[resource.category]}</span>
          {resource.featured && <span className="text-xs text-amber-400 flex items-center gap-1"><Star size={12} className="fill-amber-400" /> Featured</span>}
        </div>
      </div>
      <ExternalLink size={18} className="text-slate-600 shrink-0 mt-1 group-hover:text-emerald-400 transition" />
    </a>
  );
}

export default App;