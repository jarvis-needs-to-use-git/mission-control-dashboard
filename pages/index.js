import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Activity, CheckCircle, Clock, Layout, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      const tasksRes = await fetch('https://raw.githubusercontent.com/jarvis-needs-to-use-git/mission-control-dashboard/main/data/tasks.json');
      const projectsRes = await fetch('https://raw.githubusercontent.com/jarvis-needs-to-use-git/mission-control-dashboard/main/data/projects.json');
      const tasks = await tasksRes.json();
      const projects = await projectsRes.json();
      
      setData({
        projects,
        ongoing: tasks.filter(t => t.status === 'Ongoing'),
        actions: tasks.filter(t => t.status === 'Action').sort((a, b) => {
          const map = { High: 1, Medium: 2, Low: 3 };
          return map[a.priority] - map[b.priority];
        }),
        recentlyDone: tasks.filter(t => t.status === 'Done').sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 10),
        generatedAt: new Date().toISOString()
      });
    }
    loadData();
  }, []);

  if (!data) return <div className="flex h-screen items-center justify-center font-mono text-sm uppercase tracking-widest text-slate-400">Syncing...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-12">
      <Head>
        <title>Jarvis | Mission Control</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-800">MISSION CONTROL</h1>
            <p className="text-slate-400 text-xs font-mono mt-1">SATELLITE VIEW • {new Date(data.generatedAt).toLocaleTimeString()}</p>
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded">DEPLOYS: VERCEL</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Ongoing */}
            {data.ongoing.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  Active Operations
                </h2>
                <div className="space-y-4">
                  {data.ongoing.map(task => (
                    <div key={task.id} className="bg-white border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.project_name}</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded">ONGOING</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 leading-tight">{task.name}</h3>
                      <p className="text-slate-500 text-sm mt-1">{task.goal}</p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-xs">
                        <span className="text-slate-400 mr-2 uppercase font-bold">Next:</span>
                        <span className="text-slate-700 font-medium">{task.next_step}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Actions */}
            <section>
              <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center">
                <Clock className="w-3 h-3 mr-2" />
                Pending Queue
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.actions.map(task => (
                  <div key={task.id} className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-400 ${task.autonomy_level === 'approval_required' ? 'border-orange-200 bg-orange-50/10' : ''}`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{task.priority}</span>
                      {task.autonomy_level === 'approval_required' && <AlertCircle className="w-3 h-3 text-orange-400" />}
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{task.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{task.goal}</p>
                    <div className="text-[10px] text-slate-400 border-t border-slate-50 pt-2 flex justify-between">
                      <span>{task.project_name}</span>
                      <span className="italic">{task.autonomy_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
             {/* Projects */}
             <section>
              <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center">
                <Layout className="w-3 h-3 mr-2" />
                Projects
              </h2>
              <div className="space-y-3">
                {data.projects.map(project => (
                  <div key={project.id} className="bg-slate-100/50 border border-slate-200 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-slate-800">{project.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">{project.phase}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recently Done */}
            <section>
              <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center">
                <CheckCircle className="w-3 h-3 mr-2" />
                History
              </h2>
              <div className="space-y-2">
                {data.recentlyDone.map(task => (
                  <div key={task.id} className="flex items-start text-[11px] border-b border-slate-100 pb-2">
                    <CheckCircle className="w-3 h-3 text-slate-300 mr-2 shrink-0 mt-0.5" />
                    <span className="text-slate-600 line-clamp-1">{task.name}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
