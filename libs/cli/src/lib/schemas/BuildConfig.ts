import { join, resolve } from 'path'

import { Schema } from 'effect'

const cwd = (path = '') => resolve(process.cwd(), path.trim())

const fallback = <T>(fallback: T) => ({ default: () => fallback })

const optional = (fallback: string) =>
  Schema.optionalWith(AbsolutePath, {
    default: () => cwd(fallback),
  }).annotations({ default: fallback })

const AbsolutePath = Schema.transform(
  Schema.NonEmptyTrimmedString.pipe(Schema.minLength(1)),
  Schema.NonEmptyTrimmedString.pipe(Schema.minLength(5)),
  {
    strict: true,
    decode: (path) => cwd(path),
    encode: (path) => path.replace(cwd(), '').slice(1) || '.',
  }
).annotations({
  title: 'AbsolutePath',
  description: 'Absolute path resolved from the command working directory.',
  examples: ['/usr/johndoe/dev/website/info.json'],
})

const ConfigFile = optional('info.json').annotations({
  title: 'ConfigFile',
  description: 'Relative path to the JSON configuration file.',
  examples: ['config.json', 'app/info.json', 'apps/website/blog.json'],
})

const ContentDirectory = optional('src/content').annotations({
  title: 'ContentDirectory',
  description: 'Relative path to the directory with MDX content files.',
  examples: ['content', 'src/content', 'public/content', 'apps/site/content'],
})

const ContentRoute = Schema.optionalWith(
  Schema.NonEmptyString,
  fallback('blog')
).annotations({
  title: 'ContentRoute',
  description:
    'URL path from where content collections are served. This will form the href of each content file. E.g. https://example.com/<ContentRoute>/science/my-article.',
  examples: ['posts', 'blog/posts'],
})

const MetadataDirectory = Schema.optionalWith(AbsolutePath, {
  default: () => cwd('src/data'),
}).annotations({
  title: 'MetadataDirectory',
  description:
    'Absolute path to directory where JSON metadata files are located.',
  examples: ['src/data', 'apps/site/src/data'],
})

const PhotosDirectory = Schema.optionalWith(AbsolutePath, {
  default: () => cwd('public/images/photos'),
}).annotations({
  title: 'PhotosDirectory',
  description: 'Absolute path to the directory containing photo assets.',
  examples: ['public/images/photos', 'assets/photos'],
})

const SnippetsRoute = Schema.optionalWith(Schema.NonEmptyString, {
  default: () => 'snippets',
}).annotations({
  title: 'SnippetsRoute',
  description: 'URL path from where code snippets are served.',
  examples: ['snippets', 'docs/snippets'],
})

const SnippetsDirectory = Schema.optionalWith(AbsolutePath, {
  default: () => cwd('src/assets/snippets'),
}).annotations({
  title: 'SnippetsDirectory',
  description: 'Absolute path to the directory containing code snippet files.',
  examples: ['src/assets/snippets', 'data/snippets'],
})

const ProjectRoot = Schema.optionalWith(AbsolutePath, {
  default: () => join(process.cwd()),
}).annotations({
  title: 'ProjectRoot',
  description:
    'Root directory of the project, typically where package.json is located.',
  examples: ['/home/user/dev/my-project'],
})

export class BuildConfig extends Schema.Class<BuildConfig>('BuildConfig')({
  configFile: ConfigFile,
  contentDirectory: ContentDirectory,
  contentRoute: ContentRoute,
  metadataDirectory: MetadataDirectory,
  photosDirectory: PhotosDirectory,
  snippetsRoute: SnippetsRoute,
  snippetsDirectory: SnippetsDirectory,
  projectRoot: ProjectRoot,
}) {
  public static encode(folder: BuildConfig) {
    return Schema.encodeEither(BuildConfig)(folder)
  }

  public static decode(input: unknown) {
    return Schema.decodeUnknownSync(BuildConfig, { errors: 'all' })(input)
  }

  public static fromJson(input: string) {
    return Schema.decode(Schema.parseJson(BuildConfig))(input)
  }
}
