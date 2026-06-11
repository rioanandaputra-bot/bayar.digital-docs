declare module '@theme-original/DocItem/Layout' {
  import type { ReactNode } from 'react';

  export interface Props {
    readonly children: ReactNode;
  }

  export default function DocItemLayout(props: Props): ReactNode;
}
