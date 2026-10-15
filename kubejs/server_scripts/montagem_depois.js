// Coloca os blocos que a montagem automática do MMR não consegue pôr (Nozzles do Create em cima dos Encased Fans da
// Pescaria). Pro MMR eles são "qualquer bloco" (ferramentas/estruturas_maquinas.py, DEPOIS).
// A cada INTERVALO, controladores perto dos jogadores com a máquina já FORMADA (isFormed: os fans no lugar, o Nozzle
// tem onde apoiar) ganham os blocos de global.geraldo.depois nas posições que estão com ar.
// Só coloca o que consegue ficar ali (canSurvive): sem isso o Nozzle sem Fan caía e era recolocado sem parar.

;(() => {
  const ControllerJ = Java.loadClass('es.degrassi.mmreborn.common.entity.MachineControllerEntity')
  const BuiltInRegistriesJ = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
  const ResourceLocationJ = Java.loadClass('net.minecraft.resources.ResourceLocation')

  const INTERVALO = 40   // ticks (2 s)
  const RAIO_CHUNKS = 4

  // [dx, dz] do desenho (controlador olhando pro sul) -> mundo, pela direção do controlador
  const girar = (dx, dz, face) => {
    switch (face) {
      case 'north': return [-dx, -dz]
      case 'east': return [dz, -dx]
      case 'west': return [-dz, dx]
      default: return [dx, dz]
    }
  }
  const VETOR = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }
  const girarDirecao = (dir, face) => {
    const v = VETOR[dir]
    if (!v) return dir // up/down
    const r = girar(v[0], v[1], face)
    for (const nome in VETOR) if (VETOR[nome][0] == r[0] && VETOR[nome][1] == r[1]) return nome
    return dir
  }

  const comFacing = (estado, nome) => {
    const prop = estado.getBlock().getStateDefinition().getProperty('facing')
    const valor = prop == null ? null : prop.getValue(nome)
    return valor != null && valor.isPresent() ? estado.setValue(prop, valor.get()) : estado
  }

  // 'create:nozzle[facing=up]' -> BlockState que consegue ficar em pé (o facing do desenho, girado pela direção do
  // controlador; se não se sustentar, a direção que se sustenta — o Nozzle só fica com o Fan soprando nele), ou null
  const estadoDe = (texto, face, level, p) => {
    const m = texto.match(/^([^\[]+)(?:\[facing=(\w+)\])?$/)
    const base = BuiltInRegistriesJ.BLOCK.get(ResourceLocationJ.parse(m[1])).defaultBlockState()
    if (!m[2]) return base.canSurvive(level, p) ? base : null
    const tentativas = [girarDirecao(m[2], face), 'up', 'down', 'north', 'south', 'east', 'west']
    for (let i = 0; i < tentativas.length; i++) {
      const e = comFacing(base, tentativas[i])
      if (e.canSurvive(level, p)) return e
    }
    return null
  }

  const direcaoDo = (level, pos) => {
    const st = level.getBlockState(pos)
    const prop = st.getBlock().getStateDefinition().getProperty('facing')
    return prop == null ? 'south' : String(st.getValue(prop)).toLowerCase()
  }

  const completar = (level, be) => {
    if (!be.isFormed()) return
    const maq = be.getFoundMachine()
    if (maq == null) return
    const lista = global.geraldo.depois[String(maq.getRegistryName())]
    if (!lista) return
    const pos = be.blockPos
    const face = direcaoDo(level, pos)
    lista.forEach(d => {
      const r = girar(d[0], d[2], face)
      const p = pos.offset(r[0], d[1], r[1])
      if (!level.getBlockState(p).isAir()) return
      const estado = estadoDe(d[3], face, level, p)
      if (estado == null) return
      level.setBlockAndUpdate(p, estado)
      console.info(`[montagem_depois] ${maq.getRegistryName()} ${p}: ${estado}`)
    })
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
            if (be instanceof ControllerJ) completar(level, be)
          })
        }
      }
    })
  })
})()
