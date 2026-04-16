/**
 * Sign In Page
 * Google OAuth login page
 */

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function SignIn() {
  const router = useRouter();
  const error = router.query.error as string | undefined;

  const handleGoogleSignIn = async () => {
    const result = await signIn('google', {
      callbackUrl: '/dashboard',
      redirect: true,
    });

    if (result?.error) {
      console.error('Sign in error:', result.error);
    }
  };

  return (
    <>
      <Head>
        <title>ABİS - Giriş</title>
      </Head>

      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>ABİS</h1>
          <p style={styles.subtitle}>
            Akıllı Böcek Üretim ve İzlenebilirlik Sistemi
          </p>

          {error && (
            <div style={styles.errorBox}>
              <p>
                Giriş hatası: {error === 'AccessDenied' ? 'Erişim reddedildi' : error}
              </p>
            </div>
          )}

          <button style={styles.button} onClick={handleGoogleSignIn}>
            <span style={styles.icon}>🔐</span>
            Google ile Giriş Yap
          </button>

          <p style={styles.info}>
            Sisteme erişmek için Google hesabınız ile giriş yapınız. Sizin Google
            Drive'ınızdaki ABİS verileri yüklenecektir.
          </p>
        </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: '0 0 30px 0',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#4285f4',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  icon: {
    fontSize: '18px',
  },
  errorBox: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  info: {
    fontSize: '12px',
    color: '#95a5a6',
    marginTop: '20px',
    lineHeight: '1.6',
  },
};
