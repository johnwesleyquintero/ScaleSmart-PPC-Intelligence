/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileSpreadsheet,
  Link,
  RefreshCw,
  LogOut,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  UploadCloud,
  DownloadCloud
} from "lucide-react";
import { googleSignIn, initAuth, logout, getAccessToken } from "../lib/firebaseAuth";
import { createAndExportToSheets, importFromSheets, SheetRowSet } from "../lib/googleSheets";

interface GoogleSheetsPanelProps {
  currentData: SheetRowSet;
  onImportData: (imported: SheetRowSet) => void;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  authLoading: boolean;
  setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  authError: string | null;
  setAuthError: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function GoogleSheetsPanel({
  currentData,
  onImportData,
  user,
  setUser,
  token,
  setToken,
  authLoading,
  setAuthLoading,
  onLogin,
  onLogout,
  authError,
  setAuthError,
}: GoogleSheetsPanelProps) {
  // Sync / Action state
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [templateResult, setTemplateResult] = useState<{ id: string; url: string } | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ id: string; url: string } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const [importing, setImporting] = useState(false);
  const [sheetInput, setSheetInput] = useState("");
  const [importResult, setImportResult] = useState<{
    campaigns: number;
    searchTerms: number;
    business: number;
    keywords: number;
    competitors: number;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Copy helper
  const [copied, setCopied] = useState(false);

  const handleLogin = async () => {
    await onLogin();
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      setTemplateResult(null);
      setTemplateError(null);
      setExportResult(null);
      setImportResult(null);
      setImportError(null);
      setExportError(null);
    } catch (err) {
      console.error("Logout wrapper crashed:", err);
    }
  };

  const parseSpreadsheetId = (input: string): string => {
    const trimmed = input.trim();
    // Regex matches between /spreadsheets/d/ and /edit or similar
    const urlRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = trimmed.match(urlRegex);
    if (match && match[1]) {
      return match[1];
    }
    return trimmed;
  };

  const handleCreateTemplate = async () => {
    if (!token) return;
    setCreatingTemplate(true);
    setTemplateError(null);
    setTemplateResult(null);
    try {
      const emptyData: SheetRowSet = {
        campaigns: [],
        searchTerms: [],
        business: [],
        keywords: [],
        competitors: [],
      };
      const response = await createAndExportToSheets(token, emptyData, "ScaleSmart Clean Work Template");
      setTemplateResult({
        id: response.spreadsheetId,
        url: response.spreadsheetUrl,
      });
    } catch (err: any) {
      setTemplateError(err.message || "Failed to generate Google Sheets template.");
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleExport = async () => {
    if (!token) return;
    setExporting(true);
    setExportError(null);
    setExportResult(null);
    try {
      const response = await createAndExportToSheets(token, currentData);
      setExportResult({
        id: response.spreadsheetId,
        url: response.spreadsheetUrl,
      });
    } catch (err: any) {
      setExportError(err.message || "Failed to export data to Google Sheets.");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!token || !sheetInput) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);

    try {
      const parsedId = parseSpreadsheetId(sheetInput);
      if (!parsedId) {
        throw new Error("Invalid Spreadsheet ID or URL entered.");
      }
      const importedData = await importFromSheets(token, parsedId);

      // Notify parent app container to update states
      onImportData(importedData);

      setImportResult({
        campaigns: importedData.campaigns.length,
        searchTerms: importedData.searchTerms.length,
        business: importedData.business.length,
        keywords: importedData.keywords.length,
        competitors: importedData.competitors.length,
      });
      setSheetInput("");
    } catch (err: any) {
      setImportError(err.message || "Failed to import data. Please ensure sheets match ScaleSmart format.");
    } finally {
      setImporting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="google-sheets-dashboard" className="space-y-6 font-sans">
      {/* Mini Banner Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-650 p-2.5 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-805">Google Sheets Integration Suite</h2>
          </div>
          <p className="text-xs text-slate-555 max-w-2xl">
            Siphon and inject active data structures. Sync live performance records from any target spreadsheet instantly with Google and ScaleSmart's ETL engine.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-slate-300" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center">
                US
              </div>
            )}
            <div className="truncate max-w-[140px]">
              <p className="text-xs font-bold text-slate-850 truncate">{user.displayName || "Google User"}</p>
              <p className="text-[10px] text-slate-450 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 px-2 border border-slate-250 bg-white hover:bg-slate-100 text-slate-655 rounded text-[10px] flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3 text-slate-500" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {authLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-605">Verifying Google Auth Credentials...</p>
        </div>
      ) : !user ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
          <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-full text-indigo-600">
            <FileSpreadsheet className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-800">Authenticate Google Sheets</h3>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Once you enable Google representation, you can export ScaleSmart report sheets directly to Google Sheets securely, and import them in one click to compile statistics downstream.
            </p>
          </div>

          {authError && (
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-150 p-4 rounded-lg text-left text-xs max-w-md mt-2 shadow-xs animate-fade-in">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div className="space-y-1">
                <p className="font-bold text-rose-800 font-sans">Authentication Troubleshooting Guide</p>
                <p className="font-sans leading-relaxed text-rose-750 text-rose-700">{authError}</p>
                <div className="bg-white border border-rose-150 p-2 rounded text-[10px] font-mono mt-2 break-all text-slate-600">
                  {window.location.origin}
                </div>
              </div>
            </div>
          )}

          {/* Official Google Sign In Button Spec */}
          <button onClick={handleLogin} className="gsi-material-button font-bold text-xs" style={{ cursor: "pointer" }}>
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">Sign in with Google Account</span>
            </div>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TEMPLATE GENERATOR PANEL */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg border border-emerald-105">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">1. Setup Clean Template</h3>
                  <p className="text-xs text-slate-450 font-sans">Deploy a blank spreadsheet containing all 5 required tabs and strict column headers.</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-lg space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Initialized Sheets</span>
                <ul className="text-[10px] font-mono text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    RAW_CAMPAIGNS (8 columns)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    RAW_SEARCH_TERMS (9 columns)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                    RAW_BUSINESS (7 columns)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    RAW_KEYWORDS (6 columns)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    RAW_COMPETITORS (7 columns)
                  </li>
                </ul>
              </div>

              {templateError && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-150 p-3.5 rounded-lg text-xs text-rose-805">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <p className="font-sans font-medium">{templateError}</p>
                </div>
              )}

              {templateResult && (
                <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Template Created!</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={templateResult.id}
                      className="bg-white border border-emerald-200 text-[10px] font-mono p-1.5 rounded focus:outline-none w-full text-slate-700"
                    />
                    <button
                      onClick={() => copyToClipboard(templateResult.id)}
                      className="p-1.5 border border-emerald-250 bg-white text-emerald-700 hover:bg-emerald-100 rounded text-[10px] shrink-0 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  
                  <a
                    href={templateResult.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition-colors shadow-sm"
                  >
                    Open Clean Template
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={handleCreateTemplate}
              disabled={creatingTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold rounded-xl text-xs transition-colors shadow-xs select-none active:scale-98 cursor-pointer mt-4"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${creatingTemplate ? "animate-spin" : ""}`} />
              {creatingTemplate ? "Deploying Empty Template..." : "Deploy Fresh Sheet Template"}
            </button>
          </div>

          {/* EXPORT PANEL */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-105">
                  <DownloadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">2. Export Active Data</h3>
                  <p className="text-xs text-slate-450 font-sans">Dump active in-memory tables directly into a clean sheets structure on Google Drive.</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-lg space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Export Baseline Summary</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-655">
                  <div>Campaigns: <strong>{currentData.campaigns.length}</strong></div>
                  <div>Search Terms: <strong>{currentData.searchTerms.length}</strong></div>
                  <div>Business metrics: <strong>{currentData.business.length}</strong></div>
                  <div>Keywords: <strong>{currentData.keywords.length}</strong></div>
                </div>
              </div>

              {exportError && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-150 p-3.5 rounded-lg text-xs text-rose-805">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <p className="font-sans font-medium">{exportError}</p>
                </div>
              )}

              {exportResult && (
                <div className="bg-blue-50 border border-blue-150 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Active Export Created!</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={exportResult.id}
                      className="bg-white border border-blue-200 text-[10px] font-mono p-1.5 rounded focus:outline-none w-full text-slate-700"
                    />
                    <button
                      onClick={() => copyToClipboard(exportResult.id)}
                      className="p-1.5 border border-blue-250 bg-white text-blue-700 hover:bg-blue-100 rounded text-[10px] shrink-0 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  
                  <a
                    href={exportResult.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors shadow-sm"
                  >
                    Open Exported Sheet
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold rounded-xl text-xs transition-colors shadow-xs select-none active:scale-98 cursor-pointer mt-4"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${exporting ? "animate-spin" : ""}`} />
              {exporting ? "Deploying Active Sheets..." : "Export Dashboard Data"}
            </button>
          </div>

          {/* IMPORT PANEL */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-purple-50 text-purple-600 p-2 rounded-lg border border-purple-105">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">3. Ingest Data Sheet</h3>
                  <p className="text-xs text-slate-450 font-sans">Paste any Google Spreadsheet URL or unique ID created above to synchronize back.</p>
                </div>
              </div>

              <div className="space-y-1.5 font-sans text-xs">
                <label className="font-bold text-slate-655 block">Spreadsheet URL / ID:</label>
                <input
                  type="text"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1_abc... or ID"
                  className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-500 rounded-lg text-xs font-mono text-slate-800"
                />
              </div>

              {importError && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-150 p-3.5 rounded-lg text-xs text-rose-805">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <p className="font-sans font-medium">{importError}</p>
                </div>
              )}

              {importResult && (
                <div className="bg-purple-50 border border-purple-150 p-3 rounded-lg space-y-2 font-sans">
                  <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Sync Import Complete!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] text-slate-700 bg-white p-2 border border-purple-105 rounded">
                    <div>Campaigns: <strong className="text-indigo-700">{importResult.campaigns}</strong></div>
                    <div>Terms: <strong className="text-purple-700">{importResult.searchTerms}</strong></div>
                    <div>Business: <strong className="text-sky-700">{importResult.business}</strong></div>
                    <div>Keywords: <strong className="text-emerald-700">{importResult.keywords}</strong></div>
                  </div>
                  <p className="text-[9px] text-purple-605">States synced entirely downstream. Your executive analytical scores are completely updated.</p>
                </div>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={importing || !sheetInput.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white font-bold rounded-xl text-xs transition-colors shadow-xs select-none active:scale-98 cursor-pointer mt-4"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${importing ? "animate-spin" : ""}`} />
              {importing ? "Downloading and compiling..." : "Sync & Import Datasets"}
            </button>
          </div>

        </div>
      )}

      {/* Structured Guidelines and FAQ */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4 text-xs text-slate-333 text-slate-300 font-sans shadow-md">
        <h4 className="flex items-center gap-2 font-bold text-white uppercase text-[10px] tracking-wider font-mono">
          <HelpCircle className="w-4 h-4 text-indigo-400" /> Google Sheets Layout & Normalization Standards
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed font-sans text-slate-400">
          <div className="space-y-2">
            <span className="font-bold text-slate-200 block">Is the structure rigid?</span>
            <p>Yes. ScaleSmart's ETL engine expects specifically structured sheets inside the linked document. If tabs or column naming conventions have modified orderings, computations cannot be validated properly.</p>
          </div>
          <div className="space-y-2">
            <span className="font-bold text-slate-200 block">How does formatting work?</span>
            <p>Exporting automatically establishes proper tab indices (`RAW_CAMPAIGNS`, `RAW_SEARCH_TERMS`, `RAW_BUSINESS`, `RAW_KEYWORDS`, `RAW_COMPETITORS`). You can add sheets, edit values directly, or overwrite items with fresh CSV file rows.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
