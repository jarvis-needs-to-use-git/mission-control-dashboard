import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('summary');

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

  const styles = `
    body { background: #f8fafc; color: #0f172a; font-family: sans-serif; margin: 0; padding: 20px; }
    .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
    .card { background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 15px; }
    .tag { font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
    .tag-active { background: #ecfdf5; color: #065f46; }
    .tag-deep { background: #eff6ff; color: #1e40af; }
    .marker { color: #3b82f6; font-size: 10px; font-weight: bold; margin-bottom: 5px; }
  `;

  return (
    <div>
      <Head>
        <title>Jarvis | Mission Control v2.2</title>
      </Head>
      <style>{styles}</style>

      <div className="header">
        <div className="marker">UPDATE 4 (DEEP DIVE SUPPORT)</div>
        <h1 style={{fontSize: '40px', fontWeight: '900', letterSpacing: '-2px', margin: 0}}>MISSION CONTROL</h1>
      </div>

      {!data ? (
        <div style={{textAlign: 'center', padding: '100px'}}>Establishing Satellite Uplink...</div>
      ) : (
        <div>
          <h2 style={{fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px'}}>Current Operations</h2>
          {ongoing.map(task => (
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
          <div style={{marginTop: '40px', fontSize: '12px', color: '#94a3b8'}}>
            View "EXPLORER" and advanced styles will return once the Vercel/Tailwind pipe is cleared.
          </div>
        </div>
      )}
    </div>
  );
}
