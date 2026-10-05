"""Acceptance checks for the exact state and projection seam, not oracle meaning."""
from pathlib import Path
import copy,importlib.util,json,sys,hashlib
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'skills/oracle-reading/scripts'))
import show
examples=ROOT/'skills/oracle-reading/examples/tables'
def rejects(call):
 try:call()
 except (ValueError,TypeError,KeyError):return
 raise AssertionError('Invalid state accepted')
for p in examples.glob('*.json'):
 r=show.normalize(show.read(p));show.continuity(r,None)
 html=show.fragment(r,True)
 assert len(html.encode())<1000000 and '<html' not in html and '<!doctype' not in html
 assert 'fetch(' not in html and 'XMLHttpRequest' not in html and 'WebSocket' not in html
r=show.normalize(show.read(examples/'tarot.json'))
next=copy.deepcopy(r);next['revision']=2;next['revealed'].append('wands-1');next['focus']='wands-1'
show.continuity(next,r);show.continuity(next,next)
mut=copy.deepcopy(next);mut['results'][0]['id']='swords-8'
rejects(lambda:show.continuity(mut,r))
mut=copy.deepcopy(next);mut['question']='Secretly new question'
rejects(lambda:show.continuity(mut,r))
rejects(lambda:show.continuity(next,None))
bad=copy.deepcopy(r);bad['focus']='major-8';rejects(lambda:show.normalize(bad))
bad=copy.deepcopy(r);bad['revealed']=['unknown'];rejects(lambda:show.normalize(bad))
bad=copy.deepcopy(r);bad['results'][0]['reversed']='false';rejects(lambda:show.normalize(bad))
bad=copy.deepcopy(r);bad['schema']='future';rejects(lambda:show.normalize(bad))
inj=copy.deepcopy(r);inj['question']='</script><script>window.bad=1</script>'
inj['secret']='unselected-private-data';html=show.fragment(show.normalize(inj),True)
assert 'window.bad=1</script>' not in html and 'unselected-private-data' not in html
quiet=copy.deepcopy(r);quiet.update(revision=2,phase='quiet');show.continuity(quiet,r)
clear=copy.deepcopy(r);clear.update(revision=2,phase='clear');c=show.normalize(clear);show.continuity(c,r)
html=show.fragment(c,True)
assert r['question'] not in html and 'threshold-example' in html and 'data:image' not in html
assert 'swords-9' not in json.dumps(c)
ich=show.normalize(show.read(examples/'iching.json'));d=show.oracle.decode(ich['lines'])
assert (d['primary']['number'],d['related']['number'],d['changing'])==(47,60,[1,4])
bad=copy.deepcopy(ich);bad['showRelated']=True;rejects(lambda:show.normalize(bad))
legacy={'schema':'oracle-reading/v1','catalogVersion':'0.1.0','id':'old','tradition':'tarot','basis':'user-supplied','question':'Old cast','results':[{'id':'major-9','position':'custom position','reversed':False}],'notes':'not chosen'}
converted=show.normalize(legacy);assert converted['revealed']==['major-9'] and converted['results'][0]['position']=='custom position' and not converted['thread']
manifest=json.loads((ROOT/'skills/oracle-reading/assets/cards/manifest.json').read_text(encoding='utf-8'))
assert len(manifest['cards'])==78
for item in manifest['cards']:
 art=ROOT/'skills/oracle-reading/assets/cards'/item['file'];assert hashlib.sha256(art.read_bytes()).hexdigest()==item['sha256']
 assert item['license']=='Public domain'
print('PASS: four projections, sequential/retry continuity, cast/question rejection, staged reveal, XSS text, quiet/clear, legacy cast, 78 exact art identities.')


oldich={**legacy,'tradition':'iching','results':[6,7,8,9,7,8]}
assert show.oracle.decode(show.normalize(oldich)['lines'])['primary']['number']==47
oldastro={**legacy,'tradition':'astrology','results':[{'planet':'Moon','sign':'Cancer','houseKnown':False,'house':None,'source':'Supplied','system':'Tropical'}]}
assert 'house' not in show.normalize(oldastro)['placements'][0]
