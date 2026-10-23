'use client';

import { useEffect, useState } from 'react';
import {
  createEmployee,
  fetchCatalog,
  fetchEmployees
} from '../../lib/catalogApi.mjs';
import {
  clearStoredJwt,
  getStoredJwt,
  isJwtExpired
} from '../../lib/workforceConsole.mjs';

function getTemplateId(template) {
  return template.id ?? template.templateId ?? template.template_id;
}

function getTemplateName(template) {
  return (
    template.displayName ??
    template.display_name ??
    template.name ??
    template.title ??
    'Digital Professional'
  );
}

function getHiredTemplateIds(employees) {
  return new Set(
    employees
      .map(
        (employee) =>
          employee.templateId ?? employee.template_id ?? employee.template?.id
      )
      .filter(Boolean)
  );
}

export default function CatalogPage() {
  const [templates, setTemplates] = useState([]);
  const [hiredTemplateIds, setHiredTemplateIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [isHiring, setIsHiring] = useState(false);
  const [hireError, setHireError] = useState('');

  useEffect(() => {
    const jwt = getStoredJwt();
    if (!jwt || isJwtExpired(jwt)) {
      if (jwt) {
        clearStoredJwt();
      }
      globalThis.window.location.assign(
        `/?redirect=${encodeURIComponent('/catalog')}`
      );
      return;
    }

    Promise.all([fetchCatalog({ jwt }), fetchEmployees({ jwt })])
      .then(([availableTemplates, employees]) => {
        setTemplates(availableTemplates);
        setHiredTemplateIds(getHiredTemplateIds(employees));
      })
      .catch((requestError) => {
        setError(
          requestError.message || 'Unable to load the employee catalog.'
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleHire = async (event) => {
    event.preventDefault();
    if (!selectedTemplate) {
      return;
    }

    setIsHiring(true);
    setHireError('');

    try {
      const employee = await createEmployee({
        jwt: getStoredJwt(),
        templateId: getTemplateId(selectedTemplate),
        displayName
      });
      setHiredTemplateIds(
        (current) => new Set([...current, getTemplateId(selectedTemplate)])
      );
      globalThis.window.location.assign(
        `/employees?id=${encodeURIComponent(employee.id)}`
      );
    } catch (hireRequestError) {
      setHireError(hireRequestError.message || 'Unable to hire this employee.');
    } finally {
      setIsHiring(false);
    }
  };

  return (
    <main className="grid" style={{ gap: 24 }}>
      <section
        className="panel"
        style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}
      >
        <div>
          <h1>Employee Catalog</h1>
          <p className="muted">
            Browse available Digital Professionals for your workforce.
          </p>
        </div>
        <a href="/">Workforce Console</a>
      </section>

      {isLoading ? <p role="status">Loading employee catalog…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!isLoading && !error && templates.length === 0 ? (
        <p className="muted">
          No Digital Professionals are currently available.
        </p>
      ) : null}

      {!isLoading && !error ? (
        <section
          aria-label="Available Digital Professionals"
          className="grid two"
        >
          {templates.map((template) => {
            const templateId = getTemplateId(template);
            const isHired = hiredTemplateIds.has(templateId);

            return (
              <article className="card stack" key={templateId}>
                <div>
                  <h2>{getTemplateName(template)}</h2>
                  <p>
                    <strong>Role:</strong>{' '}
                    {template.role || template.title || '—'}
                  </p>
                  <p>
                    <strong>Domain:</strong>{' '}
                    {template.domain || template.specialty || '—'}
                  </p>
                  <p>{template.description || 'No description available.'}</p>
                </div>
                {isHired ? <span className="tag">Already hired</span> : null}
                <button
                  disabled={isHired || !templateId}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setDisplayName('');
                    setHireError('');
                  }}
                  type="button"
                >
                  {isHired ? 'Already hired' : 'Hire'}
                </button>
              </article>
            );
          })}
        </section>
      ) : null}

      {selectedTemplate ? (
        <div
          aria-labelledby="hire-title"
          aria-modal="true"
          className="panel stack"
          role="dialog"
        >
          <h2 id="hire-title">Hire {getTemplateName(selectedTemplate)}?</h2>
          <p className="muted">
            Confirm to add this Digital Professional to your workforce.
          </p>
          {hireError ? <p role="alert">{hireError}</p> : null}
          <form className="stack" onSubmit={handleHire}>
            <div>
              <label htmlFor="display-name">Display name (optional)</label>
              <input
                id="display-name"
                onChange={(event) => setDisplayName(event.target.value)}
                value={displayName}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button disabled={isHiring} type="submit">
                {isHiring ? 'Hiring…' : 'Confirm hire'}
              </button>
              <button
                className="secondary"
                disabled={isHiring}
                onClick={() => setSelectedTemplate(null)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
