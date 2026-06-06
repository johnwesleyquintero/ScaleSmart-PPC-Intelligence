/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Ban, ArrowUpRight, Crosshair, HelpCircle, AlertTriangle, Check, CheckSquare } from "lucide-react";
import { SearchTermReport } from "../types";

interface SearchTermConsoleProps {
  searchTerms: Array<SearchTermReport>;
  onPromoteKeyword: (st: SearchTermReport) => void;
  onNegateTerm: (st: SearchTermReport) => void;
  onTestTerm: (st: SearchTermReport) => void;
}

export default function SearchTermConsole({
  searchTerms,
  onPromoteKeyword,
  onNegateTerm,
  onTestTerm,
}: SearchTermConsoleProps) {
  const [notification, setNotification] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handlePromote = (st: SearchTermReport) => {
    onPromoteKeyword(st);
    triggerToast(`PROMOTED: "${st.searchTerm}" successfully siphoned off raw reports and injected into B0GXWB95V9-SIGN12X8-SP-EXACT as a high-intensity target!`);
  };

  const handleNegate = (st: SearchTermReport) => {
    onNegateTerm(st);
    triggerToast(`NEGATED: Bleed term "${st.searchTerm}" blacklisted in SP-AUTO ad group.`);
  };

  const handleTest = (st: SearchTermReport) => {
    onTestTerm(st);
    triggerToast(`ADDED TO TESTING: "${st.searchTerm}" placed into low-bid sandbox group for CTR validation.`);
  };

  return (
    <div id="search-term-console" className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-805 font-sans">Search Term Tactical Dispatch Desk</h2>
          <p className="text-xs text-slate-555 font-sans">
            Audit actual customer searches. Promote high-converting targets or negative out bleeding spend immediately.
          </p>
        </div>

        {notification && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-semibold animate-fade-in flex items-center gap-2 max-w-sm hover:shadow-sm">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Search Term Fact Table (Direct Console)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 pb-2">
                <th className="pb-3 text-slate-450">Customer Actual Search Query</th>
                <th className="pb-3 text-slate-450">Origin Keyword</th>
                <th className="pb-3 text-right">Clicks</th>
                <th className="pb-3 text-right">Spend ($)</th>
                <th className="pb-3 text-right text-emerald-705 font-bold">Sales ($)</th>
                <th className="pb-3 text-center">ACOS</th>
                <th className="pb-3 text-center">Efficiency Score</th>
                <th className="pb-3 text-right">Tactical Direct Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {searchTerms.map((st, idx) => {
                const acos = st.acos ? st.acos * 100 : 0;
                const isBleed = st.spend > 20 && st.orders === 0;
                const isHighPerformer = st.orders >= 3 && acos < 30;

                // Simple efficiency index
                let scoreText = "Good";
                let scoreColor = "text-indigo-700 bg-indigo-50 border-indigo-200";
                if (isBleed) {
                  scoreText = "Bleeding Budget";
                  scoreColor = "text-rose-700 bg-rose-50 border-rose-200";
                } else if (isHighPerformer) {
                  scoreText = "Goldmine Term";
                  scoreColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
                } else if (st.orders === 0) {
                  scoreText = "Unvalidated";
                  scoreColor = "text-slate-550 bg-slate-50 border-slate-200";
                }

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-bold text-indigo-750 text-xs font-sans">
                      <span className="bg-indigo-50/30 px-1.5 py-0.5 rounded border border-indigo-50">"{st.searchTerm}"</span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs font-sans font-medium">{st.keyword}</td>
                    <td className="py-3 text-right text-slate-600 font-sans">{st.clicks}</td>
                    <td className="py-3 text-right text-slate-600 font-sans">${st.spend.toFixed(2)}</td>
                    <td className="py-3 text-right text-emerald-700 font-bold font-mono">${st.sales.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <span className={`font-mono text-xs ${isBleed ? "text-rose-700 font-bold" : "text-slate-600"}`}>
                        {st.acos ? `${acos.toFixed(1)}%` : "0%"}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}>
                        {scoreText}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        {isBleed || acos > 45 ? (
                          <button
                            onClick={() => handleNegate(st)}
                            className="bg-white hover:bg-rose-600 hover:text-white text-rose-650 font-sans font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-rose-200 transition-all flex items-center gap-1 cursor-pointer hover:shadow-xs"
                            title="Add search query as negative keyword to cease spending"
                          >
                            <Ban className="w-3 h-3" />
                            Negate
                          </button>
                        ) : isHighPerformer || st.orders > 0 ? (
                          <>
                            <button
                              onClick={() => handlePromote(st)}
                              className="bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 font-sans font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer hover:shadow-xs"
                              title="Convert this high-performing search query into an exact match keyword target"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              Promote Exact
                            </button>
                            <button
                              onClick={() => handleTest(st)}
                              className="bg-white hover:bg-indigo-650 hover:text-white text-indigo-650 font-sans font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer hover:shadow-xs"
                              title="Shift keyword into testing queue group"
                            >
                              <Crosshair className="w-3 h-3 text-indigo-500" />
                              Sandbox Test
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleTest(st)}
                            className="bg-white hover:bg-slate-205 text-slate-600 font-sans font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            Add to Sandbox
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 rounded-xl border border-slate-200 text-xs shadow-sm font-sans">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <ArrowUpRight className="w-4 h-4" />
            PROMOTE
          </div>
          <p className="text-slate-550 leading-relaxed text-[11px]">
            High converting terms are migrated dynamically into your EXACT MATCH campaigns. This boosts keyword rank velocity and helps cement organic #1 spots.
          </p>
        </div>
        <div className="space-y-1 font-sans">
          <div className="flex items-center gap-1.5 text-rose-700 font-bold">
            <Ban className="w-4 h-4" />
            NEGATE
          </div>
          <p className="text-slate-550 leading-relaxed text-[11px]">
            Wastes budgets on high clicks but zero ordered units. Adding as negative exact kills siphoning immediately, lowering your TACOS.
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-650 font-bold">
            <Crosshair className="w-4 h-4" />
            TEST / SANDBOX
          </div>
          <p className="text-slate-550 leading-relaxed text-[11px]">
            Intermediate terms with clicks are placed into isolated low-bid sandbox targets to accumulate sufficient diagnostic visibility without bidding high.
          </p>
        </div>
      </div>
    </div>
  );
}
