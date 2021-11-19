function createStore(reducer, preloadedState, enhancer) {
  // 约束reducer 参数类型
  if (typeof reducer !== 'function') throw new Error('reducer必须是函数')
  // 判断 enhancer有没有传递
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('enhancer 必须是函数')
    }
    return enhancer(createStore)(reducer, preloadedState)
  }
  // store 对象中存储的状态
  let currentState = preloadedState
  // 存放订阅者函数
  let currentListeners = []
  // 获取状态
  function getState() {
    return currentState
  }

  // 触发action
  function dispatch(action) {
    if (!isPlainObject(action)) throw new Error('action 不是一个对象')

    if (typeof action.type === 'undefined')
      throw new Error('action对象中必须要有type属性')

    currentState = reducer(currentState, action)
    // 循环数组，调用订阅者
    for (let i = 0; i < currentListeners.length; i++) {
      // 获取订阅者
      let listener = currentListeners[i]
      // 调用订阅者
      listener()
    }
  }

  function subscribe(listener) {
    currentListeners.push(listener)
  }

  return {
    getState,
    dispatch,
    subscribe,
  }
}

// 判断obj参数是否是对象
function isPlainObject(obj) {
  // 排除基本数据类型和空
  if (typeof obj !== 'object' || obj === null) return false
  // 区分数组和对象 原型对象对比
  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }
  return Object.getPrototypeOf(obj) === proto
}

function applyMiddleWare(...middlewares) {
  return function (createStore) {
    return function (reducer, preloadedState) {
      let store = createStore(reducer, preloadedState)
      // 阉割版的store
      let middlewareAPI = {
        getState: store.getState,
        dispatch: store.dispatch,
      }
      // 调用中间件的第一层函数
      let chain = middlewares.map((middleware) => middleware(middlewareAPI))
      let dispatch = compose(...chain)(store.dispatch)
      return {
        ...store,
        dispatch,
      }
    }
  }
}

function compose() {
  let funcs = [...arguments]
  return function (dispatch) {
    for (let i = funcs.length - 1; i >= 0; i--) {
      dispatch = funcs[i](dispatch)
    }
    return dispatch
  }
}

function bindActionCreator(actionCreators, dispatch) {
  let boundActionCreators = {}

  for (const key in actionCreators) {
    ;(function (key) {
      boundActionCreators[key] = function () {
        dispatch(actionCreators[key]())
      }
    })(key)
  }

  return boundActionCreators
}

function combineReducers(reducers) {
  // 检查renders必须是函数
  let reducersKeys = Object.keys(rducers)
  for (let i = 0; i < reducersKeys.length; i++) {
    let key = reducersKeys[i]
    if (typeof reducers[key] !== 'function')
      throw new Error('reducer必须是函数')
  }
  // 2. 调用一个个小的reducer
  return function (state, action) {
    let nextState = {}
    for (let i = 0; i < reducersKeys.length; i++) {
      let key = reducersKeys[i]
      let reducer = reducers[key]
      let previousStateForKey = state[key]
      nextState[key] = reducer(previousStateForKey, action)
    }
    return nextState
  }
}
