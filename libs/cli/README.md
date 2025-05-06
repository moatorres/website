# @blog/cli

A CLI tool designed to build configuration and load metadata for the [`blog`](https://github.com/moatorres/website/tree/main/apps/blog) application.

## Usage

You can either create a new configuration file from scratch or use the CLI to generate one for you.

**1. Start from Scratch**

Create a `config.json` file manually in your project's root directory:

```json
{
  "title": "My Blog",
  "description": "A personal blog about tech and life.",
  "author": "Your Name"
}
```

**2. Use the CLI to Generate Configuration**

Create an application from scratch or add a `config.json` file:

```sh
npx blogx create my-blog
```

The CLI will guide you through the process of creating or updating your `config.json` file with the necessary details.

## Development

**Install**

```sh
pnpm add @blog/cli --filter <project-name> --workspace
```

**Build**

```sh
pnpm exec -- nx build cli
```

**Test**

```sh
pnpm exec -- nx test cli -- <options>
```

## License

This project is licensed under the MIT License — see the [LICENSE](https://github.com/moatorres/website/blob/main/LICENSE) file for details.

<sub>⚡️ Powered by **OSS** — `< >` with ☕️ by [**@moatorres**](https://github.com/moatorres)</sub>
