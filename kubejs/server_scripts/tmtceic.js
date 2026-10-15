// Tomtaru's Cobblemon & Immersive Engineering Tweaks: ajustes pra seguir o que ja foi decidido.
// - Pokebolas so pelo Cobblemon Manufactory: sai todo o caminho de bolas pelo IE
//   (bottling machine, metal press, engineer's workbench, armacoes e molde).
//   As receitas de bancada dele usam os IDs do Cobblemon e ja saem em pokebolas_create.js.
// - Minerios de pedra de evolucao foram tirados do jogo: sai o britador de minerio -> pedra.
// Ficam: cloche (berries, apricorns, mentas), remedios no mixer/bottling, termeletrico, etc.

ServerEvents.recipes(event => {
  event.remove({ id: /^tmtceic:(bottling\/balls|blueprint|blueprint_item|metalpress)\/.+/ })
  event.remove({ id: /^tmtceic:crusher\/.+_stone_ore$/ })
})
