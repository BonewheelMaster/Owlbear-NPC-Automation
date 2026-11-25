import * as OBR from "./obr-api";
import { Vector2, Item, GridType } from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import { NPC } from "./npc";
import * as npc from "./npc";
import * as util from "./util";

export async function moveAll() : Promise<void> {
    const [items, grid] = await Promise.all([OBR.getItems(), OBR.getGrid()]);

    let newItems = await snapAllNPCs(items);
    for (let item of newItems) {
        if (! npc.validMetadata(item.metadata[pre.ID])) { continue; }
        item.position = move(newItems, { ...item, meta: item.metadata[pre.ID] }, grid);
    }
    OBR.setItems(items, newItems);
}
export async function moveOne(n : NPC) : Promise<void> {
    console.log("moving");
    const [items, grid] = await Promise.all([OBR.getItems(), OBR.getGrid()]);

    const newPos = await OBR.snapToGrid(n.position);
    OBR.setItems([n], [{ ...n, position: move(items, { ...n, position: newPos }, grid) }]);
}
function move(items : Item[], n : NPC, grid : OBR.Grid) : Vector2 {
    const actions = (() => {
        switch (n.meta.kind) {
            case npc.MELEE: {
                return meleeBasic(items, n.position, n.meta, grid);
            }
            case npc.RANGED: {
                return rangedBasic(items, n.position, n.meta, grid);
            }
        }
    })();
    let newPos    = n.position;
    let newPosTry = null;
    for (let i = 0; i < n.meta.speed / 5; i++) { // TODO hardcoded step size
        const action = actions[i];
        if (action === undefined) { break; }

        newPosTry = push(grid.dpi, newPos, action);
        if (occupied(items, newPosTry, grid)) { break; }
        newPos = newPosTry;
    }
    return newPos;
}
async function snapAllNPCs(items : Item[]) : Promise<Item[]> {
    return Promise.all(items.map((item) => {
        if (! npc.validMetadata(item.metadata[pre.ID])) { return item; }
        return OBR.snapToGrid(item.position)
            .then((newPos) => { return { ...item, position: newPos }; });
    }));
}

// Does not snap items to grid.
//
// A position is occupied if there is an item within half dpi of it.
function occupied(items : Item[], pos : Vector2, grid : OBR.Grid) : boolean {
    return items.some((i) => i.layer == "CHARACTER" && distanceInActions(grid, i.position, pos) < 0.5);
}

function distance(pos1 : Vector2, pos2 : Vector2) : number {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
}
// Rotate a point anticlockwise, and then return its x coordinate.
// Angle is in degrees.
function rotateToX(pos : Vector2, angle : number) : number {
    return Math.cos(degToRad(angle))*pos.x - Math.sin(degToRad(angle))*pos.y
}
function toHexCoord(pos : Vector2, vertical : boolean) : [number, number, number] {
    // Rotate each axis on the cube coordinate system to find it on the square system.
    // https://www.redblobgames.com/grids/hexagons/#coordinates-cube
    if (vertical) {
        return [pos.x, rotateToX(pos, 240), rotateToX(pos,120)]
    }
    return [rotateToX(pos, 330), rotateToX(pos, 210), rotateToX(pos,90)]
}
// The number of actions it would take to go from pos1 to pos2.
//
// O(1); does not do any simulation, and does not consider obstructions.
// Intended for traversing whole squares/hexes.
function distanceInActions(grid : OBR.Grid, pos1 : Vector2, pos2 : Vector2) : number {
    // TODO other grids
    switch (grid.type) {
        case "SQUARE": {
            const delta_x = Math.abs(pos1.x - pos2.x) / grid.dpi;
            const delta_y = Math.abs(pos1.y - pos2.y) / grid.dpi;
            return Math.max(delta_x, delta_y);
        }
        // TODO broken
        case "HEX_HORIZONTAL": {
            const hexPos1 = toHexCoord(pos1, false);
            const hexPos2 = toHexCoord(pos2, false);
            return Math.max(Math.abs(hexPos1[0] - hexPos2[0]) / grid.dpi,
                            Math.abs(hexPos1[1] - hexPos2[1]) / grid.dpi,
                            Math.abs(hexPos1[2] - hexPos2[2]) / grid.dpi);
        }
        case "HEX_VERTICAL": {
            const hexPos1 = toHexCoord(pos1, true);
            const hexPos2 = toHexCoord(pos2, true);
            return Math.max(Math.abs(hexPos1[0] - hexPos2[0]) / grid.dpi,
                            Math.abs(hexPos1[1] - hexPos2[1]) / grid.dpi,
                            Math.abs(hexPos1[2] - hexPos2[2]) / grid.dpi);
        }
    }
    // Should never reach here.
    return 0;
}

type Action = SquareAction | HexVertAction | HexHorizAction | DimetricAction
    | IsometricAction

type SquareAction = {
    gridType : "SQUARE";
    movement : "Stand" | "N" | "W" | "S" | "E" | "NW" | "SW" | "SE" | "NE";
}
type HexHorizAction = {
    gridType : "HEX_HORIZONTAL";
    movement : "Stand" | "U" | "UL" | "DL" | "D" | "DR" | "UR";
}
type HexVertAction = {
    gridType : "HEX_VERTICAL";
    movement : "Stand" | "UL" | "L" | "DL" | "DR" | "R" | "UR";
}
type DimetricAction = {
    gridType : "DIMETRIC";
    movement : "Stand" | "N" | "NW" | "W" | "SW" | "S" | "SE" | "E" | "NE";
}
type IsometricAction = {
    gridType : "ISOMETRIC";
    movement : "Stand" | "N" | "NW" | "W" | "SW" | "S" | "SE" | "E" | "NE";
}

function push(speed : number, pos : Vector2, action : Action) : Vector2 {
    const nn = neighbors(action.gridType, speed, pos);
    let directionMap = new Map();
    directionMap.set("Stand", pos);
    switch (action.gridType) {
        case "SQUARE":
            directionMap.set("N" , nn[0]);
            directionMap.set("W" , nn[1]);
            directionMap.set("S" , nn[2]);
            directionMap.set("E" , nn[3]);
            directionMap.set("NW", nn[4]);
            directionMap.set("SW", nn[5]);
            directionMap.set("SE", nn[6]);
            directionMap.set("NE", nn[7]);
            break;
        case "HEX_HORIZONTAL":
            directionMap.set("U" , nn[0]);
            directionMap.set("UL", nn[1]);
            directionMap.set("DL", nn[2]);
            directionMap.set("D" , nn[3]);
            directionMap.set("DR", nn[4]);
            directionMap.set("UR", nn[5]);
            break;
        case "HEX_VERTICAL":
            directionMap.set("UL", nn[0]);
            directionMap.set("L" , nn[1]);
            directionMap.set("DL", nn[2]);
            directionMap.set("DR", nn[3]);
            directionMap.set("R" , nn[4]);
            directionMap.set("UR", nn[5]);
            break;

        // TODO
    }
    return directionMap.get(action.movement);
}
function roundTo(toRound : number, to : number) {
    return Math.round(toRound / to) * to;
}
// Angle is in degrees
function angleToAction(angle : number, gridType : GridType) : Action {
    let result = "";
    switch (gridType) {
        case "SQUARE":
            switch (roundTo(angle, 45)) {
                case   90: result = "N" ; break;
                case  180: result = "W" ; break;
                case -180: result = "W" ; break;
                case - 90: result = "S" ; break;
                case    0: result = "E" ; break;
                case  135: result = "NW"; break;
                case -135: result = "SW"; break;
                case - 45: result = "SE"; break;
                case   45: result = "NE"; break;
            } break;
        case "HEX_HORIZONTAL":
            switch (roundTo(angle, 30)) {
                case  90 : result = "U" ; break;
                case  150: result = "UL"; break;
                case -150: result = "DL"; break;
                case - 90: result = "D" ; break;
                case - 30: result = "DR"; break;
                case   30: result = "UR"; break;
            } break;
        case "HEX_VERTICAL":
            switch (roundTo(angle, 30)) {
                case  120: result = "UL"; break;
                case  180: result = "L" ; break;
                case -180: result = "L" ; break;
                case -120: result = "DL"; break;
                case - 60: result = "DR"; break;
                case    0: result = "R" ; break;
                case   60: result = "UR"; break;
            } break;
        // TODO
    }
    if (result == "") { return { gridType: gridType, movement: "Stand" }; }
    return { gridType: gridType, movement: result } as Action;
}

type Strategy<ai> = (items : Item[], pos : Vector2, npcAI : ai, grid : OBR.Grid) => Action[];

const meleeBasic : Strategy<npc.MeleeAI> = (items, pos, nai, grid) => {
    return rangedBasic(items, pos, { ...nai, kind: npc.RANGED, range: 5 }, grid); // TODO hardcoded step size
};
// Looks for the path for up to half a second. This is so we don't look for the target forever.
const rangedBasic : Strategy<npc.RangedAI> = (items, pos, nai, grid) => {
    const target = util.getTarget(items, nai.target);
    if (target === null) { return [{ gridType : grid.type, movement : "Stand" }]; }
    //console.log("dist: " + distanceInActions(grid, pos, target.position));
    //console.log(toHexCoord(pos, false));

    const actions = aStar(items, grid, pos, target.position, 0.5);
    // We only wish to get within range.
    let minActions = [];
    let currentPos = pos;
    for (const action of actions) {
        //                              TODO hardcoded step size V
        if (distance(currentPos, target.position) <= nai.range / 5 * grid.dpi) { break; }

        currentPos = push(grid.dpi, currentPos, action);
        minActions.push(action);
    }
    return minActions;
};

function findPos(pos : Vector2, vv : [Vector2, Vector2, number][])
    : [Vector2, Vector2, number] | null
{
    const found = vv.find((v) => v[0].x == pos.x && v[0].y == pos.y);
    if (found === undefined) { return null; }
    return found;
}
// TODO make faster by using binary search
// Inserts such that the resulting list, if initially so, will be in descending
// order of the first element of each tuple.
function sortedInsert<A>(v : A, vv : A[], f : (v1 : A, v2 : A) => boolean)
    : A[]
{
    for (let i = 0; i < vv.length; i++) {
        if (f(vv[i], v)) {
            return vv.toSpliced(i, 0, v);
        }
    }
    return vv.concat([v]);
}

// Return the shortest path using a simple a*.
//
// The type of action given will match the type of grid.
// Does not consider difficult terrain, and assumes that moving diagonally on squares
// is the same as other directions.
// If there is no valid path, will return a single stand action.
// Might return a path that would collide near the end, so the npc can at least
// get close when the target is surrounded.
// Will not continue calculating past maxTime, in seconds.
function aStar(items : Item[], grid : OBR.Grid, pos : Vector2, target : Vector2,
    maxTime : number) : Action[]
{
    const startTime      = Date.now();
    const surroundLevel  = getSurroundLevel(items, grid, target);
    //console.log("surround: " + surroundLevel);
    const comparisonFunc = (v : [Vector2, any, number], n : [Vector2, any, number]) =>
           distanceInActions(grid, v[0], target) + v[2]
        <= distanceInActions(grid, n[0], target) + n[2]

    // The 3-tuples of a position, its parent, and the cost to reach it
    // Always sorted in descending order of the heuristic plus the cost to reach.
    let open   : [Vector2, Vector2, number][] = [[pos, pos, 0]];
    // The 3-tuples of a position, its parent, and the cost to reach it
    let closed : [Vector2, Vector2, number][] = [];

    while (true) {
        if (Date.now() - startTime > maxTime * 1000) { break; }
        const current = open.pop();
        if (current === undefined) { break; }
        closed.push(current);
        if (distanceInActions(grid, current[0], target) < 1) {
            return tracePath(grid.type, closed, current[0], pos);
        }

        for (const n of neighbors(grid.type, grid.dpi, current[0])) {
            if (occupied(items, n, grid)
                && ! (distanceInActions(grid, n, target) <= surroundLevel + 0.5))
            { continue; }
            const newCost = distanceInActions(grid, current[0], n) + current[2];

            const nOpen = findPos(n, open);
            const nClosed = findPos(n, closed);
            if (nClosed !== null && newCost < nClosed[2]) {
                closed = closed.filter((v) => v[0] != n);
                open   = sortedInsert([n, current[0], newCost], open, comparisonFunc);
                continue;
            }

            if (nOpen !== null && newCost < nOpen[2]) {
                open = open.filter((v) => v[0] != n);
                open = sortedInsert([n, current[0], newCost], open, comparisonFunc);
                continue;
            }
            if (nOpen === null && nClosed === null) {
                open = sortedInsert([n, current[0], newCost], open, comparisonFunc);
                continue;
            }
        }
    }
    return [{ gridType : grid.type, movement : "Stand" }];
}
function reached(vv : Vector2[], v : Vector2) : boolean {
    return vv.some((v2) => v.x == v2.x && v.y == v2.y);
}
function getSurroundLevel(items : Item[], grid : OBR.Grid, target : Vector2) : number {
    let frontier : Vector2[] = [target];
    while (true) {
        const current = frontier.shift()
        if (current === undefined) {
            // Frontier shouldn't ever be empty, as we're always adding elements
            return 0;
        }
        for (const n of neighbors(grid.type, grid.dpi, current)) {
            if (! occupied(items, n, grid)) {
                //console.log("total " + total);
                //console.log(n);
                const a = distanceInActions(grid, target, n) - 1
                //console.log(a);
                return Math.round(a);
            }
            if (! reached(frontier, n)) {
                frontier.push(n);
            }
        }
    }
}
// If there is no valid path, will return a single stand action.
function tracePath(gridType : GridType, from : [Vector2, Vector2, number][],
    target : Vector2, pos : Vector2) : Action[]
{
    let currentPos = target;
    let path       = [];

    //console.log(from);
    while (currentPos != pos) {
        const prevPos = findPos(currentPos, from);

        if (prevPos !== null) {
            //                       Negative because owlbear's y axis is flipped.
            const angle = Math.atan2(-(currentPos.y - prevPos[1].y), currentPos.x - prevPos[1].x);
            path.push(angleToAction(radToDeg(angle), gridType));
            currentPos = prevPos[1];
        }
        else { return [{ gridType : gridType, movement : "Stand" }]; }
    }
    path.reverse();
    //console.log(path);
    return path;
}
function degToRad(deg : number) : number {
    return Math.PI/180 * deg;
}
function radToDeg(rad : number) : number {
    return 180/Math.PI * rad
}
function neighbors(gridType : GridType, dpi : number, pos : Vector2) : Vector2[] {
    let relPos : Vector2[] = [];
    switch (gridType) {
        case "SQUARE":
            relPos = [
                { x:  0, y:  1 },
                { x: -1, y:  0 },
                { x:  0, y: -1 },
                { x:  1, y:  0 },
                { x: -1, y:  1 },
                { x: -1, y: -1 },
                { x:  1, y: -1 },
                { x:  1, y:  1 }
            ]; break;
        case "HEX_HORIZONTAL": {
            const angles = [90, 150, 210, 270, 330, 30].map(degToRad);
            relPos = angles.map((a) => { return { x: Math.cos(a), y: Math.sin(a) } });
            break;
        }
        case "HEX_VERTICAL": {
            const angles = [120, 180, 240, 300, 0, 60].map(degToRad);
            relPos = angles.map((a) => { return { x: Math.cos(a), y: Math.sin(a) } });
            break;
        }
        //TODO
    }
    //             Negative because Owlbear's y axis is flipped V
    return relPos.map((r) => { return {x: r.x * dpi + pos.x, y: -r.y * dpi + pos.y }; });
}
