'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
            backgroundColor: '#fafafa',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: '1.5rem', opacity: 0.5 }}
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.025em' }}>
            500
          </h1>
          <h2 style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
            Something went wrong
          </h2>
          <p style={{ marginTop: '0.5rem', maxWidth: '28rem', color: '#6b7280' }}>
            An unexpected error occurred. Please try again.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#111827',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
