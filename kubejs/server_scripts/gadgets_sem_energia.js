// Building Gadgets 2 sem energia: a config do mod nao aceita custo 0 (minimo 1),
// entao a cada 1 s os gadgets no inventario (incluindo mao secundaria) voltam pra bateria cheia.
// A energia fica no componente buildinggadgets2:forge_energy do item; aqui ele e gravado direto no maximo.
// Nunca precisa carregar; o maior uso de uma vez e o limite de cada gadget (maxPower / baseCost na
// config/buildinggadgets2-common.toml, ex.: Copy Paste 1.000.000 / 50 = 20.000 blocos por colagem).

;(() => {
  const BaseGadget = Java.loadClass('com.direwolf20.buildinggadgets2.common.items.BaseGadget')
  const BG2DataComponents = Java.loadClass('com.direwolf20.buildinggadgets2.setup.BG2DataComponents')
  const IntegerJ = Java.loadClass('java.lang.Integer')
  const INTERVALO = 20 // ticks
  let avisado = false // loga so a primeira recarga, pra conferir que ta funcionando

  ServerEvents.tick(event => {
    const server = event.server
    if (server.tickCount % INTERVALO != 0) return
    const ENERGIA = BG2DataComponents.FORGE_ENERGY.get()

    server.getPlayerList().getPlayers().forEach(player => {
      const inv = player.getInventory()
      for (let i = 0; i < inv.getContainerSize(); i++) {
        const stack = inv.getItem(i)
        if (stack.isEmpty()) continue
        const item = stack.getItem()
        if (!(item instanceof BaseGadget)) continue
        const max = item.getEnergyMax()
        const atual = stack.getOrDefault(ENERGIA, IntegerJ.valueOf(0))
        if (atual >= max) continue
        stack.set(ENERGIA, IntegerJ.valueOf(max))
        if (!avisado) {
          avisado = true
          console.info(`gadgets_sem_energia: ${stack.id} de ${player.username} recarregado ${atual} -> ${max}`)
        }
      }
    })
  })
})()
