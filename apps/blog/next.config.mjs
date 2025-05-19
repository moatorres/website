// @ts-check
import { composePlugins, withNx } from '@nx/next'

import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import remarkSugarHigh from 'remark-sugar-high'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'

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
    ]
  },
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  nx: {
    svgr: false,
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  poweredByHeader: false,
  reactStrictMode: true,
  redirects: async function () {
    return [
      {
        source: '/journal/:path*',
        destination: '/blog/:path*',
        permanent: false,
      },
    ]
  },
  webpack: (config, { dev }) => {
    // resolve imports with extension names on dev mode (e.g. import ansi from "./ansi.js")
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    }
    // minify class names (does not apply to tailwindcss) (e.g. .my-class--active -> .xSrdL)
    config.module.rules.forEach((rule) => {
      if (!rule.oneOf) return
      rule.oneOf.forEach((oneOf) => {
        if (
          oneOf.test &&
          oneOf.test.toString().includes('\\.module\\.(css|scss|sass)$') &&
          oneOf.use
        ) {
          oneOf.use.forEach((loader) => {
            if (
              loader.loader &&
              loader.loader.includes('css-loader') &&
              !loader.loader.includes('postcss-loader')
            ) {
              loader.options = {
                ...loader.options,
                modules: {
                  ...loader.options.modules,
                  localIdentName: dev
                    ? '[name]__[local]__[hash:base64:5]'
                    : '[hash:base64:8]',
                },
              }
            }
          })
        }
      })
    })
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

const withPlugins = composePlugins(withNx, withMdx)

export default withPlugins(nextConfig)
