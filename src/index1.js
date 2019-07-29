(function (root) {

  const modules = {}

  /**
   * - Module.id       // 模块id
- Module.name     // 模块名字
- Module.src      // 模块的真实的uri路径
- Module.dependencies    // 模块的依赖
- Module.onSucceed       // 模块的成功回调函数
- Module.onError         // 模块的失败回调函数
- Module.STATUS   // 模块的状态（等待中、正在网络请求、准备执行、执行成功、出现错误……）
   */

  const STATUS = {
    PENDING: 'PENDING',
    FETCHING: 'FETCHING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED'
  }

  function Module(mod) {
    this.id = mod.id
    this.name = mod.name
    this.src = mod.src
    this.dependencies = mod.dependencies
    this.onSucceed = mod.onSucceed
    this.onError = mod.onError
    this.STATUS = mod.STATUS
  }

  function getEntry() {
    const entry = document
      .querySelector('script[data-main]')
      .getAttribute('data-main')
    console.log('entry => ', entry)

    loadScript(entry)
  }

  function getCurrentJs() {
    return document.currentScript.src
  }

  function loadScript(url, callback) {
    const node = document.createElement('script')
    node.type = 'text/javascript'

    node.onload = function() {
      callback && callback()
    }
    node.onerror = function() {
      throw new Error(`Load script: ${url} failed!`)
    }

    node.src = url

    const head = document.getElementsByTagName('head')[0]
    head.appendChild(node)
  }

  function require(dependencies, callback) {
    dependencies.forEach(function(dep) {
      loadScript(dep, function() {})
    })
  }

  function define(id, dependencies, factory) {

  }

  function run() {
    getEntry()
  }

  root.require = require
  root.define = define

  run()

})(this);
