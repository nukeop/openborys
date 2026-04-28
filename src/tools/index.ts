import { ToolService } from '../services/tools';
import { bashTool } from './bash';
import { webSearchTool } from './web-search';
import { webFetchTool } from './web-fetch';

export const registerTools = () => {
  ToolService.registerTool(bashTool);
  ToolService.registerTool(webSearchTool);
  ToolService.registerTool(webFetchTool);
};
