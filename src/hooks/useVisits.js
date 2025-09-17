import { useEffect, useState } from 'react';

export function useVisits(slug) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`/api/get-visits?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [slug]);
  return data;
}
