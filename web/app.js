/* Public projection only. The existing host AI authored the record and owns the encounter. */
(function(){
"use strict";
function openTable(){
 const root=document.getElementById("reading-table");
 if(!location.hash.startsWith("#table="))return;
 try{
  const encoded=location.hash.slice(7);if(encoded.length>600000)throw Error("Reading link is too large");
  const raw=JSON.parse(decodeURIComponent(encoded));if(JSON.stringify(raw).length>100000)throw Error("Reading record is too large");
  OracleTable.render(root,raw,ORACLE_RESOURCES);
 }catch(e){
  root.replaceChildren();const p=document.createElement("p");p.setAttribute("role","alert");
  p.textContent="This reading link could not be opened. Ask your AI to lay the table again.";root.append(p);
 }
}
window.addEventListener("hashchange",openTable);openTable();
})();

