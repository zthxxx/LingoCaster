import { toSpaceCase } from './format'


test('simple test toSpaceCase', () => {
  const cases: Array<{ input: string; expect: string }> = [
    {
      input: 'cameCase',
      expect: 'came Case',
    },
    {
      input: 'Capitalize the first letter',
      expect: 'Capitalize the first letter',
    },
    {
      input: 'API',
      expect: 'API',
    },
    {
      input: 'DMKeeper',
      expect: 'DM Keeper',
    },
    {
      input: 'cameCase_34',
      expect: 'came Case 34',
    },
    {
      input: 'i18n',
      expect: 'i18n',
    },
    {
      input: 'conj-word',
      // that's compromised, we don't want breaking conj-word,
      // but no way to spot them exactly
      expect: 'conj word',
    },
    {
      input: 'kebab-case-variable',
      expect: 'kebab case variable',
    },
    {
      input: 'snake_case',
      expect: 'snake case',
    },
    {
      input: 'snake_case_2333:50',
      expect: 'snake case 2333:50',
    },
    {
      input: '12:40',
      expect: '12:40',
    },
    {
      input: '12:40:00',
      expect: '12:40:00',
    },
    {
      input: '12.45',
      expect: '12.45',
    },
    {
      input: '1.0.0',
      expect: '1.0.0',
    },
    {
      input: 'he said: "hello"',
      expect: 'he said: "hello"',
    },
    {
      input: 'colon:in:word',
      expect: 'colon in word',
    },
    {
      input: 'localhost:8080',
      expect: 'localhost 8080',
    },
    {
      input: 'local---host::::8080',
      expect: 'local host 8080',
    },
  ]

  const results: typeof cases = []

  cases.forEach((item) => {
    results.push({
      input: item.input,
      expect: toSpaceCase(item.input),
    })
  })

  expect(results).toEqual(cases)
})

