// Sem mobs do Minecraft: nenhum mob vanilla nasce sozinho (nem animal) — os Pokémon ocupam o lugar deles.
// Bloqueia só spawn "do mundo": natural, geração de chunk, estrutura, spawner, patrulha, invasão, reforço.
// Continua funcionando: ovo de spawn, comando, cruzamento, golem construído, Wither, Dragão do End.
// Liberados mesmo no spawn natural: aldeões, mercador ambulante e as lhamas dele, golens (trocas e vilas).
// Os drops que esses mobs davam vêm dos Pokémon (fazenda do Pasture / Rancho), e os sacrifícios do Occultism
// aceitam Pokémon equivalentes (sacrificios_occultism.js).

;(() => {
  const BLOQUEAR = ['NATURAL', 'CHUNK_GENERATION', 'STRUCTURE', 'SPAWNER', 'TRIAL_SPAWNER', 'PATROL', 'EVENT',
    'REINFORCEMENT', 'JOCKEY']
  const PERMITIDOS = ['minecraft:villager', 'minecraft:wandering_trader', 'minecraft:trader_llama',
    'minecraft:iron_golem', 'minecraft:snow_golem', 'minecraft:ender_dragon', 'minecraft:wither']

  EntityEvents.checkSpawn(event => {
    const id = String(event.entity.type)
    if (!id.startsWith('minecraft:') || PERMITIDOS.indexOf(id) >= 0) return
    if (BLOQUEAR.indexOf(String(event.getType())) < 0) return
    event.cancel()
  })
})()
