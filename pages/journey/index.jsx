import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Journey = () => {
  const router = useRouter();
  useEffect(() => {
    if (router.isReady) {
      router.replace(`/us-en/lp/journey-app`);
    }
  }, [router.isReady]);
  return null;
};

export default Journey;
