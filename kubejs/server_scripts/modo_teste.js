// /modoteste             -> mostra o que ta ligado
// /modoteste on|off      -> liga/desliga tudo
// /modoteste ovo on|off  -> Cobbreeding bota ovo a cada ~10 s (muda a config dele so na memoria)
// /modoteste loot on|off -> drops da fazenda a cada 10 s (modo_pasture.js + jobs geraldo:drops_*_teste)
// Precisa ser op. Fica salvo no mundo (server.persistentData), comeca tudo desligado.

;(() => {
  const MODOS = {
    ovo: { chave: 'geraldo_modo_teste_ovo', ligado: 'ovo a cada ~10 s', desligado: 'ovo a cada 7-12 min (config do Cobbreeding)' },
    loot: { chave: 'geraldo_modo_teste_loot', ligado: 'drops da fazenda a cada 10 s', desligado: 'drops a cada 5 min' }
  }

  // Ovo rapido: o Cobbreeding sorteia o tempo do proximo ovo entre min e max da config.
  // Ligado: troca min/max e encurta o ovo que ja estava contando em cada Pasture.
  // Desligado: recarrega config/cobbreeding/main.json (volta ao normal sem mexer no arquivo).
  // (o Rhino do KubeJS da "redeclaration" com const dentro de if, por isso fica aqui fora)
  const temCobbreeding = Platform.isLoaded('cobbreeding')
  const CobbreedingJ = temCobbreeding ? Java.loadClass('ludichat.cobbreeding.Cobbreeding') : null
  const PastureBreedingDataJ = temCobbreeding ? Java.loadClass('ludichat.cobbreeding.PastureBreedingData') : null
  const OVO_TESTE = 200 // ticks (10 s)

  if (temCobbreeding) {
    ServerEvents.tick(event => {
      const server = event.server
      if (server.tickCount % 20 != 0) return
      const config = CobbreedingJ.INSTANCE.getConfig()
      if (config == null) return
      const teste = server.persistentData.getBoolean('geraldo_modo_teste_ovo')
      const emTeste = config.getMaxBreedingTimeInTicks() == OVO_TESTE + 1

      if (!teste) {
        if (emTeste) CobbreedingJ.INSTANCE.reloadConfig()
        return
      }
      if (!emTeste) {
        config.setMinBreedingTimeInTicks(OVO_TESTE)
        config.setMaxBreedingTimeInTicks(OVO_TESTE + 1)
      }
      PastureBreedingDataJ.registry.values().forEach(dados => {
        if (dados.getRequiredTicks() > OVO_TESTE) dados.setRequiredTicks(OVO_TESTE)
      })
    })
  }
  const NOMES = Object.keys(MODOS)

  const linha = (server, nome) => {
    const m = MODOS[nome]
    const ligado = server.persistentData.getBoolean(m.chave)
    return Text.of(`[Modo teste] ${nome}: ${ligado ? 'LIGADO' : 'DESLIGADO'} (${ligado ? m.ligado : m.desligado})`).color(ligado ? 'gold' : 'green')
  }

  const definir = (ctx, nomes, ligar) => {
    const server = ctx.source.server
    nomes.forEach(n => {
      server.persistentData.putBoolean(MODOS[n].chave, ligar)
      server.tell(linha(server, n))
    })
    return 1
  }

  ServerEvents.commandRegistry(event => {
    const { commands: Commands } = event
    let cmd = Commands.literal('modoteste')
      .requires(src => src.hasPermission(2))
      .executes(ctx => {
        NOMES.forEach(n => ctx.source.sendSystemMessage(linha(ctx.source.server, n)))
        return 1
      })
      .then(Commands.literal('on').executes(ctx => definir(ctx, NOMES, true)))
      .then(Commands.literal('off').executes(ctx => definir(ctx, NOMES, false)))
    NOMES.forEach(n => {
      cmd = cmd.then(Commands.literal(n)
        .executes(ctx => { ctx.source.sendSystemMessage(linha(ctx.source.server, n)); return 1 })
        .then(Commands.literal('on').executes(ctx => definir(ctx, [n], true)))
        .then(Commands.literal('off').executes(ctx => definir(ctx, [n], false))))
    })
    event.register(cmd)
  })
})()
