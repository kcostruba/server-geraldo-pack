// Destilaria Pokémon: multibloco do MMR em que Pokémon do tipo Veneno destilam BIODIESEL do Immersive (meio/fim de jogo).
// O biodiesel alimenta o Gerador a Diesel do IE (4.096 FE/t; 1 balde dura 250 ticks => ~1.000 FE por mB).
// Força = soma dos níveis dos Pokémon Veneno no Pasture da máquina (dentro do cercado) (checagem 'forca_pokemon').
// Não gasta energia: ela É o combustível. Sai numa saída de fluido do MMR (puxe com cano pro gerador).
//
//   força 1+: 25 mB a cada 5 s (~256 FE/t no gerador)    100+: 50 mB (~512)    200+: 100 mB (~1.024)    400+: 200 mB (~2.048)
//
// Estrutura: ferramentas/estruturas_maquinas.py (gera estruturas_gerado.js; o livro usa a mesma).

;(() => {
  const MAQUINA = 'geraldo:destilaria'
  const DURACAO = 100
  const FAIXAS = [
    { forca: 1, mb: 25 },
    { forca: 100, mb: 50 },
    { forca: 200, mb: 100 },
    { forca: 400, mb: 200 }
  ]

  MMREvents.machines(event => {
    event.create(MAQUINA)
      .name('Destilaria Pokémon')
      .color('#8E44AD')
      .structure(global.geraldo.estrutura(MAQUINA))
  })

  ServerEvents.recipes(event => {
    FAIXAS.forEach((f, i) => {
      event.recipes.modular_machinery_reborn.machine_recipe(MAQUINA, DURACAO)
        .requireFunctionToStart('forca_pokemon', 'poison', String(f.forca))
        .produceFluid(Fluid.of('immersiveengineering:biodiesel', f.mb))
        .priority(i)
        .id(`geraldo:destilaria/forca_${f.forca}`)
    })

    // controlador: Lodo Negro e Farpa Venenosa (Cobblemon), canos e componente (IE), gema do Occultism
    event.shaped(Item.of('modular_machinery_reborn:controller', `[modular_machinery_reborn:machine="${MAQUINA}"]`), [
      'PCP',
      'BRT',
      'PGP'
    ], {
      P: '#c:plates/steel',
      C: 'immersiveengineering:fluid_pipe',
      B: 'cobblemon:black_sludge',
      T: 'cobblemon:poison_barb',
      R: 'modular_machinery_reborn:casing_reinforced',
      G: 'occultism:spirit_attuned_gem'
    }).id('geraldo:destilaria/controlador')
  })
})()
