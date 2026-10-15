// Líquidos no Pasture: certos Pokémon num Pasture enchem o tanque mais perto com um líquido.
//   Leite (minecraft:milk, ligado pelo Create): Miltank e as cabras Skiddo/Gogoat.
//   Lava: Magby/Magmar/Magmortar e Slugma/Magcargo.
//
// A cada INTERVALO, cada Pokémon de PRODUTORES que está num Pasture põe a quantidade dele (mB) do líquido
// no tanque mais perto do Pasture que aceite esse líquido, a até RAIO blocos (ALTURA pra cima/baixo).
// Conta como tanque qualquer bloco com inventário de fluido cujo id bate com TANQUE (tanque do Create, barril do IE...).
// Berry Salac (aspect geraldo_rapido, berries_trabalho.js) dobra. Funciona em qualquer modo do Pasture.
// Tanque cheio: o líquido daquele ciclo se perde.

;(() => {
  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const FluidCaps = Java.loadClass('net.neoforged.neoforge.capabilities.Capabilities$FluidHandler')
  const FluidStackJ = Java.loadClass('net.neoforged.neoforge.fluids.FluidStack')
  const FluidAction = Java.loadClass('net.neoforged.neoforge.fluids.capability.IFluidHandler$FluidAction')
  const BuiltInRegistriesJ = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
  const ResourceLocationJ = Java.loadClass('net.minecraft.resources.ResourceLocation')

  const INTERVALO = 600 // ticks (30 s)
  const RAIO = 8
  const ALTURA = 5
  const TANQUE = /tank|barrel|drum|cistern/ // (canos e bombas ficam de fora)
  // especie -> [fluido, mB por ciclo]   (125 mB = 1 balde a cada 4 min)
  const PRODUTORES = {
    miltank: ['minecraft:milk', 125], gogoat: ['minecraft:milk', 50], skiddo: ['minecraft:milk', 25],
    magby: ['minecraft:lava', 50], magmar: ['minecraft:lava', 100], magmortar: ['minecraft:lava', 200],
    slugma: ['minecraft:lava', 50], magcargo: ['minecraft:lava', 125]
  }

  const fluidoDe = id => BuiltInRegistriesJ.FLUID.get(ResourceLocationJ.parse(id))

  // "pasture|fluido" -> { tick, pos do tanque ou null }; procura de novo a cada minuto
  const cacheTanque = new Map()

  const acharTanque = (level, pasto, fluido) => {
    let melhor = null
    let melhorDist = 1e9
    for (let cx = (pasto.x - RAIO) >> 4; cx <= (pasto.x + RAIO) >> 4; cx++) {
      for (let cz = (pasto.z - RAIO) >> 4; cz <= (pasto.z + RAIO) >> 4; cz++) {
        if (!level.hasChunk(cx, cz)) continue
        level.getChunk(cx, cz).getBlockEntities().values().forEach(be => {
          const p = be.blockPos
          if (Math.abs(p.x - pasto.x) > RAIO || Math.abs(p.z - pasto.z) > RAIO || Math.abs(p.y - pasto.y) > ALTURA) return
          if (!TANQUE.test(String(level.getBlock(p).id))) return
          const h = level.getCapability(FluidCaps.BLOCK, p, null)
          if (h == null) return
          if (h.fill(new FluidStackJ(fluido, 1), FluidAction.SIMULATE) <= 0) return
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
      level.getAllEntities().forEach(e => {
        if (!(e instanceof PokemonEntityJ) || e.tethering == null) return
        const pk = e.pokemon
        const prod = PRODUTORES[String(pk.species.resourceIdentifier.path)]
        if (prod == null) return
        const fluido = fluidoDe(prod[0])
        const total = pk.forcedAspects.contains('geraldo_rapido') ? prod[1] * 2 : prod[1]

        const pasto = e.tethering.getPasturePos()
        const chave = `${level.dimension}|${pasto.x},${pasto.y},${pasto.z}|${prod[0]}`
        let c = cacheTanque.get(chave)
        if (c == null || server.tickCount - c.tick >= 1200) {
          c = { tick: server.tickCount, pos: acharTanque(level, pasto, fluido) }
          cacheTanque.set(chave, c)
        }
        if (c.pos == null) return
        const h = level.getCapability(FluidCaps.BLOCK, c.pos, null)
        if (h == null) { cacheTanque.delete(chave); return }
        h.fill(new FluidStackJ(fluido, total), FluidAction.EXECUTE)
      })
    })
  })
})()
