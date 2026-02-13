import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('summary');
  const [filter, setFilter] = useState('all');

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
      } catch (err) { console.error(err); }
    }
    loadData();
  }, []);

  const ongoing = data ? data.tasks.filter(t => ['Ongoing', 'Deep Dive'].includes(t.status)) : [];
  
  const filteredTasks = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data.tasks;
    return data.tasks.filter(t => t.status === filter);
  }, [data, filter]);

  const styles = `
    body { background: #f8fafc; color: #0f172a; font-family: sans-serif; margin: 0; padding: 20px; }
    .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
    .card { background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 15px; }
    .tag { font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
    .tag-active { background: #ecfdf5; color: #065f46; }
    .tag-deep { background: #eff6ff; color: #1e40af; }
    .tag-done { background: #f1f5f9; color: #475569; }
    .marker { color: #3b82f6; font-size: 10px; font-weight: bold; margin-bottom: 5px; }
    .nav { display: flex; gap: 10px; margin-bottom: 20px; }
    .nav-btn { background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
    .nav-btn.active { background: #0f172a; color: white; border-color: #0f172a; }
    .filter-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-chip { padding: 4px 12px; border-radius: 20px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-size: 12px; }
    .filter-chip.active { background: #3b82f6; color: white; border-color: #3b82f6; }
  `;

  return (
    <div>
      <Head>
        <title>Jarvis | Mission Control v2.5</title>
      </Head>
      <style>{styles}</style>

      <div className="header">
        <div className="marker">UPDATE 5 (FULL EXPLORER RESTORED)</div>
        <h1 style={{fontSize: '40px', fontWeight: '900', letterSpacing: '-2px', margin: 0}}>MISSION CONTROL</h1>
      </div>

      {!data ? (
        <div style={{textAlign: 'center', padding: '100px'}}>Establishing Satellite Uplink...</div>
      ) : (
        <div>
          <div className="nav">
            <button className={`nav-btn ${view === 'summary' ? 'active' : ''}`} onClick={() => setView('summary')}>Summary</button>
            <button className={`nav-btn ${view === 'explorer' ? 'active' : ''}`} onClick={() => setView('explorer')}>Explorer</button>
          </div>

          {view === 'summary' ? (
            <div>
              <h2 style={{fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px'}}>Current Operations</h2>
              {ongoing.length === 0 ? <p style={{color: '#94a3b8'}}>No active operations.</p> : ongoing.map(task => (
                <div key={task.id} className="card" style={{borderLeft: task.status === 'Deep Dive' ? '4px solid #3b82f6' : '4px solid #10b981'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontSize: '10px', color: '#94a3b8'}}>{task.project_name}</span>
                    <span className={`tag ${task.status === 'Deep Dive' ? 'tag-deep' : 'tag-active'}`}>
                      {task.status === 'Deep Dive' ? 'DEEP DIVE' : 'ACTIVE'}
                    </span>
                  </div>
                  <h3 style={{margin: '10px 0 5px 0'}}>{task.name}</h3>
                  <p style={{color: '#64748b', fontSize: '14px'}}>{task.goal}</p>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <h2 style={{fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px'}}>Task Explorer</h2>
              <div className="filter-bar">
                {['all', 'Deep Dive', 'Ongoing', 'Action', 'Done', 'Backlog'].map(s => (
                  <div key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                    {s.toUpperCase()}
                  </div>
                ))}
              </div>
              {filteredTasks.map(task => (
                <div key={task.id} className="card">
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontSize: '10px', color: '#94a3b8'}}>{task.project_name}</span>
                    <span className={`tag ${task.status === 'Deep Dive' ? 'tag-deep' : task.status === 'Ongoing' ? 'tag-active' : 'tag-done'}`}>
                      {task.status}
                    </span>
                  </div>
                  <h3 style={{margin: '10px 0 5px 0'}}>{task.name}</h3>
                  <p style={{color: '#64748b', fontSize: '14px'}}><strong>Goal:</strong> {task.goal}</p>
                  <p style={{color: '#64748b', fontSize: '14px'}}><strong>Next:</strong> {task.next_step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
