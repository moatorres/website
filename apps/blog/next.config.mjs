/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { composePlugins, withNx } from '@nx/next'

import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  cleanDistDir: true,
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
  experimental: {
    viewTransition: true,
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
  pageExtensions: ['mdx', 'tsx'],
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
}

const withMdx = createMDX({
  extension: /\.(md|mdx)?$/,
  options: {
    remarkPlugins: [remarkGfm],
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
