// Kit inicial: entregue so na primeira vez que o jogador entra no servidor.
// Para dar de novo pra alguem: /kubejs stages remove <jogador> kit_inicial

const CORES_POKEDEX = ['red', 'blue', 'yellow', 'green', 'pink', 'black', 'white']

// cores dos 16 corantes do Minecraft (mesmas que a mochila usa ao ser tingida)
const CORES_CORANTE = [
  0xF9FFFE, 0xF9801D, 0xC74EBD, 0x3AB3DA, 0xFED83D, 0x80C71F, 0xF38BAA, 0x474F52,
  0x9D9D97, 0x169C9C, 0x8932B8, 0x3C44AA, 0x835432, 0x5E7C16, 0xB02E26, 0x1D1D21
]

const sortear = lista => lista[Math.floor(Math.random() * lista.length)]

PlayerEvents.loggedIn(event => {
  const player = event.player
  if (player.stages.has('kit_inicial')) return
  player.stages.add('kit_inicial')

  // armadura de couro ja equipada
  player.setHeadArmorItem(Item.of('minecraft:leather_helmet'))
  player.setChestArmorItem(Item.of('minecraft:leather_chestplate'))
  player.setLegsArmorItem(Item.of('minecraft:leather_leggings'))
  player.setFeetArmorItem(Item.of('minecraft:leather_boots'))

  // ferramentas de madeira
  player.give(Item.of('minecraft:wooden_sword'))
  player.give(Item.of('minecraft:wooden_pickaxe'))
  player.give(Item.of('minecraft:wooden_axe'))
  player.give(Item.of('minecraft:wooden_shovel'))
  player.give(Item.of('minecraft:wooden_hoe'))

  // comida e Cobblemon
  player.give(Item.of('minecraft:bread', 32))
  player.give(Item.of(`cobblemon:pokedex_${sortear(CORES_POKEDEX)}`))

  // mochila basica com cor principal e detalhe sorteados
  const corPrincipal = sortear(CORES_CORANTE)
  const corDetalhe = sortear(CORES_CORANTE)
  player.give(Item.of(`sophisticatedbackpacks:backpack[sophisticatedcore:main_color=${corPrincipal},sophisticatedcore:accent_color=${corDetalhe}]`))

  player.give(Item.of('cobblemon:poke_ball', 16))
  player.give(Item.of('cobblemon:revive'))
  player.give(Item.of('cobblemon:potion', 3))
  player.give(Item.of('patchouli:guide_book[patchouli:book="patchouli:manual_pasture"]'))

  player.tell(Text.green('Bem-vindo! Voce recebeu o kit inicial.'))
})
