import OBR from "@owlbear-rodeo/sdk";
import * as state from "./state";
import * as util from "./util";
export function hardcodeIds(items) {
    OBR.scene.items.updateItems(items, (items) => {
        const npcs = util.filterNPCs(items);
        for (let npc of npcs) {
            npc.meta.target = "7c7c63a9-4a09-4632-9d8d-00bffd2ee66f";
        }
    });
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
    OBR.scene.items.updateItems(items, (items) => {
        const npcs = util.filterNPCs(items);
        for (let npc of npcs) {
            npc.meta = f(npc.meta);
            console.log(npc.meta);
        }
    });
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
