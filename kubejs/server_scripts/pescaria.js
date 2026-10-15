// Pescaria Pokémon: multibloco do MMR que pesca com Pokémon do tipo Água (meio de jogo).
// Força = soma dos níveis dos Pokémon de Água no Pasture da máquina (dentro do cercado) (checagem 'forca_pokemon').
// A cada 15 s faz <faixa> sorteios (peixe, lixo, tesouro — ferramentas/gerar_pescaria.py); faixas mais altas puxam
// mais tesouro. "Sorte do Mar": cada Pokémon perto com a habilidade Suction Cups ou Sticky Hold (as de pesca dos
// jogos) dá +1 sorteio (até +2).
//
// Estrutura: ferramentas/estruturas_maquinas.py (gera estruturas_gerado.js; o livro usa a mesma).

;(() => {
  const MAQUINA = 'geraldo:pescaria'
  const DURACAO = 300
  const FORCA = [1, 100, 200, 400]
  const FE = [32, 64, 128, 256]
  const SORTE_DO_MAR = ['suctioncups', 'stickyhold']
  const MAX_SORTE = 2


  MMREvents.machines(event => {
    event.create(MAQUINA)
      .name('Pescaria Pokémon')
      .color('#3A86C8')
      .structure(global.geraldo.estrutura(MAQUINA))
  })

  // args: [faixa]
  MMREvents.recipeFunction('pescaria_fim', event => {
    const mb = global.geraldo.MB
    const faixa = parseInt(event.get(0))
    const level = event.block.level
    const pos = event.block.pos
    let sorte = 0
    mb.pokemonPerto(level, pos).forEach(e => { if (SORTE_DO_MAR.indexOf(mb.habilidade(e.pokemon)) >= 0) sorte++ })
    const sorteios = faixa + Math.min(sorte, MAX_SORTE)
    const itens = []
    for (let i = 0; i < sorteios; i++) mb.sortear(level, pos, `geraldo:pescaria/faixa_${faixa}`, null).forEach(s => itens.push(s))
    mb.entregar(event, itens)
  })

  ServerEvents.recipes(event => {
    FORCA.forEach((forca, i) => {
      event.recipes.modular_machinery_reborn.machine_recipe(MAQUINA, DURACAO)
        .requireFunctionToStart('forca_pokemon', 'water', String(forca))
        .requireEnergyPerTick(FE[i])
        .requireFunctionOnEnd('pescaria_fim', String(i + 1))
        .priority(i)
        .id(`geraldo:pescaria/forca_${forca}`)
    })

    // controlador: meio de jogo (vara de pescar, Água Mística, Gemas de Fonte do Ars, Tábuas do Outro Mundo)
    event.shaped(Item.of('modular_machinery_reborn:controller', `[modular_machinery_reborn:machine="${MAQUINA}"]`), [
      'OFO',
      'WRW',
      'SES'
    ], {
      O: 'occultism:otherplanks',
      F: 'minecraft:fishing_rod',
      W: 'cobblemon:mystic_water',
      R: 'modular_machinery_reborn:casing_reinforced',
      S: 'ars_nouveau:source_gem',
      E: 'immersiveengineering:component_electronic'
    }).id('geraldo:pescaria/controlador')
  })
})()
