// Checagem comum dos multiblocos movidos a Pokémon (torre_pika.js, mineradora.js).
// Nas receitas do MMR: .requireFunctionToStart('forca_pokemon', '<tipo>', '<forca minima>'[, '<mult. lendário>'])
//   tipo: id do tipo no Cobblemon (electric, rock...)
//   forca: soma dos niveis dos Pokémon desse tipo que estao no Pasture DA MÁQUINA
// As máquinas são cercados com o Pasture dentro (ferramentas/estruturas_maquinas.py): só contam os Pokémon desse
// Pasture — o mais perto do controlador (a até BUSCA blocos). Pastures de fora não contam.
// Se falhar, o motivo aparece na tela do controlador.

;(() => {
  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const AABBJ = Java.loadClass('net.minecraft.world.phys.AABB')

  const DEBUG = false // true (2026-10-13): loga o que a checagem enxerga em logs/kubejs/server.log
  const BUSCA = 12// blocos em volta do controlador onde procurar o Pasture da máquina (cabe 11x11)
  const NOME_TIPO = { electric: 'Elétrico', rock: 'Pedra' }

  const temTipo = (pk, tipo) => {
    let sim = false
    // (o nome vem com maiúscula: "Electric")
    pk.types.forEach(t => { if (String(t.name).toLowerCase() == tipo) sim = true })
    return sim
  }

  const LENDARIO = ['legendary', 'mythical', 'ultra_beast', 'restricted']
  const ehLendario = pk => {
    let sim = false
    pk.species.labels.forEach(l => { if (LENDARIO.indexOf(String(l)) >= 0) sim = true })
    return sim
  }

  // Pokémon do Pasture da máquina: entre os Pastures com Pokémon perto, o mais perto do controlador
  const doPasto = (level, pos) => {
    const area = new AABBJ(pos.x - BUSCA, pos.y - BUSCA, pos.z - BUSCA, pos.x + BUSCA + 1, pos.y + BUSCA + 1, pos.z + BUSCA + 1)
    const porPasto = new Map()
    level.getEntitiesOfClass(PokemonEntityJ, area).forEach(e => {
      if (e.tethering == null) return
      const p = e.tethering.getPasturePos()
      const chave = `${p.x},${p.y},${p.z}`
      if (!porPasto.has(chave)) porPasto.set(chave, { dist: p.distSqr(pos), lista: [] })
      porPasto.get(chave).lista.push(e)
    })
    let melhor = null
    porPasto.forEach(g => { if (melhor == null || g.dist < melhor.dist) melhor = g })
    return melhor == null ? [] : melhor.lista
  }

  // multLendario: lendários/míticos/ultra-bestas contam o nível vezes isso (Usina: 3)
  const forcaEm = (level, pos, tipo, multLendario) => {
    let forca = 0
    let quantos = 0
    doPasto(level, pos).forEach(e => {
      const pk = e.pokemon
      if (!temTipo(pk, tipo)) return
      forca += ehLendario(pk) ? pk.level * multLendario : pk.level
      quantos++
    })
    return { forca: forca, quantos: quantos }
  }

  // ---------------------------------------------------------------- ajudas pras outras máquinas (global.geraldo.MB)
  const ResourceKeyJ = Java.loadClass('net.minecraft.resources.ResourceKey')
  const RegistriesJ = Java.loadClass('net.minecraft.core.registries.Registries')
  const ResourceLocationJ = Java.loadClass('net.minecraft.resources.ResourceLocation')
  const LootTableJ = Java.loadClass('net.minecraft.world.level.storage.loot.LootTable')
  const LootParamsBuilder = Java.loadClass('net.minecraft.world.level.storage.loot.LootParams$Builder')
  const LootContextParamsJ = Java.loadClass('net.minecraft.world.level.storage.loot.parameters.LootContextParams')
  const LootContextParamSetsJ = Java.loadClass('net.minecraft.world.level.storage.loot.parameters.LootContextParamSets')
  const Vec3J = Java.loadClass('net.minecraft.world.phys.Vec3')
  const BlockJ = Java.loadClass('net.minecraft.world.level.block.Block')

  global.geraldo.MB = {
    // Pokémon do Pasture da máquina (entidades)
    pokemonPerto: doPasto,
    temTipo: temTipo,
    temMovimento: (pk, nome) => {
      let sim = false
      pk.moveSet.getMoves().forEach(m => { if (String(m.name) == nome) sim = true })
      return sim
    },
    habilidade: pk => String(pk.ability.name),
    // sorteia uma loot table (ent = Pokémon opcional, pra THIS_ENTITY)
    sortear: (level, pos, id, ent) => {
      const key = ResourceKeyJ.create(RegistriesJ.LOOT_TABLE, ResourceLocationJ.parse(id))
      const t = level.server.reloadableRegistries().getLootTable(key)
      if (t == LootTableJ.EMPTY) return []
      const b = new LootParamsBuilder(level).withParameter(LootContextParamsJ.ORIGIN, Vec3J.atCenterOf(pos))
      if (ent != null) b.withOptionalParameter(LootContextParamsJ.THIS_ENTITY, ent)
      return t.getRandomItems(b.create(LootContextParamSetsJ.CHEST))
    },
    // põe os itens na saída da máquina; o que não couber cai em cima do controlador
    entregar: (event, itens) => {
      itens.forEach(s => {
        const sobra = event.machine.addItem(s)
        if (!sobra.isEmpty()) BlockJ.popResource(event.block.level, event.block.pos.above(), sobra)
      })
    }
  }

  // argumento que pode não existir (get fora da lista dá erro)
  const argOpcional = (ev, i) => {
    try {
      return ev.get(i)
    } catch (e) {
      return null
    }
  }

  MMREvents.recipeFunction('forca_pokemon', event => {
    const tipo = String(event.get(0))
    const precisa = parseInt(event.get(1))
    const terceiro = argOpcional(event, 2)
    const mult = terceiro == null ? 1 : parseFloat(terceiro)
    const nome = NOME_TIPO[tipo] || tipo
    const r = forcaEm(event.block.level, event.block.pos, tipo, mult)
    if (DEBUG) {
      let todos = ''
      doPasto(event.block.level, event.block.pos).forEach(e => {
        let tipos = ''
        e.pokemon.types.forEach(t => { tipos += String(t.name) + ',' })
        todos += `${e.pokemon.species.name} nv${e.pokemon.level} [${tipos}]; `
      })
      console.info(`[forca_pokemon] ${event.block.pos} tipo=${tipo} precisa=${precisa} forca=${r.forca} quantos=${r.quantos} pasto=${todos}`)
    }
    if (r.quantos == 0) event.error(Text.of(`Nenhum Pokémon do tipo ${nome} no Pasture da máquina`))
    if (r.forca < precisa) event.error(Text.of(`Força ${r.forca} (soma dos níveis dos ${nome}); precisa de ${precisa}`))
  })
})()
