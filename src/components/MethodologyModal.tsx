
import React from 'react';
import { SCORING_RULES } from '../utils/scoring';
import { X } from 'lucide-react';

interface MethodologyModalProps {
    onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Recession Scoring Methodology</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            How we calculate economic risk scores (0-100) using 8 weighted indicators.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-3">The Scoring Formula</h3>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            The Global Recession Monitor uses a composite index based on 8 key macroeconomic indicators.
                            Each indicator is assigned a weight reflecting its predictive power for economic downturns.
                            The final score is a weighted sum ranging from <strong>0 (Strong Expansion)</strong> to <strong>100 (Deep Recession Risk)</strong>.
                        </p>
                        <div className="mt-4 flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-slate-300">0-30: Expansion</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-slate-300">30-60: Warning Phase</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-slate-300">60-100: Recession Risk</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {SCORING_RULES.map((rule) => (
                            <div key={rule.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-indigo-400">{rule.label}</h4>
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono">
                                        Weight: {rule.weight}%
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {rule.options.map((opt) => (
                                        <div key={opt.value} className="flex items-start gap-3 text-sm">
                                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${opt.score === 0 ? 'bg-emerald-500' :
                                                    opt.score === 0.5 ? 'bg-amber-500' : 'bg-red-500'
                                                }`}></div>
                                            <div className="flex-1">
                                                <span className="text-slate-300">{opt.label}</span>
                                            </div>
                                            <div className="text-slate-500 font-mono text-xs">
                                                +{opt.score * rule.weight} pts
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm text-indigo-200">
                        <strong>Data Sources:</strong> Real-time data is fetched using the World Bank API for major indicators (GDP, Unemployment, Inflation) where available.
                        Secondary indicators are simulated based on regional economic profiles for demonstration purposes.
                    </div>

                </div>
            </div>
        </div>
    );
};
