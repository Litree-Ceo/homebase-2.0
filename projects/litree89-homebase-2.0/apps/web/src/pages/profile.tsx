// Redirect to /profile/me
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile/me');
  }, [router]);

  return null;
}
