// Objeto compartilhado entre os scripts de servidor (só startup pode gravar no `global`;
// os scripts de servidor gravam DENTRO de global.geraldo). Sobrevive ao /reload.
//   banquete / precisaBanquete  -> berries_trabalho.js (usado por rituais_ars.js)
//   maquinaPokemon              -> fazenda_multiblocos.js (usado por modo_pasture.js)
//   MB                          -> multiblocos_pokemon.js (ajudas das máquinas)
//   santuarios / subSantuario   -> rituais_ars.js
global.geraldo = {}
