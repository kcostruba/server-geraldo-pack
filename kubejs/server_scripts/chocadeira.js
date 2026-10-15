// Chocadeira Pokémon: multibloco do MMR que choca vários ovos do Cobbreeding de uma vez (meio de jogo).
// Ponha ovos na entrada de itens; a cada ciclo (60 s, 256 FE/t) até OVOS_POR_CICLO ovos saem PRONTOS na saída de
// itens (contador zerado). Ovo pronto nasce na hora em que um jogador pega (time ou PC de quem pegou) — igual à
// Garden Cloche (cloche_ovos.js), só que muitos de uma vez e sem depender da espécie.
//
// Estrutura: ferramentas/estruturas_maquinas.py (gera estruturas_gerado.js; o livro usa a mesma).

;(() => {
  if (!Platform.isLoaded('cobbreeding')) return

  const PokemonEggJ = Java.loadClass('ludichat.cobbreeding.PokemonEgg')
  const IntegerJ = Java.loadClass('java.lang.Integer')

  const MAQUINA = 'geraldo:chocadeira'
  const DURACAO = 1200
  const FE = 256
  const OVOS_POR_CICLO = 8


  MMREvents.machines(event => {
    event.create(MAQUINA)
      .name('Chocadeira Pokémon')
      .color('#F4D35E')
      .structure(global.geraldo.estrutura(MAQUINA))
  })

  // ovos (ainda chocando) na entrada da máquina
  const ovosNaEntrada = machine => {
    const lista = []
    machine.getItemsStored(IOType.INPUT).forEach(s => {
      if (!s.isEmpty() && s.item instanceof PokemonEggJ) lista.push(s)
    })
    return lista
  }

  MMREvents.recipeFunction('chocadeira_tem_ovo', event => {
    if (ovosNaEntrada(event.machine).length == 0) event.error(Text.of('Ponha ovos na entrada de itens'))
  })

  MMREvents.recipeFunction('chocadeira_fim', event => {
    let feitos = 0
    ovosNaEntrada(event.machine).forEach(pilha => {
      if (feitos >= OVOS_POR_CICLO) return
      const ovo = pilha.copyWithCount(1)
      event.machine.removeItem(ovo.copy())
      const pronto = ovo.copy()
      pronto.set(PokemonEggJ.Companion.getTIMER(), IntegerJ.valueOf(0))
      global.geraldo.MB.entregar(event, [pronto])
      feitos++
    })
  })

  ServerEvents.recipes(event => {
    event.recipes.modular_machinery_reborn.machine_recipe(MAQUINA, DURACAO)
      .requireFunctionToStart('chocadeira_tem_ovo')
      .requireEnergyPerTick(FE)
      .requireFunctionOnEnd('chocadeira_fim')
      .id('geraldo:chocadeira/chocar')

    // controlador: ovo, feno, cobre, componente do IE, gema de fonte do Ars
    event.shaped(Item.of('modular_machinery_reborn:controller', `[modular_machinery_reborn:machine="${MAQUINA}"]`), [
      'PEP',
      'HRH',
      'PCP'
    ], {
      P: '#c:plates/copper',
      E: 'minecraft:egg',
      H: 'minecraft:hay_block',
      R: 'modular_machinery_reborn:casing_reinforced',
      C: 'immersiveengineering:component_electronic'
    }).id('geraldo:chocadeira/controlador')
  })
})()
