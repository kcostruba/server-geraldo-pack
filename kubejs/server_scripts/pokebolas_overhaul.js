// Create Mon Balls Overhaul: as Pokebolas do Cobblemon continuam com o Cobblemon Manufactory.
// Do Overhaul ficam so a Cherish Ball e a Ancient Origin Ball (o Manufactory nao faz essas)
// e as pecas da cadeia delas.
// As receitas de bancada do Overhaul usam os mesmos IDs do Cobblemon e ja saem em pokebolas_create.js.
// As pecas que ficaram sem uso tambem estao escondidas no JEI (client_scripts/esconder_itens.js).

const OVERHAUL_PECAS_SEM_USO = [
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
  // sem uso desde que o All The Mons saiu (eram das bolas de metal dele)
  'ancient_great_ball_lid', 'apricorn_ball_lid', 'black_ball_lid', 'blue_ball_lid', 'coated_blue_ball_lid',
  'great_ball_lid', 'green_ball_lid', 'master_ball_lid', 'pink_ball_lid', 'sturdy_ball_mechanism',
  'white_apricorn_bits', 'white_ball_lid', 'yellow_ball_lid'
]

ServerEvents.recipes(event => {
  if (!Platform.isLoaded('createmonballsoverhaul')) return
  // todas as montagens de bola do Overhaul, menos cherish_ball e ancient_origin_ball
  event.remove({ id: /^createmonballsoverhaul:sequenced_assembly\/balls\/(?!cherish_ball$|ancient_origin_ball$).+/ })
  // pecas que so serviam pras bolas removidas
  OVERHAUL_PECAS_SEM_USO.forEach(p => event.remove({ output: 'createmonballsoverhaul:' + p }))
})
