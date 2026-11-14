# PokéRogue visuals and battle effects

- Asset snapshot: https://github.com/pagefaultgames/pokerogue-assets/tree/c67fbe910cf598357cb64b81975e44cc058ca06d
- Visual credits, including Pokémon Reborn move animations: https://wiki.pokerogue.net/credits:visual
- Animation format and coordinates: https://github.com/pagefaultgames/pokerogue/blob/beta/src/data/battle-anims.ts
- National Pokédex and move IDs identify sprites and animations in `manifest.js`. Pokémon sprites are exported from the PNG atlas using its corresponding JSON metadata. Unknown forms use the base species, with Unown A as the default Unown.
- Future regions can extend the same manifest and retain their existing encounter and trainer IDs. Use the correct character art when the upstream project carries the character.
- This preview uses the standard shiny appearance. Existing Silver and May portraits serve as fallbacks because the asset snapshot did not expose corresponding trainer files under their names. Tate represents Tate and Liza in the singles encounter.
- The Sinnoh entries use this snapshot for front and back portraits, standard shiny palettes, cries, move animation sheets, move sounds and battle music. Barry uses the snapshot's male rival portrait as a substitute. Base Pokédex entries with form-specific atlases use a single default form.
- Sinnoh species, move and learnset data comes from PokéAPI's CSV datasets, using the Platinum version group for level-up moves.
