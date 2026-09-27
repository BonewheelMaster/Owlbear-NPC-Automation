import { Item } from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

export const MELEE  = "MELEE";
export const RANGED = "RANGED";

export type NPC       = Item & { meta: NPCAI };
export type NPCAI     = MeleeAI | RangedAI;
export type NPCAIType = typeof MELEE | typeof RANGED;

export type MeleeAI = {
    kind   : typeof MELEE;
    speed  : number;
    target : string; // ID of the item
};

export type RangedAI = {
    kind   : typeof RANGED;
    speed  : number;
    target : string; // ID of the item
    range  : number;
};

export const initMeleeAI  : MeleeAI;
export const initRangedAI : RangedAI;

export function NPCAIEqual(npc1 : NPCAI, npc2 : NPCAI) : Boolean
export function isNPC(item : Item) : item is NPC
export function validMetadata(meta : any) : meta is NPCAI
