'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState('INFO');
  const [service, setService] = useState('frontend');
  const [streaming, setStreaming] = useState(false);

  const sendLog = async () => {
    await fetch('http://localhost:4000/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service,
        level,
        message,
        timestamp: Date.now()
      })
    });
    setMessage('');
  };

  const queryLogs = async () => {
    const res = await fetch('http://localhost:4000/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service, level })
    });
    const data = await res.json();
    setLogs(data);
  };

  useEffect(() => {
    if (streaming) {
      const eventSource = new EventSource(`http://localhost:4000/stream?level=${level}&service=${service}`);
      eventSource.onmessage = (e) => {
        setLogs(prev => [...prev, JSON.parse(e.data)]);
      };
      return () => eventSource.close();
    }
  }, [streaming, level, service]);

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">gRPC Log System</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <input
            className="border p-2 w-full"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Service"
          />
          <select
            className="border p-2 w-full"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option className="text-black" value="INFO">INFO</option>
            <option className="text-black" value="WARNING">WARNING</option>
            <option className="text-black" value="ERROR">ERROR</option>
          </select>
          <input
            className="border p-2 w-full"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Log message"
          />
          <button 
            onClick={sendLog} 
            className="bg-blue-500 text-white px-4 py-2 w-full"
          >
            Send Log
          </button>
        </div>

        <div className="space-y-2">
          <button 
            onClick={queryLogs} 
            className="bg-green-500 text-white px-4 py-2 w-full"
          >
            Query Logs
          </button>
          <button 
            onClick={() => setStreaming(!streaming)} 
            className={`px-4 py-2 w-full ${streaming ? 'bg-red-500' : 'bg-purple-500'} text-white`}
          >
            {streaming ? 'Stop Streaming' : 'Start Streaming'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {logs.map((log, index) => (
          <div key={index} className="border p-3 rounded">
            <div className="flex justify-between">
              <span className="font-bold">{log.service}</span>
              <span className={`px-2 rounded ${
                log.level === 'ERROR' ? 'bg-red-100 text-red-800' : 
                log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {log.level}
              </span>
            </div>
            <p className="mt-1">{log.message}</p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}