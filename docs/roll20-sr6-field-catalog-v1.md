# SR6 Roll20 Feldkatalog v1

Quelle: Felddefinitionen fuer das Character Sheet (Vollumfang inkl. Matrix/Resonanz).

## Feldschema

- `module`: Funktionsbereich im Sheet
- `ui_section`: Zielbereich im UI
- `field_label`: Lesbarer Feldname
- `i18n_key`: Schluessel fuer DE/EN/FR Uebersetzung
- `attribute_name`: Roll20-Attributname (`name="attr_..."` bzw. Repeating-Kontext)
- `type`: Feldtyp (`text`, `number`, `textarea`, `action`)
- `repeating`: `yes`/`no`
- `computed`: `yes`/`no` (durch Sheet Worker berechnet)

## Felder

| module | ui_section | field_label | i18n_key | attribute_name | type | repeating | computed |
|---|---|---|---|---|---|---|---|
| core | identity | Character Name | `field.character_name` | `character_name` | `text` | no | no |
| core | identity | Player Name | `field.player_name` | `player_name` | `text` | no | no |
| core | identity | Metatype | `field.metatype` | `metatype` | `text` | no | no |
| core | identity | Archetype | `field.archetype` | `archetype` | `text` | no | no |
| core | identity | Concept | `field.concept` | `concept` | `text` | no | no |
| core | identity | Karma | `field.karma` | `karma_current` | `number` | no | no |
| core | identity | Nuyen | `field.nuyen` | `nuyen_current` | `number` | no | no |
| attr | attributes | Body | `field.body` | `attr_sr6_body` | `number` | no | no |
| attr | attributes | Agility | `field.agility` | `attr_sr6_agility` | `number` | no | no |
| attr | attributes | Reaction | `field.reaction` | `attr_sr6_reaction` | `number` | no | no |
| attr | attributes | Strength | `field.strength` | `attr_sr6_strength` | `number` | no | no |
| attr | attributes | Willpower | `field.willpower` | `attr_sr6_willpower` | `number` | no | no |
| attr | attributes | Logic | `field.logic` | `attr_sr6_logic` | `number` | no | no |
| attr | attributes | Intuition | `field.intuition` | `attr_sr6_intuition` | `number` | no | no |
| attr | attributes | Charisma | `field.charisma` | `attr_sr6_charisma` | `number` | no | no |
| attr | attributes | Edge | `field.edge` | `attr_sr6_edge` | `number` | no | no |
| attr | attributes | Magic | `field.magic` | `attr_sr6_magic` | `number` | no | no |
| attr | attributes | Resonance | `field.resonance` | `attr_sr6_resonance` | `number` | no | no |
| derived | limits | Physical Defense | `field.physical_defense` | `derived_physical_defense` | `number` | no | yes |
| derived | limits | Astral Defense | `field.astral_defense` | `derived_astral_defense` | `number` | no | yes |
| derived | limits | Matrix Defense | `field.matrix_defense` | `derived_matrix_defense` | `number` | no | yes |
| derived | initiative | Initiative Base | `field.initiative_base` | `derived_initiative_base` | `number` | no | yes |
| derived | initiative | Initiative Dice | `field.initiative_dice` | `derived_initiative_dice` | `number` | no | no |
| derived | initiative | Astral Initiative | `field.astral_initiative` | `derived_astral_initiative` | `number` | no | yes |
| derived | initiative | Matrix Initiative | `field.matrix_initiative` | `derived_matrix_initiative` | `number` | no | yes |
| derived | monitors | Physical Monitor Max | `field.physical_monitor_max` | `derived_monitor_physical_max` | `number` | no | yes |
| derived | monitors | Stun Monitor Max | `field.stun_monitor_max` | `derived_monitor_stun_max` | `number` | no | yes |
| derived | monitors | Matrix Monitor Max | `field.matrix_monitor_max` | `derived_monitor_matrix_max` | `number` | no | yes |
| derived | monitors | Physical Damage | `field.physical_damage` | `monitor_physical_damage` | `number` | no | no |
| derived | monitors | Stun Damage | `field.stun_damage` | `monitor_stun_damage` | `number` | no | no |
| derived | monitors | Matrix Damage | `field.matrix_damage` | `monitor_matrix_damage` | `number` | no | no |
| skills | core_skills | Skill Name | `field.skill_name` | `repeating_skill_name` | `text` | yes | no |
| skills | core_skills | Skill Rating | `field.skill_rating` | `repeating_skill_rating` | `number` | yes | no |
| skills | core_skills | Linked Attribute | `field.linked_attribute` | `repeating_skill_linked_attr` | `text` | yes | no |
| skills | core_skills | Specialization | `field.specialization` | `repeating_skill_spec` | `text` | yes | no |
| skills | core_skills | Misc Modifier | `field.misc_modifier` | `repeating_skill_mod_misc` | `number` | yes | no |
| skills | core_skills | Dice Pool | `field.dice_pool` | `repeating_skill_dice_pool` | `number` | yes | yes |
| skills | core_skills | Roll Action | `roll.skill` | `repeating_skill_roll` | `action` | yes | no |
| combat | weapons | Weapon Name | `field.weapon_name` | `repeating_weapon_name` | `text` | yes | no |
| combat | weapons | Weapon Type | `field.weapon_type` | `repeating_weapon_type` | `text` | yes | no |
| combat | weapons | Attack Skill | `field.attack_skill` | `repeating_weapon_attack_skill` | `text` | yes | no |
| combat | weapons | Attack Rating | `field.attack_rating` | `repeating_weapon_ar` | `number` | yes | no |
| combat | weapons | Damage Value | `field.damage_value` | `repeating_weapon_dv` | `text` | yes | no |
| combat | weapons | Damage Type | `field.damage_type` | `repeating_weapon_damage_type` | `text` | yes | no |
| combat | weapons | Armor Penetration | `field.armor_penetration` | `repeating_weapon_ap` | `number` | yes | no |
| combat | weapons | Ammo Capacity | `field.ammo_capacity` | `repeating_weapon_ammo_capacity` | `number` | yes | no |
| combat | weapons | Ammo Current | `field.ammo_current` | `repeating_weapon_ammo_current` | `number` | yes | no |
| combat | weapons | Attack Roll | `roll.attack` | `repeating_weapon_roll_attack` | `action` | yes | no |
| combat | defense | Armor | `field.armor` | `armor_total` | `number` | no | no |
| combat | defense | Dodge Modifier | `field.dodge_modifier` | `defense_dodge_mod` | `number` | no | no |
| combat | defense | Soak Bonus | `field.soak_bonus` | `defense_soak_bonus` | `number` | no | no |
| magic | tradition | Tradition | `field.tradition` | `magic_tradition` | `text` | no | no |
| magic | tradition | Drain Attribute 1 | `field.drain_attr_1` | `magic_drain_attr_1` | `text` | no | no |
| magic | tradition | Drain Attribute 2 | `field.drain_attr_2` | `magic_drain_attr_2` | `text` | no | no |
| magic | casting | Spell Name | `field.spell_name` | `repeating_spell_name` | `text` | yes | no |
| magic | casting | Category | `field.spell_category` | `repeating_spell_category` | `text` | yes | no |
| magic | casting | Type | `field.spell_type` | `repeating_spell_type` | `text` | yes | no |
| magic | casting | Range | `field.spell_range` | `repeating_spell_range` | `text` | yes | no |
| magic | casting | Duration | `field.spell_duration` | `repeating_spell_duration` | `text` | yes | no |
| magic | casting | Drain Value | `field.drain_value` | `repeating_spell_drain_value` | `text` | yes | no |
| magic | casting | Spell Roll | `roll.spell` | `repeating_spell_roll` | `action` | yes | no |
| magic | rituals | Ritual Name | `field.ritual_name` | `repeating_ritual_name` | `text` | yes | no |
| magic | rituals | Ritual Threshold | `field.ritual_threshold` | `repeating_ritual_threshold` | `number` | yes | no |
| magic | summoning | Spirit Name | `field.spirit_name` | `repeating_spirit_name` | `text` | yes | no |
| magic | summoning | Spirit Type | `field.spirit_type` | `repeating_spirit_type` | `text` | yes | no |
| magic | summoning | Force | `field.force` | `repeating_spirit_force` | `number` | yes | no |
| magic | focus | Foci Name | `field.focus_name` | `repeating_focus_name` | `text` | yes | no |
| magic | focus | Foci Rating | `field.focus_rating` | `repeating_focus_rating` | `number` | yes | no |
| matrix | persona | Device Rating | `field.device_rating` | `matrix_device_rating` | `number` | no | no |
| matrix | persona | Attack | `field.matrix_attack` | `matrix_attack` | `number` | no | no |
| matrix | persona | Sleaze | `field.matrix_sleaze` | `matrix_sleaze` | `number` | no | no |
| matrix | persona | Data Processing | `field.matrix_data_processing` | `matrix_data_processing` | `number` | no | no |
| matrix | persona | Firewall | `field.matrix_firewall` | `matrix_firewall` | `number` | no | no |
| matrix | persona | Matrix Condition | `field.matrix_condition` | `matrix_condition_track` | `number` | no | no |
| matrix | devices | Device Name | `field.device_name` | `repeating_device_name` | `text` | yes | no |
| matrix | devices | Device Type | `field.device_type` | `repeating_device_type` | `text` | yes | no |
| matrix | devices | Program Slots | `field.program_slots` | `repeating_device_program_slots` | `number` | yes | no |
| matrix | devices | Running Programs | `field.running_programs` | `repeating_device_programs` | `text` | yes | no |
| matrix | actions | Matrix Action Name | `field.matrix_action_name` | `repeating_matrix_action_name` | `text` | yes | no |
| matrix | actions | Matrix Action Test | `field.matrix_action_test` | `repeating_matrix_action_test` | `text` | yes | no |
| matrix | actions | Matrix Action Roll | `roll.matrix_action` | `repeating_matrix_action_roll` | `action` | yes | no |
| resonance | core | Stream | `field.stream` | `res_stream` | `text` | no | no |
| resonance | core | Submersion Grade | `field.submersion_grade` | `res_submersion_grade` | `number` | no | no |
| resonance | complex_forms | Complex Form Name | `field.complex_form_name` | `repeating_cform_name` | `text` | yes | no |
| resonance | complex_forms | Target | `field.target` | `repeating_cform_target` | `text` | yes | no |
| resonance | complex_forms | Fading Value | `field.fading_value` | `repeating_cform_fading` | `text` | yes | no |
| resonance | complex_forms | Complex Form Roll | `roll.complex_form` | `repeating_cform_roll` | `action` | yes | no |
| resonance | sprites | Sprite Name | `field.sprite_name` | `repeating_sprite_name` | `text` | yes | no |
| resonance | sprites | Sprite Type | `field.sprite_type` | `repeating_sprite_type` | `text` | yes | no |
| resonance | sprites | Level | `field.level` | `repeating_sprite_level` | `number` | yes | no |
| resonance | sprites | Tasks Owed | `field.tasks_owed` | `repeating_sprite_tasks` | `number` | yes | no |
| resonance | sprites | Sprite Roll | `roll.sprite` | `repeating_sprite_roll` | `action` | yes | no |
| gear | equipment | Gear Name | `field.gear_name` | `repeating_gear_name` | `text` | yes | no |
| gear | equipment | Quantity | `field.quantity` | `repeating_gear_qty` | `number` | yes | no |
| gear | equipment | Weight | `field.weight` | `repeating_gear_weight` | `number` | yes | no |
| gear | equipment | Notes | `field.notes` | `repeating_gear_notes` | `text` | yes | no |
| char | qualities | Quality Name | `field.quality_name` | `repeating_quality_name` | `text` | yes | no |
| char | qualities | Type | `field.quality_type` | `repeating_quality_type` | `text` | yes | no |
| char | qualities | Karma Cost | `field.karma_cost` | `repeating_quality_karma` | `number` | yes | no |
| char | contacts | Contact Name | `field.contact_name` | `repeating_contact_name` | `text` | yes | no |
| char | contacts | Loyalty | `field.loyalty` | `repeating_contact_loyalty` | `number` | yes | no |
| char | contacts | Connection | `field.connection` | `repeating_contact_connection` | `number` | yes | no |
| notes | notes | Background | `field.background` | `notes_background` | `textarea` | no | no |
| notes | notes | GM Notes | `field.gm_notes` | `notes_gm` | `textarea` | no | no |
