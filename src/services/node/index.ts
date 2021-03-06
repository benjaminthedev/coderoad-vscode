import { exec as cpExec } from 'child_process'
import * as fs from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import * as vscode from 'vscode'
import onError from '../sentry/onError'

const asyncExec = promisify(cpExec)

class Node {
  private workspaceRootPath: string
  constructor() {
    // set workspace root for node executions
    const workspaceRoots: vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders
    if (!workspaceRoots || !workspaceRoots.length) {
      const error = new Error('No workspace root path')
      onError(error)
      throw error
    }
    const workspaceRoot: vscode.WorkspaceFolder = workspaceRoots[0]
    this.workspaceRootPath = workspaceRoot.uri.path
  }
  public exec = (cmd: string): Promise<{ stdout: string; stderr: string }> =>
    asyncExec(cmd, {
      cwd: this.workspaceRootPath,
    })

  public exists = (...paths: string[]): boolean => fs.existsSync(join(this.workspaceRootPath, ...paths))
}

export default new Node()
