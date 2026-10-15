// Item de transicao das Sequenced Assembly dos itens Pokemon (receitas_pokemon_gerado.js)

StartupEvents.registry('item', event => {
  event.create('geraldo:item_pokemon_incompleto', 'create:sequenced_assembly')
    .displayName('Item Pokémon Incompleto')
    .texture('create:item/incomplete_precision_mechanism')
})
