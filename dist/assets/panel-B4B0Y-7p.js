import{a as e,f as t,l as n,n as r,o as i,s as a,u as o}from"./util-DFvZsEHX-BCkg8dnQ.js";async function s(){let e=await n.scene.items.getItems(),t=o(e),i=await n.scene.grid.getDpi(),a={};for(let o of t){a[o.id]=await n.scene.grid.snapPosition(o.position,1,!1,!0);let t=r(e,o.meta.target);if(t===null)continue;let s=0;for(;!(s+5>o.meta.speed);){let e=o.meta.kind==`MELEE`?await c(a[o.id],t.position,a):await l(a[o.id],t.position,o.meta.range,a);if(e.gridType==`Square`&&e.movement==`Stand`)break;a[o.id]=u(i,a[o.id],e),s+=5}}n.scene.items.updateItems(t,t=>{for(let n of t)r(e,n.meta.target)!==null&&(n.position=a[n.id])})}async function c(e,t,r){let a=await n.scene.grid.snapPosition(t,1,!1,!0),o=await n.scene.grid.getDpi();return i(e,a)<2*o?{gridType:`Square`,movement:`Stand`}:d(Math.atan2(a.y-e.y,a.x-e.x),`Square`)}async function l(e,t,r,a){let o=await n.scene.grid.snapPosition(t,1,!1,!0),s=await n.scene.grid.getDpi();return i(e,o)<(1+r/5)*s?{gridType:`Square`,movement:`Stand`}:c(e,t,a)}function u(e,t,n){let r=t;if(n.gridType===`Square`)switch(n.movement){case`Stand`:break;case`N`:r={...t,y:t.y-=e};break;case`NW`:r={...t,y:t.y-=e,x:t.x-=e};break;case`W`:r={...t,x:t.x-=e};break;case`SW`:r={...t,y:t.y+=e,x:t.x-=e};break;case`S`:r={...t,y:t.y+=e};break;case`SE`:r={...t,y:t.y+=e,x:t.x+=e};break;case`E`:r={...t,x:t.x+=e};break;case`NE`:r={...t,y:t.y-=e,x:t.x+=e}}return r}function d(e,t){let n=Math.round(Math.cos(e)),r=-Math.round(Math.sin(e)),i=``;switch(r){case 1:i+=`N`;break;case 0:break;case-1:i+=`S`}switch(n){case-1:i+=`W`;break;case 0:break;case 1:i+=`E`}return i==``?{gridType:t,movement:`Stand`}:{gridType:t,movement:i}}var f=n=>{let i=o(n),s=[];for(let o of i){let i=document.createElement(`li`),c=e(o),l=o.meta,u=r(n,l.target),d=u==null?`No target`:`Target: ${e(u)}`;switch(l.kind){case t:i.innerHTML=`
                    <p>${c}</p>

                    <ul>
                        <li>using: melee</li>
                        <li>speed: ${l.speed}</li>
                        <li>${d}</li>
                    </ul>
                `;break;case a:i.innerHTML=`
                    <p>${c}</p>

                    <ul>
                        <li>using: ranged</li>
                        <li>speed: ${l.speed}</li>
                        <li>${d}</li>
                        <li>range: ${l.range}</li>
                    </ul>
                `}s.push(i)}document.querySelector(`#list`)?.replaceChildren(...s)};document.querySelector(`#button`)?.addEventListener(`click`,s);var p=document.querySelector(`#panel`);p!=null&&(p.innerHTML=`<ul id="list"></ul>`),n.onReady(()=>{n.scene.items.onChange(f)});