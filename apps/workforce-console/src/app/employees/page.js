'use client';

import { useEffect, useRef, useState } from 'react';
import {
  fetchEmployee,
  fetchEmployees,
  terminateEmployee
} from '../../lib/catalogApi.mjs';
import { fetchEmployeeWork, submitEmployeeWork } from '../../lib/workApi.mjs';
import {
  clearStoredJwt,
  getStoredJwt,
  isJwtExpired
} from '../../lib/workforceConsole.mjs';

function getEmployeeName(employee) {
  return (
    employee.displayName ??
    employee.display_name ??
    employee.name ??
    'Digital Professional'
  );
}

function getEmployeeId(employee) {
  return employee.id ?? employee.employeeId ?? employee.employee_id;
}

function getEmployeeStatus(employee) {
  const status = String(employee.status ?? 'unknown').toLowerCase();

  if (status === 'active' || status === 'idle') {
    return { label: 'Active', className: 'active' };
  }
  if (status === 'working' || status === 'busy' || status === 'processing') {
    return { label: 'Working', className: 'working' };
  }
  if (status === 'error' || status === 'failed') {
    return { label: 'Error', className: 'error' };
  }
  if (status === 'terminated') {
    return { label: 'Terminated', className: 'terminated' };
  }

  return {
    label: status.replace(/[_-]/g, ' '),
    className: 'unknown'
  };
}

function getLastActive(employee) {
  const lastActive =
    employee.lastActiveAt ??
    employee.last_active_at ??
    employee.lastActive ??
    employee.last_active ??
    employee.lastSeenAt ??
    employee.last_seen_at;

  if (!lastActive) {
    return '—';
  }

  const date = new Date(lastActive);
  return Number.isNaN(date.getTime())
    ? String(lastActive)
    : date.toLocaleString();
}

function getStreamItems(items, { event, data }) {
  let payload;
  try {
    payload = JSON.parse(data);
  } catch {
    payload = data;
  }

  const eventType = String(event ?? '').toLowerCase();
  const type = String(
    payload?.type ?? payload?.kind ?? eventType ?? 'message'
  ).toLowerCase();
  const tool = payload?.tool_call ?? payload?.toolCall ?? payload;
  const isTool =
    type.includes('tool') ||
    payload?.tool_call ||
    payload?.toolCall ||
    payload?.tool;

  if (isTool) {
    const isResult =
      type.includes('result') ||
      type.includes('output') ||
      eventType.includes('result') ||
      eventType.includes('output');
    const id = tool?.tool_call_id ?? tool?.toolCallId ?? tool?.id;
    const name =
      tool?.name ??
      tool?.tool_name ??
      tool?.toolName ??
      (typeof payload?.tool === 'string' ? payload.tool : 'Tool');
    const value =
      tool?.result ?? tool?.output ?? tool?.response ?? payload?.result;
    const matchingIndex = isResult
      ? items.findLastIndex(
          (item) =>
            item.type === 'tool' &&
            ((id && item.id === id) || (!id && item.name === name))
        )
      : -1;

    if (matchingIndex !== -1) {
      return items.map((item, index) =>
        index === matchingIndex
          ? { ...item, result: value ?? data, hasResult: true }
          : item
      );
    }

    return [
      ...items,
      {
        type: 'tool',
        id: id ?? `${Date.now()}-${items.length}`,
        name,
        input:
          tool?.input ??
          tool?.arguments ??
          tool?.parameters ??
          tool?.args ??
          null,
        ...(isResult ? { result: value ?? data, hasResult: true } : {})
      }
    ];
  }

  const text =
    typeof payload === 'string'
      ? payload
      : (payload?.delta ?? payload?.text ?? payload?.token ?? payload?.content);
  if (typeof text !== 'string' || !text || type.includes('done')) {
    return items;
  }

  return [...items, { type: 'text', text }];
}

function formatToolValue(value) {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value, null, 2);
}

function renderStreamItem(item, index) {
  if (item.type !== 'tool') {
    return <span key={index}>{item.text}</span>;
  }

  return (
    <details className="card" key={item.id} style={{ margin: '8px 0' }}>
      <summary>{item.name}</summary>
      {item.input !== null ? <pre>{formatToolValue(item.input)}</pre> : null}
      {item.hasResult ? <pre>{formatToolValue(item.result)}</pre> : null}
    </details>
  );
}

function getHistoryOutput(item) {
  const output =
    item.output ?? item.result ?? item.response ?? 'No output was recorded.';
  return typeof output === 'string' ? output : formatToolValue(output);
}

export default function EmployeeDetailPage() {
  const [routeEmployeeId, setRouteEmployeeId] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [workError, setWorkError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [terminatingEmployeeId, setTerminatingEmployeeId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [workHistory, setWorkHistory] = useState([]);
  const [streamItems, setStreamItems] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [hasCompletedStream, setHasCompletedStream] = useState(false);
  const [hasCopiedOutput, setHasCopiedOutput] = useState(false);
  const outputRef = useRef(null);
  const streamItemsRef = useRef([]);
  const abortControllerRef = useRef(null);
  const replayItems =
    Array.isArray(selectedHistory?.events) &&
    selectedHistory.events.length > 0 &&
    selectedHistory.events.every(
      (item) => item.type === 'text' || item.type === 'tool'
    )
      ? selectedHistory.events
      : null;

  useEffect(() => {
    const pathSegments = globalThis.window.location.pathname
      .split('/')
      .filter(Boolean);
    const pathEmployeeId =
      pathSegments[0] === 'employees' && pathSegments.length === 2
        ? decodeURIComponent(pathSegments[1])
        : '';
    const employeeId =
      new URLSearchParams(globalThis.window.location.search).get('id') ||
      pathEmployeeId;
    setRouteEmployeeId(employeeId || '');
    const jwt = getStoredJwt();

    if (!jwt || isJwtExpired(jwt)) {
      if (jwt) {
        clearStoredJwt();
      }
      const redirect = `${globalThis.window.location.pathname}${globalThis.window.location.search}`;
      globalThis.window.location.assign(
        `/?redirect=${encodeURIComponent(redirect)}`
      );
      return;
    }

    let isMounted = true;
    const loadEmployees = () =>
      fetchEmployees({ jwt })
        .then((result) => {
          if (isMounted) {
            setEmployees(result);
            setError('');
          }
        })
        .catch((requestError) => {
          if (isMounted) {
            setError(requestError.message || 'Unable to load employees.');
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

    if (employeeId) {
      fetchEmployee({ jwt, employeeId })
        .then((result) => {
          if (isMounted) {
            setEmployee(result);
          }
        })
        .catch((requestError) => {
          if (isMounted) {
            setError(requestError.message || 'Unable to load this employee.');
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
      fetchEmployeeWork({ jwt, employeeId })
        .then((result) => {
          if (isMounted) {
            setWorkHistory(result);
          }
        })
        .catch((requestError) => {
          if (isMounted) {
            setWorkError(
              requestError.message || 'Unable to load past work items.'
            );
          }
        });
    } else {
      loadEmployees();
      const refreshInterval = setInterval(loadEmployees, 10_000);

      return () => {
        isMounted = false;
        clearInterval(refreshInterval);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    []
  );

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [selectedHistory, streamItems]);

  const handleSubmitWork = async (event) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || !routeEmployeeId || isStreaming) {
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    streamItemsRef.current = [];
    setStreamItems([]);
    setSelectedHistory(null);
    setHasCompletedStream(false);
    setHasCopiedOutput(false);
    setWorkError('');
    setIsStreaming(true);
    try {
      await submitEmployeeWork({
        jwt: getStoredJwt(),
        employeeId: routeEmployeeId,
        prompt: trimmedPrompt,
        signal: controller.signal,
        onEvent: (streamEvent) => {
          const nextItems = getStreamItems(streamItemsRef.current, streamEvent);
          streamItemsRef.current = nextItems;
          setStreamItems(nextItems);
        }
      });
      setHasCompletedStream(true);
      setPrompt('');
      const completedItem = {
        id: `local-${Date.now()}`,
        prompt: trimmedPrompt,
        output: streamItemsRef.current
          .filter((item) => item.type === 'text')
          .map((item) => item.text)
          .join(''),
        events: streamItemsRef.current
      };
      setWorkHistory((current) => [completedItem, ...current]);
      try {
        const history = await fetchEmployeeWork({
          jwt: getStoredJwt(),
          employeeId: routeEmployeeId
        });
        setWorkHistory((current) => {
          const historyIds = new Set(
            history.map((item) => item.id ?? item.workId).filter(Boolean)
          );
          return [
            ...history,
            ...current.filter((item) => !historyIds.has(item.id ?? item.workId))
          ];
        });
      } catch {
        // The completed work remains available in local history.
      }
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setWorkError(
          requestError.message || 'Unable to stream this work item.'
        );
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsStreaming(false);
    }
  };

  const handleCopyOutput = async () => {
    const output = streamItems
      .filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('');
    try {
      await globalThis.navigator.clipboard.writeText(output);
      setHasCopiedOutput(true);
    } catch {
      setWorkError('Unable to copy the output.');
    }
  };

  const handleTerminate = async (employeeId) => {
    const employeeToTerminate = employees.find(
      (item) => getEmployeeId(item) === employeeId
    );
    if (
      !employeeToTerminate ||
      !globalThis.window.confirm(
        `Terminate ${getEmployeeName(employeeToTerminate)}?`
      )
    ) {
      return;
    }

    setTerminatingEmployeeId(employeeId);
    setError('');
    try {
      await terminateEmployee({ jwt: getStoredJwt(), employeeId });
      setEmployees((currentEmployees) =>
        currentEmployees.map((item) =>
          getEmployeeId(item) === employeeId
            ? { ...item, status: 'terminated' }
            : item
        )
      );
    } catch (requestError) {
      setError(requestError.message || 'Unable to terminate this employee.');
    } finally {
      setTerminatingEmployeeId('');
    }
  };

  if (routeEmployeeId === null) {
    return (
      <main aria-busy="true">
        <p role="status">Loading employees…</p>
      </main>
    );
  }

  if (!routeEmployeeId) {
    return (
      <main className="grid">
        <section className="panel">
          <h1>Employees</h1>
          <p className="muted">Your employees and their current status.</p>
        </section>
        {isLoading ? <p role="status">Loading employees…</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {!isLoading && !error && employees.length === 0 ? (
          <p className="muted">No employees found.</p>
        ) : null}
        {employees.map((item) => {
          const status = getEmployeeStatus(item);
          const employeeId = getEmployeeId(item);

          return (
            <article className="panel employee-row" key={employeeId}>
              <div>
                <h2>
                  <a href={`/employees/${encodeURIComponent(employeeId)}`}>
                    {getEmployeeName(item)}
                  </a>
                </h2>
                <p>
                  <strong>Role:</strong> {item.role || item.title || '—'}
                </p>
                <p>
                  <strong>Last active:</strong> {getLastActive(item)}
                </p>
              </div>
              <div className="employee-actions">
                <span className={`status-badge status-${status.className}`}>
                  {status.className === 'working' ? (
                    <span aria-hidden="true" className="status-spinner" />
                  ) : null}
                  {status.label}
                </span>
                {status.className !== 'terminated' ? (
                  <button
                    className="secondary"
                    disabled={
                      !employeeId || terminatingEmployeeId === employeeId
                    }
                    onClick={() => handleTerminate(employeeId)}
                    type="button"
                  >
                    {terminatingEmployeeId === employeeId
                      ? 'Terminating…'
                      : 'Terminate'}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </main>
    );
  }

  return (
    <main>
      <section className="panel stack">
        <a href="/employees">← Back to employees</a>
        {isLoading ? <p role="status">Loading employee…</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {employee ? (
          <>
            <h1>
              {employee.displayName ||
                employee.display_name ||
                employee.name ||
                'Digital Professional'}
            </h1>
            <p>
              <strong>Role:</strong> {employee.role || '—'}
            </p>
            <p>
              <strong>Domain:</strong> {employee.domain || '—'}
            </p>
            {employee.description ? <p>{employee.description}</p> : null}
            <p className="muted">Employee ID: {employee.id}</p>
            <section className="stack" aria-labelledby="assign-work-heading">
              <h2 id="assign-work-heading">Assign work</h2>
              <form className="stack" onSubmit={handleSubmitWork}>
                <label htmlFor="work-prompt">Prompt</label>
                <textarea
                  id="work-prompt"
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Describe the work you want this employee to do…"
                  required
                  rows={4}
                  value={prompt}
                />
                <button disabled={isStreaming || !prompt.trim()} type="submit">
                  {isStreaming ? 'Working…' : 'Send prompt'}
                </button>
              </form>
              {workError ? <p role="alert">{workError}</p> : null}
              <h2>Past work</h2>
              {workHistory.length === 0 ? (
                <p className="muted">No past work items found.</p>
              ) : (
                <div className="stack">
                  {workHistory.map((item, index) => (
                    <button
                      aria-label={`Replay work: ${item.prompt || 'Work item'}`}
                      className="secondary"
                      key={item.id ?? item.workId ?? index}
                      onClick={() => setSelectedHistory(item)}
                      style={{ textAlign: 'left' }}
                      type="button"
                    >
                      {item.prompt || item.title || `Work item ${index + 1}`}
                    </button>
                  ))}
                </div>
              )}
              <h2>{selectedHistory ? 'Past output' : 'Live output'}</h2>
              <div
                aria-live="polite"
                className="output"
                ref={outputRef}
                style={{ maxHeight: 400, overflowY: 'auto' }}
              >
                {selectedHistory ? (
                  replayItems ? (
                    replayItems.map(renderStreamItem)
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {getHistoryOutput(selectedHistory)}
                    </div>
                  )
                ) : (
                  streamItems.map(renderStreamItem)
                )}
              </div>
              {hasCompletedStream && !selectedHistory ? (
                <button
                  className="secondary"
                  onClick={handleCopyOutput}
                  type="button"
                >
                  {hasCopiedOutput ? 'Copied' : 'Copy output'}
                </button>
              ) : null}
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
