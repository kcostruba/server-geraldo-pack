// Usina Pika (tier 2 da energia, fim de jogo): versão grande da Torre Pika (torre_pika.js).
// Força = soma dos níveis dos Pokémon Elétricos no Pasture da máquina (dentro do cercado); lendários/míticos/ultra-bestas elétricos
// (Zapdos, Raikou, Zekrom, Regieleki, Xurkitree...) contam 3x (checagem 'forca_pokemon' em multiblocos_pokemon.js).
//
// Estrutura: ferramentas/estruturas_maquinas.py (gera estruturas_gerado.js; o livro usa a mesma).
// Pra passar 8.192 FE/t precisa da saída de energia Grande (receita em mmr_pecas.js).

;(() => {
  const MAQUINA = 'geraldo:usina_pika'
  const DURACAO = 100

  // força mínima -> FE/t
  const FAIXAS = [
    { forca: 400, fe: 1024 },
    { forca: 800, fe: 2048 },
    { forca: 1600, fe: 4096 },
    { forca: 3200, fe: 8192 }
  ]


  MMREvents.machines(event => {
    event.create(MAQUINA)
      .name('Usina Pika')
      .color('#FFE45C')
      .structure(global.geraldo.estrutura(MAQUINA))
  })

  ServerEvents.recipes(event => {
    FAIXAS.forEach((f, i) => {
      event.recipes.modular_machinery_reborn.machine_recipe(MAQUINA, DURACAO)
        .requireFunctionToStart('forca_pokemon', 'electric', String(f.forca), '3')
        .produceEnergyPerTick(f.fe)
        .priority(i)
        .id(`geraldo:usina_pika/forca_${f.forca}`)
    })

    // controlador: fim de jogo (Estrela do Nether, Pedras do Trovão, Bobinas HV, componentes avançados, iesnium)
    event.shaped(Item.of('modular_machinery_reborn:controller', `[modular_machinery_reborn:machine="${MAQUINA}"]`), [
      'TNT',
      'CRC',
      'AIA'
    ], {
      T: 'cobblemon:thunder_stone',
      N: 'minecraft:nether_star',
      C: 'immersiveengineering:coil_hv',
      R: 'modular_machinery_reborn:casing_reinforced',
      A: 'immersiveengineering:component_electronic_adv',
      I: 'occultism:iesnium_ingot'
    }).id('geraldo:usina_pika/controlador')
  })
})()
