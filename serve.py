"""Serve only the complete Oracle Reading product on loopback."""
import argparse, http.server, mimetypes, urllib.parse
from pathlib import Path
ROOT=Path(__file__).resolve().parent
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**k):super().__init__(*a,directory=str(ROOT),**k)
 def do_GET(self):
  raw=urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
  target=(ROOT/raw.lstrip('/')).resolve()
  if not target.is_relative_to(ROOT) or any(p.startswith('.') for p in Path(raw).parts):
   self.send_error(403);return
  if target.is_dir() and target!=ROOT:self.send_error(403);return
  super().do_GET()
 def end_headers(self):
  self.send_header('X-Content-Type-Options','nosniff')
  self.send_header('Referrer-Policy','no-referrer')
  self.send_header('Cache-Control','no-store')
  super().end_headers()
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--port',type=int,default=8765);a=p.parse_args()
 mimetypes.add_type('text/javascript','.js')
 print(f'Oracle Reading: http://127.0.0.1:{a.port} — keep this terminal open; Ctrl+C stops it.',flush=True)
 try:http.server.ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
 except KeyboardInterrupt:pass
