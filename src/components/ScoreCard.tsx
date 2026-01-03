
import React from 'react';
import { SCORING_RULES, calculateRecessionScore, getRecessionStatus } from '../utils/scoring';
import type { CountryData } from '../utils/scoring';
import { X } from 'lucide-react';

interface ScoreCardProps {
    country: CountryData;
    onClose: () => void;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ country, onClose }) => {
    const score = calculateRecessionScore(country.indicators);
    const status = getRecessionStatus(score);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            {country.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm text-slate-400 font-medium tracking-widest uppercase">Global Rank #{country.rank}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Score Report */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Main Score Display */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-2">Recession Score</span>
                        <div className="relative flex items-center justify-center">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-slate-800"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke={status.color} // Dynamic color
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * score) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black">{score}</span>
                                <span className="text-xs text-slate-400">/ 100</span>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <div
                                className="px-4 py-1.5 rounded-full text-sm font-bold shadow-lg"
                                style={{ backgroundColor: status.color, color: '#000' }} // Black text on color usually readable 
                            >
                                {status.label}
                            </div>
                        </div>
                    </div>

                    {/* Core Stats Summary */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-l-4 border-indigo-500 pl-3">Economic Overview</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Analysis based on 8 key macroeconomic indicators. Higher scores indicate higher recession risk.
                            The weighted evaluation focuses on Core Activity (45%), Consumption (30%), and Credit (25%).
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                                <div className="text-xs text-slate-500 uppercase">Evaluation</div>
                                <div className="font-semibold text-slate-200">Weighted</div>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                                <div className="text-xs text-slate-500 uppercase">Signal</div>
                                <div className="font-semibold" style={{ color: status.color }}>{status.label}</div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Detailed Indicator List */}
                <div className="p-6 pt-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Indicator Breakdown</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {SCORING_RULES.map((rule) => {
                            const currentValue = country.indicators[rule.id];
                            const selectedOption = rule.options.find(o => o.value === currentValue);
                            const pointsContributed = (selectedOption?.score || 0) * rule.weight;

                            // Color code the specific row
                            let rowBorder = 'border-slate-700'; // Neutral
                            if (selectedOption?.score === 0) rowBorder = 'border-emerald-500/30 bg-emerald-500/5';
                            if (selectedOption?.score === 0.5) rowBorder = 'border-amber-500/30 bg-amber-500/5';
                            if (selectedOption?.score === 1) rowBorder = 'border-red-500/30 bg-red-500/5';

                            return (
                                <div key={rule.id} className={`flex items-center justify-between p-4 rounded-xl border ${rowBorder} transition-colors`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-200">{rule.label}</span>
                                            <span className="text-xs font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Weight: {rule.weight}</span>
                                        </div>
                                        <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                            {selectedOption?.label}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold tabular-nums">+{pointsContributed}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Risk Pts</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};
