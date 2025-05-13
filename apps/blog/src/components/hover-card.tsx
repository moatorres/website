/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import Image from 'next/image'
import Link from 'next/link'

interface HoverCardProps {
  title: string
  subtitle: string
  tag: string
  imageUrl: string
  linkUrl: string
}

export function HoverCard({
  title,
  subtitle,
  tag,
  imageUrl,
  linkUrl,
}: HoverCardProps) {
  return (
    <Link href={linkUrl} className="group w-fit">
      <span className="inline-block relative overflow-hidden rounded-lg shadow-lg transition-all duration-500 ease-in-out border-1 border-gray-200/50  cursor-pointer h-[340px] w-[280px]">
        {/* Background image div */}
        <div className="absolute inset-0 transition-all duration-500 ease-in-out">
          <Image
            src={imageUrl || '/placeholder.svg'}
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:scale-110 group-hover:blur-md opacity-0 blur-none"
          />
          {/* Darker overlay */}
          <div className="absolute inset-0 bg-black transition-opacity duration-500 ease-in-out group-hover:opacity-50 opacity-0" />
        </div>

        {/* Content div */}
        <div className="relative h-full flex flex-col justify-between p-8 transition-all duration-500 ease-in-out group-hover:bg-transparent bg-white">
          <h2 className="text-2xl font-bold transition-all duration-500 ease-in-out group-hover:text-white text-gray-800">
            {title}
          </h2>
          <div>
            <span className="inline-block py-1 text-xs font-semibold mb-2 transition-all duration-500 ease-in-out group-hover:text-white/75 text-black/75">
              {tag}
            </span>
            <h3 className="text-base mb-3 transition-all duration-500 ease-in-out group-hover:text-white text-gray-800">
              {subtitle}
            </h3>
            <span className="inline-block transition-all duration-500 ease-in-out text-sm group-hover:opacity-100 group-hover:translate-y-0 group-hover:text-white opacity-0 translate-y-4 text-gray-600">
              Read customer story →
            </span>
          </div>
        </div>
      </span>
    </Link>
  )
}
