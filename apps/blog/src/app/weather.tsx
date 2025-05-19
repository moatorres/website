import { getWeatherEmoji } from '@/lib/weather'

export async function Weather() {
  const { emoji, temperature } = await getWeatherEmoji()
  return (
    <>
      <sup className="text-xs font-mono">
        {temperature && `${Math.round(temperature)}°C`}{' '}
      </sup>
      {emoji}
    </>
  )
}
