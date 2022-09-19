//% color="#AA278D" weight=100 block="Roller Coaster"
namespace rollerCoasterBuilder {
    let railBase = PLANKS_OAK

    //% block="Place powered rail at position %position"
    //% position.shadow=minecraftAgentSixDirection
    export function CreatePoweredRail(position: Position) {
        CreateRailInternal(position, REDSTONE_BLOCK, POWERED_RAIL)
    }

    //% block="Place rail at position %position"
    //% position.shadow=minecraftAgentSixDirection
    export function CreateRail(position: Position) {
        CreateRailInternal(position, railBase, RAIL)
    }

    //% block
    //% blockType.shadow=minecraftBlock
    //% blockType.defl=PLANKS_OAK
    export function SetRollerCoasterBaseBlock(blockType: number) {
        railBase = blockType
    }

    function CreateRailInternal(position: Position, baseBlock: number, railBlock: number) {
        blocks.place(baseBlock, position)
        blocks.place(railBlock, position.move(CardinalDirection.Up, 1))
    }
}