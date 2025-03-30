# [`moatorres/website`](https://github.com/moatorres/website)

## Stack

- **Framework** [Next.js](https://nextjs.org/)
- **Deployment** [Vercel](https://vercel.com)
- **Styling** [Tailwind CSS](https://tailwindcss.com)

## Running Locally

### Prerequisites

Ensure you have **Node.js v18.17+** installed on your system.

### Steps to Run Locally

1. Clone the repository:

```sh
git clone https://github.com/moatorres/website.git
```

2. Navigate to the project directory:

```sh
cd website
```

3. Install dependencies:

```sh
pnpm install
```

4. Bootstrap the project:

```sh
make bootstrap
```

5. Start the development server for the blog application:

```sh
pnpm exec -- nx dev blog
```

## Conventions

1.  Content **MUST** live in the `CONTENT_DIR_RELATIVE_PATH` set on the [configuration file](https://github.com/moatorres/website/blob/main/apps/blog/src/utils/config.ts).
2.  Content `metadata` inside `.mdx` files **MAY NOT** support nested objects.
3.  Content collections **MUST** be 1-level deep relative to the content directory.
    Syntax `<source-root>/content/<collection>/<mdx-file>`
    E.g. `apps/blog/src/content/politics/slavery-in-latin-america.mdx`

## License

This project is licensed under the MIT—see the [LICENSE](https://github.com/moatorres/website/blob/main/LICENSE) file for details. Crediting the [author](https://github.com/moatorres) is appreciated.

<sub>⚡️ Powered by **OSS** — `< >` with ☕️ by [**@moatorres**](https://github.com/moatorres)</sub>
