//% color="#AA278D" weight=100 block="Roller Coaster"
namespace rollerCoasterBuilder {
    let railBase = PLANKS_OAK

    //% block="place rail at position $position"
    //% position.shadow=minecraftCreatePosition
    //% blockId="rollerCoasterBuilderPlaceRail"
    export function PlaceRail(position: Position) {
        placeRailInternal(position, railBase, RAIL)
    }

    //% block="place powered rail at position $position"
    //% position.shadow=minecraftCreatePosition
    //% blockId="rollerCoasterBuilderPlacePoweredRail"
    export function placePoweredRail(position: Position) {
        placeRailInternal(position, REDSTONE_BLOCK, POWERED_RAIL)
    }

    //% block="place powered straight line starting at $position of length $length"
    //% position.shadow=minecraftCreatePosition
    //% length.defl=9 length.min=1 length.max=17
    //% blockId="rollerCoasterBuilderPlacePoweredLine"
    export function placePoweredLine(position: Position, length: number) {
        builder.teleportTo(posCamera(0, -1, 1))
        builder.face(positions.toCompassDirection(player.getOrientation()))
        for (let index = 0; index < length; index++) {
            if (index == Math.floor(length / 2)) {
                rollerCoasterBuilder.placePoweredRail(builder.position())
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