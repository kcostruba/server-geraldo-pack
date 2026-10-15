// Pedras de evolucao sem minerio: so pelo Ars (pedras_evolucao_ars.js) e loot.
// - Geracao dos minerios desligada em kubejs/data/cobblemon/tags/worldgen/biome/has_ore/
// - Minerios que ja existem / de estruturas dropam so a pedra base
//   (kubejs/data/cobblemon|mega_showdown/loot_table/blocks/)
// - Aqui: tira as receitas de fundir minerio e deixa as pedras mais raras em bau/escavacao.

const PEDRAS_EVOLUCAO = ['fire', 'water', 'thunder', 'leaf', 'ice', 'moon', 'sun', 'shiny', 'dusk', 'dawn']
  .map(p => 'cobblemon:' + p + '_stone')

// Chance de as pedras SUMIREM de um bau/escavacao que as teria (0.65 = ficam em 35% das vezes)
const CHANCE_REMOVER_PEDRA = 0.65

ServerEvents.recipes(event => {
  PEDRAS_EVOLUCAO.forEach(pedra => {
    event.remove({ type: 'minecraft:smelting', output: pedra })
    event.remove({ type: 'minecraft:blasting', output: pedra })
  })
})

LootJS.modifiers(event => {
  // Todas as tabelas menos drops de bloco e a fazenda de drops do Pasture (geraldo:)
  event.addTableModifier(/^(?!geraldo:)(?!.*:blocks\/).*/)
    .randomChance(CHANCE_REMOVER_PEDRA)
    .removeLoot(PEDRAS_EVOLUCAO)
})
