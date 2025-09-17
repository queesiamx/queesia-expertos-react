import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';

export function useTrackVisit(slug) {
  useEffect(() => {
    const auth = getAuth();
    const send = (token) => {
      const body = JSON.stringify({ slug, referrer: document.referrer || '' });
      const headers = { 'content-type': 'application/json' };
      if (token) headers.authorization = `Bearer ${token}`;

      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/visit', blob);
      } else {
        fetch('/api/visit', { method: 'POST', headers, body }).catch(()=>{});
      }
    };
    auth.currentUser?.getIdToken().then(send).catch(() => send());
  }, [slug]);
}
