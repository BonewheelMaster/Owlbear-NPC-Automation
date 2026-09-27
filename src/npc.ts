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

export const initMeleeAI  : MeleeAI = {
    kind: MELEE,
    speed: 30,
    target: ""
};
export const initRangedAI : RangedAI = {
    kind: RANGED,
    speed: 30,
    target: "",
    range: 60
};

export function NPCAIEqual(npc1 : NPCAI, npc2 : NPCAI) : boolean {
    if (npc1.kind == MELEE && npc2.kind == MELEE) {
        return npc1.speed  == npc2.speed
            && npc1.target == npc2.target;
    }
    if (npc1.kind == RANGED && npc2.kind == RANGED) {
        return npc1.speed  == npc2.speed
            && npc1.target == npc2.target
            && npc1.range  == npc2.range;
    }
    return false;
}
export function isNPC(item : Item) : item is NPC {
    return "meta" in item && validMetadata(item.meta);
}
export function validMetadata(meta : any) : meta is NPCAI {
    if (typeof meta == "object" && "kind" in meta) {
        switch (meta.kind) {
            case MELEE:
                return "speed" in meta
                    && typeof meta.speed == "number"
                    && "target" in meta
                    && typeof meta.target == "string";
            case RANGED:
                return "speed" in meta
                    && typeof meta.speed == "number"
                    && "target" in meta
                    && typeof meta.target == "string"
                    && "range" in meta
                    && typeof meta.range == "string";
            default: return false;
        }
    }
    return false;
}
