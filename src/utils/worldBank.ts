
import type { CountryData } from './scoring';

const WB_BASE_URL = 'https://api.worldbank.org/v2/country';
const INDICATORS = {
    gdp: 'NY.GDP.MKTP.KD.ZG',
    unemployment: 'SL.UEM.TOTL.ZS',
    inflation: 'FP.CPI.TOTL.ZG',
    industry: 'NV.IND.TOTL.KD.ZG', // Industrial Production proxy
    consumption: 'NE.CON.PRVT.KD.ZG', // Retail Sales proxy (Household consumption)
    investment: 'NE.GDI.FTOT.KD.ZG', // Housing/Investment proxy (Gross Fixed Capital Formation)
    manufacturing: 'NV.IND.MANF.KD.ZG', // Capacity Utilization proxy (Manufacturing value added)
};

interface WBResponseItem {
    countryiso3code: string;
    date: string;
    value: number | null;
    indicator: { id: string; value: string };
}

type WBResponse = [
    { page: number; pages: number; per_page: number; total: number },
    WBResponseItem[]
];

export const fetchWorldBankData = async (countries: CountryData[]) => {
    // Extract ISO3 codes
    const countryCodes = countries.map(c => c.id).join(';');

    // WB API allows multiple countries separated by semicolon
    const yearRange = '2020:2024';

    const fetchData = async (indicatorCode: string) => {
        try {
            const url = `${WB_BASE_URL}/${countryCodes}/indicator/${indicatorCode}?source=2&date=${yearRange}&format=json&per_page=500`;
            const res = await fetch(url);
            const data = await res.json() as WBResponse;

            if (!data || !data[1]) return [];
            return data[1];
        } catch (e) {
            console.error(`Failed to fetch ${indicatorCode} `, e);
            return [];
        }
    };

    const [gdpData, unempData, inflationData, industryData, consumptionData, investmentData, manufData] = await Promise.all([
        fetchData(INDICATORS.gdp),
        fetchData(INDICATORS.unemployment),
        fetchData(INDICATORS.inflation),
        fetchData(INDICATORS.industry),
        fetchData(INDICATORS.consumption),
        fetchData(INDICATORS.investment),
        fetchData(INDICATORS.manufacturing),
    ]);

    return { gdpData, unempData, inflationData, industryData, consumptionData, investmentData, manufData };
};

export const mapRealDataToIndicators = (
    countryCode: string,
    raw: {
        gdpData: WBResponseItem[],
        unempData: WBResponseItem[],
        inflationData: WBResponseItem[],
        industryData: WBResponseItem[],
        consumptionData: WBResponseItem[],
        investmentData: WBResponseItem[],
        manufData: WBResponseItem[]
    }
): Partial<Record<string, string>> => {
    const updates: Partial<Record<string, string>> = {};

    // Helper to find latest valid value
    const getLatest = (data: WBResponseItem[], iso: string) => {
        const sorted = data
            .filter(d => d.countryiso3code === iso && d.value !== null)
            .sort((a, b) => parseInt(b.date) - parseInt(a.date));
        return sorted;
    };

    const getLatestValue = (data: WBResponseItem[], iso: string) => {
        const series = getLatest(data, iso);
        return series.length > 0 ? series[0].value! : null;
    };

    // 1. GDP Growth
    const gdp = getLatestValue(raw.gdpData, countryCode);
    if (gdp !== null) {
        if (gdp > 1.5) updates['realGdpGrowth'] = 'strong';
        else if (gdp >= 0) updates['realGdpGrowth'] = 'slow';
        else updates['realGdpGrowth'] = 'negative';
    }

    // 2. Unemployment Trend
    const unempSeries = getLatest(raw.unempData, countryCode);
    if (unempSeries.length >= 2) {
        const current = unempSeries[0].value!;
        const prev = unempSeries[1].value!;
        const diff = current - prev;

        if (diff <= 0) updates['unemploymentRateTrend'] = 'stable';
        else if (diff < 0.5) updates['unemploymentRateTrend'] = 'rising_slow';
        else updates['unemploymentRateTrend'] = 'rising_fast';
    }

    // 3. Inflation Momentum
    const infSeries = getLatest(raw.inflationData, countryCode);
    if (infSeries.length >= 2) {
        const current = infSeries[0].value!;
        const prev = infSeries[1].value!;

        if (current < prev && current < 4) updates['inflation'] = 'stable';
        else if (current < 6) updates['inflation'] = 'elevated';
        else updates['inflation'] = 'rising';
    }

    // 4. Industrial Production (Proxy: Industry value added growth)
    const ind = getLatestValue(raw.industryData, countryCode);
    if (ind !== null) {
        if (ind > 2) updates['industrialProduction'] = 'growing';
        else if (ind > -1) updates['industrialProduction'] = 'flat';
        else updates['industrialProduction'] = 'contracting';
    }

    // 5. Retail Sales (Proxy: Household Consumption growth)
    const cons = getLatestValue(raw.consumptionData, countryCode);
    if (cons !== null) {
        if (cons > 2) updates['retailSales'] = 'growing';
        else if (cons > 0) updates['retailSales'] = 'flat';
        else updates['retailSales'] = 'declining';
    }

    // 6. Housing/Investment (Proxy: Gross Fixed Capital Formation growth)
    const inv = getLatestValue(raw.investmentData, countryCode);
    if (inv !== null) {
        if (inv > 2) updates['housingActivity'] = 'rising'; // Investment rising strongly
        else if (inv > -1) updates['housingActivity'] = 'flat';
        else updates['housingActivity'] = 'declining';
    }

    // 7. Capacity Utilization (Proxy: Manufacturing value added growth)
    const manuf = getLatestValue(raw.manufData, countryCode);
    if (manuf !== null) {
        if (manuf > 1.5) updates['capacityUtilization'] = 'high'; // Strong manufacturing
        else if (manuf > -0.5) updates['capacityUtilization'] = 'flat';
        else updates['capacityUtilization'] = 'falling';
    }

    return updates;
};

