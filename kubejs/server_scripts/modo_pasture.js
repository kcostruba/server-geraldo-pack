// Modo do Pasture: o bloco EMBAIXO do Pasture escolhe o que ele faz alem dos trabalhos normais do Cobbleworkers.
// (a reproducao agora e do Cobbreeding: botao no Pasture, funciona em qualquer modo)
//
//   bloco de osso   -> fazenda de drops: cada Pokémon gera os drops da especie (jobs geraldo:drops_*)
//   qualquer outro  -> so os trabalhos do Cobbleworkers (fornalhas, colheita, caldeiroes...)
//
// Os jobs de drop exigem o aspect "geraldo_fazenda"; os das berries exigem "geraldo_fazenda_<efeito>".
// Aqui esses aspects sao ligados/desligados conforme o bloco, e as berries (berries_trabalho.js) continuam
// aplicando "geraldo_<efeito>" normalmente — so viram drop extra se o Pasture estiver no modo fazenda.
// Com /modoteste loot on (modo_teste.js), "geraldo_fazenda" vira "geraldo_fazenda_teste": jobs de drop a cada 10 s.
// Pokémon que um Rancho/Santuário (fazenda_multiblocos.js) contou há pouco não faz drop pelo Pasture: só na máquina.

;(() => {
  const PokemonEntityJ = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
  const HashSetJ = Java.loadClass('java.util.HashSet')

  const MODOS = {
    'minecraft:bone_block': { id: 'fazenda', nome: 'Fazenda de drops', cor: 'green' }
  }
  const SEM_MODO = { id: 'trabalho', nome: 'Só trabalhos', cor: 'gray' }
  const EFEITOS_DROP = ['rapido', 'sorte', 'fartura'] // insonia nao depende do modo
  const INTERVALO = 100 // ticks (5 s)
  const JANELA_MAQUINA = 1500 // ticks: um pouco mais que o ciclo do Rancho (1200)

  const naMaquina = (server, pokemon) => {
    const mapa = global.geraldo.maquinaPokemon
    if (mapa == null) return false
    const tick = mapa[String(pokemon.uuid)]
    return tick != null && server.tickCount - tick < JANELA_MAQUINA
  }

  const ultimoModo = new Map() // pasture -> id do modo, pra avisar quando muda

  // o Pasture tem 2 blocos; devolve a posicao do de baixo
  const baseDoPasture = (level, pos) => {
    const abaixo = pos.below()
    return String(level.getBlock(abaixo).id) == 'cobblemon:pasture' ? abaixo : pos
  }

  const modoEm = (level, pos) => MODOS[String(level.getBlock(baseDoPasture(level, pos).below()).id)] || SEM_MODO

  const ajustarAspects = (pokemon, fazenda, teste) => {
    const atuais = pokemon.forcedAspects
    const queria = new Set()
    if (fazenda) {
      queria.add(teste ? 'geraldo_fazenda_teste' : 'geraldo_fazenda')
      EFEITOS_DROP.forEach(e => { if (atuais.contains(`geraldo_${e}`)) queria.add(`geraldo_fazenda_${e}`) })
    }
    const todos = ['geraldo_fazenda', 'geraldo_fazenda_teste'].concat(EFEITOS_DROP.map(e => `geraldo_fazenda_${e}`))
    const mudou = todos.some(a => atuais.contains(a) != queria.has(a))
    if (!mudou) return
    const novos = new HashSetJ(atuais)
    todos.forEach(a => { if (queria.has(a)) novos.add(a); else novos.remove(a) })
    pokemon.setForcedAspects(novos)
    pokemon.updateAspects()
  }

  ServerEvents.tick(event => {
    const server = event.server
    if (server.tickCount % INTERVALO != 0) return
    const teste = server.persistentData.getBoolean('geraldo_modo_teste_loot')

    server.getAllLevels().forEach(level => {
      level.getAllEntities().forEach(e => {
        if (!(e instanceof PokemonEntityJ)) return
        const pokemon = e.pokemon
        if (e.tethering == null) {
          // saiu do Pasture: tira a fazenda pra nao ficar aspect sobrando
          if (pokemon.forcedAspects.contains('geraldo_fazenda') || pokemon.forcedAspects.contains('geraldo_fazenda_teste')) ajustarAspects(pokemon, false, false)
          return
        }
        const pos = e.tethering.getPasturePos()
        const modo = modoEm(level, pos)
        ajustarAspects(pokemon, modo.id == 'fazenda' && !naMaquina(server, pokemon), teste)

        // avisa o dono quando o modo do Pasture muda (trocou o bloco de baixo)
        const chave = `${level.dimension}|${pos.asLong()}`
        const antes = ultimoModo.get(chave)
        ultimoModo.set(chave, modo.id)
        if (antes != null && antes != modo.id) {
          const dono = server.getPlayerList().getPlayer(e.tethering.getPlayerId())
          if (dono != null) dono.setStatusMessage(Text.of(`Pasture agora: ${modo.nome}`)[modo.cor]())
        }
      })
    })
  })
})()
