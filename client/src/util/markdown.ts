import { marked } from 'marked';

marked.use({
  gfm: true,
});

export const renderMarkdown = (markdown: string) => {
  return marked.parse(markdown);
};
