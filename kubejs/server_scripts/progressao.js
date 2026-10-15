// Progressao: maquinas do Cobblemon passam a exigir pecas do Create.
// Fase do andesito: PC, Pasture
// Fase do latao: Healing Machine, Fossil Analyzer, Restoration Tank

ServerEvents.recipes(event => {
  // ---------------------------------------------------------------
  // Fase do andesito
  // ---------------------------------------------------------------
  event.remove({ id: 'cobblemon:pc' })
  event.shaped('cobblemon:pc', [
    'IGI',
    'ITI',
    'SAS'
  ], {
    I: '#c:plates/iron',
    G: 'minecraft:glass',
    T: 'create:electron_tube',
    A: 'create:andesite_casing',
    S: 'minecraft:smooth_stone'
  }).id('kubejs:progressao/pc')

  // Pasture continua pedindo o PC; o funil vira chute do Create
  event.replaceInput({ id: 'cobblemon:pasture' }, 'minecraft:hopper', 'create:chute')

  // ---------------------------------------------------------------
  // Fase do latao
  // ---------------------------------------------------------------
  event.remove({ id: 'cobblemon:healing_machine' })
  event.shaped('cobblemon:healing_machine', [
    'CCC',
    'BRB',
    'BPB'
  ], {
    C: '#c:plates/copper',
    B: '#c:ingots/brass',
    R: 'cobblemon:max_revive',
    P: 'create:precision_mechanism'
  }).id('kubejs:progressao/healing_machine')

  // ferro vira chapa de latao, redstone vira electron tube
  event.replaceInput({ id: 'cobblemon:fossil_analyzer' }, '#c:ingots/iron', '#c:plates/brass')
  event.replaceInput({ id: 'cobblemon:fossil_analyzer' }, '#c:dusts/redstone', 'create:electron_tube')
  event.replaceInput({ id: 'cobblemon:restoration_tank' }, '#c:ingots/iron', '#c:plates/brass')

  // ---------------------------------------------------------------
  // Itens fortes
  // ---------------------------------------------------------------
  // Rare Candy: sai a receita barata de bancada do Manufactory,
  // fica so a do Mixer (Cobblemon Industries)
  event.remove({ id: 'cobblemon_manufactory:shapeless/rare_candy' })
})
