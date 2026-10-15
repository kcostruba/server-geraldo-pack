// Area do Pasture: 9x9 na frente de quem coloca o bloco, com o Pasture na beirada (no meio do lado).
//
//   . . . . . . . . .
//   . . . . . . . . .      9 de largura x 9 de comprimento
//   . . . . . . . . .      os Pokémon andam so aqui dentro
//   . . . . . . . . .
//   . . . . . . . . .
//   . . . . . . . . .
//   . . . . . . . . .
//   . . . . . . . . .
//   . . . . . . . . .
//           P              <- Pasture, voce olhando pra cima ao colocar
//
// O Cobblemon so calcula a area quando o Pasture e colocado e guarda no bloco; aqui ela e trocada logo
// depois. Pastures colocados antes deste script continuam com a area antiga ate serem recolocados.
// O modo do Pasture (ninho, drops ou so trabalhos) vem do bloco embaixo dele: modo_pasture.js.

;(() => {
  const PastureBE = Java.loadClass('com.cobblemon.mod.common.block.entity.PokemonPastureBlockEntity')
  const BlockPosJ = Java.loadClass('net.minecraft.core.BlockPos')

  const LADO = 4         // blocos pra cada lado do Pasture (9 de largura)
  const COMPRIMENTO = 9  // blocos pra frente
  const ALTURA = 4       // pra cima e pra baixo

  const pastureEm = (level, pos) => {
    for (const p of [pos, pos.below()]) {
      const be = level.getBlockEntity(p)
      if (be instanceof PastureBE) return be
    }
    return null
  }

  BlockEvents.placed('cobblemon:pasture', event => {
    const quem = event.entity
    if (quem == null || !quem.isPlayer()) return
    const level = event.level
    // direcao pelo yaw (0 = sul +Z, 90 = oeste -X, 180 = norte -Z, 270 = leste +X)
    let yaw = Number(quem.yaw)
    if (isNaN(yaw)) yaw = Number(quem.getYRot())
    const quadrante = ((Math.round(yaw / 90) % 4) + 4) % 4
    const [dx, dz] = [[0, 1], [-1, 0], [0, -1], [1, 0]][quadrante]
    const posClicada = event.block.pos

    // um tick depois, pra o bloco de cima e a block entity ja existirem
    event.server.scheduleInTicks(1, () => {
      const be = pastureEm(level, posClicada)
      if (be == null) return
      const pos = be.getBlockPos()
      const ax = pos.x + dx, az = pos.z + dz
      const bx = pos.x + dx * COMPRIMENTO, bz = pos.z + dz * COMPRIMENTO
      let x1 = Math.min(ax, bx), x2 = Math.max(ax, bx)
      let z1 = Math.min(az, bz), z2 = Math.max(az, bz)
      if (dx != 0) { z1 = pos.z - LADO; z2 = pos.z + LADO }
      else { x1 = pos.x - LADO; x2 = pos.x + LADO }

      be.setMinRoamPos(new BlockPosJ(x1, pos.y - ALTURA, z1))
      be.setMaxRoamPos(new BlockPosJ(x2, pos.y + ALTURA, z2))
      be.setChanged()
      quem.setStatusMessage(Text.of('Área do Pasture: 9x9 à sua frente | osso embaixo = fazenda de drops').green())
    })
  })
})()
