import { Compass } from 'lucide-react';
import { useStore } from '../state/store';
import { ButtonLink, EmptyState } from '../components/ui';

export default function NotFound() {
  const { currentUser } = useStore();
  const home = currentUser ? (currentUser.role === 'applicant' ? '/applicant' : '/employer') : '/';
  return (
    <div className="mx-auto max-w-lg py-16">
      <EmptyState icon={Compass} title="Page not found" description="The page you were looking for doesn’t exist or the record was removed (for example, after resetting demo data)."
        action={<ButtonLink to={home}>Go to dashboard</ButtonLink>} />
    </div>
  );
}
