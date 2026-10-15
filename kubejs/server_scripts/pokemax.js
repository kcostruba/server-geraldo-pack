// /pokemax <slot> [nivel]  -> deixa o Pokémon do slot (1-6 do seu time) no maximo. Precisa ser op.
// /pokemax all [nivel]     -> o mesmo pra todos os Pokémon do seu time
//   nivel: 1-100 (sem nada = 100)
//   IVs: 31 em tudo
//   EVs: 252 no melhor ataque (fisico ou especial, pelos status base) + 252 velocidade + 6 HP (limite de 510)
//   amizade 255 e cura completa

;(() => {
  const CobblemonMod = Java.loadClass('com.cobblemon.mod.common.Cobblemon')
  const PkStats = Java.loadClass('com.cobblemon.mod.common.api.pokemon.stats.Stats')
  const IntArg = Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType')

  const STATS = [PkStats.HP, PkStats.ATTACK, PkStats.DEFENCE, PkStats.SPECIAL_ATTACK, PkStats.SPECIAL_DEFENCE, PkStats.SPEED]

  // erro dentro do comando vira so "erro inesperado" no chat; aqui mostra a mensagem de verdade
  const seguro = (ctx, fn) => {
    try {
      return fn()
    } catch (e) {
      console.error(`pokemax: ${e}`)
      ctx.source.sendFailure(Text.of(`pokemax deu erro: ${e}`))
      return 0
    }
  }

  // lista "com buracos" (slot vazio = null): o get() do proprio time e ambiguo pro Rhino (UUID / posicao)
  const timeDe = player => CobblemonMod.INSTANCE.storage.getParty(player).toGappyList()

  const maximizarPokemon = (pk, nivel) => {
    const base = pk.form.baseStats
    const atk = base.getOrDefault(PkStats.ATTACK, 0)
    const spa = base.getOrDefault(PkStats.SPECIAL_ATTACK, 0)
    const ataque = spa > atk ? PkStats.SPECIAL_ATTACK : PkStats.ATTACK

    pk.setLevel(nivel)
    STATS.forEach(s => {
      pk.setIV(s, 31)
      pk.setEV(s, 0)
    })
    pk.setEV(ataque, 252)
    pk.setEV(PkStats.SPEED, 252)
    pk.setEV(PkStats.HP, 6)
    pk.setFriendship(255, true)
    pk.heal()
    return ataque == PkStats.ATTACK ? 'Ataque' : 'Ataque Especial'
  }

  const maximizarSlot = (ctx, nivel) => seguro(ctx, () => {
    const slot = IntArg.getInteger(ctx, 'slot')
    const pk = timeDe(ctx.source.getPlayerOrException()).get(slot - 1)
    if (pk == null) {
      ctx.source.sendFailure(Text.of(`Nenhum Pokémon no slot ${slot} do seu time.`))
      return 0
    }
    const nomeAtaque = maximizarPokemon(pk, nivel)
    ctx.source.sendSystemMessage(Text.of(`${pk.species.translatedName.string} no máximo: nível ${nivel}, IVs 31, ` +
      `EVs 252 ${nomeAtaque} / 252 Velocidade / 6 HP, amizade 255.`).green())
    return 1
  })

  const maximizarTodos = (ctx, nivel) => seguro(ctx, () => {
    const nomes = []
    timeDe(ctx.source.getPlayerOrException()).forEach(pk => {
      if (pk == null) return
      maximizarPokemon(pk, nivel)
      nomes.push(pk.species.translatedName.string)
    })
    if (nomes.length == 0) {
      ctx.source.sendFailure(Text.of('Nenhum Pokémon no seu time.'))
      return 0
    }
    ctx.source.sendSystemMessage(Text.of(`${nomes.length} Pokémon no máximo (nível ${nivel}, IVs 31, EVs no melhor ` +
      `ataque + velocidade, amizade 255): ${nomes.join(', ')}.`).green())
    return nomes.length
  })

  ServerEvents.commandRegistry(event => {
    const { commands: Commands } = event
    event.register(Commands.literal('pokemax')
      .requires(src => src.hasPermission(2))
      .then(Commands.literal('all')
        .executes(ctx => maximizarTodos(ctx, 100))
        .then(Commands.argument('nivel', IntArg.integer(1, 100))
          .executes(ctx => maximizarTodos(ctx, IntArg.getInteger(ctx, 'nivel')))))
      .then(Commands.argument('slot', IntArg.integer(1, 6))
        .executes(ctx => maximizarSlot(ctx, 100))
        .then(Commands.argument('nivel', IntArg.integer(1, 100))
          .executes(ctx => maximizarSlot(ctx, IntArg.getInteger(ctx, 'nivel'))))))
  })
})()
