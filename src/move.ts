import * as OBR from "./obr-api";
import { Vector2, Item } from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import { NPC } from "./npc";
import * as npc from "./npc";

export async function moveAll() : Promise<void>
export async function moveOne() : Promise<void>

async function move(items : Item[], npc : NPC, grid : OBR.Grid) : Promise<void>

type Action = SquareAction | HexVertAction | HexHorizAction
    | DimetricAction | IsometricAction

type GridType = "Square" | "HexVert" | "HexHoriz" | "Dimetric" | "Isometric"

type SquareAction = {
    gridType : "Square";
    movement : "Stand" | "N" | "NW" | "W" | "SW" | "S" | "SE" | "E" | "NE";
}
type HexVertAction = {
    gridType : "HexVert";
    movement : "Stand" | "U" | "UL" | "DL" | "D" | "DR" | "UR";
}
type HexHorizAction = {
    gridType : "HexHoriz";
    movement : "Stand" | "L" | "DL" | "DR" | "R" | "UR" | "UL";
}
type DimetricAction = {
    gridType : "Dimetric";
    movement : "Stand" | "N" | "NW" | "W" | "SW" | "S" | "SE" | "E" | "NE";
}
type IsometricAction = {
    gridType : "Isometric";
    movement : "Stand" | "N" | "NW" | "W" | "SW" | "S" | "SE" | "E" | "NE";
}

function push(speed : number, pos : Vector2, action : Action) : Vector2
function angleToAction(angle : number, gridType : GridType) : Action

type Strategy = (items : Item[], npc : NPC, grid : OBR.Grid) => Vector2;

const meleeBasic  : Strategy;
const rangedBasic : Strategy;
