import { ToolService } from '../../services/tools';

export function getTools() {
	return ToolService.getAll().map((t) => ({
		id: t.id,
		name: t.name,
		emoji: t.emoji,
		isAlwaysAvailable: t.isAlwaysAvailable,
	}));
}

export type ToolsData = ReturnType<typeof getTools>;
