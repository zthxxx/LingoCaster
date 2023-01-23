
import SuperExpressive from 'super-expressive'
import { noCase } from 'change-case'

/**
 * - any underline(`_`) will be break into space
 * - any Capital letter will be keep
 * - any (`.` / `:`) will be break if it's between the alphabets rather than the number
 * - any (`-` / `:`) will be break if it's between the alphabets,
 *   or between alphabet and number,
 *   but not between the numbers or other symbols
 */
export const toSpaceCase = (text: string): string => {
  /* eslint-disable @typescript-eslint/indent */
  const stripRegexp = SuperExpressive()
    .allowMultipleMatches
    .anyOf
      .char('_')

      .group
        .assertBehind
          .anyOf.range('A', 'Z').range('a', 'z').end()
        .end()
        .oneOrMore.anyOfChars('-.:')
        .assertAhead
          .anyOf.range('A', 'Z').range('a', 'z').end()
        .end()
      .end()

      .group
        .assertBehind
          .anyOf.range('A', 'Z').range('a', 'z').end()
        .end()
        .oneOrMore.anyOfChars('-:')
        .assertAhead.digit.end()
      .end()

      .group
        .assertBehind.digit.end()
        .oneOrMore.anyOfChars('-:')
        .assertAhead
          .anyOf.range('A', 'Z').range('a', 'z').end()
        .end()
      .end()
    .end()
    .toRegex()
  /* eslint-enable @typescript-eslint/indent */

  const result = noCase(
    text,
    {
      stripRegexp,
      transform: text => text,
    },
  )

  return result
}
