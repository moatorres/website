import { Schema } from 'effect'

const Theme = Schema.Literal('default')

const Section = Schema.Struct({ name: Schema.NonEmptyTrimmedString })

const Sections = Schema.transform(Schema.String, Schema.Array(Section), {
  strict: true,
  decode: (sections) =>
    sections
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name })),
  encode: (sections) => sections.map((s) => s.name).join(','),
})

export class MetaConfig extends Schema.Class<MetaConfig>('MetaConfig')({
  theme: Theme,
  sections: Sections,
}) {
  public static decode(input: unknown) {
    return Schema.decodeUnknownEither(MetaConfig)(input)
  }

  public static encode(folder: MetaConfig) {
    return Schema.encodeEither(MetaConfig)(folder)
  }

  public static fromJson(input: string) {
    return Schema.decodeEither(Schema.parseJson(MetaConfig))(input)
  }

  public static toJson(input: MetaConfig) {
    return JSON.stringify(MetaConfig.encode(input))
  }
}
