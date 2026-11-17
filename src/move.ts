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
    const [items, grid] = await Promise.all([OBR.getItems(), OBR.getGrid()]);

    OBR.updateItems(() => { return { ...n, position: move(items, n, grid) }; }, [n]);
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
        if (occupied(items, newPosTry, grid.dpi)) { break; }
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
function occupied(items : Item[], pos : Vector2, dpi : number) : boolean {
    return items.some((i) => i.layer == "CHARACTER" && distance(i.position, pos) <= dpi / 2);
}

function distance(pos1 : Vector2, pos2 : Vector2) : number {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
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
    }
    // Should never reach here.
    return 0;
}

type Action = SquareAction | HexVertAction | HexHorizAction | DimetricAction
    | IsometricAction

type SquareAction = {
    gridType : "SQUARE";
    movement : "Stand" | "N" | "NW" | "W" | "SW" | "S" | "SE" | "E" | "NE";
}
type HexVertAction = {
    gridType : "HEX_VERTICAL";
    movement : "Stand" | "UL" | "L" | "DL" | "DR" | "R" | "UR";
}
type HexHorizAction = {
    gridType : "HEX_HORIZONTAL";
    movement : "Stand" | "U" | "UL" | "DL" | "D" | "DR" | "UR";
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
    let newPos = { x: 0, y: 0 };
    Object.assign(newPos, pos);
    switch (action.gridType) {
        case "SQUARE": {
            switch (action.movement) {
                case "Stand":                                       break;
                case "N"    :                    newPos.y -= speed; break;
                case "NW"   : newPos.x -= speed; newPos.y -= speed; break;
                case "W"    : newPos.x -= speed;                    break;
                case "SW"   : newPos.x -= speed; newPos.y += speed; break;
                case "S"    :                    newPos.y += speed; break;
                case "SE"   : newPos.x += speed; newPos.y += speed; break;
                case "E"    : newPos.x += speed;                    break;
                case "NE"   : newPos.x += speed; newPos.y -= speed; break;
            }
        }
        // TODO
    }
    return newPos;
}
function angleToAction(angle : number, gridType : GridType) : Action {
    const x = Math.round(Math.cos(angle));
    const y = -Math.round(Math.sin(angle));

    let result = "";
    switch (gridType) {
        case "SQUARE":
            switch (y) {
                case  1: result += "N"; break;
                case  0:                break;
                case -1: result += "S"; break;
            }
            switch (x) {
                case  1: result += "E"; break;
                case  0:                break;
                case -1: result += "W"; break;
            }
        // TODO
    }
    if (result == "") { return { gridType : gridType, movement : "Stand" }; }
    return { gridType : gridType, movement : result } as Action;
}

type Strategy<ai> = (items : Item[], pos : Vector2, npcAI : ai, grid : OBR.Grid) => Action[];

const meleeBasic : Strategy<npc.MeleeAI> = (items, pos, nai, grid) => {
    return rangedBasic(items, pos, { ...nai, kind: npc.RANGED, range: 5 }, grid); // TODO hardcoded step size
};
// Looks for the path for a max of 1 second. This is so we don't look for the target forever.
const rangedBasic : Strategy<npc.RangedAI> = (items, pos, nai, grid) => {
    const target = util.getTarget(items, nai.target);
    if (target === null) { return [{ gridType : grid.type, movement : "Stand" }]; }

    const actions = aStar(items, grid, pos, target.position, 1);
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
    : A[] {
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
            // TODO rename
            return tracePath(grid.type, closed, current[0], pos);
        }

        for (const n of neighbors(grid, current[0])) {
            if (occupied(items, n, grid.dpi)
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
function getSurroundLevel(items : Item[], grid : OBR.Grid, target : Vector2) : number {
    let level = 0;
    while (checkSurrounded(items, grid, target, level + 1)) {
        level++;
    }
    return level;
}
function checkSurrounded(items : Item[], grid : OBR.Grid, target : Vector2,
    level : number) : boolean
{
    const dpi = grid.dpi;

    // TODO other grids
    // Checking the perimeter only of a square with side length level.
    for (let i = -level; i <= level; i++) {
        if (! occupied(items, { x: target.x + i * dpi, y: target.y + level * dpi }, grid.dpi)) {
            return false;
        }
    }
    for (let i = -level; i <= level; i++) {
        if (! occupied(items, { x: target.x + i * dpi, y: target.y - level * dpi }, grid.dpi)) {
            return false;
        }
    }
    for (let i = -level; i <= level; i++) {
        if (! occupied(items, { x: target.x + level * dpi, y: target.y + i * dpi }, grid.dpi)) {
            return false;
        }
    }
    for (let i = -level; i <= level; i++) {
        if (! occupied(items, { x: target.x - level * dpi, y: target.y + i * dpi }, grid.dpi)) {
            return false;
        }
    }
    return true;
}
// If there is no valid path, will return a single stand action.
function tracePath(gridType : GridType, from : [Vector2, Vector2, number][],
    target : Vector2, pos : Vector2) : Action[]
{
    let currentPos = target;
    let path       = [];

    while (currentPos != pos) {
        const prevPos = findPos(currentPos, from);

        if (prevPos !== null) {
            const angle = Math.atan2(currentPos.y - prevPos[1].y, currentPos.x - prevPos[1].x);
            path.push(angleToAction(angle, gridType));
            currentPos = prevPos[1];
        }
        else { return [{ gridType : gridType, movement : "Stand" }]; }
    }
    path.reverse();
    return path;
}
function degToRad(deg : number) : number {
    return Math.PI/180 * deg;
}
function neighbors(grid : OBR.Grid, pos : Vector2) : Vector2[] {
    let relPos : Vector2[] = [];
    switch (grid.type) {
        case "SQUARE":
            relPos = [
                { x:  1, y:  0 },
                { x: -1, y:  0 },
                { x:  0, y:  1 },
                { x:  0, y: -1 },
                { x:  1, y:  1 },
                { x: -1, y:  1 },
                { x:  1, y: -1 },
                { x: -1, y: -1 }
            ]; break;
        //TODO
    }
    return relPos.map((r) => { return {x: r.x * grid.dpi + pos.x, y: r.y * grid.dpi + pos.y }; });
}
