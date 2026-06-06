/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CampaignReport {
  date: string;
  campaignId: string;
  campaignName: string; // Follows [ASIN]-[SKU]-[TYPE]-[TARGET]
  asin: string;
  sku: string;
  type: string; // SP, SB, SD
  target: string; // AUTO, EXACT, BROAD, ASIN
  impressions: number;
  clicks: number;
  spend: number;
  orders: number;
  sales: number;
  // Computed fields (ETL)
  ctr?: number;
  cpc?: number;
  acos?: number;
  roas?: number;
}

export interface SearchTermReport {
  date: string;
  asin: string;
  sku: string;
  keyword: string; // Triggering keyword
  searchTerm: string; // Actual search query
  clicks: number;
  spend: number;
  orders: number;
  sales: number;
  // Computed (ETL)
  ctr?: number;
  cpc?: number;
  acos?: number;
}

export interface BusinessReport {
  date: string;
  asin: string;
  sku: string;
  sessions: number;
  pageViews: number;
  unitSessionPercentage: number; // Conversion rate
  unitsOrdered: number;
  revenue: number;
}

export interface KeywordIntel {
  date: string;
  asin: string;
  keyword: string;
  searchVolume: number;
  organicRank: number;
  sponsoredRank: number;
}

export interface CompetitorIntel {
  date: string;
  competitorAsin: string;
  price: number;
  reviews: number;
  rating: number;
  estimatedRevenue: number;
  listingQualityScore: number; // 0-10 based on analysis
}

export interface DecisionAlert {
  id: string;
  type: "warning" | "opportunity" | "critical" | "success";
  asin: string;
  title: string;
  metric: string;
  triggerCondition: string;
  recommendation: string;
}

export interface ForensicResult {
  summary: string;
  rootCauses: Array<{
    factor: string;
    impact: string;
    evidence: string;
    explanation: string;
  }>;
  recommendations: Array<{
    action: string;
    expectedImpact: string;
    effort: string;
    rationale: string;
  }>;
  forensicScore: number;
  projectedRevenueAfterFix: string;
}
