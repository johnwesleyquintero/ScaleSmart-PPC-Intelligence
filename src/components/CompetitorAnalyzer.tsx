/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Users, TrendingUp, AlertTriangle, ShieldCheck, HelpCircle, Star, ThumbsUp } from "lucide-react";
import { CompetitorIntel } from "../types";

interface CompetitorAnalyzerProps {
  competitors: Array<CompetitorIntel>;
}

export default function CompetitorAnalyzer({ competitors }: CompetitorAnalyzerProps) {
  const myAsin = "B0GXWB95V9";
  const myPrice = 29.99;
  const myReviews = 412;
  const myRating = 4.5;
  const myQualityScore = 8;

  return (
    <div id="competitor-analyzer" className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-805 font-sans">Competitor Outrank Intelligence & Price Gap Audit</h2>
          <p className="text-xs text-slate-555 font-sans">
            Compare detail-page quality attributes. Find why shoppers convert elsewhere and splay pricing countermeasures.
          </p>
        </div>
      </div>

      {/* Main Listing Comparison Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Listing Stats card */}
        <div className="bg-white border border-indigo-200 p-6 rounded-xl relative overflow-hidden space-y-4 shadow-sm">
          <div className="absolute top-0 right-0 bg-indigo-50 border-l border-b border-indigo-150 text-indigo-700 text-[10px] tracking-wider uppercase font-bold py-1 px-3 rounded-bl-lg font-mono">
            Our Listing Fact Table
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-100 p-2.5 text-indigo-600 rounded-lg">
              <Star className="w-5 h-5" />
            </div>
            <div className="font-sans">
              <h4 className="text-sm font-bold text-slate-800">ASIN: {myAsin}</h4>
              <p className="text-xs text-slate-500">Premium Aluminum Signs (SIGN12X8)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono font-semibold">Target Price</span>
              <p className="text-sm font-bold text-slate-800 font-mono">${myPrice.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono font-semibold">Reviews</span>
              <p className="text-sm font-bold text-indigo-700 font-mono">{myReviews} rvs</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono font-semibold">Rating star</span>
              <p className="text-sm font-bold text-emerald-600 font-mono">{myRating} ★</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono font-bold font-semibold">Quality score</span>
              <p className="text-sm font-bold text-amber-700 font-mono">{myQualityScore} / 10</p>
            </div>
          </div>

          <div className="text-xs text-slate-655 leading-relaxed bg-slate-50 p-3.5 border border-slate-200 rounded-lg font-sans">
            <span className="font-bold text-slate-800 block mb-1">Audit Diagnostic Breakdown:</span>
            Your listing has medium-high reviews and a strong 4.5 rating. However, because premium signs carry slightly higher production costs, absolute listing price ($29.99) sits above competitors' entry pricing, triggering a conversion vulnerability on basic unbranded search queries.
          </div>
        </div>

        {/* Competitor Grid Summary List card */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Tracked Competitive Listings</h3>
          <div className="space-y-3">
            {Buffer.from && competitors.map((comp) => {
              const priceGap = myPrice - comp.price;
              const isDanger = comp.price < myPrice - 4.5 && comp.rating >= 4.3;

              return (
                <div key={comp.competitorAsin} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between gap-4 font-sans hover:bg-slate-50/40 transition-colors cursor-default">
                  <div className="space-y-1 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 font-mono text-xs">{comp.competitorAsin}</span>
                      {isDanger && (
                        <span className="text-[9px] bg-rose-50 border border-rose-150 text-rose-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-650" />
                          Undercut
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span>Price: ${comp.price}</span>
                      <span>•</span>
                      <span>{comp.rating} ★ ({comp.reviews} reviews)</span>
                    </div>
                  </div>

                  <div className="text-right font-sans">
                    <span className="text-[10px] text-slate-450 uppercase block tracking-wider font-mono">Est. Monthly Rev</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">${comp.estimatedRevenue?.toLocaleString()}</span>
                    {priceGap > 0 ? (
                      <span className="text-[10px] text-rose-650 block font-mono font-semibold">-${priceGap.toFixed(2)} vs yours</span>
                    ) : (
                      <span className="text-[10px] text-emerald-650 block font-mono font-semibold">+${Math.abs(priceGap).toFixed(2)} vs yours</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Competitors Outrank Audit Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm font-sans">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono font-sans font-bold">Listing Vulnerability & SEO Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 pb-2">
                <th className="pb-3 text-slate-455">Competitor ASIN</th>
                <th className="pb-3 text-center text-slate-455 font-sans font-bold">Reviews Leverage</th>
                <th className="pb-3 text-center text-slate-455 font-sans font-bold font-sans">Pricing Gap</th>
                <th className="pb-3 text-center text-slate-455 font-bold font-sans font-sans">Star Quality Index</th>
                <th className="pb-3 text-right text-slate-455 font-bold font-sans font-sans">Vulnerability Health Threat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competitors.map((comp) => {
                const reviewsGap = comp.reviews - myReviews;
                const priceGap = myPrice - comp.price;
                const ratingGap = comp.rating - myRating;

                let threatLevel = "Low";
                let threatColor = "text-emerald-700 bg-emerald-50 border-emerald-150";
                if (priceGap > 8.0 && comp.rating >= 4.4) {
                  threatLevel = "Severe (Major Conversion Siphon)";
                  threatColor = "text-rose-700 bg-rose-50 border-rose-150 font-bold";
                } else if (priceGap > 4.0 || reviewsGap > 1000) {
                  threatLevel = "Medium Priority";
                  threatColor = "text-amber-700 bg-amber-50 border-amber-150 font-bold";
                }

                return (
                  <tr key={comp.competitorAsin} className="hover:bg-slate-50/70 transition-colors cursor-default">
                    <td className="py-3 font-bold text-slate-800 text-xs font-mono">
                      {comp.competitorAsin}
                    </td>
                    <td className="py-3 text-center font-sans">
                      {reviewsGap > 0 ? (
                        <span className="text-xs text-rose-700 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-full font-medium">+{reviewsGap.toLocaleString()} reviews (Vulnerable)</span>
                      ) : (
                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-110 px-2 py-0.5 rounded-full font-medium">-{Math.abs(reviewsGap).toLocaleString()} reviews (Advantage)</span>
                      )}
                    </td>
                    <td className="py-3 text-center font-sans">
                      {priceGap > 0 ? (
                        <span className="text-xs text-rose-700 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-full font-semibold">Cheaper by ${priceGap.toFixed(2)}</span>
                      ) : (
                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-110 px-2 py-0.5 rounded-full font-semibold">Premium priced (Advantage)</span>
                      )}
                    </td>
                    <td className="py-3 text-center font-sans">
                      {ratingGap > 0 ? (
                        <span className="text-xs text-rose-705 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-full font-medium">+{ratingGap.toFixed(1)} ★ Strong Badging</span>
                      ) : ratingGap === 0 ? (
                        <span className="text-xs text-slate-500 bg-slate-50 border border-slate-205 px-2 py-0.5 rounded-full font-sans font-medium">Equal Star Badging</span>
                      ) : (
                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full font-medium">We Outclass ({Math.abs(ratingGap).toFixed(1)} ★ Advantage)</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-sans ${threatColor}`}>
                        {threatLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
