import { promisify } from 'util'
import fs from 'fs'

import { exec as execCallback } from 'child_process'

const exec = promisify(execCallback)

const run = async () => {
  const names = []
  let output = ''

  const { stdout } = await exec(`find src -type f -name *.svelte | xargs cat `)

  for await (const line of stdout.split('\n')) {
    // non tablers icons
    if (/<Icon name="([a-z][a-zA-Z-]*)"/.test(line)) continue
    const match = line.match(/<Icon name="([A-Z][a-zA-Z]*)"/)
    if (match) {
      if (names.includes('Icon' + match[1])) continue
      output += `import { Icon${match[1]} } from '@tabler/icons-svelte'\n`
      names.push('Icon' + match[1])
    } else if (/<Icon/.test(line)) {
      if (/{(entry.icon|selector|channel.amount) ?/.test(line)) continue

      console.warn('potential unformatted Icon', line)
    }
  }

  output += `\nexport {\n  ${names.join(',\n  ')}\n}\n`

  fs.writeFileSync('src/icons/tabler-icons.js', output)
}

run()
