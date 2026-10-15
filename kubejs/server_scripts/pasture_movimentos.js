// Pokémon de Pasture que ajudam máquinas e plantações (qualquer modo do Pasture, até sem bloco embaixo).
//
// Fogo -> Blaze Burner do Create a até RAIO blocos do Pasture:
//   - Pokémon do tipo Fogo mantém o Blaze Burner ACESO (como carvão; só reabastece quando está acabando).
//   - Se ele souber Flame Charge, deixa SUPER AQUECIDO (como Blaze Cake).
//   Usa o mesmo caminho do Deployer (BlazeBurnerBlock.tryInsert), então segue as regras do Create.
//   Cada Pokémon cuida de até QUEIMADORES_POR_POKEMON queimadores.
//
// Magical Leaf -> plantações a até RAIO blocos do Pasture crescem mais rápido (efeito de farinha de osso, como o
//   Ritual de Crescimento Excessivo do Ars): a cada ciclo, cada planta tem CHANCE_FOLHA de crescer um pouco.
//   Só plantas de verdade: #minecraft:crops, mudas, plantas do Cobblemon, cacau, arbusto de frutas (nada de grama/flor).

;(() => {
  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const BonemealableJ = Java.loadClass('net.minecraft.world.level.block.BonemealableBlock')
  const BoneMealItemJ = Java.loadClass('net.minecraft.world.item.BoneMealItem')
  const FakePlayerFactoryJ = Java.loadClass('net.neoforged.neoforge.common.util.FakePlayerFactory')
  const temCreate = Platform.isLoaded('create')
  const BlazeBurnerBlockJ = temCreate ? Java.loadClass('com.simibubi.create.content.processing.burner.BlazeBurnerBlock') : null

  const INTERVALO = 200            // ticks (10 s)
  const RAIO = 8                   // horizontal, a partir do bloco do Pasture
  const ALTURA = 4
  const QUEIMADORES_POR_POKEMON = 2
  const CHANCE_FOLHA = 0.25        // por planta, por ciclo (com pelo menos 1 Pokémon com Magical Leaf no Pasture)
  const PLANTAS_EXTRA = ['minecraft:cocoa', 'minecraft:sweet_berry_bush', 'minecraft:nether_wart']

  const temMovimento = (pk, nome) => {
    let sim = false
    pk.moveSet.getMoves().forEach(m => { if (String(m.name) == nome) sim = true })
    return sim
  }

  const ehFogo = pk => {
    let sim = false
    pk.types.forEach(t => { if (String(t.name).toLowerCase() == 'fire') sim = true })
    return sim
  }

  const ehPlanta = bloco => {
    const id = String(bloco.id)
    if (!(bloco.blockState.block instanceof BonemealableJ)) return false
    return bloco.hasTag('minecraft:crops') || bloco.hasTag('minecraft:saplings') ||
      id.startsWith('cobblemon:') || PLANTAS_EXTRA.indexOf(id) >= 0
  }

  // posições num caixote em volta do Pasture
  const emVolta = (pasto, fn) => {
    for (let x = pasto.x - RAIO; x <= pasto.x + RAIO; x++) {
      for (let z = pasto.z - RAIO; z <= pasto.z + RAIO; z++) {
        for (let y = pasto.y - 1; y <= pasto.y + ALTURA; y++) fn(x, y, z)
      }
    }
  }

  // ---------------------------------------------------------------- Blaze Burner
  const queimadoresPerto = (level, pasto) => {
    const lista = []
    for (let cx = (pasto.x - RAIO) >> 4; cx <= (pasto.x + RAIO) >> 4; cx++) {
      for (let cz = (pasto.z - RAIO) >> 4; cz <= (pasto.z + RAIO) >> 4; cz++) {
        if (!level.hasChunk(cx, cz)) continue
        level.getChunk(cx, cz).getBlockEntities().values().forEach(be => {
          const p = be.blockPos
          if (Math.abs(p.x - pasto.x) > RAIO || Math.abs(p.z - pasto.z) > RAIO || Math.abs(p.y - pasto.y) > ALTURA) return
          if (String(level.getBlock(p).id) == 'create:blaze_burner') lista.push(p)
        })
      }
    }
    return lista
  }

  const aquecer = (level, pasto, fogo, superFogo) => {
    const queimadores = queimadoresPerto(level, pasto)
    if (queimadores.length == 0) return
    const limite = fogo * QUEIMADORES_POR_POKEMON
    const item = superFogo ? 'create:blaze_cake' : 'minecraft:charcoal'
    queimadores.slice(0, limite).forEach(p => {
      // doNotConsume = true (o item é só de mentira), forceOverflow = false (só completa quando está acabando)
      BlazeBurnerBlockJ.tryInsert(level.getBlockState(p), level, p, Item.of(item), true, false, false)
    })
  }

  // ---------------------------------------------------------------- Magical Leaf
  const folhaMagica = (level, pasto) => {
    const jogador = FakePlayerFactoryJ.getMinecraft(level) // mesmo jeito do Ritual do Ars
    emVolta(pasto, (x, y, z) => {
      if (Math.random() >= CHANCE_FOLHA) return
      const bloco = level.getBlock(x, y, z)
      if (!ehPlanta(bloco)) return
      if (BoneMealItemJ.applyBonemeal(Item.of('minecraft:bone_meal'), level, bloco.pos, jogador)) {
        level.server.runCommandSilent(`execute in ${level.dimension} run particle minecraft:happy_villager ${x + 0.5} ${y + 0.5} ${z + 0.5} 0.3 0.3 0.3 0 3`)
      }
    })
  }

  // ---------------------------------------------------------------- ciclo
  ServerEvents.tick(event => {
    const server = event.server
    if (server.tickCount % INTERVALO != 0) return

    server.getAllLevels().forEach(level => {
      // Pokémon de Pasture agrupados pelo Pasture
      const pastos = new Map()
      level.getAllEntities().forEach(e => {
        if (!(e instanceof PokemonEntityJ) || e.tethering == null) return
        const pk = e.pokemon
        const fogo = ehFogo(pk)
        const folha = temMovimento(pk, 'magicalleaf')
        if (!fogo && !folha) return
        const pos = e.tethering.getPasturePos()
        const chave = `${pos.x},${pos.y},${pos.z}`
        if (!pastos.has(chave)) pastos.set(chave, { pos: pos, fogo: 0, superFogo: false, folha: false })
        const info = pastos.get(chave)
        if (fogo) info.fogo++
        if (fogo && temMovimento(pk, 'flamecharge')) info.superFogo = true
        if (folha) info.folha = true
      })

      pastos.forEach(info => {
        if (temCreate && info.fogo > 0) aquecer(level, info.pos, info.fogo, info.superFogo)
        if (info.folha) folhaMagica(level, info.pos)
      })
    })
  })
})()
