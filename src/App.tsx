import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Star, ExternalLink, X, Heart, ChevronRight, Sparkles, TrendingUp, BookOpen, Calculator, Wallet, Headphones, GraduationCap, MessageCircle } from 'lucide-react';
import { resources, categoryLabels } from './data/resources';
import type { Resource, ResourceCategory, ResourceSubmission } from './types/resource';

const categories: { id: ResourceCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'calculator', label: 'Calculators', icon: <Calculator size={24} />, description: 'Crunch the numbers' },
  { id: 'tool', label: 'Tools', icon: <Wallet size={24} />, description: 'Apps that help' },
  { id: 'resource', label: 'Learn', icon: <BookOpen size={24} />, description: 'Guides & articles' },
  { id: 'podcast', label: 'Podcasts', icon: <Headphones size={24} />, description: 'Listen & learn' },
  { id: 'book', label: 'Books', icon: <BookOpen size={24} />, description: 'Deep dives' },
  { id: 'course', label: 'Courses', icon: <GraduationCap size={24} />, description: 'Structured learning' },
];

// MoneyBot Mascot Component
function MoneyBotMascot({ message, small = false }: { message?: string; small?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${small ? 'scale-75 origin-left' : ''}`}>
      <div className={`relative ${small ? 'w-12 h-12' : 'w-16 h-16'} flex-shrink-0`}>
        {/* Simple MoneyBot avatar using CSS */}
        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg glow-green">
          <span className="text-2xl">🤖</span>
        </div>
        {/* Green glow effect */}
        <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
      </div>
      {message && (
        <div className="bg-[var(--mb-panel)] border border-[var(--mb-line)] rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
          <p className="text-sm text-[var(--mb-white)]">{message}</p>
        </div>
      )}
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
  const [mascotMessage, setMascotMessage] = useState('Hey! I\'m MoneyBot. Let me help you find the best financial resources!');

  const [submission, setSubmission] = useState<Partial<ResourceSubmission>>({
    category: 'resource',
    level: 'beginner',
    free: true,
  });

  useEffect(() => {
    localStorage.setItem('moneybot-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Update mascot message based on context
  useEffect(() => {
    if (view === 'favorites') {
      setMascotMessage(favorites.size === 0 ? 'Save your favorite resources here!' : `You have ${favorites.size} favorites saved!`);
    } else if (selectedCategory) {
      setMascotMessage(`Here are the best ${categoryLabels[selectedCategory].toLowerCase()} I found for you!`);
    } else if (searchQuery) {
      setMascotMessage(`Searching for "${searchQuery}"...`);
    } else {
      setMascotMessage('Hey! I\'m MoneyBot. Let me help you find the best financial resources!');
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
        setMascotMessage('Removed from favorites!');
      } else {
        next.add(id);
        setMascotMessage('Added to your favorites!');
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
    setMascotMessage('Thanks for submitting! I\'ll review it soon.');
    setShowSubmitForm(false);
    setSubmission({ category: 'resource', level: 'beginner', free: true });
  };

  return (
    <div className="min-h-screen bg-[var(--mb-ink)] text-[var(--mb-white)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--mb-ink)]/95 backdrop-blur border-b border-[var(--mb-line)]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <button onClick={goHome} className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center glow-green">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">MoneyBot Hub</h1>
                <p className="text-xs text-[var(--mb-muted)]">Financial Resources</p>
              </div>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('favorites')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  view === 'favorites' 
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                    : 'text-[var(--mb-muted)] hover:text-white'
                }`}
              >
                <Heart size={18} className={favorites.size > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                <span className="hidden sm:inline">{favorites.size > 0 ? favorites.size : ''}</span>
              </button>
              <button
                onClick={() => setShowSubmitForm(true)}
                className="bg-[var(--mb-green)] hover:bg-[var(--mb-green-dark)] text-[var(--mb-ink)] px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* MoneyBot Guide */}
        <div className="mb-8">
          <MoneyBotMascot message={mascotMessage} />
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mb-muted)]" size={20} />
          <input
            type="text"
            placeholder="What do you want to learn about?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-[var(--mb-ink-2)] border border-[var(--mb-line)] rounded-2xl focus:border-[var(--mb-green)] focus:ring-2 focus:ring-[var(--mb-green)]/20 outline-none transition text-lg"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full">
              <X size={18} className="text-[var(--mb-muted)]" />
            </button>
          )}
        </div>

        {/* Category Grid - Always visible for quick access */}
        {!searchQuery && view === 'home' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {categories.map(cat => {
              const count = resources.filter(r => r.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="group bg-[var(--mb-ink-2)] hover:bg-[var(--mb-panel)] border border-[var(--mb-line)] hover:border-[var(--mb-green)]/50 rounded-2xl p-4 transition-all text-left"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-[var(--mb-green)] mb-3 group-hover:scale-110 transition">
                    {cat.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{cat.label}</h3>
                  <p className="text-xs text-[var(--mb-muted)]">{count} resources</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Breadcrumb for category view */}
        {view === 'category' && selectedCategory && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <button onClick={goHome} className="text-[var(--mb-muted)] hover:text-white transition">Home</button>
            <ChevronRight size={16} className="text-[var(--mb-muted)]" />
            <span className="text-[var(--mb-green)] font-medium">{categoryLabels[selectedCategory]}</span>
          </div>
        )}

        {/* Content Sections */}
        {view === 'home' && !searchQuery && (
          <div className="space-y-8">
            {/* Featured */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Star className="text-[var(--mb-gold)] fill-[var(--mb-gold)]" size={20} />
                <h2 className="text-xl font-bold">Featured</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredResources.map(r => (
                  <ResourceCard key={r.id} resource={r} isFavorite={favorites.has(r.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>

            {/* Trending */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-[var(--mb-green)]" size={20} />
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

        {/* Search/Category Results */}
        {(searchQuery || view === 'category' || view === 'favorites') && (
          <div>
            <h2 className="text-xl font-bold mb-2">
              {view === 'favorites' ? 'My Favorites' : searchQuery ? `Results for "${searchQuery}"` : categoryLabels[selectedCategory!]}
            </h2>
            <p className="text-[var(--mb-muted)] mb-6">{filteredResources.length} resources found</p>
            
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map(r => (
                  <ResourceCard key={r.id} resource={r} isFavorite={favorites.has(r.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-[var(--mb-ink-2)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-[var(--mb-muted)]" />
                </div>
                <p className="text-lg font-medium mb-2">No resources found</p>
                <p className="text-[var(--mb-muted)] mb-4">Try a different search or category</p>
                <button onClick={goHome} className="text-[var(--mb-green)] hover:underline">Browse all resources</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Submit Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--mb-ink-2)] border border-[var(--mb-line)] rounded-3xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MoneyBotMascot small />
                  <h2 className="text-xl font-bold">Submit Resource</h2>
                </div>
                <button onClick={() => setShowSubmitForm(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  type="text"
                  placeholder="What's it called?"
                  value={submission.title || ''}
                  onChange={(e) => setSubmission({...submission, title: e.target.value})}
                  className="w-full px-4 py-3 bg-[var(--mb-ink)] border border-[var(--mb-line)] rounded-xl focus:border-[var(--mb-green)] outline-none transition"
                />
                <textarea
                  required
                  placeholder="What does it do?"
                  value={submission.description || ''}
                  onChange={(e) => setSubmission({...submission, description: e.target.value})}
                  className="w-full px-4 py-3 bg-[var(--mb-ink)] border border-[var(--mb-line)] rounded-xl focus:border-[var(--mb-green)] outline-none transition"
                  rows={3}
                />
                <input
                  required
                  type="url"
                  placeholder="https://..."
                  value={submission.url || ''}
                  onChange={(e) => setSubmission({...submission, url: e.target.value})}
                  className="w-full px-4 py-3 bg-[var(--mb-ink)] border border-[var(--mb-line)] rounded-xl focus:border-[var(--mb-green)] outline-none transition"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={submission.category}
                    onChange={(e) => setSubmission({...submission, category: e.target.value as ResourceCategory})}
                    className="px-4 py-3 bg-[var(--mb-ink)] border border-[var(--mb-line)] rounded-xl focus:border-[var(--mb-green)] outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <select
                    value={submission.level}
                    onChange={(e) => setSubmission({...submission, level: e.target.value as any})}
                    className="px-4 py-3 bg-[var(--mb-ink)] border border-[var(--mb-line)] rounded-xl focus:border-[var(--mb-green)] outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-[var(--mb-green)] hover:bg-[var(--mb-green-dark)] text-[var(--mb-ink)] py-4 rounded-xl font-bold transition">
                  Submit Resource
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource, isFavorite, onToggleFavorite }: { 
  resource: Resource; 
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 p-4 bg-[var(--mb-ink-2)] hover:bg-[var(--mb-panel)] border border-[var(--mb-line)] hover:border-[var(--mb-green)]/30 rounded-2xl transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--mb-white)] group-hover:text-[var(--mb-green)] transition line-clamp-1">
              {resource.title}
            </h3>
            <p className="text-sm text-[var(--mb-muted)] mt-1 line-clamp-2">
              {resource.description}
            </p>
          </div>
          <button
            onClick={(e) => onToggleFavorite(resource.id, e)}
            className="p-2 hover:bg-pink-500/10 rounded-xl transition shrink-0"
          >
            <Heart size={18} className={isFavorite ? 'fill-pink-500 text-pink-500' : 'text-[var(--mb-muted)]'} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mt-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
            resource.free 
              ? 'bg-[var(--mb-green)]/20 text-[var(--mb-green)]' 
              : 'bg-[var(--mb-gold)]/20 text-[var(--mb-gold)]'
          }`}>
            {resource.free ? 'FREE' : 'PAID'}
          </span>
          <span className="text-xs text-[var(--mb-muted)]">{categoryLabels[resource.category]}</span>
          {resource.featured && (
            <span className="text-xs text-[var(--mb-gold)] flex items-center gap-1">
              <Star size={12} className="fill-[var(--mb-gold)]" /> Featured
            </span>
          )}
        </div>
      </div>
      
      <ExternalLink size={18} className="text-[var(--mb-muted)] shrink-0 mt-1 group-hover:text-[var(--mb-green)] transition" />
    </a>
  );
}

export default App;
