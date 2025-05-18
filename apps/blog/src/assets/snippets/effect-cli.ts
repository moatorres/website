import { join } from 'path'

import { Command, Options } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Console, Effect, Option, pipe } from 'effect'

const file = Options.text('file').pipe(
  Options.withAlias('f'),
  Options.withDefault('./config.json'),
  Options.withDescription('Path to the configuration file')
)

const content = Options.text('content').pipe(
  Options.optional, // this makes it an Option
  Options.withAlias('c'),
  Options.withDefault(Option.some('src/content')),
  Options.withDescription('Path to the content directory')
)

const blogx = Command.make('blogx', { file, content }, (o) => {
  // these will be printed
  console.log('Config', `"${o.file}"`)

  // this will not be printed
  Console.log('Add .pipe(NodeRuntime.runMain) to print this.')

  // example using pipe
  pipe(
    Effect.succeed(o.content),
    Effect.map((content) => {
      if (Option.isNone(content)) {
        return console.warn('No content directory, skipping.')
      }
      return console.log(`${join(process.cwd(), content.toString())}`)
    }),
    Effect.catchAll((e) => {
      console.error('Error:', e)
      return Effect.succeed(0)
    })
  )

  // example using option match
  Option.match(o.content, {
    onNone: () =>
      Effect.succeed(console.warn('No content directory, skipping.')),
    onSome: (dir) => Effect.succeed(console.log(`${join(process.cwd(), dir)}`)),
  }).pipe(NodeRuntime.runMain)

  // example using generator
  Effect.gen(function* () {
    yield* Effect.succeed(
      Option.isNone(o.content)
        ? console.log('Content OK ✅')
        : console.warn('Content FAIL ❌')
    )

    // throws 💥
    // yield* Effect.fail(new Error('Effect.fail works like a throw here'))

    // this would not be executed
    yield* Console.log('I would never run if the previous effect had failed')
  }).pipe(NodeRuntime.runMain)

  // this would never execute
  console.error("The previous failure would bubble up, I'd never be printed")

  // we could exit with a failure
  return Effect.exit(Effect.succeed(0))
})

// cli program
const cli = Command.run(blogx, {
  name: 'blogx cli',
  version: 'v0.0.1',
})

// tsx effect-cli.ts -f src/info.json -c src/content
export default cli(process.argv).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
