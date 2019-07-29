(function () {
'use strict';

let modId = 0; // 模块ID
const MSTATUS = {
  INITED: 'INITED',
  // 初始化完成
  FETCHING: 'FETCHING',
  // 正在网络请求
  FETCHED: 'FETCHED',
  // 网络请求结束(此状态暂时用不到)
  EXECUTING: 'EXECUTING',
  // 准备开始运算模块
  EXECUTED: 'EXECUTED',
  // 模块运算完毕
  ERROR: 'ERROR' // 模块发生错误

};

class Module {
  constructor(name, dependencies, onSucceed, onError) {
    this.modId = ++modId;
    this.init(name, dependencies, onSucceed, onError);
    this.fetch();
  }

  init(name, dependencies, onSucceed, onError) {
    this.name = name;
    this.src = utils.moduleNameToModulePath(name);
    this.dependencies = dependencies;
    this.onSucceed = onSucceed;
    this.onError = onError;
    this.statusHook(MSTATUS.INITED);
  }

  fetch() {
    const node = document.createElement('script');
    node.type = 'text/javascript';
    node.onload = this.fetchSucceed.bind(this);
    node.onerror = this.fetchFailed.bind(this);
    node.src = this.src;
    const head = document.getElementsByTagName('head')[0];
    head.appendChild(node);
    this.statusHook(MSTATUS.FETCHING);
  }

  fetchSucceed() {
    this.onSucceed && this.onSucceed();
    this.statusHook(MSTATUS.FETCHED);
  }

  fetchFailed() {
    this.statusHook(MSTATUS.ERROR);

    if (this.onError) {
      this.onError();
    } else {
      throw new Error(`Load script: ${this.src} failed!`);
    }
  }

  statusHook(mStatus) {
    let status = mStatus;

    if (!this.status) {
      Object.defineProperty(this, 'status', {
        get() {
          return status;
        },

        set(newStatus) {
          status = newStatus;
        }

      });
    } else {
      this.status = mStatus;
    }
  }

}

const utils = {
  getEntryName: function () {
    const entry = document.currentScript.getAttribute('data-main');
    console.log('entry => ', entry);
    return utils.modulePathToModuleName(entry);
  },
  moduleNameToModulePath: function (name) {
    let reg = /\w*.js/;
    let output = reg.exec(name);

    if (!output) {
      return `./${name}.js`;
    } else {
      return name;
    }
  },
  modulePathToModuleName: function (path) {
    let reg = /\w*.js/;
    let output = reg.exec(path);

    if (!output) {
      return path;
    } else {
      return output[0].split('.')[0];
    }
  }
};
const m = new Module(utils.getEntryName());
console.log(m);

}());
