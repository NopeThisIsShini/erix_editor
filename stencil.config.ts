import { Config } from '@stencil/core';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { reactOutputTarget } from '@stencil/react-output-target';
import { angularOutputTarget } from '@stencil/angular-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';

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

    // React Output - generates native React components
    reactOutputTarget({
      outDir: './dist/react',
    }),

    // Angular Output - generates native Angular module
    angularOutputTarget({
      componentCorePackage: 'erixeditor',
      outputType: 'component',
      directivesProxyFile: './dist/angular/components.ts',
      directivesArrayFile: './dist/angular/index.ts',
    }),

    // Vue Output - generates native Vue components
    vueOutputTarget({
      componentCorePackage: 'erixeditor',
      proxiesFile: './dist/vue/components.ts',
    }),
  ],
  testing: {
    browserHeadless: 'shell',
  },
  plugins: [],
};
