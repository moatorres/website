import { Schema } from 'effect'

export class SocialLinks extends Schema.Class<SocialLinks>('SocialLinks')({
  discordUrl: Schema.URL,
  facebookUrl: Schema.URL,
  githubUrl: Schema.URL,
  instagramUrl: Schema.URL,
  linkedinUrl: Schema.URL,
  orcidUrl: Schema.URL,
  twitterUrl: Schema.URL,
}) {
  public static encode(folder: SocialLinks) {
    return Schema.encodeEither(SocialLinks)(folder)
  }

  public static decode(input: unknown) {
    return Schema.decodeUnknownEither(SocialLinks)(input)
  }

  public static fromJson(input: string) {
    return Schema.decodeEither(Schema.parseJson(SocialLinks))(input)
  }
}
