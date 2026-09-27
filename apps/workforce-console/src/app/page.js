'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createExperienceSdk } from '@olympion/experience-sdk';
import {
  canAssignWork,
  clearStoredJwt,
  decodeJwtPayload,
  EMPLOYEE_CATALOG,
  createWorkItem,
  exchangeApiKeyForJwt,
  getIdleEmployees,
  getStoredJwt,
  hireEmployee,
  INVALID_API_KEY_ERROR_MESSAGE,
  isJwtExpired,
  SESSION_EXPIRED_ERROR_MESSAGE,
  storeJwt,
  setEmployeeStatus
} from '../lib/workforceConsole.mjs';

export default function WorkforceConsolePage() {
  const streamIntervalRef = useRef(null);
  const authIntervalRef = useRef(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [apiKeySuffix, setApiKeySuffix] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [draftApiKey, setDraftApiKey] = useState('');
  const [hiredEmployees, setHiredEmployees] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [workItems, setWorkItems] = useState([]);
  const [activeWorkId, setActiveWorkId] = useState('');

  const clearWorkforceState = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    setHiredEmployees([]);
    setWorkItems([]);
    setActiveWorkId('');
    setSelectedEmployeeId('');
    setPrompt('');
  };

  const setLoginRedirectToCurrentUrl = () => {
    const browserWindow = globalThis.window;
    if (!browserWindow) {
      return '/';
    }

    const currentUrl = new URL(browserWindow.location.href);
    const searchParams = new URLSearchParams(currentUrl.search);
    searchParams.delete('redirect');
    const currentPath = `${currentUrl.pathname}${
      searchParams.toString() ? `?${searchParams.toString()}` : ''
    }${currentUrl.hash}`;
    const nextSearchParams = new URLSearchParams(currentUrl.search);
    nextSearchParams.set('redirect', currentPath);
    const loginUrl = `${currentUrl.pathname}?${nextSearchParams.toString()}${
      currentUrl.hash
    }`;

    browserWindow.history.replaceState(null, '', loginUrl);
    return currentPath;
  };

  const toSafeRedirectPath = (redirectTarget) => {
    const browserWindow = globalThis.window;
    if (!browserWindow || !redirectTarget) {
      return '';
    }

    try {
      const parsedUrl = new URL(redirectTarget, browserWindow.location.origin);
      if (parsedUrl.origin !== browserWindow.location.origin) {
        return '';
      }

      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
      return '';
    }
  };

  const activeWork = useMemo(
    () => workItems.find((item) => item.id === activeWorkId),
    [activeWorkId, workItems]
  );
  const activeStreamId =
    activeWork?.status === 'streaming' ? activeWork.id : '';

  useEffect(() => {
    if (!activeStreamId) {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      return undefined;
    }

    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }

    const interval = setInterval(() => {
      setWorkItems((currentItems) => {
        const itemToUpdate = currentItems.find(
          (item) => item.id === activeStreamId
        );
        if (!itemToUpdate || itemToUpdate.status !== 'streaming') {
          return currentItems;
        }

        const tokenIndex = itemToUpdate.output
          ? itemToUpdate.output.trim().split(/\s+/).length
          : 0;

        if (tokenIndex >= itemToUpdate.tokens.length) {
          setHiredEmployees((currentEmployees) =>
            setEmployeeStatus(currentEmployees, itemToUpdate.employeeId, 'idle')
          );
          setActiveWorkId('');

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
    streamIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      if (streamIntervalRef.current === interval) {
        streamIntervalRef.current = null;
      }
    };
  }, [activeStreamId]);
  const hasStreamingWork = useMemo(
    () => workItems.some((item) => item.status === 'streaming'),
    [workItems]
  );
  const idleEmployees = useMemo(
    () => getIdleEmployees(hiredEmployees),
    [hiredEmployees]
  );
  const canSubmitAssignment = useMemo(
    () =>
      canAssignWork({
        hiredEmployees,
        selectedEmployeeId,
        prompt,
        hasStreamingWork
      }),
    [hiredEmployees, selectedEmployeeId, prompt, hasStreamingWork]
  );

  const completedWorkItems = useMemo(
    () =>
      [...workItems]
        .filter((item) => item.status === 'completed')
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [workItems]
  );

  useEffect(() => {
    if (!globalThis.window) {
      return;
    }

    const jwt = getStoredJwt();
    if (!jwt) {
      setLoginRedirectToCurrentUrl();
      setIsAuthReady(true);
      return;
    }

    if (isJwtExpired(jwt)) {
      clearStoredJwt();
      setAuthError(SESSION_EXPIRED_ERROR_MESSAGE);
      setLoginRedirectToCurrentUrl();
      setIsAuthReady(true);
      return;
    }

    const payload = decodeJwtPayload(jwt);
    setApiKeySuffix(String(payload?.keySuffix ?? 'saved'));
    setIsConnected(true);
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      if (authIntervalRef.current) {
        clearInterval(authIntervalRef.current);
        authIntervalRef.current = null;
      }
      return undefined;
    }

    if (authIntervalRef.current) {
      clearInterval(authIntervalRef.current);
    }

    const interval = setInterval(() => {
      const jwt = getStoredJwt();
      if (!jwt || isJwtExpired(jwt)) {
        clearInterval(interval);
        authIntervalRef.current = null;
        clearStoredJwt();
        clearWorkforceState();
        setApiKeySuffix('');
        setIsConnected(false);
        setAuthError(SESSION_EXPIRED_ERROR_MESSAGE);
        setLoginRedirectToCurrentUrl();
      }
    }, 30_000);
    authIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      if (authIntervalRef.current === interval) {
        authIntervalRef.current = null;
      }
    };
  }, [isConnected]);

  const handleConnect = async (event) => {
    event.preventDefault();
    setAuthError('');

    if (!draftApiKey.trim()) {
      return;
    }

    setIsAuthenticating(true);

    try {
      const trimmedKey = draftApiKey.trim();
      const sdk = createExperienceSdk();
      const jwt = await exchangeApiKeyForJwt({
        apiKey: trimmedKey,
        sdk
      });

      if (isJwtExpired(jwt)) {
        throw new Error(SESSION_EXPIRED_ERROR_MESSAGE);
      }

      const payload = decodeJwtPayload(jwt);
      const keySuffix =
        payload?.keySuffix ?? (trimmedKey.length >= 4 ? trimmedKey.slice(-4) : '');
      storeJwt(jwt);
      clearWorkforceState();
      setApiKeySuffix(keySuffix);
      setDraftApiKey('');
      setIsConnected(true);

      const browserWindow = globalThis.window;
      if (browserWindow) {
        const currentUrl = new URL(browserWindow.location.href);
        const safeRedirectPath = toSafeRedirectPath(
          currentUrl.searchParams.get('redirect')
        );
        if (safeRedirectPath) {
          browserWindow.history.replaceState(null, '', safeRedirectPath);
        }
      }
    } catch (error) {
      clearStoredJwt();
      clearWorkforceState();
      setIsConnected(false);
      setApiKeySuffix('');
      setAuthError(error.message || INVALID_API_KEY_ERROR_MESSAGE);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleHire = (employee) => {
    setHiredEmployees((current) => hireEmployee(current, employee));
  };

  const handleAssignWork = (event) => {
    event.preventDefault();

    if (!canSubmitAssignment) {
      return;
    }

    const workItem = createWorkItem({
      employeeId: selectedEmployeeId,
      prompt: prompt.trim(),
      hiredEmployees
    });

    setWorkItems((current) => [...current, workItem]);
    setActiveWorkId(workItem.id);
    setHiredEmployees((currentEmployees) =>
      setEmployeeStatus(currentEmployees, selectedEmployeeId, 'busy')
    );
    setPrompt('');
    setSelectedEmployeeId('');
  };

  const handleDisconnect = () => {
    clearStoredJwt();
    clearWorkforceState();
    setApiKeySuffix('');
    setDraftApiKey('');
    setAuthError('');
    setIsConnected(false);
    setLoginRedirectToCurrentUrl();
  };

  if (!isAuthReady) {
    return (
      <main aria-busy="true">
        <section className="panel" role="status" style={{ maxWidth: 520, margin: '48px auto' }}>
          <p className="muted">Checking your session…</p>
        </section>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main>
        <section
          className="panel"
          style={{ maxWidth: 520, margin: '48px auto' }}
        >
          <h1>Workforce Console</h1>
          <p className="muted">
            Enter your API key to access your digital workforce.
          </p>
          {authError ? (
            <p
              role="alert"
              style={{ color: 'var(--danger-color, #b42318)', marginBottom: 12 }}
            >
              {authError}
            </p>
          ) : null}
          <form className="stack" onSubmit={handleConnect}>
            <div>
              <label htmlFor="api-key">API key</label>
              <input
                autoComplete="off"
                id="api-key"
                name="api-key"
                onChange={(event) => setDraftApiKey(event.target.value)}
                placeholder="opx_live_..."
                required
                type="password"
                value={draftApiKey}
              />
            </div>
            <button disabled={isAuthenticating} type="submit">
              {isAuthenticating ? 'Signing in…' : 'Access Console'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="grid" style={{ gap: 24 }}>
      <section
        className="panel"
        style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}
      >
        <div>
          <h1>Workforce Console</h1>
          <p className="muted">
            Connected with API key ending in {apiKeySuffix || 'saved'}.
          </p>
        </div>
        <button
          aria-label="Disconnect and clear API key status, prompt, hired employees, and work history"
          className="secondary"
          onClick={handleDisconnect}
          type="button"
        >
          Disconnect
        </button>
      </section>

      <section className="panel">
        <h2>Employee Catalog</h2>
        <div className="grid two">
          {EMPLOYEE_CATALOG.map((employee) => {
            const isHired = hiredEmployees.some(
              (current) => current.id === employee.id
            );

            return (
              <article className="card" key={employee.id}>
                <h3>{employee.name}</h3>
                <p className="muted">{employee.specialty}</p>
                <button
                  disabled={isHired}
                  onClick={() => handleHire(employee)}
                  type="button"
                >
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
                required
                value={selectedEmployeeId}
              >
                <option value="">Choose a hired employee</option>
                {idleEmployees.map((employee) => (
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
                required
                rows={4}
                value={prompt}
              />
            </div>
            <button disabled={!canSubmitAssignment} type="submit">
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
          <div aria-live="polite" className="output">
            {activeWork
              ? activeWork.output || 'Starting stream…'
              : 'No active stream.'}
          </div>
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
                  aria-label={`View full output for ${item.employeeName}`}
                  className="secondary"
                  key={item.id}
                  onClick={() => setActiveWorkId(item.id)}
                  style={{ textAlign: 'left' }}
                  type="button"
                >
                  <strong>{item.employeeName}</strong>
                  {activeWorkId === item.id ? ' (Viewing)' : ''}
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
