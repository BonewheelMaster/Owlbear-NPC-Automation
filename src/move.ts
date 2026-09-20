import OBR, { Vector2 } from "@owlbear-rodeo/sdk";

import * as state from "./state";
import * as util from "./util";

export async function moveAll() {
    const items = await OBR.scene.items.getItems();
    const npcs = util.filterNPCs(items);

    // TODO handle other grid types, namely hexes
    // NOTE Beeline strategy
    // TODO handle collision
    const dpi = await OBR.scene.grid.getDpi();
    const stepSize = 5; // TODO hardcoded
    let newPositions : Record<string, Vector2> = {};

    for (let npc of npcs) { // This is done outside of the updateItems because it is async.
        newPositions[npc.id] = await OBR.scene.grid.snapPosition(npc.position, 1, false, true);

        const target = util.getTarget(items, npc.meta.target);
        if (target === null) { continue; }

        let expendedMovement = 0;
        while (!(expendedMovement + stepSize > npc.meta.speed)) {
            const action = (npc.meta.kind == state.MELEE)
                    ? await meleeBasicMove(newPositions[npc.id], target.position
                        , newPositions)
                    : await rangedBasicMove(newPositions[npc.id], target.position
                        , npc.meta.range, newPositions);

            if (action.gridType == "Square" && action.movement == "Stand") { break; } // TODO other grids

            newPositions[npc.id] = move(dpi, newPositions[npc.id], action);
            expendedMovement += stepSize
        }
    }
    OBR.scene.items.updateItems(npcs, (nn) => {
        for (let npc of nn) {
            const target = util.getTarget(items, npc.meta.target);
            if (target === null) { continue; }
            npc.position = newPositions[npc.id];
        }
    });
}

type Strategy = (pos : Vector2, targetPos : Vector2) => Promise<Action>;
type Action = SquareAction; // | ...
type SquareAction = {
    gridType : "Square";
    movement : "Stand" | "N" | "NW" | "W" | "SW" | "S" | "SE" | "E" | "NE";
}

// TODO make these uniform, and have them handle more of the movement responsibility

// Beeline strategy, TODO with left turns when running into something.
async function meleeBasicMove(pos : Vector2, targetPos : Vector2
        , newPositions : Record<string, Vector2> ) : Promise<Action>
{
    // TODO use newPositions for collision
    const tpos = await OBR.scene.grid.snapPosition(targetPos, 1, false, true);

    const dpi = await OBR.scene.grid.getDpi();
    if (util.distance(pos, tpos) < 2*dpi) {
        return { gridType : "Square", movement: "Stand" };
    }

    // TODO handle other grid types, namely hexes
    // TODO handle collision
    const angle = Math.atan2( tpos.y - pos.y
                            , tpos.x - pos.x);
    return angleToAction(angle, "Square");
}

// TODO other grid types
// TODO other step sizes
async function rangedBasicMove(pos : Vector2, targetPos : Vector2, range : number
    , newPositions : Record<string, Vector2> ) : Promise<Action>
{
    const stepSize = 5;

    const tpos = await OBR.scene.grid.snapPosition(targetPos, 1, false, true);

    const dpi = await OBR.scene.grid.getDpi();
    if (util.distance(pos, tpos) < (1+(range / stepSize))*dpi) {
        return { gridType : "Square", movement: "Stand" };
    }
    return meleeBasicMove(pos, targetPos, newPositions);
}

// TODO handle collision
function move(speed : number, pos : Vector2, action : Action) : Vector2 {
    let newPos = pos;
    switch (action.gridType) {
        case "Square": switch (action.movement) {
            case "Stand": break;
            case "N"    : newPos = { ...pos, y : pos.y -= speed                     }; break;
            case "NW"   : newPos = { ...pos, y : pos.y -= speed, x : pos.x -= speed }; break;
            case "W"    : newPos = { ...pos, x : pos.x -= speed                     }; break;
            case "SW"   : newPos = { ...pos, y : pos.y += speed, x : pos.x -= speed }; break;
            case "S"    : newPos = { ...pos, y : pos.y += speed                     }; break;
            case "SE"   : newPos = { ...pos, y : pos.y += speed, x : pos.x += speed }; break;
            case "E"    : newPos = { ...pos, x : pos.x += speed                     }; break;
            case "NE"   : newPos = { ...pos, y : pos.y -= speed, x : pos.x += speed }; break;
        }
    }
    return newPos
}

function angleToAction(angle : number, gridType : "Square") : Action { // TODO other grids
    const x = Math.round(Math.cos(angle));
    const y = -Math.round(Math.sin(angle));

    let result = "";
    switch (y) {
        case  1: result += "N"; break;
        case  0:                break;
        case -1: result += "S"; break;
    }
    switch (x) {
        case -1: result += "W"; break;
        case  0:                break;
        case  1: result += "E"; break;
    }
    if (result == "") { return { gridType : gridType, movement : "Stand" }; }
    return { gridType : gridType, movement : result } as Action;
}
