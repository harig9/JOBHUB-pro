import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';
import {
  Server,
  Database,
  Terminal,
  Code2,
  ShieldCheck,
  Play,
  Copy,
  Check,
  Clock,
  Layers,
  Table as TableIcon,
  CheckCircle2,
  Cpu,
  Sparkles,
} from 'lucide-react';

export function ArchitectureStudio() {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'sql-runner' | 'mysql-ddl' | 'spring-controller' | 'spring-security' | 'table-stats'>('sql-runner');
  const [schemaData, setSchemaData] = useState<{
    mysqlSchemaDdl: string;
    springBootController: string;
    springSecurityConfig: string;
    tables: { name: string; rows: number; columns: string[] }[];
  } | null>(null);

  const [sqlQuery, setSqlQuery] = useState("SELECT title, company, status, match_score, priority, salary FROM jobs WHERE match_score >= 85 ORDER BY match_score DESC;");
  const [queryResult, setQueryResult] = useState<{
    query: string;
    table: string;
    columns: string[];
    rows: any[];
    rowCount: number;
    executionTimeMs: number;
    explainPlan: any;
  } | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    api.getDatabaseSchema()
      .then(setSchemaData)
      .catch((err) => console.error('Failed to load schema data:', err));

    // Execute default query on load
    handleRunQuery(sqlQuery);
  }, []);

  const handleRunQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    setIsExecuting(true);
    try {
      const res = await api.executeSqlQuery(q);
      setQueryResult(res);
      showToast(`Query executed in ${res.executionTimeMs}ms (${res.rowCount} rows)`, 'success');
    } catch (err: any) {
      showToast(err.message || 'SQL execution failed', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const sampleQueries = [
    {
      label: 'Top ATS Job Matches (>= 85%)',
      query: "SELECT title, company, status, match_score, priority, salary FROM jobs WHERE match_score >= 85 ORDER BY match_score DESC;",
    },
    {
      label: 'Active Interview Pipeline',
      query: "SELECT title, company, location, salary, deadline FROM jobs WHERE status = 'interviewing';",
    },
    {
      label: 'Extended Job Offers',
      query: "SELECT title, company, salary, location FROM jobs WHERE status = 'offer';",
    },
    {
      label: 'Master Primary Resume Details',
      query: "SELECT id, title, candidate, is_primary, experiences_count, skills_count FROM resumes WHERE is_primary = true;",
    },
    {
      label: 'Audit Status Transition History',
      query: "SELECT job_id, from_status, to_status, note FROM job_status_history;",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Server className="w-3.5 h-3.5" />
              <span>Full-Stack Architecture & Relational Database Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Java Spring Boot + MySQL 8.0 Engine & Query Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Explore the complete production-grade architecture: Spring Security JWT filters, REST controllers, normalized MySQL relational schema (3NF), and execute real-time relational SQL queries against live application records.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 font-mono text-xs">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Spring Boot REST Parity: 100%</span>
            </span>
            <span className="text-slate-500 text-[11px]">Database: InnoDB 7 Relational Tables</span>
          </div>
        </div>
      </div>

      {/* Studio Sub-Navigation */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto gap-2">
        {[
          { id: 'sql-runner', label: 'Interactive SQL Console', icon: Terminal },
          { id: 'mysql-ddl', label: 'MySQL 8.0 DDL Schema', icon: Database },
          { id: 'spring-controller', label: 'Spring Boot REST Controller', icon: Code2 },
          { id: 'spring-security', label: 'Spring Security & JWT Filter', icon: ShieldCheck },
          { id: 'table-stats', label: 'Relational Entity Catalog', icon: TableIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: INTERACTIVE SQL RUNNER */}
      {activeSubTab === 'sql-runner' && (
        <div className="space-y-5">
          {/* SQL Editor Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Relational SQL Query Console</span>
              </div>

              {/* Sample Queries Dropdown / Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-semibold mr-1">Presets:</span>
                {sampleQueries.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSqlQuery(preset.query);
                      handleRunQuery(preset.query);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-white transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SQL Code Textarea */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <textarea
                rows={3}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full p-4 font-mono text-xs text-indigo-300 bg-transparent focus:outline-none resize-none leading-relaxed"
                placeholder="Enter SQL SELECT query... e.g. SELECT * FROM jobs WHERE status = 'interviewing';"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  onClick={() => handleRunQuery()}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isExecuting ? 'Executing...' : 'Run Query'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Query Results & Execution Plan */}
          {queryResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
              {/* Query Meta Bar */}
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Query OK</span>
                  </span>
                  <span>•</span>
                  <span>{queryResult.rowCount} rows in set</span>
                  <span>•</span>
                  <span className="font-mono text-slate-300 font-semibold">{queryResult.executionTimeMs} ms</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-slate-500">Target Table:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">
                    `{queryResult.table}`
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      {queryResult.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-4">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                        {queryResult.columns.map((col, cIdx) => {
                          const val = row[col];
                          const isScore = col.includes('score');
                          const isStatus = col === 'status';

                          return (
                            <td key={cIdx} className="py-2.5 px-4 whitespace-nowrap">
                              {isScore ? (
                                <span className={`font-bold px-2 py-0.5 rounded ${
                                  val >= 85 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                                }`}>
                                  {val}%
                                </span>
                              ) : isStatus ? (
                                <span className="font-semibold text-indigo-300 uppercase text-[10px]">
                                  {val}
                                </span>
                              ) : (
                                String(val ?? 'NULL')
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {queryResult.rows.length === 0 && (
                      <tr>
                        <td colSpan={queryResult.columns.length} className="py-8 text-center text-slate-500">
                          Empty set (0 rows match criteria)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Execution Plan (EXPLAIN) */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-slate-300">MySQL Optimizer Plan:</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Key: <strong className="text-indigo-300">{queryResult.explainPlan.keyUsed}</strong> • Rows Examined: {queryResult.explainPlan.rowsExamined} • Filtered: {queryResult.explainPlan.filtered}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Engine: InnoDB • Isolation: REPEATABLE-READ
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MYSQL 8.0 DDL SCHEMA */}
      {activeSubTab === 'mysql-ddl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>MySQL 8.0 DDL Migration Script (`V1__schema.sql`)</span>
              </h3>
              <p className="text-xs text-slate-400">3rd Normal Form (3NF), Foreign Keys, Composite Indexes, JSON Types</p>
            </div>
            <button
              onClick={() => handleCopy(schemaData?.mysqlSchemaDdl || '')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy DDL'}</span>
            </button>
          </div>
          <pre className="p-6 font-mono text-xs text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed max-h-[600px]">
            {schemaData?.mysqlSchemaDdl || 'Loading DDL schema...'}
          </pre>
        </div>
      )}

      {/* SUB-TAB 3: SPRING BOOT CONTROLLER */}
      {activeSubTab === 'spring-controller' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>Spring Boot 3.x REST Controller (`JobController.java`)</span>
              </h3>
              <p className="text-xs text-slate-400">@RestController, @PreAuthorize, @Valid Bean Validation, ResponseEntity</p>
            </div>
            <button
              onClick={() => handleCopy(schemaData?.springBootController || '')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Java Code'}</span>
            </button>
          </div>
          <pre className="p-6 font-mono text-xs text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed max-h-[600px]">
            {schemaData?.springBootController || 'Loading Controller...'}
          </pre>
        </div>
      )}

      {/* SUB-TAB 4: SPRING SECURITY & JWT */}
      {activeSubTab === 'spring-security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Spring Security 6.x & JWT Filter Chain (`SecurityConfig.java`)</span>
              </h3>
              <p className="text-xs text-slate-400">Stateless Session, BCrypt Password Encoder, Bearer Token Filter</p>
            </div>
            <button
              onClick={() => handleCopy(schemaData?.springSecurityConfig || '')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Security Config'}</span>
            </button>
          </div>
          <pre className="p-6 font-mono text-xs text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed max-h-[600px]">
            {schemaData?.springSecurityConfig || 'Loading Security Config...'}
          </pre>
        </div>
      )}

      {/* SUB-TAB 5: TABLE STATS */}
      {activeSubTab === 'table-stats' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-indigo-400" />
            <span>Active Relational Database Entity Catalog (7 Tables)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemaData?.tables.map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-300 text-sm">
                    `{t.name}`
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                    {t.rows} rows
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex flex-wrap gap-1">
                  {t.columns.map((c, cIdx) => (
                    <span key={cIdx} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
