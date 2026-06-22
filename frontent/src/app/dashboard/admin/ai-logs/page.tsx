'use client';

import React from 'react';
import { RBACGuard } from '@/components/shared/RBACGuard';
import { ListTodo, Activity, Server, AlertTriangle } from 'lucide-react';

export default function AdminAILogs() {
  const stats = [
    { label: 'Total Queries', value: '1,452', icon: <ListTodo className="h-4 w-4" /> },
    { label: 'Avg Latency', value: '824ms', icon: <Activity className="h-4 w-4" /> },
    { label: 'Success Rate', value: '99.7%', icon: <Server className="h-4 w-4" /> },
  ];

  const logs = [
    { id: '1', query: 'recommend me a mechanical keyboard', intent: 'RECOMMENDATION', model: 'gemini-1.5-flash', status: 'Success', time: '10s ago' },
    { id: '2', query: 'is headphones better than backpack?', intent: 'COMPARISON', model: 'gemini-1.5-flash', status: 'Success', time: '2m ago' },
    { id: '3', query: 'what is the rating of bottle?', intent: 'ADVISOR', model: 'gemini-1.5-flash', status: 'Success', time: '5m ago' },
    { id: '4', query: 'list running discount electronics code', intent: 'RECOMMENDATION', model: 'gemini-1.5-flash', status: 'Rate Limit Hit (Retried)', time: '8m ago' },
  ];

  const getIntentStyle = (intent: string) => {
    switch (intent) {
      case 'RECOMMENDATION': return 'bg-[#4F46E5]/10 text-[#4F46E5]';
      case 'COMPARISON': return 'bg-[#06B6D4]/10 text-[#06B6D4]';
      default: return 'bg-[#F59E0B]/10 text-[#F59E0B]';
    }
  };

  return (
    <RBACGuard allowedRoles={['admin']}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">AI System Logs</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Monitor real-time intent detection routing, model latency metrics, and API quotas.
          </p>
        </div>

        {/* AI Performance Stats */}
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((s, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{s.label}</span>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-1.5 text-[#06B6D4]">{s.icon}</div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* AI Query Logs Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-colors shadow-xs">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 font-bold text-sm">
            Recent Query Intent Logs
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-850 dark:text-zinc-400 border-b border-zinc-200/50 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4">User Query</th>
                  <th scope="col" className="px-6 py-4">Detected Intent</th>
                  <th scope="col" className="px-6 py-4">AI Model</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">&ldquo;{log.query}&rdquo;</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold uppercase ${getIntentStyle(log.intent)}`}>
                        {log.intent}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{log.model}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        log.status.includes('Limit') ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {log.status.includes('Limit') && <AlertTriangle className="h-3 w-3 animate-pulse" />}
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </RBACGuard>
  );
}
