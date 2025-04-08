import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Login = () => {
  const router = useRouter();
  useEffect(() => {
    if (router.isReady) {
      router.replace('/us-en/signin');
    }
  }, [router.isReady]);
  return null;
};

export default Login;
