import * as OBR from "./obr-api";
import { Item } from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import * as move from "./move";
import * as util from "./util";
import * as npc  from "./npc";

async function buttonWrap(button : HTMLButtonElement, f : () => Promise<void>,
    pendingText : string) : Promise<void>
{
    const normalText = button.innerHTML;
    button.innerHTML = pendingText;
    button.disabled = true;
    await f();
    button.innerHTML = normalText;
    button.disabled = false;
}

function makeMoveAllButton() : void {
    let button = document.getElementById("button");
    if (button === null) { return; }
    button.addEventListener("click", () => buttonWrap(button as HTMLButtonElement, move.moveAll, "Moving..."));
}
function makePanel(items : Item[]) : void {
    const npcs = util.filterNPCs(items);

    let panel = document.getElementById("panel");
    if (panel === null) { return; }
    panel.innerHTML = "";
    let npcList = document.createElement("ul");

    for (const n of npcs) {
        const meta = n.meta;

        let npcListItem  = document.createElement("li");

        let name         = document.createElement("label");
        let selectButton = document.createElement("button");
        selectButton.id        = "selectButton";
        name.htmlFor           = "selectButton";
        name.innerText         = util.getName(n) + " ";
        selectButton.innerText = "select";
        selectButton.addEventListener("click", () => OBR.selectItem(n))
        npcListItem.append(name);
        npcListItem.append(selectButton);

        let propertyList = document.createElement("ul");

        let kind       = document.createElement("p");
        kind.innerText = `using: ${meta.kind}`;

        let speed       = document.createElement("p");
        speed.innerText = `speed: ${meta.speed}`;

        let target       = document.createElement("p");
        const targetItem = util.getTarget(items, meta.target);
        if (targetItem === null) {
            if (meta.target == "") { target.innerText = "target: none"; }
            else { target.innerText = `target: ${meta.target}`; }
        }
        else {
            const targetName = util.getName(targetItem);
            if (targetName == "") { target.innerText = `target: ${meta.target}`; }
            else { target.innerText = `target: ${util.getName(targetItem)}` }
        }
        propertyList.append(kind, speed, target);

        if (meta.kind == npc.RANGED) {
            let range       = document.createElement("p");
            range.innerText = `range: ${meta.range}`;
            propertyList.append(range);
        }

        npcListItem.append(propertyList);
        npcList.append(npcListItem);
    }
    panel.append(npcList);
}
async function main() : Promise<void> {
    makeMoveAllButton();
    // NOTE for some reason, onChange callbacks are called twice when items change.
    // Therefore, ensure this is performant.
    OBR.onChange(makePanel);
}
OBR.onReady(main);
