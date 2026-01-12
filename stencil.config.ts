import { Config } from '@stencil/core';
import { resolve } from 'path';
import { existsSync } from 'fs';

export const config: Config = {
  namespace: 'erixeditor',
  rollupPlugins: {
    before: [
      {
        name: 'alias-resolver',
        resolveId(source: string) {
          if (source.startsWith('@src/')) {
            const relativePath = source.replace('@src/', '');
            const base = resolve(__dirname, 'src', relativePath);

            // Try common extensions
            const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
            for (const ext of extensions) {
              const fullPath = base + ext;
              if (existsSync(fullPath)) {
                return fullPath;
              }
            }

            if (existsSync(base)) {
              return base;
            }
          }
          return null;
        },
      },
    ],
  },
  outputTargets: [
    // Main distribution
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null,
    },
  ],
  testing: {
    browserHeadless: 'shell',
  },
  plugins: [],
};

