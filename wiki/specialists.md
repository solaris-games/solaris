# Specialists

If a star or carrier has a specialist, the matching specialist icon will be displayed instead of the standard star/carrier icon. 

Specialists can provide any number of modifiers to a star or carrier's statistics, and are fundamental to a strategically successful game.

By default, specialists require specialist tokens. You can change this setting to make specialists require credits instead.

## Star Specialists

| Icon                                                                                                                                   | Specialist Name          | Effect     | Tokens  | Credits |
| ------------------------------------------------------------------------------------------------------------------------------         | ----------------         | ----       | -----   | ------- |
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/sattelite.svg" width="60">         | **Orbital Array**        | Grants +1 Scanning Range to the Star. | 1 | $100
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/energy-tank.svg" width="60">       | **Mineral Extractor**    | Grants +2 Terraforming to the Star. | 1 | $100
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/airtight-hatch.svg" width="60">    | **Space Dock**           | Grants +2 Manufacturing, -1 Terraforming to the Star. | 2 | $200
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/cannister.svg" width="60">         | **Atmosphere Processor** | Grants +3 Terraforming, -1 Scanning to the Star. | 2 | $200
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/defense-satellite.svg" width="60"> | **Orbital Cannon**       | Grants +1 Weapons to the Star. | 2 | $200
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/habitat-dome.svg" width="60">      | **Warp Scrambler**       | Locks the Warp Gate at the Star to prevent enemy players from using it. Weapons -1. | 3 | $300
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/power-generator.svg" width="60">   | **Scrambler**            | Prevents other players from seeing how many ships are garrisoned at the Star. | 3 | $300
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/space-suit.svg" width="60">        | **Demolition Controller**| If the Star is captured, all infrastructure is destroyed. | 3 | $300
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/missile-pod.svg" width="60">       | **War Machine**          | Deducts 1 from the Star's natural resources every tick, +5 Manufacturing, +5 Weapons. When the star reaches 0 natural resources, the star dies and the specialist retires. **`This specialist cannot be replaced.`** |  5 | $500
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/observatory.svg" width="60">       | **Research Station**     | The Star's Science infrastructure contributes x2 to research. -3 Terraforming, -3 Weapons, +1 Scanning. | 5 | $500
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/radar-dish.svg" width="60">        | **Telescope Array**      | Grants +3 Scanning Range, -3 Weapons to the Star. | 6 | $600
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/techno-heart.svg" width="60">      | **World Builder**        | Adds 1 to the Star's natural resources every tick, -3 Scanning, -5 Weapons. | 10 | $1000
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/ringed-planet.svg" width="60">     | **Trade Port**           | The Star's Economy infrastructure contributes x2 to economy production. -5 Terraforming, -3 Weapons, +1 Scanning. | 10 | $1000
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/double-ringed-orb.svg" width="60"> | **Financial Analyst**    | The star produces 2 credits per tick for each point of science on the star. | 10 | $1000
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/cryo-chamber.svg" width="60">      | **Cryo Chamber**         | When a Carrier is built at this Star, a Lieutenant Carrier Specialist is automatically assigned to the Carrier. | 15 | $1500
 
## Carrier Specialists

| Icon                                                                                                                                                | Specialist Name     | Effect  | Tokens | Credits | 
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------- | ------ | ------- |
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/spoutnik.svg" width="60">                       | **Pathfinder**      | Grants +1 Hyperspace Range to the Carrier. | 1 | $100
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/mecha-mask.svg" width="60">                     | **Lieutenant**      | Grants +1 Weapons, -1 Hyperspace Range to the carrier. | 2 | $200
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/mecha-head.svg" width="60">                     | **Admiral**         | Grants x1.5 Speed, -1 Weapons, -2 Hyperspace Range to the carrier. | 3 | $300
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/android-mask.svg" width="60">                   | **Colonel**         | Grants +2 Weapons, -1 Hyperspace Range, x0.75 Speed to the carrier. | 3 | $300
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/lunar-module.svg" width="60">                   | **Explorer**        | Grants +3 Hyperspace Range, x1.5 Speed, -3 Weapons to the carrier. | 3 | $300
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/power-generator.svg" width="60">                | **Scrambler**       | Prevents other players from seeing how many ships the carrier has. | 3 | $300
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/energise.svg" width="60">                       | **Infiltrator**     | When participating in combat, the enemies fight with -1 Weapons. | 3 | $300
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/rocket.svg" width="60">                         | **Stellar Bomb**    | Reignites a dead star with 25 Natural Resources, the Stellar Bomb will be destroyed but the carrier will survive. x0.5 Speed. | 3 | $300
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/hazmat-suit.svg" width="60">                    | **General**         | Grants +3 Weapons, -1 Hyperspace Range, x0.5 Speed to the carrier. | 5 | $500
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/cyborg-face.svg" width="60">                    | **Smuggler**        | Grants x2 Speed, -1 Hyperspace Range, -1 Weapons to the carrier. | 5 | $500
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/afterburn.svg" width="60">                      | **Warp Stabilizer** | Warp Scramblers do not affect the carrier. | 5 | $500
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/strafe.svg" width="60">                         | **Raider**          | Carrier travels at x2 Speed, -2 Weapons. The carrier is awarded x2 star capture rewards for destroying infrastructure. | 5 | $500
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/pirate.svg" width="60">                         | **Pirate**          | Grants +3 Weapons in carrier-to-carrier combat, -2 Weapons in carrier-to-star combat and x1.5 Speed. | 5 | $500
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/starfighter.svg" width="60">                    | **Marauder**        | The carrier does not participate in carrier-to-carrier combat. x1.5 Speed, -2 Hyperspace Range, -1 Weapons. | 5 | $500
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/spaceship.svg" width="60">                      | **Destroyer**       | Grants +5 Weapons, -3 Hyperspace Range, x0.5 Speed to the carrier. | 10 | $1000
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/alien-stare.svg" width="60">                    | **Coward**          | The carrier does not participate in carrier-to-carrier combat. x2 Speed. | 10 | $1000
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/ray-gun.svg" width="60">                        | **Coward**          | When participating in combat, the enemy fights with -3 Weapons. | 10 | $1000
| <img src="https://raw.githubusercontent.com/mike-eason/solaris/master/client/src/assets/specialists/vintage-robot.svg" width="60">                  | **Joker**           | When attacking a Star or in Carrier-to-Carrier combat, the calculated weapons technology levels are swapped between the two sides unless both sides have a Joker. | 10 | $1000
