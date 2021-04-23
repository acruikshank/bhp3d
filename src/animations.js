const tween = (o, prop, start, delta, ease) => x => o[prop] = start + ease(x) * delta
const ident = x => x

export class Animations {
    constructor(pages) {
        this.page = 0
        this.fraction = 0
        this.destination = 0
        this.startTime = 0

        this.pages = []
        let pageStart = 0
        for (let i=0; i< pages.length-1; i++) {
            let page = pages[i]
            this.pages.push({
                startTime: pageStart,
                duration: page.duration,
                complete: page.complete,
                transitions: pages[i+1] ? this.computeTransitions(page, pages[i+1]) : []
            })
            pageStart += page.duration
        }
        this.pages.push({
          startTime: pageStart, 
          complete: pages[pages.length-1].complete,
          transitions: this.pages[this.pages.length-1].transitions.map(f => () => f(1))
        })
    }

    transitionToPage(index, time) {
      this.destination = this.pages[index].startTime
      this.lastUpdate = time
    }

    computeTransitions(page1, page2) {
        const transitions = []
        page1.params.forEach(param => {            
            for (let other, i=0; other=page2.params[i]; i++) if (param.o === other.o) {
              for (let k in param.p) if (other.p[k] != undefined) {
                    transitions.push(tween(param.o, k, param.p[k], other.p[k]-param.p[k], param.ease || ident))
                }
            }
        })
        return transitions
    }

    update(time) {
      if (this.fraction == this.destination) return

      const delta = time - this.lastUpdate
      let nextFraction = this.fraction < this.destination ?
          Math.min(this.destination, this.fraction+delta) :
          Math.max(this.destination, this.fraction-delta)

      while (this.pages[this.page+1] && nextFraction >= this.pages[this.page+1].startTime) {
        this.transition(this.pages[this.page].startTime + this.pages[this.page].duration)
        this.completePage(this.page+1)
      }
      while (this.page > 0 && nextFraction < this.pages[this.page].startTime) {
        this.transition(this.pages[this.page].startTime)
        this.completePage(this.page-1) 
      }
      this.transition(nextFraction)

      this.lastUpdate = time
    }

    completePage(index) {
      this.pages[index].complete()
      this.page = index
  }

    // instantaneously updates to a fraction between two pages
    transition(fraction) {
      const basePage = this.pages[this.page]
      const normalized = (fraction - basePage.startTime) / basePage.duration
      basePage.transitions.forEach(f => f(normalized))
      this.fraction = fraction
    }
}
