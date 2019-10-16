// proxy的缺点 兼容性查 ie11不能用
let toProxy = new WeakMap(); // 弱引用映射表 es6的语法 放置的是原对象，代理过的对象
let toRaw = new WeakMap(); // 被代理过的对象， 原对象
function isObject(val) {
  return typeof val === 'object' && val !== null;
}
// 判断当前对象有没有key
function hasOwn(target, key) {
  return target.hasOwnProperty(key);
}

function reactive(target) {
  return createReactiveObject(target)
}

function createReactiveObject(target) {
  if(!isObject(target)) {
    return target
  }
  let proxy = toProxy.get(target);  // 如果已经代理了， 就将代理的结果返回即可
  if(proxy){
    return proxy
  }
  if(toRaw.has(target)) { //防止一个对象多次代理
    return target
  }
  let handler = {
    // target 指的是对象，key对应的属性，receiver代理的对象
    // reflect 优点不回报错， 有返回值，后续会代替Object
    get(target, key, receiver) {
      // 这里使用的proxy + reflect(反射) target[key] 等价于 Reflect.get(target,key,receiver)
      // 使用reflect的好处是如果设置不成功的话他会返回bool值确实是否设置成功
      // Object.setPrototypeOf() Object.getPrototypeOf() 返回的并不是什么原型， 但是Reflect返回的是原型
      // Object.getOwnPropertyDescriptor() 不能遍历symbol属性， 但是Reflect.ownKeys()就可以遍历symbol属性

      // 在get进行依赖收集， 也就是这行发布-订阅
      console.log('获取')
      track(target, key)
      const result = Reflect.get(target,key,receiver);
      // result 展示当前获取的值
      return isObject(result) ? reactive(result) : result
    },
    set(target, key, value, receiver) {
      // 怎么去识别改属性 还是新增属性 根据target上面有没有key
      const hadkey = hasOwn(target, key);
      let oldValue = target[key];
      const res = Reflect.set(target, key, value, receiver)
      if(!hadkey) {
        trigger(target, 'add',key)
      }else if(oldValue !== value){ // 属性修改过了
        trigger(target, 'set', key)
        console.log('修改属性')
      } // 为了屏蔽无意义的修改
      // target[key] = value 等价于 Reflect.set(target, key, value, receiver)
      return res
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key)
      console.log('删除')
      return res
    }
  }
  const observed = new Proxy(target, handler)
  toProxy.set(target,observed) // 如果没有代理过以后返回的是 observed
  toRaw.set(observed,target)  // 如果有代理过以后返回的是 target
  return observed
}
// 存在到effect栈中
let activeEffectStacks = [];
/* {
  target:{
    key: [fn, fn]
  }
} */
let targetMap = new WeakMap();
function track(target, key) { // 如果这个target中的key变化了， 我就执行数组的方法
  let effect = activeEffectStacks[activeEffectStacks.length - 1];
  if(effect) { // 有对应关系的时候才创建
    let depsMap = targetMap.get(target);
    if(!depsMap) {
      targetMap.set(target,depsMap = new Map);
    }
    let deps = depsMap.get(key)
    if(!deps) {
      depsMap.set(key, deps = new Set())
    }
    if(!deps.has(effect)){
      deps.add(effect);
    }
  }// 创建依赖关系
}

function trigger(target, type, key) {
  let depsMap = targetMap.get(target);
  if(depsMap) {
    let deps = depsMap.get(key);
    if(deps) {// 将当前对应的effect一次执行
      deps.forEach(effect => {
        effect();
      })
    }
  }
}

// 响应式 副作用
function effect(fn) {
  // 需要把fn函数编程编程响应式函数
  let effect = createReactiveEffect(fn); // 创建响应式的effect
  effect(); // 默认的去执行一下
}

function createReactiveEffect(fn) {
  let effect = function (){ // 这个就是创建响应式的effect
    return run(effect, fn) // 运行fn执行， 第二个是把effect存在栈中
  }
  return effect;
}
function run(effect, fn) {
  try{
    activeEffectStacks.push(effect);
    fn(); // 利用vue2和vue3一样 js是单线程
  }finally {
    activeEffectStacks.pop();
  }
}
// 依赖收集  (发布订阅)
/* let obj = reactive({name: 'sufan'})
effect(() => {
  console.log(obj.name)
})
obj.name='1111' */

// 代理对象
/* let arr = [1,2,3,4];
let proxy = reactive(arr)
proxy.push(5)
proxy.length = 100 */
/* let proxy = reactive({name: {a: 1}}) // 多层代理，通过get方法来代理实现 使用的是三元表达式
proxy.name.a = '3333'
reactive(proxy) // 重复代理是使用的是hash映射 {key: value} */
let arr = {name: '11'}
reactive(arr)
let proxy = reactive(arr)
