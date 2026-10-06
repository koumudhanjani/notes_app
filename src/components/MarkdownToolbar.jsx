import React from 'react';
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Link,
  Table
} from 'lucide-react';

export default function MarkdownToolbar({ onInsert }) {
  const tools = [
    {
      icon: <Bold size={14} />,
      label: 'Bold',
      prefix: '**',
      suffix: '**',
      placeholder: 'bold text'
    },
    {
      icon: <Italic size={14} />,
      label: 'Italic',
      prefix: '*',
      suffix: '*',
      placeholder: 'italic text'
    },
    {
      icon: <Heading2 size={14} />,
      label: 'Heading',
      prefix: '## ',
      suffix: '',
      placeholder: 'Heading'
    },
    { isSeparator: true },
    {
      icon: <CheckSquare size={14} />,
      label: 'Checklist',
      prefix: '- [ ] ',
      suffix: '',
      placeholder: 'Task item'
    },
    {
      icon: <List size={14} />,
      label: 'Bullet List',
      prefix: '- ',
      suffix: '',
      placeholder: 'List item'
    },
    {
      icon: <ListOrdered size={14} />,
      label: 'Numbered List',
      prefix: '1. ',
      suffix: '',
      placeholder: 'First item'
    },
    { isSeparator: true },
    {
      icon: <Quote size={14} />,
      label: 'Quote',
      prefix: '> ',
      suffix: '',
      placeholder: 'Quote'
    },
    {
      icon: <Code size={14} />,
      label: 'Code Block',
      prefix: '```javascript\n',
      suffix: '\n```',
      placeholder: '// code here'
    },
    {
      icon: <Link size={14} />,
      label: 'Link',
      prefix: '[',
      suffix: '](https://example.com)',
      placeholder: 'link title'
    },
    {
      icon: <Table size={14} />,
      label: 'Table',
      prefix: '\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1 | Cell 2 |\n',
      suffix: '',
      placeholder: ''
    }
  ];

  return (
    <div className="markdown-toolbar">
      {tools.map((tool, idx) => {
        if (tool.isSeparator) {
          return <div key={`sep-${idx}`} className="toolbar-separator" />;
        }
        return (
          <button
            key={tool.label}
            type="button"
            className="md-tool-btn"
            title={tool.label}
            onClick={() => onInsert(tool.prefix, tool.suffix, tool.placeholder)}
          >
            {tool.icon}
            <span>{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
