import { ImageResponse } from 'next/og'

async function loadAssets(): Promise<
  { name: string; data: Buffer; weight: 400 | 500 | 600; style: 'normal' }[]
> {
  const [
    { base64Font: medium },
    { base64Font: normalText },
    { base64Font: semibold },
    { base64Font: semiboldText },
  ] = await Promise.all([
    import('./WFVisualSans-Medium.json').then((mod) => mod.default),
    import('./WFVisualSans-RegularText.json').then((mod) => mod.default),
    import('./WFVisualSans-SemiBold.json').then((mod) => mod.default),
    import('./WFVisualSans-SemiBoldText.json').then((mod) => mod.default),
  ])

  return [
    {
      name: 'WF Visual Sans',
      data: Buffer.from(normalText, 'base64'),
      weight: 400 as const,
      style: 'normal' as const,
    },
    {
      name: 'WF Visual Sans',
      data: Buffer.from(medium, 'base64'),
      weight: 500 as const,
      style: 'normal' as const,
    },
    {
      name: 'WF Visual Sans',
      data: Buffer.from(semibold, 'base64'),
      weight: 600 as const,
      style: 'normal' as const,
    },
    {
      name: 'WF Visual Sans',
      data: Buffer.from(semiboldText, 'base64'),
      weight: 600 as const,
      style: 'normal' as const,
    },
  ]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const description = searchParams.get('description')
  const frame = searchParams.get('frame') === '1' ? true : false

  const [fonts] = await Promise.all([loadAssets()])

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full bg-black text-white"
        style={{
          fontFamily: 'WF Visual Sans',
        }}
      >
        {frame && (
          <div tw="flex border absolute border-zinc-700 border-dashed inset-y-0 left-16 w-[1px]" />
        )}
        {frame && (
          <div tw="flex border absolute border-zinc-700 border-dashed inset-y-0 right-16 w-[1px]" />
        )}
        {frame && (
          <div tw="flex border absolute border-zinc-700 inset-x-0 h-[1px] top-16" />
        )}
        {frame && (
          <div tw="flex border absolute border-zinc-700 inset-x-0 h-[1px] bottom-16" />
        )}
        <div tw="flex absolute flex-row bottom-24 right-24 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={48}
            height={48}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m18 16 4-4-4-4" />
            <path d="m6 8-4 4 4 4" />
            <path d="m14.5 4-5 16" />
          </svg>
        </div>
        <div tw="flex flex-col absolute w-[896px] justify-center inset-32">
          <div
            tw="tracking-tight flex-grow-1 flex flex-col justify-center leading-[1.1]"
            style={{
              textWrap: 'balance',
              fontWeight: 600,
              fontSize: title && title.length > 20 ? 64 : 80,
              letterSpacing: '-0.04em',
            }}
          >
            {title}
          </div>
          <div
            tw="text-[40px] leading-[1.5] flex-grow-1 text-zinc-300"
            style={{
              textWrap: 'balance',
              fontWeight: 400,
              fontSize: description && description.length > 70 ? 32 : 48,
            }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 628,
      fonts,
    }
  )
}
