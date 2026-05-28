'use client';

import { useState } from 'react';
import { ImagePreviewModal } from '@/components/custom/ImagePreviewModal';

interface StaticContentProps {
  content: string;
  className?: string;
}

const editorStyles = `
  .static-ed-shell {
    background: #ffffff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    position: relative;
  }

  .static-ed-body {
    display: flex;
    flex: 1;
  }

  .static-ed-content-wrap {
    flex: 1;
  }

  .static-editor {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    font-size: 15px !important;
    line-height: 1.75 !important;
    color: #111827;
    box-sizing: border-box;
    padding: 5px 0;
  }

  .static-editor * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    line-height: 1.75 !important;
  }

  .static-editor p {
    margin: 0 0 0.7em 0 !important;
    font-size: 15px !important;
    line-height: 1.75 !important;
  }

  .static-editor h1 {
    font-size: 1.7em !important;
    font-weight: 700 !important;
    margin: 0.6em 0 0.35em 0 !important;
    letter-spacing: -0.02em;
    color: #0f172a;
    line-height: 1.3 !important;
  }

  .static-editor h2 {
    font-size: 1.35em !important;
    font-weight: 700 !important;
    margin: 0.55em 0 0.3em 0 !important;
    color: #0f172a;
    line-height: 1.35 !important;
  }

  .static-editor h3 {
    font-size: 1.1em !important;
    font-weight: 700 !important;
    margin: 0.5em 0 0.25em 0 !important;
    color: #0f172a;
    line-height: 1.4 !important;
  }

  .static-editor b,
  .static-editor strong {
    font-weight: 700 !important;
  }

  .static-editor blockquote {
    border-left: 3px solid #6366f1;
    padding: 0.5em 1.1em;
    margin: 0.85em 0 !important;
    color: #6b7280;
    font-style: italic;
    background: #f5f5ff;
    border-radius: 0 6px 6px 0;
    line-height: 1.75 !important;
  }

  .static-editor code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
    font-size: 0.8em;
    background: #f3f4f6;
    border: 0.5px solid #e5e7eb;
    padding: 0.15em 0.4em;
    border-radius: 4px;
    color: #4338ca;
    line-height: 1.75 !important;
  }

  .static-editor sup { font-size: 0.75em; vertical-align: super; line-height: 0 !important; }
  .static-editor sub { font-size: 0.75em; vertical-align: sub; line-height: 0 !important; }

  .static-editor .ed-code-block {
    background: #1e1e2e;
    border: none;
    border-radius: 10px;
    padding: 0;
    margin: 1em 0;
    overflow: hidden;
    font-size: 0;
    line-height: normal !important;
  }

  .static-editor .ed-code-lang-badge {
    display: block;
    background: rgba(255,255,255,0.07);
    color: #636da6;
    font-size: 10px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
    padding: 4px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 1.6 !important;
  }

  .static-editor .ed-code-block code {
    display: block;
    background: none;
    border: none;
    padding: 1em 1.25em;
    font-size: 13px;
    line-height: 1.7 !important;
    color: #d4d4d4;
    overflow-x: auto;
    white-space: pre;
    font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
  }

  .static-editor a { 
    color: #2563eb !important; 
    text-decoration: underline !important; 
    text-decoration-color: #2563eb !important;
    text-decoration-thickness: 1px !important;
    background: rgba(37, 99, 235, 0.08) !important; 
    padding: 1px 3px !important;
    border-radius: 3px !important;
    cursor: pointer !important;
    transition: all 0.15s !important;
  }

  .static-editor a:hover { 
    color: #1d4ed8 !important; 
    text-decoration-color: #1d4ed8 !important;
    background: rgba(37, 99, 235, 0.15) !important;
  }

  .static-editor a[href^="mailto:"] { 
    color: #2563eb !important; 
  }

  /* Math inline styling */
  .static-editor .math-inline {
    display: inline-block;
    vertical-align: middle;
    margin: 0 2px;
  }

  .static-editor .math-inline math-field {
    font-size: 15px !important;
  }

  .static-editor ul { margin: 0.5em 0 0.5em 1.6em !important; }
  .static-editor ol { margin: 0.5em 0 0.5em 1.6em !important; }
  .static-editor li { margin: 0.2em 0 !important; line-height: 1.75 !important; }

  .static-editor ::selection { background: rgba(99,102,241,0.15); }

  /* Table */
  .static-editor table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 13px;
    table-layout: fixed;
  }

  .static-editor th,
  .static-editor td {
    border: 1px solid #d1d5db;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
    background: #ffffff;
  }

  .static-editor th {
    background: #f1f5f9;
    font-weight: 600;
    color: #374151;
  }

  .static-editor tr:hover td {
    background: #f9fafb;
  }

  /* Images */
  .static-editor img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1em 0;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .static-editor img:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export default function StaticContent({ content, className }: StaticContentProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      setPreviewImage(img.src);
      setIsPreviewOpen(true);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewImage(null);
  };

  return (
    <>
      <style jsx global>{editorStyles}</style>
      <div
        className={`static-editor${className ? ` ${className}` : ''}`}
        dangerouslySetInnerHTML={{ __html: content }}
        onClick={handleClick}
      />

      <ImagePreviewModal
        src={previewImage}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </>
  );
}
