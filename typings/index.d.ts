import {send} from 'xstate'
import TutorialModel from '../src/services/tutorial'

export interface TutorialLevel {
	stageList: string[]
	content: {
		title: string
		text: string
	}
	actions?: {
		setup: TutorialAction
	}
}

export interface TutorialStage {
	stepList: string[]
	content: {
		title: string
		text: string
	}
	actions?: {
		setup: TutorialAction
	}
}

export interface TutorialHint {
	text: string
	displayed?: boolean
}

export interface TutorialAction {
	commits: string[]
	commands?: string[]
	files?: string[]
}

export interface TutorialStepContent {
	text: string
	title?: string
}

export interface TutorialStep {
	content: TutorialStepContent
	actions: {
		setup: TutorialAction
		solution: TutorialAction
	}
	hints?: TutorialHint[]
}

export interface TutorialData {
	summary: TutorialSummary
	levels: {
		[levelId: string]: TutorialLevel
	}
	stages: {
		[stageId: string]: TutorialStage
	}
	steps: {
		[stepId: string]: TutorialStep
	}
}

export interface TutorialMeta {
	version: string
	repo: string
	createdBy: string
	createdAt: string
	updatedBy: string
	updatedAt: string
	contributors: string[]
	languages: string[]
	testRunner: string
}

export interface TutorialSummary {
	title: string
	description: string
	levelList: string[]
}

export interface Tutorial {
	id: string
	meta: TutorialMeta
	data: TutorialData
}

export interface Progress {
	levels: {
		[levelId: string]: boolean
	}
	stages: {
		[stageId: string]: boolean
	}
	steps: {
		[stepId: string]: boolean
	}
	complete: boolean
}

// current tutorial position
export interface Position {
	levelId: string
	stageId: string
	stepId: string
	complete?: boolean
}

// current tutorial state

export interface Action {
	type: string
	payload?: any
	meta?: any
}

export interface MachineContext {
	tutorial: G.Tutorial | null,
	position: CR.Position,
	progress: CR.Progress,
}

export interface MachineEvent {
	type: string
	payload?: any
	data?: any
}

export interface MachineStateSchema {
	states: {
		Start: {
			states: {
				Startup: {}
				NewTutorial: {
					states: {
						SelectTutorial: {}
						InitializeTutorial: {}
					}
				}
				ContinueTutorial: {}
			}
		}
		Tutorial: {
			states: {
				Initialize: {}
				Summary: {}
				LoadNext: {}
				Level: {}
				Stage: {
					states: {
						Normal: {}
						TestRunning: {}
						TestPass: {}
						TestFail: {}
						StepNext: {}
						StageComplete: {}
					}
				}
				Completed: {}
			}
		}
	}
}

export interface StateMachine {
	activate(): void
	deactivate(): void
	send(action: string | Action): void
}

interface MessageData {
	tutorial?: {id: string}
	position: Position
	progress: Progress
}

interface MessageState {
	state: string
}


// todo: type each string param and payload
export type EditorDispatch = (type: string, payload?: MessageData | MessageState | any) => void
