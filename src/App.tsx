import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Star, ExternalLink, X, Heart, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { resources, categoryLabels } from './data/resources';
import type { Resource, ResourceCategory, ResourceLevel, ResourceSubmission } from './types/resource';

const categories: { id: ResourceCategory; label: string; emoji: string }[] = [
  { id: 'calculator', label: 'Calculators', emoji: '🧮' },
  { id: 'tool', label: 'Tools & Apps', emoji: '🛠️' },
  { id: 'resource', label: 'Guides & Articles', emoji: '📚' },
  { id: 'podcast', label: 'Podcasts', emoji: '🎧' },
  { id: 'book', label: 'Books', emoji: '📖' },
  { id: 'course', label: 'Courses', emoji: '🎓' },
];

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
  const [view, setView] = useState<'home' | 'category' | 'favorites' | 'search'>('home');

  const [submission, setSubmission] = useState<Partial<ResourceSubmission>>({
    category: 'resource',
    level: 'beginner',
    free: true,
  });

  useEffect(() => {
    localStorage.setItem('moneybot-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Featured resources
  const featuredResources = useMemo(() => resources.filter(r => r.featured).slice(0, 6), []);
  
  // Trending (most tags = more comprehensive)
  const trendingResources = useMemo(() => 
    [...resources].sort((a, b) => b.tags.length - a.tags.length).slice(0, 6), 
  []);

  // Free resources
  const freeResources = useMemo(() => resources.filter(r => r.free).slice(0, 6), []);

  // Filtered resources
  const filteredResources = useMemo(() => {
    let filtered = resources;
    
    if (selectedCategory) {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }
    
    if (view === 'favorites') {
      filtered = filtered.filter(r => favorites.has(r.id));
    }
    
    return filtered;
  }, [selectedCategory, searchQuery, view, favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCategoryClick = (cat: ResourceCategory) => {
    setSelectedCategory(cat);
    setView('category');
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setView('search');
      setSelectedCategory(null);
    } else {
      setView('home');
    }
  };

  const goHome = () => {
    setView('home');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thanks! We\'ll review your submission.');
    setShowSubmitForm(false);
    setSubmission({ category: 'resource', level: 'beginner', free: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto hidden lg:block">
        <div className="p-6">
          <button onClick={goHome} className="flex items-center gap-3 mb-8 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl">
              💰
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">MoneyBot</h1>
              <p className="text-xs text-gray-500">Resource Hub</p>
            </div>
          </button>

          <nav className="space-y-1">
            <button
              onClick={goHome}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                view === 'home' && !selectedCategory ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sparkles size={20} />
              Home
            </button>
            
            <button
              onClick={() => setView('favorites')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                view === 'favorites' ? 'bg-pink-50 text-pink-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart size={20} className={favorites.size > 0 ? 'fill-pink-500 text-pink-500' : ''} />
              Favorites
              {favorites.size > 0 && (
                <span className="ml-auto bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-full">
                  {favorites.size}
                </span>
              )}
            </button>
          </nav>

          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              Categories
            </h3>
            <nav className="space-y-1">
              {categories.map(cat => {
                const count = resources.filter(r => r.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                      selectedCategory === cat.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <button
            onClick={() => setShowSubmitForm(true)}
            className="mt-8 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Submit Resource
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between p-4">
          <button onClick={goHome} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-lg">💰</div>
            <span className="font-bold">MoneyBot Hub</span>
          </button>
          <button
            onClick={() => setShowSubmitForm(true)}
            className="bg-emerald-500 text-white p-2 rounded-lg"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* Mobile Categories */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          <button
            onClick={goHome}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              view === 'home' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            🏠 Home
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === cat.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
          <button
            onClick={() => setView('favorites')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              view === 'favorites' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            ❤️ Favorites
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-24 lg:pt-0">
        {/* Search Bar */}
        <div className="sticky top-0 lg:top-4 z-40 bg-gray-50/95 backdrop-blur p-4 lg:p-6 lg:pb-2">
          <div className="max-w-4xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition text-base shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={18} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          {/* Home View */}
          {view === 'home' && !searchQuery && (
            <div className="space-y-10">
              {/* Welcome */}
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Find the best financial resources
                </h2>
                <p className="text-gray-500 text-lg">
                  {resources.length}+ curated calculators, tools, books, podcasts, and courses
                </p>
              </div>

              {/* Featured Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Star className="text-amber-400 fill-amber-400" size={20} />
                    Featured Resources
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredResources.map(r => (
                    <ResourceCard key={r.id} resource={r} isFavorite={favorites.has(r.id)} onToggleFavorite={toggleFavorite} />
                  ))}
                </div>
              </section>

              {/* Trending Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="text-emerald-500" size={20} />
                    Popular Right Now
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendingResources.map(r => (
                    <ResourceCard key={r.id} resource={r} isFavorite={favorites.has(r.id)} onToggleFavorite={toggleFavorite} />
                  ))}
                </div>
              </section>

              {/* Free Resources */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">🆓 Free Resources</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freeResources.map(r => (
                    <ResourceCard key={r.id} resource={r} isFavorite={favorites.has(r.id)} onToggleFavorite={toggleFavorite} />
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Category View */}
          {view === 'category' && selectedCategory && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <button onClick={goHome} className="text-gray-400 hover:text-gray-600">Home</button>
                <ChevronRight size={16} className="text-gray-300" />
                <span className="font-bold text-gray-900">{categoryLabels[selectedCategory]}</span>
              </div>
              <h2 className="text-2xl font-bold mb-6">{categoryLabels[selectedCategory]}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map(r => (
                  <ResourceCard key={r.id} resource={r} isFavorite={favorites.has(r.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {view === 'search' && (
            <div>
              <h2 className="text-xl font-bold mb-2">Search Results</h2>
              <p className="text-gray-500 mb-6">{filteredResources.length} results for "{searchQuery}"</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map(r => (
                  <ResourceCard key={r.id} resource={r} isFavorite={favorites.has(r.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No results found</p>
                  <button onClick={() => handleSearch('')} className="text-emerald-600 hover:underline">
                    Clear search
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Favorites View */}
          {view === 'favorites' && (
            <div>
              <h2 className="text-2xl font-bold mb-2">My Favorites</h2>
              <p className="text-gray-500 mb-6">{favorites.size} saved resources</p>
              {favorites.size > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredResources.map(r => (
                    <ResourceCard key={r.id} resource={r} isFavorite={true} onToggleFavorite={toggleFavorite} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <Heart size={48} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-900 font-medium mb-1">No favorites yet</p>
                  <p className="text-gray-400 text-sm">Click the heart on any resource to save it</p>
                  <button onClick={goHome} className="mt-4 text-emerald-600 font-medium hover:underline">
                    Browse resources
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Submit Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Submit Resource</h2>
                <button onClick={() => setShowSubmitForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  type="text"
                  placeholder="Title"
                  value={submission.title || ''}
                  onChange={(e) => setSubmission({...submission, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                />
                <textarea
                  required
                  placeholder="Description"
                  value={submission.description || ''}
                  onChange={(e) => setSubmission({...submission, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                  rows={3}
                />
                <input
                  required
                  type="url"
                  placeholder="https://..."
                  value={submission.url || ''}
                  onChange={(e) => setSubmission({...submission, url: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                />
                <button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition">
                  Submit
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
      className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition line-clamp-1">
            {resource.title}
          </h3>
          <button
            onClick={(e) => onToggleFavorite(resource.id, e)}
            className="shrink-0 p-1 hover:bg-pink-50 rounded-full transition"
          >
            <Heart size={18} className={isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-300'} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {resource.description}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
            resource.free ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {resource.free ? 'FREE' : 'PAID'}
          </span>
          <span className="text-xs text-gray-400">{categoryLabels[resource.category]}</span>
          {resource.featured && (
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <Star size={12} className="fill-amber-400" /> Featured
            </span>
          )}
        </div>
      </div>
      <ExternalLink size={18} className="text-gray-300 shrink-0 mt-1" />
    </a>
  );
}

export default App;
