import React, { type ReactNode } from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';
import type { Props } from '@theme/DocItem/Layout';

export default function DocItemLayoutWrapper({ children }: Props): ReactNode {
  return (
    <DocItemLayout>{children}</DocItemLayout>
  );
}
