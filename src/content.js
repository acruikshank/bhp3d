
export class Title {
  constructor(title) {
    this.title = title
  }
}

export class ContentPane {
  constructor(pane) {
    this.pane = pane
    pane.style.position = 'fixed'
    pane.style.top = '0'
    pane.style.left = '0'
    pane.style.zIndex = 1
    pane.style.opacity = 0

    const contentNodes = pane.querySelectorAll('.content')
    this.content = Array(contentNodes.length).fill().map((_,i) => new Title(contentNodes[i]))
  }

  resize(width, height) {
    this.pane.style.width = `${width}px`
    this.pane.style.height = `${height}px`
  }

  set opacity(value) {
    this.pane.style.opacity = value
  }
  get opacity() { return this.pane.style.opacity }
}

