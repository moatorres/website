# @blog/utils

A collection of utility functions used in the [`blog`](https://github.com/moatorres/website/tree/main/apps/blog) application.

## Usage

You might need to run `pnpm exec nx sync` after installing this package in another project to enable auto-completion and auto-imports.

```ts
import { memoize } from '@blog/utils'

const memoized = memoize((n: number) => n * 2)
```

## Development

**Install**

```sh
pnpm add @blog/utils --filter <project-name> --workspace
```

**Build**

```sh
pnpm exec nx build utils
```

**Test**

```sh
pnpm exec nx test utils -- <options>
```

## License

This project is licensed under the MIT License — see the [LICENSE](https://github.com/moatorres/website/blob/main/LICENSE) file for details.

<sub>⚡️ Powered by **OSS** — `< >` with ☕️ by [**@moatorres**](https://github.com/moatorres)</sub>
