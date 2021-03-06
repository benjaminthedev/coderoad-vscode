import * as path from 'path'
import { runTests } from 'vscode-test'

async function main() {
  // The folder containing the Extension Manifest package.json
  // Passed to `--extensionDevelopmentPath`
  const extensionDevelopmentPath: string = path.resolve(__dirname, '../../')

  // The path to the extension test script
  // Passed to --extensionTestsPath
  const extensionTestsPath: string = path.resolve(__dirname, './suite/index')

  const config = {
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: ['--disable-extensions'], // turn off other extensions
  }

  // Download VS Code, unzip it and run the integration test
  await runTests(config).catch((err: Error) => {
    console.error(err)
    process.exit(1)
  })

  process.exit(0)
}

main()
