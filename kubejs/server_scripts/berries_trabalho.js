// Berries que turbinam Pokémon trabalhando no Pasture (fazenda de drops do Cobbleworkers).
// Clique com a berry num Pokémon que esta no Pasture: gasta 1 berry e aplica o efeito por 20 min.
// Efeitos diferentes somam; dar a mesma berry de novo renova o tempo.
// Maca dourada encantada: todos os efeitos por 60 min.
//
// Alimentacao automatica: um Feeding Trough (animal_feeding_trough) com berries a ate 8 blocos
// do Pasture alimenta sozinho os Pokémon daquele Pasture quando o efeito acaba.
//
// O efeito vira um aspect "geraldo_<efeito>" no Pokémon. Os jobs extras que usam esses aspects
// ficam em kubejs/data/geraldo/jobs (gerados junto com as loot tables da fazenda de drops).

const HashSet = Java.loadClass('java.util.HashSet')
const CobblemonMemories = Java.loadClass('com.cobblemon.mod.common.CobblemonMemories')
const PokemonEntity = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
const FeedingTrough = Java.loadClass('slexom.animal_feeding_trough.platform.common.block.entity.FeedingTroughBlockEntity')

const DURACAO_MS = 20 * 60 * 1000 // 20 min (tempo real)
const RENOVAR_ANTES_MS = 60 * 1000 // cocho realimenta quando falta menos de 1 min
const COCHO_RAIO = 8               // horizontal, a partir do bloco do Pasture
const COCHO_ALTURA = 4
const COCHO_INTERVALO = 200        // ticks (10 s)

const BERRIES = {
  'cobblemon:salac_berry':  { efeito: 'rapido',  nome: 'Rapido',  cor: 'aqua',   desc: 'trabalha em dobro' },
  'cobblemon:lansat_berry': { efeito: 'sorte',   nome: 'Sorte',   cor: 'gold',   desc: 'mais drops raros' },
  'cobblemon:sitrus_berry': { efeito: 'fartura', nome: 'Fartura', cor: 'green',  desc: 'mais quantidade' },
  'cobblemon:chesto_berry': { efeito: 'insonia', nome: 'Insonia', cor: 'lightPurple', desc: 'trabalha a noite' }
}
const EFEITOS = Object.values(BERRIES).map(b => b.efeito)

// Maca dourada encantada: todos os efeitos de uma vez, por mais tempo (clique ou cocho)
const BANQUETE = { item: 'minecraft:enchanted_golden_apple', duracao: 60 * 60 * 1000 }

const chaveExpira = efeito => `geraldo_berry_${efeito}`

// Pokémon com algum efeito ativo que estao carregados no mundo (uuid -> entidade)
const ativos = new Map()

const temEfeito = (pokemon, efeito) => pokemon.persistentData.contains(chaveExpira(efeito))

const aplicarAspects = (pokemon, adicionar, remover) => {
  const aspects = new HashSet(pokemon.forcedAspects)
  adicionar.forEach(a => aspects.add(a))
  remover.forEach(a => aspects.remove(a))
  pokemon.setForcedAspects(aspects)
  pokemon.updateAspects()
}

const alimentar = (server, entidade, efeitos, duracao) => {
  const pokemon = entidade.pokemon
  const dados = pokemon.persistentData
  const novos = efeitos.filter(e => !temEfeito(pokemon, e))
  const expira = Date.now() + duracao
  // nunca encurta um efeito que ja dura mais (ex.: berry depois da maca)
  efeitos.forEach(e => dados.putLong(chaveExpira(e), temEfeito(pokemon, e) ? Math.max(dados.getLong(chaveExpira(e)), expira) : expira))
  if (novos.length > 0) aplicarAspects(pokemon, novos.map(e => `geraldo_${e}`), [])
  ativos.set(String(entidade.stringUUID), entidade)

  server.runCommandSilent(`particle minecraft:happy_villager ${entidade.x} ${entidade.y + 0.8} ${entidade.z} 0.4 0.4 0.4 0.05 12`)
  server.runCommandSilent(`playsound minecraft:entity.generic.eat neutral @a ${entidade.x} ${entidade.y} ${entidade.z} 0.8 1.2`)
}

ItemEvents.entityInteracted(event => {
  const berry = BERRIES[event.item.id]
  const banquete = event.item.id == BANQUETE.item
  const alvo = event.target
  if ((!berry && !banquete) || !(alvo instanceof PokemonEntity)) return
  if (alvo.tethering == null) return // so vale pra Pokémon no Pasture

  const player = event.player
  const nome = alvo.pokemon.species.name
  if (banquete) {
    alimentar(event.server, alvo, EFEITOS, BANQUETE.duracao)
    player.setStatusMessage(Text.of(`${nome}: Banquete! Todos os efeitos por 60 min`).gold())
  } else {
    alimentar(event.server, alvo, [berry.efeito], DURACAO_MS)
    player.setStatusMessage(Text.of(`${nome}: ${berry.nome} (${berry.desc}) por 20 min`)[berry.cor]())
  }
  if (!player.isCreative()) event.item.shrink(1)
  event.cancel()
})

// Pokémon carregado do disco ou tirado da Pokébola: volta a ser acompanhado se tiver efeito
EntityEvents.spawned('cobblemon:pokemon', event => {
  const pokemon = event.entity.pokemon
  if (pokemon && EFEITOS.some(e => temEfeito(pokemon, e))) ativos.set(String(event.entity.stringUUID), event.entity)
})

// Cochos com berry ou maca perto do Pasture; os de berry vem primeiro pra maca so cobrir o que faltar
const cochosPerto = (level, pasto) => {
  const px = pasto.getX(), py = pasto.getY(), pz = pasto.getZ()
  const cochos = [], cochosMaca = []
  for (let cx = (px - COCHO_RAIO) >> 4; cx <= (px + COCHO_RAIO) >> 4; cx++) {
    for (let cz = (pz - COCHO_RAIO) >> 4; cz <= (pz + COCHO_RAIO) >> 4; cz++) {
      if (!level.hasChunk(cx, cz)) continue
      level.getChunk(cx, cz).getBlockEntities().values().forEach(be => {
        if (!(be instanceof FeedingTrough)) return
        const p = be.getBlockPos()
        if (Math.abs(p.getX() - px) > COCHO_RAIO || Math.abs(p.getZ() - pz) > COCHO_RAIO || Math.abs(p.getY() - py) > COCHO_ALTURA) return
        const id = be.getItem(0).id
        if (BERRIES[id]) cochos.push(be)
        else if (id == BANQUETE.item) cochosMaca.push(be)
      })
    }
  }
  return cochos.concat(cochosMaca)
}

const precisaComer = (pokemon, efeito, agora) =>
  !temEfeito(pokemon, efeito) || pokemon.persistentData.getLong(chaveExpira(efeito)) - agora < RENOVAR_ANTES_MS

const alimentarPeloCocho = server => {
  const agora = Date.now()
  server.getAllLevels().forEach(level => {
    // Pokémon no Pasture agrupados pelo bloco do Pasture
    const pastos = new Map()
    level.getAllEntities().forEach(e => {
      if (!(e instanceof PokemonEntity) || e.tethering == null) return
      const pos = e.tethering.getPasturePos()
      const chave = String(pos.asLong())
      if (!pastos.has(chave)) pastos.set(chave, { pos: pos, pokemons: [] })
      pastos.get(chave).pokemons.push(e)
    })

    pastos.forEach(pasto => {
      cochosPerto(level, pasto.pos).forEach(cocho => {
        const berry = BERRIES[cocho.getItem(0).id]
        const efeitos = berry ? [berry.efeito] : EFEITOS
        const duracao = berry ? DURACAO_MS : BANQUETE.duracao
        pasto.pokemons.forEach(entidade => {
          if (cocho.getItem(0).isEmpty() || !efeitos.some(e => precisaComer(entidade.pokemon, e, agora))) return
          cocho.removeItem(0, 1)
          cocho.setChanged()
          alimentar(server, entidade, efeitos, duracao)
        })
      })
    })
  })
}

ServerEvents.tick(event => {
  const server = event.server
  if (server.tickCount % COCHO_INTERVALO == 0) alimentarPeloCocho(server)
  if (server.tickCount % 20 != 0 || ativos.size == 0) return

  ativos.forEach((entidade, uuid) => {
    if (entidade.isRemoved()) { ativos.delete(uuid); return } // volta pelo spawned
    const pokemon = entidade.pokemon
    const agora = Date.now()
    const vencidos = EFEITOS.filter(e => temEfeito(pokemon, e) && pokemon.persistentData.getLong(chaveExpira(e)) <= agora)

    if (vencidos.length > 0) {
      vencidos.forEach(e => pokemon.persistentData.remove(chaveExpira(e)))
      aplicarAspects(pokemon, [], vencidos.map(e => `geraldo_${e}`))
    }

    // Insonia: tira a sonolencia; sem ela o proprio Cobblemon acorda o Pokémon
    if (temEfeito(pokemon, 'insonia')) entidade.brain.eraseMemory(CobblemonMemories.POKEMON_DROWSY)

    if (!EFEITOS.some(e => temEfeito(pokemon, e))) ativos.delete(uuid)
  })
})

// Pra outros scripts (rituais_ars.js): dar o Banquete a um Pokémon do Pasture e saber se ele precisa
global.geraldo.banquete = (server, entidade) => alimentar(server, entidade, EFEITOS, BANQUETE.duracao)
global.geraldo.precisaBanquete = entidade => EFEITOS.some(e => precisaComer(entidade.pokemon, e, Date.now()))
