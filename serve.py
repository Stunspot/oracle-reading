"""Serve only Oracle Reading on an exclusive loopback port."""
import argparse, errno, http.server, mimetypes, socket, urllib.parse, webbrowser
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
class Server(http.server.ThreadingHTTPServer):
 allow_reuse_address=False
 def server_bind(self):
  if hasattr(socket,'SO_EXCLUSIVEADDRUSE'):
   self.socket.setsockopt(socket.SOL_SOCKET,socket.SO_EXCLUSIVEADDRUSE,1)
  super().server_bind()
def make_server(port):
 try:return Server(('127.0.0.1',8765 if port is None else port),Handler)
 except OSError as e:
  if port is not None or (e.errno not in (errno.EADDRINUSE,errno.EACCES) and getattr(e,'winerror',None) not in (10048,10013)):raise
  return Server(('127.0.0.1',0),Handler)
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('--port',type=int,help='Explicit port; fails clearly if occupied. Default: 8765, or an available port.')
 p.add_argument('--open',action='store_true',help='Open the actual bound address in your default browser.')
 a=p.parse_args()
 if a.port is not None and not 0<=a.port<=65535:p.error('Port must be between 0 and 65535.')
 mimetypes.add_type('text/javascript','.js')
 try:server=make_server(a.port)
 except OSError as e:p.exit(1,'Oracle Reading could not bind this port. Try python serve.py without --port.\n')
 with server:
  url=f'http://127.0.0.1:{server.server_port}/'
  print(f'Oracle Reading: {url} -- keep this terminal open; Ctrl+C stops it.',flush=True)
  if a.open:webbrowser.open(url)
  try:server.serve_forever()
  except KeyboardInterrupt:pass
