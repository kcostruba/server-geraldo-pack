// Deixa canos e maquinas de qualquer mod (Pipez, Create, Modular Routers, Functional Storage...)
// puxarem os ovos do Cobbreeding guardados no Pasture, por qualquer lado e pelas duas metades do bloco.
// O Cobbreeding so implementa o inventario do jeito vanilla (WorldlyContainer), que so o funil enxerga;
// aqui registramos a capability de item do NeoForge apontando pra ele.
// SidedInvWrapper respeita as regras do Cobbreeding: so tirar ovo, nunca colocar nada.

;(() => {
  if (!Platform.isLoaded('cobbreeding')) return

  const RegisterCapabilitiesEvent = Java.loadClass('net.neoforged.neoforge.capabilities.RegisterCapabilitiesEvent')
  const ItemHandlerCaps = Java.loadClass('net.neoforged.neoforge.capabilities.Capabilities$ItemHandler')
  const SidedInvWrapper = Java.loadClass('net.neoforged.neoforge.items.wrapper.SidedInvWrapper')
  const WorldlyContainer = Java.loadClass('net.minecraft.world.WorldlyContainer')
  const Direction = Java.loadClass('net.minecraft.core.Direction')

  NativeEvents.onEvent(RegisterCapabilitiesEvent, event => {
    // carregado aqui dentro pra nao inicializar os blocos do Cobblemon cedo demais
    const CobblemonBlocks = Java.loadClass('com.cobblemon.mod.common.CobblemonBlocks')
    event.registerBlock(ItemHandlerCaps.BLOCK, (level, pos, state, be, side) => {
      // so a metade de baixo tem o block entity; a de cima usa o de baixo
      let alvo = be != null ? be : level.getBlockEntity(pos.below())
      if (!(alvo instanceof WorldlyContainer)) return null
      return new SidedInvWrapper(alvo, side != null ? side : Direction.DOWN)
    }, CobblemonBlocks.PASTURE)
  })
})()
