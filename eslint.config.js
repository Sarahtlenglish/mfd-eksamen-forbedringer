import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'

import stylistic from '@stylistic/eslint-plugin'

export default [
	{
		name: 'app/files-to-lint',
		files: ['**/*.{js,mjs,jsx,vue}']
	},

	{
		name: 'app/files-to-ignore',
		ignores: [
			'**/dist/**',
			'**/dist-ssr/**',
			'**/coverage/**',
			'src/configs/firebase.js',
			'src/router/index.js'
		]
	},

	js.configs.recommended,
	...pluginVue.configs['flat/essential'],

	{
		...pluginVitest.configs.recommended,
		files: ['src/**/__tests__/*']
	},
	{
		plugins: {
			'@stylistic': stylistic
		},
		rules: {
			...stylistic.configs.recommended.rules,
			'@stylistic/quotes': ['error', 'single'],
			'@stylistic/comma-dangle': ['error', 'never'],
			'@stylistic/indent': ['error', 2],
			'@stylistic/semi': ['error', 'never'],
			'@stylistic/brace-style': 'error',
			'@stylistic/space-before-blocks': 'error',
			'@stylistic/no-tabs': ['error', { allowIndentationTabs: true }]
		}
	}
]
