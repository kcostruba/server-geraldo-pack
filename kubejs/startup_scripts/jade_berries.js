// Jade: manda pro cliente quanto tempo falta de cada efeito de berry do Pokémon
// (efeitos aplicados em server_scripts/berries_trabalho.js; exibicao em client_scripts/jade_berries.js)

const JadePokemonEntity = Java.loadClass('com.cobblemon.mod.common.entity.pokemon.PokemonEntity')
const JADE_EFEITOS_BERRY = ['rapido', 'sorte', 'fartura', 'insonia']

JadeEvents.onCommonRegistration(event => {
  event.entityDataProvider('geraldo:berries', JadePokemonEntity).setCallback((tag, accessor) => {
    const dados = accessor.getEntity().getPokemon().getPersistentData()
    const agora = Date.now()
    JADE_EFEITOS_BERRY.forEach(efeito => {
      const chave = `geraldo_berry_${efeito}`
      if (dados.contains(chave)) tag.putLong(chave, Math.max(0, dados.getLong(chave) - agora))
    })
  })
})
