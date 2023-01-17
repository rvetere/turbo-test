const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // eslint-disable-next-line unused-imports/no-unused-vars
  webpack: (config, { isServer, defaultLoaders }) => {
    /**
     * Following config makes it possible to transpile packages laying outside of
     * the current working directory (which is the default in a monorepo)
     * -> it's just like "transpile-modules", but without "transpile-modules" 😻
     *
     * @see https://github.com/vercel/next.js/issues/9474#issuecomment-640078834
     * @see https://github.com/vercel/next.js/tree/canary/test/integration/typescript-workspaces-paths
     */
    const rootDir = path.resolve(__dirname, "../../");
    config.module.rules.push({
      test: /\.(tsx|ts|js|mjs|jsx)$/,
      include: [path.join(rootDir, "libs")],
      use: defaultLoaders.babel,
      exclude: /node_modules/,
    });

    // Hide "Critical dependency: the request of a dependency is an expression" warnings of i18next-fs-backend
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    return config;
  },
};

module.exports = nextConfig;
