
export type ScoreValue = 0 | 0.5 | 1;

export interface IndicatorRule {
    id: string;
    label: string;
    weight: number;
    options: {
        value: string;
        label: string;
        score: ScoreValue;
    }[];
}

export const SCORING_RULES: IndicatorRule[] = [
    {
        id: 'realGdpGrowth',
        label: 'Real GDP Growth',
        weight: 20,
        options: [
            { value: 'strong', label: 'YoY > 1%', score: 0 },
            { value: 'slow', label: '0–1% or 1 negative quarter', score: 0.5 },
            { value: 'negative', label: '2 consecutive negative quarters', score: 1 },
        ],
    },
    {
        id: 'unemploymentRateTrend',
        label: 'Unemployment Rate Trend',
        weight: 15,
        options: [
            { value: 'stable', label: 'Stable / falling', score: 0 },
            { value: 'rising_slow', label: 'Rising < 0.5%', score: 0.5 },
            { value: 'rising_fast', label: 'Rising ≥ 0.5% (3–6 months)', score: 1 },
        ],
    },
    {
        id: 'industrialProduction',
        label: 'Industrial Production',
        weight: 10,
        options: [
            { value: 'growing', label: 'Growing', score: 0 },
            { value: 'flat', label: 'Flat', score: 0.5 },
            { value: 'contracting', label: 'Contracting', score: 1 },
        ],
    },
    {
        id: 'retailSales',
        label: 'Real Retail Sales',
        weight: 15,
        options: [
            { value: 'growing', label: 'Growing', score: 0 },
            { value: 'flat', label: 'Flat', score: 0.5 },
            { value: 'declining', label: 'Declining', score: 1 },
        ],
    },
    {
        id: 'inflation',
        label: 'Inflation Pressure (CPI Momentum)',
        weight: 10,
        options: [
            { value: 'stable', label: 'Inflation falling / stable', score: 0 },
            { value: 'elevated', label: 'Elevated but stable', score: 0.5 },
            { value: 'rising', label: 'Rising sharply', score: 1 },
        ],
    },
    {
        id: 'capacityUtilization',
        label: 'Capacity Utilization',
        weight: 5,
        options: [
            { value: 'high', label: 'High / rising', score: 0 },
            { value: 'flat', label: 'Flat', score: 0.5 },
            { value: 'falling', label: 'Falling', score: 1 },
        ],
    },
    {
        id: 'bankCreditGrowth',
        label: 'Bank Credit Growth',
        weight: 15,
        options: [
            { value: 'expanding', label: 'Expanding', score: 0 },
            { value: 'slowing', label: 'Slowing', score: 0.5 },
            { value: 'contracting', label: 'Contracting', score: 1 },
        ],
    },
    {
        id: 'housingActivity',
        label: 'Housing Activity',
        weight: 10,
        options: [
            { value: 'rising', label: 'Rising', score: 0 },
            { value: 'flat', label: 'Flat', score: 0.5 },
            { value: 'declining', label: 'Declining', score: 1 },
        ],
    },
];

export interface CountryData {
    id: string; // ISO3
    geoId?: string; // M49 Numeric String for map matching
    name: string;
    rank: number; // GDP Ranking
    indicators: Record<string, string>; // key: rule.id, value: option.value
}

export const calculateRecessionScore = (indicators: Record<string, string>): number => {
    let totalScore = 0;

    SCORING_RULES.forEach((rule) => {
        const value = indicators[rule.id];
        const option = rule.options.find((o) => o.value === value);
        if (option) {
            totalScore += option.score * rule.weight;
        }
    });

    return totalScore;
};

export const getRecessionStatus = (score: number) => {
    // Interpolate color: 0 = Green, 50 = Yellow/Orange, 100 = Red
    // Green: #10b981 (16, 185, 129)
    // Yellow: #f59e0b (245, 158, 11)
    // Red: #ef4444 (239, 68, 68)

    let r, g, b;

    if (score <= 50) {
        // Green to Yellow
        const t = score / 50;
        r = Math.round(16 + (245 - 16) * t);
        g = Math.round(185 + (158 - 185) * t);
        b = Math.round(129 + (11 - 129) * t);
    } else {
        // Yellow to Red
        const t = (score - 50) / 50;
        r = Math.round(245 + (239 - 245) * t);
        g = Math.round(158 + (68 - 158) * t);
        b = Math.round(11 + (68 - 11) * t);
    }

    const color = `rgb(${r}, ${g}, ${b})`;

    if (score < 30) return { label: 'Expansion', color };
    if (score < 60) return { label: 'Warning', color };
    return { label: 'Recession', color };
};
