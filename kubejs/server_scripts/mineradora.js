// Mineradora Pokémon (tier 1) e Mineradora Profunda (tier 2): multiblocos do MMR que tiram minério com
// Pokémon do tipo Pedra. Força = soma dos níveis dos Pokémon de Pedra no Pasture da máquina (dentro do cercado)
// (checagem 'forca_pokemon' em multiblocos_pokemon.js); faixas mais altas = mais sorteios e minérios raros.
//
// "Encantamentos" — qualquer Pokémon no Pasture da máquina (dentro do cercado):
//   Toque Suave: algum sabe Rock Smash  -> sai o BLOCO de minério (rende mais na moagem).
//                sem ele                -> sai o minério já quebrado (ferro bruto, diamante, pó de redstone...).
//   Fortuna:     cada um com a habilidade Super Luck ou Pickup -> +1 sorteio por ciclo (até +3).
//   Eficiência:  cada um que sabe Dig -> ciclo 50% mais rápido (até 2x).
// Loot tables: geraldo:mineradora/<blocos|quebrado>[_profunda]/faixa_<n> (ferramentas/gerar_mineradora.py),
// 1 sorteio cada; aqui decide quantos sorteios.
//
// Estrutura: ferramentas/estruturas_maquinas.py (gera estruturas_gerado.js; o livro usa a mesma).

;(() => {

  const FORCA = [1, 100, 200, 400]
  const TIERS = {
    'geraldo:mineradora': { nome: 'Mineradora Pokémon', duracao: 400, extra: 0, mult: 1, fe: [32, 64, 128, 256], sufixo: '' },
    // mult: multiplica o total de sorteios (Profunda: 2x, pedido do usuário 2026-10-13)
    'geraldo:mineradora_profunda': { nome: 'Mineradora Profunda', duracao: 200, extra: 1, mult: 2, fe: [128, 256, 512, 1024], sufixo: '_profunda' }
  }
  const FORTUNA = ['superluck', 'pickup']
  const MAX_FORTUNA = 3
  const MAX_DIG = 2

  // ---------------------------------------------------------------- máquinas
  MMREvents.machines(event => {
    event.create('geraldo:mineradora')
      .name(TIERS['geraldo:mineradora'].nome)
      .color('#9C7B4A')
      .structure(global.geraldo.estrutura('geraldo:mineradora'))

    event.create('geraldo:mineradora_profunda')
      .name(TIERS['geraldo:mineradora_profunda'].nome)
      .color('#5B3A1E')
      .structure(global.geraldo.estrutura('geraldo:mineradora_profunda'))
  })

  // ---------------------------------------------------------------- encantamentos
  const encantamentos = (level, pos) => {
    const mb = global.geraldo.MB
    const r = { toque: false, fortuna: 0, dig: 0 }
    mb.pokemonPerto(level, pos).forEach(e => {
      const pk = e.pokemon
      if (mb.temMovimento(pk, 'rocksmash')) r.toque = true
      if (mb.temMovimento(pk, 'dig')) r.dig++
      if (FORTUNA.indexOf(mb.habilidade(pk)) >= 0) r.fortuna++
    })
    r.fortuna = Math.min(r.fortuna, MAX_FORTUNA)
    r.dig = Math.min(r.dig, MAX_DIG)
    return r
  }

  // args: [maquina] — Eficiência acelera o ciclo
  MMREvents.recipeFunction('mina_inicio', event => {
    const enc = encantamentos(event.block.level, event.block.pos)
    if (enc.dig > 0) event.setBaseSpeed(1 + 0.5 * enc.dig)
  })

  // args: [maquina, faixa]
  MMREvents.recipeFunction('mina_fim', event => {
    const tier = TIERS[String(event.get(0))]
    const faixa = parseInt(event.get(1))
    const level = event.block.level
    const pos = event.block.pos
    const enc = encantamentos(level, pos)
    const modo = enc.toque ? 'blocos' : 'quebrado'
    const id = `geraldo:mineradora/${modo}${tier.sufixo}/faixa_${faixa}`
    const sorteios = (faixa + tier.extra + enc.fortuna) * tier.mult
    const itens = []
    for (let i = 0; i < sorteios; i++) global.geraldo.MB.sortear(level, pos, id, null).forEach(s => itens.push(s))
    global.geraldo.MB.entregar(event, itens)
  })

  // ---------------------------------------------------------------- receitas
  ServerEvents.recipes(event => {
    Object.keys(TIERS).forEach(maquina => {
      const tier = TIERS[maquina]
      FORCA.forEach((forca, i) => {
        event.recipes.modular_machinery_reborn.machine_recipe(maquina, tier.duracao)
          .requireFunctionToStart('forca_pokemon', 'rock', String(forca))
          .requireFunctionOnStart('mina_inicio', maquina)
          .requireEnergyPerTick(tier.fe[i])
          .requireFunctionOnEnd('mina_fim', maquina, String(i + 1))
          .priority(i)
          .id(`${maquina}/forca_${forca}`)
      })
    })

    // controlador tier 1: meio de jogo (aço, Broca Mecânica, Pedra Dura e Gemas Sintonizadas do Occultism)
    event.shaped(Item.of('modular_machinery_reborn:controller', '[modular_machinery_reborn:machine="geraldo:mineradora"]'), [
      'PDP',
      'HRH',
      'GCG'
    ], {
      G: 'occultism:spirit_attuned_gem',
      P: '#c:plates/steel',
      D: 'create:mechanical_drill',
      H: 'cobblemon:hard_stone',
      R: 'modular_machinery_reborn:casing_reinforced',
      C: 'immersiveengineering:component_steel'
    }).id('geraldo:mineradora/controlador')

    // controlador tier 2: fim de jogo (picareta de netherite, mecanismo de precisão, iesnium, componente avançado)
    event.shaped(Item.of('modular_machinery_reborn:controller', '[modular_machinery_reborn:machine="geraldo:mineradora_profunda"]'), [
      'MNM',
      'IRI',
      'AHA'
    ], {
      M: 'create:precision_mechanism',
      N: 'minecraft:netherite_pickaxe',
      I: 'occultism:iesnium_ingot',
      R: 'modular_machinery_reborn:casing_reinforced',
      A: 'immersiveengineering:component_electronic_adv',
      H: 'cobblemon:hard_stone'
    }).id('geraldo:mineradora_profunda/controlador')
  })
})()
