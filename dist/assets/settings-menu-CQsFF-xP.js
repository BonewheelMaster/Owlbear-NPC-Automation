import{f as e,i as t,l as n,n as r,s as i,u as a}from"./util-DFvZsEHX-BCkg8dnQ.js";import{i as o,n as s,r as c}from"./npc-operations-CoTwqAmu-CD2GSgIl.js";async function l(){let e=await n.scene.items.getItems(),t=await n.player.getSelection();return t===void 0?[]:t.map(t=>r(e,t)).filter(e=>e!==null)}async function u(){let e=await l();o(e)}async function d(){let e=await l();return a(e)}function f(e){if(e.length>=1){let n=e[0].meta;if(e.every(e=>t(e.meta,n)))return[`Agreed`,n];if(e.every(e=>e.meta.kind==n.kind))return[`Partial`,n.kind]}return`Disagreed`}document.querySelector(`#disableButton`)?.addEventListener(`click`,u),n.onReady(async()=>{let t=await d(),n=f(t),r=`None`;n!=`Disagreed`&&(r=n[0]==`Agreed`?n[1].kind:n[1]);let a=document.querySelector(`#Form`);if(a===null)return;a.innerHTML=`
        <label for="npcTypeDropDown">NPC Type:</label>
        <select id="npcTypeDropDown">
            <option hidden disabled ${r==`None`?`selected`:``} value></option>
            <option ${r==`MELEE`?`selected`:``}
                value=${e} >Melee</option>
            <option ${r==`RANGED`?`selected`:``}
                value=${i}>Ranged</option>
        </select>
        <div id="typeSpecificSettings"></div>
    `;let o=document.querySelector(`#npcTypeDropDown`);if(o!==null)switch(o.addEventListener(`change`,()=>{c(o.value,t)}),r){case`None`:return;case e:if(n==`Disagreed`)break;var l=document.querySelector(`#typeSpecificSettings`);if(l===null)break;l.innerHTML=`
                <div>
                    <label for="speedInput">Speed:</label>
                    <input type="number" id="speedInput" size="3"/>
                </div>

                <div>
                    <label for="targetInput">Target ID:</label>
                    <input type="text" id="targetInput"/>
                </div>
            `;var u=document.querySelector(`#speedInput`);if(u===null)break;n[0]==`Agreed`&&(u.value=n[1].speed.toString()),u.addEventListener(`input`,()=>{s(e=>{let t=parseInt(u.value);return e.kind==`MELEE`&&!isNaN(t)?{...e,speed:t}:e},t)});var p=document.querySelector(`#targetInput`);if(p===null)break;n[0]==`Agreed`&&(p.value=n[1].target.toString()),p.addEventListener(`input`,()=>{s(e=>e.kind==`MELEE`?{...e,target:p.value}:e,t)});break;case i:if(n==`Disagreed`)break;var l=document.querySelector(`#typeSpecificSettings`);if(l===null)break;l.innerHTML=`
                <div>
                    <label for="speedInput">Speed:</label>
                    <input type="number" id="speedInput" size="3"/>
                </div>

                <div>
                    <label for="targetInput">Target ID:</label>
                    <input type="text" id="targetInput"/>
                </div>

                <div>
                    <label for="rangeInput">Range:</label>
                    <input type="number" id="rangeInput" size="4"/>
                </div>
            `;var u=document.querySelector(`#speedInput`);if(u===null)break;n[0]==`Agreed`&&(u.value=n[1].speed.toString()),u.addEventListener(`input`,()=>{s(e=>{let t=parseInt(u.value);return e.kind==`RANGED`&&!isNaN(t)?{...e,speed:t}:e},t)});var p=document.querySelector(`#targetInput`);if(p===null)break;n[0]==`Agreed`&&(p.value=n[1].target.toString()),p.addEventListener(`input`,()=>{s(e=>e.kind==`RANGED`?{...e,target:p.value}:e,t)});var m=document.querySelector(`#rangeInput`);if(m===null)break;n[0]==`Agreed`&&n[1].kind==`RANGED`&&(m.value=n[1].range.toString()),m.addEventListener(`input`,()=>{s(e=>{let t=parseInt(m.value);return e.kind==`RANGED`&&!isNaN(t)?{...e,range:t}:e},t)})}});