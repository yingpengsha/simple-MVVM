import Compiler from './compiler'
import observe from './observer'
import Watcher from './observer/Watcher'

class MVVM {
  constructor(options = {}) {
    this.$options = options
    const data = (this._data = this.$options.data)

    Object.keys(data).forEach(key => {
      this._proxyData(key)
    })

    this._initComputed()

    observe(data)

    this.$compile = new Compiler(options.el || document.body, this)
  }

  $watch(key, cb, options) {
    new Watcher(this, key, cb)
  }

  _proxyData(key, setter, getter) {
    const self = this
    setter =
      setter ||
      Object.defineProperty(self, key, {
        configurable: false,
        enumerable: true,
        get: function proxyGetter() {
          return self._data[key]
        },
        set: function proxySetter(newVal) {
          self._data[key] = newVal
        }
      })
  }

  _initComputed() {
    const computed = this.$options.computed
    if (typeof computed === 'object') {
      Object.keys(computed).forEach(key => {
        Object.defineProperty(this, key, {
          get: typeof computed[key] === 'function'
              ? computed[key]
              : computed[key].get,
          set: function() {}
        })
      })
    }
  }
}

window.MVVM = MVVM
