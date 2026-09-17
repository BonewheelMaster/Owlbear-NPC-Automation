import{c as e,f as t,i as n,n as r,o as i,s as a}from"./util-DFvZsEHX.js";import{a as o,i as s,n as c}from"./npc-operations-ZqFXLCXy.js";async function l(){let e=await t.scene.items.getItems(),r=await t.player.getSelection();return r===void 0?[]:r.map(t=>n(e,t)).filter(e=>e!==null)}async function u(){let e=await l();s(e)}async function d(){let e=await l();return r(e)}function f(e){if(e.length>=1){let t=e[0].meta;if(e.every(e=>a(e.meta,t)))return[`Agreed`,t];if(e.every(e=>e.meta.kind==t.kind))return[`Partial`,t.kind]}return`Disagreed`}document.querySelector(`#disableButton`)?.addEventListener(`click`,u),t.onReady(async()=>{let t=await d(),n=f(t),r=`None`;n!=`Disagreed`&&(r=n[0]==`Agreed`?n[1].kind:n[1]);let a=document.querySelector(`#Form`);if(a===null)return;a.innerHTML=`
        <label for="npcTypeDropDown">NPC Type:</label>
        <select id="npcTypeDropDown">
            <option hidden disabled ${r==`None`?`selected`:``} value></option>
            <option ${r==`MELEE`?`selected`:``}
                value=${i} >Melee</option>
            <option ${r==`RANGED`?`selected`:``}
                value=${e}>Ranged</option>
        </select>
        <div id="typeSpecificSettings></div>
    `;let s=document.querySelector(`#npcTypeDropDown`);if(s!==null)switch(s.addEventListener(`change`,()=>{c(s.value,t)}),r){case`None`:return;case i:let n=document.querySelector(`#typeSpecificSettings`);if(n===null){console.log(`asd`);break}n.innerHTML=`
                <label for="speedInput">Speed:</label>
                <input type="number" id="speedInput"/>

                <label for="targetInput">Target ID:</label>
                <input type="text" id="targetInput"/>
            `;let r=document.querySelector(`#speedInput`);if(r===null)break;r.addEventListener(`change`,()=>{o(e=>e.kind==`MELEE`?{...e,speed:parseInt(r.value)}:e,t)});break;case e:}});