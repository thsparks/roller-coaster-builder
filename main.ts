//% color="#9C5F9B" weight=100 block="Roller Coaster" icon="\uf3ff"
namespace rollerCoasterBuilder {
    let railBase = PLANKS_OAK

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
    //% powerInterval.defl=5 powerInterval.min=1 powerInterval.max=9
    //% blockId="rollerCoasterBuilderPlaceLine"
    export function placeLine(length: number, powerInterval: number = 5) {
        for (let index = 0; index < length; index++) {
            if (index % powerInterval == 0) {
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
                placeRailInternal(builder.position(), railBase, POWERED_RAIL)
            }
            builder.move(FORWARD, 1)
        }
    }

    function placeRailInternal(position: Position, baseBlock: number, railBlock: number) {
        blocks.place(baseBlock, position)
        blocks.place(railBlock, position.move(CardinalDirection.Up, 1))
    }

    //% group="Customization"
    //% block
    //% blockType.shadow=minecraftBlock
    //% blockId="rollerCoasterBuilderSetBaseBlock"
    export function SetRollerCoasterBaseBlock(blockType: number) {
        railBase = blockType
    }
}

//% color="#9C5F9B" block="Builder Helpers" advanced=true
namespace builderHelpers {
    //% block="builder face same direction as player"
    //% blockType.shadow=minecraftBlock
    //% blockId="rcBuilderHelpersFacePlayer"
    export function builderFacePlayerDirection() {
        builder.face(positions.toCompassDirection(player.getOrientation()))
    }
}