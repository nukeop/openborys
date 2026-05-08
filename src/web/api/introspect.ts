import os from 'node:os';
import { env } from '../../environment';
import { getActive } from '../../services/ai';

export function getIntrospection() {
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const { provider, model } = getActive();

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
      totalBytes: totalMemory,
      freeBytes: freeMemory,
      usagePercent: Math.round((1 - freeMemory / totalMemory) * 100),
    },
    uptime: {
      seconds: os.uptime(),
    },
    ai: {
      provider,
      model,
    },
  };
}

export type Introspection = ReturnType<typeof getIntrospection>;
