/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to secure numeric parse
const parseNum = (val: any, defaultVal = 0): number => {
  if (val === undefined || val === null || val === "") return defaultVal;
  // Strip any currency signs commas etc
  const str = String(val).replace(/[$,]/g, "");
  const num = Number(str);
  return isNaN(num) ? defaultVal : num;
};

// Help map headers to keys & reverse
export interface SheetRowSet {
  campaigns: Array<any>;
  searchTerms: Array<any>;
  business: Array<any>;
  keywords: Array<any>;
  competitors: Array<any>;
}

/**
 * Exports all data to a newly created Google Sheet.
 * @returns {spreadsheetId, spreadsheetUrl}
 */
export async function createAndExportToSheets(
  accessToken: string,
  data: SheetRowSet,
  titlePrefix = "ScaleSmart PPC Datasets"
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const timestamp = new Date().toLocaleString();
  const title = `${titlePrefix} - ${timestamp}`;

  // 1. Create Spreadsheet
  const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        { properties: { title: "RAW_CAMPAIGNS" } },
        { properties: { title: "RAW_SEARCH_TERMS" } },
        { properties: { title: "RAW_BUSINESS" } },
        { properties: { title: "RAW_KEYWORDS" } },
        { properties: { title: "RAW_COMPETITORS" } },
      ],
    }),
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Failed to create Google Sheet: ${errText}`);
  }

  const sheetData = await createResponse.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // 2. Prepare grid arrays
  const campaignsRows = [
    ["Date", "Campaign ID", "Campaign Name", "Impressions", "Clicks", "Spend ($)", "Orders", "Sales ($)"],
    ...data.campaigns.map((c) => [
      c.date || "",
      c.campaignId || "",
      c.campaignName || "",
      c.impressions ?? 0,
      c.clicks ?? 0,
      c.spend ?? 0,
      c.orders ?? 0,
      c.sales ?? 0,
    ]),
  ];

  const searchTermsRows = [
    ["Date", "ASIN", "SKU", "Target Keyword", "Customer Search Term", "Clicks", "Spend ($)", "Orders", "Sales ($)"],
    ...data.searchTerms.map((s) => [
      s.date || "",
      s.asin || "",
      s.sku || "",
      s.keyword || "",
      s.searchTerm || "",
      s.clicks ?? 0,
      s.spend ?? 0,
      s.orders ?? 0,
      s.sales ?? 0,
    ]),
  ];

  const businessRows = [
    ["Date", "ASIN", "SKU", "Sessions", "Page Views", "Units Ordered", "Revenue ($)"],
    ...data.business.map((b) => [
      b.date || "",
      b.asin || "",
      b.sku || "",
      b.sessions ?? 0,
      b.pageViews ?? 0,
      b.unitsOrdered ?? 0,
      b.revenue ?? 0,
    ]),
  ];

  const keywordsRows = [
    ["Date", "ASIN", "Keyword", "Est. Search Volume", "Organic Rank", "Sponsored Rank"],
    ...data.keywords.map((k) => [
      k.date || "",
      k.asin || "",
      k.keyword || "",
      k.searchVolume ?? 0,
      k.organicRank ?? 0,
      k.sponsoredRank ?? 0,
    ]),
  ];

  const competitorsRows = [
    ["Date", "Competitor ASIN", "Listed Price ($)", "Total Reviews", "Stars/Rating", "Estimated Monthly Revenue ($)", "Listing Quality Score"],
    ...data.competitors.map((com) => [
      com.date || "",
      com.competitorAsin || "",
      com.price ?? 0,
      com.reviews ?? 0,
      com.rating ?? 0,
      com.estimatedRevenue ?? 0,
      com.listingQualityScore ?? 8,
    ]),
  ];

  // 3. Batch Update Spreadsheet Values
  const writeResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: [
          { range: "RAW_CAMPAIGNS!A1", values: campaignsRows },
          { range: "RAW_SEARCH_TERMS!A1", values: searchTermsRows },
          { range: "RAW_BUSINESS!A1", values: businessRows },
          { range: "RAW_KEYWORDS!A1", values: keywordsRows },
          { range: "RAW_COMPETITORS!A1", values: competitorsRows },
        ],
      }),
    }
  );

  if (!writeResponse.ok) {
    const errText = await writeResponse.text();
    throw new Error(`Failed to write values to Google Sheet: ${errText}`);
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Imports all tables from an existing Google Sheet.
 */
export async function importFromSheets(accessToken: string, spreadsheetId: string): Promise<SheetRowSet> {
  const ranges = [
    "RAW_CAMPAIGNS!A1:H200",
    "RAW_SEARCH_TERMS!A1:I200",
    "RAW_BUSINESS!A1:G200",
    "RAW_KEYWORDS!A1:F200",
    "RAW_COMPETITORS!A1:G200",
  ];

  const queryParams = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join("&");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${queryParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch Google Sheet data: ${errText}`);
  }

  const batchData = await response.json();
  const valueRanges = batchData.valueRanges || [];

  const rawCamValue = valueRanges[0]?.values || [];
  const rawStValue = valueRanges[1]?.values || [];
  const rawBizValue = valueRanges[2]?.values || [];
  const rawKeyValue = valueRanges[3]?.values || [];
  const rawCompValue = valueRanges[4]?.values || [];

  // Parse RAW_CAMPAIGNS
  const campaigns: Array<any> = [];
  if (rawCamValue.length > 1) {
    const rows = rawCamValue.slice(1);
    rows.forEach((row: any) => {
      if (row[0] || row[1] || row[2]) {
        campaigns.push({
          date: row[0] || new Date().toISOString().split("T")[0],
          campaignId: row[1] || "",
          campaignName: row[2] || "",
          impressions: parseNum(row[3]),
          clicks: parseNum(row[4]),
          spend: parseNum(row[5]),
          orders: parseNum(row[6]),
          sales: parseNum(row[7]),
        });
      }
    });
  }

  // Parse RAW_SEARCH_TERMS
  const searchTerms: Array<any> = [];
  if (rawStValue.length > 1) {
    const rows = rawStValue.slice(1);
    rows.forEach((row: any) => {
      if (row[0] || row[3] || row[4]) {
        searchTerms.push({
          date: row[0] || new Date().toISOString().split("T")[0],
          asin: row[1] || "B0GXWB95V9",
          sku: row[2] || "SIGN12X8",
          keyword: row[3] || "",
          searchTerm: row[4] || "",
          clicks: parseNum(row[5]),
          spend: parseNum(row[6]),
          orders: parseNum(row[7]),
          sales: parseNum(row[8]),
        });
      }
    });
  }

  // Parse RAW_BUSINESS
  const business: Array<any> = [];
  if (rawBizValue.length > 1) {
    const rows = rawBizValue.slice(1);
    rows.forEach((row: any) => {
      if (row[0] || row[1]) {
        business.push({
          date: row[0] || new Date().toISOString().split("T")[0],
          asin: row[1] || "B0GXWB95V9",
          sku: row[2] || "SIGN12X8",
          sessions: parseNum(row[3]),
          pageViews: parseNum(row[4]),
          unitsOrdered: parseNum(row[5]),
          revenue: parseNum(row[6]),
        });
      }
    });
  }

  // Parse RAW_KEYWORDS
  const keywords: Array<any> = [];
  if (rawKeyValue.length > 1) {
    const rows = rawKeyValue.slice(1);
    rows.forEach((row: any) => {
      if (row[0] || row[2]) {
        keywords.push({
          date: row[0] || new Date().toISOString().split("T")[0],
          asin: row[1] || "B0GXWB95V9",
          keyword: row[2] || "",
          searchVolume: parseNum(row[3], 100),
          organicRank: parseNum(row[4], 50),
          sponsoredRank: parseNum(row[5], 0),
        });
      }
    });
  }

  // Parse RAW_COMPETITORS
  const competitors: Array<any> = [];
  if (rawCompValue.length > 1) {
    const rows = rawCompValue.slice(1);
    rows.forEach((row: any) => {
      if (row[1]) {
        competitors.push({
          date: row[0] || new Date().toISOString().split("T")[0],
          competitorAsin: row[1] || "",
          price: parseNum(row[2]),
          reviews: parseNum(row[3]),
          rating: parseNum(row[4]),
          estimatedRevenue: parseNum(row[5]),
          listingQualityScore: parseNum(row[6], 8),
        });
      }
    });
  }

  return { campaigns, searchTerms, business, keywords, competitors };
}
