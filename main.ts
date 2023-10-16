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

    //% block="add single rail to track"
    //% blockId="rollerCoasterBuilderPlaceRail" weight=65
    export function placeRail() {
        placeRailInternal(builder.position(), railBase, RAIL)
    }

    //% block="add single powered rail to track"
    //% blockId="rollerCoasterBuilderPlacePoweredRail" weight=70
    export function placePoweredRail() {
        placeRailInternal(builder.position(), REDSTONE_BLOCK, POWERED_RAIL)
    }

    // Intentionally not exposed, as it's a bit confusing...
    function placeUnpoweredPoweredRail() {
        placeRailInternal(builder.position(), railBase, POWERED_RAIL)
    }

    function placeAirAbove(position: Position, start: number, dist: number) {
        for (let i = 0; i <= dist - 1; i++) {
            // Check for air first or we get a bunch of "cannot place block" errors.
            const pos = position.move(CardinalDirection.Up, i + start)
            if (!blocks.testForBlock(AIR, pos)) {
                blocks.place(AIR, pos)
            }
        }
    }

    function placeRailInternal(position: Position, baseBlock: number, railBlock: number) {
        blocks.place(baseBlock, position)
        blocks.place(railBlock, position.move(CardinalDirection.Up, 1))

        // Need two air blocks so player can fit if the track tunnels (or intersects with something).
        placeAirAbove(position, 2, 2)
    }

    function getButtonAuxForDirection(direction: CompassDirection) {
        switch (direction) {
            case CompassDirection.North:
                return 5;
            case CompassDirection.East:
                return 3;
            case CompassDirection.South:
                return 4;
            case CompassDirection.West:
                return 2;
            default:
                return 0;
        }
    }

    //% block="begin track at $position heading $direction"
    //% position.shadow=minecraftCreatePosition
    //% direction.defl=CompassDirection.North
    //% powerLevel.defl=RcBldPowerLevel.Normal
    //% blockId="rollerCoasterBuilderBeginTrack" weight=100
    export function placeTrackStart(position: Position, direction: CompassDirection) {
        // Block presets
        let btnBkgBlock = PINK_CONCRETE
        let nonBtnBkgBlock = BLOCK_OF_QUARTZ
        let rampBlock = QUARTZ_SLAB
        let btn = WARPED_BUTTON
        let btnAux = getButtonAuxForDirection(direction)

        builder.teleportTo(position)
        builder.face(direction)

        // Rails
        placeUnpoweredPoweredRail()
        builder.move(FORWARD, 1)
        placeUnpoweredPoweredRail()
        builder.move(FORWARD, 1)
        placeRail()

        // Ramp
        builder.move(RIGHT, 1)
        builder.place(rampBlock)
        placeAirAbove(builder.position(), 1, 3)
        builder.move(BACK, 1)
        builder.place(rampBlock)
        placeAirAbove(builder.position(), 1, 3)
        builder.move(BACK, 1)
        builder.place(rampBlock)
        placeAirAbove(builder.position(), 1, 3)

        // Non-Button Background
        builder.move(BACK, 1)
        builder.mark()
        builder.move(LEFT, 1)
        builder.raiseWall(nonBtnBkgBlock, 4)

        // Btn Background
        builder.move(LEFT, 1)
        builder.mark()
        builder.move(LEFT, 1)
        builder.raiseWall(btnBkgBlock, 4)
        builder.mark()
        builder.move(FORWARD, 3)
        builder.raiseWall(btnBkgBlock, 4)
        builder.move(RIGHT, 1)
        builder.place(btnBkgBlock)
        placeAirAbove(builder.position(), 1, 3)
        builder.move(BACK, 1)
        builder.place(btnBkgBlock)
        placeAirAbove(builder.position(), 1, 3)
        builder.move(BACK, 1)
        builder.place(btnBkgBlock)
        placeAirAbove(builder.position(), 1, 3)

        // Redstone
        builder.move(UP, 1)
        builder.place(REDSTONE_WIRE)

        // Button
        builder.move(UP, 1)
        player.say(btn + ":" + btnAux)
        builder.place(blocks.blockWithData(btn, btnAux))

        // Minecart
        // builder.shift(0, -1, -1)
        // builder.place(MINECART)
        mobs.give(mobs.target(LOCAL_PLAYER), MINECART, 1)

        // Set builder location for next piece of track
        builder.shift(3, -2, -1)
    }

    //% block="place track end"
    //% position.shadow=minecraftCreatePosition
    //% direction.defl=CompassDirection.North
    //% powerLevel.defl=RcBldPowerLevel.Normal
    //% blockId="rollerCoasterBuilderPlaceEndTrack" weight=99
    export function placeTrackEnd() {
        placeUnpoweredPoweredRail()
        builder.move(FORWARD, 1)
        builder.place(railBase)
        builder.move(UP, 1)
        builder.place(railBase)
        builder.shift(1, -1, 0)
    }

    //% block="add straight line of length $length || with $powerLevel power"
    //% length.defl=10 length.min=1
    //% powerLevel.defl=RcBldPowerLevel.Normal
    //% blockId="rollerCoasterBuilderPlaceLine" weight=95
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

    //% block="add ramp $direction $distance blocks || changing 1 block vertically every $horizSpace blocks forward"
    //% distance.defl=10
    //% blockId="rollerCoasterBuilderRamp" weight=90
    export function buildRamp(direction: RcBldVerticalDirection, distance: number, horizSpace: number) {
        if (direction == RcBldVerticalDirection.Up) {
            rampUp(distance, horizSpace);
        }
        else {
            rampDown(distance, horizSpace);
        }
    }

    function rampUp(height: number, horizSpace: number) {
        let unpoweredBlocksPlaced = 8; // Set to 8 so first block is powered.
        for (let currentHeight = 0; currentHeight <= height; currentHeight++) {
            for (let currentHoriz = 0; currentHoriz < horizSpace; currentHoriz++) {
                if (currentHeight > 0) {
                    if (fillTrack) {
                        builder.mark()
                        builder.move(UP, currentHeight - 1)
                        builder.fill(railBase)
                        builder.move(UP, 1)
                    } else {
                        builder.move(UP, currentHeight);
                    }
                }
                if (unpoweredBlocksPlaced >= 8) {
                    rollerCoasterBuilder.placePoweredRail()
                    unpoweredBlocksPlaced = 0
                } else {
                    placeUnpoweredPoweredRail()
                    unpoweredBlocksPlaced++
                }
                builder.move(FORWARD, 1)
                builder.move(DOWN, currentHeight)
            }
        }
        builder.move(UP, height)
    }

    function rampDown(descentDistance: number, horizSpace: number) {
        for (let currentDescent = 0; currentDescent <= descentDistance; currentDescent++) {
            for (let currentHoriz = 0; currentHoriz < horizSpace; currentHoriz++) {
                // Place powered at start only if needed, then every powerInterval blocks.
                // Only needed on first descent level since the rest have the downhill to speed up.
                let powerAtStart = currentDescent == 0 && horizSpace >= powerInterval;
                if ((currentHoriz + (powerAtStart ? 0 : 1)) % powerInterval == 0) {
                    placePoweredRail()
                }
                else {
                    placeRail()
                }
                builder.move(FORWARD, 1)
            }
            builder.move(DOWN, 1)
        }

        // Undo the final down movement, since we didn't actually place a block.
        builder.move(UP, 1)
    }

    //% block="add $direction turn"
    //% blockId="rollerCoasterBuilderPlaceTurn" weight=85
    export function builderPlaceTurn(direction: TurnDirection) {
        rollerCoasterBuilder.placeRail();
        builder.move(FORWARD, 1);
        rollerCoasterBuilder.placeRail();
        builder.turn(direction);
        builder.move(FORWARD, 1);
        rollerCoasterBuilder.placeRail();
        builder.move(FORWARD, 1);
    }

    //% block="add spiral going $verticalDirection turning $turnDirection with width $width and height $height"
    //% width.min=3 width.defl=3
    //% height.min=1 height.defl=10
    //% blockId="rollerCoasterBuilderPlaceSpiral" weight=80
    export function placeSpiral(verticalDirection: RcBldVerticalDirection, turnDirection: TurnDirection, height: number = 10, width: number = 3) {
        let totalHeightDiff = 0
        while (totalHeightDiff < height) {
            let heightChange = verticalDirection == RcBldVerticalDirection.Up && totalHeightDiff == 0 ? width - 1 : width - 2
            if (totalHeightDiff + heightChange > height) {
                heightChange = height - totalHeightDiff
            }

            if (heightChange == 0) return; // Error
            rollerCoasterBuilder.buildRamp(verticalDirection, heightChange, 1)
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

    //% block="add free fall of height $height"
    //% height.min=4 height.max=384 height.defl=10
    //% blockId="rollerCoasterBuilderPlaceFreefall" weight=75
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
}
