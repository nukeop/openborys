import os from 'node:os';
import { env } from '../../environment';
import { getActive, getCheap } from '../../services/ai';

export function getIntrospection() {
  const cpus = os.cpus();
  const { provider, model } = getActive();
  const { provider: cheapProvider, model: cheapModel } = getCheap();

  return {
    name: env().BOT_NAME,
    environment: env().NODE_ENV,
    runtime: {
      platform: os.platform(),
      arch: os.arch(),
      version: Bun.version,
    },
    cpu: {
      model: cpus[0]?.model ?? 'Unknown',
      cores: cpus.length,
    },
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
    },
    uptimeSeconds: os.uptime(),
    ai: {
      provider,
      model,
      cheapProvider,
      cheapModel,
    },
  };
}

export type Introspection = ReturnType<typeof getIntrospection>;
