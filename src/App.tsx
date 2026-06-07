/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Database,
  Sliders,
  Search,
  Activity,
  Sparkles,
  RefreshCw,
  Bell,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Compass,
  Trophy,
  ArrowRight,
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Types
import { CampaignReport, SearchTermReport, BusinessReport, KeywordIntel, CompetitorIntel, DecisionAlert } from "./types";

// Simulation & Initial Datasets
import {
  initialRawCampaigns,
  initialRawSearchTerms,
  initialRawBusinessReports,
  initialRawKeywordIntel,
  initialRawCompetitors,
  runETLProcess
} from "./data/mockData";

// Subcomponents
import EtlConsole from "./components/EtlConsole";
import ExecutiveDashboard from "./components/ExecutiveDashboard";
import CampaignOptimizer from "./components/CampaignOptimizer";
import KeywordTracker from "./components/KeywordTracker";
import SearchTermConsole from "./components/SearchTermConsole";
import CompetitorAnalyzer from "./components/CompetitorAnalyzer";
import GoogleSheetsPanel from "./components/GoogleSheetsPanel";
import ForensicCopilotChat from "./components/ForensicCopilotChat";
import { initAuth, googleSignIn, logout } from "./lib/firebaseAuth";

export default function App() {
  // Shared Auth Credentials
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setAuthLoading(false);
        setAuthError(null);
      },
      () => {
        setUser(null);
        setToken(null);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err: any) {
      console.error("Login error under App.tsx dashboard:", err);
      let errMsg = err.message || String(err);
      if (errMsg.includes("auth/unauthorized-domain") || (err.code && err.code === "auth/unauthorized-domain")) {
        errMsg = `Unauthorized Domain: The domain (${window.location.host}) is not registered in your Firebase settings. Add this domain to your Authorized Domains list in the Firebase Console (Authentication ➔ Settings ➔ Authorized Domains) and try again.`;
      }
      setAuthError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setAuthError(null);
    } catch (err) {
      console.error("Logout error under App.tsx dashboard", err);
    }
  };
  // Navigation
  const [activeTab, setActiveTab] = useState<"executive" | "etl" | "sheets" | "campaigns" | "keywords" | "searchTerms" | "competitors" | "copilot">("executive");

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("scale_smart_sidebar_collapsed");
      return saved === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("scale_smart_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  // Raw Database Layers
  const [rawCampaigns, setRawCampaigns] = useState<Array<any>>(initialRawCampaigns);
  const [rawSearchTerms, setRawSearchTerms] = useState<Array<any>>(initialRawSearchTerms);
  const [rawBusiness, setRawBusiness] = useState<Array<any>>(initialRawBusinessReports);
  const [rawKeywords, setRawKeywords] = useState<Array<any>>(initialRawKeywordIntel);
  const [rawCompetitors, setRawCompetitors] = useState<Array<any>>(initialRawCompetitors);

  // Normalized (ETL-processed) Layers
  const [normalizedData, setNormalizedData] = useState<any>(null);

  // Run initial ETL compile on startup
  useEffect(() => {
    const processed = runETLProcess(rawCampaigns, rawSearchTerms, rawBusiness, rawKeywords, rawCompetitors);
    setNormalizedData(processed);
  }, [rawCampaigns, rawSearchTerms, rawBusiness, rawKeywords, rawCompetitors]);

  // Operational Action: Trigger ETL Pipeline Compile
  const handleTriggerEtl = (updatedRaw: {
    campaigns?: Array<any>;
    searchTerms?: Array<any>;
    business?: Array<any>;
    keywords?: Array<any>;
    competitors?: Array<any>;
  }) => {
    if (updatedRaw.campaigns) setRawCampaigns(updatedRaw.campaigns);
    if (updatedRaw.searchTerms) setRawSearchTerms(updatedRaw.searchTerms);
    if (updatedRaw.business) setRawBusiness(updatedRaw.business);
    if (updatedRaw.keywords) setRawKeywords(updatedRaw.keywords);
    if (updatedRaw.competitors) setRawCompetitors(updatedRaw.competitors);
  };

  // Operational Action: Reset entirely back to default mocks
  const handleResetToDefaults = () => {
    setRawCampaigns(initialRawCampaigns);
    setRawSearchTerms(initialRawSearchTerms);
    setRawBusiness(initialRawBusinessReports);
    setRawKeywords(initialRawKeywordIntel);
    setRawCompetitors(initialRawCompetitors);
  };

  // Tactical Dispatch Action: Promote Search query to EXACT target
  const handlePromoteKeyword = (st: SearchTermReport) => {
    // 1. Add keyword row to Helium 10 tracker to represent indexing boost
    const keywordExists = rawKeywords.some((k) => k.keyword.toLowerCase() === st.searchTerm.toLowerCase());
    if (!keywordExists) {
      setRawKeywords([
        ...rawKeywords,
        {
          date: "2026-06-05",
          asin: st.asin,
          keyword: st.searchTerm,
          searchVolume: 4500, // Simulated initial Cerebro estimate
          organicRank: 15,    // Medium high initial placement
          sponsoredRank: 1    // Placed immediately at sponsored #1 spot
        }
      ]);
    }

    // 2. Insert new exact targeted campaign in raw ad campaigns database
    const newCampaignId = `C20${rawCampaigns.length + 1}`;
    const newCampaignName = `${st.asin}-${st.sku}-SP-EXACT`;
    const campaignExists = rawCampaigns.some((c) => c.campaignName === newCampaignName);

    if (!campaignExists) {
      setRawCampaigns([
        ...rawCampaigns,
        {
          date: "2026-06-05",
          campaignId: newCampaignId,
          campaignName: newCampaignName,
          impressions: 4200,
          clicks: 18,
          spend: 32.4,
          orders: 3,
          sales: 89.97
        }
      ]);
    }
  };

  // Tactical Dispatch Action: Negate Term (stops bleeding spend completely)
  const handleNegateTerm = (st: SearchTermReport) => {
    // Emulates neutralizing budget bleed by setting further spend forecasts to 0
    const updatedTerms = rawSearchTerms.map((term) => {
      if (term.searchTerm === st.searchTerm) {
        return { ...term, spend: 0, clicks: 0, orders: 0, sales: 0 };
      }
      return term;
    });
    setRawSearchTerms(updatedTerms);

    // Also adjust campaign raw spend to reflect budget preservation
    const updatedCampaigns = rawCampaigns.map((c) => {
      if (c.campaignName.endsWith("AUTO")) {
        return { ...c, spend: Math.max(10, c.spend - st.spend) }; // Siphons off targeted bleed price
      }
      return c;
    });
    setRawCampaigns(updatedCampaigns);
  };

  // Tactical Sandbox Action: Adjust target campaign bids/budgets dynamically
  const handleAdjustCampaignBid = (campaignId: string, nextBid: number, nextBudget: number) => {
    const updatedCampaigns = rawCampaigns.map((c) => {
      if (c.campaignId === campaignId) {
        // Safe baselines check
        const currentCampaignBudget = c.dailyBudget || 100;
        const currentBid = c.targetBid || 1.45;
        const budgetRatio = nextBudget / currentCampaignBudget;
        const bidRatio = nextBid / currentBid;
        return {
          ...c,
          dailyBudget: nextBudget,
          targetBid: nextBid,
          spend: Number(Math.max(5, c.spend * budgetRatio * bidRatio).toFixed(2)),
          sales: Number(Math.max(0, c.sales * budgetRatio * bidRatio).toFixed(2)),
          clicks: Math.max(1, Math.round(c.clicks * budgetRatio)),
          orders: Math.max(0, Math.round(c.orders * budgetRatio)),
        };
      }
      return c;
    });
    setRawCampaigns(updatedCampaigns);
  };

  // Tactical Sandbox Action: Test term in sandbox target group
  const handleTestTerm = (st: SearchTermReport) => {
    // Set low-level bidding sandbox testing metrics
    const updatedTerms = rawSearchTerms.map((term) => {
      if (term.searchTerm === st.searchTerm) {
        return { ...term, spend: Math.max(1, term.spend * 0.4) }; // Cut bid / spend to test efficiently
      }
      return term;
    });
    setRawSearchTerms(updatedTerms);
  };

  // Server-side action: Hit analyze API to trigger Gemini PPC Forensic Audit
  const handleTriggerAudit = async (campaign: CampaignReport) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign,
          searchTerms: normalizedData?.searchTerms || [],
          organicKeywords: normalizedData?.keywords || [],
          competitors: normalizedData?.competitors || [],
          businessMetrics: normalizedData?.business?.[normalizedData.business.length - 1] || null
        })
      });
      return await response.json();
    } catch (err) {
      console.error("Failed to query Gemini PPC API", err);
      return { error: true };
    }
  };

  // Loading Safeguard
  if (!normalizedData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center font-sans animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="font-semibold text-slate-650">Loading ScaleSmart Data Warehouses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 overflow-hidden antialiased">
      
      {/* Sidebar Navigation */}
      <aside className={`bg-[#0F172A] text-slate-300 flex flex-col justify-between border-r border-[#1E293B] shrink-0 select-none transition-all duration-300 ease-in-out relative ${isSidebarCollapsed ? "w-16" : "w-64"}`}>
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between min-h-[64px]">
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-full" : "gap-2.5"}`}>
              <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center text-white font-bold font-sans shadow-md shadow-indigo-500/20 shrink-0 select-none">
                S
              </div>
              {!isSidebarCollapsed && (
                <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="truncate">
                  <h1 className="text-sm font-bold tracking-tight text-white leading-tight">ScaleSmart</h1>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">PPC Intel v1.0.0</p>
                </motion.div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
            <div className="flex justify-center py-2 border-b border-slate-800/60">
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <nav className="p-3 space-y-1.5">
            {[
              { id: "executive", label: "Executive Dashboard", icon: "📊", border: "border-indigo-500", bgActive: "bg-indigo-600/15 text-indigo-400" },
              { id: "copilot", label: "AI Forensic Co-Pilot", icon: "✨", border: "border-purple-500", bgActive: "bg-purple-600/15 text-purple-400" },
              { id: "etl", label: "ETL Warehouse", icon: "🔄", border: "border-indigo-500", bgActive: "bg-indigo-600/15 text-indigo-400" },
              { id: "sheets", label: "Google Sheets Sync", icon: "🟢", border: "border-emerald-500", bgActive: "bg-emerald-600/15 text-emerald-400" },
              { id: "campaigns", label: "Campaign Optimizer", icon: "🎯", border: "border-indigo-500", bgActive: "bg-indigo-600/15 text-indigo-400" },
              { id: "keywords", label: "Keyword Rank Tracker", icon: "🔑", border: "border-indigo-500", bgActive: "bg-indigo-600/15 text-indigo-400" },
              { id: "searchTerms", label: "Search Term Dispatch", icon: "🧩", border: "border-indigo-500", bgActive: "bg-indigo-600/15 text-indigo-400" },
              { id: "competitors", label: "Competitor Outrank", icon: "🛡️", border: "border-indigo-500", bgActive: "bg-indigo-600/15 text-indigo-400" }
            ].map((tabItem) => {
              const isActive = activeTab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setActiveTab(tabItem.id as any)}
                  className={`group relative w-full flex items-center rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-3 text-left"
                  } ${
                    isActive
                      ? `${tabItem.bgActive} border-l-4 ${tabItem.border}`
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                  title={isSidebarCollapsed ? undefined : tabItem.label}
                >
                  <span className="shrink-0 text-base">{tabItem.icon}</span>
                  {!isSidebarCollapsed && <span className="truncate">{tabItem.label}</span>}
                  
                  {/* Collapsed Hover Tooltip */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-14 ml-2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-white text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-[100] whitespace-nowrap shadow-xl">
                      {tabItem.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 space-y-3 border-t border-slate-800">
          {!isSidebarCollapsed && (
            <div className="bg-slate-800/30 p-3 rounded-lg text-xs space-y-1">
              <div className="text-slate-500 font-medium">Active ASIN Item</div>
              <div className="text-white font-mono font-bold leading-none">B0GXWB95V9</div>
              <div className="text-slate-400 text-[10px] font-mono leading-none">SIGN12X8-WOOD</div>
            </div>
          )}

          <div className={`p-1 flex ${isSidebarCollapsed ? "justify-center" : "items-center gap-2.5"}`}>
            {user ? (
              user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Google avatar"}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-indigo-500/30 shadow-sm shrink-0 animate-fade-in"
                  title={user.email}
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400 shadow-xs shrink-0"
                  title={user.email}
                >
                  {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : (user.email ? user.email.slice(0, 2).toUpperCase() : "US")}
                </div>
              )
            ) : (
              <div 
                className="w-8 h-8 rounded-full bg-slate-700/50 border border-slate-600/30 flex items-center justify-center font-semibold text-xs text-slate-400 shrink-0 select-none"
                title="John Wesley Quintero (Demo Mode)"
              >
                JW
              </div>
            )}
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1 select-none">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user ? (user.displayName || "Authorized User") : "John Wesley"}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5" title={user ? user.email : "wesley.ecomva@gmail.com"}>
                  {user ? user.email : "wesley.ecomva@gmail.com"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header content */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Date Range:</span>
              <select className="text-sm font-semibold border-none bg-slate-50 text-slate-800 rounded px-2.5 py-1 focus:outline-none">
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 bg-emerald-50 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-250 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                CONNECTED
              </span>
              <span className="text-slate-400 text-xs italic">Last sync: 14m ago</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-[11px] font-mono leading-tight hidden md:block">
              <span className="text-slate-450 block uppercase text-[9px] tracking-wide font-medium">Status</span>
              <span className="text-emerald-600 font-bold">NORMAL SOLUTION</span>
            </div>
            <button 
              onClick={() => setActiveTab("sheets")}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-205 hover:bg-slate-200 text-slate-705 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Google Sheets Sync
            </button>
            {user ? (
              user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Google avatar"}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-indigo-300 shadow-sm"
                  title={user.email}
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-205 flex items-center justify-center font-bold text-xs text-indigo-600 shadow-xs"
                  title={user.email}
                >
                  {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : (user.email ? user.email.slice(0, 2).toUpperCase() : "US")}
                </div>
              )
            ) : (
              <div 
                className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-205 flex items-center justify-center font-bold text-xs text-indigo-600 shadow-xs"
                title="Anonymous Mode"
              >
                JW
              </div>
            )}
          </div>
        </header>

        {/* Workspace body */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          
          {/* Main workspace widgets segment */}
          <div className="xl:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="space-y-6"
              >
                {activeTab === "executive" && (
                  <ExecutiveDashboard
                    campaigns={normalizedData.campaigns}
                    business={normalizedData.business}
                  />
                )}

                {activeTab === "etl" && (
                  <EtlConsole
                    rawCampaigns={rawCampaigns}
                    rawSearchTerms={rawSearchTerms}
                    rawBusiness={rawBusiness}
                    rawKeywords={rawKeywords}
                    rawCompetitors={rawCompetitors}
                    onTriggerEtl={handleTriggerEtl}
                    onResetToDefaults={handleResetToDefaults}
                  />
                )}

                {activeTab === "sheets" && (
                  <GoogleSheetsPanel
                    currentData={{
                      campaigns: rawCampaigns,
                      searchTerms: rawSearchTerms,
                      business: rawBusiness,
                      keywords: rawKeywords,
                      competitors: rawCompetitors
                    }}
                    onImportData={(imported) => {
                      if (imported.campaigns && imported.campaigns.length > 0) setRawCampaigns(imported.campaigns);
                      if (imported.searchTerms && imported.searchTerms.length > 0) setRawSearchTerms(imported.searchTerms);
                      if (imported.business && imported.business.length > 0) setRawBusiness(imported.business);
                      if (imported.keywords && imported.keywords.length > 0) setRawKeywords(imported.keywords);
                      if (imported.competitors && imported.competitors.length > 0) setRawCompetitors(imported.competitors);
                    }}
                    user={user}
                    setUser={setUser}
                    token={token}
                    setToken={setToken}
                    authLoading={authLoading}
                    setAuthLoading={setAuthLoading}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                    authError={authError}
                    setAuthError={setAuthError}
                  />
                )}

                {activeTab === "copilot" && (
                  <ForensicCopilotChat
                    context={{
                      campaigns: rawCampaigns,
                      searchTerms: rawSearchTerms,
                      keywords: rawKeywords,
                      competitors: rawCompetitors,
                      business: rawBusiness
                    }}
                  />
                )}

                {activeTab === "campaigns" && (
                  <CampaignOptimizer
                    campaigns={normalizedData.campaigns}
                    onTriggerAudit={handleTriggerAudit}
                    onAdjustCampaignBid={handleAdjustCampaignBid}
                    onPromoteTarget={(searchTerm) => {
                      handlePromoteKeyword({
                        searchTerm,
                        asin: "B0GXWB95V9",
                        sku: "SIGN12X8",
                        spend: 0,
                        clicks: 0,
                        orders: 1,
                        sales: 29.99
                      } as any);
                    }}
                    onNegateTerm={(stName) => {
                      handleNegateTerm({ searchTerm: stName, spend: 14.40, clicks: 8, orders: 0, sales: 0 } as any);
                    }}
                  />
                )}

                {activeTab === "keywords" && (
                  <KeywordTracker keywords={normalizedData.keywords} />
                )}

                {activeTab === "searchTerms" && (
                  <SearchTermConsole
                    searchTerms={normalizedData.searchTerms}
                    onPromoteKeyword={handlePromoteKeyword}
                    onNegateTerm={handleNegateTerm}
                    onTestTerm={handleTestTerm}
                  />
                )}

                {activeTab === "competitors" && (
                  <CompetitorAnalyzer competitors={normalizedData.competitors} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right sidebar for alerts matching theme layout */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-xs tracking-wide uppercase flex items-center gap-1.5 font-sans">
                  <span className="text-indigo-500 animate-pulse">●</span> Business Alerts Sieve
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
              </div>

              <div className="space-y-3.5 max-h-[420px] overflow-y-auto scrollbar-thin">
                {normalizedData.alerts && normalizedData.alerts.length > 0 ? (
                  normalizedData.alerts.map((al: DecisionAlert) => (
                    <div
                      key={al.id}
                      className={`p-3.5 rounded-lg border text-xs space-y-2 transition-colors ${
                        al.type === "critical"
                          ? "bg-red-50/70 border-red-200 text-red-900"
                          : al.type === "success"
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-amber-50/70 border-amber-200 text-amber-955"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${
                          al.type === "critical" ? "text-red-500" : al.type === "success" ? "text-emerald-500" : "text-amber-500"
                        }`} />
                        <span className="text-xs">{al.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-650 leading-relaxed font-sans">{al.recommendation}</p>
                      <div className="text-[10px] text-slate-400 font-mono italic">
                        Trigger: {al.triggerCondition}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No critical pipeline alerts triggered.
                  </div>
                )}
              </div>
              
              <div className="text-[10px] text-slate-500 leading-normal bg-slate-50 p-3 rounded-lg border border-slate-100 italic font-sans">
                <strong>Intelligence recommend:</strong> These insights run continuously against threshold performance benchmarks.
              </div>
            </div>

            {/* Quick Context Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-xs space-y-3">
              <h4 className="font-bold text-slate-800 font-sans">ScaleSmart Philosophy</h4>
              <p className="text-slate-500 leading-relaxed text-[11px] font-sans">
                "Tools are secondary. Rigorously synchronized data structures and analytical mappings of pricing, indexing, and budget efficiency form true leverage."
              </p>
              <div className="text-[10px] text-slate-400 font-mono">
                System status: OK
              </div>
            </div>
            
          </div>

        </div>

        {/* Main Footer inside panels */}
        <footer className="h-12 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0 text-xs text-slate-400 font-mono">
          <p>© 2026 ScaleSmart Platform.</p>
          <p>ASIN B0GXWB95V9 • SKU SIGN12X8</p>
        </footer>
      </main>

    </div>
  );
}
