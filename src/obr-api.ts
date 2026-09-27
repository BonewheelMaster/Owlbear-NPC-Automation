// This is the interface for the subset of the OBR SDK that I care about, minus the types.
import OBR, { Item, GridScale, GridType, Vector2, ContextMenuItem }
    from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import { NPC, NPCAI } from "./npc";
import * as npc from "./npc";

export type Grid = {
    dpi   : number;
    scale : GridScale;
    type  : GridType;
};

export async function getItems() : Promise<Item[]>
export async function getSelection() : Promise<Item[]>
export async function getGrid() : Promise<Grid>
export async function snapToGrid(pos : Vector2) : Promise<Vector2>

export async function showId(items : Item[]) : Promise<void>
export async function enableNPCs(items : Item[]) : Promise<void>
export async function disableNPCs(items : Item[]) : Promise<void>
export async function updateNPCs(f : (npcai : NPCAI) => NPCAI, npcs : NPC[]) : Promise<void>
export async function updateItems(f : (item : Item) => Item, items : Item[]) : Promise<void>
export async function createContextMenus(menus : ContextMenuItem[]) : Promise<void>
export async function showNotification(msg : string) : Promise<void>
export async function onReady(f : () => void) : Promise<void>
export async function onChange(f : (items : Item[]) => void) : Promise<void>
