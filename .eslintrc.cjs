process.env.ESLINT_TSCONFIG = 'tsconfig.json'

module.exports = {
  root: true,

  /**
   * Base on @antfu/eslint-config@0.39.7
   * https://github.com/antfu/eslint-config/blob/v0.39.7
   */
  extends: [
    '@antfu',
    '@antfu/react',
  ],

  rules: {
    /**
     * ===================================
     * ************   Basic   ************
     * ===================================
     */

    // https://eslint.org/docs/latest/rules/no-console
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-basic/index.js#L241
    'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
    // https://eslint.org/docs/latest/rules/sort-imports
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-basic/index.js#L380
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: true,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      },
    ],
    // https://eslint.org/docs/latest/rules/no-multiple-empty-lines
    'no-multiple-empty-lines': [
      'error',
      {
        max: 2,
        maxEOF: 1,
        maxBOF: 1,
      },
    ],
    // https://eslint.org/docs/latest/rules/curly#multi-line
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-basic/index.js#L221
    'curly': ['error', 'multi-line', 'consistent'],
    // https://eslint.org/docs/latest/rules/arrow-parens
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-basic/index.js#L305
    'arrow-parens': 'off',
    /**
     * https://eslint.org/docs/latest/rules/multiline-ternary
     * Must using with
     *   - `operator-linebreak` rule with `before`,
     *   - and `indent` rule with `flatTernaryExpressions: false`, `offsetTernaryExpressions: false`,
     *
     * to align the '?' and ':' symbols when using a ternary operator.
     *
     * ```
     *   xxx == yyy
     *     ? zzz
     *     : null
     * ```
     */
    'multiline-ternary': [
      'error',
      'always-multiline',
    ],
    // https://eslint.org/docs/rules/operator-linebreak
    'operator-linebreak': [
      'error',
      'before',
    ],


    /**
     * ===================================
     * **********  Typescript   **********
     * ===================================
     */

    // https://eslint.org/docs/latest/rules/quotes#options
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-ts/index.js#L131
    '@typescript-eslint/quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    // https://typescript-eslint.io/rules/no-inferrable-types
    '@typescript-eslint/no-inferrable-types': 'off',
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/member-delimiter-style.md
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
      },
    ],

    // https://typescript-eslint.io/rules/consistent-type-imports
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-ts/index.js#L71
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
        fixStyle: 'inline-type-imports',
      },
    ],
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-use-before-define.md
    '@typescript-eslint/no-use-before-define': 'off',
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-floating-promises.md
    '@typescript-eslint/no-floating-promises': 'off',
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-misused-promises.md
    '@typescript-eslint/no-misused-promises': 'off',
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-extra-parens.md
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-ts/index.js#L150
    '@typescript-eslint/no-extra-parens': 'off',
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-ts/index.js#L78
    // https://eslint.org/docs/latest/rules/indent#options
    '@typescript-eslint/indent': ['error', 2, {
      SwitchCase: 1,
      VariableDeclarator: 1,
      outerIIFEBody: 1,
      MemberExpression: 1,
      FunctionDeclaration: { parameters: 1, body: 1 },
      FunctionExpression: { parameters: 1, body: 1 },
      CallExpression: { arguments: 1 },
      ArrayExpression: 1,
      ObjectExpression: 1,
      ImportDeclaration: 1,
      flatTernaryExpressions: false,
      offsetTernaryExpressions: false,
      ignoreComments: false,
      ignoredNodes: [
        // 'TSTypeParameterInstantiation',
        // 'TSIntersectionType',
        // 'TSUnionType',
        // 'ConditionalExpression',
        // 'TemplateLiteral *',
        // 'JSXElement',
        // 'JSXElement > *',
        // 'JSXAttribute',
        // 'JSXIdentifier',
        // 'JSXNamespacedName',
        // 'JSXMemberExpression',
        // 'JSXSpreadAttribute',
        // 'JSXExpressionContainer',
        // 'JSXOpeningElement',
        // 'JSXClosingElement',
        // 'JSXFragment',
        // 'JSXOpeningFragment',
        // 'JSXClosingFragment',
        // 'JSXText',
        // 'JSXEmptyExpression',
        // 'JSXSpreadChild',
        // 'TSTypeParameterInstantiation',
        // 'FunctionExpression > .params[decorators.length > 0]',
        // 'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
        // 'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key',
      ],
    }],
    // https://typescript-eslint.io/rules/restrict-template-expressions/
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-ts/index.js#L50
    '@typescript-eslint/restrict-template-expressions': 'off',


    /**
     * ===================================
     * ************   React   ************
     * ===================================
     */

    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-tag-spacing.md
    'react/jsx-tag-spacing': [
      'error',
      {
        closingSlash: 'allow',
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'never',
      },
    ],
    // https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/README.md
    'react-hooks/exhaustive-deps': 'off',
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/display-name.md
    'react/display-name': 'off',
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md
    'react/prop-types': 'off',
    // https://eslint.org/docs/latest/rules/jsx-quotes
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-react/index.js#L13
    'jsx-quotes': ['error', 'prefer-single'],


    /**
     * ===================================
     * ************   Antfu   ************
     * ===================================
     */
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-basic/index.js#L396
    'antfu/if-newline': 'off',
    // https://github.com/antfu/eslint-config/blob/v0.39.7/packages/eslint-config-basic/index.js#L398
    'antfu/top-level-function': 'off',
  },
}
