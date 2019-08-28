import Watcher from '../observer/Watcher'

class Compiler {
  constructor(el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)

    if (this.$el) {
      this.$fragment = this.node2Fragment(this.$el)
      this.init()
      this.$el.appendChild(this.$fragment);
    }
  }

  node2Fragment(el) {
    let fragment = document.createDocumentFragment()
    let child

    while ((child = el.firstChild)) {
      fragment.appendChild(child)
    }

    return fragment
  }

  init() {
    this.compileElement(this.$fragment)
  }

  compileElement(el) {
    const childNodes = el.childNodes

    ;[].slice.call(childNodes).forEach(node => {
      const text = node.textContent
      const reg = /\{\{(.*)\}\}/

      if (this.isElementNode(node)) {
        this.compile(node)
      } else if (this.isTextNode(node) && reg.test(text)) {
        this.compileText(node, RegExp.$1.trim())
      }

      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }

  compile(node) {
    const nodeAttrs = node.attributes

    ;[].slice.call(nodeAttrs).forEach(attr => {
      const attrName = attr.name
      if (this.isDirective(attrName)) {
        const exp = attr.value
        const dir = attrName.substring(2)
        if (this.isEventDirective(dir)) {
          compileUtil.eventHandler(node, this.$vm, exp, dir)
        } else {
          compileUtil[dir] && compileUtil[dir](node, this.$vm, exp)
        }

        node.removeAttribute(attrName)
      }
    })
  }

  compileText(node, exp) {
    compileUtil.text(node, this.$vm, exp)
  }

  isElementNode(node) {
    return node.nodeType === 1
  }

  isTextNode(node) {
    return node.nodeType == 3
  }

  isDirective(attr) {
    return attr.indexOf('v-') == 0
  }

  isEventDirective(dir) {
    return dir.indexOf('on') === 0
  }
}

const compileUtil = {
  bind: function(node, vm, exp, dir) {
    const updaterFn = updater[dir + 'Updater']

    updaterFn && updaterFn(node, this._getVMVal(vm, exp))

    new Watcher(vm, exp, function(value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue)
    })
  },

  text: function(node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },

  html: function(node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },

  model: function(node, vm, exp) {
    this.bind(node, vm, exp, 'model')

    let val = this._getVMVal(vm, exp)
    node.addEventListener('input', e => {
      var newValue = e.target.value
      if (val === newValue) {
        return
      }

      this._setVMVal(vm, exp, newValue)
      val = newValue
    })
  },

  class: function(node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },

  eventHandler: function(node, vm, exp, dir) {
    const eventType = dir.split(':')[1]
    const fn = vm.$options.methods && vm.$options.methods[exp]

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },

  _getVMVal: function(vm, exp) {
    let val = vm
    exp = exp.split('.')
    exp.forEach(k => {
      val = val[k]
    })
    return val
  },

  _setVMVal: function(vm, exp, value) {
    let val = vm
    exp = exp.split('.')
    exp.forEach((k, i) => {
      if (i < exp.length - 1) {
        val = val[k]
      } else {
        val[k] = value
      }
    })
  }
}

const updater = {
  textUpdater: function(node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value
  },

  htmlUpdater: function(node, value) {
    node.innerHTML = typeof value == 'undefined' ? '' : value
  },

  classUpdater: function(node, value, oldValue) {
    let className = node.className
    className = className.replace(oldValue, '').replace(/\s$/, '')

    const space = className && String(value) ? ' ' : ''

    node.className = className + space + value
  },

  modelUpdater: function(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value
  }
}

export default Compiler
