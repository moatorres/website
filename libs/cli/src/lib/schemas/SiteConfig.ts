import { Schema } from 'effect'

export class SiteConfig extends Schema.Class<SiteConfig>('SiteConfig')({
  author: Schema.NonEmptyString.pipe(Schema.minLength(2)),
  baseUrl: Schema.URL,
  description: Schema.NonEmptyString.pipe(Schema.minLength(3)),
  title: Schema.NonEmptyString.pipe(Schema.minLength(2)),
}) {
  public static encode(folder: SiteConfig) {
    return Schema.encodeEither(SiteConfig)(folder)
  }

  public static decode(input: unknown) {
    return Schema.decodeUnknownEither(SiteConfig)(input)
  }

  public static fromJson(input: string) {
    return Schema.decodeEither(Schema.parseJson(SiteConfig))(input)
  }
}
