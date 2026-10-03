// utils/emberBreath.js — the night "Make a Wish" light (founder 2026-10-03,
// LandingLab round 4: "it can move in different locations, not always same").
// Each breath (3.4 s, the CSS rhythm) moves the glow to a new random spot inside
// the button; the registered --ex/--ey properties (genie-theme.css) transition
// it there. Returns a stop function. Does nothing under reduced motion.
export function startEmberBreath(node) {
  // a component's $el can be a comment/text node (dev builds keep template comments)
  const el = node && node.nodeType !== 1 ? node.nextElementSibling : node
  if (!el || typeof window === 'undefined') return () => {}
  try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {} } catch { /* old browser */ }
  let last = { x: 50, y: 110 }
  const next = () => {
    let x, y, tries = 0
    do {
      x = 12 + Math.random() * 76
      y = Math.random() < 0.65 ? 70 + Math.random() * 50 : -10 + Math.random() * 40   // mostly rising from below
      tries++
    } while (Math.hypot(x - last.x, (y - last.y) / 2) < 22 && tries < 12)          // clearly somewhere new
    last = { x, y }
    el.style.setProperty('--ex', `${x.toFixed(1)}%`)
    el.style.setProperty('--ey', `${y.toFixed(1)}%`)
  }
  next()
  const id = setInterval(next, 3400)
  return () => clearInterval(id)
}
