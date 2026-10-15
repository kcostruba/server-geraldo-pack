// Completa a metade de cima do Pasture.
// A montagem automática do MMR coloca o Pasture das máquinas sem estado (ver ferramentas/estruturas_maquinas.py:
// com "part=bottom" o MMR quebrava a sincronização e o jogador era desconectado), então ele vem só com a metade de
// baixo (e com água: o estado padrão é waterlogged=true). A cada INTERVALO, Pastures perto dos jogadores com a
// metade de baixo e ar em cima ganham a metade de cima, e os dois ficam sem água.

;(() => {
  const PastureBEJ = Java.loadClass('com.cobblemon.mod.common.block.entity.PokemonPastureBlockEntity')

  const INTERVALO = 40   // ticks (2 s)
  const RAIO_CHUNKS = 4

  const completar = (level, pos) => {
    const estado = level.getBlockState(pos)
    const prop = estado.getBlock().getStateDefinition().getProperty('part')
    if (prop == null || String(estado.getValue(prop)).toLowerCase() != 'bottom') return
    const cima = pos.above()
    if (!level.getBlockState(cima).isAir()) return
    const topo = prop.getValue('top')
    if (!topo.isPresent()) return
    // o estado padrão do Pasture vem com água (waterlogged=true): o recém-colocado pelo MMR fica seco
    // (cycle inverte o valor: setValue(agua, false) do JS não acha o método no Rhino)
    const agua = estado.getBlock().getStateDefinition().getProperty('waterlogged')
    const seco = agua != null && estado.getValue(agua) == true ? estado.cycle(agua) : estado
    level.setBlock(pos, seco, 3)
    level.setBlock(cima, seco.setValue(prop, topo.get()), 3)
  }

  ServerEvents.tick(event => {
    const server = event.server
    if (server.tickCount % INTERVALO != 0) return
    server.players.forEach(player => {
      const level = player.level
      const ccx = player.blockX >> 4, ccz = player.blockZ >> 4
      for (let cx = ccx - RAIO_CHUNKS; cx <= ccx + RAIO_CHUNKS; cx++) {
        for (let cz = ccz - RAIO_CHUNKS; cz <= ccz + RAIO_CHUNKS; cz++) {
          if (!level.hasChunk(cx, cz)) continue
          level.getChunk(cx, cz).getBlockEntities().values().forEach(be => {
            if (be instanceof PastureBEJ) completar(level, be.blockPos)
          })
        }
      }
    })
  })
})()
