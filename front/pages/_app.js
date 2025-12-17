import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    // Enregistre le service worker en production uniquement
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('Service Worker enregistré avec succès: ', registration.scope)
          },
          (err) => {
            console.log("L'enregistrement du Service Worker a échoué: ", err)
          }
        )
      })
    }
  }, [])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mon App" />
      </Head>
      <Component {...pageProps} key={router.asPath} />
    </>
  )
}

export default MyApp
