/*
 * Copyright (C) 2018 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import {mount} from 'enzyme'
import GradeInput from 'jsx/gradezilla/default_gradebook/GradebookGrid/editors/AssignmentCellEditor/GradeInput'

/* eslint-disable qunit/no-identical-names */

QUnit.module('GradeInput', suiteHooks => {
  let $container
  let props
  let wrapper

  suiteHooks.beforeEach(() => {
    const assignment = {
      pointsPossible: 10
    }
    const submission = {
      enteredGrade: null,
      enteredScore: null,
      excused: false,
      id: '2501'
    }
    const gradingScheme = [['A', 0.9], ['B', 0.8], ['C', 0.7], ['D', 0.6], ['F', 0]]
    props = {
      assignment,
      enterGradesAs: 'points',
      disabled: false,
      gradingScheme,
      submission
    }

    $container = document.createElement('div')
    document.body.appendChild($container)
  })

  suiteHooks.afterEach(() => {
    wrapper.unmount()
    $container.remove()
  })

  function mountComponent() {
    wrapper = mount(<GradeInput {...props} />, {attachTo: $container})
  }

  function getTextInputValue() {
    return wrapper.find('input').getDOMNode().value
  }

  test('displays a screenreader-only label of "Grade"', () => {
    mountComponent()
    const label = wrapper.find('label ScreenReaderContent').at(0)
    equal(label.text(), 'Grade')
  })

  QUnit.module('when the "enter grades as" setting is "points"', contextHooks => {
    contextHooks.beforeEach(() => {
      props.enterGradesAs = 'points'
      props.submission.enteredGrade = '78%'
      props.submission.enteredScore = 7.8
    })

    test('adds the PointsInput-suffix class to the container', () => {
      mountComponent()
      strictEqual(wrapper.hasClass('Grid__AssignmentRowCell__PointsInput'), true)
    })

    test('renders a text input', () => {
      mountComponent()
      const input = wrapper.find('input[type="text"]')
      strictEqual(input.length, 1)
    })

    test('optionally disables the input', () => {
      props.disabled = true
      mountComponent()
      const input = wrapper.find('input[type="text"]')
      strictEqual(input.prop('disabled'), true)
    })

    test('sets the input value to the entered score of the submission', () => {
      props.submission.enteredGrade = '78%'
      mountComponent()
      strictEqual(getTextInputValue(), '7.8')
    })

    test('rounds the input value to two decimal places', () => {
      props.submission.enteredScore = 7.816
      mountComponent()
      strictEqual(getTextInputValue(), '7.82')
    })

    test('strips insignificant zeros', () => {
      props.submission.enteredScore = 8.0
      mountComponent()
      strictEqual(getTextInputValue(), '8')
    })

    test('keeps the input blank when the submission is not graded', () => {
      props.submission.enteredScore = null
      mountComponent()
      strictEqual(getTextInputValue(), '')
    })

    test('displays "Excused" as the input value when the submission is excused', () => {
      props.submission.excused = true
      mountComponent()
      strictEqual(getTextInputValue(), 'Excused')
    })
  })

  QUnit.module('when the "enter grades as" setting is "percent"', contextHooks => {
    contextHooks.beforeEach(() => {
      props.submission.enteredGrade = '7.8'
      props.submission.enteredScore = 7.8
      props.enterGradesAs = 'percent'
    })

    test('adds the PercentInput-suffix class to the container', () => {
      mountComponent()
      strictEqual(wrapper.hasClass('Grid__AssignmentRowCell__PercentInput'), true)
    })

    test('renders a text input', () => {
      mountComponent()
      const input = wrapper.find('input[type="text"]')
      strictEqual(input.length, 1)
    })

    test('optionally disables the input', () => {
      props.disabled = true
      mountComponent()
      const input = wrapper.find('input[type="text"]')
      strictEqual(input.prop('disabled'), true)
    })

    test('sets the input value to the percentage value of the entered score of the submission', () => {
      mountComponent()
      strictEqual(getTextInputValue(), '78%')
    })

    test('rounds the input value to two decimal places', () => {
      props.submission.enteredScore = 7.8916
      mountComponent()
      strictEqual(getTextInputValue(), '78.92%')
    })

    test('strips insignificant zeros', () => {
      props.submission.enteredScore = 8.0
      mountComponent()
      strictEqual(getTextInputValue(), '80%')
    })

    test('keeps the input blank when the submission is not graded', () => {
      props.submission.enteredScore = null
      mountComponent()
      strictEqual(getTextInputValue(), '')
    })

    test('displays "Excused" as the input value when the submission is excused', () => {
      props.submission.excused = true
      mountComponent()
      strictEqual(getTextInputValue(), 'Excused')
    })
  })

  QUnit.module('when the "enter grades as" setting is "gradingScheme"', contextHooks => {
    contextHooks.beforeEach(() => {
      props.enterGradesAs = 'gradingScheme'
      props.submission.enteredGrade = '7.8'
      props.submission.enteredScore = 7.8
    })

    test('adds the GradingSchemeInput-suffix class to the container', () => {
      mountComponent()
      strictEqual(wrapper.hasClass('Grid__AssignmentRowCell__GradingSchemeInput'), true)
    })

    test('renders a text input', () => {
      mountComponent()
      const input = wrapper.find('input[type="text"]')
      strictEqual(input.length, 1)
    })

    test('optionally disables the input', () => {
      props.disabled = true
      mountComponent()
      const input = wrapper.find('input[type="text"]')
      strictEqual(input.prop('disabled'), true)
    })

    test('sets as the input value the grade corresponding to the entered score', () => {
      mountComponent()
      equal(getTextInputValue(), 'C')
    })
  })

  QUnit.module('#componentWillReceiveProps()', () => {
    test('sets the input value to the entered score of the updated submission', () => {
      mountComponent()
      wrapper.setProps({submission: {...props.submission, enteredScore: 8.0, enteredGrade: '8.00'}})
      strictEqual(getTextInputValue(), '8')
    })

    test('displays "Excused" as the input value when the updated submission is excused', () => {
      mountComponent()
      wrapper.setProps({
        submission: {...props.submission, excused: true, enteredScore: null, enteredGrade: null}
      })
      strictEqual(getTextInputValue(), 'Excused')
    })

    test('does not update the input value when the input has focus', () => {
      mountComponent()
      wrapper
        .find('input[type="text"]')
        .get(0)
        .focus()
      wrapper.setProps({submission: {...props.submission, enteredScore: 8.0, enteredGrade: '8.00'}})
      strictEqual(getTextInputValue(), '')
    })
  })

  QUnit.module('#focus()', () => {
    test('sets focus on the input', () => {
      mountComponent()
      wrapper.instance().focus()
      strictEqual(document.activeElement, wrapper.find('input[type="text"]').get(0))
    })

    test('selects the content of the input', () => {
      props.submission = {...props.submission, enteredScore: 8.13, enteredGrade: '8.13'}
      mountComponent()
      wrapper.instance().focus()
      strictEqual(document.getSelection().toString(), '8.13')
    })
  })

  QUnit.module('#gradingData', () => {
    function getGradingData() {
      return wrapper.instance().gradingData
    }

    test('trims whitespace from changed input values', () => {
      mountComponent()
      wrapper.find('input').simulate('change', {target: {value: ' 8.9 '}})
      strictEqual(getGradingData().grade, '8.9')
    })

    test('is excused when the input changes to "EX"', () => {
      mountComponent()
      wrapper.find('input').simulate('change', {target: {value: 'EX'}})
      strictEqual(getGradingData().excused, true)
    })

    test('clears the grade when the input is cleared', () => {
      mountComponent()
      wrapper.find('input').simulate('change', {target: {value: '8.9'}})
      wrapper.find('input').simulate('change', {target: {value: ''}})
      strictEqual(getGradingData().grade, null)
    })

    test('clears the score when the input is cleared', () => {
      mountComponent()
      wrapper.find('input').simulate('change', {target: {value: '8.9'}})
      wrapper.find('input').simulate('change', {target: {value: ''}})
      strictEqual(getGradingData().score, null)
    })

    QUnit.module('when "enterGradesAs" is "points"', contextHooks => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'points'
        mountComponent()
      })

      QUnit.module('when a point value is entered', hooks => {
        hooks.beforeEach(() => {
          wrapper.find('input').simulate('change', {target: {value: '8.9'}})
        })

        test('sets grade to the entered grade', () => {
          strictEqual(getGradingData().grade, '8.9')
        })

        test('sets score to the score form of the entered grade', () => {
          strictEqual(getGradingData().score, 8.9)
        })

        test('sets enteredAs to "points"', () => {
          strictEqual(getGradingData().enteredAs, 'points')
        })
      })

      QUnit.module('when a percent value is entered', hooks => {
        hooks.beforeEach(() => {
          wrapper.find('input').simulate('change', {target: {value: '89%'}})
        })

        test('sets grade to the points form of the entered grade', () => {
          strictEqual(getGradingData().grade, '8.9')
        })

        test('sets score to the score form of the entered grade', () => {
          strictEqual(getGradingData().score, 8.9)
        })

        test('sets enteredAs to "percent"', () => {
          strictEqual(getGradingData().enteredAs, 'percent')
        })
      })

      QUnit.module('when a grading scheme value is entered', hooks => {
        hooks.beforeEach(() => {
          wrapper.find('input').simulate('change', {target: {value: 'B'}})
        })

        test('sets grade to the points form of the entered grade', () => {
          strictEqual(getGradingData().grade, '8.9')
        })

        test('sets score to the score form of the entered grade', () => {
          strictEqual(getGradingData().score, 8.9)
        })

        test('sets enteredAs to "gradingScheme"', () => {
          strictEqual(getGradingData().enteredAs, 'gradingScheme')
        })
      })
    })

    QUnit.module('when "enterGradesAs" is "percent"', contextHooks => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'percent'
        mountComponent()
      })

      QUnit.module('when a point value is entered', hooks => {
        hooks.beforeEach(() => {
          wrapper.find('input').simulate('change', {target: {value: '8.9'}})
        })

        test('sets grade to the percent form of the entered grade', () => {
          strictEqual(getGradingData().grade, '8.9%')
        })

        test('sets score to the score form of the entered grade', () => {
          strictEqual(getGradingData().score, 0.89)
        })

        test('sets enteredAs to "percent"', () => {
          strictEqual(getGradingData().enteredAs, 'percent')
        })
      })

      QUnit.module('when a percent value is entered', hooks => {
        hooks.beforeEach(() => {
          wrapper.find('input').simulate('change', {target: {value: '89%'}})
        })

        test('sets grade to the entered grade', () => {
          strictEqual(getGradingData().grade, '89%')
        })

        test('sets score to the score form of the entered grade', () => {
          strictEqual(getGradingData().score, 8.9)
        })

        test('sets enteredAs to "percent"', () => {
          strictEqual(getGradingData().enteredAs, 'percent')
        })
      })

      QUnit.module('when a grading scheme value is entered', hooks => {
        hooks.beforeEach(() => {
          wrapper.find('input').simulate('change', {target: {value: 'B'}})
        })

        test('sets grade to the percent form of the entered grade', () => {
          strictEqual(getGradingData().grade, '89%')
        })

        test('sets score to the score form of the entered grade', () => {
          strictEqual(getGradingData().score, 8.9)
        })

        test('sets enteredAs to "gradingScheme"', () => {
          strictEqual(getGradingData().enteredAs, 'gradingScheme')
        })
      })
    })

    QUnit.module('when "enterGradesAs" is "gradingScheme"', contextHooks => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'gradingScheme'
        mountComponent()
      })

      QUnit.module('when a point value is entered', hooks => {
        hooks.beforeEach(() => {
          wrapper.find('input').simulate('change', {target: {value: '8.9'}})
        })

        test('sets grade to the percent form of the entered grade', () => {
          strictEqual(getGradingData().grade, 'B')
        })

        test('sets score to the score form of the entered grade', () => {
          strictEqual(getGradingData().score, 8.9)
        })

        test('sets enteredAs to "points"', () => {
          strictEqual(getGradingData().enteredAs, 'points')
        })
      })

      QUnit.module('when a percent value is entered', hooks => {
        hooks.beforeEach(() => {
          wrapper.find('input').simulate('change', {target: {value: '89%'}})
        })

        test('sets grade to the entered grade', () => {
          strictEqual(getGradingData().grade, 'B')
        })

        test('sets score to the score form of the entered grade', () => {
          strictEqual(getGradingData().score, 8.9)
        })

        test('sets enteredAs to "percent"', () => {
          strictEqual(getGradingData().enteredAs, 'percent')
        })
      })

      QUnit.module('when a grading scheme value is entered', hooks => {
        hooks.beforeEach(() => {
          wrapper.find('input').simulate('change', {target: {value: 'B'}})
        })

        test('sets grade to the percent form of the entered grade', () => {
          strictEqual(getGradingData().grade, 'B')
        })

        test('sets score to the score form of the entered grade', () => {
          strictEqual(getGradingData().score, 8.9)
        })

        test('sets enteredAs to "gradingScheme"', () => {
          strictEqual(getGradingData().enteredAs, 'gradingScheme')
        })
      })
    })
  })

  QUnit.module('#hasGradeChanged()', () => {
    function hasGradeChanged() {
      return wrapper.instance().hasGradeChanged()
    }

    QUnit.module('when the "enter grades as" setting is "points"', () => {
      test('returns true when the grade has changed', () => {
        props.submission = {...props.submission, enteredGrade: '7.6', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '8.9'}})
        strictEqual(hasGradeChanged(), true)
      })

      test('returns true when the submission becomes excused', () => {
        props.submission = {...props.submission, enteredGrade: '7.6', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'EX'}})
        strictEqual(hasGradeChanged(), true)
      })

      test('returns false when the grade has not changed', () => {
        mountComponent()
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade has not changed to a different value', () => {
        props.submission = {...props.submission, enteredGrade: '7.6', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '7.6'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade has changed to the same value in "percent"', () => {
        props.submission = {...props.submission, enteredGrade: '7.6', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '76%'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade has changed to the same value in the grading scheme', () => {
        props.submission = {...props.submission, enteredGrade: '7.9', enteredScore: 7.9}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'C'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns true when the grade has changed to a different value for the same grading scheme key', () => {
        props.submission = {...props.submission, enteredGrade: '7.8', enteredScore: 7.8}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'C'}})
        strictEqual(hasGradeChanged(), true)
      })

      test('returns false when the grade is stored as the same value in "percent"', () => {
        props.submission = {...props.submission, enteredGrade: '76%', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '7.6'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade is stored as the same value in "gradingScheme"', () => {
        props.submission = {...props.submission, enteredGrade: 'C', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '7.6'}})
        strictEqual(hasGradeChanged(), false)
      })
    })

    QUnit.module('when the "enter grades as" setting is "percent"', contextHooks => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'percent'
      })

      test('returns true when the grade has changed', () => {
        props.submission = {...props.submission, enteredGrade: '76%', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '89%'}})
        strictEqual(hasGradeChanged(), true)
      })

      test('returns true when the submission becomes excused', () => {
        props.submission = {...props.submission, enteredGrade: '76%', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'EX'}})
        strictEqual(hasGradeChanged(), true)
      })

      test('returns false when the grade has not changed', () => {
        mountComponent()
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade has not changed to a different value', () => {
        props.submission = {...props.submission, enteredGrade: '76%', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '76%'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade has changed to the same value in "points"', () => {
        props.submission = {...props.submission, enteredGrade: '76%', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '76'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade has changed to the same value in the grading scheme', () => {
        props.submission = {...props.submission, enteredGrade: '79%', enteredScore: 7.9}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'C'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns true when the grade has changed to a different value for the same grading scheme key', () => {
        props.submission = {...props.submission, enteredGrade: '78%', enteredScore: 7.8}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'C'}})
        strictEqual(hasGradeChanged(), true)
      })

      test('returns false when the grade is stored as the same value in "points"', () => {
        props.submission = {...props.submission, enteredGrade: '7.6', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '76%'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade is stored as the same value in "gradingScheme"', () => {
        props.submission = {...props.submission, enteredGrade: 'C', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '76%'}})
        strictEqual(hasGradeChanged(), false)
      })
    })

    QUnit.module('when the "enter grades as" setting is "gradingScheme"', contextHooks => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'gradingScheme'
      })

      test('returns true when the grade has changed', () => {
        props.submission = {...props.submission, enteredGrade: 'C', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'B'}})
        strictEqual(hasGradeChanged(), true)
      })

      test('returns true when the submission becomes excused', () => {
        props.submission = {...props.submission, enteredGrade: 'C', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'EX'}})
        strictEqual(hasGradeChanged(), true)
      })

      test('returns false when the grade has not changed', () => {
        mountComponent()
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade has not changed to a different grading scheme key', () => {
        props.submission = {...props.submission, enteredGrade: 'C', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'C'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade has changed to the same value in "points"', () => {
        props.submission = {...props.submission, enteredGrade: 'C', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '7.6'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade has changed to the same value in "percent"', () => {
        props.submission = {...props.submission, enteredGrade: 'C', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '76%'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns true when the grade has changed to a different value in "points"', () => {
        props.submission = {...props.submission, enteredGrade: 'C', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '7.8'}})
        strictEqual(hasGradeChanged(), true)
      })

      test('returns true when the grade has changed to a different value in "percent"', () => {
        props.submission = {...props.submission, enteredGrade: 'C', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: '78%'}})
        strictEqual(hasGradeChanged(), true)
      })

      test('returns false when the grade is stored as the same value in "points"', () => {
        props.submission = {...props.submission, enteredGrade: '7.6', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'C'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the grade is stored as the same value in "percent"', () => {
        props.submission = {...props.submission, enteredGrade: '76%', enteredScore: 7.6}
        mountComponent()
        wrapper.find('input').simulate('change', {target: {value: 'C'}})
        strictEqual(hasGradeChanged(), false)
      })
    })

    QUnit.module('when the submission is excused', contextHooks => {
      contextHooks.beforeEach(() => {
        props.submission = {...props.submission, excused: true}
        mountComponent()
      })

      test('returns false when the input is unchanged', () => {
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when "EX" is entered', () => {
        wrapper.find('input').simulate('change', {target: {value: 'EX'}})
        strictEqual(hasGradeChanged(), false)
      })

      test('returns false when the input adds only whitespace', () => {
        wrapper.find('input').simulate('change', {target: {value: '   Excused   '}})
        strictEqual(hasGradeChanged(), false)
      })
    })

    test('returns false when the grade has changed back to the original value', () => {
      mountComponent()
      wrapper.find('input').simulate('change', {target: {value: '8.9'}})
      wrapper.find('input').simulate('change', {target: {value: ''}})
      strictEqual(hasGradeChanged(), false)
    })

    test('ignores whitespace in the entered grade', () => {
      props.submission = {...props.submission, enteredGrade: '7.6', enteredScore: 7.6}
      mountComponent()
      wrapper.find('input').simulate('change', {target: {value: '  7.6  '}})
      strictEqual(hasGradeChanged(), false)
    })

    test('ignores unnecessary zeros in the entered grade', () => {
      props.submission = {...props.submission, enteredGrade: '7.6', enteredScore: 7.6}
      mountComponent()
      wrapper.find('input').simulate('change', {target: {value: '7.600'}})
      strictEqual(hasGradeChanged(), false)
    })
  })

  QUnit.module('#isFocused()', () => {
    test('returns true when the input has focus', () => {
      mountComponent()
      wrapper
        .find('input[type="text"]')
        .get(0)
        .focus()
      strictEqual(wrapper.instance().isFocused(), true)
    })

    test('returns false when the input does not have focus', () => {
      mountComponent()
      strictEqual(wrapper.instance().isFocused(), false)
    })
  })
})
