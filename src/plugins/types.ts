import type { Logger } from '@logtape/logtape';
import type { Environment } from '../environment';
import type { ToolWithMeta } from '../services/tools';

export type PluginContext = {
	env: Environment;
	logger: Logger;
};

export type PluginFactory = (context: PluginContext) => ToolWithMeta<any, any>;
