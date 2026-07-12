import os from 'node:os';
import { env } from '../../environment';
import { ActiveModelsService } from '../../services/active-models';

export function getIntrospection() {
  const cpus = os.cpus();

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
      main: ActiveModelsService.get('main'),
      cheap: ActiveModelsService.get('cheap'),
    },
  };
}

export type Introspection = ReturnType<typeof getIntrospection>;
