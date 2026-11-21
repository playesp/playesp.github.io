import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'docs/**/*', 'node_modules/**/*', 'src/**/*', 'server.ts'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
