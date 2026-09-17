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
        <div id="typeSpecificSettings"></div>
    `;
    const npcTypeDropDown = document.querySelector("#npcTypeDropDown") as HTMLSelectElement;
    if (npcTypeDropDown === null) { return; }

    npcTypeDropDown.addEventListener("change", () => {
        npcOps.changeType(npcTypeDropDown.value as state.NPCAIType, selNPCs);
    });

    switch (NPCType) {
        case "None": return;
        case state.MELEE:
            // NPCType not being "None" implies that settings is not "Disagreed",
            // and therefore is a tuple with a first element. Regardless, TypeScript
            // not seem to understand this, so this line is required.
            if (settings == "Disagreed") { break; }

            const typeSpecificSettings = document.querySelector("#typeSpecificSettings");
            if (typeSpecificSettings === null) { break; }

            typeSpecificSettings.innerHTML = `
                <label for="speedInput">Speed:</label>
                <input type="text" id="speedInput"
                    value=${settings[0] == "Agreed" ? settings[1].speed : ""}/>

                <label for="targetInput">Target ID:</label>
                <input type="text" id="targetInput"
                    value=${settings[0] == "Agreed" ? settings[1].target : ""}/>
            `;
            const speedInput = document.querySelector("#speedInput") as HTMLInputElement;
            if (speedInput === null) { break; }
            speedInput.addEventListener("input", () => {
                npcOps.updateNPCs(
                    (meta) => { const newSpeed = parseInt(speedInput.value);
                               if (meta.kind == state.MELEE && !isNaN(newSpeed)) {
                                    return { ...meta, speed : newSpeed };
                              } else { return meta; } }
                    , selNPCs
                );
            });
            const targetInput = document.querySelector("#targetInput") as HTMLInputElement;
            if (targetInput === null) { break; }
            targetInput.addEventListener("input", () => {
                npcOps.updateNPCs(
                    (meta) => { if (meta.kind == state.MELEE) {
                                    return { ...meta, target : targetInput.value };
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
