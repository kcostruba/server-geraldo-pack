// Estábulo de Source (Ars Nouveau): Pokémon dos tipos Psíquico e Fada num Pasture enchem de source o Source Jar
// mais perto do Pasture (até RAIO blocos, ALTURA pra cima/baixo).
// A cada INTERVALO cada um põe metade do nível em source (nível 50 = 25 a cada 10 s). Berry Salac dobra.
// Jarro cheio: aquela source se perde. Funciona em qualquer modo do Pasture.

;(() => {
  if (!Platform.isLoaded('ars_nouveau')) return

  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const SourceJarJ = Java.loadClass('com.hollingsworth.arsnouveau.common.block.tile.SourceJarTile')

  const INTERVALO = 200 // ticks (10 s)
  const RAIO = 8
  const ALTURA = 5
  const TIPOS = ['psychic', 'fairy']

  // pasture -> { tick, pos do jarro ou null }
  const cache = new Map()

  const ehTipo = pk => {
    let sim = false
    pk.types.forEach(t => { if (TIPOS.indexOf(String(t.name).toLowerCase()) >= 0) sim = true })
    return sim
  }

  const acharJarro = (level, pasto) => {
    let melhor = null
    let melhorDist = 1e9
    for (let cx = (pasto.x - RAIO) >> 4; cx <= (pasto.x + RAIO) >> 4; cx++) {
      for (let cz = (pasto.z - RAIO) >> 4; cz <= (pasto.z + RAIO) >> 4; cz++) {
        if (!level.hasChunk(cx, cz)) continue
        level.getChunk(cx, cz).getBlockEntities().values().forEach(be => {
          if (!(be instanceof SourceJarJ)) return
          const p = be.blockPos
          if (Math.abs(p.x - pasto.x) > RAIO || Math.abs(p.z - pasto.z) > RAIO || Math.abs(p.y - pasto.y) > ALTURA) return
          const d = p.distSqr(pasto)
          if (d < melhorDist) { melhorDist = d; melhor = p }
        })
      }
    }
    return melhor
  }

  ServerEvents.tick(event => {
    const server = event.server
    if (server.tickCount % INTERVALO != 0) return
    server.getAllLevels().forEach(level => {
      const porPasto = new Map()
      level.getAllEntities().forEach(e => {
        if (!(e instanceof PokemonEntityJ) || e.tethering == null) return
        const pk = e.pokemon
        if (!ehTipo(pk)) return
        const pos = e.tethering.getPasturePos()
        const chave = `${pos.x},${pos.y},${pos.z}`
        const base = Math.max(1, Math.floor(pk.level / 2))
        const quanto = pk.forcedAspects.contains('geraldo_rapido') ? base * 2 : base
        if (!porPasto.has(chave)) porPasto.set(chave, { pos: pos, source: 0 })
        porPasto.get(chave).source += quanto
      })

      porPasto.forEach((info, chave) => {
        const k = `${level.dimension}|${chave}`
        let c = cache.get(k)
        if (c == null || server.tickCount - c.tick >= 1200) {
          c = { tick: server.tickCount, pos: acharJarro(level, info.pos) }
          cache.set(k, c)
        }
        if (c.pos == null) return
        const jarro = level.getBlockEntity(c.pos)
        if (!(jarro instanceof SourceJarJ)) { cache.delete(k); return }
        jarro.addSource(info.source)
        jarro.updateBlock()
      })
    })
  })
})()
