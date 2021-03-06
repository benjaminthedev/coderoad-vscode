import * as CR from 'typings'
import { Machine, MachineOptions } from 'xstate'
import createActions from './actions'

const createOptions = ({ editorSend }: any): MachineOptions<CR.MachineContext, CR.MachineEvent> => ({
  activities: {},
  // @ts-ignore
  actions: createActions(editorSend),
  guards: {},
  services: {},
  delays: {},
})

export const createMachine = (options: any) => {
  return Machine<CR.MachineContext, CR.MachineStateSchema, CR.MachineEvent>(
    {
      id: 'root',
      initial: 'Setup',
      context: {
        error: null,
        env: { machineId: '', sessionId: '', token: '' },
        tutorial: null,
        position: { levelId: '', stepId: null },
        progress: {
          levels: {},
          steps: {},
          complete: false,
        },
        processes: [],
        testStatus: null,
      },
      states: {
        Setup: {
          initial: 'Startup',
          states: {
            Startup: {
              onEntry: ['loadEnv'],
              on: {
                ENV_LOAD: {
                  target: 'LoadStoredTutorial',
                  actions: ['setEnv'],
                },
              },
            },
            Error: {},
            LoadStoredTutorial: {
              onEntry: ['loadStoredTutorial'],
              on: {
                LOAD_STORED_TUTORIAL: {
                  target: 'Start',
                  actions: ['storeContinuedTutorial'],
                },
                START_NEW_TUTORIAL: 'Start',
              },
            },
            Start: {
              on: {
                NEW_TUTORIAL: 'CheckEmptyWorkspace',
                CONTINUE_TUTORIAL: {
                  target: '#tutorial-level',
                  actions: ['continueConfig'],
                },
              },
            },
            CheckEmptyWorkspace: {
              onEntry: ['checkEmptyWorkspace'],
              on: {
                IS_EMPTY_WORKSPACE: 'SelectTutorial',
                NOT_EMPTY_WORKSPACE: 'NonEmptyWorkspace',
              },
            },
            NonEmptyWorkspace: {
              on: {
                REQUEST_WORKSPACE: {
                  target: 'NonEmptyWorkspace',
                  actions: 'requestWorkspaceSelect',
                },
                WORKSPACE_LOADED: 'CheckEmptyWorkspace',
              },
            },
            SelectTutorial: {
              onEntry: ['clearStorage'],
              id: 'select-new-tutorial',
              on: {
                TUTORIAL_START: {
                  target: 'SetupNewTutorial',
                  actions: ['setTutorialContext'],
                },
              },
            },
            SetupNewTutorial: {
              onEntry: ['configureNewTutorial', 'startNewTutorial'],
              on: {
                TUTORIAL_CONFIGURED: '#tutorial',
              },
            },
          },
        },
        Tutorial: {
          id: 'tutorial',
          initial: 'Level',
          on: {
            // track commands
            COMMAND_START: {
              actions: ['commandStart'],
            },
            COMMAND_SUCCESS: {
              actions: ['commandSuccess'],
            },
            COMMAND_FAIL: {
              actions: ['commandFail'],
            },
            ERROR: {
              actions: ['setError'],
            },
          },
          states: {
            LoadNext: {
              id: 'tutorial-load-next',
              onEntry: ['loadNext'],
              on: {
                NEXT_STEP: {
                  target: 'Level',
                  actions: ['updatePosition'],
                },
                NEXT_LEVEL: {
                  target: 'Level',
                  actions: ['updatePosition'],
                },
                COMPLETED: '#completed-tutorial',
              },
            },
            Level: {
              initial: 'Load',
              states: {
                Load: {
                  onEntry: ['loadLevel', 'loadStep', 'checkEmptySteps'],
                  on: {
                    START_LEVEL: 'Normal',
                    START_COMPLETED_LEVEL: 'LevelComplete',
                  },
                },
                Normal: {
                  id: 'tutorial-level',
                  on: {
                    TEST_RUNNING: 'TestRunning',
                    STEP_SOLUTION_LOAD: {
                      actions: ['editorLoadSolution'],
                    },
                  },
                },
                TestRunning: {
                  onEntry: ['testStart'],
                  on: {
                    TEST_PASS: {
                      target: 'TestPass',
                      actions: ['updateStepProgress', 'testPass'],
                    },
                    TEST_FAIL: {
                      target: 'TestFail',
                      actions: ['testFail'],
                    },
                    TEST_ERROR: {
                      target: 'TestFail',
                      actions: ['testFail'],
                    },
                  },
                },
                TestPass: {
                  onExit: ['updateStepPosition'],
                  after: {
                    1000: 'StepNext',
                  },
                },
                TestFail: {
                  after: {
                    0: 'Normal',
                  },
                },
                StepNext: {
                  onEntry: ['stepNext'],
                  on: {
                    LOAD_NEXT_STEP: {
                      target: 'Normal',
                      actions: ['loadStep'],
                    },
                    LEVEL_COMPLETE: {
                      target: 'LevelComplete',
                      actions: ['updateLevelProgress'],
                    },
                  },
                },
                LevelComplete: {
                  on: {
                    LEVEL_NEXT: {
                      target: '#tutorial-load-next',
                      actions: ['testClear'],
                    },
                  },
                },
              },
            },
            Completed: {
              id: 'completed-tutorial',
              onEntry: ['userTutorialComplete'], // unusued
              on: {
                SELECT_TUTORIAL: {
                  target: '#select-new-tutorial',
                  actions: ['reset'],
                },
              },
            },
          },
        },
      },
    },
    createOptions(options),
  )
}
