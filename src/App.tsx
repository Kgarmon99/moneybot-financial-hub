import { useState, useMemo } from 'react';
import { Search, Plus, Star, ExternalLink, X } from 'lucide-react';
import { resources, categoryLabels, levelLabels, allTags } from './data/resources';
import type { Resource, ResourceCategory, ResourceLevel, ResourceSubmission } from './types/resource';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<ResourceLevel | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Submission form state
  const [submission, setSubmission] = useState<Partial<ResourceSubmission>>({
    category: 'resource',
    level: 'beginner',
    free: true,
    tags: []
  });

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || resource.level === selectedLevel;
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => resource.tags.includes(tag));
      const matchesFree = !showFreeOnly || resource.free;

      return matchesSearch && matchesCategory && matchesLevel && matchesTags && matchesFree;
    });
  }, [searchQuery, selectedCategory, selectedLevel, selectedTags, showFreeOnly]);

  const featuredResources = useMemo(() => {
    return resources.filter(r => r.featured);
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store submission (in a real app, this would go to a backend)
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">💰 MoneyBot Financial Hub</h1>
              <p className="text-emerald-100">The largest curated database of financial education resources — Now Live!</p>
            </div>
            <div className="flex gap-3">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                {resources.length}+ Resources
              </span>
              <button
                onClick={() => setShowSubmitForm(true)}
                className="bg-white text-emerald-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-emerald-50 transition flex items-center gap-2"
              >
                <Plus size={18} />
                Submit Resource
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Star className="text-amber-500" size={24} />
          Featured Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      {/* Search & Filters */}
      <section className="max-w-7xl mx-auto px-4 py-6 border-t border-slate-200">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search resources, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ResourceCategory | 'all')}
              className="px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as ResourceLevel | 'all')}
              className="px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
            >
              <option value="all">All Levels</option>
              {Object.entries(levelLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={(e) => setShowFreeOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm">Free Only</span>
            </label>

            {(selectedTags.length > 0 || selectedCategory !== 'all' || selectedLevel !== 'all' || showFreeOnly) && (
              <button
                onClick={() => {
                  setSelectedTags([]);
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setShowFreeOnly(false);
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-500 py-1">Popular tags:</span>
            {allTags.slice(0, 20).map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-xs rounded-full transition ${
                  selectedTags.includes(tag)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-600">
          Showing {filteredResources.length} of {resources.length} resources
        </div>
      </section>

      {/* Resource Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
        
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No resources found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTags([]);
                setSelectedCategory('all');
                setSelectedLevel('all');
                setShowFreeOnly(false);
              }}
              className="text-emerald-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* Submit Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Submit a Resource</h2>
                <button
                  onClick={() => setShowSubmitForm(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                  <input
                    required
                    type="text"
                    value={submission.title || ''}
                    onChange={(e) => setSubmission({...submission, title: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    placeholder="e.g., Mint Personal Finance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                  <textarea
                    required
                    value={submission.description || ''}
                    onChange={(e) => setSubmission({...submission, description: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    rows={3}
                    placeholder="Brief description of the resource..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL *</label>
                  <input
                    required
                    type="url"
                    value={submission.url || ''}
                    onChange={(e) => setSubmission({...submission, url: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                    <select
                      value={submission.category}
                      onChange={(e) => setSubmission({...submission, category: e.target.value as ResourceCategory})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    >
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Level *</label>
                    <select
                      value={submission.level}
                      onChange={(e) => setSubmission({...submission, level: e.target.value as ResourceLevel})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    >
                      {Object.entries(levelLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Author/Creator</label>
                  <input
                    type="text"
                    value={submission.author || ''}
                    onChange={(e) => setSubmission({...submission, author: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    placeholder="e.g., Dave Ramsey"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={submission.free}
                    onChange={(e) => setSubmission({...submission, free: e.target.checked})}
                    className="rounded text-emerald-600"
                  />
                  <label className="text-sm text-slate-700">This resource is free</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
                >
                  Submit Resource
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">MoneyBot Financial Education Hub</p>
          <p className="text-sm text-slate-500">Curated resources to help you build wealth and financial freedom</p>
        </div>
      </footer>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          resource.free ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {resource.free ? 'FREE' : 'PAID'}
        </span>
        {resource.featured && (
          <Star className="text-amber-400 fill-amber-400" size={18} />
        )}
      </div>

      <h3 className="font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition">
        {resource.title}
      </h3>
      
      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
        {resource.description}
      </p>

      {resource.author && (
        <p className="text-xs text-slate-500 mb-3">by {resource.author}</p>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {resource.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
        {resource.tags.length > 3 && (
          <span className="text-xs text-slate-400">+{resource.tags.length - 3}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{categoryLabels[resource.category]}</span>
          <span>•</span>
          <span>{levelLabels[resource.level]}</span>
        </div>
        <ExternalLink size={16} className="text-slate-400 group-hover:text-emerald-600" />
      </div>
    </a>
  );
}

export default App;
