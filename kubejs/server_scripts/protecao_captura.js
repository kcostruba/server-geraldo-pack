// Captura de Pokémon por mods de magia + fazenda do Drygmy.
//
// Lendários, míticos, ultra-bestas e Pokémon com dono (de jogador ou NPC) não podem ser pegos:
//   - Gema de Alma do Occultism (soul_gem / fragile_soul_gem): o clique é cancelado.
//   - Jarro do Ars (Ritual de Contenção): o ritual não tem evento, então a cada 2 s os jarros perto dos jogadores
//     são conferidos; lendário selvagem volta pro mundo em cima do jarro, Pokémon com dono só some do jarro
//     (ele continua no time/PC do dono).
//
// Drygmy (Ars) e Dimensional Battlefield (Occultism): os dois sorteiam a tabela de loot comum do mob com um
// jogador falso como atacante. O Pokémon não tem tabela comum, então eles não tiravam nada dele.
// Agora, quando um deles "coleta" de um Pokémon selvagem que pode ser fazendado (os mesmos do Pasture: sem lendários),
// sai a tabela de drops da espécie do Pasture (geraldo:pokemon_drops_pasto/<especie>: sem os itens de Nether/End/especiais, que são do Rancho). Pokémon presos num Pasture não contam
// (já produzem pelo Pasture). Morte de verdade (espada etc.) não muda: só vale quando quem "ataca" é um jogador falso (Drygmy ou Battlefield).
// Tabela vazia em kubejs/data/cobblemon/loot_table/entities/pokemon.json pra o LootJS ter onde atuar.

;(() => {
  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const FakePlayerJ = Java.loadClass('net.neoforged.neoforge.common.util.FakePlayer')
  const ResourceKeyJ = Java.loadClass('net.minecraft.resources.ResourceKey')
  const RegistriesJ = Java.loadClass('net.minecraft.core.registries.Registries')
  const ResourceLocationJ = Java.loadClass('net.minecraft.resources.ResourceLocation')
  const LootTableJ = Java.loadClass('net.minecraft.world.level.storage.loot.LootTable')
  const LootParamsBuilder = Java.loadClass('net.minecraft.world.level.storage.loot.LootParams$Builder')
  const LootContextParamsJ = Java.loadClass('net.minecraft.world.level.storage.loot.parameters.LootContextParams')
  const LootContextParamSetsJ = Java.loadClass('net.minecraft.world.level.storage.loot.parameters.LootContextParamSets')

  const LENDARIO = ['legendary', 'mythical', 'ultra_beast', 'restricted']
  const GEMAS = ['occultism:soul_gem', 'occultism:fragile_soul_gem']

  const ehLendario = pk => {
    let sim = false
    pk.species.labels.forEach(l => { if (LENDARIO.indexOf(String(l)) >= 0) sim = true })
    return sim
  }

  // motivo pra não deixar pegar, ou null se pode
  const proibido = entidade => {
    if (!(entidade instanceof PokemonEntityJ)) return null
    const pk = entidade.pokemon
    if (ehLendario(pk)) return 'lendários, míticos e ultra-bestas'
    if (!pk.isWild()) return 'Pokémon que têm dono'
    return null
  }

  // ---------------------------------------------------------------- Gema de Alma (Occultism)
  GEMAS.forEach(gema => {
    if (!Platform.isLoaded('occultism')) return
    ItemEvents.entityInteracted(gema, event => {
      const motivo = proibido(event.target)
      if (motivo == null) return
      event.player.setStatusMessage(Text.of(`A Gema de Alma não prende ${motivo}.`).red())
      event.cancel()
    })
  })

  // ---------------------------------------------------------------- Jarro (Ars Nouveau)
  // (nada de const dentro de if: o Rhino do KubeJS acusa "redeclaration")
  const temArs = Platform.isLoaded('ars_nouveau')
  const MobJarTileJ = temArs ? Java.loadClass('com.hollingsworth.arsnouveau.common.block.tile.MobJarTile') : null
  const ServerPlayerJ = Java.loadClass('net.minecraft.server.level.ServerPlayer')
  const AABBJ = Java.loadClass('net.minecraft.world.phys.AABB')
  const RAIO_CHUNKS = 3
  const INTERVALO = 40

  const conferirJarro = (level, jarro) => {
    const ent = jarro.getEntity()
    const motivo = proibido(ent)
    if (motivo == null) return
    const p = jarro.blockPos
    // lendário selvagem: solta de volta em cima do jarro (com dono: só some do jarro, continua com o dono)
    const solto = ent.pokemon.isWild() ? MobJarTileJ.loadEntityFromTag(level, jarro.saveEntityToTag(ent)) : null
    if (solto != null) solto.moveTo(p.x + 0.5, p.y + 1, p.z + 0.5, 0, 0)
    if (solto != null) level.addFreshEntity(solto)
    jarro.removeEntity()
    level.getEntitiesOfClass(ServerPlayerJ, new AABBJ(p).inflate(16)).forEach(pl => {
      pl.setStatusMessage(Text.of(`O Jarro não prende ${motivo}.`).red())
    })
  }

  ServerEvents.tick(event => {
    const server = event.server
    if (!temArs || server.tickCount % INTERVALO != 0) return
    const vistos = new Set()
    server.players.forEach(player => {
      const level = player.level
      const ccx = player.blockX >> 4, ccz = player.blockZ >> 4
      for (let cx = ccx - RAIO_CHUNKS; cx <= ccx + RAIO_CHUNKS; cx++) {
        for (let cz = ccz - RAIO_CHUNKS; cz <= ccz + RAIO_CHUNKS; cz++) {
          if (!level.hasChunk(cx, cz)) continue
          level.getChunk(cx, cz).getBlockEntities().values().forEach(be => {
            if (!(be instanceof MobJarTileJ)) return
            const chave = `${level.dimension}|${be.blockPos.x},${be.blockPos.y},${be.blockPos.z}`
            if (vistos.has(chave)) return
            vistos.add(chave)
            conferirJarro(level, be)
          })
        }
      }
    })
  })

  // ---------------------------------------------------------------- Drygmy (Ars Nouveau)
  const tabela = (server, id) => {
    const key = ResourceKeyJ.create(RegistriesJ.LOOT_TABLE, ResourceLocationJ.parse(id))
    const t = server.reloadableRegistries().getLootTable(key)
    return t == LootTableJ.EMPTY ? null : t
  }

  LootJS.modifiers(event => {
    event.addTableModifier('cobblemon:entities/pokemon').customAction((ctx, loot) => {
      const atacante = ctx.getParamOrNull(LootContextParamsJ.ATTACKING_ENTITY)
      if (!(atacante instanceof FakePlayerJ)) return // so Drygmy/Battlefield (jogador falso), nunca morte de verdade
      const ent = ctx.getParamOrNull(LootContextParamsJ.THIS_ENTITY)
      if (!(ent instanceof PokemonEntityJ)) return
      if (proibido(ent) != null) return
      if (ent.tethering != null) return // ja produz pelo Pasture
      const level = ctx.getLevel()
      const t = tabela(level.server, `geraldo:pokemon_drops_pasto/${ent.pokemon.species.resourceIdentifier.path}`)
      if (t == null) return
      const params = new LootParamsBuilder(level)
        .withParameter(LootContextParamsJ.ORIGIN, ent.position())
        .withOptionalParameter(LootContextParamsJ.THIS_ENTITY, ent) // cor da lã (la_tingida.js)
        .create(LootContextParamSetsJ.CHEST)
      t.getRandomItems(params).forEach(s => loot.addItem(s))
    })
  })
})()
