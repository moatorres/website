import { spawn } from 'child_process'
import { createWriteStream } from 'fs'

import { FileSystem } from '@effect/platform'
import { NodeFileSystem, NodeSink, NodeStream } from '@effect/platform-node'
import { Array, Cause, Effect, Stream } from 'effect'

const download = FileSystem.FileSystem.pipe(
  Stream.flatMap((fs) =>
    fs
      .stream('./in.mp3')
      .pipe(
        Stream.tap((chunk) =>
          Effect.log(`Downloaded chunk of size: ${chunk.byteLength}`)
        )
      )
  )
)

const upload = NodeSink.fromWritable(
  () => createWriteStream('./out1.mp3'),
  () => new Error()
)

const upload2 = NodeSink.fromWritable(
  () => createWriteStream('./out2.mp3'),
  () => new Error()
)

const program = Effect.all({
  download: Effect.succeed(download),
  uploads: Effect.succeed([
    [upload, ['-i', '-', '-ar', '44100', '-f', 'mp3', '-']],
    [upload2, ['-i', '-', '-ar', '44100', '-f', 'mp3', '-']],
  ] as const),
}).pipe(
  Effect.flatMap(({ download, uploads }) =>
    Effect.forEach(
      Array.flatMap(uploads, ([upload, args]) => {
        const child = spawn('ffmpeg', args, {
          stdio: ['pipe', 'pipe', 'pipe'],
        })
        const stdin = NodeSink.fromWritable(
          () => child.stdin,
          (cause) => new Cause.UnknownException(cause)
        )
        const stdout = NodeStream.fromReadable(
          () => child.stdout,
          (cause) => new Cause.UnknownException(cause)
        )
        return [Stream.tapSink(stdout, upload), Stream.tapSink(download, stdin)]
      }),
      Stream.runDrain,
      { concurrency: 'unbounded' }
    )
  )
)

Effect.runPromise(program.pipe(Effect.provide(NodeFileSystem.layer)))
