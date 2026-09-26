'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  EMPLOYEE_CATALOG,
  createWorkItem,
  hireEmployee
} from '../lib/workforceConsole.mjs';

function readStoredState(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export default function WorkforceConsolePage() {
  const [apiKey, setApiKey] = useState('');
  const [draftApiKey, setDraftApiKey] = useState('');
  const [hiredEmployees, setHiredEmployees] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [workItems, setWorkItems] = useState([]);
  const [activeWorkId, setActiveWorkId] = useState('');

  useEffect(() => {
    setApiKey(readStoredState('wf.apiKey', ''));
    setHiredEmployees(readStoredState('wf.hiredEmployees', []));
    setWorkItems(readStoredState('wf.workItems', []));
    setActiveWorkId(readStoredState('wf.activeWorkId', ''));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('wf.apiKey', JSON.stringify(apiKey));
    window.localStorage.setItem('wf.hiredEmployees', JSON.stringify(hiredEmployees));
    window.localStorage.setItem('wf.workItems', JSON.stringify(workItems));
    window.localStorage.setItem('wf.activeWorkId', JSON.stringify(activeWorkId));
  }, [activeWorkId, apiKey, hiredEmployees, workItems]);

  useEffect(() => {
    const activeWork = workItems.find((item) => item.id === activeWorkId);

    if (!activeWork || activeWork.status !== 'streaming') {
      return undefined;
    }

    let tokenIndex = activeWork.output
      ? activeWork.output.trim().split(/\s+/).length
      : 0;

    const interval = setInterval(() => {
      setWorkItems((currentItems) => {
        const itemToUpdate = currentItems.find((item) => item.id === activeWork.id);
        if (!itemToUpdate || itemToUpdate.status !== 'streaming') {
          return currentItems;
        }

        if (tokenIndex >= itemToUpdate.tokens.length) {
          return currentItems.map((item) =>
            item.id === itemToUpdate.id
              ? {
                  ...item,
                  status: 'completed'
                }
              : item
          );
        }

        const nextToken = itemToUpdate.tokens[tokenIndex];
        tokenIndex += 1;

        return currentItems.map((item) =>
          item.id === itemToUpdate.id
            ? {
                ...item,
                output: item.output ? `${item.output} ${nextToken}` : nextToken
              }
            : item
        );
      });
    }, 250);

    return () => clearInterval(interval);
  }, [activeWorkId, workItems]);

  const activeWork = useMemo(
    () => workItems.find((item) => item.id === activeWorkId),
    [activeWorkId, workItems]
  );

  const completedWorkItems = useMemo(
    () => workItems.filter((item) => item.status === 'completed').reverse(),
    [workItems]
  );

  const handleConnect = (event) => {
    event.preventDefault();

    if (!draftApiKey.trim()) {
      return;
    }

    setApiKey(draftApiKey.trim());
  };

  const handleHire = (employee) => {
    setHiredEmployees((current) => hireEmployee(current, employee));
  };

  const handleAssignWork = (event) => {
    event.preventDefault();

    if (!selectedEmployeeId || !prompt.trim()) {
      return;
    }

    const workItem = createWorkItem({
      employeeId: selectedEmployeeId,
      prompt: prompt.trim(),
      hiredEmployees
    });

    setWorkItems((current) => [...current, workItem]);
    setActiveWorkId(workItem.id);
    setPrompt('');
  };

  const handleDisconnect = () => {
    setApiKey('');
    setDraftApiKey('');
    setHiredEmployees([]);
    setWorkItems([]);
    setActiveWorkId('');
  };

  if (!apiKey) {
    return (
      <main>
        <section className="panel" style={{ maxWidth: 520, margin: '48px auto' }}>
          <h1>Workforce Console</h1>
          <p className="muted">Enter your API key to access your digital workforce.</p>
          <form className="stack" onSubmit={handleConnect}>
            <div>
              <label htmlFor="api-key">API key</label>
              <input
                id="api-key"
                name="api-key"
                onChange={(event) => setDraftApiKey(event.target.value)}
                placeholder="opx_live_..."
                type="password"
                value={draftApiKey}
              />
            </div>
            <button type="submit">Access Console</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="grid" style={{ gap: 24 }}>
      <section className="panel" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1>Workforce Console</h1>
          <p className="muted">Connected with API key ending in {apiKey.slice(-4)}.</p>
        </div>
        <button className="secondary" onClick={handleDisconnect} type="button">
          Disconnect
        </button>
      </section>

      <section className="panel">
        <h2>Employee Catalog</h2>
        <div className="grid two">
          {EMPLOYEE_CATALOG.map((employee) => {
            const isHired = hiredEmployees.some((current) => current.id === employee.id);

            return (
              <article className="card" key={employee.id}>
                <h3>{employee.name}</h3>
                <p className="muted">{employee.specialty}</p>
                <button disabled={isHired} onClick={() => handleHire(employee)} type="button">
                  {isHired ? 'Hired' : 'Hire'}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2>Hired Employees</h2>
        {hiredEmployees.length === 0 ? (
          <p className="muted">No employees hired yet.</p>
        ) : (
          <div className="grid two">
            {hiredEmployees.map((employee) => (
              <article className="card" key={employee.id}>
                <h3>{employee.name}</h3>
                <p className="muted">{employee.specialty}</p>
                <span className="tag">Status: {employee.status}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel grid two">
        <div>
          <h2>Assign Work</h2>
          <form className="stack" onSubmit={handleAssignWork}>
            <div>
              <label htmlFor="employee">Employee</label>
              <select
                id="employee"
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                value={selectedEmployeeId}
              >
                <option value="">Choose a hired employee</option>
                {hiredEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="prompt">Prompt</label>
              <textarea
                id="prompt"
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Create a customer-ready weekly status report..."
                rows={4}
                value={prompt}
              />
            </div>
            <button disabled={hiredEmployees.length === 0} type="submit">
              Assign and Stream
            </button>
          </form>
        </div>

        <div>
          <h2>Live SSE Output Stream</h2>
          <p className="muted">
            {activeWork
              ? `Streaming ${activeWork.employeeName} (${activeWork.status})`
              : 'Assign work to begin streaming output.'}
          </p>
          <div className="output">{activeWork ? activeWork.output || 'Starting stream…' : 'No active stream.'}</div>
        </div>
      </section>

      <section className="panel">
        <h2>Past Work Outputs</h2>
        {completedWorkItems.length === 0 ? (
          <p className="muted">No completed work items yet.</p>
        ) : (
          <div className="grid two">
            <div className="stack">
              {completedWorkItems.map((item) => (
                <button
                  className="secondary"
                  key={item.id}
                  onClick={() => setActiveWorkId(item.id)}
                  style={{ textAlign: 'left' }}
                  type="button"
                >
                  <strong>{item.employeeName}</strong>
                  <br />
                  <span className="muted">{item.prompt}</span>
                </button>
              ))}
            </div>
            <div className="output">
              {activeWork
                ? activeWork.output || 'Output will appear here.'
                : 'Select a completed work item to view full output.'}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
