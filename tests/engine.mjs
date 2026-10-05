import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog,decode,newRecord,validate,brief,sample} from '../web/engine.js';
const fixtures=JSON.parse(fs.readFileSync(new URL('./hexagram-fixtures.json',import.meta.url),'utf8')).bits;
for(const x of catalog.iching){
 const d=decode(fixtures[x.number].split('').map(b=>b==='1'?7:8));
 assert.equal(d.primary.number,x.number);
 assert.deepEqual(d.changing,[]);
}
assert.equal(decode([9,9,9,9,9,9]).related.number,2);
assert.equal(decode([6,6,6,6,6,6]).related.number,1);
assert.throws(()=>decode([7,7,7,8,8]));
for(const n of [1,2,3,10]){
 const r=newRecord('tarot','A question','user-supplied','custom',sample(catalog.tarot,n).map((s,i)=>({id:s.id,position:'Position '+(i+1),reversed:false})));
 r.secret='HIDDEN_PAYLOAD';r.results[0].secret='HIDDEN_SYMBOL_PAYLOAD';
 const clean=validate(r);
 assert.equal(clean.secret,undefined);assert.equal(clean.results[0].secret,undefined);
 assert.ok(!brief(r).includes('HIDDEN_'));
 assert.equal(new Set(r.results.map(x=>x.id)).size,n);
 assert.deepEqual(validate(JSON.parse(JSON.stringify(clean))),clean);
 assert.throws(()=>validate({...r,schema:'future/v99'}));
}
const rune=newRecord('runes','Question','user-supplied','focus',[{id:'rune-1',position:'Focus',reversed:false}]);
const iching=newRecord('iching','Question','user-supplied','six-lines',[7,7,7,8,8,8]);
const astro=newRecord('astrology','Question','user-supplied','known-placements',[{planet:'Mercury',sign:'Scorpio',houseKnown:false,house:null,system:'tropical',source:'user chart'}]);
for(const r of [rune,iching,astro])assert.deepEqual(validate(JSON.parse(JSON.stringify(r))),r);
assert.throws(()=>validate({...astro,basis:'digital-random'}));
console.log('PASS: browser-domain 64 independent fixtures, changes, custom spreads, inert canonical projection, brief privacy and four-tradition round trips.');
