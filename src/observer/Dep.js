let uid = 0

class Dep {
  static target = null

  constructor() {
    this.id = uid += 1
    this.subs = []
  }

  addSub(sub) {
    this.subs.push(sub)
  }

  depend() {
    Dep.target.addDep(this)
  }

  notify() {
    this.subs.forEach(sub => {
      sub().update()
    })
  }
}

export default Dep
