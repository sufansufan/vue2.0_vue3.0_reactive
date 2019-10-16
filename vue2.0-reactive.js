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
