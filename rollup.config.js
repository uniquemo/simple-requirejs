import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    format: 'iife',
    indent: false,
    file: 'build/index.js',
    name: 'build/index1.js'
  },
  plugins: [
    babel()
  ]
}
