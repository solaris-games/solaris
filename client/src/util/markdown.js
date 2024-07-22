import { marked } from 'marked';

marked.use({
  gfm: true,
});

export const renderMarkdown = (markdown) => {
  return marked.parse(markdown);
};
