import { yellow } from '@blog/utils'
import { Command, Options, Prompt } from '@effect/cli'
import { FileSystem } from '@effect/platform'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Effect, Either, ParseResult } from 'effect'

import { BuildConfig } from '../schemas/BuildConfig.js'

export type InitArgs = {
  configFile: string
  contentDirectory: string
  contentRoute: string
  metadataDirectory: string
  photosDirectory: string
  snippetsRoute: string
  snippetsDirectory: string
  projectRoot: string
}

// ───── Helpers ─────────────────────────────────────────────

const nonEmpty = (field: string) =>
  field.trim().length > 0
    ? Effect.succeed(field)
    : Effect.fail('Field cannot be empty')

// ───── Prompts ─────────────────────────────────────────────

const configFile = Prompt.text({
  message: 'Path to your config file',
  default: 'info.json',
  validate: nonEmpty,
})

const contentDirectory = Prompt.text({
  message: 'Path to your content directory',
  default: 'src/content',
  validate: nonEmpty,
})

const contentRoute = Prompt.text({
  message: 'URL route to serve your content from',
  default: 'blog',
  validate: nonEmpty,
})

const metadataDirectory = Prompt.text({
  message: 'Path to your metadata directory',
  default: 'src/data',
  validate: nonEmpty,
})

const photosDirectory = Prompt.text({
  message: 'Path to your photos directory',
  default: 'public/images/photos',
  validate: nonEmpty,
})

const snippetsRoute = Prompt.text({
  message: 'URL route to serve your code snippets from',
  default: 'snippets',
  validate: nonEmpty,
})

const snippetsDirectory = Prompt.text({
  message: 'Path to your snippets directory',
  default: 'src/assets/snippets',
  validate: nonEmpty,
})

const projectRoot = Prompt.text({
  message: 'Path to your project root',
  default: '.',
  validate: nonEmpty,
})

const shouldOverwrite = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const exists = yield* fs.exists(path)
    if (exists) {
      yield* Prompt.confirm({
        message: `File ${yellow(path)} already exists. Overwrite?`,
      })
    }
    return true
  })

const prompts = Prompt.all({
  configFile, // TODO: Remove `configFile`
  contentDirectory,
  contentRoute,
  metadataDirectory,
  photosDirectory,
  snippetsRoute,
  snippetsDirectory,
  projectRoot,
})

// ───── Options ─────────────────────────────────────────────

export const skip = Options.boolean('skip').pipe(
  Options.withDescription('Skip all prompts and use defaults')
)

export const format = Options.text('format').pipe(
  Options.withDefault('json'),
  Options.withDescription('Output format: json (default) or yaml')
)

// ───── Command ─────────────────────────────────────────────

export const init = Command.prompt('init', prompts, (args) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const decoded = BuildConfig.decode(args)
    const encoded = BuildConfig.encode(decoded)

    const confirmed = yield* shouldOverwrite(decoded.configFile)

    if (Either.isLeft(encoded)) {
      yield* Effect.fail(
        ParseResult.ArrayFormatter.formatErrorSync(encoded.left)
      )
    } else if (confirmed) {
      yield* fs.writeFileString(
        decoded.configFile,
        JSON.stringify(encoded.right, null, 2)
      )
    }
  })
)

// ───── CLI ─────────────────────────────────────────────

const cli = Command.run(init, {
  name: 'blogx',
  version: '0.0.1',
})

export const runInit = Effect.suspend(() => cli(process.argv)).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
