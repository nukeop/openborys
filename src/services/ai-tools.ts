import type { AssistantContent, AssistantModelMessage, ModelMessage, ToolContent, UserContent } from "ai";

export const createUserMessage = ({
  content,
}: {
  content: UserContent;
}): ModelMessage => {
  return {
    role: 'user',
    content,
  };
};


export const createAssistantMessage = ({
  content,
}: {
  content: AssistantContent;
}): AssistantModelMessage => {
  return {
    role: 'assistant',
    content,
  };
};

export const createToolResult = ({
  content,
}: {
  content: ToolContent;
}): ModelMessage => {
  return {
    role: 'tool',
    content,
  };
};
