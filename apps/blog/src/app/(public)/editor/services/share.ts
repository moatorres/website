'use client'

import { Effect, Encoding, Schema } from 'effect'

import { Project } from './types'

/**
 * Share pipeline (in both directions):
 *
 *   Project <-Schema-> JSON <-deflate-raw-> bytes <-base64url-> ?code= param
 *
 * The Project schema is the unit of serialization, so a link carries the
 * complete workspace — files, run command, everything.
 */
const ProjectFromJson = Schema.parseJson(Project)

const compress = (content: string) =>
  Effect.promise(async () => {
    const stream = new Blob([content])
      .stream()
      .pipeThrough(new CompressionStream('deflate-raw'))
    return new Uint8Array(await new Response(stream).arrayBuffer())
  })

const decompress = (bytes: Uint8Array) =>
  Effect.promise(() => {
    const stream = new Blob([bytes as Uint8Array<ArrayBuffer>])
      .stream()
      .pipeThrough(new DecompressionStream('deflate-raw'))
    return new Response(stream).text()
  })

/** Encode a project into a compressed base64url share code */
export const encodeShareCode = (project: Project): Promise<string> =>
  Effect.runPromise(
    Schema.encode(ProjectFromJson)(project).pipe(
      Effect.flatMap(compress),
      Effect.map(Encoding.encodeBase64Url)
    )
  )

/** Decode a share code back into a schema-validated project */
export const decodeShareCode = (code: string): Promise<Project> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const bytes = yield* Encoding.decodeBase64Url(code)
      const json = yield* decompress(bytes)
      return yield* Schema.decode(ProjectFromJson)(json)
    })
  )
