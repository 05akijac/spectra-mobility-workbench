# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Ion Tools — editing & hosting

- **Add a tool:** add a line to `src/lib/tools.ts`, write its page (calculator + "How it works" + "Theory") in `src/tools/`, and register it in `src/tools/index.ts`. Formulas live in `src/lib/physics.ts` (tests: `bun run test`).
- **GitHub Pages:** in your GitHub repo go to Settings → Pages → Source: "GitHub Actions". Every push to `main` runs `.github/workflows/deploy.yml` and publishes to `https://<user>.github.io/<repo>/`. For a custom domain, set `BASE_PATH: /` in the workflow.
