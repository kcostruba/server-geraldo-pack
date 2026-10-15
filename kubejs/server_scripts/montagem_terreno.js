// Montagem automática do MMR no survival: ela só quebra o que estiver na tag modular_machinery_reborn:replaceable
// (que só tem as carcaças do mod). Terra, pedra, areia e mato no lugar da máquina ficavam lá e o bloco certo não era
// posto (Pescaria, 2026-10-15). Com o terreno na tag, ela quebra (deixa cair o item) e coloca o da máquina.

ServerEvents.tags('block', event => {
  event.add('modular_machinery_reborn:replaceable', [
    '#minecraft:dirt', '#minecraft:sand', '#minecraft:base_stone_overworld', '#minecraft:replaceable',
    '#minecraft:leaves', '#minecraft:flowers', '#minecraft:terracotta',
    'minecraft:gravel', 'minecraft:clay', 'minecraft:snow_block', 'minecraft:ice',
    'minecraft:cobblestone', 'minecraft:mossy_cobblestone', 'minecraft:farmland', 'minecraft:dirt_path'
  ])
})
