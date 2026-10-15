// Peças maiores do Modular Machinery Reborn: o mod só traz receita das entradas/saídas de energia Tiny e Small
// (Small = 512 FE/t). As máquinas de fim de jogo (Usina, Mineradora Profunda, Santuário) precisam das maiores.
// Cada uma é feita a partir da anterior (upgrade), de entrada e de saída de energia:
//   Normal      (8.192 FE guardado,   512 FE/t)  <- Small + bobinas de fio de cobre (IE)
//   Reforçada   (16.384 FE,         2.048 FE/t)  <- Normal + placas de aço + bobinas de fio de electrum (IE)
//   Grande      (32.768 FE,         8.192 FE/t)  <- Reforçada + Bobinas HV (IE) + Carcaças de Latão (Create)
//   Enorme      (131.072 FE,       32.768 FE/t)  <- Grande + netherite + Componentes Avançados (IE)

ServerEvents.recipes(event => {
  const UPGRADES = [
    ['small', 'normal', 'immersiveengineering:wirecoil_copper', '#c:plates/copper'],
    ['normal', 'reinforced', 'immersiveengineering:wirecoil_electrum', '#c:plates/steel'],
    ['reinforced', 'big', 'immersiveengineering:coil_hv', 'create:brass_casing'],
    ['big', 'huge', 'minecraft:netherite_ingot', 'immersiveengineering:component_electronic_adv']
  ]
  ;['energyinputhatch', 'energyoutputhatch'].forEach(tipo => {
    UPGRADES.forEach(u => {
      event.shaped(`modular_machinery_reborn:${tipo}_${u[1]}`, [
        'ABA',
        'BHB',
        'ABA'
      ], {
        H: `modular_machinery_reborn:${tipo}_${u[0]}`,
        A: u[2],
        B: u[3]
      }).id(`geraldo:mmr/${tipo}_${u[1]}`)
    })
  })
})
