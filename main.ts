//% color="#AA278D" weight=100 block="Roller Coaster"
namespace rollerCoasterBuilder {
    let railBase = PLANKS_OAK

    //% block
    export function CreatePoweredRail(position: Position) {
        CreateRailInternal(position, REDSTONE_BLOCK, POWERED_RAIL)
    }

    //% block
    export function CreateRail(position: Position) {
        CreateRailInternal(position, railBase, RAIL)
    }

    //% block
    //% blockType.shadow=minecraftBlock
    export function SetRollerCoasterBaseBlock(blockType: number) {
        railBase = blockType
    }

    function CreateRailInternal(position: Position, baseBlock: number, railBlock: number) {
        blocks.place(baseBlock, position)
        blocks.place(railBlock, position.move(CardinalDirection.Up, 1))
    }
}