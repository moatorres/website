import { Effect, identity, Schedule } from 'effect'

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

function fetchWeather(url: string) {
  return Effect.tryPromise({
    try: () =>
      fetch(url, {
        method: 'GET',
        next: { revalidate: 600 },
      }).then(async (res) => await res.json()),
    catch: identity,
  }).pipe(
    Effect.flatMap((data) => {
      if (data.error) {
        return Effect.fail(
          new Error(`WeatherAPI error: ${JSON.stringify(data.error)}`)
        )
      }
      return Effect.succeed(data)
    })
  )
}

export async function getWeatherEmoji(
  city = 'Recife',
  timezone = 'America/Recife',
  apiKey = process.env.WEATHER_API_KEY
) {
  const currentHour = getHour(timezone)
  const fallback = currentHour >= 6 && currentHour < 18 ? '☀️' : '🌙'
  const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`

  try {
    const data = await Effect.gen(function* () {
      return yield* fetchWeather(url).pipe(
        Effect.retry(Schedule.jittered(Schedule.exponential('1 seconds'))),
        Effect.timeout('5 seconds')
      )
    }).pipe(Effect.runPromise)

    const isDay = data.current.is_day === 1

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
