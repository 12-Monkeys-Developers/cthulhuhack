/**
 * SlideToggle: anime l'ouverture ou la fermeture d'un élément
 * @param {HTMLElement} el L'élément à animer
 * @param {number} duration Durée de l'animation en ms
 */
export default function slideToggle(el, duration = 200) {
  // Si déjà en cours d'animation, on ignore
  if (el._sliding) return
  el._sliding = true

  // Calcul des styles initiaux
  const computedStyle = window.getComputedStyle(el)
  const isHidden = computedStyle.display === "none"

  // Préparation pour slideDown
  if (isHidden) {
    el.style.removeProperty("display")
    let display = window.getComputedStyle(el).display
    if (display === "none") display = "block"
    el.style.display = display
    const height = el.scrollHeight + "px"

    el.style.overflow = "hidden"
    el.style.height = "0"
    el.offsetHeight // force repaint

    // Animation vers la hauteur naturelle
    el.style.transition = `height ${duration}ms ease`
    el.style.height = height

    setTimeout(() => {
      // Nettoyage
      el.style.removeProperty("height")
      el.style.removeProperty("overflow")
      el.style.removeProperty("transition")
      el._sliding = false
    }, duration)
  }
  // Préparation pour slideUp
  else {
    const height = el.scrollHeight + "px"

    el.style.overflow = "hidden"
    el.style.height = height
    el.offsetHeight // force repaint

    // Animation vers 0
    el.style.transition = `height ${duration}ms ease`
    el.style.height = "0"

    setTimeout(() => {
      // On masque complètement et nettoie
      el.style.display = "none"
      el.style.removeProperty("height")
      el.style.removeProperty("overflow")
      el.style.removeProperty("transition")
      el._sliding = false
    }, duration)
  }
}
