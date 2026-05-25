// App.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Plus, X, Play, Menu, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import logo from './assets/logo.png';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const COMMON_INGREDIENTS = [
  { name: 'tomato',           emoji: '🍅' },
  { name: 'potato',           emoji: '🥔' },
  { name: 'onion',            emoji: '🧅' },
  { name: 'garlic',           emoji: '🧄' },
  { name: 'basil',            emoji: '🌿' },
  { name: 'mozzarella cheese',emoji: '🧀' },
  { name: 'pizza dough',      emoji: '🫓' },
  { name: 'olive oil',        emoji: '🫒' },
  { name: 'eggs',             emoji: '🥚' },
  { name: 'milk',             emoji: '🥛' },
  { name: 'butter',           emoji: '🧈' },
  { name: 'bread',            emoji: '🍞' },
  { name: 'lentils',          emoji: '🫘' },
  { name: 'rice',             emoji: '🍚' },
  { name: 'spaghetti',        emoji: '🍝' },
  { name: 'avocado',          emoji: '🥑' },
  { name: 'corn',             emoji: '🌽' },
  { name: 'bell pepper',      emoji: '🫑' },
  { name: 'ginger',           emoji: '🫚' },
  { name: 'peanut butter',    emoji: '🥜' },
  { name: 'chicken',          emoji: '🍗' },
  { name: 'mutton',           emoji: '🍖' },
];

const BASIC_PANTRY_ITEMS = [
  'salt','oil','sugar','water','black pepper',
  'turmeric','cumin','chilli powder','soy sauce','vinegar',
];

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=300&fit=crop';
const handleImgError = (e) => { e.target.src = FALLBACK_IMG; };

// Enhanced emoji lookup with extended fallback map
const getIngredientEmoji = (name) => {
  const found = COMMON_INGREDIENTS.find(i => i.name === name.toLowerCase());
  if (found) return found.emoji;
  const fallbackMap = {
    chicken: '🍗', mutton: '🍖', beef: '🥩', fish: '🐟', shrimp: '🦐',
    carrot: '🥕', broccoli: '🥦', spinach: '🥬', mushroom: '🍄',
    lemon: '🍋', orange: '🍊', apple: '🍎', banana: '🍌',
    egg: '🥚', cheese: '🧀', flour: '🌾', sugar: '🍚', honey: '🍯',
  };
  return fallbackMap[name.toLowerCase()] || '🍽️';
};

// ─────────────────────────────────────────────────────────────────────────────
// Daily-rotation helper — deterministic shuffle keyed to today's date
// ─────────────────────────────────────────────────────────────────────────────
function dailyShuffle(arr) {
  if (!arr || arr.length === 0) return [];
  const today = new Date().toDateString();
  const seed  = today.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  let s = seed;
  const rand = () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─────────────────────────────────────────────────────────────────────────────
// Carousel
// ─────────────────────────────────────────────────────────────────────────────
function Carousel({ children, darkMode }) {
  const trackRef             = useRef(null);
  const [canLeft,  setLeft]  = useState(false);
  const [canRight, setRight] = useState(false);
  const SCROLL_BY            = 320 + 24;

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setLeft(el.scrollLeft > 4);
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', sync); ro.disconnect(); };
  }, [sync]);

  const scroll = (dir) =>
    trackRef.current?.scrollBy({ left: dir * SCROLL_BY * 2, behavior: 'smooth' });

  const btnBase =
    'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center ' +
    'w-10 h-10 rounded-full shadow-lg border transition-all duration-200 ' +
    'disabled:opacity-0 disabled:pointer-events-none focus:outline-none ';

  const btnStyle = darkMode
    ? 'bg-[#23233A] border-[#3A3A55] text-white hover:bg-[#F4A825] hover:border-[#F4A825] hover:text-[#1A1A2E]'
    : 'bg-white    border-gray-200  text-[#1A1A2E] hover:bg-[#F4A825] hover:border-[#F4A825] hover:text-[#1A1A2E]';

  return (
    <div className="relative">
      <button onClick={() => scroll(-1)} disabled={!canLeft}
        className={`${btnBase}${btnStyle} -left-5`} aria-label="Scroll left">
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>

      <div ref={trackRef}
        className="flex overflow-x-auto gap-6 pb-4 px-2 snap-x snap-mandatory carousel-track">
        {React.Children.map(children, (child) => (
          <div className="flex-shrink-0 w-[320px] snap-start">{child}</div>
        ))}
      </div>

      <button onClick={() => scroll(1)} disabled={!canRight}
        className={`${btnBase}${btnStyle} -right-5`} aria-label="Scroll right">
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RecipeModal
// ─────────────────────────────────────────────────────────────────────────────
function RecipeModal({ recipe, userIngredients, pantryItems, darkMode, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!recipe) return null;

  const userIngs     = Array.from(new Set([...userIngredients, ...pantryItems])).map(i => i.toLowerCase());
  const missing      = recipe.ingredients.filter(ing => !userIngs.includes(ing.toLowerCase()));
  const missingCount = missing.length;
  const total        = recipe.ingredients.length;
  const matchPercent = Math.round(((total - missingCount) / total) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box relative ${darkMode ? 'bg-[#1A1A2E] text-white' : 'bg-white text-[#1A1A2E]'}`}
        onClick={e => e.stopPropagation()}
      >
        <img src={recipe.image || FALLBACK_IMG} alt={recipe.title} loading="lazy"
          onError={handleImgError} className="w-full h-full object-cover" />
        <h2 className="text-3xl font-extrabold text-[#F4A825] mb-4 font-['Playfair_Display']">
          {recipe.title}
        </h2>

        <div className="flex flex-wrap gap-2 mb-6 pointer-events-none">
          {recipe.difficulty && (
            <span className={`badge-${recipe.difficulty.toLowerCase()} ${darkMode ? '!text-white' : ''}`}>
              {recipe.difficulty}
            </span>
          )}
          {recipe.spicy   && <span className="badge-fire">🔥 Spicy</span>}
          {recipe.healthy && <span className={`badge-easy ${darkMode ? '!text-white' : ''}`}>🥗 Healthy</span>}
        </div>

        <div className="mb-6">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : ''}`}>Ingredients Checklist</h3>
          <ul className="space-y-2.5">
            {recipe.ingredients.map(ing => {
              const has = userIngs.includes(ing.toLowerCase());
              return (
                <li key={ing}
                  className={`flex items-center gap-3 text-[15px] font-medium p-2 rounded-lg transition-colors
                    ${darkMode ? 'text-white hover:bg-[#2A2A40]' : 'text-[#1A1A2E] hover:bg-gray-50'}`}>
                  <span className={`${has ? 'bg-green-500' : 'bg-red-500'} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm font-bold`}>
                    {has ? '✓' : '✕'}
                  </span>
                  <span className="capitalize">{ing}</span>
                </li>
              );
            })}
          </ul>
          <div className="match-reason">
            {missingCount === 0
              ? '✅ You have 100% of the ingredients — cook it now!'
              : `⚡ You have ${matchPercent}% of ingredients — just grab ${missing.join(', ')}`}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(recipe.youtubeSearch), '_blank')}
            className="flex-1 bg-[#F4A825] hover:bg-[#E63946] text-[#1A1A2E] hover:text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <Play size={18} fill="currentColor" /> Watch on YouTube
          </button>
          <button onClick={onClose}
            className="flex-1 bg-white border-2 border-[#1A1A2E] text-[#1A1A2E] font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RecipeCard — single shared card used in ALL sections including Top Picks
// ─────────────────────────────────────────────────────────────────────────────
function RecipeCard({ recipe, type, onClick, index = 0, darkMode, showOnFire = false }) {
  const missingCount = recipe.missingCount || 0;
  const matchPercent = recipe.matchPercent || 100;

  return (
    <div
      className={`recipe-card group cursor-pointer flex flex-col h-full relative
        ${darkMode ? 'bg-[#23233A]' : 'bg-white'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onClick(recipe)}
    >
      <div className="relative h-[200px] bg-gray-100 overflow-hidden">
        <img src={recipe.image || FALLBACK_IMG} loading="lazy" onError={handleImgError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-[#1A1A2E]/0 group-hover:bg-[#1A1A2E]/20 transition-colors" />
        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2 pointer-events-none">
          {/* "On Fire" badge shown only in Top Picks for first 3 cards */}
          {showOnFire && <span className="badge-fire shadow-md">🔥 On Fire</span>}
          {recipe.prepTime && <div className="badge-time shadow-md">⏱️ {recipe.prepTime} min</div>}
          {recipe.storage  && (
            <div className="badge-storage shadow-md">
              {recipe.badgeType === 'freezer' ? '🧊' : '🌡️'} {recipe.storage}
            </div>
          )}
          {missingCount > 0 && (
            <div className="bg-[#E63946] text-white px-2 py-1 rounded-full text-[11px] font-bold shadow-md ml-auto">
              Missing {missingCount}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {recipe.storage && (
          <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider mb-2">Batch Cook</span>
        )}
        {/* Show cuisine label in Top Picks (when available) */}
        {recipe.cuisine && !recipe.storage && (
          <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-[#7EE2B8]' : 'text-[#2D6A4F]'}`}>
            {recipe.cuisine}
          </span>
        )}
        <h3 className={`text-xl font-bold mb-3 group-hover:text-[#F4A825] transition-colors line-clamp-2
          ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
          {recipe.title}
        </h3>
        <div className="mt-auto">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.ingredients?.slice(0, 5).map(ing => (
              <span key={ing}
                className={`ingredient-tag text-[11px] px-2 py-1 rounded-md font-medium capitalize border
                  ${darkMode ? 'bg-[#25253A] text-white border-[#3A3A55]' : 'bg-white text-[#1A1A2E] border-gray-200'}`}>
                {ing}
              </span>
            ))}
            {recipe.ingredients?.length > 5 && (
              <span className="text-[11px] px-1 py-1 text-gray-400 font-bold">
                +{recipe.ingredients.length - 5} more
              </span>
            )}
          </div>
          {type && (
            <div className={`match-reason line-clamp-1 ${darkMode ? 'text-gray-200' : 'text-[#1A1A2E]'}`}>
              {missingCount === 0
                ? '✅ You have 100% of the ingredients — cook it now!'
                : `⚡ You have ${matchPercent}% of ingredients`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [inputVal,    setInputVal]   = useState('');
  const [heroInput,   setHeroInput]  = useState('');
  const [pantryItems, setPantryItems]= useState(['salt','oil','water']);
  const [darkMode,    setDarkMode]   = useState(false);

  const [exactMatches,   setExactMatches]   = useState([]);
  const [partialMatches, setPartialMatches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading,     setLoading]     = useState(false);

  const [filters, setFilters] = useState({
    under10: false, spicy: false, healthy: false, breakfast: false, dinner: false,
  });

  const [topPicks,       setTopPicks]       = useState([]);
  const [quickRecipes,   setQuickRecipes]   = useState([]);   // ALL quick recipes, no cap
  const [mealPrepRecipes,setMealPrepRecipes]= useState([]);   // ALL meal-prep recipes, no cap
  const [cuisineRecipes, setCuisineRecipes] = useState({
    italian: [], indian: [], mexican: [], chinese: [],
  });

  const [activeCuisine,    setActiveCuisine]    = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedRecipe,   setSelectedRecipe]   = useState(null);

  const resultsRef = useRef(null);

  // Dark-mode body class
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // ── Fetch all data once ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [topRes, quickRes, prepRes, itRes, inRes, mxRes, cnRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/recipes/toppicks`).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/recipes/quick`).catch(()      => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/recipes/mealprep`).catch(()   => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/recipes/cuisine/italian`).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/recipes/cuisine/indian`).catch(()  => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/recipes/cuisine/mexican`).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/recipes/cuisine/chinese`).catch(() => ({ data: [] })),
        ]);

        // ── TOP PICKS — 24-hour localStorage rotation across ALL cuisines ──
        const allRecipes = [
          ...(topRes.data  || []),
          ...(itRes.data   || []),
          ...(inRes.data   || []),
          ...(mxRes.data   || []),
          ...(cnRes.data   || []),
        ];
        const deduped = Array.from(new Map(allRecipes.map(r => [r.id, r])).values());

        const stored = (() => {
          try { return JSON.parse(localStorage.getItem('topPicksCache') || 'null'); } catch { return null; }
        })();
        const now = Date.now();
        if (stored && stored.timestamp && (now - stored.timestamp) < 24 * 60 * 60 * 1000 && stored.picks?.length) {
          setTopPicks(stored.picks);
        } else {
          const shuffled = dailyShuffle(deduped).slice(0, 4);
          setTopPicks(shuffled);
          try { localStorage.setItem('topPicksCache', JSON.stringify({ timestamp: now, picks: shuffled })); } catch {}
        }

        // ── QUICK BITES — ALL recipes, no slice cap ──
        setQuickRecipes(quickRes.data || []);

        // ── MEAL PREP — ALL recipes, no slice cap ──
        setMealPrepRecipes(prepRes.data || []);

        setCuisineRecipes({
          italian: itRes.data || [],
          indian:  inRes.data || [],
          mexican: mxRes.data || [],
          chinese: cnRes.data || [],
        });
      } catch (err) {
        console.error('Error fetching initial data', err);
      }
    })();
  }, []);

  // ── Ingredient helpers ───────────────────────────────────────────────────
  const toggleIngredient = (v) =>
    setSelectedIngredients(prev =>
      prev.includes(v) ? prev.filter(i => i !== v) : [...prev, v]);

  const togglePantryItem = (item) =>
    setPantryItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

  const toggleFilter = (key) => setFilters(prev => ({ ...prev, [key]: !prev[key] }));

  const handleCustomAdd = (e) => {
    e.preventDefault();
    const val = inputVal.trim().toLowerCase();
    if (val && !selectedIngredients.includes(val))
      setSelectedIngredients(prev => [...prev, val]);
    setInputVal('');
  };

  const handleAddHeroIngredient = () => {
    const val = heroInput.trim().toLowerCase();
    if (val && !selectedIngredients.includes(val))
      setSelectedIngredients(prev => [...prev, val]);
    setHeroInput('');
    document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearAllIngredients = () => {
    setSelectedIngredients([]); setExactMatches([]); setPartialMatches([]); setHasSearched(false);
  };

  const fetchRandomRecipe = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/recipes/random`);
      setSelectedRecipe(res.data);
    } catch (err) { console.error(err); }
  };

  const searchRecipes = async () => {
    if (!selectedIngredients.length && !pantryItems.length) return;
    setLoading(true); setHasSearched(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/recipes/search`,
        { selectedIngredients, pantryItems });
      setExactMatches(res.data.exactMatches || []);
      setPartialMatches(res.data.partialMatches || []);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const applyFilters = (list) => list.filter(r => {
    if (filters.under10   && r.prepTime > 10)            return false;
    if (filters.spicy     && !r.spicy)                   return false;
    if (filters.healthy   && !r.healthy)                 return false;
    if (filters.breakfast && r.mealType !== 'breakfast') return false;
    if (filters.dinner    && r.mealType !== 'dinner')    return false;
    return true;
  });

  const filteredExact   = applyFilters(exactMatches);
  const filteredPartial = applyFilters(partialMatches);

  // ── Cuisine data ─────────────────────────────────────────────────────────
  const CUISINES = [
    { id: 'italian', name: 'Italian', emoji: '🍕', tagline: 'Pasta, Pizza & More',
      bg: 'linear-gradient(135deg,#C0392B,#E67E22)' },
    { id: 'indian',  name: 'Indian',  emoji: '🍛', tagline: 'Bold Spices, Rich Flavors',
      bg: 'linear-gradient(135deg,#F4A825,#E67E22)' },
    { id: 'mexican', name: 'Mexican', emoji: '🌮', tagline: 'Vibrant & Zesty',
      bg: 'linear-gradient(135deg,#27AE60,#2ECC71)' },
    { id: 'chinese', name: 'Chinese', emoji: '🥢', tagline: 'Wok-Fired Classics',
      bg: 'linear-gradient(135deg,#C0392B,#F39C12)' },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleCuisineClick = (id) => {
    const next = activeCuisine === id ? null : id;
    setActiveCuisine(next);
    if (next) setTimeout(() =>
      document.getElementById('cuisine-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  // Floating emojis
  const EMOJI_CHARS = ['🍕','🍜','🥗','🍳','🌮','🍛','🥘','🧆','🍝','🥞','🫕','🍱','🥦','🧅'];
  const heroFloats  = EMOJI_CHARS.map(() => ({
    delay:    `${Math.random() * 7}s`,
    duration: `${7 + Math.random() * 9}s`,
    left:     `${5 + Math.random() * 90}%`,
    top:      `${10 + Math.random() * 70}%`,
  }));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-20 overflow-x-hidden transition-colors duration-300">

      {/* Global carousel scrollbar style */}
      <style>{`
        .carousel-track {
          scrollbar-width: thin;
          scrollbar-color: #F4A825 transparent;
        }
        .carousel-track::-webkit-scrollbar        { height: 5px; }
        .carousel-track::-webkit-scrollbar-track  { background: transparent; border-radius: 99px; }
        .carousel-track::-webkit-scrollbar-thumb  { background: #F4A825; border-radius: 99px; }
        .carousel-track::-webkit-scrollbar-thumb:hover { background: #E63946; }
      `}</style>

      {/* ── NAV ── */}
      <nav className="navbar">
        <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logo} alt="Culina Logo" className="h-12 object-contain" />
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[['search','Search'],['quick-bites','Quick Bites'],['by-cuisine','By Cuisine'],['meal-prep','Meal Prep'],['top-picks','Top Picks']].map(([id,label]) => (
            <button key={id} onClick={() => scrollTo(id)} className="nav-link">{label}</button>
          ))}
        </div>
        <button onClick={() => setDarkMode(d => !d)}
          className="text-[#9CA3AF] hover:text-[#F4A825] transition-colors ml-4 focus:outline-none">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(o => !o)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1A1A2E] border-t border-gray-700 flex flex-col p-4 space-y-4 shadow-xl fixed w-full z-50">
          {[['search','Search'],['top-picks','Top Picks'],['quick-bites','Quick Bites']].map(([id,label]) => (
            <button key={id} onClick={() => scrollTo(id)} className="text-left font-medium text-gray-300 hover:text-[#F4A825]">{label}</button>
          ))}
        </div>
      )}

      {/* Floating Surprise Me */}
      <button onClick={fetchRandomRecipe}
        style={{ transitionProperty: 'max-width,opacity,box-shadow' }}
        className="fixed bottom-[28px] right-[28px] z-[99] bg-[#E63946] text-white rounded-full flex items-center shadow-[0_8px_30px_rgba(230,57,70,0.4)] hover:shadow-[0_12px_40px_rgba(230,57,70,0.6)] cursor-pointer overflow-hidden transition-all duration-300 h-[56px] w-[56px] hover:w-[180px] group glow-pulse"
        title="Feeling lucky? Try a random recipe">
        <span className="text-2xl min-w-[56px] flex items-center justify-center">🎲</span>
        <span className="whitespace-nowrap font-bold text-[15px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-2">Surprise Me</span>
      </button>

      {/* ── HERO ── */}
      <section className="relative py-24 z-10 text-center overflow-hidden">
        {heroFloats.map((e, i) => (
          <div key={i} className="float-emoji"
            style={{ left: e.left, top: e.top, animationDuration: e.duration, animationDelay: e.delay }}>
            {EMOJI_CHARS[i]}
          </div>
        ))}
        <div className="relative z-10 px-4">
          <h1 className="text-6xl md:text-8xl mb-6 tracking-tight">
            <span className="hero-title-cook" style={{ color: darkMode ? '#F4A825' : '' }}>Cook</span>{' '}
            <span className="hero-title-rest">What You Have</span>
          </h1>
          <p className="text-xl text-[#6B7280] mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
            Tell us what's in your kitchen. We'll tell you what to cook.
          </p>
          <div className="relative mx-auto w-full max-w-[680px]">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input type="text"
              placeholder="Type an ingredient... e.g. potato, eggs, tomato"
              value={heroInput}
              onChange={e => setHeroInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddHeroIngredient(); }}
              className="block w-full h-[64px] pl-16 pr-[68px] rounded-full bg-white text-[#1A1A2E] text-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] border-2 border-transparent focus:outline-none focus:border-[#F4A825] focus:shadow-[0_8px_48px_rgba(244,168,37,0.3)] transition-all font-medium placeholder-gray-400" />
            <button onClick={handleAddHeroIngredient}
              className="absolute inset-y-0 right-2 my-auto h-[48px] w-[48px] flex items-center justify-center rounded-full bg-[#F4A825] hover:bg-[#E63946] text-[#1A1A2E] hover:text-white transition-colors cursor-pointer shadow-md">
              <span className="text-[14px] font-bold">→</span>
            </button>
          </div>
          <p className="mt-4 text-[#6B7280] text-[13px] font-medium">Or pick from popular ingredients below ↓</p>
        </div>
      </section>

      {/* ── TOP PICKS ──
          Now uses the same RecipeCard as every other section.
          showOnFire prop adds "🔥 On Fire" badge to first 3 cards.
      ── */}
      <section id="top-picks" className="top-picks-section relative w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="top-picks-title">Top Picks 🔥</h2>
            <p className="section-subtitle text-gray-400">Our most requested recipes of the week</p>
          </div>
          {topPicks.length === 0
            ? <div className="text-center w-full py-10 text-gray-400 font-semibold">Loading recipes...</div>
            : (
              <Carousel darkMode={darkMode}>
                {topPicks.map((recipe, idx) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={setSelectedRecipe}
                    index={idx}
                    darkMode={darkMode}
                    showOnFire={idx < 3}
                  />
                ))}
              </Carousel>
            )
          }
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28 relative pt-20">

        {/* ── INGREDIENT SEARCH ── */}
        <section id="search" className="relative z-10">
          <div className="bg-white rounded-3xl p-8 max-w-5xl mx-auto border border-gray-200 shadow-[0_20px_60px_rgba(26,26,46,0.06)]">

            {/* Pantry basics */}
            <div className="mb-8 p-5 bg-[#2D6A4F]/5 rounded-2xl border border-[#2D6A4F]/20">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-base font-bold text-[#2D6A4F]">✅ I already have these basics</h3>
                <span className="text-sm text-[#2D6A4F]/70 font-medium hidden sm:inline">— These won't count as missing</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {BASIC_PANTRY_ITEMS.map(item => (
                  <button key={item} onClick={() => togglePantryItem(item)}
                    className={pantryItems.includes(item) ? 'pantry-checked' : 'pantry-unchecked'}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-[#F4A825] tracking-wide mb-1">🥕 Pick Your Ingredients</h3>
              {selectedIngredients.length > 0 && (
                <button onClick={clearAllIngredients}
                  className="text-xs font-bold px-3 py-1.5 rounded-full border border-[#E63946] text-[#E63946] hover:bg-[#F4A825] hover:text-[#1A1A2E] hover:border-[#F4A825] transition-all">
                  ✕ Clear All
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {COMMON_INGREDIENTS.map(ing => (
                <button key={ing.name} onClick={() => toggleIngredient(ing.name)}
                  className={selectedIngredients.includes(ing.name) ? 'chip-selected' : 'chip-unselected'}>
                  <span className="mr-1.5">{ing.emoji}</span>
                  <span className="capitalize">{ing.name}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <form onSubmit={handleCustomAdd} className="flex-1 relative">
                <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
                  placeholder="Type an ingredient and press enter..."
                  className="w-full pl-5 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#F4A825]/20 focus:border-[#F4A825] transition-all font-medium text-[#1A1A2E] text-lg bg-gray-50" />
                <button type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#F4A825] bg-[#F4A825]/10 rounded-xl hover:bg-[#F4A825] hover:text-[#1A1A2E] transition-colors">
                  <Plus size={22} />
                </button>
              </form>
            </div>

            {/* Lowercase search tip */}
            <p className="text-xs text-[#6B7280] mb-8 font-medium">
              💡 Tip: Add ingredients in lowercase (example: chicken, onion, tomato) for better recipe matching.
            </p>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-t border-gray-100 pt-8 gap-6">
              <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto no-scrollbar pb-2 flex-1 w-full"
                style={{ alignContent: 'flex-start' }}>
                {selectedIngredients.length > 0
                  ? selectedIngredients.map(ing => (
                    <span key={ing} className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1A1A2E] text-white text-sm font-bold rounded-xl whitespace-nowrap shadow-md">
                      {getIngredientEmoji(ing)} <span className="capitalize">{ing}</span>
                      <button onClick={() => toggleIngredient(ing)} className="hover:text-[#E63946] transition-colors ml-1">
                        <X size={14} />
                      </button>
                    </span>
                  ))
                  : <span className="text-[15px] text-[#6B7280] italic font-medium pt-2">No ingredients selected yet...</span>
                }
              </div>
              <button onClick={searchRecipes}
                disabled={(!selectedIngredients.length && !pantryItems.length) || loading}
                className="btn-primary w-full md:w-auto flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-4 px-8 shadow-xl whitespace-nowrap">
                {loading
                  ? <div className="w-5 h-5 border-2 border-[#1A1A2E]/30 border-t-[#1A1A2E] rounded-full animate-spin" />
                  : <><Search size={20} /> Find Recipes</>}
              </button>
            </div>
          </div>

          {/* Filter bar */}
          {hasSearched && (
            <div className="mt-12 mb-8" ref={resultsRef}>
              <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-sm font-bold text-[#6B7280] mr-2">Filter Results:</span>
                {[['under10','🕒 Under 10 min'],['spicy','🌶 Spicy'],['healthy','🥗 Healthy'],['breakfast','🍳 Breakfast'],['dinner','🌙 Dinner']].map(([k,label]) => (
                  <button key={k} onClick={() => toggleFilter(k)}
                    className={filters[k] ? 'filter-chip-active' : 'filter-chip-inactive'}>{label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Cook Now + Partial Matches */}
          {hasSearched && (
            <div className="space-y-16">
              <section>
                <hr className="border-t border-[#F4A825]/30 mb-8" />
                <div className="flex items-center gap-4 mb-8 pb-4">
                  <h2 className="section-title mb-0">Cook Now</h2>
                  <span className="text-sm font-bold text-white bg-[#2D6A4F] px-4 py-1.5 rounded-full shadow-sm mt-1">
                    {filteredExact.length} Recipes
                  </span>
                </div>
                {filteredExact.length > 0
                  ? <Carousel darkMode={darkMode}>
                      {filteredExact.map((r, i) => <RecipeCard key={r.id} recipe={r} type="exact" onClick={setSelectedRecipe} index={i} darkMode={darkMode} />)}
                    </Carousel>
                  : <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100 shadow-sm">
                      <div className="text-6xl mb-4">🍽️</div>
                      <p className="text-xl font-medium">No recipes matched all your ingredients exactly.</p>
                    </div>
                }
              </section>

              <section>
                <hr className="border-t border-[#E63946]/30 mb-8" />
                <div className="flex items-center gap-4 mb-8 pb-4">
                  <h2 className="section-title mb-0">Partial Matches</h2>
                  <span className="text-sm font-bold text-white bg-[#E63946] px-4 py-1.5 rounded-full shadow-sm mt-1">
                    {filteredPartial.length} Recipes
                  </span>
                </div>
                {filteredPartial.length > 0
                  ? <Carousel darkMode={darkMode}>
                      {filteredPartial.map((r, i) => <RecipeCard key={r.id} recipe={r} type="partial" onClick={setSelectedRecipe} index={i} darkMode={darkMode} />)}
                    </Carousel>
                  : <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100 shadow-sm">
                      <p className="text-xl font-medium">No partial matches found.</p>
                    </div>
                }
              </section>
            </div>
          )}
        </section>

        {/* ── QUICK BITES — ALL recipes from API, no slice cap ── */}
        <section id="quick-bites" className="pt-8">
          <div className="mb-10 text-center">
            <h2 className="section-title text-[#F4A825]">Quick Bites ⚡</h2>
            <p className="section-subtitle">Ready in 10 minutes or less</p>
          </div>
          {quickRecipes.length === 0
            ? <div className="text-center py-10 text-gray-400 font-semibold">Loading recipes...</div>
            : (
              <Carousel darkMode={darkMode}>
                {quickRecipes.map((r, i) => (
                  <RecipeCard key={r.id} recipe={r} onClick={setSelectedRecipe} index={i} darkMode={darkMode} />
                ))}
              </Carousel>
            )
          }
        </section>

        {/* ── EXPLORE BY CUISINE ── */}
        <section id="by-cuisine" className="pt-8">
          <div className="text-center mb-14">
            <h2 className="section-title text-[#F4A825]">Explore World Cuisines 🌍</h2>
            <p className="section-subtitle">Discover fresh flavors straight from the kitchen</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {CUISINES.map(cuisine => {
              const active = activeCuisine === cuisine.id;
              return (
                <div
                  key={cuisine.id}
                  onClick={() => handleCuisineClick(cuisine.id)}
                  className={`relative flex flex-col items-center justify-center text-white text-center
                    rounded-3xl p-8 cursor-pointer overflow-hidden
                    transition-all duration-300 select-none
                    ${active ? 'ring-4 ring-white ring-offset-4 ring-offset-[#1A1A2E] scale-[1.02]' : 'hover:scale-[1.02] hover:shadow-2xl'}`}
                  style={{ background: cuisine.bg, minHeight: '280px' }}
                >
                  <span className="absolute -bottom-4 -right-4 text-[120px] opacity-10 pointer-events-none select-none leading-none">
                    {cuisine.emoji}
                  </span>
                  <span className="text-6xl mb-5 drop-shadow-lg relative z-10">{cuisine.emoji}</span>
                  <h3 className="text-2xl font-extrabold mb-2 drop-shadow-md relative z-10"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    {cuisine.name}
                  </h3>
                  <p className="text-white/90 font-medium mb-6 text-[14px] relative z-10">{cuisine.tagline}</p>
                  <button className="relative z-10 bg-[#1A1A2E] hover:bg-white hover:text-[#1A1A2E] text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-colors shadow-lg">
                    {active ? 'Close ✕' : 'Explore →'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Expanded cuisine recipes */}
          {activeCuisine && (
            <div id="cuisine-panel" className="mt-10 p-8 bg-white rounded-3xl shadow-xl border border-gray-100 relative">
              <button onClick={() => setActiveCuisine(null)}
                className="absolute top-6 right-6 p-3 hover:bg-[#E63946] hover:text-white rounded-full transition-colors text-gray-500 bg-gray-50 border border-gray-200">
                <X size={22} />
              </button>
              <h3 className="text-3xl font-extrabold text-[#1A1A2E] capitalize flex items-center gap-4 mb-8 pb-6 border-b border-gray-200"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {CUISINES.find(c => c.id === activeCuisine)?.emoji}{' '}
                {activeCuisine} Classics
              </h3>
              <Carousel darkMode={darkMode}>
                {cuisineRecipes[activeCuisine]?.map((r, i) => (
                  <RecipeCard key={r.id} recipe={r} onClick={setSelectedRecipe} index={i} darkMode={darkMode} />
                ))}
              </Carousel>
            </div>
          )}
        </section>

        {/* ── MEAL PREP — ALL recipes from API, no slice cap ── */}
        <section id="meal-prep" className="pb-10 pt-8">
          <div className="mb-10 text-center">
            <h2 className="section-title text-[#F4A825]">Cook Once, Eat All Week 🏠</h2>
            <p className="section-subtitle">Smart recipes you can batch cook and store</p>
          </div>
          {mealPrepRecipes.length === 0
            ? <div className="text-center py-10 text-gray-400 font-semibold">Loading recipes...</div>
            : (
              <Carousel darkMode={darkMode}>
                {mealPrepRecipes.map((r, i) => (
                  <RecipeCard key={r.id} recipe={r} onClick={setSelectedRecipe} index={i} darkMode={darkMode} />
                ))}
              </Carousel>
            )
          }
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1A1A2E] border-t-4 border-t-[#F4A825] mt-24 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
          <img src={logo} alt="Culina Logo" className="h-14 object-contain" />
          <div className="flex gap-8 flex-wrap justify-center">
            {[['search','Search'],['quick-bites','Quick'],['by-cuisine','Cuisines'],['meal-prep','Prep']].map(([id,label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="nav-link">{label}</button>
            ))}
          </div>
          <p className="text-sm font-semibold text-[#6B7280]">
            Made with <span className="text-[#E63946]">❤️</span> for home cooks everywhere
          </p>
        </div>
      </footer>

      <RecipeModal
        recipe={selectedRecipe}
        userIngredients={selectedIngredients}
        pantryItems={pantryItems}
        darkMode={darkMode}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}