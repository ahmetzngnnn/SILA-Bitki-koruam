/**
 * Error Page Component
 */

import type { NextPage } from 'next';
import type { ErrorProps } from 'next/error';

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>⚠️ Hata Oluştu!</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        {statusCode
          ? `Sunucu tarafında bir hata oluştu (${statusCode})`
          : 'İstemci tarafında bir hata oluştu'}
      </p>
      <button
        onClick={() => window.location.href = '/'}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Ana Sayfaya Dön
      </button>
    </div>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
