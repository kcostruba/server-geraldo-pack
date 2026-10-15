// Maca dourada encantada ("Banquete" dos Pokemon no Pasture) so pelo Ars Nouveau:
// Enchanting Apparatus com a maca dourada no centro e 8 blocos de ouro nos pedestais.

ServerEvents.recipes(event => {
  let pedestais = []
  for (let i = 0; i < 8; i++) pedestais.push({ item: 'minecraft:gold_block' })

  event.custom({
    type: 'ars_nouveau:enchanting_apparatus',
    keepNbtOfReagent: false,
    reagent: { item: 'minecraft:golden_apple' },
    pedestalItems: pedestais,
    result: { count: 1, id: 'minecraft:enchanted_golden_apple' },
    sourceCost: 2000
  }).id('geraldo:maca_dourada_encantada')
})
