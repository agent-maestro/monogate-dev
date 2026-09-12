import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Cosmetic only (unescaped ' / " in JSX text) — no runtime effect.
      'react/no-unescaped-entities': 'off',

      // React-Compiler-readiness rules from eslint-plugin-react-hooks@7.
      // next.config.mjs does not enable `reactCompiler`, and these rules flag
      // patterns (refs read during render, setState in effects/useMemo,
      // module-level mutation, Math.random() during render) that are working,
      // pre-compiler idioms throughout lib/games/* and lib/explorer/*'s
      // animation/canvas code. Downgraded to warn so they stay visible — worth
      // revisiting if/when reactCompiler is turned on — without failing the
      // build today.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/globals': 'warn',
      'react-hooks/use-memo': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Project-specific build/output directories:
    '.open-next/**',
    'node_modules/**',
    // public/electronics-lab/assets holds committed Vite-built bundles
    // (hashed filenames, __vite__mapDeps) — vendored build output, not
    // source. Linting it as source produced ~3700 spurious warnings/errors
    // from minified code.
    'public/**',
  ]),
])

export default eslintConfig
