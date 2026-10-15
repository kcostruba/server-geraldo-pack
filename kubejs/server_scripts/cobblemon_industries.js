// Cobblemon Industries: as Pokebolas ficam com o Cobblemon Manufactory.
// Do Industries continuam so doces, mochis, pocoes e apricorns.

ServerEvents.recipes(event => {
  // Pokebolas e tampas (Master Ball, Tumblestone, etc.)
  event.remove({ mod: 'cobblemon_industries', output: /.*_ball.*/ })
  event.remove({ mod: 'cobblemon_industries', output: /.*tumblestone.*/ })
})
