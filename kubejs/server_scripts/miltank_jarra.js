// "Cow in a Jar" (Cooking for Blockheads) com Miltank.
// No mod, uma bigorna caindo numa vaca em cima de um Milk Jar vira Cow in a Jar. Ele so reconhece o tipo de entidade
// "vaca" (tag cookingforblockheads:cows) e todo Pokémon e a mesma entidade, entao a Miltank e tratada aqui:
// bigorna caindo numa Miltank em cima (ou do lado) de um Milk Jar -> o jarro vira "Miltank in a Jar".
//   - Miltank selvagem: some.
//   - Miltank com dono: sai do time/PC do dono (como a vaca, ela vira o jarro). O dono tem que estar a ate 16 blocos,
//     pra ninguem fazer isso com a Miltank dos outros.

;(() => {
  if (!Platform.isLoaded('cookingforblockheads')) return

  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const RemovalReason = Java.loadClass('net.minecraft.world.entity.Entity$RemovalReason')

  const MILK_JAR = 'cookingforblockheads:milk_jar'
  const COW_JAR = 'cookingforblockheads:cow_jar'

  // Milk Jar embaixo ou em volta da Miltank (mesma altura ou 1 abaixo)
  const acharJarro = (level, pos) => {
    let achou = null
    for (let dy = 0; dy >= -1; dy--) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          let p = pos.offset(dx, dy, dz)
          if (achou == null && String(level.getBlock(p).id) == MILK_JAR) achou = p
        }
      }
    }
    return achou
  }

  EntityEvents.beforeHurt(event => {
    const e = event.entity
    if (!(e instanceof PokemonEntityJ)) return
    if (String(event.source.msgId) != 'anvil') return
    const pk = e.pokemon
    if (String(pk.species.resourceIdentifier.path) != 'miltank') return
    const level = e.level
    const jarro = acharJarro(level, e.blockPosition())
    if (jarro == null) return

    const selvagem = pk.isWild()
    const dono = pk.getOwnerPlayer()
    if (!selvagem && (dono == null || dono.distanceTo(e) > 16)) {
      event.cancel() // Miltank de alguém sem o dono por perto: nada acontece
      return
    }
    // com dono: tira do time/PC (nada de const dentro de if: o Rhino do KubeJS acusa "redeclaration")
    const coords = selvagem ? null : pk.storeCoordinates.get()
    if (coords != null) coords.store.remove(pk)
    if (!selvagem) dono.tell(Text.of(`Sua ${pk.getDisplayName().string} virou uma Miltank in a Jar.`).gold())

    level.getBlock(jarro).set(COW_JAR)
    const be = level.getBlockEntity(jarro)
    if (be != null) be.setCustomName(Text.translate('container.cookingforblockheads.cow_jar_custom', 'Miltank'))
    e.remove(RemovalReason.KILLED)
    event.cancel()
  })
})()
