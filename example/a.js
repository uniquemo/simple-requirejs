define(['require', 'b'], function(require, b) {
  console.log('模块 a 内部引用的require => ', require)
  console.log('模块 a 内部引用的模块 b => ', b)
  const name = 'aaa'
  return name
})
