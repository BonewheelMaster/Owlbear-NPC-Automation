import OBR, { Item } from "@owlbear-rodeo/sdk";

export const MELEE  = "MELEE";
export const RANGED = "RANGED";

// The ID of this app, for use in metadata objects.
export const ID = "Owlbear-NPC-Automation/io.github.bonewheelmaster";
// The key in metadata that we have jurisdiction over
export const STATE = `${ID}/state`

export type NPC       = Item & { meta: NPCAI }
export type NPCAI     = MeleeAI | RangedAI;
export type NPCAIType = typeof MELEE | typeof RANGED;

export type MeleeAI = {
    kind: typeof MELEE;
    enabled: boolean;
    speed: number;
    target: string; // ID of item
};

export type RangedAI = {
    kind: typeof RANGED;
    enabled: boolean;
    speed: number;
    target: string; // ID of item
    range: number;
};

export const initMeleeAI : MeleeAI = {
    kind: MELEE,
    enabled: true,
    speed: 30,
    target: "",
};

export const initRangedAI : RangedAI = {
    kind: RANGED,
    enabled: true,
    speed: 30,
    target: "",
    range: 60,
};

export function NPCAIEqual(npc1 : NPCAI, npc2 : NPCAI) : boolean {
    if (npc1.kind == MELEE && npc2.kind == MELEE) {
            return npc1.enabled == npc2.enabled
                && npc2.speed   == npc2.speed
                && npc1.target  == npc2.target;
    }
    if (npc1.kind == RANGED && npc2.kind == RANGED) {
            return npc1.enabled == npc2.enabled
                && npc2.speed   == npc2.speed
                && npc1.target  == npc2.target
                && npc1.range   == npc2.range;
    }
    return false;
}

// Determine if the given object conforms to the NPCAI interface.
export function validMetadata(meta : any): meta is NPCAI {
    if ( typeof meta == "object"
      && "kind" in meta
    ) { switch (meta.kind) {
            case MELEE:
                return ( "enabled" in meta
                      && typeof meta.enabled == "boolean"
                      && "speed" in meta
                      && typeof meta.speed == "number"
                      && "target" in meta
                      && typeof meta.target == "string"
                );
            case RANGED:
                return ( "enabled" in meta
                      && typeof meta.enabled == "boolean"
                      && "speed" in meta
                      && typeof meta.speed == "number"
                      && "target" in meta
                      && typeof meta.target == "string"
                      && "range" in meta
                      && typeof meta.range == "number"
                );
            default: return false;
        }
    }
    else { return false; }
}
