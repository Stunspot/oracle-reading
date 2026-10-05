"""Build the complete product and separately installable skill, without private cargo."""
import argparse, hashlib, json, unicodedata, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
VERSION=(ROOT/'VERSION').read_text().strip()
TOP=['index.html','serve.py','Launch Oracle Reading.cmd','README.md','LICENSE','VERSION','PROVENANCE.md','CHANGELOG.md','product.json','package.json']
FOLDERS=['web','docs','skills','tests','tools']
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def safe_name(name,extraction):
 parts=Path(name).parts
 assert not Path(name).is_absolute() and '..' not in parts
 for part in parts:
  assert len(part.encode('utf-8'))<=255, name
  assert not any(c in part for c in '<>:"|?*') and not part.endswith((' ','.')),name
  assert part.split('.')[0].upper() not in {'CON','PRN','AUX','NUL',*[f'COM{i}' for i in range(1,10)],*[f'LPT{i}' for i in range(1,10)]},name
 final=str(extraction/Path(name))
 assert len(final.encode('utf-16-le'))//2<=259, final
def archive(target,entries,extraction):
 seen=set()
 for source,name in entries:
  safe_name(name,extraction)
  key=unicodedata.normalize('NFC',name).casefold()
  assert key not in seen,name
  seen.add(key)
  assert source.is_file() and not source.is_symlink()
 temporary=target.with_name(target.name+'.tmp')
 with zipfile.ZipFile(temporary,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for source,name in sorted(entries,key=lambda x:x[1]):
   data=source.read_bytes()
   info=zipfile.ZipInfo(name,(2026,10,5,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16
   z.writestr(info,data)
 with zipfile.ZipFile(temporary) as z:
  assert z.testzip() is None
  for source,name in entries:assert hashlib.sha256(z.read(name)).hexdigest()==digest(source)
 temporary.replace(target)
 return {'name':target.name,'bytes':target.stat().st_size,'sha256':digest(target),'members':len(entries),'tree':{name:digest(source) for source,name in entries}}
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,default=ROOT/'dist');p.add_argument('--extraction-root',type=Path,required=True);a=p.parse_args()
 a.output.mkdir(parents=True,exist_ok=True)
 files=[ROOT/x for x in TOP]
 for folder in FOLDERS:
  files.extend(x for x in (ROOT/folder).rglob('*') if x.is_file() and '__pycache__' not in x.parts and x.suffix!='.pyc')
 assert all(x.exists() for x in files)
 root=f'oracle-reading-v{VERSION}/'
 complete=archive(a.output/f'Oracle Reading v{VERSION}.zip',[(x,root+x.relative_to(ROOT).as_posix()) for x in files],a.extraction_root)
 skill=ROOT/'skills/oracle-reading'
 standalone=archive(a.output/f'oracle-reading-skill-v{VERSION}.zip',[(x,'oracle-reading/'+x.relative_to(skill).as_posix()) for x in skill.rglob('*') if x.is_file() and '__pycache__' not in x.parts and x.suffix!='.pyc'],a.extraction_root)
 (a.output/'archive-ledger.json').write_text(json.dumps({'version':VERSION,'archives':[complete,standalone]},indent=2)+'\n',encoding='utf-8')
 (a.output/'SHA256SUMS.txt').write_text('\n'.join(f"{x['sha256']}  {x['name']}" for x in [complete,standalone])+'\n',encoding='utf-8')
 print(json.dumps({'version':VERSION,'archives':[{k:v for k,v in x.items() if k!='tree'} for x in [complete,standalone]],'path_preflight':'PASS: final roots, UTF-8 components, Windows UTF-16 extraction paths, reserved names and normalized case collisions'},indent=2))
if __name__=='__main__':main()
