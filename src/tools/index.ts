import { ToolService } from '../services/tools';
import { bashTool } from './bash';

export const registerTools = () => {
  ToolService.registerTool(bashTool);
};
