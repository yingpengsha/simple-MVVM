(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Watcher = require('../observer/Watcher');

var _Watcher2 = _interopRequireDefault(_Watcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Compiler = function () {
  function Compiler(el, vm) {
    _classCallCheck(this, Compiler);

    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);

    if (this.$el) {
      this.$fragment = this.node2Fragment(this.$el);
      this.init();
      this.$el.appendChild(this.$fragment);
    }
  }

  _createClass(Compiler, [{
    key: 'node2Fragment',
    value: function node2Fragment(el) {
      var fragment = document.createDocumentFragment();
      var child = void 0;

      while (child = el.firstChild) {
        fragment.appendChild(child);
      }

      return fragment;
    }
  }, {
    key: 'init',
    value: function init() {
      this.compileElement(this.$fragment);
    }
  }, {
    key: 'compileElement',
    value: function compileElement(el) {
      var _this = this;

      var childNodes = el.childNodes;[].slice.call(childNodes).forEach(function (node) {
        var text = node.textContent;
        var reg = /\{\{(.*)\}\}/;

        if (_this.isElementNode(node)) {
          _this.compile(node);
        } else if (_this.isTextNode(node) && reg.test(text)) {
          _this.compileText(node, RegExp.$1.trim());
        }

        if (node.childNodes && node.childNodes.length) {
          _this.compileElement(node);
        }
      });
    }
  }, {
    key: 'compile',
    value: function compile(node) {
      var _this2 = this;

      var nodeAttrs = node.attributes;[].slice.call(nodeAttrs).forEach(function (attr) {
        var attrName = attr.name;
        if (_this2.isDirective(attrName)) {
          var exp = attr.value;
          var dir = attrName.substring(2);
          if (_this2.isEventDirective(dir)) {
            compileUtil.eventHandler(node, _this2.$vm, exp, dir);
          } else {
            compileUtil[dir] && compileUtil[dir](node, _this2.$vm, exp);
          }

          node.removeAttribute(attrName);
        }
      });
    }
  }, {
    key: 'compileText',
    value: function compileText(node, exp) {
      compileUtil.text(node, this.$vm, exp);
    }
  }, {
    key: 'isElementNode',
    value: function isElementNode(node) {
      return node.nodeType === 1;
    }
  }, {
    key: 'isTextNode',
    value: function isTextNode(node) {
      return node.nodeType == 3;
    }
  }, {
    key: 'isDirective',
    value: function isDirective(attr) {
      return attr.indexOf('v-') == 0;
    }
  }, {
    key: 'isEventDirective',
    value: function isEventDirective(dir) {
      return dir.indexOf('on') === 0;
    }
  }]);

  return Compiler;
}();

var compileUtil = {
  bind: function bind(node, vm, exp, dir) {
    var updaterFn = updater[dir + 'Updater'];

    updaterFn && updaterFn(node, this._getVMVal(vm, exp));

    new _Watcher2.default(vm, exp, function (value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue);
    });
  },

  text: function text(node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },

  html: function html(node, vm, exp) {
    this.bind(node, vm, exp, 'html');
  },

  model: function model(node, vm, exp) {
    var _this3 = this;

    this.bind(node, vm, exp, 'model');

    var val = this._getVMVal(vm, exp);
    node.addEventListener('input', function (e) {
      var newValue = e.target.value;
      if (val === newValue) {
        return;
      }

      _this3._setVMVal(vm, exp, newValue);
      val = newValue;
    });
  },

  class: function _class(node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },

  eventHandler: function eventHandler(node, vm, exp, dir) {
    var eventType = dir.split(':')[1];
    var fn = vm.$options.methods && vm.$options.methods[exp];

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  },

  _getVMVal: function _getVMVal(vm, exp) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function (k) {
      val = val[k];
    });
    return val;
  },

  _setVMVal: function _setVMVal(vm, exp, value) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function (k, i) {
      if (i < exp.length - 1) {
        val = val[k];
      } else {
        val[k] = value;
      }
    });
  }
};

var updater = {
  textUpdater: function textUpdater(node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },

  htmlUpdater: function htmlUpdater(node, value) {
    node.innerHTML = typeof value == 'undefined' ? '' : value;
  },

  classUpdater: function classUpdater(node, value, oldValue) {
    var className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '');

    var space = className && String(value) ? ' ' : '';

    node.className = className + space + value;
  },

  modelUpdater: function modelUpdater(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }
};

exports.default = Compiler;
},{"../observer/Watcher":4}],2:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _compiler = require('./compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _observer = require('./observer');

var _observer2 = _interopRequireDefault(_observer);

var _Watcher = require('./observer/Watcher');

var _Watcher2 = _interopRequireDefault(_Watcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MVVM = function () {
  function MVVM() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, MVVM);

    this.$options = options;
    var data = this._data = this.$options.data;

    Object.keys(data).forEach(function (key) {
      _this._proxyData(key);
    });

    this._initComputed();

    (0, _observer2.default)(data);

    this.$compile = new _compiler2.default(options.el || document.body, this);
  }

  _createClass(MVVM, [{
    key: '$watch',
    value: function $watch(key, cb, options) {
      new _Watcher2.default(this, key, cb);
    }
  }, {
    key: '_proxyData',
    value: function _proxyData(key, setter, getter) {
      var self = this;
      setter = setter || Object.defineProperty(self, key, {
        configurable: false,
        enumerable: true,
        get: function proxyGetter() {
          return self._data[key];
        },
        set: function proxySetter(newVal) {
          self._data[key] = newVal;
        }
      });
    }
  }, {
    key: '_initComputed',
    value: function _initComputed() {
      var _this2 = this;

      var computed = this.$options.computed;
      if ((typeof computed === 'undefined' ? 'undefined' : _typeof(computed)) === 'object') {
        Object.keys(computed).forEach(function (key) {
          Object.defineProperty(_this2, key, {
            get: typeof computed[key] === 'function' ? computed[key] : computed[key].get,
            set: function set() {}
          });
        });
      }
    }
  }]);

  return MVVM;
}();

window.MVVM = MVVM;
},{"./compiler":1,"./observer":5,"./observer/Watcher":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var uid = 0;

var Dep = function () {
  function Dep() {
    _classCallCheck(this, Dep);

    this.id = uid += 1;
    this.subs = [];
  }

  _createClass(Dep, [{
    key: "addSub",
    value: function addSub(sub) {
      this.subs.push(sub);
    }
  }, {
    key: "depend",
    value: function depend() {
      Dep.target.addDep(this);
    }
  }, {
    key: "notify",
    value: function notify() {
      this.subs.forEach(function (sub) {
        sub.update();
      });
    }
  }]);

  return Dep;
}();

Dep.target = null;

exports.default = Dep;
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dep = require('./Dep');

var _Dep2 = _interopRequireDefault(_Dep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Watcher = function () {
  function Watcher(vm, expOrFn, cb) {
    _classCallCheck(this, Watcher);

    this.vm = vm;
    this.cb = cb;
    this.depIds = {};

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = this.parseGetter(expOrFn);
    }

    this.value = this.get();
  }

  _createClass(Watcher, [{
    key: 'update',
    value: function update() {
      this.run();
    }
  }, {
    key: 'run',
    value: function run() {
      var newVal = this.get();
      var oldVal = this.value;
      if (newVal !== oldVal) {
        this.value = newVal;
        this.cb.call(this.vm, newVal, oldVal);
      }
    }
  }, {
    key: 'addDep',
    value: function addDep(dep) {
      if (!this.depIds.hasOwnProperty(dep.id)) {
        dep.addSub(this);
        this.depIds[dep.id] = dep;
      }
    }
  }, {
    key: 'get',
    value: function get() {
      _Dep2.default.target = this;
      var value = this.getter.call(this.vm, this.vm);
      _Dep2.default.target = null;
      return value;
    }
  }, {
    key: 'parseGetter',
    value: function parseGetter(exp) {
      if (/[^\w.$]/.test(exp)) return;

      var segments = exp.split('.');
      return function (obj) {
        for (var i = 0; i < segments.length; i++) {
          if (!obj) return;
          obj = obj[segments[i]];
        }
        return obj;
      };
    }
  }]);

  return Watcher;
}();

exports.default = Watcher;
},{"./Dep":3}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = observe;

var _Dep = require('./Dep');

var _Dep2 = _interopRequireDefault(_Dep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function observe(value) {
  if (!value || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
    return;
  }

  return new Observer(value);
}

var Observer = function () {
  function Observer(value) {
    _classCallCheck(this, Observer);

    this.value = value;
    this.walk(value);
  }

  _createClass(Observer, [{
    key: 'walk',
    value: function walk(obj) {
      var _this = this;

      Object.keys(obj).forEach(function (key) {
        _this.defineReactive(obj, key, obj[key]);
      });
    }
  }, {
    key: 'defineReactive',
    value: function defineReactive(obj, key, val) {
      var dep = new _Dep2.default();

      var property = Object.getOwnPropertyDescriptor(obj, key);
      if (property && property.configurable === false) {
        return;
      }

      var childObj = observe(val);
      Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function get() {
          if (_Dep2.default.target) {
            dep.depend();
          }
          return val;
        },
        set: function set(newVal) {
          if (val === newVal) {
            return;
          }
          val = newVal;
          childObj = observe(newVal);
          dep.notify();
        }
      });
    }
  }]);

  return Observer;
}();
},{"./Dep":3}]},{},[2]);
