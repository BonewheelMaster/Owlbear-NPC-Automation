import{c as e,f as t,i as n,n as r,o as i,r as a,t as o}from"./util-DFvZsEHX.js";async function s(){let e=await t.scene.items.getItems(),i=r(e),a=await t.scene.grid.getDpi(),o={};for(let r of i){o[r.id]=await t.scene.grid.snapPosition(r.position,1,!1,!0);let i=n(e,r.meta.target);if(i===null)continue;let s=0;for(;!(s+5>r.meta.speed);){let e=r.meta.kind==`MELEE`?await c(o[r.id],i.position,o):await l(o[r.id],i.position,r.meta.range,o);if(e.gridType==`Square`&&e.movement==`Stand`)break;o[r.id]=u(a,o[r.id],e),s+=5}}t.scene.items.updateItems(i,t=>{for(let r of t)n(e,r.meta.target)!==null&&(r.position=o[r.id])})}async function c(e,n,r){let i=await t.scene.grid.snapPosition(n,1,!1,!0),a=await t.scene.grid.getDpi();return o(e,i)<2*a?{gridType:`Square`,movement:`Stand`}:d(Math.atan2(i.y-e.y,i.x-e.x),`Square`)}async function l(e,n,r,i){let a=await t.scene.grid.snapPosition(n,1,!1,!0),s=await t.scene.grid.getDpi();return o(e,a)<(1+r/5)*s?{gridType:`Square`,movement:`Stand`}:c(e,n,i)}function u(e,t,n){let r=t;if(n.gridType===`Square`)switch(n.movement){case`Stand`:break;case`N`:r={...t,y:t.y-=e};break;case`NW`:r={...t,y:t.y-=e,x:t.x-=e};break;case`W`:r={...t,x:t.x-=e};break;case`SW`:r={...t,y:t.y+=e,x:t.x-=e};break;case`S`:r={...t,y:t.y+=e};break;case`SE`:r={...t,y:t.y+=e,x:t.x+=e};break;case`E`:r={...t,x:t.x+=e};break;case`NE`:r={...t,y:t.y-=e,x:t.x+=e}}return r}function d(e,t){let n=Math.round(Math.cos(e)),r=-Math.round(Math.sin(e)),i=``;switch(r){case 1:i+=`N`;break;case 0:break;case-1:i+=`S`}switch(n){case-1:i+=`W`;break;case 0:break;case 1:i+=`E`}return i==``?{gridType:t,movement:`Stand`}:{gridType:t,movement:i}}var f=t=>{let o=r(t),s=[];for(let r of o){let o=document.createElement(`li`),c=a(r),l=r.meta,u=n(t,l.target),d=u==null?`No target`:`Target: ${a(u)}`;switch(l.kind){case i:o.innerHTML=`
                    <p>${c}</p>

                    <ul>
                        <li>using: melee</li>
                        <li>speed: ${l.speed}</li>
                        <li>${d}</li>
                    </ul>
                `;break;case e:o.innerHTML=`
                    <p>${c}</p>

                    <ul>
                        <li>using: ranged</li>
                        <li>speed: ${l.speed}</li>
                        <li>${d}</li>
                        <li>range: ${l.range}</li>
                    </ul>
                `}s.push(o)}document.querySelector(`#list`)?.replaceChildren(...s)};document.querySelector(`#button`)?.addEventListener(`click`,s);var p=document.querySelector(`#panel`);p!=null&&(p.innerHTML=`<ul id="list"></ul>`),t.onReady(()=>{t.scene.items.onChange(f)});