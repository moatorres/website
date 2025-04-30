/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

import { Data, Effect, Schedule } from 'effect'

export class WeatherAPIError extends Data.TaggedError('WeatherAPIError')<{
  cause?: unknown
}> {}

export class FetchError extends Data.TaggedError('FetchError')<{
  cause?: unknown
}> {}

const TEN_MINUTES_IN_SECONDS = 10 * 60

const FETCH_OPTIONS = {
  method: 'GET',
  next: { revalidate: TEN_MINUTES_IN_SECONDS },
}

function handleApiError(data: {
  error?: unknown
  current: { is_day: number; condition: { text: string }; temp_c: number }
}) {
  if (data.error) {
    return Effect.fail(
      new WeatherAPIError({ cause: new Error(JSON.stringify(data.error)) })
    )
  }
  return Effect.succeed(data)
}

function fetchWeather(url: string) {
  return Effect.tryPromise({
    try: () => fetch(url, FETCH_OPTIONS).then(async (res) => await res.json()),
    catch: (error) => new FetchError({ cause: error }),
  }).pipe(Effect.flatMap(handleApiError))
}

function getHour(timezone = 'America/Recife') {
  const now = new Date()

  // 00, 01, 02... to 23
  const hour = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: timezone,
  }).format(now)

  // 0, 1, 2... to 23
  return parseInt(hour, 10)
}

export async function getWeatherEmoji(
  city = 'Recife',
  timezone = 'America/Recife',
  apiKey = process.env.WEATHER_API_KEY
) {
  const currentHour = getHour(timezone)
  const fallback = currentHour >= 6 && currentHour < 18 ? '☀️' : '🌙'

  try {
    const data = await Effect.gen(function* () {
      return yield* fetchWeather(
        `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`
      ).pipe(
        Effect.retry(Schedule.jittered(Schedule.exponential('1 seconds'))),
        Effect.timeout('5 seconds')
      )
    }).pipe(Effect.runPromise)

    const isDay = Number(data.current.is_day) === 1

    const emoji = getWeatherEmojiFromCondition(
      data.current.condition.text,
      isDay
    )

    const temperature = data.current.temp_c

    return { emoji, temperature }
  } catch (error) {
    console.error('Error fetching weather data: ', error)
    return { emoji: fallback, temperature: undefined }
  }
}

export function getWeatherEmojiFromCondition(
  weatherCondition: string,
  isDay: boolean
) {
  const condition = weatherCondition.toLowerCase()
  const fallback = isDay ? '☀️' : '🌙'

  if (condition.includes('thunder')) {
    return '⛈️'
  } else if (condition.includes('drizzle')) {
    return '🌦️'
  } else if (condition.includes('rain')) {
    return '🌧️'
  } else if (condition.includes('snow')) {
    return '🌨️'
  } else if (condition.includes('mist') || condition.includes('fog')) {
    return '🌁'
  } else if (condition.includes('overcast')) {
    return '☁️'
  } else if (condition.includes('cloud')) {
    return isDay ? '⛅️' : '🌥️'
  } else if (condition.includes('clear')) {
    return isDay ? '☀️' : '🌙'
  }

  return fallback
}
