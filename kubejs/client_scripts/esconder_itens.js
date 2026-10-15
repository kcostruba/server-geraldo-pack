// Esconde do JEI os itens duplicados que foram removidos em
// server_scripts/conflitos_receitas.js

RecipeViewerEvents.removeEntries('item', event => {
  // pula item que nao existe (mod removido do pack) em vez de travar o resto da lista
  const esconder = id => {
    try { event.remove(id) } catch (e) { console.warn(`esconder_itens: ${id} nao existe, pulando`) }
  }

  ;[
    'create_ca:brass_gearbox',
    'create_ca:vertical_brass_gearbox',
    'tfmg:brass_pipe',
    'create_ironworks:steel_pickaxe',
    'create_connected:crank_wheel',
    'create_connected:large_crank_wheel',
    'create_connected:inverted_clutch',
    'create_connected:inverted_gearshift',
    'create_sa:vault_component',
    'create_vibrant_vaults:vertical_item_vault',
    'createaddition:zinc_sheet',
    'createdeco:zinc_sheet',
    'createdeco:andesite_sheet'
  ].forEach(item => esconder(item))

  // Create Mon Balls Overhaul: pecas das bolas que ficaram com o Manufactory
  // (mesma lista de server_scripts/pokebolas_overhaul.js)
  ;[
    'ancient_feather_ball_lid', 'ancient_gigaton_ball_lid', 'ancient_heavy_ball_lid', 'ancient_jet_ball_lid',
    'ancient_leaden_ball_lid', 'ancient_ultra_ball_lid', 'ancient_wing_ball_lid', 'beast_ball_lid',
    'black_apricorn_bits', 'black_tumblestone_dust', 'blue_apricorn_bits', 'brass_ancient_ball_mechanism',
    'brass_ball_base', 'brass_ball_mechanism', 'coated_black_ball_lid', 'coated_green_ball_lid',
    'coated_pink_ball_lid', 'coated_red_ball_lid', 'coated_white_ball_lid', 'coated_yellow_ball_lid',
    'copper_ancient_ball_mechanism', 'dense_coated_black_ball_lid', 'dive_ball_lid', 'dream_ball_lid',
    'dusk_ball_lid', 'fast_ball_lid', 'friend_ball_lid', 'green_apricorn_bits', 'heal_ball_lid',
    'heavy_ball_lid', 'iron_ancient_ball_mechanism', 'iron_ball_base', 'iron_ball_mechanism', 'level_ball_lid',
    'light_coated_blue_ball_lid', 'love_ball_lid', 'lure_ball_lid', 'luxury_ball_lid', 'moon_ball_lid',
    'nest_ball_lid', 'net_ball_lid', 'park_ball_lid', 'pink_apricorn_bits', 'quick_ball_lid',
    'repeat_ball_lid', 'safari_ball_lid', 'sky_tumblestone_dust', 'source_dense_tumblestone_coating',
    'source_light_tumblestone_coating', 'source_standard_tumblestone_coating', 'sport_ball_lid',
    'timer_ball_lid', 'tumblestone_dust', 'ultra_ball_lid', 'yellow_apricorn_bits',
    'ancient_great_ball_lid', 'apricorn_ball_lid', 'black_ball_lid', 'blue_ball_lid', 'coated_blue_ball_lid',
    'great_ball_lid', 'green_ball_lid', 'master_ball_lid', 'pink_ball_lid', 'sturdy_ball_mechanism',
    'white_apricorn_bits', 'white_ball_lid', 'yellow_ball_lid'
  ].forEach(p => { if (Platform.isLoaded('createmonballsoverhaul')) esconder('createmonballsoverhaul:' + p) })

  // Tomtaru's Cobblemon & IE Tweaks: pecas do caminho de Pokebolas pelo IE (server_scripts/tmtceic.js)
  ;['aluminum_pokeball_frame', 'netherite_pokeball_frame', 'mold_pokeball_frame']
    .forEach(p => esconder('tmtceic:' + p))

  // Minerios de pedra de evolucao: nao geram mais (server_scripts/pedras_evolucao_sem_minerio.js)
  const PEDRAS = ['dawn', 'dusk', 'fire', 'ice', 'leaf', 'moon', 'shiny', 'sun', 'thunder', 'water']
  PEDRAS.forEach(p => {
    esconder(`cobblemon:${p}_stone_ore`)
    esconder(`cobblemon:deepslate_${p}_stone_ore`)
    esconder(`mega_showdown:mega_meteorid_${p}_ore`)
  })
  ;['nether_fire_stone_ore', 'dripstone_moon_stone_ore', 'terracotta_sun_stone_ore']
    .forEach(o => esconder('cobblemon:' + o))

  // Bolas e tampas "incompletas": itens de meio de Sequenced Assembly, nao tem receita propria
  const ANTIGAS = ['azure', 'citrine', 'feather', 'gigaton', 'great', 'heavy', 'ivory', 'jet', 'leaden',
    'poke', 'roseate', 'slate', 'ultra', 'verdant', 'wing'].map(b => 'ancient_' + b)
  const BOLAS = ['azure', 'beast', 'citrine', 'dive', 'dream', 'dusk', 'fast', 'friend', 'great', 'heal',
    'heavy', 'level', 'love', 'lure', 'luxury', 'master', 'moon', 'nest', 'net', 'park', 'poke', 'premier',
    'quick', 'repeat', 'roseate', 'safari', 'slate', 'sport', 'timer', 'ultra', 'verdant']
  // Cobblemon Manufactory
  ANTIGAS.concat(BOLAS).forEach(b => esconder(`cobblemon_manufactory:incomplete_${b}_ball`))
  esconder('cobblemon_manufactory:incomplete_master_ball_lid')
  // CobbleMore Lib (tampas; nao tem poke/timer, tem red)
  ANTIGAS.concat(BOLAS.filter(b => b != 'poke' && b != 'timer'), ['red'])
    .forEach(b => esconder(`cobblemore_lib:incomplete_${b}_ball_lid`))
})
