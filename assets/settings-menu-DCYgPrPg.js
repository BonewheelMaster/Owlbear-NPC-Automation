import{c as e,f as t,i as n,n as r,o as i,s as a}from"./util-DFvZsEHX.js";import{a as o,n as s,r as c}from"./npc-operations-BdQg-59q.js";async function l(){let e=await t.scene.items.getItems(),r=await t.player.getSelection();return r===void 0?[]:r.map(t=>n(e,t)).filter(e=>e!==null)}async function u(){let e=await l();c(e)}async function d(){let e=await l();return r(e)}function f(e){if(e.length>=1){let t=e[0].meta;if(e.every(e=>a(e.meta,t)))return[`Agreed`,t];if(e.every(e=>e.meta.kind==t.kind))return[`Partial`,t.kind]}return`Disagreed`}document.querySelector(`#disableButton`)?.addEventListener(`click`,u),t.onReady(async()=>{let t=await d(),n=f(t),r=`None`;n!=`Disagreed`&&(r=n[0]==`Agreed`?n[1].kind:n[1]);let a=document.querySelector(`#Form`);if(a===null)return;a.innerHTML=`
        <label for="npcTypeDropDown">NPC Type:</label>
        <select id="npcTypeDropDown">
            <option hidden disabled ${r==`None`?`selected`:``} value></option>
            <option ${r==`MELEE`?`selected`:``}
                value=${i} >Melee</option>
            <option ${r==`RANGED`?`selected`:``}
                value=${e}>Ranged</option>
        </select>
        <div id="typeSpecificSettings"></div>
    `;let c=document.querySelector(`#npcTypeDropDown`);if(c!==null)switch(c.addEventListener(`change`,()=>{s(c.value,t)}),r){case`None`:return;case i:if(n==`Disagreed`)break;var l=document.querySelector(`#typeSpecificSettings`);if(l===null)break;l.innerHTML=`
                <label for="speedInput">Speed:</label>
                <input type="number" id="speedInput"/>

                <label for="targetInput">Target ID:</label>
                <input type="text" id="targetInput"/>
            `;var u=document.querySelector(`#speedInput`);if(u===null)break;n[0]==`Agreed`&&(u.value=n[1].speed.toString()),u.addEventListener(`input`,()=>{o(e=>{let t=parseInt(u.value);return e.kind==`MELEE`&&!isNaN(t)?{...e,speed:t}:e},t)});var p=document.querySelector(`#targetInput`);if(p===null)break;n[0]==`Agreed`&&(p.value=n[1].target.toString()),p.addEventListener(`input`,()=>{o(e=>e.kind==`MELEE`?{...e,target:p.value}:e,t)});break;case e:if(n==`Disagreed`)break;var l=document.querySelector(`#typeSpecificSettings`);if(l===null)break;l.innerHTML=`
                <label for="speedInput">Speed:</label>
                <input type="number" id="speedInput"/>

                <label for="targetInput">Target ID:</label>
                <input type="text" id="targetInput"/>

                <label for="rangeInput">Range:</label>
                <input type="number" id="rangeInput"/>
            `;var u=document.querySelector(`#speedInput`);if(u===null)break;n[0]==`Agreed`&&(u.value=n[1].speed.toString()),u.addEventListener(`input`,()=>{o(e=>{let t=parseInt(u.value);return e.kind==`RANGED`&&!isNaN(t)?{...e,speed:t}:e},t)});var p=document.querySelector(`#targetInput`);if(p===null)break;n[0]==`Agreed`&&(p.value=n[1].target.toString()),p.addEventListener(`input`,()=>{o(e=>e.kind==`RANGED`?{...e,target:p.value}:e,t)});var m=document.querySelector(`#rangeInput`);if(m===null)break;n[0]==`Agreed`&&n[1].kind==`RANGED`&&(m.value=n[1].range.toString()),m.addEventListener(`input`,()=>{o(e=>{let t=parseInt(m.value);return e.kind==`RANGED`&&!isNaN(t)?{...e,range:t}:e},t)})}});