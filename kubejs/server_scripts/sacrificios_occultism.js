// Sacrifícios do Occultism com Pokémon (sem mobs do Minecraft no pack — sem_mobs_vanilla.js).
// O Occultism confere o sacrifício pela tag do tipo de mob, e todo Pokémon é o mesmo tipo de entidade.
// Aqui: quando um jogador mata um Pokémon perto (RAIO) de um ritual ativo que pede sacrifício, e a espécie é
// equivalente ao mob pedido (EQUIVALENTES), o ritual recebe o sacrifício (campo sacrificeProvided do Occultism).
// Os mobs originais continuam valendo normalmente.

;(() => {
  if (!Platform.isLoaded('occultism')) return

  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const BowlJ = Java.loadClass('com.klikli_dev.occultism.common.blockentity.GoldenSacrificialBowlBlockEntity')

  const RAIO = 8

  // tag pedida pelo ritual -> espécies que valem
  const EQUIVALENTES = {
    'c:chickens': ['pidgey', 'starly', 'fletchling', 'rookidee', 'wattrel', 'spearow', 'taillow', 'pidove', 'torchic', 'chatot'],
    'c:pigs': ['tepig', 'pignite', 'emboar', 'lechonk', 'oinkologne', 'spoink', 'grumpig', 'swinub', 'piloswine'],
    'c:cows': ['miltank', 'tauros', 'bouffalant'],
    'c:sheep': ['wooloo', 'dubwool', 'mareep', 'flaaffy'],
    'c:horses': ['ponyta', 'rapidash', 'mudbray', 'mudsdale', 'blitzle', 'zebstrika'],
    'c:llamas': ['skiddo', 'gogoat'],
    'c:camels': ['numel', 'camerupt'],
    'c:armadillos': ['sandshrew', 'sandslash'],
    'c:goats': ['skiddo', 'gogoat'],
    'c:fish': ['magikarp', 'goldeen', 'seaking', 'feebas', 'finneon', 'remoraid', 'basculin', 'arrokuda'],
    'c:squids': ['tentacool', 'tentacruel', 'inkay', 'malamar'],
    'c:bats': ['zubat', 'golbat', 'woobat', 'noibat'],
    'c:spiders': ['spinarak', 'ariados', 'joltik', 'galvantula'],
    'c:bees': ['combee', 'vespiquen', 'cutiefly'],
    'c:parrots': ['chatot', 'squawkabilly'],
    'occultism:flying_passive': ['pidgey', 'starly', 'fletchling', 'chatot', 'squawkabilly', 'swablu'],
    'occultism:humans': ['machop', 'machoke', 'timburr', 'gurdurr', 'jynx', 'mrmime', 'hitmonlee', 'hitmonchan'],
    'c:golems/iron': ['golett', 'golurk'],
    'c:golems/snow': ['snorunt', 'vanillite'],
    'c:endermen': ['abra', 'kadabra', 'alakazam'],
    'occultism:cubemob': ['grimer', 'muk', 'goomy', 'slugma'],
    'minecraft:zombies': ['yamask', 'cofagrigus', 'duskull'],
    'c:wardens': ['dusknoir'],
    'c:ravagers': ['rhydon', 'rhyperior'],
    'c:shulkers': ['shuckle'],
    'c:vex': ['misdreavus', 'mismagius']
  }

  const bacias = (level, pos) => {
    const lista = []
    for (let cx = (pos.x - RAIO) >> 4; cx <= (pos.x + RAIO) >> 4; cx++) {
      for (let cz = (pos.z - RAIO) >> 4; cz <= (pos.z + RAIO) >> 4; cz++) {
        if (!level.hasChunk(cx, cz)) continue
        level.getChunk(cx, cz).getBlockEntities().values().forEach(be => {
          if (be instanceof BowlJ && be.blockPos.distSqr(pos) <= RAIO * RAIO) lista.push(be)
        })
      }
    }
    return lista
  }

  EntityEvents.death(event => {
    const e = event.entity
    if (!(e instanceof PokemonEntityJ)) return
    const jogador = event.source.player
    if (jogador == null) return
    const especie = String(e.pokemon.species.resourceIdentifier.path)

    bacias(e.level, e.blockPosition()).forEach(bacia => {
      if (!bacia.ritualActive || bacia.sacrificeProvided || bacia.currentRitualRecipe == null) return
      const receita = bacia.currentRitualRecipe.value()
      if (!receita.requiresSacrifice()) return
      const tag = String(receita.getEntityToSacrifice().location())
      const lista = EQUIVALENTES[tag]
      if (lista == null || lista.indexOf(especie) < 0) return
      bacia.sacrificeProvided = true
      bacia.setChanged()
      jogador.setStatusMessage(Text.of(`O ritual aceitou o sacrifício de ${e.pokemon.species.translatedName.string}.`).darkPurple())
    })
  })
})()
