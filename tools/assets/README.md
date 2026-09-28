# Character and nature asset builds

These scripts turned the free CC0 packs from Quaternius (quaternius.com) into the small `.glb` files in `assets/`.
You only need them to rebuild those files.

1. Download and unzip the packs: Universal Base Characters, Modular Character Outfits - Fantasy, Universal Animation Library, Stylized Nature MegaKit.
2. `npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions sharp`
3. Edit the pack paths at the top of each script, then run:
   - `node quaternius-chars.mjs` builds `assets/chars/q_ranger.glb` and `q_peasant.glb` (outfits; the cloth mask games recolour is baked into the texture's alpha channel). With `CLIPS=Idle_Loop,Walk_Loop,...` it also builds `q_anims.glb` (skeleton plus those clips).
   - `node quaternius-head.mjs` builds `assets/chars/q_head.glb` (head, eyes, brows cut from the base character, plus hairstyles).
   - `LIST=TwistedTree_1,Pine_2,... node quaternius-nature.mjs` builds `assets/models/n_nature.glb` (leaf and grass textures greyed so games can tint them).
