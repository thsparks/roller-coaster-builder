enum RcBldVerticalDirection {
    //% block="up" blockId="rollerCoasterBuilderUp"
    Up,
    //% block="down" blockId="rollerCoasterBuilderDown"
    Down
}
enum RcBldPowerLevel {
    //% block="full" blockId="rollerCoasterBuilderFullPower"
    Full,
    //% block="normal" blockId="rollerCoasterBuilderNormalPower"
    Normal,
    //% block="no" blockId="rollerCoasterBuilderNoPower"
    No
}

//% color="#9C5F9B" block="Roller Coaster" icon="\uf3ff"
namespace rollerCoasterBuilder {
    let railBase = PLANKS_OAK
    let powerInterval = 5 // Keep between 1 and 8, else minecarts may stop between power

    // Whether or not to always have track go to the ground.
    // Currently just disabled.
    // Could use fences (or have an option, "Fill With Base" "Fill With Fence" "None")?
    // Would need to ensure airspace for intersection. (Add 1-2 air blocks above each track)
    let fillTrack = false

    //% block="Add rail to track"
    //% blockId="rollerCoasterBuilderPlaceRail"
    export function placeRail() {
        placeRailInternal(builder.position(), railBase, RAIL)
    }

    //% block="Add powered rail to track"
    //% blockId="rollerCoasterBuilderPlacePoweredRail"
    export function placePoweredRail() {
        placeRailInternal(builder.position(), REDSTONE_BLOCK, POWERED_RAIL)
    }

    // Intentionally not exposed, as it's a bit confusing...
    function placeUnpoweredPoweredRail() {
        placeRailInternal(builder.position(), railBase, POWERED_RAIL)
    }

    function placeRailInternal(position: Position, baseBlock: number, railBlock: number) {
        blocks.place(baseBlock, position)
        blocks.place(railBlock, position.move(CardinalDirection.Up, 1))

        // Need two air blocks so player can fit if the track tunnels (or intersects with something).
        blocks.place(AIR, position.move(CardinalDirection.Up, 2))
        blocks.place(AIR, position.move(CardinalDirection.Up, 3))
    }

    //% block="Add straight line of length $length || with $powerLevel power"
    //% length.defl=10 length.min=1
    //% powerLevel.defl=RcBldPowerLevel.Normal
    //% blockId="rollerCoasterBuilderPlaceLine"
    export function placeLine(length: number, powerLevel: RcBldPowerLevel = RcBldPowerLevel.Normal) {
        for (let index = 0; index < length; index++) {
            if (powerLevel != RcBldPowerLevel.No && index % powerInterval == 0) {
                placePoweredRail()
            } else {
                if (powerLevel == RcBldPowerLevel.Full) {
                    placeUnpoweredPoweredRail();
                } else {
                    placeRail()
                }
            }
            builder.move(FORWARD, 1)
        }
    }

    //% block="Add ramp $direction $distance blocks || changing 1 block vertically every $horiz blocks forward"
    //% distance.defl=10
    //% blockId="rollerCoasterBuilderRamp"
    export function buildRamp(direction: RcBldVerticalDirection, distance: number) {
        if (direction == RcBldVerticalDirection.Up) {
            rampUp(distance);
        }
        else {
            rampDown(distance);
        }
    }

    function rampUp(height: number) {
        for (let index = 0; index <= height; index++) {
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

    //% block="Add $direction turn"
    //% blockId="rollerCoasterBuilderPlaceTurn"
    export function builderPlaceTurn(direction: TurnDirection) {
        rollerCoasterBuilder.placeRail();
        builder.move(FORWARD, 1);
        rollerCoasterBuilder.placeRail();
        builder.turn(direction);
        builder.move(FORWARD, 1);
        rollerCoasterBuilder.placeRail();
        builder.move(FORWARD, 1);
    }

    //% block="Add spiral going $verticalDirection turning $turnDirection with width $width and height $height"
    //% width.min=3 width.defl=3
    //% height.min=1 height.defl=10
    //% blockId="rollerCoasterBuilderPlaceSpiral"
    export function placeSpiral(verticalDirection: RcBldVerticalDirection, turnDirection: TurnDirection, height: number = 10, width: number = 3) {
        let totalHeightDiff = 0
        while (totalHeightDiff < height) {
            let heightChange = verticalDirection == RcBldVerticalDirection.Up && totalHeightDiff == 0 ? width - 1 : width - 2
            if (totalHeightDiff + heightChange > height) {
                heightChange = height - totalHeightDiff
            }

            if (heightChange == 0) return; // Error
            rollerCoasterBuilder.buildRamp(verticalDirection, heightChange)
            totalHeightDiff += heightChange

            if (verticalDirection == RcBldVerticalDirection.Up) {
                // Unpower the final rail in the ramp, so it can turn
                builder.move(BACK, 1)
                rollerCoasterBuilder.placeRail()
            }

            // Turn (unless we're done, in which case allow track to continue straight)
            if (totalHeightDiff != height) {
                builder.turn(turnDirection)
            }

            if (verticalDirection == RcBldVerticalDirection.Up) {
                builder.move(FORWARD, 1)
            }
        }
    }

    //% block="Add free fall of height $height"
    //% height.min=4 height.max=384 height.defl=10
    //% blockId="rollerCoasterBuilderPlaceFreefall"
    export function placeFreeFall(height: number) {
        // Height min 4, max world height?
        // Clear out free-fall area
        let startPos = builder.position()
        builder.move(UP, 2)
        builder.mark()
        builder.move(FORWARD, 2)
        builder.move(DOWN, height + 2)
        builder.fill(AIR)
        builder.teleportTo(startPos)

        // Create wall to stop cart from moving forwards once it's off the track
        placeRail()
        builder.move(FORWARD, 2)
        builder.mark()
        builder.move(UP, 2)
        builder.fill(railBase, FillOperation.Keep)

        // We need a bit of a ramp at the bottom to get moving again.
        builder.move(BACK, 2)
        builder.move(DOWN, height)
        placeUnpoweredPoweredRail()
        builder.move(FORWARD, 1)
        builder.move(DOWN, 1)
        placePoweredRail()
        builder.move(FORWARD, 1)
        builder.move(DOWN, 1)
        placeUnpoweredPoweredRail()
    }

    //% group="Customization"
    //% block
    //% blockType.shadow=minecraftBlock
    //% blockId="rollerCoasterBuilderSetBaseBlock"
    export function setRollerCoasterBaseBlock(blockType: number) {
        railBase = blockType
    }

    //% group="Customization"
    //% block="set normal power interval to $interval"
    //% interval.defl=5 interval.min=1 interval.max=8
    //% blockId="rollerCoasterBuilderSetPowerInterval"
    export function setNormalPowerInterval(interval: number = 5) {
        powerInterval = interval
    }

    //% group="Builder Helpers"
    //% block="builder face same direction as player"
    //% blockType.shadow=minecraftBlock
    //% blockId="rcBuilderHelpersFacePlayer"
    export function builderFacePlayerDirection() {
        builder.face(positions.toCompassDirection(player.getOrientation()))
    }
}
