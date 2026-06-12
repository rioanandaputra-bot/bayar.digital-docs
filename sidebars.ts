import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {type: 'doc', id: 'overview', label: 'Overview'},
    {type: 'doc', id: 'quickstart', label: 'Quickstart'},
    {type: 'doc', id: 'authentication', label: 'Authentication'},
    {type: 'doc', id: 'android-worker', label: 'Android Worker'},
    {type: 'doc', id: 'payment-account', label: 'Payment Account'},
    {type: 'doc', id: 'payment-create', label: 'Payment Create'},
    {type: 'doc', id: 'checkout', label: 'Checkout'},
    {type: 'doc', id: 'webhook', label: 'Webhook'},
    {type: 'doc', id: 'payment-get', label: 'Payment Get'},
    {type: 'doc', id: 'payment-cancel', label: 'Payment Cancel'},
    {type: 'doc', id: 'status-code', label: 'Status & Error Code'},
    {type: 'doc', id: 'error-handling', label: 'Error Handling'},
  ],
};

export default sidebars;
