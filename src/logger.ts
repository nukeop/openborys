import {
  configure,
  getConsoleSink,
  getJsonLinesFormatter,
} from '@logtape/logtape';
import { getPrettyFormatter } from '@logtape/pretty';
import { isProd } from './environment';

export const initLogger = async () => {
  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: isProd()
          ? getJsonLinesFormatter()
          : getPrettyFormatter({ properties: true }),
      }),
    },
    loggers: [
      {
        category: ['logtape', 'meta'],
        lowestLevel: 'warning',
        sinks: ['console'],
      },
      {
        category: 'OpenBorys',
        lowestLevel: isProd() ? 'info' : 'debug',
        sinks: ['console'],
      },
    ],
  });
};
