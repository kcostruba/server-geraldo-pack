// Chocar ovos do Cobbreeding na Garden Cloche do IE (feno como solo, ovo no lugar da semente).
// A receita (kubejs/data/geraldo/recipe/cloche/ovo_cobbreeding.json) solta uma geraldo:casca_de_ovo quando termina;
// aqui a casca vira o ovo da semente com o contador zerado, no slot de saida da Cloche.
// Ovo com contador zerado choca na hora em que entra no inventario de alguem (logica do proprio Cobbreeding):
// o Pokémon vai pro time ou pro PC de quem pegou. Da pra puxar com cano e mandar pra um bau, tanto faz.
//
// As Cloches sao achadas perto dos jogadores e lembradas no mundo, entao continuam funcionando
// com o jogador longe se o chunk estiver carregado (FTB Chunks).

ServerEvents.tags('item', event => {
  event.add('geraldo:ovos_cobbreeding', /^cobbreeding:.*_egg$/)
})

;(() => {
  if (!Platform.isLoaded('cobbreeding') || !Platform.isLoaded('immersiveengineering')) return

  const Cloche = Java.loadClass('blusunrize.immersiveengineering.common.blocks.metal.ClocheBlockEntity')
  const PokemonEgg = Java.loadClass('ludichat.cobbreeding.PokemonEgg')
  const ItemStackJ = Java.loadClass('net.minecraft.world.item.ItemStack')
  const IntegerJ = Java.loadClass('java.lang.Integer')
  const BlockPosJ = Java.loadClass('net.minecraft.core.BlockPos')

  const CASCA = 'geraldo:casca_de_ovo'
  const INTERVALO = 40        // ticks (2 s)
  const RAIO_CHUNKS = 3       // procura Cloches novas nesse raio em volta de cada jogador
  const CHAVE = 'geraldo_cloches_ovo'

  // "dimensao|x,y,z" das Cloches que ja tiveram ovo (texto, pq o BlockPos em long perde precisao no JS)
  const lembradas = new Set()
  let carregou = false

  const salvar = server => {
    const lista = new (Java.loadClass('net.minecraft.nbt.ListTag'))()
    const StringTag = Java.loadClass('net.minecraft.nbt.StringTag')
    lembradas.forEach(k => lista.add(StringTag.valueOf(k)))
    server.persistentData.put(CHAVE, lista)
  }

  const carregar = server => {
    const lista = server.persistentData.getList(CHAVE, 8) // 8 = StringTag
    for (let i = 0; i < lista.size(); i++) lembradas.add(String(lista.getString(i)))
    carregou = true
  }

  const ehOvo = stack => !stack.isEmpty() && stack.item instanceof PokemonEgg

  const chaveDe = (level, pos) => `${level.dimension}|${pos.x},${pos.y},${pos.z}`

  const processar = (level, be) => {
    const inv = be.getInventory()
    const ovo = inv.get(Cloche.SLOT_SEED)
    if (!ehOvo(ovo)) return

    let slotCasca = -1
    for (let s = 0; s < inv.size(); s++) if (inv.get(s).id == CASCA) slotCasca = s
    if (slotCasca < 0) return

    const pronto = ovo.copy()
    pronto.set(PokemonEgg.Companion.getTIMER(), IntegerJ.valueOf(0))
    inv.set(slotCasca, pronto)
    inv.set(Cloche.SLOT_SEED, ItemStackJ.EMPTY)
    be.setChanged()
    level.sendBlockUpdated(be.blockPos, be.blockState, be.blockState, 3)
    const p = be.blockPos
    level.server.runCommandSilent(`execute in ${level.dimension} run particle minecraft:heart ${p.x + 0.5} ${p.y + 1.2} ${p.z + 0.5} 0.3 0.3 0.3 0 8`)
    level.server.runCommandSilent(`execute in ${level.dimension} run playsound minecraft:entity.chicken.egg block @a ${p.x + 0.5} ${p.y + 1} ${p.z + 0.5} 1 0.8`)
  }

  ServerEvents.tick(event => {
    const server = event.server
    if (server.tickCount % INTERVALO != 0) return
    if (!carregou) carregar(server)
    let mudou = false

    // Cloches novas perto dos jogadores
    server.players.forEach(player => {
      const level = player.level
      const ccx = player.blockX >> 4, ccz = player.blockZ >> 4
      for (let cx = ccx - RAIO_CHUNKS; cx <= ccx + RAIO_CHUNKS; cx++) {
        for (let cz = ccz - RAIO_CHUNKS; cz <= ccz + RAIO_CHUNKS; cz++) {
          if (!level.hasChunk(cx, cz)) continue
          level.getChunk(cx, cz).getBlockEntities().values().forEach(be => {
            if (!(be instanceof Cloche) || be.isDummy()) return
            if (!ehOvo(be.getInventory().get(Cloche.SLOT_SEED))) return
            const chave = chaveDe(level, be.blockPos)
            if (!lembradas.has(chave)) { lembradas.add(chave); mudou = true }
          })
        }
      }
    })

    // todas as lembradas que estao carregadas; so esquece quando a Cloche some
    // (sem ovo ela continua lembrada, pra um cano poder colocar o proximo)
    const niveis = {}
    server.getAllLevels().forEach(l => { niveis[String(l.dimension)] = l })
    Array.from(lembradas).forEach(chave => {
      const sep = chave.lastIndexOf('|')
      const level = niveis[chave.substring(0, sep)]
      const xyz = chave.substring(sep + 1).split(',').map(n => parseInt(n))
      if (level == null) { lembradas.delete(chave); mudou = true; return }
      if (!level.hasChunk(xyz[0] >> 4, xyz[2] >> 4)) return // descarregada: tenta depois
      const be = level.getBlockEntity(new BlockPosJ(xyz[0], xyz[1], xyz[2]))
      if (!(be instanceof Cloche) || be.isDummy()) { lembradas.delete(chave); mudou = true; return }
      processar(level, be)
    })

    if (mudou) salvar(server)
  })
})()
