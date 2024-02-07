import { useRouter } from 'next/navigation';

const Journey = () => {
  const router = useRouter();
  router.replace(`/us-en/lp/journey-app`);
  return null;
};

export default Journey;
