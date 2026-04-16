/**
 * Dashboard Page
 * Main application page (protected by NextAuth)
 */

import Head from 'next/head';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface SheetsData {
  productionLogs: any[];
  fieldTracking: any[];
  referenceData: any[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<SheetsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sheets/batch-read', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Veri yüklenemedi');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Bilinmeyen hata');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div style={styles.center}>Yükleniyor...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>ABİS - Dashboard</title>
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <h1>ABİS Dashboard</h1>
          <div style={styles.userInfo}>
            <span>{session.user?.email}</span>
            <button style={styles.logoutBtn} onClick={() => signOut()}>
              Çıkış Yap
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {error && (
            <div style={styles.errorBox}>
              <p>Hata: {error}</p>
              <button onClick={fetchData}>Yeniden Deneyin</button>
            </div>
          )}

          {loading ? (
            <div style={styles.loadingBox}>Veriler yükleniyor...</div>
          ) : (
            <div style={styles.gridContainer}>
              <section style={styles.section}>
                <h2>Üretim Logları ({data?.productionLogs?.length || 0})</h2>
                {data?.productionLogs && data.productionLogs.length > 0 ? (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Parti ID</th>
                        <th>Biyolojik Evre</th>
                        <th>Sıcaklık</th>
                        <th>Nem</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.productionLogs.slice(0, 5).map((log, idx) => (
                        <tr key={idx}>
                          <td>{log.Parti_ID}</td>
                          <td>{log.Biyolojik_Evre}</td>
                          <td>{log.Sicaklik}°C</td>
                          <td>{log.Nem}%</td>
                          <td>{log.Status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={styles.emptyText}>Henüz veri yok</p>
                )}
              </section>

              <section style={styles.section}>
                <h2>Saha Takibi ({data?.fieldTracking?.length || 0})</h2>
                {data?.fieldTracking && data.fieldTracking.length > 0 ? (
                  <ul style={styles.list}>
                    {data.fieldTracking.slice(0, 5).map((field, idx) => (
                      <li key={idx}>
                        <strong>{field.Ciftci_Ad}</strong> - Verim Puanı:{' '}
                        {field.Verim_Puani || '-'}/10
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={styles.emptyText}>Henüz veri yok</p>
                )}
              </section>

              <section style={styles.section}>
                <h2>Referans Veriler ({data?.referenceData?.length || 0})</h2>
                {data?.referenceData && data.referenceData.length > 0 ? (
                  <ul style={styles.list}>
                    {data.referenceData.map((ref, idx) => (
                      <li key={idx}>
                        <strong>{ref.Biyolojik_Evre}</strong>
                        <br />
                        Optimal Sıcaklık: {ref.Optimal_Sicaklik_Min}°C -{' '}
                        {ref.Optimal_Sicaklik_Max}°C
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={styles.emptyText}>Henüz veri yok</p>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  main: {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '0 20px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
  },
  section: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '10px 0',
  },
  errorBox: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '20px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  loadingBox: {
    backgroundColor: 'white',
    padding: '40px',
    textAlign: 'center',
    borderRadius: '8px',
  },
  emptyText: {
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    backgroundColor: '#f5f5f5',
  },
};
