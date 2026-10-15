// Lã da cor do Pokémon: Wooloo e Dubwool podem ser tingidos (aspect "color-<cor>" do Cobblemon; "none" = natural).
// Nas tabelas de drop da fazenda deles (Pasture, Rancho, Santuário, Drygmy, Battlefield) a lã branca vira a lã
// da cor em que o Pokémon foi tingido. Precisa do Pokémon no sorteio (THIS_ENTITY): o Cobbleworkers já manda,
// e fazenda_multiblocos.js / protecao_captura.js também.

;(() => {
  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const LootContextParamsJ = Java.loadClass('net.minecraft.world.level.storage.loot.parameters.LootContextParams')

  const corDe = entidade => {
    if (!(entidade instanceof PokemonEntityJ)) return null
    let cor = null
    entidade.pokemon.aspects.forEach(a => {
      const s = String(a)
      if (s.startsWith('color-') && s != 'color-none') cor = s.substring(6)
    })
    return cor
  }

  LootJS.modifiers(event => {
    event.addTableModifier(/^geraldo:pokemon_drops(_pasto)?\/(wooloo|dubwool)(_[a-z]+)?$/).customAction((ctx, loot) => {
      const cor = corDe(ctx.getParamOrNull(LootContextParamsJ.THIS_ENTITY))
      if (cor == null || cor == 'white') return
      loot.modifyItems(stack => String(stack.id) == 'minecraft:white_wool' ? Item.of(`minecraft:${cor}_wool`, stack.count) : stack)
    })
  })
})()
