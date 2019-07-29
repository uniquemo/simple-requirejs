# mo-requirejs
自己实现一个requirejs

## Module Object
- Module.id       // 模块id
- Module.name     // 模块名字
- Module.src      // 模块的真实的uri路径
- Module.dependencies    // 模块的依赖
- Module.onSucceed       // 模块的成功回调函数
- Module.onError         // 模块的失败回调函数
- Module.STATUS   // 模块的状态（等待中、正在网络请求、准备执行、执行成功、出现错误……）

## Questions
- 如何分析处理依赖？
- 如何解决循环依赖？

## Usage

define(id?, dependencies?, factory)
id：指定义中模块的名字（可选）。如果没有提供该参数，模块的名字应该默认为模块加载器请求的指定脚本的名字。如果提供了该参数，模块名必须是“顶级”的和绝对的（不允许相对名字）。
dependencies：当前模块依赖的，已被模块定义的模块标识的数组字面量（可选）。
factory：一个需要进行实例化的函数或者一个对象。
require, exports, module 三个模块是顶级模块。

define(function (require, exports, module) {
  var reqModule = require("./someModule");
  requModule.test();
    
  exports.asplode = function () {
      //someing
  }
});

- 异步“加载”；
- 按需加载；
- 更加方便的模块依赖管理；
- 更加高效的版本管理。config配置路径；
- 当然还有一些诸如 cdn 加载不到 js 文件，可以请求本地文件等其它的优点。

data-main设置入口文件：
require.config({
    baseUrl: 'js',
    paths: {
        jquery: 'lib/jquery-1.11.1',
    }
});
 
require(['jquery', 'script/hello'],function ($, hello) {
    $("#btn").click(function(){
      hello.showMessage("hangge.com");
    });
});

要改变 RequireJS 的默认配置，可以使用 require.config 函数传入一个可选参数对象。下面是一些可以使用的配置：
baseUrl：用于加载模块的根路径。在配置这个属性后，以后的文件都是在这个路径下查找内容了。
paths：用于一些常用库或者文件夹路径映射，方便后面使用，省得每次都要输入一长串路径。（js 文件的后缀可以省略）
shim：加载非 AMD 规范的 js，并解决其载入顺序。

```javascript
require.config({
  baseUrl: 'js',
  paths: {
    jquery: 'lib/jquery-1.11.1'
  },
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'underscore': {
      exports: '_'
    },
    'modal':{//模态框插件不是模块化
      deps: ['jquery'],
      export: "modal"
    },
  },
  map: {
    'script/newmodule': {
      'foo': 'foo1.2'
    },
    'script/oldmodule': {
      'foo': 'foo1.0'
    }
  },
  config: {
    'script/bar': {
      size: 'large'
    },
    'script/baz': {
      color: 'blue'
    }
  }
});
```
