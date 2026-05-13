import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Star, ExternalLink, X, SlidersHorizontal, Calculator, Wallet, BookOpen, Headphones, GraduationCap, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { resources, categoryLabels, levelLabels } from './data/resources';
import type { Resource, ResourceCategory, ResourceLevel, ResourceSubmission } from './types/resource';

const categories: { id: ResourceCategory | 'all'; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'all', icon: <Sparkles size={20} />, label: 'All', color: 'bg-gray-800' },
  { id: 'calculator', icon: <Calculator size={20} />, label: 'Calculators', color: 'bg-emerald-500' },
  { id: 'tool', icon: <Wallet size={20} />, label: 'Tools', color: 'bg-blue-500' },
  { id: 'resource', icon: <BookOpen size={20} />, label: 'Resources', color: 'bg-violet-500' },
  { id: 'podcast', icon: <Headphones size={20} />, label: 'Podcasts', color: 'bg-orange-500' },
  { id: 'book', icon: <BookOpen size={20} />, label: 'Books', color: 'bg-pink-500' },
  { id: 'course', icon: <GraduationCap size={20} />, label: 'Courses', color: 'bg-cyan-500' },
];

const quickFilters = [
  { id: 'free', label: '🆓 Free Only' },
  { id: 'beginner', label: '🟢 Beginner Friendly' },
  { id: 'featured', label: '⭐ Featured' },
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<ResourceLevel | 'all'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('moneybot-favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');

  const [submission, setSubmission] = useState<Partial<ResourceSubmission>>({
    category: 'resource',
    level: 'beginner',
    free: true,
    tags: []
  });

  useEffect(() => {
    localStorage.setItem('moneybot-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const filteredResources = useMemo(() => {
    let filtered = resources;

    // Search across everything
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query)) ||
        categoryLabels[r.category].toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Quick filters
    if (activeQuickFilter === 'free') {
      filtered = filtered.filter(r => r.free);
    } else if (activeQuickFilter === 'beginner') {
      filtered = filtered.filter(r => r.level === 'beginner');
    } else if (activeQuickFilter === 'featured') {
      filtered = filtered.filter(r => r.featured);
    }

    // Level filter (advanced)
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(r => r.level === selectedLevel);
    }

    // Favorites view
    if (viewMode === 'favorites') {
      filtered = filtered.filter(r => favorites.has(r.id));
    }

    return filtered;
  }, [searchQuery, selectedCategory, activeQuickFilter, selectedLevel, favorites, viewMode]);

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

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setActiveQuickFilter(null);
    setSelectedLevel('all');
    setViewMode('all');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || activeQuickFilter || selectedLevel !== 'all';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubmission: ResourceSubmission = {
      ...submission as ResourceSubmission,
      submittedAt: new Date().toISOString(),
      submittedBy: 'Anonymous'
    };
    console.log('Submission:', newSubmission);
    alert('Thanks for your submission! We\'ll review it soon.');
    setShowSubmitForm(false);
    setSubmission({ category: 'resource', level: 'beginner', free: true, tags: [] });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-xl">
                💰
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">MoneyBot Hub</h1>
                <p className="text-xs text-gray-500">Financial Education Resources</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'favorites' ? 'all' : 'favorites')}
                className={`p-2 rounded-lg transition ${viewMode === 'favorites' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-pink-500'}`}
                title="My Favorites"
              >
                <Heart size={22} className={viewMode === 'favorites' ? 'fill-pink-500' : ''} />
              </button>
              <button
                onClick={() => setShowSubmitForm(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Submit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Big Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
          <input
            type="text"
            placeholder="Search resources, topics, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition text-lg shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={20} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? `${cat.color} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.icon}
              <span className="font-medium">{cat.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {cat.id === 'all' ? resources.length : resources.filter(r => r.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {quickFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveQuickFilter(activeQuickFilter === filter.id ? null : filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeQuickFilter === filter.id
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
              showAdvancedFilters || selectedLevel !== 'all'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters
            {(showAdvancedFilters || selectedLevel !== 'all') && <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Level</label>
                <div className="flex gap-2">
                  {Object.entries(levelLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedLevel(selectedLevel === key ? 'all' : key as ResourceLevel)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition ${
                        selectedLevel === key
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {viewMode === 'favorites' ? 'My Favorites' : 
             activeQuickFilter === 'featured' ? 'Featured Resources' :
             selectedCategory === 'all' ? 'All Resources' : categoryLabels[selectedCategory]}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredResources.length} result{filteredResources.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Resource Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                isFavorite={favorites.has(resource.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">No resources found</p>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearAllFilters}
              className="text-emerald-600 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Submit Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Submit a Resource</h2>
                <button onClick={() => setShowSubmitForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  type="text"
                  placeholder="Resource title"
                  value={submission.title || ''}
                  onChange={(e) => setSubmission({...submission, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                />
                <textarea
                  required
                  placeholder="Brief description"
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
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={submission.category}
                    onChange={(e) => setSubmission({...submission, category: e.target.value as ResourceCategory})}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <select
                    value={submission.level}
                    onChange={(e) => setSubmission({...submission, level: e.target.value as ResourceLevel})}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                  >
                    {Object.entries(levelLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={submission.free}
                    onChange={(e) => setSubmission({...submission, free: e.target.checked})}
                    className="w-5 h-5 rounded text-emerald-500"
                  />
                  <span>This resource is free</span>
                </label>
                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition"
                >
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
  const catColor = {
    calculator: 'bg-emerald-500',
    tool: 'bg-blue-500',
    resource: 'bg-violet-500',
    podcast: 'bg-orange-500',
    book: 'bg-pink-500',
    course: 'bg-cyan-500',
  }[resource.category];

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all"
    >
      <div className="flex items-start gap-4">
        <div className={`${catColor} text-white p-3 rounded-xl shrink-0`}>
          {{
            calculator: <Calculator size={24} />,
            tool: <Wallet size={24} />,
            resource: <BookOpen size={24} />,
            podcast: <Headphones size={24} />,
            book: <BookOpen size={24} />,
            course: <GraduationCap size={24} />,
          }[resource.category]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 leading-tight group-hover:text-emerald-600 transition line-clamp-2">
              {resource.title}
            </h3>
            <button
              onClick={(e) => onToggleFavorite(resource.id, e)}
              className="shrink-0 p-1 hover:bg-pink-50 rounded-full transition"
            >
              <Heart 
                size={20} 
                className={isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-300'} 
              />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {resource.description}
          </p>
          {resource.author && (
            <p className="text-xs text-gray-400 mt-2">by {resource.author}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
            resource.free ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {resource.free ? 'FREE' : '$'}
          </span>
          <span className="text-xs text-gray-400">
            {categoryLabels[resource.category]}
          </span>
        </div>
        <ExternalLink size={18} className="text-gray-300 group-hover:text-emerald-500 transition" />
      </div>
    </a>
  );
}

export default App;
