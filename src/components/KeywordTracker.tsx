/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Search, Trophy, Compass, ArrowUpRight, TrendingDown, Target } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { KeywordIntel } from "../types";

interface KeywordTrackerProps {
  keywords: Array<KeywordIntel>;
}

export default function KeywordTracker({ keywords }: KeywordTrackerProps) {
  // Compute Rank Siphon estimations (custom algorithmic logic for listing diagnostics)
  const calculateSiphonTraffic = (vol: number, organicRank: number) => {
    // Siphon rate: Rank 1 is 31%, Rank 2 is 14%, Rank 3 is 9%, Rank 4 is 6%, etc.
    if (organicRank === 0 || organicRank > 50) return 0;
    
    let clickShare = 0.01; // Default
    if (organicRank === 1) clickShare = 0.31;
    else if (organicRank === 2) clickShare = 0.14;
    else if (organicRank === 3) clickShare = 0.09;
    else if (organicRank === 4) clickShare = 0.06;
    else if (organicRank <= 10) clickShare = 0.03;
    else if (organicRank <= 20) clickShare = 0.015;

    return Math.floor(vol * clickShare);
  };

  // Convert ranks to chartable offsets (since rank 1 is best, we want to plot (35 - rank) to show high bars for good ranks)
  const chartFormatData = keywords.map((k) => ({
    name: k.keyword,
    "Search Vol (k)": Number((k.searchVolume / 1000).toFixed(1)),
    "Organic Pos": k.organicRank,
    "Sponsored Pos": k.sponsoredRank,
    // Plotted inversion
    "Organic Rank Strength": Math.max(0, 35 - k.organicRank),
    "Sponsored Rank Strength": Math.max(0, 35 - k.sponsoredRank),
  }));

  return (
    <div id="keyword-tracker" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-805 font-sans">Helium 10 Keyword Intelligence Sieve</h2>
          <p className="text-xs text-slate-550 font-sans">
            Organic index authority vs. paid search engine real-estate positions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Grid */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Tracked Search Term Index</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 pb-2">
                  <th className="pb-3">Keyword Query</th>
                  <th className="pb-3 text-right">Search Volume</th>
                  <th className="pb-3 text-center text-indigo-650 font-bold">Organic Rank</th>
                  <th className="pb-3 text-center text-emerald-700 font-bold">Sponsored Rank</th>
                  <th className="pb-3 text-right text-slate-450">Est Monthly Organic Siphon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keywords.map((k, idx) => {
                  const siphonTraffic = calculateSiphonTraffic(k.searchVolume, k.organicRank);
                  const isGoldRank = k.organicRank <= 5;
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-bold text-slate-800 text-xs font-sans flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        {k.keyword}
                      </td>
                      <td className="py-3 text-right text-slate-600 font-mono font-bold">{k.searchVolume.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-xs border ${
                          isGoldRank ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-450 border-slate-150"
                        }`}>
                          #{k.organicRank || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-xs border ${
                          k.sponsoredRank > 0 && k.sponsoredRank <= 5 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-450 border-slate-150"
                        }`}>
                          {k.sponsoredRank > 0 ? `#${k.sponsoredRank}` : "Unplaced"}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold font-mono text-indigo-600">
                        {siphonTraffic > 0 ? `${siphonTraffic.toLocaleString()} clicks/mo` : "0 clicks"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic SEO Leverage Breakdown card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 font-sans">ScaleSmart Rank Leverage</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              If search volume rankings are high (#1 - #3), you can dial back advertising budgets on exact matches.
            </p>
          </div>

          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3.5 border border-slate-200 rounded-lg">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="font-sans">
                <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold block font-mono">Top 5 SEO Index Match</span>
                <p className="text-slate-800 font-bold text-xs font-mono">
                  {keywords.filter((k) => k.organicRank <= 5).length} of {keywords.length} Tracked Terms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3.5 border border-slate-200 rounded-lg">
              <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
                <Target className="w-5 h-5" />
              </div>
              <div className="font-sans">
                <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold block font-mono">Organic Siphon Traffic</span>
                <p className="text-slate-800 font-bold text-xs font-mono text-emerald-700">
                  {keywords.reduce((sum, k) => sum + calculateSiphonTraffic(k.searchVolume, k.organicRank), 0).toLocaleString()} visitors/mo
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-450 border-t border-slate-100 pt-3 italic font-sans">
            Computed using monthly Helium 10 Cerebro and Keyword Tracker index vectors.
          </div>
        </div>
      </div>

      {/* Visual Rank Strength graph */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 font-sans">Visual Placement Map (Higher is closer to Rank #1)</h3>
        <div className="w-full h-64 font-sans">
          <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <BarChart data={chartFormatData}>
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: 10, fontFamily: "sans-serif" }} />
              <YAxis stroke="#94a3b8" domain={[0, 35]} style={{ fontSize: 10 }} label={{ value: 'Rank Strength Map', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10, fontFamily: "sans-serif" } }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Organic Rank Strength" fill="#6366f1" radius={[4, 4, 0, 0]} name="Organic Index Rank Strength" />
              <Bar dataKey="Sponsored Rank Strength" fill="#10b981" radius={[4, 4, 0, 0]} name="Sponsored PPC Rank Strength" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
