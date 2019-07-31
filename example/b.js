define(['a', 'c'], function(a, c) {
  console.log('模块 b 内部引用的模块 a => ', a)
  console.log('模块 b 内部引用的模块 c => ', c)
  const name = 'bbb'
  return name
})
