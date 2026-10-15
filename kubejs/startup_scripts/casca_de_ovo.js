// Marcador da Garden Cloche: sai quando um ovo do Cobbreeding termina de chocar nela.
// O server_scripts/cloche_ovos.js troca a casca pelo ovo pronto, entao ninguem deveria ver esse item.
StartupEvents.registry('item', event => {
  event.create('geraldo:casca_de_ovo')
    .displayName('Casca de Ovo')
    .texture('minecraft:item/bone_meal')
})
