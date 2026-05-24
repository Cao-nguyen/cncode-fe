'use client';

interface StaticContentProps {
    content: string;
    className?: string;
}

const editorStyles = `
  .ed-shell {
    background: #ffffff;
    border: 0.5px solid #d1d5db;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    position: relative;
  }

  .ed-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .ed-content-wrap {
    flex: 1;
    overflow-y: auto;
  }

  #editor {
    padding: 1.5rem 2.25rem;
    font-size: 16px;
    line-height: 1.8;
    color: #111827;
    min-height: 100%;
    box-sizing: border-box;
  }

  #editor p { margin-bottom: 0.9em; }

  #editor h1 {
    font-size: 1.85em;
    font-weight: 700;
    margin-bottom: 0.5em;
    letter-spacing: -0.02em;
    color: #0f172a;
  }

  #editor h2 {
    font-size: 1.4em;
    font-weight: 600;
    margin-bottom: 0.4em;
    color: #0f172a;
  }

  #editor h3 {
    font-size: 1.15em;
    font-weight: 600;
    margin-bottom: 0.35em;
    color: #0f172a;
  }

  #editor blockquote {
    border-left: 3px solid #6366f1;
    padding: 0.5em 1.1em;
    margin: 0.85em 0;
    color: #6b7280;
    font-style: italic;
    background: #f5f5ff;
    border-radius: 0 6px 6px 0;
  }

  #editor code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.85em;
    padding: 0.15em 0.4em;
    border-radius: 4px;
    color: #4338ca;
  }

  #editor pre {
    background: #1e1e2e;
    color: #d4d4d4;
    padding: 1em 1.25em;
    border-radius: 10px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.7;
  }

  #editor a {
    color: #6366f1;
    text-decoration: underline;
    text-decoration-color: rgba(99,102,241,0.4);
  }

  #editor ul { margin: 0.5em 0 0.5em 1.6em; }
  #editor ol { margin: 0.5em 0 0.5em 1.6em; }
  #editor li { margin: 0.25em 0; }

  /* ===== EXCEL TABLE STYLE ===== */
  #editor table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 0.95em;
    border: 1px solid #d1d5db;
  }

  #editor th,
  #editor td {
    border: 1px solid #d1d5db;
    padding: 10px 12px;
    text-align: left;
    vertical-align: top;
    background: #ffffff;
  }

  #editor th {
    background: #f3f4f6;
    font-weight: 600;
    color: #111827;
  }

  #editor tr:hover td {
    background: #f9fafb;
  }

  #editor ::selection {
    background: rgba(99,102,241,0.15);
  }

  .table-placeholder {
    display: block;
    margin: 0.85em 0;
  }
`;

export default function StaticContent({
    content,
}: StaticContentProps) {
    return (
        <>
            <style jsx global>{editorStyles}</style>


            <div className="ed-body">
                <div className="ed-content-wrap">
                    <div
                        id="editor"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </>
    );
}