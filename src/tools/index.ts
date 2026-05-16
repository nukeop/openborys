import { ToolService } from '../services/tools';
import { bashTool } from './bash';
import { imageTool } from './image';
import { loadSkillTool } from './load-skill';
import { createPhoneTool } from './phone';
import { recallTool } from './recall';
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
  ToolService.registerTool(recallTool);
  ToolService.registerTool(imageTool);
  ToolService.registerTool(createPhoneTool());
};
