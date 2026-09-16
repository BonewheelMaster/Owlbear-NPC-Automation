import{c as e,f as t,i as n,n as r,o as i,s as a}from"./util-DFvZsEHX.js";import{i as o,n as s}from"./npc-operations-CvaFvEAh.js";async function c(){let e=await t.scene.items.getItems(),r=await t.player.getSelection();return r===void 0?[]:r.map(t=>n(e,t)).filter(e=>e!==null)}async function l(){let e=await c();o(e)}async function u(){let e=await c();return r(e)}function d(e){if(e.length>=1){let t=e[0].meta;if(e.every(e=>a(e.meta,t)))return t;if(e.every(e=>e.meta.kind==t.kind))return t.kind}return`Disagreed`}document.querySelector(`#disableButton`)?.addEventListener(`click`,l),t.onReady(async()=>{let t=await u();d(t);let n=document.querySelector(`#Form`);if(n===null)return;n.innerHTML=`
        <p>NPC Type: </p>
        <select id="npcTypeDropDown">
            <option selected value=${i} >Melee</option>
            <option          value=${e}>Ranged</option>
        </select>
    `;let r=document.querySelector(`#npcTypeDropDown`);r!==null&&r.addEventListener(`change`,()=>{s(r.value,t),console.log(t)})});