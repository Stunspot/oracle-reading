import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const cat=JSON.parse(fs.readFileSync(new URL('skills/oracle-reading/references/catalog.json',root),'utf8'));
const fixture=JSON.parse(fs.readFileSync(new URL('tests/hexagram-fixtures.json',root),'utf8')).bits;
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('skills/oracle-reading/assets/table.js',root),'utf8'),ctx);
for(const name of ['tarot','runes','iching','astrology']){
 const raw=JSON.parse(fs.readFileSync(new URL('skills/oracle-reading/examples/tables/'+name+'.json',root),'utf8'));
 assert.equal(ctx.OracleTable.normalize(raw,cat).tradition,name);
}
for(const [number,bits] of Object.entries(fixture)){
 const d=ctx.OracleTable.decode([...bits].map(x=>x==='1'?7:8),cat);
 assert.equal(d.primary.number,Number(number));assert.equal(d.related.number,Number(number));
}
const d=ctx.OracleTable.decode([6,7,8,9,7,8],cat);
assert.equal(d.primary.number,47);assert.equal(d.related.number,60);assert.deepEqual(Array.from(d.changing),[1,4]);
const raw=JSON.parse(fs.readFileSync(new URL('skills/oracle-reading/examples/tables/tarot.json',root),'utf8'));
assert.throws(()=>ctx.OracleTable.normalize({...raw,focus:'major-8'},cat));
assert.throws(()=>ctx.OracleTable.normalize({...raw,revision:0},cat));
assert.throws(()=>ctx.OracleTable.normalize({...raw,revealed:['alien']},cat));
assert.equal(ctx.OracleTable.normalize({...raw,phase:'clear'},cat).question,undefined);
console.log('PASS: browser state validator, independent 64 figures, staged cast, malformed reveal, clear projection.');

