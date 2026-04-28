import { ToolService } from '../services/tools';
import { bashTool } from './bash';
import { webSearchTool } from './web-search';

export const registerTools = () => {
  ToolService.registerTool(bashTool);
  ToolService.registerTool(webSearchTool);
};
