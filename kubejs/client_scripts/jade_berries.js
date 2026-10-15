// Jade: mostra os efeitos de berry ativos no Pokémon, com a berry e o tempo restante
// (tempo vem do servidor via startup_scripts/jade_berries.js)

const JadePokemonEntity = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')

const JADE_BERRIES = [
  { efeito: 'rapido',  item: 'cobblemon:salac_berry',  nome: 'Rapido',  cor: 'aqua' },
  { efeito: 'sorte',   item: 'cobblemon:lansat_berry', nome: 'Sorte',   cor: 'gold' },
  { efeito: 'fartura', item: 'cobblemon:sitrus_berry', nome: 'Fartura', cor: 'green' },
  { efeito: 'insonia', item: 'cobblemon:chesto_berry', nome: 'Insonia', cor: 'lightPurple' }
]

const formatarTempo = ms => {
  const s = Math.floor(ms / 1000)
  const seg = s % 60
  return `${Math.floor(s / 60)}:${seg < 10 ? '0' : ''}${seg}`
}

JadeEvents.onClientRegistration(event => {
  event.entity('geraldo:berries', JadePokemonEntity).tooltip((tooltip, accessor, config) => {
    const dados = accessor.getServerData()
    const helper = tooltip.getElementHelper()
    JADE_BERRIES.forEach(b => {
      const chave = `geraldo_berry_${b.efeito}`
      if (!dados.contains(chave)) return
      // addElements (e nao add/append) porque o Rhino nao sabe escolher entre os overloads de add
      tooltip.addElements([
        helper.smallItem(Item.of(b.item)),
        helper.text(Text.of(` ${b.nome} ${formatarTempo(dados.getLong(chave))}`)[b.cor]())
      ])
    })
  })
})
