enum RcBldVerticalDirections {
    //% block="up" blockId="rollerCoasterBuilderUp"
    Up,
    //% block="down" blockId="rollerCoasterBuilderDown"
    Down
}

//% color="#9C5F9B" weight=100 block="Roller Coaster" icon="\uf3ff"
namespace rollerCoasterBuilder {
    let railBase = PLANKS_OAK

    // Whether or not to always have track go to the ground.
    // Currently just disabled.
    // Could use fences (or have an option, "Fill With Base" "Fill With Fence" "None")?
    // Would need to ensure airspace for intersection. (Add 1-2 air blocks above each track)
    let fillTrack = false

    //% block="builder place rail"
    //% blockId="rollerCoasterBuilderPlaceRail"
    export function placeRail() {
        placeRailInternal(builder.position(), railBase, RAIL)
    }

    //% block="builder place powered rail"
    //% blockId="rollerCoasterBuilderPlacePoweredRail"
    export function placePoweredRail() {
        placeRailInternal(builder.position(), REDSTONE_BLOCK, POWERED_RAIL)
    }

    //% block="builder place straight line track of length $length || with power every %powerInterval blocks"
    //% length.defl=10 length.min=1
    //% powerInterval.defl=5 powerInterval.min=1 powerInterval.max=8
    //% blockId="rollerCoasterBuilderPlaceLine"
    export function placeLine(length: number, powerInterval: number = 5) {
        for (let index = 0; index < length; index++) {
            // Negative power interval (no power) more for internal use, not documented for external use.
            if (powerInterval > 0 && index % powerInterval == 0) {
                placePoweredRail()
            } else {
                placeRail()
            }
            builder.move(FORWARD, 1)
        }
    }

    //% block="builder place fully powered straight line track of length $length"
    //% length.defl=10 length.min=1 length.max=17
    //% blockId="rollerCoasterBuilderPlacePoweredLine"
    export function placePoweredLine(length: number) {
        for (let index = 0; index < length; index++) {
            if (index == Math.floor(length / 2)) {
                placePoweredRail()
            } else {
                placeUnpoweredPoweredRail()
            }
            builder.move(FORWARD, 1)
        }
    }


    //% block="builder place ramp $direction of $distance blocks"
    //% distance.defl=10
    //% blockId="rollerCoasterBuilderRamp"
    export function buildRamp(direction: RcBldVerticalDirections, distance: number) {
        if (direction == RcBldVerticalDirections.Up) {
            rampUp(distance);
        }
        else {
            rampDown(distance);
        }
    }

    function rampUp(height: number) {
        for (let index = 0; index < height; index++) {
            if (index > 0) {
                if (fillTrack) {
                    builder.mark()
                    builder.move(UP, index - 1)
                    builder.fill(railBase)
                    builder.move(UP, 1)
                } else {
                    builder.move(UP, index);
                }
            }
            if (index % 8 == 0) {
                rollerCoasterBuilder.placePoweredRail()
            } else {
                placeUnpoweredPoweredRail()
            }
            builder.move(FORWARD, 1)
            builder.move(DOWN, index)
        }
        builder.move(UP, height)
    }

    function rampDown(distance: number) {
        for (let index = 0; index <= distance; index++) {
            rollerCoasterBuilder.placeRail()
            builder.move(DOWN, 1)
            builder.move(FORWARD, 1)
        }

        // Undo the final down movement, since we didn't actually place a block.
        builder.move(UP, 1)
    }

    //% block="builder place $direction turn in track"
    //% blockId="rollerCoasterBuilderPlaceTurn"
    export function builderPlaceTurn(direction: TurnDirection) {
        rollerCoasterBuilder.placeRail()
        builder.move(FORWARD, 1)
        rollerCoasterBuilder.placeRail()
        builder.turn(direction);
        builder.move(FORWARD, 1)
        rollerCoasterBuilder.placeRail()
        builder.move(FORWARD, 1)
    }


    function placeRailInternal(position: Position, baseBlock: number, railBlock: number) {
        blocks.place(baseBlock, position)
        blocks.place(railBlock, position.move(CardinalDirection.Up, 1))

        // Need two air blocks so player can fit if the track tunnels (or intersects with something).
        blocks.place(AIR, position.move(CardinalDirection.Up, 2))
        blocks.place(AIR, position.move(CardinalDirection.Up, 3))
    }

    // Intentionally not exposed, as it's a bit confusing...
    function placeUnpoweredPoweredRail() {
        placeRailInternal(builder.position(), railBase, POWERED_RAIL)
    }

    //% group="Customization"
    //% block
    //% blockType.shadow=minecraftBlock
    //% blockId="rollerCoasterBuilderSetBaseBlock"
    export function SetRollerCoasterBaseBlock(blockType: number) {
        railBase = blockType
    }

    //% group="Builder Helpers"
    //% block="builder face same direction as player"
    //% blockType.shadow=minecraftBlock
    //% blockId="rcBuilderHelpersFacePlayer"
    export function builderFacePlayerDirection() {
        builder.face(positions.toCompassDirection(player.getOrientation()))
    }
}
