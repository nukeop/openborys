import { IntrospectCard } from '../components/IntrospectCard';
import { PhoneCallsCard } from '../components/PhoneCallsCard';
import { ReplyDecisionsCard } from '../components/ReplyDecisionsCard';
import { SkillsCard } from '../components/SkillsCard';
import { ToolsCard } from '../components/ToolsCard';

export function Home() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <title>Dashboard</title>
      <h1 className="font-bold text-2xl text-zinc-100">Dashboard</h1>
      <IntrospectCard />
      <ToolsCard />
      <SkillsCard />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReplyDecisionsCard />
        <PhoneCallsCard />
      </div>
    </div>
  );
}
