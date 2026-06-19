import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

type LegalLink = {
  label: string;
  href: string;
};

export default function Footer(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const footer = siteConfig.themeConfig.footer as {
    copyright?: string;
    style?: string;
  };
  const {legalLinks = []} = siteConfig.customFields as {legalLinks?: LegalLink[]};

  return (
    <footer className={clsx('footer', footer.style === 'dark' && 'footer--dark')}>
      <div className="container container--fluid">
        {footer.copyright && (
          <div className="footer__copyright">{footer.copyright}</div>
        )}
        {legalLinks.length > 0 && (
          <div className="footer__legal-links">
            {legalLinks.map((item) => (
              <Link className="footer__link-item" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
