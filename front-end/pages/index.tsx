import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'
import { Suspense, SuspenseProps, useEffect, useState } from 'react';

const GameNoSSR = dynamic(() => import('../game/Game'), { ssr: false });

const SuspensePostHydration = function(props: SuspenseProps): JSX.Element {
  const [postHydration, setPostHydration] = useState(false);
  useEffect(() => {
    setPostHydration(true);
  }, []);
  return postHydration 
    ? (<Suspense {...props} />) 
    : <></>;
}

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <SuspensePostHydration
          fallback={(
            <h1>loading...</h1>
          )} 
        >
          <GameNoSSR />
        </SuspensePostHydration>
      </main>
    </div>
  )
}

export default Home