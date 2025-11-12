// @ts-check
import createMDX from '@next/mdx'
import { composePlugins } from '@nx/next'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkSugarHigh from 'remark-sugar-high'

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  cleanDistDir: true,
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED,
  },
  experimental: {
    viewTransition: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: `max-age=${ONE_YEAR_IN_SECONDS}; includeSubDomains; preload`,
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  poweredByHeader: false,
  reactStrictMode: true,
  redirects: async function () {
    return [
      {
        source: '/journal/:path*',
        destination: '/articles/:path*',
        permanent: false,
      },
      {
        source: '/blog/:path*',
        destination: '/articles/:path*',
        permanent: false,
      },
    ]
  },
  webpack: (config, { dev }) => {
    // resolve imports with extension names on dev mode (e.g. import ansi from "./ansi.js")
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
      '.jsx': ['.tsx', '.jsx'],
    }
    return config
  },
}

const withMdx = createMDX({
  extension: /\.(md|mdx)?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkSugarHigh],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: {
            className: ['decoration-[none]'],
          },
        },
      ],
    ],
  },
})

const withPlugins = composePlugins(withMdx)

export default withPlugins(nextConfig)
