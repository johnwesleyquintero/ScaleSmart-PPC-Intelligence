/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import { 
  Play, 
  RotateCcw, 
  Database, 
  FileSpreadsheet, 
  ArrowRight, 
  Code,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";

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

  // States for CSV file uploads
  const [isParsing, setIsParsing] = useState(false);
  const [pendingRows, setPendingRows] = useState<Array<any> | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear upload helper state when active tabs toggle
  useEffect(() => {
    setPendingRows(null);
    setUploadError(null);
    setUploadSuccess(null);
  }, [activeTab]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith(".csv")) {
        parseAndApplyCsv(file);
      } else {
        setUploadError("Invalid file type. Please upload a standard CSV file.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith(".csv")) {
        parseAndApplyCsv(file);
      } else {
        setUploadError("Invalid file type. Please upload a standard CSV file.");
      }
    }
  };

  const parseAndApplyCsv = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);
    setIsParsing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false);
        const rawData = results.data;
        if (!rawData || rawData.length === 0) {
          setUploadError("The CSV file appears to be empty.");
          return;
        }

        const normalizedRows: Array<any> = [];
        const todayStr = new Date().toISOString().split("T")[0];

        rawData.forEach((row: any) => {
          // Normalize row keys to lower-case, stripping special char/spaces
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            const normalizedKey = k.trim().toLowerCase().replace(/[\s\-_]+/g, "");
            normalizedRow[normalizedKey] = row[k];
          });

          // Helper clean functions
          const dGet = (keys: string[], fallback: any) => {
            for (const key of keys) {
              if (normalizedRow[key] !== undefined && normalizedRow[key] !== null) {
                return normalizedRow[key];
              }
            }
            return fallback;
          };

          const parseNum = (keys: string[]) => {
            const rawVal = dGet(keys, null);
            if (rawVal === null) return 0;
            if (typeof rawVal === "number") return rawVal;
            const cleanStr = String(rawVal).replace(/[$,%]/g, "").trim();
            const num = Number(cleanStr);
            return isNaN(num) ? 0 : num;
          };

          if (activeTab === "campaigns") {
            const campaignId = String(dGet(["campaignid", "id"], "C" + Math.floor(100 + Math.random() * 900)));
            const campaignName = String(dGet(["campaignname", "name", "campaign"], "B0GXWB95V9-SIGN12X8-SP-AUTO"));
            const date = String(dGet(["date", "reportingdate", "day", "timestamp"], todayStr));
            const impressions = parseNum(["impressions", "impression", "impr"]);
            const clicks = parseNum(["clicks", "click"]);
            const spend = parseNum(["spend", "spent", "cost", "adspend", "charges"]);
            const orders = parseNum(["orders", "orderedunits", "totalorders", "unitsordered", "7daytotalorders", "order"]);
            const sales = parseNum(["sales", "totalsales", "7daytotalsales", "revenue", "salesrevenue"]);

            normalizedRows.push({
              date,
              campaignId,
              campaignName,
              impressions,
              clicks,
              spend,
              orders,
              sales
            });
          } else if (activeTab === "searchTerms") {
            const date = String(dGet(["date", "reportingdate", "day", "timestamp"], todayStr));
            const asin = String(dGet(["asin", "parentasin", "childasin"], "B0GXWB95V9"));
            const sku = String(dGet(["sku", "msku"], "SIGN12X8"));
            const keyword = String(dGet(["keyword", "targetkeyword", "targeting"], "package delivery sign"));
            const searchTerm = String(dGet(["customersearchterm", "searchterm", "term", "query", "userquery"], "package delivery sign"));
            const clicks = parseNum(["clicks", "click"]);
            const spend = parseNum(["spend", "spent", "cost", "adspend", "charges"]);
            const orders = parseNum(["orders", "orderedunits", "totalorders", "unitsordered", "7daytotalorders", "order"]);
            const sales = parseNum(["sales", "totalsales", "7daytotalsales", "revenue", "salesrevenue"]);

            normalizedRows.push({
              date,
              asin,
              sku,
              keyword,
              searchTerm,
              clicks,
              spend,
              orders,
              sales
            });
          } else if (activeTab === "business") {
            const date = String(dGet(["date", "reportingdate", "day", "timestamp"], todayStr));
            const asin = String(dGet(["asin", "parentasin", "childasin"], "B0GXWB95V9"));
            const sku = String(dGet(["sku", "msku"], "SIGN12X8"));
            const sessions = parseNum(["sessions", "sessioncount"]);
            const pageViews = parseNum(["pageviews", "pageviewcount", "views"]);
            const unitsOrdered = parseNum(["unitsordered", "orderedunits", "units"]);
            const revenue = parseNum(["revenue", "productysales", "orderedproductsales", "sales"]);

            normalizedRows.push({
              date,
              asin,
              sku,
              sessions,
              pageViews,
              unitsOrdered,
              revenue
            });
          } else if (activeTab === "keywords") {
            const date = String(dGet(["date", "reportingdate", "day", "timestamp"], todayStr));
            const asin = String(dGet(["asin", "parentasin", "childasin"], "B0GXWB95V9"));
            const keyword = String(dGet(["keyword", "targetkeyword", "targeting"], "package delivery sign"));
            const searchVolume = parseNum(["searchvolume", "volume", "monthlyvolume"]);
            const organicRank = parseNum(["organicrank", "organic"]);
            const sponsoredRank = parseNum(["sponsoredrank", "sponsored", "adrank"]);

            normalizedRows.push({
              date,
              asin,
              keyword,
              searchVolume,
              organicRank,
              sponsoredRank
            });
          } else if (activeTab === "competitors") {
            const date = String(dGet(["date", "reportingdate", "day", "timestamp"], todayStr));
            const competitorAsin = String(dGet(["competitorasin", "asin", "compasin"], "B07Z8Y2W8Q"));
            const price = parseNum(["price", "listprice", "productprice"]);
            const reviews = parseNum(["reviews", "reviewcount"]);
            const rating = parseNum(["rating", "stars", "ratingcount"]);
            const estimatedRevenue = parseNum(["estimatedrevenue", "estrevenue", "monthlyrevenue"]);
            const listingQualityScore = parseNum(["listingqualityscore", "score", "lqs"]) || 7;

            normalizedRows.push({
              date,
              competitorAsin,
              price,
              reviews,
              rating,
              estimatedRevenue,
              listingQualityScore
            });
          }
        });

        if (normalizedRows.length === 0) {
          setUploadError("Could not map columns correctly. Verify headers match required format.");
          return;
        }

        setPendingRows(normalizedRows);
        setUploadSuccess(`Parsed ${normalizedRows.length} rows successfully! Select append or overwrite below.`);
      },
      error: (err) => {
        setIsParsing(false);
        setUploadError(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  const handleCompleteImport = (mode: "merge" | "overwrite") => {
    if (!pendingRows) return;

    if (activeTab === "campaigns") {
      if (mode === "overwrite") {
        setLocalCampaigns(pendingRows);
      } else {
        setLocalCampaigns([...localCampaigns, ...pendingRows]);
      }
    } else if (activeTab === "searchTerms") {
      if (mode === "overwrite") {
        setLocalTerms(pendingRows);
      } else {
        setLocalTerms([...localSearchTerms, ...pendingRows]);
      }
    } else if (activeTab === "business") {
      if (mode === "overwrite") {
        setLocalBusiness(pendingRows);
      } else {
        setLocalBusiness([...localBusiness, ...pendingRows]);
      }
    } else if (activeTab === "keywords") {
      if (mode === "overwrite") {
        setLocalKeywords(pendingRows);
      } else {
        setLocalKeywords([...localKeywords, ...pendingRows]);
      }
    } else if (activeTab === "competitors") {
      if (mode === "overwrite") {
        setLocalCompetitors(pendingRows);
      } else {
        setLocalCompetitors([...localCompetitors, ...pendingRows]);
      }
    }

    setUploadSuccess(`Successfully synchronized ${pendingRows.length} rows using the '${mode}' mode.`);
    setPendingRows(null);
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

        {/* CSV Import Panel */}
        {(() => {
          const expectedHeadersMap: Record<string, string[]> = {
            campaigns: ["Date", "Campaign ID", "Campaign Name", "Impressions", "Clicks", "Spend ($)", "Orders", "Sales ($)"],
            searchTerms: ["Date", "ASIN", "SKU", "Keyword", "Search Term", "Clicks", "Spend ($)", "Orders", "Sales ($)"],
            business: ["Date", "ASIN", "SKU", "Sessions", "Page Views", "Units Ordered", "Revenue ($)"],
            keywords: ["Date", "ASIN", "Keyword", "Search Volume", "Organic Rank", "Sponsored Rank"],
            competitors: ["Date", "Competitor ASIN", "Price ($)", "Reviews", "Rating (1-5)", "Estimated Revenue ($)", "LQS (1-10)"]
          };

          const getTabTheme = (tab: typeof activeTab) => {
            switch (tab) {
              case "campaigns":
                return {
                  accent: "emerald",
                  bg: "bg-emerald-50/20",
                  border: "border-emerald-200 hover:border-emerald-500",
                  bgActive: "bg-emerald-50",
                  borderActive: "border-emerald-500",
                  text: "text-emerald-700",
                  btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
                  lightText: "text-emerald-600",
                  iconContainer: "bg-emerald-100 text-emerald-800",
                };
              case "searchTerms":
                return {
                  accent: "indigo",
                  bg: "bg-indigo-50/20",
                  border: "border-indigo-200 hover:border-indigo-500",
                  bgActive: "bg-indigo-100/20",
                  borderActive: "border-indigo-500",
                  text: "text-indigo-700",
                  btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
                  lightText: "text-indigo-550",
                  iconContainer: "bg-indigo-100/85 text-indigo-800",
                };
              case "business":
                return {
                  accent: "sky",
                  bg: "bg-sky-50/20",
                  border: "border-sky-200 hover:border-sky-500",
                  bgActive: "bg-sky-100/20",
                  borderActive: "border-sky-550",
                  text: "text-sky-700",
                  btn: "bg-sky-600 hover:bg-sky-700 text-white",
                  lightText: "text-sky-600",
                  iconContainer: "bg-sky-100 text-sky-800",
                };
              case "keywords":
                return {
                  accent: "purple",
                  bg: "bg-purple-50/20",
                  border: "border-purple-200 hover:border-purple-500",
                  bgActive: "bg-purple-100/20",
                  borderActive: "border-purple-500",
                  text: "text-purple-700",
                  btn: "bg-purple-655 hover:bg-purple-700 text-white",
                  lightText: "text-purple-505",
                  iconContainer: "bg-purple-100 text-purple-800",
                };
              case "competitors":
                return {
                  accent: "amber",
                  bg: "bg-amber-50/20",
                  border: "border-amber-200 hover:border-amber-500",
                  bgActive: "bg-amber-100/20",
                  borderActive: "border-amber-500",
                  text: "text-amber-700",
                  btn: "bg-amber-600 hover:bg-amber-750 text-white",
                  lightText: "text-amber-600",
                  iconContainer: "bg-amber-100 text-amber-800",
                };
            }
          };

          const theme = getTabTheme(activeTab);

          return (
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-6 items-stretch justify-between font-sans">
              {/* Metadata info */}
              <div className="flex-1 space-y-3 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Upload className={`w-4 h-4 ${theme?.text}`} />
                  Upload Source Report File (CSV)
                </h3>
                
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                  Quickly sync your raw Amazon Advertising, Business, or Helium 10 exports. Match or approximate the expected columns below; our parser auto-normalizes variant spelling, capitalizations, currencies, and timestamps.
                </p>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Expected Columns:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {expectedHeadersMap[activeTab]?.map((header) => (
                      <span key={header} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200/80 text-slate-650 font-mono border border-slate-300/40">
                        {header}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Drag & Drop Area */}
              <div className="w-full lg:w-96 flex flex-col justify-center">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 select-none flex flex-col items-center justify-center gap-2 ${
                    isDragOver 
                      ? `${theme?.borderActive} ${theme?.bgActive} scale-[1.02]` 
                      : `${theme?.border} bg-white hover:bg-slate-50`
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".csv"
                    className="hidden"
                  />
                  
                  <div className={`p-2 rounded-lg ${theme?.iconContainer}`}>
                    <Upload className="w-5 h-5 shrink-0" />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700 block">
                      Drag & drop CSV file or <span className={`underline ${theme?.text}`}>browse</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Only .csv files supported
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Upload Alerts & Status Feedback */}
        {(() => {
          const getTabTheme = (tab: typeof activeTab) => {
            switch (tab) {
              case "campaigns":
                return { btn: "bg-emerald-600 hover:bg-emerald-700 text-white" };
              case "searchTerms":
                return { btn: "bg-indigo-600 hover:bg-indigo-700 text-white" };
              case "business":
                return { btn: "bg-sky-655 hover:bg-sky-700 text-white" };
              case "keywords":
                return { btn: "bg-purple-600 hover:bg-purple-700 text-white" };
              case "competitors":
                return { btn: "bg-amber-600 hover:bg-amber-700 text-white" };
            }
          };

          const theme = getTabTheme(activeTab);

          if (!uploadError && !uploadSuccess && !pendingRows) return null;

          return (
            <div className="px-5 py-4 border-b border-slate-100 bg-white flex flex-col md:flex-row gap-4 items-center justify-between font-sans">
              <div className="flex-1 flex items-start gap-3 w-full">
                {uploadError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 flex items-start gap-2.5 w-full">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold">Parsing Issue</p>
                      <p className="text-rose-600 font-medium leading-relaxed">{uploadError}</p>
                    </div>
                  </div>
                )}

                {uploadSuccess && !pendingRows && (
                  <div id="upload-success-message" className="bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-lg p-3 flex items-start gap-2.5 w-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-emerald-800">Import Succeeded</p>
                      <p className="text-emerald-700 font-medium leading-relaxed">{uploadSuccess}</p>
                    </div>
                  </div>
                )}

                {pendingRows && (
                  <div id="pending-import-banner" className="bg-indigo-50 border border-indigo-200 text-indigo-850 rounded-lg p-3 flex items-start gap-2.5 w-full">
                    <FileText className="w-5 h-5 text-indigo-650 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-indigo-850 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        Pending Sync Array
                      </p>
                      <p className="font-bold text-indigo-800 text-[13px]">
                        Parsed {pendingRows.length} Rows Successfully!
                      </p>
                      <p className="text-indigo-600 leading-relaxed font-semibold">
                        Please confirm downstream resolution behavior: fully overwrite current active dataset, or incrementally merge/append rows below.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* If pending rows, show overwrite / append controls */}
              {pendingRows && (
                <div className="flex items-center justify-end gap-2.5 shrink-0 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingRows(null);
                      setUploadSuccess(null);
                      setUploadError(null);
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-205 text-slate-700 rounded-lg text-xs font-semibold border border-slate-250 transition-all font-sans cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCompleteImport("merge")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer ${theme?.btn}`}
                  >
                    Append Rows
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCompleteImport("overwrite")}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Overwrite Dataset
                  </button>
                </div>
              )}
            </div>
          );
        })()}

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
