// Pedras de evolucao pelo Ars Nouveau, igual as essencias: Imbuement Chamber com
// gema de source no meio + 3 itens nos pedestais. Itens do Occultism onde combinam.
// Os minerios continuam dando as pedras normalmente; isso e um caminho a mais.

const PEDRAS_ARS = {
  'cobblemon:fire_stone':    ['ars_nouveau:fire_essence', 'occultism:afrit_essence', 'minecraft:blaze_powder'],
  'cobblemon:water_stone':   ['ars_nouveau:water_essence', 'minecraft:prismarine_crystals', 'minecraft:sea_pickle'],
  'cobblemon:thunder_stone': ['ars_nouveau:air_essence', 'minecraft:lightning_rod', 'minecraft:redstone_block'],
  'cobblemon:leaf_stone':    ['ars_nouveau:earth_essence', 'occultism:nature_paste', '#minecraft:saplings'],
  'cobblemon:ice_stone':     ['ars_nouveau:water_essence', 'minecraft:blue_ice', 'minecraft:snow_block'],
  'cobblemon:moon_stone':    ['#c:ingots/silver', 'minecraft:phantom_membrane', 'minecraft:amethyst_shard'],
  'cobblemon:sun_stone':     ['ars_nouveau:fire_essence', '#c:ingots/gold', 'minecraft:sunflower'],
  'cobblemon:shiny_stone':   ['occultism:spirit_attuned_gem', 'minecraft:glow_ink_sac', '#c:gems/diamond'],
  'cobblemon:dusk_stone':    ['occultism:otherworld_ashes', 'minecraft:soul_sand', 'minecraft:ink_sac'],
  'cobblemon:dawn_stone':    ['ars_nouveau:abjuration_essence', 'minecraft:glow_berries', 'minecraft:glowstone_dust']
}

ServerEvents.recipes(event => {
  Object.keys(PEDRAS_ARS).forEach(pedra => {
    let pedestais = []
    PEDRAS_ARS[pedra].forEach(i => pedestais.push(i.startsWith('#') ? { tag: i.substring(1) } : { item: i }))

    event.custom({
      type: 'ars_nouveau:imbuement',
      input: { tag: 'c:gems/source' },
      output: { count: 1, id: pedra },
      pedestalItems: pedestais,
      source: 2000
    }).id('geraldo:ars/' + pedra.split(':')[1])
  })
})
