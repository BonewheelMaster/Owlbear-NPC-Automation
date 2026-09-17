import OBR from "@owlbear-rodeo/sdk";
import * as state from "./state";
import * as util from "./util";
export function showId(items) {
    if (items.length != 1) {
        return;
    }
    OBR.notification.show(items[0].id, "INFO");
}
export function addTokens(items) {
    updateTokens(state.initMeleeAI, items);
}
export function removeTokens(items) {
    OBR.scene.items.updateItems(items, (items) => {
        for (let item of items) {
            item.metadata[state.STATE] = {};
        }
    });
}
export function updateTokens(newState, items) {
    OBR.scene.items.updateItems(items, (items) => {
        for (let item of items) {
            item.metadata[state.STATE] = newState;
        }
    });
}
export function updateNPCs(f, items) {
    const npcs = util.filterNPCs(items);
    for (let npc of npcs) {
        updateTokens(f(npc.meta), [npc]);
    }
}
export function changeType(newType, items) {
    OBR.scene.items.updateItems(items, (items) => {
        for (let item of items) {
            switch (newType) {
                case state.MELEE:
                    item.metadata[state.STATE] = state.initMeleeAI;
                    break;
                case state.RANGED:
                    item.metadata[state.STATE] = state.initRangedAI;
                    break;
            }
        }
    });
}
