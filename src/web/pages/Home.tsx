import { IntrospectCard } from '../components/IntrospectCard';
import { SkillsCard } from '../components/SkillsCard';

export function Home() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <title>Dashboard</title>
      <h1 className="font-bold text-2xl text-zinc-100">Dashboard</h1>
      <IntrospectCard />
      <SkillsCard />
    </div>
  );
}
