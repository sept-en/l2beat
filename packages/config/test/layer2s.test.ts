import { expect } from 'earljs'

import { ProjectRisk, ProjectTechnologyChoice } from '../src/common'
import { layer2s, Layer2Technology } from '../src/layer2s'

describe('layer2s', () => {
  describe('sentences', () => {
    describe('every description ends with a dot', () => {
      for (const layer2 of layer2s) {
        it(layer2.display.name, () => {
          expect(layer2.display.description.endsWith('.')).toEqual(true)
        })
      }
    })

    describe('technology', () => {
      for (const layer2 of layer2s) {
        describe(layer2.display.name, () => {
          type Key = Exclude<
            keyof Layer2Technology,
            'category' | 'provider' //TODO: Add test for permissions
          >

          function check(key: Key) {
            const item = layer2.technology[key]
            if (Array.isArray(item)) {
              for (const [i, x] of item.entries()) {
                checkChoice(x, `${key}[${i}]`)
              }
            } else if (item) {
              checkChoice(item, key)
            }
          }

          function checkChoice(choice: ProjectTechnologyChoice, name: string) {
            it(`${name}.name doesn't end with a dot`, () => {
              expect(choice.name.endsWith('.')).toEqual(false)
            })

            it(`${name}.description ends with a dot`, () => {
              expect(choice.description.endsWith('.')).toEqual(true)
            })

            describe('risks', () => {
              for (const [i, risk] of choice.risks.entries()) {
                checkRisk(risk, `${name}.risks[${i}]`)
              }
            })
          }

          function checkRisk(risk: ProjectRisk, name: string) {
            it(`${name} is correctly formatted`, () => {
              expect(risk.text).toEqual(expect.stringMatching(/^[a-z].*\.$/))
            })
          }

          check('stateCorrectness')
          check('newCryptography')
          check('dataAvailability')
          check('operator')
          check('forceTransactions')
          check('exitMechanisms')
          check('massExit')
          check('additionalPrivacy')
          check('smartContracts')
        })
      }
    })
  })

  describe('every purpose is short', () => {
    const purposes = layer2s.map((x) => x.display.purpose)
    for (const purpose of purposes) {
      it(purpose, () => {
        expect(purpose.length).toBeLessThanOrEqualTo(20)
      })
    }
  })

  describe('events', () => {
    for (const project of layer2s) {
      for (const event of project.config.events) {
        it(`${event.name} in ${project.display.name} as correct ABI`, () => {
          expect(event.abi.endsWith(';')).toEqual(false)
        })
      }
    }
  })
})
