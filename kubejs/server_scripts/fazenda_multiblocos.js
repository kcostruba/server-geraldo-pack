// Fazendas de drops em multibloco (Modular Machinery Reborn): o upgrade da fazenda do Pasture.
// Estrutura: ferramentas/estruturas_maquinas.py (gera estruturas_gerado.js; o livro usa a mesma).
//
//   Rancho Pokémon (tier 1):      a cada 60 s, 1 sorteio da tabela de drops de cada Pokémon (5x o Pasture)
//   Santuário Lendário (tier 2):  a cada 30 s, 2 sorteios (20x) e aceita lendários, míticos e ultra-bestas
//
// Conta os Pokémon do Pasture DA MÁQUINA (o que fica dentro do cercado; global.geraldo.MB.pokemonPerto).
// As tabelas são as completas (geraldo:pokemon_drops/<especie>, ferramentas/gerar_drops_pasture.py): incluem os itens de mobs
// do Nether/End/especiais (vara de blaze, totem...) que o Pasture não dá (ele usa pokemon_drops_pasto/).
// e as berries valem igual: Salac (geraldo_rapido) = sorteio extra, Lansat (geraldo_sorte) = extra so dos raros,
// Sitrus (geraldo_fartura) = extra com quantidade dobrada.
// Pokémon contado por uma máquina para de dar drop pelo Pasture (modo_pasture.js lê global.geraldo.maquinaPokemon).
// Os drops vão pro barramento de saída da máquina; o que não couber cai em cima do controlador.

;(() => {
  const Vec3J = Java.loadClass('net.minecraft.world.phys.Vec3')
  const ResourceKeyJ = Java.loadClass('net.minecraft.resources.ResourceKey')
  const RegistriesJ = Java.loadClass('net.minecraft.core.registries.Registries')
  const ResourceLocationJ = Java.loadClass('net.minecraft.resources.ResourceLocation')
  const LootTableJ = Java.loadClass('net.minecraft.world.level.storage.loot.LootTable')
  const LootParamsBuilder = Java.loadClass('net.minecraft.world.level.storage.loot.LootParams$Builder')
  const LootContextParamsJ = Java.loadClass('net.minecraft.world.level.storage.loot.parameters.LootContextParams')
  const LootContextParamSetsJ = Java.loadClass('net.minecraft.world.level.storage.loot.parameters.LootContextParamSets')
  const BlockJ = Java.loadClass('net.minecraft.world.level.block.Block')

  const LENDARIO = ['legendary', 'mythical', 'ultra_beast', 'restricted']

  const TIERS = {
    rancho: { maquina: 'geraldo:rancho_pokemon', nome: 'Rancho Pokémon', duracao: 1200, sorteios: 1, max: 16, fe: 128, lendarios: false },
    // um Pasture só (16 Pokémon): compensa com 3 sorteios a cada 20 s
    santuario: { maquina: 'geraldo:santuario_lendario', nome: 'Santuário Lendário', duracao: 400, sorteios: 3, max: 16, fe: 512, lendarios: true }
  }

  // uuid do Pokémon -> tick em que uma máquina contou ele por último (modo_pasture.js consulta)
  if (global.geraldo.maquinaPokemon == null) global.geraldo.maquinaPokemon = {}


  MMREvents.machines(event => {
    // 3x3, 3 de altura (de baixo pra cima): Tábuas de Arquimadeira (Ars), Cercas Tratadas (IE), Carcaça de Andesito (Create)
    event.create(TIERS.rancho.maquina)
      .name(TIERS.rancho.nome)
      .color('#7BB661')
      .structure(global.geraldo.estrutura(TIERS.rancho.maquina))

    // 5x5, 4 de altura (de baixo pra cima; ' ' = qualquer bloco): Carcaça de Latão (Create), Ouro, Netherite, Sinalizador,
    // Tijolos de Pedra-Outra (Occultism) nos cantos, anel de Tijolos Grandes de Pedra-Fonte (Ars) no topo
    event.create(TIERS.santuario.maquina)
      .name(TIERS.santuario.nome)
      .color('#E8C547')
      .structure(global.geraldo.estrutura(TIERS.santuario.maquina))
  })

  // ---------------------------------------------------------------- Pokémon
  const ehLendario = pk => {
    let sim = false
    pk.species.labels.forEach(l => { if (LENDARIO.indexOf(String(l)) >= 0) sim = true })
    return sim
  }

  const tabela = (server, id) => {
    const key = ResourceKeyJ.create(RegistriesJ.LOOT_TABLE, ResourceLocationJ.parse(id))
    const t = server.reloadableRegistries().getLootTable(key)
    return t == LootTableJ.EMPTY ? null : t
  }

  // Pokémon do Pasture da máquina que têm tabela de drops (no máximo tier.max)
  const pokemonPerto = (server, level, pos, tier) => {
    const lista = []
    global.geraldo.MB.pokemonPerto(level, pos).forEach(e => {
      if (lista.length >= tier.max) return
      const pk = e.pokemon
      if (!tier.lendarios && ehLendario(pk)) return
      const especie = String(pk.species.resourceIdentifier.path)
      if (tabela(server, `geraldo:pokemon_drops/${especie}`) == null) return
      lista.push({ pk: pk, ent: e, especie: especie })
    })
    return lista
  }

  const marcar = (server, lista) => {
    lista.forEach(p => { global.geraldo.maquinaPokemon[String(p.pk.uuid)] = server.tickCount })
  }

  // ent = o Pokémon (THIS_ENTITY): la_tingida.js usa pra saber a cor da lã
  const sortear = (server, level, pos, id, ent) => {
    const t = tabela(server, id)
    if (t == null) return []
    const params = new LootParamsBuilder(level)
      .withParameter(LootContextParamsJ.ORIGIN, Vec3J.atCenterOf(pos))
      .withOptionalParameter(LootContextParamsJ.THIS_ENTITY, ent)
      .create(LootContextParamSetsJ.CHEST)
    return t.getRandomItems(params)
  }

  // args: [rancho|santuario]
  MMREvents.recipeFunction('fazenda_multibloco', event => {
    const tier = TIERS[String(event.get(0))]
    const level = event.block.level
    const lista = pokemonPerto(level.server, level, event.block.pos, tier)
    if (lista.length == 0) {
      event.error(Text.of(tier.lendarios
        ? `Nenhum Pokémon com drops no Pasture da máquina`
        : `Nenhum Pokémon com drops no Pasture da máquina (lendários só no Santuário)`))
    }
    marcar(level.server, lista)
  })

  MMREvents.recipeFunction('fazenda_multibloco_fim', event => {
    const tier = TIERS[String(event.get(0))]
    const level = event.block.level
    const server = level.server
    const pos = event.block.pos
    const lista = pokemonPerto(server, level, pos, tier)
    marcar(server, lista)

    const itens = []
    lista.forEach(p => {
      const aspects = p.pk.forcedAspects
      const base = `geraldo:pokemon_drops/${p.especie}`
      for (let i = 0; i < tier.sorteios; i++) {
        sortear(server, level, pos, base, p.ent).forEach(s => itens.push(s))
        if (aspects.contains('geraldo_rapido')) sortear(server, level, pos, base, p.ent).forEach(s => itens.push(s))
        if (aspects.contains('geraldo_sorte')) sortear(server, level, pos, `${base}_sorte`, p.ent).forEach(s => itens.push(s))
        if (aspects.contains('geraldo_fartura')) sortear(server, level, pos, `${base}_fartura`, p.ent).forEach(s => itens.push(s))
      }
    })

    itens.forEach(s => {
      const sobra = event.machine.addItem(s)
      if (!sobra.isEmpty()) BlockJ.popResource(level, pos.above(), sobra)
    })
  })

  // ---------------------------------------------------------------- receitas
  ServerEvents.recipes(event => {
    Object.keys(TIERS).forEach(nome => {
      const tier = TIERS[nome]
      event.recipes.modular_machinery_reborn.machine_recipe(tier.maquina, tier.duracao)
        .requireFunctionToStart('fazenda_multibloco', nome)
        .requireEnergyPerTick(tier.fe)
        .requireFunctionOnEnd('fazenda_multibloco_fim', nome)
        .id(`geraldo:${nome}/drops`)
    })

    // Rancho: meio de jogo
    event.shaped(Item.of('modular_machinery_reborn:controller', `[modular_machinery_reborn:machine="${TIERS.rancho.maquina}"]`), [
      'PCP',
      'HRH',
      'OEO'
    ], {
      P: '#c:plates/iron',
      O: 'occultism:otherstone',
      C: 'minecraft:composter',
      H: 'minecraft:hay_block',
      R: 'modular_machinery_reborn:casing_reinforced',
      E: 'immersiveengineering:component_electronic'
    }).id('geraldo:rancho/controlador')

    // Santuário: fim de jogo, com itens que os lendários soltam (Groudon, Kyogre/Manaphy, ultra-bestas)
    event.shaped(Item.of('modular_machinery_reborn:controller', `[modular_machinery_reborn:machine="${TIERS.santuario.maquina}"]`), [
      'ENE',
      'IRS',
      'AHB'
    ], {
      S: 'ars_nouveau:source_gem_block',
      B: 'occultism:iesnium_ingot',
      E: 'minecraft:echo_shard',
      N: 'minecraft:nether_star',
      I: 'minecraft:netherite_ingot',
      R: 'modular_machinery_reborn:casing_reinforced',
      A: 'immersiveengineering:component_electronic_adv',
      H: 'minecraft:heart_of_the_sea'
    }).id('geraldo:santuario/controlador')
  })
})()
