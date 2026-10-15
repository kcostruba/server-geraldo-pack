// Invasão da Equipe Rocket: no lugar das invasões de saqueadores (que não têm mais mobs — sem_mobs_vanilla.js),
// quando uma invasão começa perto de um jogador (Ritual do Desafio — "Challenge" — do Ars, ou qualquer outra), ela é cancelada e um
// esquadrão da Equipe Rocket (treinadores do RCT) aparece em volta do centro da vila querendo batalhar.
//   - recrutas: 2 + nível da invasão (até 7); administradores (Archer/Ariana): 1 a partir do nível 3, 2 no nível 5
//     (o Ritual do Ars com Esmeralda deixa a invasão no nível máximo)
//   - cada treinador é do RCT: fale com ele pra batalhar; ganhando, ele dá a recompensa dele

;(() => {
  if (!Platform.isLoaded('rctmod')) return

  const HeightmapJ = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')

  const INTERVALO = 40   // ticks (2 s)
  const BUSCA = 96       // blocos em volta do jogador onde procurar invasão
  const RAIO = 8         // espalhamento do esquadrão em volta do centro da vila

  const RECRUTAS = ['team_rocket_grunt_0046', 'team_rocket_grunt_0047', 'team_rocket_grunt_0048', 'team_rocket_grunt_0049',
    'team_rocket_grunt_015f', 'team_rocket_grunt_0160', 'team_rocket_grunt_0161', 'team_rocket_grunt_0162',
    'team_rocket_grunt_0163', 'team_rocket_grunt_0164', 'team_rocket_grunt_0165', 'team_rocket_grunt_0166']
  const ADMINS = ['rocket_admin_archer_002a', 'rocket_admin_ariana_0029', 'team_rocket_admin_021f', 'team_rocket_admin_0220']

  const sortear = lista => lista[Math.floor(Math.random() * lista.length)]

  const invocar = (server, level, centro, treinador) => {
    const ang = Math.random() * Math.PI * 2
    const x = Math.floor(centro.x + Math.cos(ang) * (2 + Math.random() * RAIO))
    const z = Math.floor(centro.z + Math.sin(ang) * (2 + Math.random() * RAIO))
    const y = level.getHeight(HeightmapJ.MOTION_BLOCKING_NO_LEAVES, x, z)
    server.runCommandSilent(`execute in ${level.dimension} run rctmod trainer summon ${treinador} at ${x} ${y} ${z}`)
  }

  const esquadrao = (server, level, raid) => {
    const centro = raid.getCenter()
    const nivel = Math.max(1, raid.getRaidOmenLevel())
    const recrutas = Math.min(7, 2 + nivel)
    const admins = nivel >= 5 ? 2 : (nivel >= 3 ? 1 : 0)
    for (let i = 0; i < recrutas; i++) invocar(server, level, centro, sortear(RECRUTAS))
    for (let i = 0; i < admins; i++) invocar(server, level, centro, sortear(ADMINS))
    raid.stop()
    server.runCommandSilent(`execute in ${level.dimension} run playsound minecraft:event.raid.horn hostile @a ${centro.x} ${centro.y} ${centro.z} 4 1`)
    level.players().forEach(p => {
      if (p.blockPosition().distSqr(centro) > BUSCA * BUSCA) return
      p.tell(Text.of('A Equipe Rocket invadiu a vila! ').red().bold()
        .append(Text.of(`${recrutas} recrutas${admins > 0 ? ` e ${admins} administrador(es)` : ''} querem batalhar — fale com eles.`).gold()))
    })
  }

  const tratadas = new Set() // ids das invasões já trocadas

  ServerEvents.tick(event => {
    const server = event.server
    if (server.tickCount % INTERVALO != 0) return
    server.players.forEach(player => {
      const level = player.level
      const raid = level.getRaids().getNearbyRaid(player.blockPosition(), BUSCA * BUSCA)
      if (raid == null || raid.isStopped()) return
      const chave = `${level.dimension}|${raid.getId()}`
      if (tratadas.has(chave)) return
      tratadas.add(chave)
      esquadrao(server, level, raid)
    })
  })
})()
