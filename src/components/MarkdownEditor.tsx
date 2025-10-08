import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Bold, Italic, Link, List, Code, Eye, EyeOff, Type, Underline, Highlighter, Palette, Strikethrough } from 'lucide-react';
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

  // Function to convert rich text/HTML to markdown
  const convertRichTextToMarkdown = (html: string): string => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Function to process nodes recursively
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const children = Array.from(node.childNodes).map(processNode).join('');
        
        switch (tagName) {
          case 'h1':
            return `# ${children}\n\n`;
          case 'h2':
            return `## ${children}\n\n`;
          case 'h3':
            return `### ${children}\n\n`;
          case 'h4':
            return `#### ${children}\n\n`;
          case 'h5':
            return `##### ${children}\n\n`;
          case 'h6':
            return `###### ${children}\n\n`;
          case 'p':
            return `${children}\n\n`;
          case 'br':
            return '\n';
          case 'strong':
          case 'b':
            return `**${children}**`;
          case 'em':
          case 'i':
            return `*${children}*`;
          case 'u':
            return `<u>${children}</u>`;
          case 'mark':
            return `<mark>${children}</mark>`;
          case 'code':
            return `\`${children}\``;
          case 'pre':
            return `\`\`\`\n${children}\n\`\`\`\n\n`;
          case 'blockquote':
            return `> ${children}\n\n`;
          case 'ul':
            return `${children}\n`;
          case 'ol':
            return `${children}\n`;
          case 'li':
            const parent = element.parentElement;
            if (parent?.tagName.toLowerCase() === 'ol') {
              return `1. ${children}\n`;
            } else {
              return `- ${children}\n`;
            }
          case 'a':
            const href = element.getAttribute('href') || '';
            return `[${children}](${href})`;
          case 'img':
            const src = element.getAttribute('src') || '';
            const alt = element.getAttribute('alt') || '';
            return `![${alt}](${src})`;
          case 'hr':
            return '---\n\n';
          case 'span':
            // Handle colored text and other inline styles
            const style = element.getAttribute('style') || '';
            if (style.includes('color:')) {
              const colorMatch = style.match(/color:\s*([^;]+)/);
              if (colorMatch) {
                return `<span style="color: ${colorMatch[1]}">${children}</span>`;
              }
            }
            // Handle background color (highlighting)
            if (style.includes('background-color:') || style.includes('background:')) {
              const bgMatch = style.match(/(?:background-color|background):\s*([^;]+)/);
              if (bgMatch) {
                return `<mark style="background-color: ${bgMatch[1]}">${children}</mark>`;
              }
            }
            // Handle font size
            if (style.includes('font-size:')) {
              const sizeMatch = style.match(/font-size:\s*([^;]+)/);
              if (sizeMatch) {
                return `<span style="font-size: ${sizeMatch[1]}">${children}</span>`;
              }
            }
            // Handle font weight
            if (style.includes('font-weight:')) {
              const weightMatch = style.match(/font-weight:\s*([^;]+)/);
              if (weightMatch && (weightMatch[1] === 'bold' || parseInt(weightMatch[1]) >= 600)) {
                return `**${children}**`;
              }
            }
            // Handle font style
            if (style.includes('font-style:') && style.includes('italic')) {
              return `*${children}*`;
            }
            // Handle text decoration
            if (style.includes('text-decoration:')) {
              if (style.includes('underline')) {
                return `<u>${children}</u>`;
              }
              if (style.includes('line-through')) {
                return `~~${children}~~`;
              }
            }
            return children;
          case 'div':
            // Handle divs with line breaks
            return `${children}\n`;
          default:
            return children;
        }
      }
      
      return '';
    };
    
    // Process all child nodes
    const result = Array.from(tempDiv.childNodes).map(processNode).join('');
    
    // Clean up extra newlines and whitespace
    return result
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
      .replace(/^\n+|\n+$/g, '') // Remove leading/trailing newlines
      .trim();
  };

  // Handle paste events to convert rich text to markdown
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const plainTextData = clipboardData.getData('text/plain');
    
    // Get cursor position
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    let convertedText = '';
    
    if (htmlData) {
      // Convert HTML to markdown
      convertedText = convertRichTextToMarkdown(htmlData);
    } else if (plainTextData) {
      // If no HTML, use plain text but preserve line breaks
      convertedText = plainTextData
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n');   // Handle old Mac line endings
    }
    
    if (convertedText) {
      // Insert the converted text at cursor position
      const newValue = value.substring(0, start) + convertedText + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + convertedText.length, start + convertedText.length);
      }, 0);
    }
  };

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
    console.log('Inserting image markdown:', imageMarkdown);
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

  const insertHeading = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Convert selected text to heading
      const heading = `${'#'.repeat(level)} ${selectedText}`;
      const newValue = value.substring(0, start) + heading + value.substring(end);
      onChange(newValue);
    } else {
      insertAtCursor(`${'#'.repeat(level)} Heading ${level}`);
    }
  };

  const insertUnderline = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Wrap selected text with underline (using HTML since markdown doesn't have native underline)
      const underlined = `<u>${selectedText}</u>`;
      const newValue = value.substring(0, start) + underlined + value.substring(end);
      onChange(newValue);
    } else {
      insertAtCursor('<u>underlined text</u>');
    }
  };

  const insertHighlight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Wrap selected text with highlight (using HTML)
      const highlighted = `<mark>${selectedText}</mark>`;
      const newValue = value.substring(0, start) + highlighted + value.substring(end);
      onChange(newValue);
    } else {
      insertAtCursor('<mark>highlighted text</mark>');
    }
  };

  const insertStrikethrough = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Wrap selected text with strikethrough
      const strikethrough = `~~${selectedText}~~`;
      const newValue = value.substring(0, start) + strikethrough + value.substring(end);
      onChange(newValue);
    } else {
      insertAtCursor('~~strikethrough text~~');
    }
  };

  const insertColoredText = (color: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Wrap selected text with color (using HTML)
      const colored = `<span style="color: ${color}">${selectedText}</span>`;
      const newValue = value.substring(0, start) + colored + value.substring(end);
      onChange(newValue);
    } else {
      insertAtCursor(`<span style="color: ${color}">colored text</span>`);
    }
  };

  const removeColorFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Remove color formatting from selected text
      const uncolored = selectedText.replace(/<span style="color: [^"]+">(.*?)<\/span>/g, '$1');
      const newValue = value.substring(0, start) + uncolored + value.substring(end);
      onChange(newValue);
    }
  };

  const renderMarkdown = (markdown: string) => {
    // Simple markdown rendering for preview
    return markdown
      // Headings
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-coffee">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3 text-coffee">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-coffee">$1</h1>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      // Bold, Italic, and Strikethrough
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
      // HTML tags (underline, highlight, and colored text)
      .replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>')
      .replace(/<mark>(.*?)<\/mark>/g, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
      .replace(/<span style="color: ([^"]+)">(.*?)<\/span>/g, '<span style="color: $1">$2</span>')
      // Line breaks - preserve double line breaks as paragraphs, single line breaks as <br>
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      // Wrap in paragraph tags
      .replace(/^(.*)$/, '<p class="mb-4">$1</p>');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 p-2 border rounded-lg bg-muted/50 overflow-x-auto">
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
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertUnderline}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertHighlight}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertStrikethrough}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        {/* Color buttons */}
        <div className="flex items-center gap-1 border rounded px-2 py-1 bg-background">
          <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">Colors:</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertColoredText('#ef4444')}
            title="Red"
            className="w-6 h-6 p-0"
          >
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertColoredText('#f97316')}
            title="Orange"
            className="w-6 h-6 p-0"
          >
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertColoredText('#eab308')}
            title="Yellow"
            className="w-6 h-6 p-0"
          >
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertColoredText('#22c55e')}
            title="Green"
            className="w-6 h-6 p-0"
          >
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertColoredText('#3b82f6')}
            title="Blue"
            className="w-6 h-6 p-0"
          >
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertColoredText('#8b5cf6')}
            title="Purple"
            className="w-6 h-6 p-0"
          >
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertColoredText('#ec4899')}
            title="Pink"
            className="w-6 h-6 p-0"
          >
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertColoredText('#6b7280')}
            title="Gray"
            className="w-6 h-6 p-0"
          >
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertColoredText('#000000')}
            title="Black"
            className="w-6 h-6 p-0"
          >
            <div className="w-3 h-3 rounded-full bg-black"></div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const color = prompt('Enter a custom color (e.g., #ff0000, red, rgb(255,0,0)):');
              if (color) {
                insertColoredText(color);
              }
            }}
            title="Custom Color"
            className="w-6 h-6 p-0"
          >
            <Palette className="w-3 h-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeColorFormatting}
            title="Remove Color"
            className="w-6 h-6 p-0 text-muted-foreground"
          >
            <span className="text-xs">×</span>
          </Button>
        </div>
        
        <div className="w-px h-6 bg-border" />
        
        {/* Heading buttons */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(1)}
          title="Heading 1"
        >
          <Type className="h-4 w-4" />
          <span className="ml-1 text-xs">H1</span>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(2)}
          title="Heading 2"
        >
          <Type className="h-4 w-4" />
          <span className="ml-1 text-xs">H2</span>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(3)}
          title="Heading 3"
        >
          <Type className="h-4 w-4" />
          <span className="ml-1 text-xs">H3</span>
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
          onPaste={handlePaste}
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
