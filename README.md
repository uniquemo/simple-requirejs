# simple-requirejs
自己实现一个requirejs

## RequireJs Usage
### define定义模块
define(id?, dependencies?, factory)
- id：指定义中模块的名字（可选）。如果没有提供该参数，模块的名字应该默认为模块加载器请求的指定脚本的名字。如果提供了该参数，模块名必须是“顶级”的和绝对的（不允许相对名字）。
- dependencies：当前模块依赖的，已被模块定义的模块标识的数组字面量（可选）。
- factory：一个需要进行实例化的函数或者一个对象。
- require, exports, module 三个模块是顶级模块。
```javascript
define(['a', 'b'], function(a, b) {
  // do something
})
```

### require调用模块
```javascript
// data-main设置入口文件：
require.config({
  baseUrl: 'js',
  paths: {
    jquery: 'lib/jquery-1.11.1',
  }
})
 
require(['jquery', 'script/hello'],function ($, hello) {
  $("#btn").click(function() {
    hello.showMessage("hangge.com")
  })
})
```

要改变 RequireJS 的默认配置，可以使用 require.config 函数传入一个可选参数对象。下面是一些可以使用的配置：
- baseUrl：用于加载模块的根路径。在配置这个属性后，以后的文件都是在这个路径下查找内容了。
- paths：用于一些常用库或者文件夹路径映射，方便后面使用，省得每次都要输入一长串路径。（js 文件的后缀可以省略）
- shim：加载非 AMD 规范的 js，并解决其载入顺序。

## mo-requirejs
### Module Object
- Module.id       // 模块id
- Module.name     // 模块名字
- Module.src      // 模块的真实的uri路径
- Module.dependencies    // 模块的依赖
- Module.onSucceed       // 模块的成功回调函数
- Module.onError         // 模块的失败回调函数
- Module.STATUS   // 模块的状态(INITED, FETCHING, FETCHED, EXECUTING, EXECUTED, ERROR)

### Questions
- 如何分析处理依赖？
- 如何解决循环依赖？

#### 如何分析处理依赖？
#### 如何解决循环依赖？
参考下别人是怎么解决的：
- [Commonjs和ES6的循环依赖](http://www.ruanyifeng.com/blog/2015/11/circular-dependency.html)
- [seajs的循环依赖](https://github.com/seajs/seajs/issues/732)
- [requirejs的循环依赖](https://requirejs.org/docs/api.html#circular)

#### Commonjs模块的循环加载
CommonJS模块的重要特性是加载时执行，即脚本代码在require的时候，就会全部执行。CommonJS的做法是，`一旦出现某个模块被"循环加载"，就只输出已经执行的部分，还未执行的部分不会输出`。

#### ES6模块的循环加载
- ES6模块的运行机制与CommonJS不一样，`它遇到模块加载命令import时，不会去执行模块，而是只生成一个引用。等到真的需要用到时，再到模块里面去取值`。
- ES6根本不会关心是否发生了"循环加载"，只是生成一个指向被加载模块的引用，需要开发者自己保证，真正取值的时候能够取到值。
