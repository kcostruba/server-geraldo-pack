// Modular Routers com cara de Create: continua na bancada, so os ingredientes mudaram.
// Receitas especiais do mod (breaker / extruder mk1 com encantamento, guia, reset) ficam como estao.

const MR = 'modularrouters:'

ServerEvents.recipes(event => {
  const shaped = (nome, saida, padrao, chave) => {
    event.remove({ id: MR + nome })
    event.shaped(saida, padrao, chave).id('geraldo:modularrouters/' + nome)
  }
  const shapeless = (nome, saida, ingredientes) => {
    event.remove({ id: MR + nome })
    event.shapeless(saida, ingredientes).id('geraldo:modularrouters/' + nome)
  }

  // --- Base
  shaped('blank_module', '6x ' + MR + 'blank_module', [' T ', 'PPP', 'NNN'], {
    T: 'create:electron_tube', P: '#c:plates/iron', N: 'create:brass_nugget'
  })
  shaped('blank_upgrade', '4x ' + MR + 'blank_upgrade', ['PPN', 'PQN', ' PN'], {
    P: '#c:plates/copper', N: 'create:brass_nugget', Q: 'create:polished_rose_quartz'
  })
  shapeless('augment_core', MR + 'augment_core', [MR + 'blank_module', MR + 'blank_upgrade', 'create:cogwheel'])
  shaped('modular_router', '4x ' + MR + 'modular_router', ['CFC', 'FMF', 'CFC'], {
    C: 'create:brass_casing', F: 'create:brass_funnel', M: MR + 'blank_module'
  })

  // --- Modulos de item
  shapeless('sender_module_1', MR + 'sender_module_1', [MR + 'blank_module', 'create:belt_connector'])
  event.remove({ id: MR + 'sender_module_1_alt' })
  shapeless('sender_module_2', MR + 'sender_module_2', [MR + 'sender_module_1', 'create:portable_storage_interface'])
  shapeless('sender_module_2_x4', '4x ' + MR + 'sender_module_2', [
    MR + 'sender_module_1', MR + 'sender_module_1', MR + 'sender_module_1', MR + 'sender_module_1',
    'create:portable_storage_interface'
  ])
  shapeless('sender_module_3', MR + 'sender_module_3', [MR + 'sender_module_2', 'create:precision_mechanism', 'ender_chest'])
  shapeless('puller_module_1', MR + 'puller_module_1', [MR + 'blank_module', 'create:andesite_funnel'])
  shapeless('puller_module_2', MR + 'puller_module_2', [MR + 'puller_module_1', 'create:portable_storage_interface'])
  shapeless('puller_module_2_x4', '4x ' + MR + 'puller_module_2', [
    MR + 'puller_module_1', MR + 'puller_module_1', MR + 'puller_module_1', MR + 'puller_module_1',
    'create:portable_storage_interface'
  ])
  shaped('distributor_module', MR + 'distributor_module', [' T ', 'SMS'], {
    T: 'create:brass_tunnel', S: MR + 'sender_module_2', M: MR + 'blank_module'
  })
  shapeless('dropper_module', MR + 'dropper_module', [MR + 'blank_module', 'create:chute'])
  shapeless('flinger_module', MR + 'flinger_module', [MR + 'dropper_module', 'create:propeller'])
  shapeless('vacuum_module', MR + 'vacuum_module', [MR + 'blank_module', 'create:encased_fan', 'create:andesite_funnel'])
  shapeless('placer_module', MR + 'placer_module', [MR + 'blank_module', 'create:deployer'])
  shaped('activator_module', MR + 'activator_module', ['RLR', 'HMH', 'RQR'], {
    R: '#c:dusts/redstone', L: 'create:analog_lever', H: 'create:brass_hand', M: MR + 'blank_module',
    Q: 'create:polished_rose_quartz'
  })
  shapeless('detector_module', MR + 'detector_module', [MR + 'blank_module', 'create:stockpile_switch'])
  shapeless('extruder_module_2', MR + 'extruder_module_2', [MR + 'blank_module', 'create:item_vault'])
  shaped('player_module', MR + 'player_module', [' G ', 'SZP', ' B '], {
    G: 'create:goggles', S: MR + 'sender_module_3', Z: 'wither_skeleton_skull', P: MR + 'puller_module_2',
    B: 'create:copper_backtank'
  })

  // --- Fluido e energia
  shaped('fluid_module', MR + 'fluid_module', [' P ', 'TMT'], {
    P: 'create:mechanical_pump', T: 'create:fluid_pipe', M: MR + 'blank_module'
  })
  shapeless('fluid_module_2', MR + 'fluid_module_2', [MR + 'fluid_module', 'create:portable_fluid_interface'])
  shapeless('fluid_module_2_x4', '4x ' + MR + 'fluid_module_2', [
    MR + 'fluid_module', MR + 'fluid_module', MR + 'fluid_module', MR + 'fluid_module',
    'create:portable_fluid_interface'
  ])
  shaped('fluid_upgrade', '3x ' + MR + 'fluid_upgrade', [' T ', 'PBP'], {
    T: 'create:fluid_tank', P: 'create:fluid_pipe', B: MR + 'blank_upgrade'
  })
  shaped('energy_output_module', MR + 'energy_output_module', [' C ', 'WBW', ' K '], {
    C: 'createaddition:capacitor', W: 'createaddition:copper_wire', B: MR + 'blank_module', K: 'createaddition:connector'
  })
  shapeless('energy_distributor_module', MR + 'energy_distributor_module', [
    MR + 'energy_output_module', MR + 'distributor_module', 'createaddition:large_connector'
  ])
  shaped('energy_upgrade', MR + 'energy_upgrade', ['WCW', ' B ', 'WEW'], {
    W: 'createaddition:copper_wire', C: 'createaddition:capacitor', B: MR + 'blank_upgrade',
    E: 'createaddition:electrum_ingot'
  })

  // --- Filtros
  shaped('bulk_item_filter', MR + 'bulk_item_filter', ['PGP', 'MFM', 'PGP'], {
    P: '#c:plates/brass', G: 'create:framed_glass', M: MR + 'blank_module', F: 'create:filter'
  })
  shaped('inspection_filter', MR + 'inspection_filter', ['QBQ', ' G '], {
    Q: 'create:polished_rose_quartz', B: MR + 'bulk_item_filter', G: 'create:goggles'
  })
  shapeless('mod_filter', MR + 'mod_filter', [MR + 'bulk_item_filter', 'create:attribute_filter'])
  shapeless('tag_filter', MR + 'tag_filter', [MR + 'bulk_item_filter', 'create:attribute_filter', '#c:dyes/black'])
  shapeless('regex_filter', MR + 'regex_filter', [MR + 'bulk_item_filter', 'create:clipboard'])

  // --- Upgrades
  shaped('speed_upgrade', '3x ' + MR + 'speed_upgrade', ['RPR', 'NBN', 'CKC'], {
    R: '#c:dusts/redstone', P: 'create:precision_mechanism', N: 'create:brass_nugget', B: MR + 'blank_upgrade',
    C: 'create:cogwheel', K: 'create:blaze_cake'
  })
  shapeless('stack_upgrade', MR + 'stack_upgrade', [MR + 'blank_upgrade', 'create:item_vault'])
  shaped('blast_upgrade', MR + 'blast_upgrade', ['ASA', 'SBS', 'ASA'], {
    A: 'create:andesite_bars', S: 'create:sturdy_sheet', B: MR + 'blank_upgrade'
  })
  shaped('security_upgrade', MR + 'security_upgrade', [' Q ', 'NBN', ' L '], {
    Q: 'create:polished_rose_quartz', N: 'create:brass_nugget', B: MR + 'blank_upgrade', L: 'create:redstone_link'
  })
  shaped('sync_upgrade', '16x ' + MR + 'sync_upgrade', ['RAP', 'RBR'], {
    R: '#c:dusts/redstone', A: 'create:andesite_alloy', P: 'create:pulse_repeater', B: MR + 'blank_upgrade'
  })
  shaped('muffler_upgrade', '4x ' + MR + 'muffler_upgrade', [' C ', 'CBC', ' C '], {
    C: 'create:cardboard', B: MR + 'blank_upgrade'
  })
  shapeless('camouflage_upgrade', MR + 'camouflage_upgrade', [MR + 'blank_upgrade', 'create:copycat_panel', 'create:copycat_step'])

  // --- Augments
  shaped('pushing_augment', MR + 'pushing_augment', ['PMP'], { P: 'create:mechanical_piston', M: MR + 'augment_core' })
  shaped('range_up_augment', '4x ' + MR + 'range_up_augment', [' Q ', 'QMQ', ' S '], {
    Q: 'create:polished_rose_quartz', M: MR + 'augment_core', S: 'create:shaft'
  })
  shaped('range_down_augment', '4x ' + MR + 'range_down_augment', [' S ', 'QMQ', ' Q '], {
    Q: 'create:polished_rose_quartz', M: MR + 'augment_core', S: 'create:shaft'
  })
  shaped('redstone_augment', MR + 'redstone_augment', [' L ', 'RMR', ' L '], {
    L: 'create:powered_latch', R: '#c:dusts/redstone', M: MR + 'augment_core'
  })
  shaped('regulator_augment', MR + 'regulator_augment', [' Q ', 'SMS', ' Q '], {
    Q: 'create:polished_rose_quartz', S: 'create:stockpile_switch', M: MR + 'augment_core'
  })
  shapeless('fast_pickup_augment', MR + 'fast_pickup_augment', [MR + 'augment_core', 'create:extendo_grip'])
  shapeless('filter_round_robin_augment', MR + 'filter_round_robin_augment', [MR + 'augment_core', 'create:cuckoo_clock'])
  shapeless('pickup_delay_augment', MR + 'pickup_delay_augment', [MR + 'augment_core', 'create:pulse_extender'])
  shapeless('mimic_augment', MR + 'mimic_augment', [MR + 'augment_core', 'create:copycat_step', '#c:dusts/redstone', '#c:dusts/glowstone'])
  shapeless('xp_vacuum_augment', MR + 'xp_vacuum_augment', [MR + 'augment_core', 'create:experience_block'])
})
