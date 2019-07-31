let modId = 0         // 模块ID
let taskId = 0
const modules = {}
const tasks = {}

// { 模块id: 依赖该模块的模块列表 }，用于方便操作当模块加载完成后，处理依赖该模块的相应模块。
const mapDepToModuleOrTask = {}

class Module {
  constructor(name, deps, onSucceed, onError) {
    if (name === 'TASK') return   // 用于区分task
    this.modId = ++modId
    this.init(name, deps, onSucceed, onError)
    this.fetch()
  }

  static MSTATUS = {
    INITED: 'INITED',
    FETCHING: 'FETCHING',
    FETCHED: 'FETCHED',
    EXECUTING: 'EXECUTING',
    EXECUTED: 'EXECUTED',
    ERROR: 'ERROR'
  }

  init(name, deps, onSucceed, onError) {
    this.name = name
    this.src = utils.moduleNameToModulePath(name)
    this.deps = deps
    this.onSucceed = onSucceed
    this.onError = onError
    this.statusHook(Module.MSTATUS.INITED)
  }

  fetch() {
    const node = document.createElement('script')
    node.type = 'text/javascript'
    node.onload = this.fetchSucceed.bind(this)
    node.onerror = this.fetchFailed.bind(this)
    node.src = this.src

    const head = document.getElementsByTagName('head')[0]
    head.appendChild(node)
    this.statusHook(Module.MSTATUS.FETCHING)
  }

  fetchSucceed() {
    this.statusHook(Module.MSTATUS.FETCHED)
  }

  fetchFailed() {
    this.statusHook(Module.MSTATUS.ERROR)

    if (this.onError) {
      this.onError()
    } else {
      throw new Error(`Load script: ${this.src} failed!`)
    }
  }

  statusHook(mStatus) {
    let status = mStatus
    if (!this.status) {
      Object.defineProperty(this, 'status', {
        get() {
          return status
        },
        set(newStatus) {
          status = newStatus
          if (newStatus === Module.MSTATUS.EXECUTED) {
            let depModules = mapDepToModuleOrTask[this.name]
            if (!depModules) return
            depModules.forEach((mod) => {
              setTimeout(() => {
                mod.depCount--
              })
            })
          }
        }
      })
    } else {
      this.status = mStatus
    }
  }

  checkCycleDeps() {
    const cycleDeps = []

    for (let depModuleName of (this.deps || [])) {
      const modDependedBy = mapDepToModuleOrTask[this.name]
      if (modDependedBy && modDependedBy.indexOf(modules[depModuleName]) !== -1) {
        cycleDeps.push(depModuleName)
      }
    }

    return cycleDeps.length ? cycleDeps : undefined
  }

  analyzeDeps() {
    let depCount = this.deps ? this.deps.length : 0

    // 处理deps中包含'require'的特殊情况
    const requireInDepIdx = (this.deps || []).indexOf('require')
    if (requireInDepIdx !== -1) {
      depCount--
      this.requireInDepIdx = requireInDepIdx
      this.deps.splice(requireInDepIdx, 1)
    }

    // 处理循环依赖情况
    // 现象：模块无法往下执行。
    // 循环依赖的原因：卡住了，depCount值无法变为0，execute()无法被执行，所以得减小depCount的值。
    const cycleDeps = this.checkCycleDeps()
    if (cycleDeps) {
      depCount = depCount - cycleDeps.length
    }

    if (depCount === 0) {
      this.execute()
      return
    }

    this.depCount = depCount
    if (!this.depCount) return

    Object.defineProperty(this, 'depCount', {
      get() {
        return depCount
      },
      set(newDepCount) {
        depCount = newDepCount
        if (newDepCount === 0) {
          if (this.modId) {
            console.log(`模块 ${this.name} 的依赖已经全部准备好`)
          } else if (this.taskId) {
            console.log(`任务 ${this.taskId} 的依赖已经全部准备好`)
          }
          this.execute()
        }
      }
    })

    // 这里，结合上面的checkCycleDeps()解决了循环依赖的问题。
    // why?
    // 因为如果前面已经加载的模块，就不再加载了，同时depCount的值也减去了相应的值(循环依赖模块的个数)，当没加载过的模块加载完毕后，
    // depCount值变为0时，就会执行模块的回调函数。
    this.deps.forEach((depModuleName) => {
      if (!modules[depModuleName]) {
        const mod = new Module(depModuleName)
        modules[mod.name] = mod
      }

      if (!mapDepToModuleOrTask[depModuleName]) {
        mapDepToModuleOrTask[depModuleName] = []
      }

      mapDepToModuleOrTask[depModuleName].push(this)
    })
  }

  execute() {
    this.statusHook(Module.MSTATUS.EXECUTING)

    // 根据依赖数组向依赖模块收集exports当做参数
    let args = (this.deps || []).map((dep) => {
      return modules[dep].exports
    })

    // 插入require到回调函数的参数列表中
    if (this.requireInDepIdx !== -1 && this.requireInDepIdx !== undefined) {
      args.splice(this.requireInDepIdx, 0, require)
    }

    this.exports = this.onSucceed.apply(this, args)
    this.statusHook(Module.MSTATUS.EXECUTED)

    if (this.taskId) {
      console.log(`任务 ${this.taskId} 执行完成`)
    } else if (this.modId) {
      console.log(`模块 ${this.name} 执行完成`)
    }
  }
}

class Task extends Module {
  constructor(deps, onSucceed, onError) {
    super('TASK', deps, onSucceed, onError)
    this.taskId = ++taskId
    this.init(deps, onSucceed, onError)
  }

  init(deps, onSucceed, onError) {
    this.deps = deps
    this.onSucceed = onSucceed
    this.onError = onError
    tasks[this.taskId] = this
  }
}

const utils = {
  getEntryName: function() {
    const entry = document.currentScript.getAttribute('data-main')
    return utils.modulePathToModuleName(entry)
  },
  moduleNameToModulePath: function(name) {
    let reg = /\w*.js/
    let output = reg.exec(name)
    if (!output) {
      return `./${name}.js`
    } else {
      return name
    }
  },
  modulePathToModuleName: function(path) {
    let reg = /\w*.js/
    let output = reg.exec(path)
    if (!output) {
      return path
    } else {
      return output[0].split('.')[0]
    }
  },
  getCurrentModuleName: function() {
    const src = document.currentScript.getAttribute('src')
    return utils.modulePathToModuleName(src)
  },
  isFunction: function(fn) {
    return typeof fn === 'function'
  },
  isString: function(str) {
    return typeof str === 'string'
  }
}

const define = function(name, deps, onSucceed, onError) {
  if (utils.isFunction(name)) {
    onSucceed = name
    name = utils.getCurrentModuleName()
  } else if (Array.isArray(name) && utils.isFunction(deps)) {
    onSucceed = deps
    deps = name
    name = utils.getCurrentModuleName()
  } else if (utils.isString(name) && Array.isArray(deps) && utils.isFunction(onSucceed)) {
  }

  let mod = modules[name]
  if (!mod) {
    mod = new Module(name, deps, onSucceed, onError)
  } else {
    // 这里需要重新赋值，因为一开始入口文件的依赖模块新建时，并不知道该依赖模块的回调函数及其自身所依赖的模块
    mod.name = name
    mod.deps = deps
    mod.onSucceed = onSucceed
    mod.onError = onError
  }
  mod.analyzeDeps()
}

const require = function(deps, onSucceed, onError) {
  if (utils.isFunction(deps)) {
    onSucceed = deps
    deps = undefined
  }

  const task = new Task(deps, onSucceed, onError)
  task.analyzeDeps()
}

window.define = define
window.require = require

// 把入口模块添加到modules对象中
const entryModule = new Module(utils.getEntryName())
modules[entryModule.name] = entryModule
console.log('modules => ', modules)
console.log('tasks => ', tasks)
console.log('mapDepToModuleOrTask => ', mapDepToModuleOrTask)
