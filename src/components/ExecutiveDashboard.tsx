/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, Percent, DollarSign, ShoppingBag, Eye, Target } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from "recharts";
import { CampaignReport, BusinessReport } from "../types";

interface ExecutiveDashboardProps {
  campaigns: Array<CampaignReport>;
  business: Array<BusinessReport>;
}

export default function ExecutiveDashboard({ campaigns, business }: ExecutiveDashboardProps) {
  // Aggregate Metrics over current dataset
  const totalRevenue = business.reduce((sum, item) => sum + item.revenue, 0);
  const totalPpcRevenue = campaigns.reduce((sum, item) => sum + item.sales, 0);
  const totalPpcSpend = campaigns.reduce((sum, item) => sum + item.spend, 0);
  const totalPpcOrders = campaigns.reduce((sum, item) => sum + item.orders, 0);
  const totalSessions = business.reduce((sum, item) => sum + item.sessions, 0);
  const totalUnitsOrdered = business.reduce((sum, item) => sum + item.unitsOrdered, 0);

  const organicRevenue = Math.max(0, totalRevenue - totalPpcRevenue);
  const organicPercentage = totalRevenue > 0 ? (organicRevenue / totalRevenue) * 100 : 0;
  const ppcPercentage = totalRevenue > 0 ? (totalPpcRevenue / totalRevenue) * 100 : 0;

  const totalAcos = totalPpcRevenue > 0 ? (totalPpcSpend / totalPpcRevenue) * 100 : 0;
  const totalRoas = totalPpcSpend > 0 ? totalPpcRevenue / totalPpcSpend : 0;
  const overallTacos = totalRevenue > 0 ? (totalPpcSpend / totalRevenue) * 100 : 0;

  // Conversion rate
  const blendedConversionRate = totalSessions > 0 ? (totalUnitsOrdered / totalSessions) * 100 : 0;

  // Map chronological trend by Date
  const dateTotals = business.reduce((acc: any, b) => {
    acc[b.date] = {
      date: b.date,
      totalRevenue: b.revenue,
      ppcSales: 0,
      spend: 0,
    };
    return acc;
  }, {});

  campaigns.forEach((c) => {
    if (dateTotals[c.date]) {
      dateTotals[c.date].ppcSales += c.sales;
      dateTotals[c.date].spend += c.spend;
    }
  });

  const chartData = Object.values(dateTotals).sort((a: any, b: any) => a.date.localeCompare(b.date)) as Array<any>;

  const absoluteChartData = chartData.map((d: any) => {
    const orgSales = Math.max(0, d.totalRevenue - d.ppcSales);
    return {
      ...d,
      "Organic Sales": Number(orgSales.toFixed(2)),
      "PPC Sales": Number(d.ppcSales.toFixed(2)),
      "PPC Spend": Number(d.spend.toFixed(2)),
    };
  });

  return (
    <div id="executive-dashboard" className="space-y-6">
      {/* Primary KPI Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Brand Revenue</span>
            <div className="text-indigo-600 bg-indigo-50 p-2 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 font-mono">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-sans">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              100% connected business metrics
            </p>
          </div>
        </div>

        {/* Total ACOS / TACOS Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Global PPC ACOS / TACOS</span>
            <div className="text-sky-600 bg-sky-50 p-2 rounded-lg">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 font-mono">
              {totalAcos.toFixed(1)}% <span className="text-xs text-slate-400">/ {overallTacos.toFixed(1)}%</span>
            </h3>
            <p className="text-xs text-slate-500">
              Blended ROAS: <span className="font-bold font-mono text-emerald-600">{totalRoas.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Sessions & Conversion Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Sessions & CVR</span>
            <div className="text-purple-600 bg-purple-50 p-2 rounded-lg">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 font-mono">{totalSessions.toLocaleString()} <span className="text-xs text-slate-400">({blendedConversionRate.toFixed(1)}% CVR)</span></h3>
            <p className="text-xs text-slate-500">
              Ordered Units: <span className="font-bold text-slate-700">{totalUnitsOrdered} items</span>
            </p>
          </div>
        </div>

        {/* PPC Allocation Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Ad Spend Siphon</span>
            <div className="text-rose-600 bg-rose-50 p-2 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 font-mono">${totalPpcSpend.toFixed(2)}</h3>
            <p className="text-xs text-slate-500">
              PPC Order Contribution: <span className="text-slate-700 font-bold font-mono">{totalPpcOrders} orders</span>
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Structure Breakdown (Organic vs PPC) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Contribution Bars */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800 font-sans">Revenue Split Contribution</h4>
            <p className="text-xs text-slate-500 font-sans">
              PPC sales vs. Organic SEO indexing contribution for B0GXWB95V9.
            </p>
          </div>

          <div className="space-y-4">
            {/* Organic Split */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Organic Trajectory Sales</span>
                <span className="font-mono text-indigo-650 font-bold">{organicPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${organicPercentage}%` }} />
              </div>
              <p className="text-[11px] text-indigo-600 font-mono">${organicRevenue.toFixed(2)} organic sales</p>
            </div>

            {/* PPC Split */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Ad Console Sourced Sales</span>
                <span className="font-mono text-emerald-600 font-bold">{ppcPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${ppcPercentage}%` }} />
              </div>
              <p className="text-[11px] text-emerald-650 font-mono">${totalPpcRevenue.toFixed(2)} paid target sales</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-xs space-y-2">
            <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Health Verdict</span>
            {overallTacos < 15 ? (
              <p className="text-emerald-705 leading-relaxed font-sans">
                Health Score high. TACOS is {overallTacos.toFixed(1)}%, well under the 15% threshold. Organic SEO rankings are carrying the majority of business conversion.
              </p>
            ) : (
              <p className="text-amber-705 leading-relaxed font-sans">
                TACOS is high at {overallTacos.toFixed(1)}%. The brand relies heavily on sponsored clicks. Attempt to negate bad search queries to lower this dependency.
              </p>
            )}
          </div>
        </div>

        {/* Right Side Visual Multi-Line Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 font-sans">Daily Trajectory & Spend Allocation</h4>
              <p className="text-xs text-slate-500 font-sans">Chronological correlation of Organic Sales vs. PPC Sales relative to Daily Budget Spend.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-500 rounded-sm" /> Organic</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-400 rounded-sm" /> PPC</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-rose-500 rounded-sm" /> Spend</div>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={absoluteChartData}>
                <defs>
                  <linearGradient id="colorOrg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPpc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", color: "#0f172a" }}
                  itemStyle={{ color: "#334155" }}
                  labelStyle={{ color: "#64748b", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="Organic Sales" stroke="#6366f1" fillOpacity={1} fill="url(#colorOrg)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="PPC Sales" stroke="#10b981" fillOpacity={1} fill="url(#colorPpc)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="PPC Spend" stroke="#f43f5e" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
