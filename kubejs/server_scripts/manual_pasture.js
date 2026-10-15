// Manual do Pasture (livro do Patchouli gerado por ferramentas/gerar_manual_pasture.py).
// Vem no kit inicial (kit_inicial.js); se perder: livro + fardo de feno.

ServerEvents.recipes(event => {
  event.shapeless('patchouli:guide_book[patchouli:book="patchouli:manual_pasture"]', ['minecraft:book', 'minecraft:hay_block'])
    .id('geraldo:manual_pasture')
})
