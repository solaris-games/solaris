import { marked } from 'marked';

export const renderMarkdown = (markdown) => {
  return marked.parse(markdown);
};
