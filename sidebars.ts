import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Pendahuluan',
      collapsible: false,
      items: [
        {type: 'doc', id: 'overview', label: 'Overview'},
        {type: 'doc', id: 'persiapan', label: 'Persiapan'},
        {type: 'doc', id: 'android-worker', label: 'Android Worker'},
      ],
    },
    {
      type: 'category',
      label: 'Pembayaran',
      collapsible: false,
      items: [
        {type: 'doc', id: 'payment-account', label: 'Payment Account'},
        {type: 'doc', id: 'payment-create', label: 'Payment Create'},
        {type: 'doc', id: 'checkout', label: 'Checkout'},
        {type: 'doc', id: 'payment-detail', label: 'Payment Detail'},
        {type: 'doc', id: 'payment-list', label: 'Payment List'},
      ],
    },
    {
      type: 'category',
      label: 'Operasional',
      collapsible: false,
      items: [
        {type: 'doc', id: 'payment-cancel', label: 'Payment Cancel'},
        {type: 'doc', id: 'payment-match', label: 'Payment Match'},
        {type: 'doc', id: 'payment-mutations', label: 'Payment Mutations'},
        {type: 'doc', id: 'channel-instructions', label: 'Channel Instructions'},
      ],
    },
    {
      type: 'category',
      label: 'Integrasi',
      collapsible: false,
      items: [
        {type: 'doc', id: 'webhook', label: 'Webhook'},
        {type: 'doc', id: 'status-code', label: 'Status & Error Code'},
      ],
    },
  ],
};

export default sidebars;
