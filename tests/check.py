from pathlib import Path
import importlib.util,json,itertools,unicodedata,re
ROOT=Path(__file__).resolve().parents[1]
c=json.loads((ROOT/'skills/oracle-reading/references/catalog.json').read_text(encoding='utf-8'))
f=json.loads((ROOT/'tests/hexagram-fixtures.json').read_text(encoding='utf-8'))['bits']
assert [len(c[k]) for k in ('tarot','runes','iching')]==[78,24,64]
for k in ('tarot','runes','iching'):
 assert len({x['id'] for x in c[k]})==len(c[k])
 assert all(x['meaning'] and x['reflection'] for x in c[k])
for x in c['iching']:
 assert x['bits']==f[str(x['number'])]
 assert unicodedata.name(x['glyph']).startswith('HEXAGRAM FOR ')
spec=importlib.util.spec_from_file_location('oracle',ROOT/'skills/oracle-reading/scripts/oracle.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
assert mod.decode([7,7,7,8,8,8])['primary']['number']==11
assert mod.decode([8,8,8,7,7,7])['primary']['number']==12
assert mod.decode([9]*6)['related']['number']==2
assert mod.decode([6]*6)['related']['number']==1
assert mod.decode([7,7,7,8,8,8])['changing']==[]
for vals in itertools.product((6,7,8,9),repeat=6):
 d=mod.decode(list(vals))
 assert d['primary']['bits']==''.join(str(x%2) for x in vals)
 assert d['related']['bits']==''.join(str(1-x%2 if x in (6,9) else x%2) for x in vals)
for vals in ([7]*5,[7]*7,[7,7,7,8,8,10],[7,7,7,8,8,True]):
 try:mod.decode(vals)
 except ValueError:pass
 else:raise AssertionError('Malformed cast accepted')
freq={i:0 for i in (6,7,8,9)}
for coins in itertools.product((2,3),repeat=3):freq[sum(coins)]+=1
assert freq=={6:1,7:3,8:3,9:1}
mirror=(ROOT/'web/catalog.js').read_text(encoding='utf-8')
assert json.loads(mirror.removeprefix('export const catalog = ').strip().removesuffix(';'))==c
skill=(ROOT/'skills/oracle-reading/SKILL.md').read_text(encoding='utf-8')
yaml=(ROOT/'skills/oracle-reading/agents/openai.yaml').read_text(encoding='utf-8')
description=re.search(r'^description: "(.*)"$',skill,re.M)[1]
assert f'short_description: "{description}"' in yaml
assert not re.search(r'[A-Z]:[\\/]',skill)
assert (ROOT/'skills/oracle-reading/references/record-contract.md').read_bytes()==(ROOT/'docs/CONTRACT.md').read_bytes()
print('PASS: catalog, independently anchored 64 figures, all 4096 line combinations, coin probabilities, invalid inputs, metadata and mirror parity.')
