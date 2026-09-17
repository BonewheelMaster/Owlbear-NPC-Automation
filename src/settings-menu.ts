import OBR, { Item } from "@owlbear-rodeo/sdk";

import * as npcOps from "./npc-operations";
import * as state  from "./state";
import * as util   from "./util";

export async function getSelectedItems() {
    const items      = await OBR.scene.items.getItems();
    const selItemIds = await OBR.player.getSelection();

    if (selItemIds === undefined) { return []; }

    return selItemIds
        .map((id) => { return util.getTarget(items, id); })
        .filter((item) => { return item !== null; });
}

export async function removeSelected() {
    const selItems = await getSelectedItems();
    npcOps.removeTokens(selItems);
}

export async function getSelectedNPCs() : Promise<state.NPC[]> {
    const selItems = await getSelectedItems();
    return util.filterNPCs(selItems);
}

// Get the current settings of all given NPCs.
//
// The following describes how conflicts are resolved:
//      If there are no conflicts (all selected NPCs have the same values set),
//      then this will return those values, and "Agreed" as the first of a pair.
//      If there are conflicts but all NPCs are the same AI type, this will
//      return that type, and "Partial" as the first of a pair.
//      Otherwise, this will return "Disagreed". Also returns this if nothing is selected.
export function getNPCSettings(NPCs : state.NPC[])
    : ["Agreed", state.NPCAI] | ["Partial", state.NPCAIType] | "Disagreed" {
    // Only the NPCs are cared about because this menu will not appear if a
    // non-npc is included in the selection.
    if (NPCs.length >= 1) {
        const refNPCAI = NPCs[0].meta

        if (NPCs.every((npc) => {
            return state.NPCAIEqual(npc.meta , refNPCAI);
        })) {
            return ["Agreed", refNPCAI];
        }
        if (NPCs.every((npc) => { return npc.meta.kind == refNPCAI.kind; })) {
            return ["Partial", refNPCAI.kind];
        }
    }
    return "Disagreed";
}

const menu = async () => {
    const selNPCs  = await getSelectedNPCs();
    const settings = getNPCSettings(selNPCs);
    let NPCType    = "None"
    if (settings != "Disagreed") {
        if (settings[0] == "Agreed") {
            NPCType = settings[1].kind;
        }
        else {
            NPCType = settings[1];
        }
    }

    const form = document.querySelector("#Form");
    if (form === null) { return; }

    form.innerHTML = `
        <label for="npcTypeDropDown">NPC Type:</label>
        <select id="npcTypeDropDown">
            <option hidden disabled ${NPCType == "None" ? "selected" : ""} value></option>
            <option ${NPCType == state.MELEE  ? "selected" : ""}
                value=${state.MELEE} >Melee</option>
            <option ${NPCType == state.RANGED ? "selected" : ""}
                value=${state.RANGED}>Ranged</option>
        </select>
    `;
    const npcTypeDropDown = document.querySelector("#npcTypeDropDown") as HTMLSelectElement;
    if (npcTypeDropDown === null) { return; }

    npcTypeDropDown.addEventListener("change", () => {
        npcOps.changeType(npcTypeDropDown.value as state.NPCAIType, selNPCs);
    });

    switch (NPCType) {
        case "None": return;
        case state.MELEE:
            form.innerHTML += `
                <label for="speedInput">Speed:</label>
                <input type="number" id="speedInput"/>

                <label for="targetInput">Target ID:</label>
                <input type="text" id="targetInput"/>
            `;
            const speedInput = document.querySelector("#speedInput") as HTMLInputElement;
            if (speedInput === null) { return; }
            speedInput.addEventListener("change", () => {
                npcOps.updateNPCs(
                    (meta) => { if (meta.kind == state.MELEE) {
                                    return { ...meta, speed : parseInt(speedInput.value) };
                              } else { return meta; } }
                    , selNPCs
                );
            });
            break;
        case state.RANGED:
            break;
    }
}

const disableButton = document.querySelector("#disableButton");
if (disableButton != null) { disableButton.addEventListener("click", removeSelected); }

OBR.onReady(menu);
