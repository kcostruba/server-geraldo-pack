// Pokémon agressivos à noite: o desafio da noite (já que não nascem mobs do Minecraft).
// De noite (e sempre no Nether/End, que não têm dia), Pokémon SELVAGENS agressivos perseguem o jogador perto
// e batem nele (dano pelo nível; pode matar). Não chamam pra batalha. O jogador pode bater neles e matar
// (playerDamagePokemon está ligado na config do Cobblemon).
// Agressivos: tipos Sombrio, Fantasma, Veneno e Dragão + ESPECIES_BRIGONAS. Nunca: lendários, Pokémon com dono,
// de Pasture, em batalha. De dia voltam ao normal.

;(() => {
  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const AABBJ = Java.loadClass('net.minecraft.world.phys.AABB')
  const HandJ = Java.loadClass('net.minecraft.world.InteractionHand')

  const INTERVALO = 10          // ticks entre decisões
  const ALCANCE = 16            // blocos: enxerga o jogador
  const DIST_GOLPE = 2.2        // blocos: perto o bastante pra bater
  const ESPERA_GOLPE = 30       // ticks entre golpes do mesmo Pokémon (1,5 s)
  const VELOCIDADE = 1.3
  const TIPOS = ['dark', 'ghost', 'poison', 'dragon']
  const ESPECIES_BRIGONAS = ['gyarados', 'ursaring', 'ursaluna', 'mankey', 'primeape', 'annihilape', 'scyther',
    'scizor', 'pinsir', 'heracross', 'beedrill', 'seviper', 'zangoose', 'tauros', 'granbull', 'snubbull',
    'rhyhorn', 'rhydon', 'rhyperior', 'lycanroc', 'rockruff', 'stoutland', 'electabuzz', 'magmar', 'tyrantrum',
    'aerodactyl', 'kingler', 'krabby', 'crawdaunt', 'corphish']
  const LENDARIO = ['legendary', 'mythical', 'ultra_beast', 'restricted']

  const ultimoGolpe = new Map() // uuid do Pokémon -> tick

  const temLabel = (pk, lista) => {
    let sim = false
    pk.species.labels.forEach(l => { if (lista.indexOf(String(l)) >= 0) sim = true })
    return sim
  }

  const ehAgressivo = pk => {
    if (!pk.isWild() || temLabel(pk, LENDARIO)) return false
    if (ESPECIES_BRIGONAS.indexOf(String(pk.species.resourceIdentifier.path)) >= 0) return true
    let sim = false
    pk.types.forEach(t => { if (TIPOS.indexOf(String(t.name).toLowerCase()) >= 0) sim = true })
    return sim
  }

  // pra outros scripts (rituais_ars.js: Ritual da Desintegração)
  global.geraldo.ehAgressivo = ehAgressivo

  const dano = pk => Math.min(14, 1 + pk.level * 0.12) // nível 10 = 2,2 / 30 = 4,6 / 70 = 9,4 (meio coração = 1)

  ServerEvents.tick(event => {
    const server = event.server
    if (server.tickCount % INTERVALO != 0) return

    server.players.forEach(player => {
      if (player.isCreative() || player.isSpectator() || !player.isAlive()) return
      const level = player.level
      if (!level.isNight()) return
      const area = new AABBJ(player.blockPosition()).inflate(ALCANCE)
      level.getEntitiesOfClass(PokemonEntityJ, area).forEach(e => {
        if (e.tethering != null || e.isBattling()) return
        const pk = e.pokemon
        if (!ehAgressivo(pk)) return

        const dist = e.distanceTo(player)
        if (dist > DIST_GOLPE) {
          e.getNavigation().moveTo(player, VELOCIDADE)
          return
        }
        e.getLookControl().setLookAt(player)
        const chave = String(e.stringUUID)
        const ultimo = ultimoGolpe.get(chave)
        if (ultimo != null && server.tickCount - ultimo < ESPERA_GOLPE) return
        ultimoGolpe.set(chave, server.tickCount)
        player.hurt(level.damageSources().mobAttack(e), dano(pk))
        e.swing(HandJ.MAIN_HAND)
        server.runCommandSilent(`execute in ${level.dimension} run particle minecraft:angry_villager ${e.x} ${e.y + e.bbHeight} ${e.z} 0.2 0.2 0.2 0 2`)
      })
    })

    // limpa golpes antigos de vez em quando
    if (server.tickCount % 1200 == 0) ultimoGolpe.clear()
  })
})()
