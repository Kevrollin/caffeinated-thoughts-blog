// Markdown rendering utilities

export const markdownStyles = `
  /* Enhanced markdown styles for better formatting */
  .prose {
    /* Line break preservation */
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  
  /* Headings */
  .prose h1 {
    @apply text-2xl font-bold mt-6 mb-4 text-coffee;
  }
  
  .prose h2 {
    @apply text-xl font-semibold mt-6 mb-3 text-coffee;
  }
  
  .prose h3 {
    @apply text-lg font-semibold mt-6 mb-3 text-coffee;
  }
  
  /* Paragraphs with proper spacing */
  .prose p {
    @apply mb-4 leading-relaxed;
  }
  
  /* Preserve line breaks */
  .prose br {
    display: block;
    margin: 0.5em 0;
    content: "";
  }
  
  /* Enhanced formatting */
  .prose u {
    @apply underline decoration-2;
  }
  
  .prose mark {
    @apply bg-yellow-200 dark:bg-yellow-800 px-1 rounded;
  }
  
  /* Code styling */
  .prose code {
    @apply bg-muted px-1 py-0.5 rounded text-sm font-mono;
  }
  
  .prose pre {
    @apply bg-muted p-4 rounded-lg overflow-x-auto my-4;
  }
  
  .prose pre code {
    @apply bg-transparent p-0;
  }
  
  /* Lists */
  .prose ul {
    @apply ml-4 mb-4;
  }
  
  .prose li {
    @apply mb-1;
  }
  
  /* Links */
  .prose a {
    @apply text-primary hover:underline;
  }
  
  /* Images */
  .prose img {
    @apply max-w-full h-auto rounded-lg my-4;
  }
  
  /* Blockquotes */
  .prose blockquote {
    @apply border-l-4 border-coffee/30 pl-4 italic my-4;
  }
`;

// Custom markdown components for ReactMarkdown
export const markdownComponents = {
  // Preserve line breaks in paragraphs
  p: ({ children, ...props }: any) => {
    return (
      <p className="mb-4 leading-relaxed" {...props}>
        {children}
      </p>
    );
  },
  
  // Enhanced headings
  h1: ({ children, ...props }: any) => (
    <h1 className="text-2xl font-bold mt-6 mb-4 text-coffee" {...props}>
      {children}
    </h1>
  ),
  
  h2: ({ children, ...props }: any) => (
    <h2 className="text-xl font-semibold mt-6 mb-3 text-coffee" {...props}>
      {children}
    </h2>
  ),
  
  h3: ({ children, ...props }: any) => (
    <h3 className="text-lg font-semibold mt-6 mb-3 text-coffee" {...props}>
      {children}
    </h3>
  ),
  
  // Enhanced formatting
  u: ({ children, ...props }: any) => (
    <u className="underline decoration-2" {...props}>
      {children}
    </u>
  ),
  
  mark: ({ children, ...props }: any) => (
    <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded" {...props}>
      {children}
    </mark>
  ),
  
  // Strikethrough
  del: ({ children, ...props }: any) => (
    <del className="line-through text-muted-foreground" {...props}>
      {children}
    </del>
  ),
  
  // Colored text
  span: ({ children, style, ...props }: any) => {
    if (style?.color) {
      return (
        <span style={{ color: style.color }} {...props}>
          {children}
        </span>
      );
    }
    return <span {...props}>{children}</span>;
  },
  
  // Code styling
  code: ({ children, className, ...props }: any) => {
    const isInline = !className?.includes('language-');
    if (isInline) {
      return (
        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="bg-transparent p-0" {...props}>
        {children}
      </code>
    );
  },
  
  pre: ({ children, ...props }: any) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props}>
      {children}
    </pre>
  ),
  
  // Images
  img: ({ src, alt, ...props }: any) => (
    <img 
      src={src} 
      alt={alt} 
      className="max-w-full h-auto rounded-lg my-4" 
      {...props} 
    />
  ),
  
  // Lists
  ul: ({ children, ...props }: any) => (
    <ul className="ml-4 mb-4" {...props}>
      {children}
    </ul>
  ),
  
  li: ({ children, ...props }: any) => (
    <li className="mb-1" {...props}>
      {children}
    </li>
  ),
  
  // Links
  a: ({ href, children, ...props }: any) => (
    <a 
      href={href} 
      className="text-primary hover:underline" 
      target="_blank" 
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  
  // Blockquotes
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-coffee/30 pl-4 italic my-4" {...props}>
      {children}
    </blockquote>
  ),
};
