// Bulk Line regression cases (run: node tests/bulk-regression.js)
// Mirrors Bulk Line's current NET-to-fill rules; does not require a browser.
'use strict';
const assert=require('node:assert/strict');
const F=2.2046;
const ceilKg=x=>Math.ceil(x-1e-9);
function exact({netPerTote,totalNet,fullNet,ea,over,chem=0,samples=5}){
 const factor=(1+over/100)*(1+chem/100);
 let full=ea,partial=0,net=netPerTote;
 if(totalNet!==undefined){
   net=fullNet;full=Math.floor((totalNet+1e-7)/net);
   const rest=totalNet-full*net;
   partial=Math.abs(rest)<1e-7?0:Math.max(0,rest);
   assert.equal(full+(partial>1e-8?1:0),ea,'Order EA mismatch');
 }
 const scale=ceilKg(net*factor),partialScale=partial>1e-8?ceilKg(partial*factor):0;
 return {full,partial,scale,partialScale,required:full*scale+partialScale+samples};
}
const a=exact({totalNet:30000,fullNet:1000,ea:30,over:0.5});
assert.equal(a.scale,1005);assert.equal(a.required,30155);
const b=exact({totalNet:29741,fullNet:1000,ea:30,over:0.5});
assert.equal(b.full,29);assert.equal(b.partial,741);assert.equal(b.partialScale,745);assert.equal(b.required,29895);
const c=exact({netPerTote:(5000000/3896)/F,ea:60,over:1,chem:1.2});
assert.equal(c.scale,596);assert.equal(c.required,35765);
const d={available:3120.5,samples:5,totes:4,fill:778,orderNet:3123.5};
assert.equal(d.available-d.samples-d.totes*d.fill,3.5);
assert.equal(d.orderNet-d.totes*d.fill,11.5);
const e=exact({totalNet:741,fullNet:1000,ea:1,over:0.5});
assert.equal(e.full,0);assert.equal(e.partialScale,745);assert.equal(e.required,750);
console.log('Bulk regression: 5 cases passed (PO1, PO2, PO3, PO4, partial-only).');
