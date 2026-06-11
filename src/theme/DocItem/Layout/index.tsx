import React, { type ReactNode, useState, useCallback } from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import type { Props } from '@theme/DocItem/Layout';

export default function DocItemLayoutWrapper({ children }: Props): ReactNode {
  const { metadata } = useDoc();
  const source = metadata.source;
  const filename = source.replace(/^@site\/docs\//, '');
  const markdownUrl = `/markdown/${filename}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      const response = await fetch(markdownUrl);
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin markdown:', err);
    }
  }, [markdownUrl]);

  return (
    <>
      <div className="doc-markdown-toolbar">
        <a
          href={markdownUrl}
          download
          className="doc-markdown-btn doc-markdown-btn--download"
        >
          Download Markdown
        </a>
        <button
          onClick={handleCopy}
          className="doc-markdown-btn doc-markdown-btn--copy"
        >
          {copied ? 'Tersalin!' : 'Salin Markdown'}
        </button>
      </div>
      <DocItemLayout>{children}</DocItemLayout>
    </>
  );
}
