/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CampaignReport, SearchTermReport, BusinessReport, KeywordIntel, CompetitorIntel, DecisionAlert } from "../types";

// Raw unprocessed layers (representing the CSV files imported from Amazon/Helium 10)
export const initialRawCampaigns = [
  { date: "2026-06-01", campaignId: "C101", campaignName: "B0GXWB95V9-SIGN12X8-SP-AUTO", impressions: 12500, clicks: 31, spend: 46.5, orders: 1, sales: 29.99 },
  { date: "2026-06-01", campaignId: "C102", campaignName: "B0GXWB95V9-SIGN12X8-SP-EXACT", impressions: 8400, clicks: 42, spend: 75.6, orders: 4, sales: 119.96 },
  { date: "2026-06-01", campaignId: "C103", campaignName: "B0GXWB95V9-SIGN12X8-SP-ASIN", impressions: 16200, clicks: 24, spend: 31.2, orders: 0, sales: 0.0 },

  { date: "2026-06-02", campaignId: "C101", campaignName: "B0GXWB95V9-SIGN12X8-SP-AUTO", impressions: 14200, clicks: 28, spend: 42.0, orders: 2, sales: 59.98 },
  { date: "2026-06-02", campaignId: "C102", campaignName: "B0GXWB95V9-SIGN12X8-SP-EXACT", impressions: 9100, clicks: 49, spend: 88.2, orders: 5, sales: 149.95 },
  { date: "2026-06-02", campaignId: "C103", campaignName: "B0GXWB95V9-SIGN12X8-SP-ASIN", impressions: 18500, clicks: 36, spend: 46.8, orders: 1, sales: 29.99 },

  { date: "2026-06-03", campaignId: "C101", campaignName: "B0GXWB95V9-SIGN12X8-SP-AUTO", impressions: 11000, clicks: 19, spend: 28.5, orders: 0, sales: 0.0 },
  { date: "2026-06-03", campaignId: "C102", campaignName: "B0GXWB95V9-SIGN12X8-SP-EXACT", impressions: 10500, clicks: 58, spend: 104.4, orders: 3, sales: 89.97 },
  { date: "2026-06-03", campaignId: "C103", campaignName: "B0GXWB95V9-SIGN12X8-SP-ASIN", impressions: 22000, clicks: 54, spend: 70.2, orders: 0, sales: 0.0 },

  { date: "2026-06-04", campaignId: "C101", campaignName: "B0GXWB95V9-SIGN12X8-SP-AUTO", impressions: 13500, clicks: 41, spend: 61.5, orders: 3, sales: 89.97 },
  { date: "2026-06-04", campaignId: "C102", campaignName: "B0GXWB95V9-SIGN12X8-SP-EXACT", impressions: 8900, clicks: 51, spend: 91.8, orders: 6, sales: 179.94 },
  { date: "2026-06-04", campaignId: "C103", campaignName: "B0GXWB95V9-SIGN12X8-SP-ASIN", impressions: 17200, clicks: 31, spend: 40.3, orders: 2, sales: 59.98 },

  { date: "2026-06-05", campaignId: "C101", campaignName: "B0GXWB95V9-SIGN12X8-SP-AUTO", impressions: 15100, clicks: 48, spend: 72.0, orders: 4, sales: 119.96 },
  { date: "2026-06-05", campaignId: "C102", campaignName: "B0GXWB95V9-SIGN12X8-SP-EXACT", impressions: 9600, clicks: 55, spend: 99.0, orders: 8, sales: 239.92 },
  { date: "2026-06-05", campaignId: "C103", campaignName: "B0GXWB95V9-SIGN12X8-SP-ASIN", impressions: 19100, clicks: 42, spend: 54.6, orders: 1, sales: 29.99 },
];

export const initialRawSearchTerms = [
  { date: "2026-06-05", asin: "B0GXWB95V9", sku: "SIGN12X8", keyword: "package delivery sign", searchTerm: "package delivery signs for fence", clicks: 12, spend: 21.6, orders: 3, sales: 89.97 },
  { date: "2026-06-05", asin: "B0GXWB95V9", sku: "SIGN12X8", keyword: "package delivery sign", searchTerm: "amazon package sign hanger", clicks: 14, spend: 25.2, orders: 1, sales: 29.99 },
  { date: "2026-06-05", asin: "B0GXWB95V9", sku: "SIGN12X8", keyword: "delivery sign door", searchTerm: "ups delivery address sign outer wall", clicks: 8, spend: 14.4, orders: 0, sales: 0.0 },
  { date: "2026-06-05", asin: "B0GXWB95V9", sku: "SIGN12X8", keyword: "delivery sign door", searchTerm: "leave packages here custom plaque", clicks: 15, spend: 27.0, orders: 4, sales: 119.96 },
  { date: "2026-06-05", asin: "B0GXWB95V9", sku: "SIGN12X8", keyword: "custom metal signs", searchTerm: "metal sign warning heavy packages", clicks: 22, spend: 39.6, orders: 0, sales: 0.0 },
  { date: "2026-06-05", asin: "B0GXWB95V9", sku: "SIGN12X8", keyword: "custom metal signs", searchTerm: "rustic drop box sign", clicks: 11, spend: 19.8, orders: 1, sales: 29.99 },
];

export const initialRawBusinessReports = [
  { date: "2026-06-01", asin: "B0GXWB95V9", sku: "SIGN12X8", sessions: 450, pageViews: 590, unitsOrdered: 12, revenue: 359.88 },
  { date: "2026-06-02", asin: "B0GXWB95V9", sku: "SIGN12X8", sessions: 490, pageViews: 650, unitsOrdered: 18, revenue: 539.82 },
  { date: "2026-06-03", asin: "B0GXWB95V9", sku: "SIGN12X8", sessions: 420, pageViews: 540, unitsOrdered: 10, revenue: 299.90 },
  { date: "2026-06-04", asin: "B0GXWB95V9", sku: "SIGN12X8", sessions: 510, pageViews: 710, unitsOrdered: 22, revenue: 659.78 },
  { date: "2026-06-05", asin: "B0GXWB95V9", sku: "SIGN12X8", sessions: 540, pageViews: 780, unitsOrdered: 29, revenue: 869.71 },
];

export const initialRawKeywordIntel = [
  { date: "2026-06-05", asin: "B0GXWB95V9", keyword: "package delivery sign", searchVolume: 12500, organicRank: 4, sponsoredRank: 1 },
  { date: "2026-06-05", asin: "B0GXWB95V9", keyword: "delivery sign door", searchVolume: 8200, organicRank: 7, sponsoredRank: 3 },
  { date: "2026-06-05", asin: "B0GXWB95V9", keyword: "custom metal signs", searchVolume: 58000, organicRank: 22, sponsoredRank: 12 },
  { date: "2026-06-05", asin: "B0GXWB95V9", keyword: "leave package sign", searchVolume: 4200, organicRank: 2, sponsoredRank: 2 },
  { date: "2026-06-05", asin: "B0GXWB95V9", keyword: "porch drop box board", searchVolume: 1800, organicRank: 31, sponsoredRank: 0 },
];

export const initialRawCompetitors = [
  { date: "2026-06-05", competitorAsin: "B07Z8Y2W8Q", price: 19.99, reviews: 2450, rating: 4.6, estimatedRevenue: 18500, listingQualityScore: 9 },
  { date: "2026-06-05", competitorAsin: "B09W2SCLXF", price: 24.95, reviews: 840, rating: 4.4, estimatedRevenue: 11200, listingQualityScore: 8 },
  { date: "2026-06-05", competitorAsin: "B08HG8Y82L", price: 29.99, reviews: 310, rating: 4.1, estimatedRevenue: 4500, listingQualityScore: 5 },
  { date: "2026-06-05", competitorAsin: "B0C92S1W8B", price: 14.50, reviews: 180, rating: 4.5, estimatedRevenue: 14900, listingQualityScore: 7 }, // Aggressive discount threat
];

// ETL NORMALIZATION FUNCTION
// Emulates the Apps Script ETL that runs inside ScaleSmart Google Sheet
export function runETLProcess(
  campaigns: Array<any>,
  searchTerms: Array<any>,
  business: Array<any>,
  keywords: Array<any>,
  competitors: Array<any>
) {
  // 1. Normalize Campaigns & Split Naming Parameters
  const normalizedCampaigns: Array<CampaignReport> = campaigns.map((campaign) => {
    // Parse campaign name pattern: [ASIN]-[SKU]-[TYPE]-[TARGET]
    const parts = campaign.campaignName.split("-");
    const asin = parts[0] || "B0GXWB95V9";
    const sku = parts[1] || "SIGN12X8";
    const type = parts[2] || "SP";
    const target = parts[3] || "AUTO";

    const ctr = campaign.impressions > 0 ? campaign.clicks / campaign.impressions : 0;
    const cpc = campaign.clicks > 0 ? campaign.spend / campaign.clicks : 0;
    const acos = campaign.sales > 0 ? campaign.spend / campaign.sales : 0;
    const roas = campaign.spend > 0 ? campaign.sales / campaign.spend : 0;

    return {
      ...campaign,
      asin,
      sku,
      type,
      target,
      ctr,
      cpc,
      acos,
      roas,
    };
  });

  // 2. Normalize Search Terms
  const normalizedSearchTerms: Array<SearchTermReport> = searchTerms.map((st) => {
    const ctr = st.clicks > 0 ? st.clicks / (st.clicks * 40) : 0; // Simulated relative impressions
    const cpc = st.clicks > 0 ? st.spend / st.clicks : 0;
    const acos = st.sales > 0 ? st.spend / st.sales : 0;

    return {
      ...st,
      ctr,
      cpc,
      acos,
    };
  });

  // 3. Compute Business Reports Conversion Metrics
  const normalizedBusiness: Array<BusinessReport> = business.map((b) => {
    const unitSessionPercentage = b.sessions > 0 ? b.unitsOrdered / b.sessions : 0;
    return {
      ...b,
      unitSessionPercentage,
    };
  });

  // 4. Keywords Tracker Passthrough
  const normalizedKeywords: Array<KeywordIntel> = keywords.map((k) => ({ ...k }));

  // 5. Competitor Intelligence
  const normalizedCompetitors: Array<CompetitorIntel> = competitors.map((c) => ({ ...c }));

  // 6. Generate Automated Decision Recommendations
  const decisionAlerts: Array<DecisionAlert> = [];

  // Rules Engine:
  // Rule A: Low CTR Campaign Indicator
  normalizedCampaigns.forEach((c) => {
    if (c.ctr && c.ctr < 0.0035) { // < 0.35%
      decisionAlerts.push({
        id: `alert-ctr-${c.campaignId}`,
        type: "warning",
        asin: c.asin,
        title: `Low Click-Through-Rate (${(c.ctr * 100).toFixed(2)}%)`,
        metric: `Campaign: ${c.campaignName}`,
        triggerCondition: "CTR < 0.35%",
        recommendation: "Root cause likely listing main-image weakness, poor review rating relative to competitors, or broad target mismatch. Action: Review the main image stack, audit competitor pricing.",
      });
    }

    // Rule B: High Spend + No Orders
    if (c.spend > 35.0 && c.orders === 0) {
      decisionAlerts.push({
        id: `alert-spend-${c.campaignId}`,
        type: "critical",
        asin: c.asin,
        title: "High Bleeding Spend (No Orders)",
        metric: `Spend: $${c.spend.toFixed(2)} | Orders: ${c.orders}`,
        triggerCondition: "Spend > $35 without sales",
        recommendation: `Reduce campaign target bids immediately by 25% or negate low-relevance customer search terms.`,
      });
    }
  });

  // Rule C: High Search Term Non-converting bleed
  normalizedSearchTerms.forEach((st) => {
    if (st.spend > 25 && st.orders === 0) {
      decisionAlerts.push({
        id: `alert-st-${st.searchTerm.replace(/\s+/g, "-")}`,
        type: "critical",
        asin: st.asin,
        title: `Negate bleed term: "${st.searchTerm}"`,
        metric: `Spend: $${st.spend.toFixed(2)} | Clicks: ${st.clicks}`,
        triggerCondition: "Term Spend > $25 & Zero Orders",
        recommendation: `Add search term "${st.searchTerm}" as negative exact in campaign SP-AUTO to prevent siphoning further budget.`,
      });
    }

    // Rule D: Winning search term identification
    if (st.orders >= 3 && st.acos && st.acos < 0.30) {
      decisionAlerts.push({
        id: `alert-st-win-${st.searchTerm.replace(/\s+/g, "-")}`,
        type: "success",
        asin: st.asin,
        title: `High-efficiency star keyword: "${st.searchTerm}"`,
        metric: `Orders: ${st.orders} | ACOS: ${(st.acos * 100).toFixed(1)}%`,
        triggerCondition: "Orders >= 3 and ACOS < 30%",
        recommendation: `Promote "${st.searchTerm}" into Exact Match campaign ${st.asin}-${st.sku}-SP-EXACT with a higher bid (+15%) to boost organic rank velocity.`,
      });
    }
  });

  // Rule E: Competitor undercut price alert
  const myPrice = 29.99; // Base pricing for SIGN12X8
  normalizedCompetitors.forEach((comp) => {
    if (comp.price < myPrice - 5.0 && comp.rating >= 4.3) {
      decisionAlerts.push({
        id: `alert-comp-${comp.competitorAsin}`,
        type: "warning",
        asin: "B0GXWB95V9",
        title: "Aggressive Competitor Undercutting",
        metric: `Competitor ${comp.competitorAsin} is priced at $${comp.price} (Your Price: $${myPrice})`,
        triggerCondition: "Competitor Price is $5+ cheaper with rating >= 4.3",
        recommendation: "Your listing conversion rate is vulnerable due to this pricing gap. Action: Offer a high-visibility 10%-15% clip coupon on your listing to restore detail-page balance and retain traffic.",
      });
    }
  });

  return {
    campaigns: normalizedCampaigns,
    searchTerms: normalizedSearchTerms,
    business: normalizedBusiness,
    keywords: normalizedKeywords,
    competitors: normalizedCompetitors,
    alerts: decisionAlerts,
  };
}
