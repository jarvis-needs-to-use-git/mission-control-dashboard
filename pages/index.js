import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('active');

  useEffect(() => {
    async function loadData() {
      try {
        const cacheBuster = `?t=${new Date().getTime()}`;
        const tasksRes = await fetch('https://raw.githubusercontent.com/jarvis-needs-to-use-git/mission-control-dashboard/main/data/tasks.json' + cacheBuster);
        const projectsRes = await fetch('https://raw.githubusercontent.com/jarvis-needs-to-use-git/mission-control-dashboard/main/data/projects.json' + cacheBuster);
        const tasks = await tasksRes.json();
        const projects = await projectsRes.json();
        
        // Map project names for easy access
        const projectMap = projects.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});
        
        setData({
          projects,
          tasks: tasks.map(t => ({
            ...t, 
            project_name: projectMap[t.project_id] || 'No Project',
            p_val: {High: 1, Medium: 2, Low: 3}[t.priority] || 4
          })),
          generatedAt: new Date().toISOString()
        });
      } catch (err) { console.error(err); }
    }
    loadData();
  }, []);

  const activeTasks = useMemo(() => {
    if (!data) return [];
    return data.tasks
      .filter(t => t.status === 'Ongoing')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }, [data]);

  const pausedTasks = useMemo(() => {
    if (!data) return [];
    return data.tasks
      .filter(t => ['Paused', 'Queued'].includes(t.status))
      .sort((a, b) => {
        // Queued (status group 1) before Paused (status group 2)
        if (a.status === 'Queued' && b.status === 'Paused') return -1;
        if (a.status === 'Paused' && b.status === 'Queued') return 1;
        // Within group, descending updated_at
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
  }, [data]);

  const archiveTasks = useMemo(() => {
    if (!data) return [];
    return data.tasks
      .filter(t => t.status === 'Done')
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
  }, [data]);

  const styles = `
    body { background: #f8fafc; color: #0f172a; font-family: sans-serif; margin: 0; padding: 20px; }
    .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
    .card { background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 15px; }
    .tag { font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
    .type-tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 12px; margin-right: 8px; background: #f1f5f9; color: #475569; }
    .tag-active { background: #ecfdf5; color: #065f46; }
    .tag-paused { background: #fef2f2; color: #991b1b; }
    .tag-queued { background: #f1f5f9; color: #475569; }
    .tag-done { background: #f1f5f9; color: #475569; }
    .marker { color: #3b82f6; font-size: 10px; font-weight: bold; margin-bottom: 5px; }
    .nav { display: flex; gap: 10px; margin-bottom: 20px; }
    .nav-btn { background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
    .nav-btn.active { background: #0f172a; color: white; border-color: #0f172a; }
    .priority { font-size: 10px; margin-left: 8px; color: #94a3b8; }
    .timestamp { font-size: 10px; color: #94a3b8; display: block; margin-top: 10px; }
  `;

  const renderTaskList = (tasks, emptyMsg, showCompletedDate = false) => (
    <div>
      {tasks.length === 0 ? <p style={{color: '#94a3b8'}}>{emptyMsg}</p> : tasks.map(task => (
        <div key={task.id} className="card">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div>
              <span className="type-tag">{task.type}</span>
              <span style={{fontSize: '10px', color: '#94a3b8'}}>{task.project_name}</span>
            </div>
            <span className={`tag tag-${task.status.toLowerCase().replace(' ', '-')}`}>
              {task.status}
            </span>
          </div>
          <h3 style={{margin: '10px 0 5px 0'}}>
            {task.name}
            <span className="priority">P:{task.priority}</span>
          </h3>
          <p style={{color: '#64748b', fontSize: '14px'}}><strong>Next:</strong> {task.next_step}</p>
          <span className="timestamp">
            {showCompletedDate 
              ? `Completed: ${new Date(task.completed_at).toLocaleString()}` 
              : `Modified: ${new Date(task.updated_at).toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <Head>
        <title>Jarvis | Mission Control</title>
      </Head>
      <style>{styles}</style>

      <div className="header">
        <div className="marker">TYPE-AWARE ARCHITECTURE</div>
        <h1 style={{fontSize: '40px', fontWeight: '900', letterSpacing: '-2px', margin: 0}}>MISSION CONTROL</h1>
      </div>

      {!data ? (
        <div style={{textAlign: 'center', padding: '100px'}}>Establishing Satellite Uplink...</div>
      ) : (
        <div>
          <div className="nav">
            <button className={`nav-btn ${view === 'active' ? 'active' : ''}`} onClick={() => setView('active')}>Active ({activeTasks.length})</button>
            <button className={`nav-btn ${view === 'paused' ? 'active' : ''}`} onClick={() => setView('paused')}>Paused ({pausedTasks.length})</button>
            <button className={`nav-btn ${view === 'archive' ? 'active' : ''}`} onClick={() => setView('archive')}>Archive ({archiveTasks.length})</button>
          </div>

          {view === 'active' && (
            <div>
              <h2 style={{fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px'}}>Active Operations</h2>
              {renderTaskList(activeTasks, 'No active tasks.')}
            </div>
          )}

          {view === 'paused' && (
            <div>
              <h2 style={{fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px'}}>Paused / Queued</h2>
              {renderTaskList(pausedTasks, 'No paused or queued tasks.')}
            </div>
          )}

          {view === 'archive' && (
            <div>
              <h2 style={{fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px'}}>Completed</h2>
              {renderTaskList(archiveTasks, 'Archive is empty.', true)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
