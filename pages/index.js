import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Activity, CheckCircle, Clock, Layout, AlertCircle, Search, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('summary'); // 'summary' or 'explorer'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'priority', direction: 'asc' });

  useEffect(() => {
    async function loadData() {
      try {
        const tasksRes = await fetch('https://raw.githubusercontent.com/jarvis-needs-to-use-git/mission-control-dashboard/main/data/tasks.json');
        const projectsRes = await fetch('https://raw.githubusercontent.com/jarvis-needs-to-use-git/mission-control-dashboard/main/data/projects.json');
        const tasks = await tasksRes.json();
        const projects = await projectsRes.json();
        
        setData({
          projects,
          tasks: tasks.map(t => ({...t, p_val: {High: 1, Medium: 2, Low: 3}[t.priority] || 4})),
          generatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to load data', err);
      }
    }
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredTasks = useMemo(() => {
    if (!data) return [];
    let processed = [...data.tasks];
    
    if (statusFilter !== 'All') {
      processed = processed.filter(t => t.status === statusFilter);
    }
    
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      processed = processed.filter(t => 
        t.name.toLowerCase().includes(lowSearch) || 
        t.project_name.toLowerCase().includes(lowSearch) ||
        t.goal?.toLowerCase().includes(lowSearch)
      );
    }

    processed.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'priority') {
        aVal = a.p_val;
        bVal = b.p_val;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return processed;
  }, [data, searchTerm, statusFilter, sortConfig]);

  const ongoing = data ? data.tasks.filter(t => t.status === 'Ongoing') : [];
  const actions = data ? data.tasks.filter(t => t.status === 'Action').sort((a,b) => a.p_val - b.p_val) : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans p-4 md:p-8 lg:p-12">
      <Head>
        <title>Jarvis | Mission Control</title>
      </Head>

      {!data && (
        <div className="fixed inset-0 bg-[#f8fafc] flex flex-col items-center justify-center p-4 z-50">
          <div className="w-12 h-12 border-4 border-[#e2e8f0] border-t-[#1e293b] rounded-full animate-spin mb-4"></div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#94a3b8] animate-pulse">Establishing Satellite Uplink...</div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto transition-opacity duration-500 ${!data ? 'opacity-0' : 'opacity-100'}`}>
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-[#e2e8f0] pb-6 gap-4">
          <div>
            <div className="text-[10px] font-bold text-blue-500 mb-1">UPDATE 1</div>
            <h1 className="text-4xl font-black tracking-tighter text-[#1e293b]">MISSION CONTROL</h1>
            <p className="text-[#94a3b8] text-xs font-mono mt-1 uppercase tracking-widest">
              Live Satellite Feed • {data ? new Date(data.generatedAt).toLocaleTimeString() : '--:--:--'}
            </p>
          </div>
          
          <nav className="flex bg-[#e2e8f0] p-1 rounded-lg self-start md:self-auto">
            <button 
              onClick={() => setView('summary')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'summary' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#334155]'}`}
            >
              SUMMARY
            </button>
            <button 
              onClick={() => setView('explorer')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'explorer' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#334155]'}`}
            >
              EXPLORER
            </button>
          </nav>
        </header>

        {data && view === 'summary' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* Ongoing Section */}
              <section>
                <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  Current Operations
                </h2>
                <div className="space-y-4">
                  {ongoing.length > 0 ? ongoing.map(task => (
                    <div key={task.id} className="bg-white border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.project_name}</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded">ACTIVE</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 leading-tight">{task.name}</h3>
                      <p className="text-slate-500 text-sm mt-1">{task.goal}</p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-xs">
                        <span className="text-slate-400 mr-2 uppercase font-bold">Target:</span>
                        <span className="text-slate-700 font-medium">{task.next_step}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-slate-400 text-sm italic p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                      No ongoing operations. System idle.
                    </div>
                  )}
                </div>
              </section>

              {/* Action Queue */}
              <section>
                <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center">
                  <Clock className="w-3 h-3 mr-2" />
                  Action Queue
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {actions.map(task => (
                    <div key={task.id} className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md ${task.autonomy_level === 'approval_required' ? 'border-orange-200 ring-1 ring-orange-100' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' : 
                          task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>{task.priority}</span>
                        {task.autonomy_level === 'approval_required' && <AlertCircle className="w-3 h-3 text-orange-400" />}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{task.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{task.goal}</p>
                      <div className="text-[10px] text-slate-400 border-t border-slate-50 pt-2 flex justify-between">
                        <span className="font-bold">{task.project_name}</span>
                        <span className="italic uppercase opacity-70">{task.autonomy_level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-12">
              <section className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <h2 className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-4">Project Map</h2>
                <div className="space-y-4">
                  {data.projects.map(project => (
                    <div key={project.id} className="group cursor-default">
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{project.name}</h4>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-1/3"></div>
                        </div>
                        <span className="text-[9px] font-mono ml-2 text-slate-500">{project.phase}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-2" />
                  Recent Intel
                </h2>
                <div className="space-y-3">
                  {data.tasks.filter(t => t.status === 'Done').sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 8).map(task => (
                    <div key={task.id} className="flex items-start text-[11px] group">
                      <CheckCircle className="w-3 h-3 text-emerald-500 mr-2 shrink-0 mt-0.5 opacity-40 group-hover:opacity-100" />
                      <span className="text-slate-500 group-hover:text-slate-800 transition-colors">{task.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : data && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            {/* Explorer Toolbar */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search tasks, goals, or projects..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <select 
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Action">Action</option>
                  <option value="Done">Done</option>
                  <option value="Backlog">Backlog</option>
                </select>
                
                <button 
                  onClick={() => setSortConfig({
                    key: sortConfig.key === 'priority' ? 'name' : 'priority',
                    direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                  })}
                  className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <ArrowUpDown className="w-3 h-3 mr-2" />
                  Sort: {sortConfig.key}
                </button>
              </div>
            </div>

            {/* Explorer Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Autonomy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{task.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{task.goal}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded ${
                          task.priority === 'High' ? 'bg-red-50 text-red-600' : 
                          task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>{task.priority}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold ${
                          task.status === 'Ongoing' ? 'text-emerald-500' : 
                          task.status === 'Action' ? 'text-blue-500' : 'text-slate-400'
                        }`}>{task.status}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{task.project_name}</td>
                      <td className="px-6 py-4 text-[10px] font-mono text-slate-400 italic uppercase">{task.autonomy_level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTasks.length === 0 && (
                <div className="p-20 text-center text-slate-400 text-sm italic">
                  No matching tasks found.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

