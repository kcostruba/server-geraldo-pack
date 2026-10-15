// Pokebolas so pelo Create (Cobblemon Manufactory).
// Na bancada continua so a Poke Ball basica, pro comeco do jogo nao travar.

const BOLAS_SO_CREATE = [
  'great_ball', 'ultra_ball', 'master_ball', 'safari_ball', 'fast_ball', 'level_ball',
  'lure_ball', 'heavy_ball', 'love_ball', 'friend_ball', 'moon_ball', 'sport_ball',
  'park_ball', 'net_ball', 'dive_ball', 'nest_ball', 'repeat_ball', 'timer_ball',
  'luxury_ball', 'premier_ball', 'dusk_ball', 'heal_ball', 'quick_ball', 'dream_ball',
  'beast_ball', 'citrine_ball', 'verdant_ball', 'azure_ball', 'roseate_ball', 'slate_ball',
  'ancient_poke_ball', 'ancient_citrine_ball', 'ancient_verdant_ball', 'ancient_azure_ball',
  'ancient_roseate_ball', 'ancient_slate_ball', 'ancient_ivory_ball', 'ancient_great_ball',
  'ancient_ultra_ball', 'ancient_feather_ball', 'ancient_wing_ball', 'ancient_jet_ball',
  'ancient_heavy_ball', 'ancient_leaden_ball', 'ancient_gigaton_ball'
]

ServerEvents.recipes(event => {
  // remove so a receita de bancada do proprio Cobblemon (as do Manufactory continuam)
  BOLAS_SO_CREATE.forEach(bola => event.remove({ id: `cobblemon:${bola}` }))

  // Manufactory: tira as receitas de "tingir" na bancada (qualquer bola/tampa + corante -> outra cor).
  // Bolas ficam so no Sequenced Assembly; tampas coloridas so na prensa com apricorn
  // (as tampas especiais e as antigas continuam no Deployer, senao as bolas ficariam sem receita).
  event.remove({ id: /^cobblemon_manufactory:shapeless\/.*(_ball|_lid)$/ })
})
