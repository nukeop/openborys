import { ToolService } from '../services/tools';
import { bashTool } from './bash';
import { webSearchTool } from './web-search';
import { webFetchTool } from './web-fetch';
import { loadSkillTool } from './load-skill';
import { unloadSkillTool } from './unload-skill';

export const registerTools = () => {
  ToolService.registerTool(bashTool);
  ToolService.registerTool(webSearchTool);
  ToolService.registerTool(webFetchTool);
  ToolService.registerTool(loadSkillTool);
  ToolService.registerTool(unloadSkillTool);
};
