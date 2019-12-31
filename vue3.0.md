# Vue3.0

## vue composition API 

- Vue3使用ts实现类型推断，新版api全部采用普通函数让编写代码可以享受完整的类型推断（避免使用装饰器@）
- 解决了多组件间逻辑重用的问题（解决：高阶组件（共用的东西写在父组件，驱动子组件展示不同的子组件）、mixin（造成命名冲突）、作用域插槽（造成数据来源不清楚））
- Composition Api使用简单

## vue3.0源码结构

- compiler-core 编译的时候的源码
- compiler-dom 编译成浏览器的源码
- reacttivity vue3.0响应式的源码
- runtime-core 运行的时候的源码
- runtime-dom 运行浏览器的源码
- runtime-test 运行的单元测试的源码
- server-renderer 服务端渲染的时候的源码 ssr
- shared 一些共享的源码
- template-explorer 模板导出的一些源码
- vue 整个上面的源码

## vue2.0响应式原理

~~~
let oldArraryPrototype = Array.prototype
let proto = Object.create(oldArraryPrototype) // 继承 继承他原来的属性
let arrrayMethod = ['push', 'shift', 'unshift', 'pop']
arrrayMethod.forEach(method => {
  // 重写他对应的方法
  proto[method] = function() { //函数劫持 把函数进行重写，内部继续调用老的方法
    updateView() // 切片式编程
    oldArraryPrototype[method].call(this,...arguments)
  }
})

function observer(target) {
  if(typeof target !== 'object' || target == null) {
    return target
  }
  if(Array.isArray(target)){  // 拦截数组，给数组的方法进行重写
    Object.setPrototypeOf(target, proto)  // 这个两个是等价的  如果不支持的话写个循环赋值
    // target._proto_ = proto
  }
  for(let key in target) {
    defineReactive(target, key, target[key])
  }
}

function defineReactive(target, key, value) {
  observer(value)
  Object.defineProperty(target, key, {
    get() { // 会进行依赖收集
      return value
    },
    set(newValue) {
      if(newValue !== value) {
        observer(newValue)
        updateView();
        value = newValue;
      }
    }
  })
}

function updateView () {
  console.log('视图更新')
}

let data = {name: 2222,age: {a: '222'}, arr: [1,2,3,4]}
observer(data)
data.arr.push(111)

~~~

## vue3.0响应式原理

