import {join} from 'path'
import * as CR from 'typings'
import * as G from 'typings/graphql'
import * as vscode from 'vscode'
import ReactWebView from '../ReactWebView'
import runTest from './runTest'
import {isEmptyWorkspace} from '../workspace'

const COMMANDS = {
	START: 'coderoad.start',
	TEST_RUNNER_SETUP: 'coderoad.test_runner_setup',
	OPEN_WEBVIEW: 'coderoad.open_webview',
	SEND_STATE: 'coderoad.send_state',
	SEND_DATA: 'coderoad.send_data',
	RECEIVE_MACHINE_ACTION: 'coderoad.receive_machine_action',
	OPEN_FILE: 'coderoad.open_file',
	RUN_TEST: 'coderoad.run_test',
	TEST_PASS: 'coderoad.test_pass',
	TEST_FAIL: 'coderoad.test_fail',
}

interface CreateCommandProps {
	vscodeExt: vscode.ExtensionContext
}

const resetLayout = () => {
	vscode.commands.executeCommand('vscode.setEditorLayout', {
		orientation: 0,
		groups: [{groups: [{}], size: 0.6}, {groups: [{}], size: 0.4}],
	})
}

export const createCommands = ({vscodeExt}: CreateCommandProps) => {
	// React panel webview
	let webview: any

	return {
		// initialize
		[COMMANDS.START]: async () => {
			console.log('start')

			await isEmptyWorkspace()

			let webviewState: 'INITIALIZING' | 'RESTARTING'
			if (!webview) {
				webviewState = 'INITIALIZING'
			} else if (webview.loaded) {
				// already loaded
				vscode.window.showInformationMessage('CodeRoad already open')
				return
			} else {
				webviewState = 'RESTARTING'
			}

			// activate machine
			webview = new ReactWebView(vscodeExt.extensionPath)
		},
		// open React webview
		[COMMANDS.OPEN_WEBVIEW]: (column: number = vscode.ViewColumn.Two) => {
			console.log('open webview')
			// setup 1x1 horizontal layout
			resetLayout()
			webview.createOrShow(column)
		},
		[COMMANDS.TEST_RUNNER_SETUP]: async (codingLanguage: G.EnumCodingLanguage) => {

			// TODO: allow multiple coding languages in a tutorial

			// setup onSave hook
			// console.log(`languageIds: ${languageIds.join(', ')}`)
			vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
				console.log('save document', document)
				if (document.uri.scheme === 'file' && codingLanguage === document.languageId) {
					// do work
					// machine.send('TEST_RUN')
				}
			})
		},
		// open a file
		[COMMANDS.OPEN_FILE]: async (relativeFilePath: string) => {
			console.log(`OPEN_FILE ${JSON.stringify(relativeFilePath)}`)
			try {
				// TODO: reenable after testing
				// const workspaceRoots: vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders
				// if (!workspaceRoots || !workspaceRoots.length) {
				// 	throw new Error('No workspace root path')
				// }
				// const rootWorkspace: vscode.WorkspaceFolder = workspaceRoots[0]
				// const absoluteFilePath = join(rootWorkspace.uri.path, relativeFilePath)
				const workspaceRoot = vscode.workspace.rootPath
				if (!workspaceRoot) {
					throw new Error('No workspace root path')
				}
				const absoluteFilePath = join(workspaceRoot, relativeFilePath)
				const doc = await vscode.workspace.openTextDocument(absoluteFilePath)
				await vscode.window.showTextDocument(doc, vscode.ViewColumn.One)
				// there are times when initialization leave the panel behind any files opened
				// ensure the panel is redrawn on the right side first
				webview.createOrShow(vscode.ViewColumn.Two)
			} catch (error) {
				console.log(`Failed to open file ${relativeFilePath}`, error)
			}
		},
		// send messages to webview
		[COMMANDS.SEND_STATE]: (payload: {data: any; state: any}) => {
			webview.postMessage({type: 'SET_STATE', payload})
		},
		[COMMANDS.SEND_DATA]: (payload: {data: any}) => {
			webview.postMessage({type: 'SET_DATA', payload})
		},
		[COMMANDS.RECEIVE_MACHINE_ACTION]: (action: string | CR.Action) => {
			// send received actions from web-app into state machine
			console.log('receive action', action)
			// machine.send(action)
		},
		[COMMANDS.RUN_TEST]: () => {
			runTest({
				onSuccess: () => {
					console.log('TEST_PASS')
					vscode.window.showInformationMessage('PASS')
				},
				onFail: () => {
					console.log('TEST_FAIL')
					vscode.window.showWarningMessage('FAIL')
				}
			})
		},
	}
}
