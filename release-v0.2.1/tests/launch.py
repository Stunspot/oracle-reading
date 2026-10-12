"""Exercise actual loopback launch and collision handling using owned subprocesses."""
import json, re, subprocess, sys, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
owned=[]
def start():
 p=subprocess.Popen([sys.executable,'-B',str(ROOT/'serve.py')],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 owned.append(p);line=p.stdout.readline()
 match=re.search(r'http://127.0.0.1:(\d+)/',line)
 assert match,line or p.stderr.read()
 url=match.group(0)
 with urllib.request.urlopen(url,timeout=5) as response:assert b'<title>Oracle Reading' in response.read()
 return url,int(match.group(1))
try:
 first,port=start();second,other=start()
 assert port!=other,(first,second)
 collision=subprocess.run([sys.executable,'-B',str(ROOT/'serve.py'),'--port',str(port)],capture_output=True,text=True,timeout=5)
 assert collision.returncode!=0 and 'could not bind' in collision.stderr,collision
 print(json.dumps({'result':'PASS','distinct_actual_ports':True,'both_serve_Oracle_Reading':True,'explicit_collision_refused':True}))
finally:
 for p in owned:
  p.terminate()
  try:p.wait(timeout=5)
  except subprocess.TimeoutExpired:p.kill();p.wait()
