// Resolve receitas duplicadas/conflitantes entre mods.
// Depois de editar, use /reload no jogo para aplicar.

const MADEIRAS = [
  { nome: 'oak', tora: 'minecraft:stripped_oak_log' },
  { nome: 'spruce', tora: 'minecraft:stripped_spruce_log' },
  { nome: 'birch', tora: 'minecraft:stripped_birch_log' },
  { nome: 'jungle', tora: 'minecraft:stripped_jungle_log' },
  { nome: 'acacia', tora: 'minecraft:stripped_acacia_log' },
  { nome: 'dark_oak', tora: 'minecraft:stripped_dark_oak_log' },
  { nome: 'mangrove', tora: 'minecraft:stripped_mangrove_log' },
  { nome: 'cherry', tora: 'minecraft:stripped_cherry_log' },
  { nome: 'bamboo', tora: 'minecraft:stripped_bamboo_block' },
  { nome: 'crimson', tora: 'minecraft:stripped_crimson_stem' },
  { nome: 'warped', tora: 'minecraft:stripped_warped_stem' }
]

ServerEvents.recipes(event => {
  // ---------------------------------------------------------------
  // 1. Eixos (Create Encased), vigas (Unusual Furniture) e
  //    grapevine stem (Vinery) -> tudo pelo cortador de pedra
  // ---------------------------------------------------------------
  MADEIRAS.forEach(m => {
    event.remove({ output: `createcasing:${m.nome}_shaft` })
    event.remove({ output: `unusual_furniture:${m.nome}_beam` })
    // na bancada eram 2 toras -> 8, entao 1 tora -> 4
    event.stonecutting(`4x createcasing:${m.nome}_shaft`, m.tora).id(`kubejs:stonecutting/${m.nome}_shaft`)
    event.stonecutting(`4x unusual_furniture:${m.nome}_beam`, m.tora).id(`kubejs:stonecutting/${m.nome}_beam`)
  })
  if (Platform.isLoaded('vinery')) {
    event.remove({ output: 'vinery:grapevine_stem' })
    // na bancada eram 2 toras (qualquer) -> 4, entao 1 -> 2
    event.stonecutting('2x vinery:grapevine_stem', '#minecraft:logs').id('kubejs:stonecutting/grapevine_stem')
  }

  // ---------------------------------------------------------------
  // 2. Mesas do Unusual Furniture -> 2x2 (laje em cima, tora descascada embaixo)
  // ---------------------------------------------------------------
  MADEIRAS.forEach(m => {
    event.remove({ output: `unusual_furniture:${m.nome}_table` })
    event.shaped(`unusual_furniture:${m.nome}_table`, [
      'SS',
      'MM'
    ], {
      S: `minecraft:${m.nome}_slab`,
      M: m.tora
    }).id(`kubejs:unusual_furniture/${m.nome}_table`)
  })

  // ---------------------------------------------------------------
  // 3. Furnicrafter do CobbleFurnies -> tabuas viram toras descascadas
  // ---------------------------------------------------------------
  event.remove({ id: 'cobblefurnies:furnicrafter' })
  event.shaped('cobblefurnies:furnicrafter', [
    'BC',
    'AA'
  ], {
    A: '#c:stripped_logs',
    B: 'minecraft:shears',
    C: 'minecraft:iron_axe'
  }).id('kubejs:cobblefurnies/furnicrafter')

  // ---------------------------------------------------------------
  // 4. Brass gearbox -> fica so o do Create Encased
  // ---------------------------------------------------------------
  event.remove({ output: 'create_ca:brass_gearbox' })
  event.remove({ output: 'create_ca:vertical_brass_gearbox' })
  // conversao pra quem ja tem o item antigo
  event.shapeless('createcasing:brass_gearbox', ['create_ca:brass_gearbox']).id('kubejs:convert/brass_gearbox')
  event.shapeless('createcasing:vertical_brass_gearbox', ['create_ca:vertical_brass_gearbox']).id('kubejs:convert/vertical_brass_gearbox')

  // ---------------------------------------------------------------
  // 5. Cano de latao -> fica so o do Create Encased
  //    (receitas do TFMG que usavam o cano dele passam a usar o do Encased)
  // ---------------------------------------------------------------
  event.remove({ output: 'tfmg:brass_pipe' })
  event.replaceInput({}, 'tfmg:brass_pipe', 'createcasing:brass_fluid_pipe')
  event.shapeless('createcasing:brass_fluid_pipe', ['tfmg:brass_pipe']).id('kubejs:convert/brass_pipe')

  // ---------------------------------------------------------------
  // 6. Picareta de aco -> fica so a do TFMG (aceita qualquer lingote de aco)
  // ---------------------------------------------------------------
  event.remove({ output: 'create_ironworks:steel_pickaxe' })
  // upgrade pra netherite do Ironworks passa a usar a picareta do TFMG
  event.replaceInput({ id: 'create_ironworks:tools/pickaxe/netherite_steel' }, 'create_ironworks:steel_pickaxe', 'tfmg:steel_pickaxe')

  // ---------------------------------------------------------------
  // 7. Industrial table (Unusual) -> pepitas dos cantos de cima viram lingotes
  // ---------------------------------------------------------------
  event.remove({ id: 'unusual_furniture:industrial_table_craft' })
  event.shaped('unusual_furniture:industrial_table', [
    'INI',
    ' N ',
    ' I '
  ], {
    I: 'minecraft:iron_ingot',
    N: 'minecraft:iron_nugget'
  }).id('kubejs:unusual_furniture/industrial_table')

  // ---------------------------------------------------------------
  // 8. Cranks -> fica so o do DnDesires
  // ---------------------------------------------------------------
  event.remove({ output: 'create_connected:crank_wheel' })
  event.remove({ output: 'create_connected:large_crank_wheel' })
  event.shapeless('dndesires:cog_crank', ['create_connected:crank_wheel']).id('kubejs:convert/cog_crank')
  event.shapeless('dndesires:large_cog_crank', ['create_connected:large_crank_wheel']).id('kubejs:convert/large_cog_crank')

  // ---------------------------------------------------------------
  // 9. Inverted clutch/gearshift -> fica so o do Create C&A
  //    (a conversao de volta do Create Connected pra clutch normal continua)
  // ---------------------------------------------------------------
  event.remove({ output: 'create_connected:inverted_clutch' })
  event.remove({ output: 'create_connected:inverted_gearshift' })

  // ---------------------------------------------------------------
  // 10. Vault -> fica so o item silo do Create Connected
  //     (as conversoes de volta pra item vault continuam)
  // ---------------------------------------------------------------
  event.remove({ output: 'create_sa:vault_component' })
  event.remove({ output: 'create_vibrant_vaults:vertical_item_vault' })

  // ---------------------------------------------------------------
  // 11. Paper lantern (Twigs) -> sem os papeis das pontas
  // ---------------------------------------------------------------
  const TWIGS = Platform.isLoaded('twigs')
  if (TWIGS) {
    event.remove({ id: 'twigs:paper_lantern' })
    event.shaped('twigs:paper_lantern', [
      ' P ',
      'PTP',
      ' P '
    ], {
      P: 'minecraft:paper',
      T: 'minecraft:torch'
    }).id('kubejs:twigs/paper_lantern')
  }

  // ---------------------------------------------------------------
  // 12. Gravel bricks (Twigs e Supplementaries) -> tudo pelo cortador de pedra
  // ---------------------------------------------------------------
  event.remove({ id: 'supplementaries:gravel_bricks' })
  event.stonecutting('supplementaries:gravel_bricks', 'minecraft:gravel').id('kubejs:stonecutting/supplementaries_gravel_bricks')

  if (TWIGS) {
    event.remove({ id: 'twigs:gravel_bricks' })
    event.remove({ id: 'twigs:gravel_brick_slab' })
    event.remove({ id: 'twigs:gravel_brick_stairs' })
    event.remove({ id: 'twigs:gravel_brick_wall' })
    event.stonecutting('twigs:gravel_bricks', 'minecraft:gravel').id('kubejs:stonecutting/twigs_gravel_bricks')
    ;['minecraft:gravel', 'twigs:gravel_bricks'].forEach((entrada, n) => {
      event.stonecutting('twigs:gravel_brick_stairs', entrada).id(`kubejs:stonecutting/gravel_brick_stairs_${n}`)
      event.stonecutting('2x twigs:gravel_brick_slab', entrada).id(`kubejs:stonecutting/gravel_brick_slab_${n}`)
      event.stonecutting('twigs:gravel_brick_wall', entrada).id(`kubejs:stonecutting/gravel_brick_wall_${n}`)
    })
  }

  // ---------------------------------------------------------------
  // 13. Flower box (Supplementaries) -> terra vira coarse dirt
  // ---------------------------------------------------------------
  event.remove({ id: 'supplementaries:flower_box' })
  event.shaped('2x supplementaries:flower_box', [
    'SCS',
    'SSS'
  ], {
    S: '#minecraft:wooden_slabs',
    C: 'minecraft:coarse_dirt'
  }).id('kubejs:supplementaries/flower_box')

  // ---------------------------------------------------------------
  // 14. Tijolos com musgo / rachados
  // ---------------------------------------------------------------
  event.remove({ id: 'minecraft:mossy_red_bricks_from_moss_block' }) // Create Deco: so com vinha
  if (TWIGS) {
    event.remove({ id: 'twigs:mossy_bricks_from_vine' })               // Twigs: so com bloco de musgo
    event.remove({ id: 'twigs:cracked_bricks' })                        // sai da fornalha...
    event.stonecutting('twigs:cracked_bricks', 'minecraft:bricks').id('kubejs:stonecutting/twigs_cracked_bricks') // ...vai pro cortador
  }

  // ---------------------------------------------------------------
  // 15. Chapas de zinco e andesito -> fica so as do Create Encased
  //     (o AlmostUnified tambem esta configurado pra preferir o Create Encased)
  // ---------------------------------------------------------------
  event.remove({ output: 'createaddition:zinc_sheet' })
  event.remove({ output: 'createdeco:zinc_sheet' })
  event.remove({ output: 'createdeco:andesite_sheet' })
  event.replaceInput({}, 'createaddition:zinc_sheet', 'createcasing:zinc_sheet')
  event.replaceInput({}, 'createdeco:zinc_sheet', 'createcasing:zinc_sheet')
  event.replaceInput({}, 'createdeco:andesite_sheet', 'createcasing:andesite_sheet')
  event.shapeless('createcasing:zinc_sheet', ['createaddition:zinc_sheet']).id('kubejs:convert/zinc_sheet_createaddition')
  event.shapeless('createcasing:zinc_sheet', ['createdeco:zinc_sheet']).id('kubejs:convert/zinc_sheet_createdeco')
  event.shapeless('createcasing:andesite_sheet', ['createdeco:andesite_sheet']).id('kubejs:convert/andesite_sheet_createdeco')

  // ---------------------------------------------------------------
  // 16. Moeda de latao (Create Deco) -> 1 pepita de latao na bancada
  //     (a prensa fica so com o brass reed do Pipe Organs)
  // ---------------------------------------------------------------
  event.remove({ id: 'createdeco:pressing/coins/brass_coin' })
  event.shapeless('createdeco:brass_coin', ['create:brass_nugget']).id('kubejs:createdeco/brass_coin')
})
