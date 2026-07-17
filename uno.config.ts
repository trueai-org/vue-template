import { defineConfig, presetIcons, presetWind3 } from 'unocss'

// https://unocss.dev/
export default defineConfig({
  presets: [presetWind3(), presetIcons()],
})
