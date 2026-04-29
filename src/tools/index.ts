import { ToolService } from '../services/tools';
import { bashTool } from './bash';
import { loadSkillTool } from './load-skill';
import { rememberTool } from './remember';
import { unloadSkillTool } from './unload-skill';
import { webFetchTool } from './web-fetch';
import { webSearchTool } from './web-search';

export const registerTools = () => {
  ToolService.registerTool(bashTool);
  ToolService.registerTool(webSearchTool);
  ToolService.registerTool(webFetchTool);
  ToolService.registerTool(loadSkillTool);
  ToolService.registerTool(unloadSkillTool);
  ToolService.registerTool(rememberTool);
};
