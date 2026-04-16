/**
 * Home Page - Redirect to dashboard or signin
 */

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  return (
    <>
      <Head>
        <title>ABİS - Yükleniyor...</title>
      </Head>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' }}>
        Yükleniyor...
      </div>
    </>
  );
}
