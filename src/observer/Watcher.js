import Dep from './Dep'

class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm
    this.cb = cb
    this.depIds = {}

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
    }

    this.value = this.get()
  }

  update() {
    this.run()
  }

  run() {
    const newVal = this.get()
    const oldVal = this.value
    if (newVal !== oldVal) {
      this.value = value
      this.cb.call(this.vm, newVal, oldVal)
    }
  }

  addDep(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.addSub(this)
      this.depIds[dep.id] = dep
    }
  }

  get() {
    Dep.target = this
    const value = this.getter.call(this.vm, this.vm)
    Dep.target = null
    return value
  }

  parseGetter(exp) {
    if (/[^\w.$]/.test(exp)) return

    const segments = path.split('.')
    return function(obj) {
      for (let i = 0; i < segments.length; i++) {
        if (!obj) return
        obj = obj[segments[i]]
      }
      return obj
    }
  }
}

export default Watcher
