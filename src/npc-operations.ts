import OBR, { Item } from "@owlbear-rodeo/sdk";

import * as state from "./state";
import * as util  from "./util";

export function showId(items : Item[]) {
    items.map((item) => { OBR.notification.show(item.id, "INFO") });
}

export function addTokens(items : Item[]) {
    updateTokens(state.initMeleeAI, items);
}

export function removeTokens(items : Item[]) {
    OBR.scene.items.updateItems(items, (items) => {
        for (let item of items) {
            item.metadata[state.STATE] = {}
        }
    });
}

export function updateTokens(newState : state.NPCAI, items : Item[]) {
    OBR.scene.items.updateItems(items, (items) => {
        for (let item of items) {
            item.metadata[state.STATE] = newState;
        }
    });
}

export function updateNPCs(f : (npc : state.NPCAI) => state.NPCAI, items : Item[]) {
    const npcs = util.filterNPCs(items);
    for (let npc of npcs) {
        updateTokens(f(npc.meta), [npc]);
    }
}

export function changeType(newType : state.NPCAIType, items : Item[]) {
    OBR.scene.items.updateItems(items, (items) => {
        for (let item of items) {
            switch (newType) {
                case state.MELEE : item.metadata[state.STATE] = state.initMeleeAI ; break;
                case state.RANGED: item.metadata[state.STATE] = state.initRangedAI; break;
            }
        }
    });
}
