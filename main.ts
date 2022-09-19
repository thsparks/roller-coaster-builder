function CreatePoweredRail (position: Position) {
    CreateRailInternal(position, REDSTONE_BLOCK, POWERED_RAIL)
}
function CreateRailInternal (position: Position, baseBlock: number, railBlock: number) {
    blocks.place(baseBlock, position)
    blocks.place(railBlock, position.move(CardinalDirection.Up, 1))
}
function CreateRail (position: Position) {
    CreateRailInternal(position, RailBase, RAIL)
}
let RailBase = 0
RailBase = PLANKS_OAK
