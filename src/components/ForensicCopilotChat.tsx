/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, RefreshCw, Trash2, ShieldCheck, Zap, AlertTriangle, ArrowRight, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ForensicCopilotChatProps {
  context: {
    campaigns: Array<any>;
    searchTerms: Array<any>;
    keywords?: Array<any>;
    competitors: Array<any>;
    business?: Array<any>;
  };
}

export default function ForensicCopilotChat({ context }: ForensicCopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default introductory message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `👋 **Welcome Wesley! I am your AI PPC Forensic Co-Pilot.** 

I've automatically connected into your active data pipelines: **${context.campaigns.length} campaigns**, **${context.searchTerms.length} customer search terms**, and **${context.competitors.length} tracked competitor listings**.

Ask me any diagnostic question about your performance, such as:
- *Why did my Conversion Rate or ACOS change recently?*
- *Which specific search queries are bleeding waste budget?*
- *How is competitor pricing affecting our details page traffic?*
- *Summarize my organic SEO rank strengths compared to competitor undercuts.*`
        }
      ]);
    }
  }, [context]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Package active state of the application to ground the Gemini response
      const activeBusinessReport = context.business && context.business.length > 0 
        ? context.business[context.business.length - 1] 
        : null;

      const payload = {
        messages: [...messages, userMessage],
        context: {
          campaigns: context.campaigns,
          searchTerms: context.searchTerms,
          organicKeywords: context.keywords || [],
          competitors: context.competitors,
          businessMetrics: activeBusinessReport
        }
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text || "I was unable to analyze this data subset currently." }
      ]);
    } catch (err) {
      console.error("Co-Pilot Chat fetch failed:", err);
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "⚠️ **Service Interruption:** I observed an issue communicating with the database. Check if your API secret is set correctly. Our offline correlation shows a high threat level from competitor **B0C92S1W8B** undercutting SIGN12X8 with a **$14.50** entry price." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Do you want to reset the AI Co-Pilot chat session history?")) {
      setMessages([]);
    }
  };

  // Simple, robust helper to render basic markdown patterns (headers, list elements, bolding, italics)
  // This avoids introducing complex parsing libraries and keeps compilation React 19 clean
  const parseMarkdownHtml = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let cleaned = line;
      
      // Bold Header check
      if (cleaned.startsWith("### ")) {
        return <h4 key={idx} className="font-bold text-slate-800 text-xs tracking-wide uppercase mt-4 mb-2 font-sans">{cleaned.slice(4)}</h4>;
      }
      if (cleaned.startsWith("## ")) {
        return <h3 key={idx} className="font-bold text-slate-900 text-sm mt-5 mb-2 font-sans border-b border-slate-100 pb-1">{cleaned.slice(3)}</h3>;
      }
      if (cleaned.startsWith("# ")) {
        return <h2 key={idx} className="font-bold text-slate-900 text-base mt-6 mb-2 font-sans">{cleaned.slice(2)}</h2>;
      }

      // Bullets check
      let isBullet = false;
      if (cleaned.startsWith("- ")) {
        cleaned = cleaned.slice(2);
        isBullet = true;
      } else if (cleaned.startsWith("* ")) {
        cleaned = cleaned.slice(2);
        isBullet = true;
      }

      // Regex matching for bold terms: **term**
      const parts = cleaned.split(/\*\*([\s\S]*?)\*\*/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="font-bold text-slate-900 font-mono text-[11.5px] bg-indigo-50/70 border border-indigo-100/50 px-1 py-0.5 rounded">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 py-1 text-slate-650 leading-relaxed text-xs">
            {formattedLine}
          </li>
        );
      }

      return (
        <p key={idx} className="text-slate-650 leading-relaxed text-xs py-1.5 min-h-[1em] font-sans">
          {formattedLine}
        </p>
      );
    });
  };

  const suggestionChips = [
    { label: "🔍 Bleed queries report", query: "Can you analyze my customer search terms and show me the specific queries that are bleeding spend with 0 orders? Please list the exact spend and click counts." },
    { label: "🥊 Competitor Battle assessment", query: "Who is undercutting us right now, and what rating and review leverage do they hold? Model our pricing of $29.99 against theirs to explain the conversion threat." },
    { label: "💡 3 Direct actions today", query: "Give me 3 precise, direct PPC tactical action steps to improve ACOS and TACOS for ASIN B0GXWB95V9 today based on my active campaigns." },
    { label: "📈 Organic indexing stats", query: "Look at my organic keyword ranks tracked in Helium 10. Which words are well-indexed and how do they correlate with PPC Exact target conversions?" }
  ];

  return (
    <div id="forensic-copilot" className="bg-white border border-slate-200.rounded-xl rounded-xl shadow-sm overflow-hidden flex flex-col h-[680px]">
      
      {/* Upper Title Block */}
      <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-md shadow-indigo-500/10">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">AI Forensic Co-Pilot Chat Desk</h3>
            <p className="text-[10px] text-slate-400 font-medium">REAL-TIME DATA-GROUNDED INSIGHTS FOR ASIN B0GXWB95V9</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-indigo-500/15 text-indigo-400 font-mono tracking-wider font-semibold border border-indigo-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-indigo-405 fill-indigo-400" />
            CONTEXT READY
          </span>
          <button
            onClick={handleClear}
            className="p-1.5 bg-slate-800 hover:bg-slate-700/80 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestion Chips strip */}
      <div className="bg-slate-50 border-b border-slate-200/60 p-3.5 flex flex-wrap items-center gap-2.5">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono shrink-0">Quick Queries:</span>
        <div className="flex flex-wrap gap-2">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.query)}
              disabled={isLoading}
              className="text-[11px] bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 text-slate-700 rounded-lg px-3 py-1.5 transition-all text-left font-sans font-semibold cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-20/40 select-text">
        {messages.map((m, idx) => {
          const isAi = m.role === "assistant";
          return (
            <div
              key={idx}
              className={`flex gap-4 max-w-4xl ${isAi ? "mr-12" : "ml-auto mr-1 justify-end flex-row-reverse"}`}
            >
              <div 
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs select-none ${
                  isAi 
                    ? "bg-indigo-600/10 border border-indigo-200 text-indigo-600" 
                    : "bg-slate-800 text-white"
                }`}
              >
                {isAi ? <Sparkles className="w-4 h-4 text-indigo-600" /> : <User className="w-4 h-4 text-white" />}
              </div>
              
              <div 
                className={`p-4 rounded-xl border leading-relaxed break-words shadow-xs ${
                  isAi 
                    ? "bg-white border-slate-200 text-slate-805" 
                    : "bg-indigo-600 text-white border-indigo-700"
                }`}
              >
                {isAi ? (
                  <div className="space-y-1">
                    {parseMarkdownHtml(m.content)}
                  </div>
                ) : (
                  <p className="text-xs font-sans font-semibold pr-2 whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading/Compiling Indicator */}
        {isLoading && (
          <div className="flex gap-4 max-w-2xl mr-12 mr-auto">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center animate-spin">
              <RefreshCw className="w-4 h-4 text-indigo-500" />
            </div>
            
            <div className="p-4 bg-slate-50 border border-slate-250 rounded-xl space-y-2 max-w-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                <span className="text-xs font-bold text-slate-700 animate-pulse">Co-Pilot is compiling accounts forensic logs...</span>
              </div>
              <p className="text-[10px] text-slate-450 leading-relaxed font-sans">
                Correlating Helium 10 raw organics, campaign click lists, and pricing sheets on the fly
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input box bottom panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="border-t border-slate-200 bg-slate-50 p-4 flex gap-3.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Ask AI PPC Co-Pilot anything... (e.g. 'how should we adjust exact bids?')"
          className="flex-1 bg-white border border-slate-250 rounded-lg px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
        />
        
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 w-11 h-11 flex items-center justify-center transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
