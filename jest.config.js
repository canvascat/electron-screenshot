module.exports = {
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
  moduleFileExtensions: ['js','jsx','json','vue', 'ts', 'tsx'],
  transform: {
    // process *.vue files with vue-jest
    '^.+\\.vue$': 'vue-jest',
    // '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  // transformIgnorePatterns: ['/node_modules/'],
  // support the same src -> src alias mapping in source code
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jsdom',
  // serializer for snapshots
  // snapshotSerializers: [
  //   'jest-serializer-vue',
  // ],
  // u can change this option to a more specific folder for test single component or util when dev
  // for example, ['<rootDir>/packages/input']
  roots: ['<rootDir>/src'],
  // testMatch: [
  //   '**/tests/unit/**/*.spec.[jt]s?(x)',
  //   '**/__tests__/*.[jt]s?(x)',
  // ],
}
