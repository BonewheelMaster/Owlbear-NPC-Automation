import * as OBR from "./obr-api";
import { Item } from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import { NPC, NPCAI, NPCAIType } from "./npc";
import * as npc from "./npc";
import * as util from "./util";

async function getSelectedNPCs() : Promise<NPC[]> {
    const selection = await OBR.getSelection();
    return util.filterNPCs(selection);
}
async function removeSelectedNPCs()  : Promise<void> {
    const selNPCs = await getSelectedNPCs();
    OBR.disableNPCs(selNPCs);
}
// Get the current settings of all given NPCs.
//
// The following describes how conflicts are resolved:
//      If there are no conflicts (all selected NPCs have the same values set),
//      then this will return those values, and "Agreed" as the first of a pair.
//      If there are conflicts but all NPCs are the same AI type, this will
//      return that type, and "Partial" as the first of a pair.
//      Otherwise, this will return "Disagreed". Also returns this if nothing is selected.
function getNPCSettings(NPCs : NPC[])
    : ["Agreed", NPCAI] | ["Partial", NPCAIType] | "Disagreed"
{
    if (NPCs.length < 1) {
        const refNPCAI = NPCs[0].meta;

        if (NPCs.every((n) => { return npc.NPCAIEqual(n.meta, refNPCAI); })) {
            return ["Agreed", refNPCAI];
        }
        if (NPCs.every((n) => { return n.meta.kind == refNPCAI.kind; })) {
            return ["Partial", refNPCAI.kind];
        }
    }
    return "Disagreed";
}
async function main() : Promise<void> {
    makeMenu();
    makeDisableButton();
}
async function makeMenu() : Promise<void> {
    let form = document.getElementById("form");
    if (form === null) { return; }

    const selNPCs  = await getSelectedNPCs();
    const settings = getNPCSettings(selNPCs);

    if (settings == "Disagreed") { makeDropDown(form, null, selNPCs); }
    else if (settings[0] == "Partial") {
        makeDropDown(form, settings[1], selNPCs);
        makeInputs(form, settings[1], null, selNPCs);
    }
    else {
        makeDropDown(form, settings[1].kind, selNPCs);
        makeInputs(form, settings[1].kind, settings[1], selNPCs);
    }
}
function makeDisableButton() : void {
    let button = document.getElementById("disableButton");
    if (button === null) { return; }
    button.addEventListener("click", removeSelectedNPCs);
}
function makeDropDown(form : HTMLElement, selected : NPCAIType | null
    , selNPCs : NPC[]) : void
{
    let dropDown   = document.createElement("select");
    let blank      = document.createElement("option");
    blank.disabled = true;
    blank.selected = selected === null;

    for (const choice of [npc.MELEE, npc.RANGED]) {
        let option      = document.createElement("option");
        option.value    = choice;
        option.selected = selected == choice;
        dropDown.append(option);
    }
    dropDown.addEventListener("change", () => {
        util.changeNPCTypes(dropDown.value as NPCAIType, selNPCs);
    });
    form.append(dropDown);
}
function makeInputs(form : HTMLElement, kind : NPCAIType, values : NPCAI | null
    , selNPCs : NPC[])
{
    let speedDiv   = document.createElement("div");
    let speedLabel = document.createElement("label");
    let speedInput = document.createElement("input");
    speedInput.id  = "speedInput";
    speedLabel.htmlFor = "speedInput";
    speedLabel.innerText = "speed: ";
    speedInput.type = "number";
    speedInput.size = 3;
    speedInput.addEventListener("change", () => {
        OBR.updateNPCs((npcAI) => { const newSpeed = parseInt(speedInput.value);
                                    if (newSpeed === null) { return npcAI; }
                                    npcAI["speed"] = newSpeed;
                                    return npcAI; }
                       , selNPCs);
    });
    if (values !== null) { speedInput.value = values.speed.toString(); }
    speedDiv.append(speedInput);
    speedDiv.append(speedLabel);
    form.append(speedDiv);

    let targetDiv   = document.createElement("div");
    let targetLabel = document.createElement("label");
    let targetInput = document.createElement("input");
    targetInput.id  = "targetInput";
    targetLabel.htmlFor = "targetInput";
    targetLabel.innerText = "target: ";
    targetInput.type = "text";
    targetInput.addEventListener("change", () => {
        OBR.updateNPCs((npcAI) => { return {...npcAI, target: targetInput.value}; }
                       , selNPCs);
    });
    if (values !== null) { targetInput.value = values.target; }
    targetDiv.append(targetInput);
    targetDiv.append(targetLabel);
    form.append(targetDiv);

    if (kind == npc.RANGED && values !== null && values.kind == npc.RANGED) {
        let rangeDiv   = document.createElement("div");
        let rangeLabel = document.createElement("label");
        let rangeInput = document.createElement("input");
        rangeInput.id  = "rangeInput";
        rangeLabel.htmlFor = "rangeInput";
        rangeLabel.innerText = "range: ";
        rangeInput.type = "number";
        rangeInput.size = 4;
        rangeInput.addEventListener("change", () => {
            OBR.updateNPCs((npcAI) => { if (npcAI.kind != npc.RANGED) { return npcAI; }
                                        const newRange = parseInt(rangeInput.value);
                                        if (newRange === null) { return npcAI; }
                                        npcAI["range"] = newRange;
                                        return npcAI; }
                           , selNPCs);
        });
        rangeInput.value = values.range.toString();
        rangeDiv.append(rangeInput);
        rangeDiv.append(rangeLabel);
        form.append(rangeDiv);
    }
}
OBR.onReady(main);
