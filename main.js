// Theme toggle (preference persisted; initial class set inline in <head> to avoid flash)
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', dark ? 'dark' : 'light')
})

// "Plum" background: branches that grow randomly in from the screen edges.
;(function plum() {
  const canvas = document.getElementById('plum')
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const r180 = Math.PI
  const r90 = Math.PI / 2
  const r15 = Math.PI / 12
  const MIN_BRANCH = 30
  const LEN = 6
  let w, h, steps, prevSteps, frame

  const color = () => getComputedStyle(document.documentElement).getPropertyValue('--plum').trim()

  function resize() {
    w = innerWidth
    h = innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function polar2cart(x, y, r, theta) {
    return [x + r * Math.cos(theta), y + r * Math.sin(theta)]
  }

  function step(x, y, rad, counter = { value: 0 }) {
    const length = Math.random() * LEN
    counter.value += 1
    const [nx, ny] = polar2cart(x, y, length, rad)

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(nx, ny)
    ctx.stroke()

    const rad1 = rad + Math.random() * r15
    const rad2 = rad - Math.random() * r15

    if (nx < -100 || nx > w + 100 || ny < -100 || ny > h + 100) return

    const rate = counter.value <= MIN_BRANCH ? 0.8 : 0.5
    if (Math.random() < rate) steps.push(() => step(nx, ny, rad1, counter))
    if (Math.random() < rate) steps.push(() => step(nx, ny, rad2, counter))
  }

  function start() {
    cancelAnimationFrame(frame)
    resize()
    ctx.clearRect(0, 0, w, h)
    ctx.lineWidth = 1
    ctx.strokeStyle = color()
    prevSteps = []
    const rand = () => Math.random() * 0.6 + 0.2
    steps = [
      () => step(rand() * w, -5, r90),
      () => step(rand() * w, h + 5, -r90),
      () => step(-5, rand() * h, 0),
      () => step(w + 5, rand() * h, r180),
    ]
    if (w < 500) steps = steps.slice(0, 2)

    let last = performance.now()
    const tick = (now) => {
      if (now - last < 1000 / 40) return (frame = requestAnimationFrame(tick))
      last = now
      prevSteps = steps
      steps = []
      if (!prevSteps.length) return
      prevSteps.forEach((fn) => {
        // Randomly defer some branches so growth looks organic
        if (Math.random() < 0.5) steps.push(fn)
        else fn()
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }

  start()
  document.getElementById('theme-toggle')?.addEventListener('click', start)
  let t
  addEventListener('resize', () => {
    clearTimeout(t)
    t = setTimeout(start, 300)
  })
})()
