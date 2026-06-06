/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, HelpCircle, Activity, Sparkles, AlertTriangle, ShieldCheck, TrendingUp, DollarSign } from "lucide-react";
import { CampaignReport, ForensicResult } from "../types";

interface CampaignOptimizerProps {
  campaigns: Array<CampaignReport>;
  onTriggerAudit: (campaign: CampaignReport) => Promise<any>;
}

export default function CampaignOptimizer({ campaigns, onTriggerAudit }: CampaignOptimizerProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignReport | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<ForensicResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRunAudit = async (comp: CampaignReport) => {
    setSelectedCampaign(comp);
    setAuditLoading(true);
    setAuditResult(null);
    setErrorMessage("");

    try {
      const res = await onTriggerAudit(comp);
      if (res && !res.error) {
        setAuditResult(res);
      } else if (res && res.error) {
        // Fallback handled gracefully
        setAuditResult(res);
      } else {
        throw new Error("Empty analysis received.");
      }
    } catch (err: any) {
      setErrorMessage("Could not connect to Gemini backend. Check SECRETS key.");
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

  return (
    <div id="campaign-optimizer" className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-sans">Campaign Fact Table & Naming Validator</h2>
          <p className="text-xs text-slate-550 font-sans">
            Automated compliance indexing against standardized structural schemas: <span className="font-mono text-indigo-600 text-xs font-semibold">[ASIN]-[SKU]-[TYPE]-[TARGET]</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table & Compliance List */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 xl:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Fact Table Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 pb-2">
                  <th className="pb-3 px-2">Compliance</th>
                  <th className="pb-3">Campaign Identifier</th>
                  <th className="pb-3">Spend</th>
                  <th className="pb-3">Sales</th>
                  <th className="pb-3">Clicks</th>
                  <th className="pb-3">ACOS</th>
                  <th className="pb-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => {
                  const comp = validateCampaignNameStructure(c.campaignName);
                  const isAcosDanger = c.acos && c.acos > 0.45;
                  
                  return (
                    <tr key={c.campaignId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Check mark for compliance */}
                      <td className="py-3 px-2">
                        {comp.isValid ? (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-150 w-fit px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            VALID
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-150 w-fit px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            ERR
                          </div>
                        )}
                      </td>

                      <td className="py-3 pr-2">
                        <div className="space-y-0.5 font-sans">
                          <span className="font-bold text-slate-805 font-mono text-xs">{c.campaignName}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span>ASIN: {comp.parts.asin}</span>
                            <span>•</span>
                            <span>SKU: {comp.parts.sku}</span>
                            <span>•</span>
                            <span>TYPE: {comp.parts.type}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-slate-700 font-sans">${c.spend.toFixed(2)}</td>
                      <td className="py-3 text-emerald-700 font-bold font-sans">${c.sales.toFixed(2)}</td>
                      <td className="py-3 text-slate-500 font-sans">{c.clicks}</td>
                      <td className="py-3 font-sans">
                        <span className={`font-bold ${isAcosDanger ? "text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-mono" : "text-slate-650"}`}>
                          {c.acos ? (c.acos * 100).toFixed(1) + "%" : "0%"}
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRunAudit(c)}
                          className="flex items-center justify-center gap-1 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white font-sans font-semibold text-xs px-3 py-1.5 rounded-lg transition-all ml-auto hover:shadow-sm"
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

        {/* Forensic Side Diagnosis panel */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col justify-start min-h-[400px]">
          {selectedCampaign ? (
            <div className="space-y-6">
              {/* Header inside side block */}
              <div className="border-b border-slate-200 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-indigo-650 font-mono tracking-wider">Campaign Audit Desk</span>
                  <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold font-mono text-slate-800">{selectedCampaign.campaignName}</h4>
              </div>

              {auditLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin" />
                    <Sparkles className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-755 text-xs font-semibold animate-pulse">Running Forensic Diagnostics...</p>
                    <p className="text-[11px] text-slate-450 max-w-[220px]">Gemini is connecting Amazon fact tables to Helium 10 keyword trackers</p>
                  </div>
                </div>
              ) : auditResult ? (
                <div className="space-y-5 text-xs">
                  {/* Score & Header */}
                  <div className="flex items-center justify-between bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Forensic Index Score</span>
                      <div className="text-2xl font-bold font-mono text-slate-800">
                        {auditResult.forensicScore} <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-mono">Est Profit Boost</span>
                      <span className="text-sm font-bold text-emerald-700 font-mono">{auditResult.projectedRevenueAfterFix}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1 bg-emerald-50/50 p-3 rounded-lg border border-emerald-150">
                    <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 text-emerald-750">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Root Cause Sieve
                    </span>
                    <p className="text-slate-650 leading-relaxed text-[11px] font-sans">{auditResult.summary}</p>
                  </div>

                  {/* Root Causes Match list */}
                  <div className="space-y-2">
                    <span className="text-slate-450 font-semibold uppercase text-[10px] tracking-wider block font-mono">Observed Bottlenecks</span>
                    {auditResult.rootCauses?.map((cause, idx) => (
                      <div key={idx} className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 space-y-1.5">
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

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <span className="text-slate-450 font-semibold uppercase text-[10px] tracking-wider block font-mono">Target Strategy Directives</span>
                    {auditResult.recommendations?.map((rec, idx) => (
                      <div key={idx} className="bg-slate-50/40 border border-slate-200 p-3 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-bold text-indigo-650 text-[11px]">{rec.action}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-mono">Effort: {rec.effort}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed font-sans">{rec.rationale}</p>
                        <p className="text-[10.5px] text-slate-450 font-medium font-sans">Expected: {rec.expectedImpact}</p>
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
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 max-w-sm mx-auto">
              <Sparkles className="w-8 h-8 text-indigo-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700 font-sans">Forensic Sieve Ready</h4>
              <p className="text-xs text-slate-450 mt-1.5 font-sans">
                Select "Diagnostic" on any of the fact table logs to splay wide correlations across competitors, keyword indexes, and custom business report sessions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
