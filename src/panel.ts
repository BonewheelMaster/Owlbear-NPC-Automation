import * as OBR from "./obr-api";
import { Item } from "@owlbear-rodeo/sdk";

import * as pre from "./prelude";

import * as move from "./move";
import * as util from "./util";
import * as npc  from "./npc";

function makeMoveAllButton() : void {
    let button = document.getElementById("button");
    if (button === null) { return; }
    button.addEventListener("click", move.moveAll);
}
function makePanel(items : Item[]) : void {
    const npcs = util.filterNPCs(items);

    let panel = document.getElementById("panel");
    if (panel === null) { return; }
    let npcList = document.createElement("ul");

    for (const n of npcs) {
        const meta = n.meta;

        let npcListItem  = document.createElement("li");
        let propertyList = document.createElement("ul");

        let kind       = document.createElement("p");
        kind.innerText = "using: ${meta.kind}";

        let speed       = document.createElement("p");
        speed.innerText = `speed: ${meta.speed}`;

        let target       = document.createElement("p");
        const targetItem = util.getTarget(items, meta.target);
        if (targetItem === null) {
            target.innerText = `target: ${meta.target}`;
        }
        else { target.innerText = `target: ${util.getName(targetItem)}` }

        if (meta.kind != npc.RANGED) { continue; }

        let range       = document.createElement("p");
        range.innerText = `range: ${meta.range}`;

        propertyList.append(kind, speed, target, range);
        npcListItem.append(propertyList);
        npcList.append(npcListItem);
    }
    panel.append(npcList);
}
async function main() : Promise<void> {
    const items = await OBR.getItems();

    makeMoveAllButton();
    makePanel(items);
}
OBR.onReady(main);
