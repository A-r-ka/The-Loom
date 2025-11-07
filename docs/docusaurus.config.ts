// @tws-check
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'The Loom',
  tagline: 'Decentralized GPU Compute Marketplace',
  favicon: 'img/favicon.ico',

  // URL do seu site (GitHub Pages ou domínio customizado)
  url: 'https://your-username.github.io',
  baseUrl: '/the-loom/', // Nome do repositório

  // GitHub pages deployment
  organizationName: 'your-username', // Seu GitHub username
  projectName: 'the-loom', // Nome do repo

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en'],
  },

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          routeBasePath: '/', // Docs na raiz
          editUrl: 'https://github.com/your-username/the-loom/tree/main/docs/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/your-username/the-loom/tree/main/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/the-loom-social-card.jpg',
    
    navbar: {
      title: 'The Loom',
      logo: {
        alt: 'The Loom Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/api',
          label: 'API Reference',
          position: 'left'
        },
        {
          to: '/smart-contracts',
          label: 'Smart Contracts',
          position: 'left'
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/your-username/the-loom',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://the-loom.vercel.app',
          label: 'Live Demo',
          position: 'right',
        },
      ],
    },
    
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/',
            },
            {
              label: 'Quick Start',
              to: '/getting-started/quick-start',
            },
            {
              label: 'Architecture',
              to: '/architecture/overview',
            },
          ],
        },
        {
          title: 'Sponsors',
          items: [
            {
              label: 'Chainlink',
              href: 'https://chain.link',
            },
            {
              label: 'Scroll',
              href: 'https://scroll.io',
            },
            {
              label: 'Ethereum Foundation',
              href: 'https://ethereum.org',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/your-username/the-loom',
            },
            {
              label: 'Demo',
              href: 'https://the-loom.vercel.app',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} The Loom Team. Built for ETHLatam Hackathon.`,
    },
    
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['solidity', 'python', 'bash', 'typescript', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;