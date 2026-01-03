
import { useState, useEffect } from 'react';
import { WorldMap } from './components/WorldMap';
import { ScoreCard } from './components/ScoreCard';
import { MethodologyModal } from './components/MethodologyModal'; // Imported
import { generateMockData } from './data/countries';
import { calculateRecessionScore, getRecessionStatus } from './utils/scoring';
import { Globe, BarChart3, Search, RefreshCw, Loader2 } from 'lucide-react';
import type { CountryData as ScoringCountryData } from './utils/scoring';
import { fetchWorldBankData, mapRealDataToIndicators } from './utils/worldBank';

function App() {
  const [data, setData] = useState<ScoringCountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<ScoringCountryData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRealDataLoading, setIsRealDataLoading] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false); // New state

  useEffect(() => {
    // Initial load with mock data
    const initialData = generateMockData();
    setData(initialData);

    // Auto-fetch real data
    const loadRealData = async () => {
      setIsRealDataLoading(true);
      try {
        const wbData = await fetchWorldBankData(initialData);

        setData(currentData => {
          return currentData.map(country => {
            const realUpdates = mapRealDataToIndicators(country.id, wbData) as Record<string, string>;

            // Merge real data if found
            if (Object.keys(realUpdates).length > 0) {
              return {
                ...country,
                indicators: {
                  ...country.indicators,
                  ...realUpdates
                }
              };
            }
            return country;
          });
        });
        setUseRealData(true);
      } catch (error) {
        console.error("Failed to load real data", error);
      } finally {
        setIsRealDataLoading(false);
      }
    };

    loadRealData();
  }, []);

  const filteredCountries = data
    .map(country => ({ ...country, calculatedScore: calculateRecessionScore(country.indicators) })) // Add score for sorting
    .sort((a, b) => b.calculatedScore - a.calculatedScore) // Sort by Risk Score (Descending)
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">

      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur fixed top-0 w-full z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Globe size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Bubble Boy: Global Recession Monitor
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-500
             ${useRealData
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
            {isRealDataLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            {useRealData ? 'Live World Bank Data' : isRealDataLoading ? 'Connecting to World Bank...' : 'Simulation Data'}
          </div>
          <div className="text-sm font-medium text-slate-400 hidden md:block">
            Monitoring top 50 global economies
          </div>
          <button
            onClick={() => setShowMethodology(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors"
          >
            Methodology
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-6 pb-6 h-screen flex gap-6">

        {/* Map Section */}
        <div className="flex-1 h-full flex flex-col min-h-0">
          <WorldMap data={data} onSelectCountry={setSelectedCountry} />
        </div>

        {/* Sidebar List */}
        <div className="w-80 bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col h-full overflow-hidden shrink-0 hidden lg:flex">
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 size={18} />
              Recession Risk Rankings
            </h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search country..."
                className="w-full bg-slate-800 text-sm text-white pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredCountries.map((country, index) => {
              const score = country.calculatedScore;
              const status = getRecessionStatus(score);

              return (
                <button
                  key={country.id}
                  onClick={() => setSelectedCountry(country)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 w-5 text-center">{index + 1}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{country.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5" style={{ color: status.color }}>
                        {status.label}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-sm" style={{ color: status.color }}>
                    {score}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Country Modal */}
      {selectedCountry && (
        <ScoreCard country={selectedCountry} onClose={() => setSelectedCountry(null)} />
      )}

      {/* Methodology Modal */}
      {showMethodology && (
        <MethodologyModal onClose={() => setShowMethodology(false)} />
      )}
    </div>
  );
}

export default App;
