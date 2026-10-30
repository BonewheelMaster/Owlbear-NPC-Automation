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
    for (let i = 0; i++; i < n.meta.speed / 5) { // TODO hardcoded step size
        if (actions[i] === undefined) { break; }
        const action = actions[i];

        newPosTry = push(grid.dpi, newPos, action);
        if (occupied(items, newPosTry, grid.dpi)) { continue; }
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
    return items.some((i) => distance(i.position, pos) <= dpi / 2);
}

function distance(pos1 : Vector2, pos2 : Vector2) : number {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
}

type Action = SquareAction | HexVertAction | HexHorizAction | DimetricAction
    | IsometricAction

type SquareAction = {
    gridType : "SQUARE";
    movement : "Stand" | "N" | "NW" | "W" | "SW" | "S" | "SE" | "E" | "NE";
}
type HexVertAction = {
    gridType : "HEX_VERTICAL";
    movement : "Stand" | "U" | "UL" | "DL" | "D" | "DR" | "UR";
}
type HexHorizAction = {
    gridType : "HEX_HORIZONTAL";
    movement : "Stand" | "L" | "DL" | "DR" | "R" | "UR" | "UL";
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
    let newPos = pos;
    switch (action.gridType) {
        case "SQUARE": {
            switch (action.movement) {
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
                case  1: result += "W"; break;
                case  0:                break;
                case -1: result += "E"; break;
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
const rangedBasic : Strategy<npc.RangedAI> = (items, pos, nai, grid) => {
    const target = util.getTarget(items, nai.target);
    if (target === null) { return [{ gridType : grid.type, movement : "Stand" }]; }

    //                                                 TODO hardcoded step size V
    const actions = breadthFirst(items, grid, pos, target.position, nai.speed / 5);
    // We only wish to get within range.
    let minActions = [];
    let currentPos = pos;
    for (const action of actions) {
        if (distance(currentPos, target.position) <= nai.range) { break; }
        // No collision check is made, as that should be checked further up, in move.
        // breadthFirst should never return a path that collides, anyways.
        // TODO hardcoded step size
        currentPos = push(5, currentPos, action);
        minActions.push(action);
    }
    return minActions;
};

function reached(from : Map<Vector2, Vector2>, pos : Vector2) : boolean {
    return from.keys().some(p => p.x == pos.x && p.y == pos.y);
}

// Return the shortest path using a simple breadth-first search.
//
// The type of action given will match the type of grid.
// Does not consider difficult terrain, and assumes that moving diagonally on squares
// is the same as other directions.
// If there is no valid path, will return a single stand action.
function breadthFirst(items : Item[], grid : OBR.Grid, pos : Vector2, target : Vector2,
    maxDepth : number) : Action[]
{
    let frontier : Vector2[]             = [pos];
    let from     : Map<Vector2, Vector2> = new Map();
    from.set(pos, pos);
    let currentDepth = 0

    while (frontier.length != 0 && currentDepth <= maxDepth) {
        let newFrontier : Vector2[] = [];

        for (const f of frontier) {
            if (distance(f, target) <= grid.dpi / 2) { return tracePath(from, f, pos, grid.type); }

            const nn = neighbors(grid, f).filter((n) => ! reached(from, n)
                                                 && ! occupied(items, n, grid.dpi));
            newFrontier = newFrontier.concat(nn);
            nn.forEach((n) => { from.set(n,f); });
            ff.push(f);
        }
        frontier = newFrontier;
        currentDepth++;
    }
    return [{ gridType : grid.type, movement : "Stand" }];
}
// If there is no valid path, will return a single stand action.
function tracePath(from : Map<Vector2, Vector2>, target : Vector2, pos : Vector2
        , gridType : GridType
    ) : Action[]
{
    let currentPos = target;
    let path       = [];

    while (currentPos != pos) {
        const prevPos = from.get(currentPos);

        if (prevPos !== undefined) {
            const angle = Math.atan2(prevPos.y - currentPos.y, prevPos.x - currentPos.x);
            path.push(angleToAction(angle, gridType));
            currentPos = prevPos;
        }
        else { return [{ gridType : gridType, movement : "Stand" }]; }
    }
    path.reverse();
    return path;
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
            ]; break
        //TODO
    }
    return relPos.map((r) => { return {x: r.x * grid.dpi + pos.x, y: r.y * grid.dpi + pos.y }; });
}
