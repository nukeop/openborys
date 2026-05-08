import { useQuery } from '@tanstack/react-query';
import { IntrospectCard } from '../components/IntrospectCard';
import { introspectQuery } from '../queries/introspect';

export function Home() {
  const { data, isPending } = useQuery(introspectQuery);

  if (isPending || !data) {
    return <div className="p-8 text-zinc-500">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 font-bold text-2xl text-zinc-100">Dashboard</h1>
      <IntrospectCard data={data} />
    </div>
  );
}
