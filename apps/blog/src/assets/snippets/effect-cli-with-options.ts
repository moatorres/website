import { Command, Options } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Console, Effect } from 'effect'

const skip = Options.boolean('skip').pipe(
  Options.withAlias('s'),
  Options.withDescription('Skip prompts and use defaults')
)

const config = Options.text('config').pipe(
  Options.withAlias('c'),
  Options.withDefault('default.json'),
  Options.withDescription('Path to the JSON configuration file')
)

let count = 1

const init = Command.make('init', { skip, config }, ({ skip, config }) =>
  Effect.gen(function* () {
    yield* Console.log('run:', count++)
    yield* Console.log('-c', config)
    yield* Console.log('--skip', skip, '\n')
  })
)

const cli = Command.run(init, {
  name: 'my-cli',
  version: '1.0.0',
})

// tsx cli.ts --skip
cli(['', '', '--skip']).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)

// tsx cli.ts -c my-config.json
cli(['', '', '-c', 'my-config.json']).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)

// tsx cli.ts --help
cli(['', '', '--help']).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
