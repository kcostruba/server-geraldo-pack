// Torre Pika: multibloco do Modular Machinery Reborn que gera FE com Pokémon do tipo Elétrico.
//
// Estrutura: ferramentas/estruturas_maquinas.py (gera estruturas_gerado.js; o livro usa a mesma).
//
// Só gera com Pokémon Elétricos no Pasture da máquina (dentro do cercado).
// Força = soma dos níveis desses Pokémon. Quanto mais força, mais FE/t (ver FAIXAS).
// A checagem dos Pokémon fica em multiblocos_pokemon.js (function 'forca_pokemon' do MMR).

;(() => {
  const MAQUINA = 'geraldo:torre_pika'
  const DURACAO = 100     // ticks por ciclo (5 s); a força é conferida de novo a cada ciclo

  // força minima -> FE/t (a saída Small do MMR passa ate 512 FE/t)
  const FAIXAS = [
    { forca: 1, fe: 64 },
    { forca: 100, fe: 128 },
    { forca: 200, fe: 256 },
    { forca: 400, fe: 512 }
  ]


  // ---------------------------------------------------------------- maquina
  MMREvents.machines(event => {
    event.create(MAQUINA)
      .name('Torre Pika')
      .color('#FFD21F')
      .structure(global.geraldo.estrutura(MAQUINA))
  })

  // ---------------------------------------------------------------- receitas
  ServerEvents.recipes(event => {
    FAIXAS.forEach((f, i) => {
      event.recipes.modular_machinery_reborn.machine_recipe(MAQUINA, DURACAO)
        .requireFunctionToStart('forca_pokemon', 'electric', String(f.forca))
        .produceEnergyPerTick(f.fe)
        .priority(i)
        .id(`geraldo:torre_pika/forca_${f.forca}`)
    })

    // controlador: meio de jogo (aco, componente do IE, Gemas de Fonte do Ars e uma Pedra do Trovão)
    event.shaped(Item.of('modular_machinery_reborn:controller', `[modular_machinery_reborn:machine="${MAQUINA}"]`), [
      'PEP',
      'LRL',
      'STS'
    ], {
      P: '#c:plates/steel',
      S: 'ars_nouveau:source_gem',
      E: 'immersiveengineering:component_electronic',
      L: 'minecraft:lightning_rod',
      R: 'modular_machinery_reborn:casing_reinforced',
      T: 'cobblemon:thunder_stone'
    }).id('geraldo:torre_pika/controlador')
  })
})()
