/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Play, RotateCcw, Database, FileSpreadsheet, ArrowRight, Code } from "lucide-react";

interface EtlConsoleProps {
  rawCampaigns: Array<any>;
  rawSearchTerms: Array<any>;
  rawBusiness: Array<any>;
  rawKeywords: Array<any>;
  rawCompetitors: Array<any>;
  onTriggerEtl: (updates: {
    campaigns?: Array<any>;
    searchTerms?: Array<any>;
    business?: Array<any>;
    keywords?: Array<any>;
    competitors?: Array<any>;
  }) => void;
  onResetToDefaults: () => void;
}

export default function EtlConsole({
  rawCampaigns,
  rawSearchTerms,
  rawBusiness,
  rawKeywords,
  rawCompetitors,
  onTriggerEtl,
  onResetToDefaults,
}: EtlConsoleProps) {
  const [activeTab, setActiveTab] = useState<"campaigns" | "searchTerms" | "business" | "keywords" | "competitors">("campaigns");
  const [localCampaigns, setLocalCampaigns] = useState(rawCampaigns);
  const [localSearchTerms, setLocalTerms] = useState(rawSearchTerms);
  const [localBusiness, setLocalBusiness] = useState(rawBusiness);
  const [localKeywords, setLocalKeywords] = useState(rawKeywords);
  const [localCompetitors, setLocalCompetitors] = useState(rawCompetitors);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Sync state if parents change
  React.useEffect(() => { setLocalCampaigns(rawCampaigns); }, [rawCampaigns]);
  React.useEffect(() => { setLocalTerms(rawSearchTerms); }, [rawSearchTerms]);
  React.useEffect(() => { setLocalBusiness(rawBusiness); }, [rawBusiness]);
  React.useEffect(() => { setLocalKeywords(rawKeywords); }, [rawKeywords]);
  React.useEffect(() => { setLocalCompetitors(rawCompetitors); }, [rawCompetitors]);

  const handleUpdateCell = (tab: string, index: number, key: string, value: any) => {
    const numVal = isNaN(Number(value)) ? value : Number(value);

    if (tab === "campaigns") {
      const copy = [...localCampaigns];
      copy[index] = { ...copy[index], [key]: numVal };
      setLocalCampaigns(copy);
    } else if (tab === "searchTerms") {
      const copy = [...localSearchTerms];
      copy[index] = { ...copy[index], [key]: numVal };
      setLocalTerms(copy);
    } else if (tab === "business") {
      const copy = [...localBusiness];
      copy[index] = { ...copy[index], [key]: numVal };
      setLocalBusiness(copy);
    } else if (tab === "keywords") {
      const copy = [...localKeywords];
      copy[index] = { ...copy[index], [key]: numVal };
      setLocalKeywords(copy);
    } else if (tab === "competitors") {
      const copy = [...localCompetitors];
      copy[index] = { ...copy[index], [key]: numVal };
      setLocalCompetitors(copy);
    }
  };

  const handlePublishEtl = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onTriggerEtl({
        campaigns: localCampaigns,
        searchTerms: localSearchTerms,
        business: localBusiness,
        keywords: localKeywords,
        competitors: localCompetitors,
      });
      setIsProcessing(false);
    }, 700);
  };

  return (
    <div id="etl-console" className="space-y-6 font-sans">
      {/* Upper Pipeline Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-650 p-2.5 rounded-lg">
              <Database className="w-5 h-5 shrink-0" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Google Sheets Warehouse & ETL Integration</h2>
          </div>
          <p className="text-xs text-slate-550 max-w-2xl font-sans">
            Simulate your Apps Script ETL pipeline. Edit any raw seller report value below, then execute the compiler to test computed outcomes downstream.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-250 transition-all font-mono"
          >
            <Code className="w-4 h-4" />
            {showCode ? "Hide ETL Script" : "View ETL Config"}
          </button>
          
          <button
            onClick={onResetToDefaults}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-205 text-slate-700 rounded-lg text-xs font-semibold border border-slate-250 transition-all font-sans"
            title="Restore pristine mock data values"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>

          <button
            onClick={handlePublishEtl}
            disabled={isProcessing}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold rounded-lg text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Play className={`w-4 h-4 ${isProcessing ? "animate-spin text-slate-350" : ""}`} />
            {isProcessing ? "Normalizing..." : "Execute ETL Pipeline"}
          </button>
        </div>
      </div>

      {/* Script Section */}
      {showCode && (
        <div className="bg-slate-50 border border-slate-250 rounded-xl p-5 font-mono text-xs text-slate-700 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-450 border-b border-slate-200 pb-2">
            <span>appsscript-etl-engine.gs</span>
            <span className="text-emerald-700 font-bold">Active Pipeline Layer</span>
          </div>
          <pre className="overflow-x-auto max-h-48 whitespace-pre scrollbar-thin text-slate-800">
{`function runScaleSmartETL() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawCampaigns = ss.getSheetByName("RAW_CAMPAIGNS").getDataRange().getValues();
  const normalizedSheet = ss.getSheetByName("FACT_CAMPAIGNS");
  
  // Clean formatting & run key transformations
  const cleanedRows = rawCampaigns.map((row, idx) => {
    if (idx === 0) return ["Date", "ASIN", "SKU", "Type", "Target", "Impressions", "Clicks", "Spend", "Orders", "Sales", "CTR", "ACOS"];
    
    // Auto-parse naming sequence B0GXWB95V9-SIGN12X8-SP-AUTO
    const campaignName = row[2];
    const parts = campaignName.split("-");
    const asin = parts[0] || "B0GXWB95V9";
    const sku = parts[1] || "SIGN12X8";
    const type = parts[2] || "SP";
    const target = parts[3] || "AUTO";
    
    const clicks = row[4];
    const impressions = row[3];
    const ctr = impressions > 0 ? (clicks / impressions) : 0;
    
    return [row[0], asin, sku, type, target, impressions, clicks, row[5], row[6], row[7], ctr, acos];
  });
  
  normalizedSheet.clear();
  normalizedSheet.getRange(1, 1, cleanedRows.length, cleanedRows[0].length).setValues(cleanedRows);
  Logger.log("ScaleSmart Fact Table synced completely. Secondary indices updated.");
}`}
          </pre>
        </div>
      )}

      {/* Data Source Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Nav Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 px-2 pt-2">
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold transition-all border-b-2 rounded-t-lg ${
              activeTab === "campaigns"
                ? "border-emerald-600 text-emerald-700 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-650 shrink-0" />
            Raw Advertising Console ({localCampaigns.length} rows)
          </button>
          
          <button
            onClick={() => setActiveTab("searchTerms")}
            className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold transition-all border-b-2 rounded-t-lg ${
              activeTab === "searchTerms"
                ? "border-indigo-650 text-indigo-700 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-550 shrink-0" />
            Raw Search Term Export ({localSearchTerms.length} rows)
          </button>

          <button
            onClick={() => setActiveTab("business")}
            className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold transition-all border-b-2 rounded-t-lg ${
              activeTab === "business"
                ? "border-indigo-655 text-indigo-700 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-505 shrink-0" />
            Raw Business Reports ({localBusiness.length} rows)
          </button>

          <button
            onClick={() => setActiveTab("keywords")}
            className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold transition-all border-b-2 rounded-t-lg ${
              activeTab === "keywords"
                ? "border-purple-600 text-purple-700 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-600 shrink-0" />
            Helium 10 Rank Tracking ({localKeywords.length} keywords)
          </button>

          <button
            onClick={() => setActiveTab("competitors")}
            className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold transition-all border-b-2 rounded-t-lg ${
              activeTab === "competitors"
                ? "border-amber-600 text-amber-700 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600 shrink-0" />
            Helium 10 Competitors
          </button>
        </div>

        {/* Dynamic Table Content */}
        <div className="p-4 overflow-x-auto">
          {activeTab === "campaigns" && (
            <table className="w-full text-left text-xs font-mono text-slate-700 min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Campaign ID</th>
                  <th className="py-3 px-4">Campaign Name (Standard Structure)</th>
                  <th className="py-3 px-4 text-center">Impressions</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-center">Spend ($)</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-center">Sales ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localCampaigns.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-slate-450">{item.date}</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-bold">{item.campaignId}</td>
                    <td className="py-2.5 px-4">
                      <input
                        value={item.campaignName}
                        onChange={(e) => handleUpdateCell("campaigns", idx, "campaignName", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-full text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        value={item.impressions}
                        onChange={(e) => handleUpdateCell("campaigns", idx, "impressions", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-20 text-slate-800 text-center focus:outline-none focus:border-emerald-500 focus:bg-white text-xs font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        value={item.clicks}
                        onChange={(e) => handleUpdateCell("campaigns", idx, "clicks", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-16 text-slate-800 text-center focus:outline-none focus:border-emerald-500 focus:bg-white text-xs font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={item.spend}
                        onChange={(e) => handleUpdateCell("campaigns", idx, "spend", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-20 text-slate-800 text-center focus:outline-none focus:border-emerald-500 focus:bg-white text-xs font-mono font-bold text-indigo-750"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        value={item.orders}
                        onChange={(e) => handleUpdateCell("campaigns", idx, "orders", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-16 text-slate-800 text-center focus:outline-none focus:border-emerald-500 focus:bg-white text-xs font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={item.sales}
                        onChange={(e) => handleUpdateCell("campaigns", idx, "sales", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-24 text-slate-800 text-center focus:outline-none focus:border-emerald-500 focus:bg-white text-xs font-mono font-bold text-emerald-750"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "searchTerms" && (
            <table className="w-full text-left text-xs font-mono text-slate-705 min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">ASIN / SKU</th>
                  <th className="py-3 px-4">Trigger Keyword</th>
                  <th className="py-3 px-4">Customer Search Term</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-center">Spend ($)</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-center">Sales ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localSearchTerms.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-slate-450">{item.date}</td>
                    <td className="py-2.5 px-4 text-slate-700 font-bold">
                      {item.asin} / {item.sku}
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        value={item.keyword}
                        onChange={(e) => handleUpdateCell("searchTerms", idx, "keyword", e.target.value)}
                        className="bg-slate-55 bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-full text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        value={item.searchTerm}
                        onChange={(e) => handleUpdateCell("searchTerms", idx, "searchTerm", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-full text-indigo-700 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs font-mono font-semibold"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        value={item.clicks}
                        onChange={(e) => handleUpdateCell("searchTerms", idx, "clicks", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-16 text-slate-800 text-center focus:outline-none focus:bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={item.spend}
                        onChange={(e) => handleUpdateCell("searchTerms", idx, "spend", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-20 text-slate-800 text-center focus:outline-none focus:bg-white font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        value={item.orders}
                        onChange={(e) => handleUpdateCell("searchTerms", idx, "orders", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-16 text-slate-800 text-center focus:outline-none focus:bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={item.sales}
                        onChange={(e) => handleUpdateCell("searchTerms", idx, "sales", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-20 text-slate-800 text-center focus:outline-none focus:bg-white font-bold text-emerald-700"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "business" && (
            <table className="w-full text-left text-xs font-mono text-slate-700 min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">ASIN / SKU</th>
                  <th className="py-3 px-4 text-indigo-600">Sessions</th>
                  <th className="py-3 px-4">Page Views</th>
                  <th className="py-3 px-4">Units Ordered</th>
                  <th className="py-3 px-4">Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localBusiness.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-slate-450">{item.date}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-700">{item.asin} / {item.sku}</td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        value={item.sessions}
                        onChange={(e) => handleUpdateCell("business", idx, "sessions", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-24 text-indigo-700 focus:outline-none focus:bg-white font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        value={item.pageViews}
                        onChange={(e) => handleUpdateCell("business", idx, "pageViews", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-24 text-slate-800 focus:outline-none focus:bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        value={item.unitsOrdered}
                        onChange={(e) => handleUpdateCell("business", idx, "unitsOrdered", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-20 text-slate-800 focus:outline-none focus:bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        step="0.1"
                        value={item.revenue}
                        onChange={(e) => handleUpdateCell("business", idx, "revenue", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-28 text-slate-800 font-bold focus:outline-none focus:bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "keywords" && (
            <table className="w-full text-left text-xs font-mono text-slate-700 min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Keyword</th>
                  <th className="py-3 px-4">Est. Monthly Search Volume</th>
                  <th className="py-3 px-4 text-indigo-750 font-bold">Organic Rank</th>
                  <th className="py-3 px-4 text-emerald-700 font-bold">Sponsored Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localKeywords.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-slate-850 font-semibold">{item.keyword}</td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        value={item.searchVolume}
                        onChange={(e) => handleUpdateCell("keywords", idx, "searchVolume", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-28 text-slate-850 focus:outline-none focus:bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        value={item.organicRank}
                        onChange={(e) => handleUpdateCell("keywords", idx, "organicRank", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-20 text-indigo-700 font-bold focus:outline-none focus:bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        value={item.sponsoredRank}
                        onChange={(e) => handleUpdateCell("keywords", idx, "sponsoredRank", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-20 text-emerald-705 font-bold focus:outline-none focus:bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "competitors" && (
            <table className="w-full text-left text-xs font-mono text-slate-700 min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Competitor ASIN</th>
                  <th className="py-3 px-4 text-center">Listed Price ($)</th>
                  <th className="py-3 px-4 text-center">Total Reviews</th>
                  <th className="py-3 px-4 text-center text-emerald-700">Stars/Rating</th>
                  <th className="py-3 px-4 text-right">Estimated Monthly Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localCompetitors.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-slate-800 font-bold">{item.competitorAsin}</td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleUpdateCell("competitors", idx, "price", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-24 text-slate-800 text-center focus:outline-none focus:bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        value={item.reviews}
                        onChange={(e) => handleUpdateCell("competitors", idx, "reviews", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-24 text-slate-800 text-center focus:outline-none focus:bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        max="5"
                        min="1"
                        value={item.rating}
                        onChange={(e) => handleUpdateCell("competitors", idx, "rating", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-20 text-slate-800 text-center focus:outline-none focus:bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <input
                        type="number"
                        value={item.estimatedRevenue}
                        onChange={(e) => handleUpdateCell("competitors", idx, "estimatedRevenue", e.target.value)}
                        className="bg-slate-50 hover:bg-slate-50/40 border border-slate-200 rounded px-2 py-1 w-32 text-slate-800 text-right focus:outline-none focus:bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Primary Key mapping context */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-sans">
        <div className="space-y-1">
          <span className="text-slate-450 uppercase text-[9px] tracking-wider block font-semibold font-mono">Primary Key 1</span>
          <p className="text-slate-800 font-bold font-mono">ASIN: B0GXWB95V9</p>
          <span className="text-[11px] text-slate-500 block">Identifies product listings globally</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-450 uppercase text-[9px] tracking-wider block font-semibold font-mono">Primary Key 2</span>
          <p className="text-slate-800 font-bold font-mono">SKU: SIGN12X8</p>
          <span className="text-[11px] text-slate-500 block">Relates inventory & seller logs mapping</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-450 uppercase text-[9px] tracking-wider block font-semibold font-mono">Primary Key 3</span>
          <p className="text-slate-800 font-bold font-mono">Keyword Match Index</p>
          <span className="text-[11px] text-slate-500 block">Resolves Search Volume & Rank alignments</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-450 uppercase text-[9px] tracking-wider block font-semibold font-mono">Primary Key 4</span>
          <p className="text-slate-800 font-bold font-mono">Date Track Index</p>
          <span className="text-[11px] text-slate-500 block">Ensures dynamic chronological tracking</span>
        </div>
      </div>
    </div>
  );
}
