
import { SCORING_RULES } from '../utils/scoring';
import type { CountryData } from '../utils/scoring';

// Added geoId (M49 string) for map matching
export const TOP_50_COUNTRIES = [
    { id: 'USA', geoId: '840', name: 'United States', rank: 1 },
    { id: 'CHN', geoId: '156', name: 'China', rank: 2 },
    { id: 'DEU', geoId: '276', name: 'Germany', rank: 3 },
    { id: 'JPN', geoId: '392', name: 'Japan', rank: 4 },
    { id: 'IND', geoId: '356', name: 'India', rank: 5 },
    { id: 'GBR', geoId: '826', name: 'United Kingdom', rank: 6 },
    { id: 'FRA', geoId: '250', name: 'France', rank: 7 },
    { id: 'ITA', geoId: '380', name: 'Italy', rank: 8 },
    { id: 'BRA', geoId: '076', name: 'Brazil', rank: 9 },
    { id: 'CAN', geoId: '124', name: 'Canada', rank: 10 },
    { id: 'RUS', geoId: '643', name: 'Russia', rank: 11 },
    { id: 'MEX', geoId: '484', name: 'Mexico', rank: 12 },
    { id: 'KOR', geoId: '410', name: 'South Korea', rank: 13 },
    { id: 'AUS', geoId: '036', name: 'Australia', rank: 14 },
    { id: 'ESP', geoId: '724', name: 'Spain', rank: 15 },
    { id: 'IDN', geoId: '360', name: 'Indonesia', rank: 16 },
    { id: 'TUR', geoId: '792', name: 'Turkey', rank: 17 },
    { id: 'NLD', geoId: '528', name: 'Netherlands', rank: 18 },
    { id: 'SAU', geoId: '682', name: 'Saudi Arabia', rank: 19 },
    { id: 'CHE', geoId: '756', name: 'Switzerland', rank: 20 },
    { id: 'POL', geoId: '616', name: 'Poland', rank: 21 },
    { id: 'SWE', geoId: '752', name: 'Sweden', rank: 22 },
    { id: 'BEL', geoId: '056', name: 'Belgium', rank: 23 },
    { id: 'ARG', geoId: '032', name: 'Argentina', rank: 24 },
    { id: 'THA', geoId: '764', name: 'Thailand', rank: 25 },
    { id: 'AUT', geoId: '040', name: 'Austria', rank: 26 },
    { id: 'IRN', geoId: '364', name: 'Iran', rank: 27 },
    { id: 'ARE', geoId: '784', name: 'United Arab Emirates', rank: 28 },
    { id: 'NOR', geoId: '578', name: 'Norway', rank: 29 },
    { id: 'NGA', geoId: '566', name: 'Nigeria', rank: 30 },
    { id: 'ISR', geoId: '376', name: 'Israel', rank: 31 },
    { id: 'IRL', geoId: '372', name: 'Ireland', rank: 32 },
    { id: 'EGY', geoId: '818', name: 'Egypt', rank: 33 },
    { id: 'DNK', geoId: '208', name: 'Denmark', rank: 34 },
    { id: 'SGP', geoId: '702', name: 'Singapore', rank: 35 },
    { id: 'MYS', geoId: '458', name: 'Malaysia', rank: 36 },
    { id: 'PHL', geoId: '608', name: 'Philippines', rank: 37 },
    { id: 'VNM', geoId: '704', name: 'Vietnam', rank: 38 },
    { id: 'ZAF', geoId: '710', name: 'South Africa', rank: 39 },
    { id: 'BGD', geoId: '050', name: 'Bangladesh', rank: 40 },
    { id: 'COL', geoId: '170', name: 'Colombia', rank: 41 },
    { id: 'CHL', geoId: '152', name: 'Chile', rank: 42 },
    { id: 'FIN', geoId: '246', name: 'Finland', rank: 43 },
    { id: 'PAK', geoId: '586', name: 'Pakistan', rank: 44 },
    { id: 'ROU', geoId: '642', name: 'Romania', rank: 45 },
    { id: 'CZE', geoId: '203', name: 'Czech Republic', rank: 46 },
    { id: 'PRT', geoId: '620', name: 'Portugal', rank: 47 },
    { id: 'NZL', geoId: '554', name: 'New Zealand', rank: 48 },
    { id: 'PER', geoId: '604', name: 'Peru', rank: 49 },
    { id: 'KAZ', geoId: '398', name: 'Kazakhstan', rank: 50 },
];

export const generateMockData = (): CountryData[] => {
    return TOP_50_COUNTRIES.map((country) => {
        const indicators: Record<string, string> = {};

        SCORING_RULES.forEach((rule) => {
            // Skew towards "stable" (index 0 or 1)
            // options[0] is good (score 0), options[1] is warning (score 0.5), options[2] is bad (score 1)

            // Deterministic pseudo-random based on country ID and rule ID
            const seedString = country.id + rule.id;
            // Simple hash
            let hash = 0;
            for (let i = 0; i < seedString.length; i++) {
                hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
                hash |= 0;
            }
            const r = (Math.abs(hash) % 100) / 100;

            let optionIndex = 0;
            // SLIGHTLY STRICTER SCORING: Middle ground
            if (r > 0.5) optionIndex = 1; // 50% chance of at least warning
            if (r > 0.85) optionIndex = 2; // 15% chance of contracting/bad

            // Custom tweaks for demo realism
            if (country.id === 'USA') {
                // USA: usually strong GDP but inflation elevated
                if (rule.id === 'inflation') optionIndex = 1;
                else if (rule.id === 'realGdpGrowth') optionIndex = 0;
                else if (r > 0.7) optionIndex = 1; else optionIndex = 0; // Slightly stricter custom
            }
            if (country.id === 'DEU') {
                // Germany: currently struggling (recession risk)
                if (rule.id === 'realGdpGrowth') optionIndex = 2;
                else if (rule.id === 'industrialProduction') optionIndex = 2;
                else optionIndex = 1;
            }
            if (country.id === 'IND') {
                // India: Strong growth
                optionIndex = 0;
                if (rule.id === 'inflation') optionIndex = 1; // maybe elevated
            }

            indicators[rule.id] = rule.options[optionIndex].value;
        });

        return {
            ...country,
            indicators,
        };
    });
};
