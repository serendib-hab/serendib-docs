import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/',
  title: "Serendib HAB Ground Station",
  description: "High-Altitude Balloon Ground Station & Cloud Architecture Documentation",
  cleanUrls: true,
  srcExclude: ['README.md'],
      head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' }]
  ],
  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token.info.trim() === 'mermaid') {
          const encoded = encodeURIComponent(token.content)
          return `<Mermaid graph="${encoded}" />`
        }
        return defaultFence(tokens, idx, options, env, self)
      }
    }
  },
  themeConfig: {
    logo: '/serendib-logo.png',
    siteTitle: false,
    outline: {
      level: [2, 3],
      label: 'Table of Contents'
    },
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'System Guide',
        items: [
          { text: '1. Mission Overview & Flight Profile', link: '/guide/overview' },
          { text: '2. End-to-End System Architecture', link: '/guide/architecture-overview' },
          { text: '3. System Vocabulary & Glossary', link: '/guide/glossary' }
        ],
        activeMatch: '^/guide/'
      },
      {
        text: 'Local Ground Station',
        items: [
          { text: '4. Pipeline Overview & State Machine', link: '/local-station/' },
          { text: '5. Radio Ingestion & LoRa Framing', link: '/local-station/radio-ingest' },
          { text: '6. Storage Engine (SQLite WAL)', link: '/local-station/storage-engine' },
          { text: '7. Trajectory Prediction & Wind Models', link: '/local-station/processing-prediction' },
          { text: '8. Command Safety & Interlocks', link: '/local-station/command-safety' },
          { text: '9. Operator Interfaces (TUI & Web)', link: '/local-station/user-interfaces' }
        ],
        activeMatch: '^/local-station/'
      },
      {
        text: 'Cloud Platform',
        items: [
          { text: '10. Cloud Architecture Overview', link: '/cloud-platform/' },
          { text: '11. Station Synchronization Protocol', link: '/cloud-platform/station-sync' },
          { text: '12. NATS JetStream Message Broker', link: '/cloud-platform/message-broker' },
          { text: '13. Multi-Station Consensus & Reconciliation', link: '/cloud-platform/reconciliation' },
          { text: '14. Downstream Services & Telegram Bot', link: '/cloud-platform/downstream-services' }
        ],
        activeMatch: '^/cloud-platform/'
      },
      {
        text: 'Specifications',
        items: [
          { text: '15. Binary Telemetry Packet Format', link: '/specs/telemetry-packet-format' },
          { text: '16. Relational Database Schema & DDL', link: '/specs/database-schema' }
        ],
        activeMatch: '^/specs/'
      },
      { text: 'Glossary', link: '/guide/glossary', activeMatch: '^/guide/glossary' }
    ],
    sidebar: [
      {
        text: 'Part I: Architecture & Foundations',
        collapsed: false,
        items: [
          { text: '1. Mission Overview & Flight Profile', link: '/guide/overview' },
          { text: '2. End-to-End System Architecture', link: '/guide/architecture-overview' },
          { text: '3. System Vocabulary & Glossary', link: '/guide/glossary' }
        ]
      },
      {
        text: 'Part II: Local Ground Station (Edge Tier)',
        collapsed: false,
        items: [
          { text: '4. Pipeline Overview & State Machine', link: '/local-station/' },
          { text: '5. Radio Ingestion & Hardware Framing', link: '/local-station/radio-ingest' },
          { text: '6. Storage Engine (SQLite WAL)', link: '/local-station/storage-engine' },
          { text: '7. Trajectory Prediction & Wind Models', link: '/local-station/processing-prediction' },
          { text: '8. Command Safety & Interlocks', link: '/local-station/command-safety' },
          { text: '9. Operator Interfaces (TUI & Web Map)', link: '/local-station/user-interfaces' }
        ]
      },
      {
        text: 'Part III: Cloud Platform (NATS JetStream Tier)',
        collapsed: false,
        items: [
          { text: '10. Cloud Subsystem Architecture', link: '/cloud-platform/' },
          { text: '11. Station Synchronization Protocol', link: '/cloud-platform/station-sync' },
          { text: '12. NATS JetStream Message Broker', link: '/cloud-platform/message-broker' },
          { text: '13. Multi-Station Consensus & Reconciliation', link: '/cloud-platform/reconciliation' },
          { text: '14. Downstream Services & Telegram Bot', link: '/cloud-platform/downstream-services' }
        ]
      },
      {
        text: 'Part IV: Hardware & Data Specifications',
        collapsed: false,
        items: [
          { text: '15. Binary Telemetry Packet Format', link: '/specs/telemetry-packet-format' },
          { text: '16. Relational Database Schema & DDL', link: '/specs/database-schema' }
        ]
      }
    ],
    docFooter: {
      prev: 'Previous Chapter',
      next: 'Next Chapter'
    },
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Serendib HAB Ground Station Engineering Platform',
      copyright: 'Copyright © Serendib'
    }
  }
})
