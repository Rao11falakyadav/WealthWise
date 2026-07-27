import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Input, Modal, Spinner } from '@/components/ui';
import type { Story } from '@/lib/types';
import { Plus, Trash2, Heart, MessageCircle, Share2, Bookmark, Award, MoreHorizontal, AlertCircle, TrendingUp, Search, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Saving', 'Investing', 'Budgeting', 'Side Hustles', 'Entrepreneurship', 'Scholarships', 'Career Growth', 'Debt-Free Journey'];
const ACHIEVEMENTS = ['Debt Free', 'First Investment', 'Side Hustle', 'Emergency Fund', 'Business', 'Scholarship'];

const MOCK_STORIES: Story[] = [
  {
    id: 'mock-1',
    user_id: '1',
    title: 'How I paid off $20k in student loans in 2 years',
    body: 'It took a lot of discipline, meal prepping, and taking on a side hustle teaching online. The biggest game changer was using the avalanche method. Seeing that debt number go down every month kept me going. If I can do it, so can you! Keep pushing and stay focused on your goals.',
    author_name: 'Sarah J.',
    created_at: new Date().toISOString(),
    achievement_tag: 'Debt Free',
    category: 'Debt-Free Journey',
    hashtags: ['#debtfree', '#studentloans', '#financialfreedom'],
    likes_count: 342,
    comments_count: 56,
    shares_count: 12,
  },
  {
    id: 'mock-2',
    user_id: '2',
    title: 'Made my first investment today! 🎉',
    body: 'After months of reading and being terrified of the stock market, I finally opened a brokerage account and bought my first index fund ETF. It feels so empowering to finally put my money to work instead of just letting it sit in a low-yield savings account.',
    author_name: 'Priya Patel',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    achievement_tag: 'First Investment',
    category: 'Investing',
    hashtags: ['#investing', '#indexfunds', '#wealthbuilding'],
    likes_count: 890,
    comments_count: 124,
    shares_count: 45,
  }
];

export function CommunityPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [achievement, setAchievement] = useState('');
  const [tags, setTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Filters
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  async function load() {
    if (!user) return;
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
    
    let fetched = (data as Story[]) || [];
    
    // Inject mock data for UI testing if the fields are missing
    fetched = fetched.map(s => ({
      ...s,
      likes_count: s.likes_count ?? Math.floor(Math.random() * 100),
      comments_count: s.comments_count ?? Math.floor(Math.random() * 20),
      shares_count: s.shares_count ?? Math.floor(Math.random() * 5),
      achievement_tag: s.achievement_tag || ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)] as any,
      category: s.category || CATEGORIES[1] as any,
    }));

    if (fetched.length === 0) {
      setStories(MOCK_STORIES);
    } else {
      setStories([...fetched, ...MOCK_STORIES]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function addStory() {
    setBusy(true);
    if (!title || !body) { setBusy(false); return; }
    
    const hashtagsArray = tags.split(' ').filter(t => t.startsWith('#'));

    await supabase.from('stories').insert({
      title, 
      body, 
      author_name: isAnonymous ? 'Anonymous' : (profile?.full_name || 'Anonymous'),
    });
    
    setBusy(false);
    setModal(false);
    setTitle(''); setBody(''); setTags(''); setIsAnonymous(false); setAchievement('');
    await load();
  }

  async function deleteStory(id: string) {
    if (id.startsWith('mock')) return;
    await supabase.from('stories').delete().eq('id', id);
    await load();
  }

  const filteredStories = stories.filter(s => {
    const matchesCategory = activeFilter === 'All' || s.category === activeFilter;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="w-7 h-7 text-[#788B76]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#2C3329]">Community</h1>
          <p className="text-sm text-[#788B76] mt-1">Real stories, real growth. Connect and learn.</p>
        </div>
        <Button variant="secondary" onClick={() => setModal(true)}>
          <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Share your journey</span>
        </Button>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 hide-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === cat 
                ? 'bg-[#2C3329] text-[#EFEBE3]' 
                : 'bg-[#FAF8F4] border border-[#E8E2D9] text-[#5a6354] hover:border-[#C8BFB4]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Story */}
          <Card className="p-1 group relative overflow-hidden bg-gradient-to-br from-[#2C3329] to-[#4A5546] border-none">
            <div className="bg-[#FAF8F4] rounded-[10px] p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[#C06E52] text-xs font-semibold uppercase tracking-widest">
                    <Award className="w-4 h-4" /> Featured Story of the Week
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold text-[#2C3329] mb-2">{MOCK_STORIES[0].title}</h3>
                <p className="text-sm text-[#5a6354] line-clamp-3 mb-4">{MOCK_STORIES[0].body}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E8E2D9]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E8E2D9] flex items-center justify-center text-xs font-bold text-[#2C3329]">
                    S
                  </div>
                  <span className="text-sm font-medium text-[#2C3329]">{MOCK_STORIES[0].author_name}</span>
                </div>
                <Button variant="outline" className="text-xs h-8 py-0">Read More</Button>
              </div>
            </div>
          </Card>

          {/* Feed Items */}
          {filteredStories.map((s) => (
            <Card key={s.id} className="p-6 group transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8E2D9] flex items-center justify-center text-sm font-bold text-[#2C3329]">
                    {s.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2C3329]">{s.author_name}</p>
                    <p className="text-xs text-[#788B76]">
                      {new Date(s.created_at).toLocaleDateString()} • {s.category || 'General'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.achievement_tag && (
                    <span className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                      <Award className="w-3 h-3" />
                      {s.achievement_tag}
                    </span>
                  )}
                  <button className="text-[#B5AB9B] hover:text-[#2C3329] p-1">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteStory(s.id)} className="opacity-0 group-hover:opacity-100 text-[#B5AB9B] hover:text-red-500 transition-all p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-display text-lg font-semibold text-[#2C3329] mb-2">{s.title}</h3>
              <p className="text-sm text-[#5a6354] leading-relaxed mb-4">{s.body}</p>
              
              {s.hashtags && s.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {s.hashtags.map(tag => (
                    <span key={tag} className="text-xs text-[#C06E52] hover:underline cursor-pointer">{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D9]">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-1.5 text-sm text-[#788B76] hover:text-[#C06E52] transition-colors group/btn">
                    <Heart className="w-5 h-5 group-hover/btn:fill-[#C06E52]/20" /> {s.likes_count || 0}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-[#788B76] hover:text-[#2C3329] transition-colors">
                    <MessageCircle className="w-5 h-5" /> {s.comments_count || 0}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-[#788B76] hover:text-[#2C3329] transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                <button className="text-[#788B76] hover:text-[#2C3329] transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#788B76]" />
            <input 
              type="text" 
              placeholder="Search stories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF8F4] text-sm focus:outline-none focus:border-[#788B76] focus:ring-1 focus:ring-[#788B76]"
            />
          </div>

          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-[#2C3329] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C06E52]" /> Trending Topics
            </h3>
            <div className="space-y-3">
              {['#debtfree', '#first100k', '#sidehustle', '#budgeting'].map((tag, i) => (
                <div key={tag} className="flex items-center justify-between cursor-pointer hover:bg-[#FAF0EC] p-2 -mx-2 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-[#2C3329]">{tag}</span>
                  <span className="text-xs text-[#788B76]">{150 - (i * 20)} posts</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-[#2C3329] text-[#EFEBE3]">
            <h3 className="font-display text-base font-semibold mb-2 text-white">Top Voices</h3>
            <p className="text-xs text-[#C8BFB4] mb-4">Follow creators for more inspiration.</p>
            <div className="space-y-4">
              {[
                { name: 'Priya Patel', role: 'Investing Pro' },
                { name: 'Sarah J.', role: 'Debt Free' }
              ].map((creator) => (
                <div key={creator.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#4A5546] flex items-center justify-center text-xs font-bold text-white">
                      {creator.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{creator.name}</p>
                      <p className="text-[10px] text-[#C8BFB4]">{creator.role}</p>
                    </div>
                  </div>
                  <Button variant="secondary" className="h-7 text-[10px] px-3 py-0 bg-[#EFEBE3] text-[#2C3329] border-none hover:bg-white">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Share your story">
        <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 text-blue-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="text-xs leading-relaxed">
              <strong>Community Guidelines:</strong> Be respectful, share authentic experiences, and do not provide financial advice. Spam or abusive language will be removed.
            </div>
          </div>

          <Input label="Title" value={title} onChange={setTitle} placeholder="e.g. How I saved my first $5k" />
          
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-[#788B76] mb-2">Your story</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your journey, a lesson, or a win..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F4] text-[#2C3329] placeholder:text-[#B5AB9B] focus:outline-none focus:border-[#788B76] focus:ring-2 focus:ring-[#788B76]/15 transition-all resize-none text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs uppercase tracking-widest text-[#788B76] mb-2">Category</span>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F4] text-[#2C3329] text-sm focus:outline-none focus:border-[#788B76]"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-widest text-[#788B76] mb-2">Achievement Badge</span>
              <select 
                value={achievement} 
                onChange={e => setAchievement(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F4] text-[#2C3329] text-sm focus:outline-none focus:border-[#788B76]"
              >
                <option value="">None</option>
                {ACHIEVEMENTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          </div>

          <Input label="Hashtags (space separated)" value={tags} onChange={setTags} placeholder="#saving #first100k" />

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="w-4 h-4 text-[#C06E52] rounded border-[#E8E2D9] focus:ring-[#C06E52]" />
            <span className="text-sm font-medium text-[#2C3329]">Post Anonymously</span>
          </label>

          <Button variant="secondary" onClick={addStory} className="w-full" disabled={busy}>
            {busy ? <Spinner className="w-4 h-4 mx-auto" /> : 'Publish Story'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
