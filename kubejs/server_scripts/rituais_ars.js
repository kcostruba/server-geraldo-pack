// Rituais do Ars Nouveau com Pokémon.
//
// Ritual da Fertilidade (tabuleta ars_nouveau:ritual_fertility): alem de cruzar os animais, da o BANQUETE (todos os efeitos de
// trabalho por 60 min, igual a maca dourada encantada — berries_trabalho.js) aos Pokémon de Pasture a ate 5 blocos
// do braseiro, quando falta algum efeito ou falta menos de 1 min. Gasta source igual ao ritual (pede source de novo).
//
// Ritual do Santuário (tabuleta ars_nouveau:ritual_sanctuary): o Ars so barra mobs hostis do Minecraft; o Cobblemon tem o
// spawn dele, entao aqui o spawn natural de Pokémon tambem e cancelado dentro do raio do ritual (32, ate 128 com carne podre).
//
// Ritual da Invocação de Animais: os animais do Minecraft invocados viram Pokémon comuns do bioma.
// Ritual da Desintegração: desfaz os Pokémon agressivos selvagens perto e solta Gemas de Experiência.
//
// O Ars nao tem evento desses rituais: a cada INTERVALO os braseiros perto dos jogadores sao achados e lembrados.

;(() => {
  if (!Platform.isLoaded('ars_nouveau')) return

  const BrazierJ = Java.loadClass('com.hollingsworth.arsnouveau.common.block.tile.RitualBrazierTile')
  const RitualBreedJ = Java.loadClass('com.hollingsworth.arsnouveau.common.ritual.RitualBreed')
  const DenySpawnJ = Java.loadClass('com.hollingsworth.arsnouveau.common.ritual.DenySpawnRitual')
  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const AABBJ = Java.loadClass('net.minecraft.world.phys.AABB')
  const CobblemonEventsJ = Java.loadClass('com.cobblemon.mod.common.api.events.CobblemonEvents')
  const AnimalSummonJ = Java.loadClass('com.hollingsworth.arsnouveau.common.ritual.RitualAnimalSummoning')
  const DisintegrationJ = Java.loadClass('com.hollingsworth.arsnouveau.common.ritual.RitualDisintegration')
  const AnimalJ = Java.loadClass('net.minecraft.world.entity.animal.Animal')
  const TagKeyJ = Java.loadClass('net.minecraft.tags.TagKey')
  const RegistriesJ = Java.loadClass('net.minecraft.core.registries.Registries')
  const ResourceLocationJ = Java.loadClass('net.minecraft.resources.ResourceLocation')
  const BlockJ = Java.loadClass('net.minecraft.world.level.block.Block')

  const INTERVALO = 200     // ticks (10 s), o mesmo ritmo do Ritual da Fertilidade
  const RAIO_CHUNKS = 4     // procura braseiros nesse raio em volta dos jogadores
  const RAIO_FERTIL = 5     // igual ao do Ars

  // "dim|x,y,z" -> { level, pos }
  const braseiros = new Map()
  // santuarios ativos: [{ dim, x, y, z, raio }] (lido no evento de spawn)
  global.geraldo.santuarios = []

  // mesmo formato nos dois lados (KubeJS e Cobblemon devolvem a dimensao de jeitos diferentes)
  const dimDe = level => String(level.dimension().location())

  const ritualDe = (level, pos) => {
    const be = level.getBlockEntity(pos)
    return be instanceof BrazierJ ? be : null
  }

  const procurar = server => {
    server.players.forEach(player => {
      const level = player.level
      const ccx = player.blockX >> 4, ccz = player.blockZ >> 4
      for (let cx = ccx - RAIO_CHUNKS; cx <= ccx + RAIO_CHUNKS; cx++) {
        for (let cz = ccz - RAIO_CHUNKS; cz <= ccz + RAIO_CHUNKS; cz++) {
          if (!level.hasChunk(cx, cz)) continue
          level.getChunk(cx, cz).getBlockEntities().values().forEach(be => {
            if (!(be instanceof BrazierJ)) return
            const p = be.blockPos
            braseiros.set(`${dimDe(level)}|${p.x},${p.y},${p.z}`, { level: level, pos: p })
          })
        }
      }
    })
  }

  const fertilidade = (server, level, brazier) => {
    const p = brazier.blockPos
    const area = new AABBJ(p).inflate(RAIO_FERTIL)
    let deu = false
    level.getEntitiesOfClass(PokemonEntityJ, area).forEach(e => {
      if (e.tethering == null) return
      if (global.geraldo.precisaBanquete == null || !global.geraldo.precisaBanquete(e)) return
      global.geraldo.banquete(server, e)
      deu = true
    })
    if (deu) brazier.ritual.setNeedsSource(true)
  }

  // ---------------------------------------------------------------- Ritual da Invocação de Animais
  // O Ars invoca animais do Minecraft (que não existem mais no pack): cada um vira um Pokémon comum do bioma.
  const RAIO_INVOCACAO = 10
  const POKEMON_DO_BIOMA = [
    ['c:is_snowy', ['snorunt', 'swinub', 'vanillite', 'cubchoo', 'snover', 'spheal']],
    ['c:is_desert', ['sandshrew', 'trapinch', 'cacnea', 'hippopotas', 'silicobra', 'rolycoly']],
    ['minecraft:is_ocean', ['wingull', 'krabby', 'shellder', 'staryu', 'horsea', 'tentacool']],
    ['minecraft:is_beach', ['wingull', 'krabby', 'corphish', 'staryu', 'shellder', 'psyduck']],
    ['c:is_swamp', ['wooper', 'lotad', 'croagunk', 'grimer', 'tympole', 'psyduck']],
    ['minecraft:is_jungle', ['aipom', 'paras', 'pikipek', 'fomantis', 'tropius', 'combee']],
    ['minecraft:is_mountain', ['geodude', 'machop', 'onix', 'roggenrola', 'nosepass', 'aron']],
    ['minecraft:is_forest', ['caterpie', 'weedle', 'pidgey', 'oddish', 'sewaddle', 'skwovet']],
    ['c:is_plains', ['rattata', 'pidgey', 'ponyta', 'mareep', 'lechonk', 'wooloo']]
  ]
  const POKEMON_PADRAO = ['pidgey', 'rattata', 'zigzagoon', 'bidoof', 'starly', 'lillipup']

  const especieDoBioma = (level, pos) => {
    const bioma = level.getBiome(pos)
    let lista = POKEMON_PADRAO
    POKEMON_DO_BIOMA.forEach(par => {
      if (lista != POKEMON_PADRAO) return
      if (bioma.is(TagKeyJ.create(RegistriesJ.BIOME, ResourceLocationJ.parse(par[0])))) lista = par[1]
    })
    return lista[Math.floor(Math.random() * lista.length)]
  }

  const invocacao = (server, level, brazier) => {
    const area = new AABBJ(brazier.blockPos).inflate(RAIO_INVOCACAO)
    level.getEntitiesOfClass(AnimalJ, area).forEach(a => {
      if (!String(a.type).startsWith('minecraft:')) return
      const x = a.x, y = a.y, z = a.z
      a.discard()
      const nivel = 5 + Math.floor(Math.random() * 21)
      server.runCommandSilent(`execute in ${dimDe(level)} run pokespawnat ${x} ${y} ${z} ${especieDoBioma(level, a.blockPosition())} level=${nivel}`)
    })
  }

  // ---------------------------------------------------------------- Ritual da Desintegração
  // O Ars destrói monstros do Minecraft (que não existem mais): aqui ele desfaz os Pokémon AGRESSIVOS selvagens
  // perto (os mesmos de pokemon_agressivos.js) e solta Gemas de Experiência; gasta source a cada um.
  const RAIO_DESINTEGRACAO = 6
  const desintegracao = (level, brazier) => {
    if (global.geraldo.ehAgressivo == null) return
    const area = new AABBJ(brazier.blockPos).inflate(RAIO_DESINTEGRACAO)
    let algum = false
    level.getEntitiesOfClass(PokemonEntityJ, area).forEach(e => {
      if (e.tethering != null || e.isBattling() || !global.geraldo.ehAgressivo(e.pokemon)) return
      const gemas = Math.max(1, Math.round(e.pokemon.level / 4))
      const pos = e.blockPosition()
      e.discard()
      BlockJ.popResource(level, pos, Item.of('ars_nouveau:experience_gem', gemas))
      level.server.runCommandSilent(`execute in ${dimDe(level)} run particle minecraft:soul ${pos.x + 0.5} ${pos.y + 0.5} ${pos.z + 0.5} 0.3 0.4 0.3 0.02 10`)
      algum = true
    })
    if (algum) brazier.ritual.setNeedsSource(true)
  }

  ServerEvents.tick(event => {
    const server = event.server
    if (server.tickCount % INTERVALO != 0) return
    procurar(server)

    const santuarios = []
    Array.from(braseiros.keys()).forEach(chave => {
      const b = braseiros.get(chave)
      const p = b.pos
      if (!b.level.hasChunk(p.x >> 4, p.z >> 4)) return // descarregado: tenta depois
      const brazier = ritualDe(b.level, p)
      if (brazier == null) { braseiros.delete(chave); return }
      const ritual = brazier.ritual
      if (ritual == null || !ritual.isRunning()) return
      if (ritual instanceof DenySpawnJ) santuarios.push({ dim: dimDe(b.level), x: p.x, y: p.y, z: p.z, raio: ritual.radius })
      if (ritual instanceof RitualBreedJ && !ritual.needsSourceNow()) fertilidade(server, b.level, brazier)
      if (ritual instanceof AnimalSummonJ) invocacao(server, b.level, brazier)
      if (ritual instanceof DisintegrationJ && !ritual.needsSourceNow()) desintegracao(b.level, brazier)
    })
    global.geraldo.santuarios = santuarios
  })

  // Santuário: cancela o spawn natural de Pokémon dentro do raio. No /reload tira a inscricao antiga antes.
  if (global.geraldo.subSantuario != null) CobblemonEventsJ.ENTITY_SPAWN.unsubscribe(global.geraldo.subSantuario)
  const noSantuario = ev => {
    const lista = global.geraldo.santuarios
    if (lista == null || lista.length == 0) return false
    const sp = ev.getSpawnablePosition()
    const dim = dimDe(sp.getWorld())
    const pos = sp.getPosition()
    return lista.some(s => s.dim == dim &&
      (pos.x - s.x) * (pos.x - s.x) + (pos.z - s.z) * (pos.z - s.z) <= s.raio * s.raio)
  }
  global.geraldo.subSantuario = CobblemonEventsJ.ENTITY_SPAWN.subscribe(ev => {
    // erro aqui nao pode travar o spawn do Cobblemon
    try {
      if (noSantuario(ev)) ev.cancel()
    } catch (e) {
      console.error(`rituais_ars santuario: ${e}`)
    }
  })
})()
