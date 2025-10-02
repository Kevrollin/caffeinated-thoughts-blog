import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Bold, Italic, Link, List, Code, Eye, EyeOff } from 'lucide-react';
import { StockImagePicker } from './StockImagePicker';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = "Write your content in Markdown...", 
  rows = 15,
  className = ""
}: MarkdownEditorProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleImageSelect = (imageUrl: string, altText: string) => {
    const imageMarkdown = `![${altText}](${imageUrl})`;
    insertAtCursor(imageMarkdown);
  };

  const formatText = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Wrap selected text
      const newText = `${prefix}${selectedText}${suffix}`;
      const newValue = value.substring(0, start) + newText + value.substring(end);
      onChange(newValue);
      
      // Select the wrapped text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      }, 0);
    } else {
      // Insert at cursor
      insertAtCursor(`${prefix}${suffix}`);
    }
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      const linkMarkdown = `[${selectedText}](url)`;
      const newValue = value.substring(0, start) + linkMarkdown + value.substring(end);
      onChange(newValue);
      
      // Select the URL part
      setTimeout(() => {
        textarea.focus();
        const urlStart = start + selectedText.length + 3; // After "[text]("
        textarea.setSelectionRange(urlStart, urlStart + 3); // Select "url"
      }, 0);
    } else {
      insertAtCursor('[link text](url)');
    }
  };

  const insertList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Convert selected text to list items
      const lines = selectedText.split('\n');
      const listItems = lines.map(line => line.trim() ? `- ${line.trim()}` : '').join('\n');
      const newValue = value.substring(0, start) + listItems + value.substring(end);
      onChange(newValue);
    } else {
      insertAtCursor('- List item');
    }
  };

  const insertCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Wrap selected text in code block
      const codeBlock = `\`\`\`\n${selectedText}\n\`\`\``;
      const newValue = value.substring(0, start) + codeBlock + value.substring(end);
      onChange(newValue);
    } else {
      insertAtCursor('```\ncode here\n```');
    }
  };

  const renderMarkdown = (markdown: string) => {
    // Simple markdown rendering for preview
    return markdown
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImagePicker(true)}
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('**', '**')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('*', '*')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('`', '`')}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertList}
          title="Insert List"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertCodeBlock}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border ml-auto" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          title={showPreview ? "Edit" : "Preview"}
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {/* Editor/Preview */}
      {showPreview ? (
        <div 
          className="min-h-[400px] p-4 border rounded-lg bg-muted/50 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="font-mono"
        />
      )}

      {/* Stock Image Picker */}
      <StockImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelect={handleImageSelect}
      />
    </div>
  );
};
