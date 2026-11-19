import { build } from 'esbuild'
import { execFileSync } from 'node:child_process'
import { copyFileSync } from 'node:fs'

execFileSync(process.execPath, ['node_modules/@tailwindcss/cli/dist/index.mjs', '-i', 'src/music.css', '-o', 'dist/music-section.css', '--minify'], { stdio: 'inherit' })
await build({
  entryPoints: ['src/music-section.tsx'],
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2022'],
  outfile: 'dist/music-section.js',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'linked',
})

copyFileSync('src/flow-button.css', 'dist/flow-button.css')
copyFileSync('src/mobile.css', 'dist/mobile.css')

await build({
  entryPoints: ['src/smooth-scroll.ts'],
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2022'],
  outfile: 'dist/smooth-scroll.js',
  legalComments: 'linked',
})
