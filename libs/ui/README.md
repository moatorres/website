# @shadcn/ui

A collection of UI components used in the [`blog`](https://github.com/moatorres/website/tree/main/apps/blog) application.

## Usage

You might need to run `pnpm exec nx sync` after installing this package in another project to enable auto-completion and auto-imports.

```tsx
import { Button } from '@shadcn/ui'

const App = () => <Button>Click Me</Button>
```

## Development

**Install**

```sh
pnpm add @shadcn/ui --filter <project-name> --workspace
```

**Build**

```sh
pnpm exec nx build ui
```

**Test**

```sh
pnpm exec nx test ui -- <options>
```

## License

This project is licensed under the MIT License — see the [LICENSE](https://github.com/moatorres/website/blob/main/LICENSE) file for details.

<sub>⚡️ Powered by **OSS** — `< >` with ☕️ by [**@moatorres**](https://github.com/moatorres)</sub>
