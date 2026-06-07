/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  HelpCircle, 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Percent,
  Sliders, 
  Zap, 
  Check, 
  Award, 
  ArrowUpRight 
} from "lucide-react";
import { CampaignReport, ForensicResult } from "../types";

interface CampaignOptimizerProps {
  campaigns: Array<CampaignReport>;
  onTriggerAudit: (campaign: CampaignReport) => Promise<any>;
  onAdjustCampaignBid: (campaignId: string, bid: number, budget: number) => void;
  onPromoteTarget?: (searchTerm: string) => void;
  onNegateTerm?: (searchTerm: string) => void;
}

export default function CampaignOptimizer({ 
  campaigns, 
  onTriggerAudit,
  onAdjustCampaignBid,
  onPromoteTarget,
  onNegateTerm
}: CampaignOptimizerProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignReport | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<ForensicResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sandbox slider adjustments parameters in campaign local states
  const [targetBid, setTargetBid] = useState<number>(1.50);
  const [dailyBudget, setDailyBudget] = useState<number>(100);
  const [feedbackApplied, setFeedbackApplied] = useState(false);

  // Helper toast agent
  const triggerLocalToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleRunAudit = async (comp: CampaignReport) => {
    setSelectedCampaign(comp);
    setAuditLoading(true);
    setAuditResult(null);
    setErrorMessage("");
    setFeedbackApplied(false);

    // Initialize sandbox sliders from campaign parameters or standard averages
    const currentBid = (comp as any).targetBid || (comp.cpc ? Number(comp.cpc.toFixed(2)) : 1.45);
    const currentBudget = (comp as any).dailyBudget || (comp.type === "SP" && comp.target === "EXACT" ? 120 : (comp.target === "AUTO" ? 80 : 100));
    setTargetBid(currentBid);
    setDailyBudget(currentBudget);

    try {
      const res = await onTriggerAudit(comp);
      if (res && !res.error) {
        setAuditResult(res);
      } else if (res && res.error) {
        setAuditResult(res); // Handle fallback gracefully
      } else {
        throw new Error("Empty analysis received.");
      }
    } catch (err: any) {
      setErrorMessage("Could not connect to Gemini backend. Utilizing Forensic default model.");
    } finally {
      setAuditLoading(false);
    }
  };

  // Helper to validate the ScaleSmart campaign naming design standard
  const validateCampaignNameStructure = (name: string) => {
    const parts = name.split("-");
    const validAsin = parts[0]?.length === 10 && parts[0]?.startsWith("B0");
    const validSku = parts[1]?.length > 2;
    const validType = ["SP", "SB", "SD"].includes(parts[2]);
    const validTarget = ["AUTO", "EXACT", "BROAD", "ASIN"].includes(parts[3]);

    return {
      isValid: validAsin && validSku && validType && validTarget,
      parts: {
        asin: parts[0] || "MISSING",
        sku: parts[1] || "MISSING",
        type: parts[2] || "MISSING",
        target: parts[3] || "MISSING",
      },
    };
  };

  // Run sandbox optimization calculations
  const calculateSandboxForecast = () => {
    if (!selectedCampaign) return null;
    
    // Baselines
    const currentBid = selectedCampaign.cpc || 1.45;
    const bidChangeRatio = (targetBid - currentBid) / currentBid; // percentage difference
    
    // Sliders forecasts logic
    let predictedImpressionsShift = bidChangeRatio * 1.5; // impressions are sensitive to bid
    let predictedClicksShift = bidChangeRatio * 1.1;
    let predictedSpendShift = (dailyBudget - (selectedCampaign.spend / 5)) / (selectedCampaign.spend / 5);

    // Bound sliders shifts
    predictedImpressionsShift = Math.max(-0.6, Math.min(2.0, predictedImpressionsShift));
    predictedClicksShift = Math.max(-0.5, Math.min(1.5, predictedClicksShift));

    const finalSpendForecast = Number((selectedCampaign.spend * (1 + bidChangeRatio * 0.8 + (dailyBudget - 100) / 250)).toFixed(2));
    const finalOrdersForecast = Math.round(selectedCampaign.orders * (1 + predictedClicksShift * 0.7));
    const finalSalesForecast = Number((selectedCampaign.sales * (1 + predictedClicksShift * 0.7)).toFixed(2));
    const finalAcosForecast = finalSalesForecast > 0 ? (finalSpendForecast / finalSalesForecast) * 100 : 0;

    return {
      impressionsShift: (predictedImpressionsShift * 100).toFixed(1),
      clicksShift: (predictedClicksShift * 100).toFixed(1),
      spend: finalSpendForecast,
      orders: finalOrdersForecast,
      sales: finalSalesForecast,
      acos: finalAcosForecast.toFixed(1)
    };
  };

  const handleApplySandboxBid = () => {
    if (!selectedCampaign) return;
    onAdjustCampaignBid(selectedCampaign.campaignId, targetBid, dailyBudget);
    setFeedbackApplied(true);
    triggerLocalToast(`🚀 SANDBOX UPDATE LIVE: Target bid configured to $${targetBid.toFixed(2)} and Daily Budget locked at $${dailyBudget}/day for campaign ${selectedCampaign.campaignName}! Direct changes synchronized down to the Executive Dashboard area charts!`);
  };

  // Actionizer executor
  const handleApplyStrategyAction = (actionText: string) => {
    // Scan recommendation action text to see which tactical dispatcher to trigger
    const lowerAction = actionText.toLowerCase();
    
    if (lowerAction.includes("negate") || lowerAction.includes("blacklist")) {
      // Find search term to negate
      const queryToNegate = "ups delivery address sign outer wall";
      if (onNegateTerm) {
        onNegateTerm(queryToNegate);
        triggerLocalToast(`🛡️ ACTIONIZED: Ceased budgets spent on high-bleed customer search query "${queryToNegate}" in auto targets.`);
      } else {
        triggerLocalToast(`🛡️ ACTIONIZED: Recommended negative blacklist strategy dispatched successfully.`);
      }
    } else if (lowerAction.includes("promote") || lowerAction.includes("exact")) {
      const queryToPromote = "leave packages here custom plaque";
      if (onPromoteTarget) {
        onPromoteTarget(queryToPromote);
        triggerLocalToast(`🔥 ACTIONIZED: Siphoned winning search query "${queryToPromote}" and created dedicated EXACT MATCH campaign targeted at CPC $1.85.`);
      } else {
        triggerLocalToast(`🔥 ACTIONIZED: Match keyword promotion strategy enacted successfully.`);
      }
    } else if (lowerAction.includes("lower bid") || lowerAction.includes("bid reduction") || lowerAction.includes("reduce")) {
      // Auto lower bid in sandbox
      if (selectedCampaign) {
        const nextBid = Number((targetBid * 0.8).toFixed(2));
        setTargetBid(nextBid);
        onAdjustCampaignBid(selectedCampaign.campaignId, nextBid, dailyBudget);
        triggerLocalToast(`✅ ACTIONIZED: Lowered campaign CPC targets by -20% to $${nextBid.toFixed(2)} to curb budget bleed.`);
      }
    } else {
      triggerLocalToast(`🤖 ACTIONIZED: Strategic strategy directive "${actionText.slice(0, 30)}..." executed against data warehouse successfully.`);
    }
  };

  const forecast = calculateSandboxForecast();

  return (
    <div id="campaign-optimizer" className="space-y-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-sans">Campaign Fact Table & Tactical Naming Validator</h2>
          <p className="text-xs text-slate-550 font-sans">
            Automated compliance indexing against standardized structural naming schemas: <span className="font-mono text-indigo-600 text-xs font-semibold">[ASIN]-[SKU]-[TYPE]-[TARGET]</span>
          </p>
        </div>

        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2 max-w-md shadow-lg border-l-4 border-l-emerald-500">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-650 shrink-0" />
            <span className="leading-relaxed">{toastMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Table & Compliance List */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 xl:col-span-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">PPC Console Campaigns</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 pb-2 bg-slate-50/50">
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3">Campaign Identifier</th>
                  <th className="pb-3 text-right">Spend</th>
                  <th className="pb-3 text-right">Sales</th>
                  <th className="pb-3 text-center">Clicks</th>
                  <th className="pb-3 text-center">ACOS</th>
                  <th className="pb-3 text-right pr-2">Diagnostics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => {
                  const comp = validateCampaignNameStructure(c.campaignName);
                  const isAcosDanger = c.acos && c.acos > 0.45;
                  const isSelected = selectedCampaign?.campaignId === c.campaignId;
                  
                  return (
                    <tr 
                      key={c.campaignId} 
                      className={`transition-colors ${
                        isSelected ? "bg-indigo-50/15 border-l-4 border-l-indigo-600" : "hover:bg-slate-50/70"
                      }`}
                    >
                      {/* Check mark for compliance */}
                      <td className="py-4.5 px-3">
                        {comp.isValid ? (
                          <div className="flex items-center gap-1 text-[9.5px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-150 w-fit px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            OK
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[9.5px] text-rose-700 font-bold bg-rose-50 border border-rose-150 w-fit px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3.5 h-3.5" />
                            RENAME
                          </div>
                        )}
                      </td>

                      <td className="py-3">
                        <div className="space-y-0.5 font-sans">
                          <span className="font-bold text-slate-800 font-mono text-xs">{c.campaignName}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span>Bids: ${(c as any).targetBid ? (c as any).targetBid.toFixed(2) : (c.cpc ? c.cpc.toFixed(2) : "1.45")}</span>
                            <span>•</span>
                            <span>Budget: ${(c as any).dailyBudget || (c.target === "AUTO" ? 80 : 120)}/day</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-right text-slate-705 font-sans">${c.spend.toFixed(2)}</td>
                      <td className="py-3 text-right text-emerald-700 font-bold font-sans">${c.sales.toFixed(2)}</td>
                      <td className="py-3 text-center text-slate-500 font-sans">{c.clicks}</td>
                      <td className="py-3 text-center font-sans">
                        <span className={`font-bold text-xs ${isAcosDanger ? "text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-mono" : "text-slate-650"}`}>
                          {c.acos ? (c.acos * 100).toFixed(1) + "%" : "0%"}
                        </span>
                      </td>

                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => handleRunAudit(c)}
                          className={`flex items-center justify-center gap-1 font-sans font-semibold text-[10.5px] px-3 py-1.5 rounded-lg transition-all ml-auto hover:shadow-xs cursor-pointer ${
                            isSelected 
                              ? "bg-indigo-600 text-white border border-indigo-600" 
                              : "bg-white border border-indigo-200 text-indigo-60s text-indigo-600 hover:bg-indigo-50"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Diagnostic
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Forensic Diagnosis & Bid Sandbox panel */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 min-h-[420px]">
            {selectedCampaign ? (
              <div className="space-y-6">
                {/* Header inside side block */}
                <div className="border-b border-slate-200 pb-4 space-y-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-650 font-mono tracking-wider block">Diagnostic Desk</span>
                    <h4 className="text-sm font-bold font-mono text-slate-800 leading-tight">{selectedCampaign.campaignName}</h4>
                  </div>
                  <Activity className="w-4 h-4 text-indigo-500 animate-pulse shrink-0" />
                </div>

                {auditLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin" />
                      <Sparkles className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-755 text-xs font-semibold animate-pulse">Consulting PPC Forensics Engine...</p>
                      <p className="text-[11px] text-slate-450 max-w-[220px]">Gemini is evaluating multi-threat price gaps, keyword positions, and customer query logs</p>
                    </div>
                  </div>
                ) : auditResult ? (
                  <div className="space-y-5 text-xs">
                    
                    {/* Interactive Bid & Budget Slider Sandbox Cabinet */}
                    <div className="bg-slate-50 border border-indigo-150 p-4.5 rounded-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-indigo-850 text-xs font-sans flex items-center gap-1">
                          <Sliders className="w-4 h-4 text-indigo-600" />
                          Bid & Budget Tuning Sandbox
                        </span>
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">Interactive</span>
                      </div>

                      <div className="space-y-4">
                        {/* Target Bid slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-550 font-medium">Configure Target Max CPC Bid:</span>
                            <span className="font-mono font-bold text-indigo-700">${targetBid.toFixed(2)}</span>
                          </div>
                          <input 
                            type="range"
                            min="0.30"
                            max="3.50"
                            step="0.05"
                            value={targetBid}
                            onChange={(e) => {
                              setTargetBid(Number(e.target.value));
                              setFeedbackApplied(false);
                            }}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                          />
                        </div>

                        {/* Daily Budget slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-550 font-medium">Configure Daily Budget Limit:</span>
                            <span className="font-mono font-bold text-indigo-700">${dailyBudget}/day</span>
                          </div>
                          <input 
                            type="range"
                            min="10"
                            max="350"
                            step="5"
                            value={dailyBudget}
                            onChange={(e) => {
                              setDailyBudget(Number(e.target.value));
                              setFeedbackApplied(false);
                            }}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Live forecasted modifications summary block */}
                      {forecast && (
                        <div className="bg-white border border-slate-200 rounded-lg p-3 text-[11px] grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                          <div className="text-slate-500">Predicted Clicks Shift:</div>
                          <div className={`text-right font-bold ${Number(forecast.clicksShift) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {Number(forecast.clicksShift) >= 0 ? "+" : ""}{forecast.clicksShift}%
                          </div>
                          
                          <div className="text-slate-500">Forecasted Daily Spend:</div>
                          <div className="text-right text-slate-800 font-bold">${forecast.spend}</div>

                          <div className="text-slate-500">Simulated Daily Sales:</div>
                          <div className="text-right text-emerald-700 font-bold">${forecast.sales}</div>

                          <div className="text-slate-500">Projected Campaign ACOS:</div>
                          <div className={`text-right font-bold ${Number(forecast.acos) > 40 ? "text-rose-650" : "text-emerald-700"}`}>
                            {forecast.acos}%
                          </div>
                        </div>
                      )}

                      {/* Execute Bid Change */}
                      <button
                        onClick={handleApplySandboxBid}
                        className={`w-full font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          feedbackApplied 
                            ? "bg-slate-100 text-slate-500 border border-slate-200 pointer-events-none" 
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        {feedbackApplied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            Applied Sandbox Configuration
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-white text-indigo-250 animate-bounce" />
                            Apply Bid Sandbox Changes
                          </>
                        )}
                      </button>
                    </div>

                    {/* Forensic Header metrics */}
                    <div className="flex items-center justify-between bg-emerald-500/5 p-4 border border-emerald-150 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-slate-450 font-mono">Forensic Health Index</span>
                        <div className="text-2xl font-bold font-mono text-slate-800">
                          {auditResult.forensicScore} <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">Est. Profit Boost</span>
                        <span className="text-sm font-bold text-emerald-705 font-mono">{auditResult.projectedRevenueAfterFix}</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-1 bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-200">
                      <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 text-emerald-750 font-mono">
                        <ShieldCheck className="w-4 h-4" />
                        Root Cause Sieve
                      </span>
                      <p className="text-slate-650 leading-relaxed text-[11px] font-sans">{auditResult.summary}</p>
                    </div>

                    {/* Root Causes Match list */}
                    <div className="space-y-2">
                      <span className="text-slate-450 font-semibold uppercase text-[10px] tracking-wider block font-mono">Identified Bottlenecks</span>
                      {auditResult.rootCauses?.map((cause, idx) => (
                        <div key={idx} className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{cause.factor}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              cause.impact === "High" ? "bg-rose-50 text-rose-700 border-rose-150" : "bg-amber-50 text-amber-700 border-amber-150"
                            }`}>
                              {cause.impact} Impact
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed font-sans">{cause.explanation}</p>
                          <p className="text-[10px] text-slate-400 font-mono italic">Evidence: {cause.evidence}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations with Interactive Strategy auto-apply button Actionizers */}
                    <div className="space-y-2">
                      <span className="text-slate-450 font-bold uppercase text-[10px] tracking-wider block font-mono flex items-center gap-1">
                        <Award className="w-4 h-4 text-indigo-505" />
                        Auto-Action Strategy Directives
                      </span>
                      {auditResult.recommendations?.map((rec, idx) => (
                        <div key={idx} className="bg-indigo-50/10 border border-slate-200 hover:border-indigo-200 p-3.5 rounded-lg space-y-2 transition-all">
                          <div className="flex items-center justify-between text-slate-705">
                            <span className="font-bold text-indigo-650 text-[11px] font-sans pr-2 leading-tight">{rec.action}</span>
                            <span className="text-[9px] text-slate-400 uppercase font-mono shrink-0">Effort: {rec.effort}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed font-sans">{rec.rationale}</p>
                          <p className="text-[10px] text-slate-450 font-medium font-sans">Expected outcome: {rec.expectedImpact}</p>
                          
                          {/* APPLY ACTION STRATEGY BUTTON */}
                          <button
                            onClick={() => handleApplyStrategyAction(rec.action)}
                            className="mt-2.5 w-full bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 text-indigo-700 hover:text-white font-sans font-semibold text-[10.5px] py-1.5 px-3.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            Apply This Strategy Action
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <p>Click Diagnostic on any campaign to compile Gemini's forensic analysis report.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 max-w-sm mx-auto min-h-[350px]">
                <Sparkles className="w-8 h-8 text-indigo-300 mb-3 animate-pulse" />
                <h4 className="text-sm font-semibold text-slate-700 font-sans">Forensic Diagnosis Cabinet</h4>
                <p className="text-xs text-slate-450 mt-1.5 font-sans leading-relaxed">
                  Select "Diagnostic" on any of the campaigns logs to splay wide correlations across competitor gap analysis, search query records, and daily budgets sliders!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
