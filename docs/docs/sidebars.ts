import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '🏠 Introduction',
    },
    {
      type: 'category',
      label: '🚀 Getting Started',
      collapsed: false,
      items: [
        'getting-started/quick-start',
        'getting-started/installation',
        'getting-started/configuration',
      ],
    },
    {
      type: 'category',
      label: '🏗️ Architecture',
      items: [
        'architecture/overview', // Nota: este arquivo existe!
        'architecture/frontend',
        'architecture/backend',
        'architecture/database',
        'architecture/blockchain',
      ],
    },
    {
      type: 'category',
      label: '🔗 Smart Contracts',
      items: [
        'smart-contracts/overview',
        'smart-contracts/escrow',
        'smart-contracts/chainlink-integration',
        'smart-contracts/deployment',
      ],
    },
    {
      type: 'category',
      label: '📡 API Reference',
      items: [
        'api/overview',
        'api/projects',
        'api/workers',
        'api/authentication',
      ],
    },
    {
      type: 'category',
      label: '⚙️ Worker Node',
      items: [
        'worker-node/setup',
        'worker-node/configuration',
        'worker-node/job-execution',
      ],
    },
    {
      type: 'category',
      label: '🎯 For Judges',
      items: [
        'for-judges/problem-solution',
        'for-judges/tech-stack',
        'for-judges/demo-walkthrough',
        'for-judges/future-roadmap',
      ],
    },
    {
      type: 'doc',
      id: 'faq',
      label: '❓ FAQ',
    },
  ],
};

export default sidebars;