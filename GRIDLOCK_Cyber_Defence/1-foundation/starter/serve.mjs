/**
 * A small local web server for this folder. No install needed.
 *   npm start            then open http://127.0.0.1:8080
 *   PORT=3000 npm start  to use another port
 *
 * It serves the whole pack folder, plus one extra address, /api/assets, which lists the artwork
 * files so the artwork viewer can show them. It only answers this computer.
 */
import http from 'node:http';
import {readFile,readdir,realpath,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ConfigStore} from '../../admin/config-store.mjs';

const root = await realpath(fileURLToPath(new URL('../../',import.meta.url)));
const home = '/gridlock/index.html';
const store = new ConfigStore(root);
const jsonHeaders = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
function sendJSON(res,status,value,head=false){res.writeHead(status,jsonHeaders);res.end(head?undefined:JSON.stringify(value));}
async function readJSON(req){
 if(req.headers['content-type']?.split(';')[0]!=='application/json')throw Error('Send application/json.');
 let bytes=0,chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>1024*1024)throw Error('Request exceeds 1 MB.');chunks.push(chunk);}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Error('Invalid JSON request.');}
}
const adminPaths=new Set(['/api/admin/state','/api/admin/original','/api/admin/history','/api/admin/snapshot','/api/admin/save','/api/admin/restore']);
const port = Number(process.env.PORT || 8080);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.csv':'text/csv; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.ico':'image/x-icon','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.bin':'application/octet-stream'};
const assetFolders = ['1-foundation/artwork','2-extend/artwork','2-extend/previews','2-extend/worlds'];

async function walk(folder, found = []) {
  let entries = [];
  try { entries = await readdir(path.join(root, folder), {withFileTypes:true}); } catch { return found; }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const relative = folder + '/' + entry.name;
    if (entry.isDirectory()) await walk(relative, found);
    else if (entry.isFile()) found.push({path: relative, bytes: (await stat(path.join(root, relative))).size});
  }
  return found;
}

const server = http.createServer(async (req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (name === '/api/game-config' && ['GET','HEAD'].includes(req.method)) {return sendJSON(res,200,await store.current(),req.method==='HEAD');}
    if (adminPaths.has(name)) {
      const readOnly=['/api/admin/state','/api/admin/original','/api/admin/history','/api/admin/snapshot'];
      if (readOnly.includes(name) && !['GET','HEAD'].includes(req.method))return sendJSON(res,405,{error:'Method not allowed'});
      if (!readOnly.includes(name) && req.method!=='POST')return sendJSON(res,405,{error:'Method not allowed'});
      if(req.method==='POST'){
        const origin=req.headers.origin;const host=req.headers.host;
        if(origin && new URL(origin).host!==host)return sendJSON(res,403,{error:'Admin accepts same-origin requests only.'});
      }
      try{
        if(name==='/api/admin/state')return sendJSON(res,200,await store.current(),req.method==='HEAD');
        if(name==='/api/admin/original')return sendJSON(res,200,{config:await store.original()},req.method==='HEAD');
        if(name==='/api/admin/history')return sendJSON(res,200,{history:await store.history()},req.method==='HEAD');
        if(name==='/api/admin/snapshot')return sendJSON(res,200,await store.snapshot(new URL(req.url,'http://localhost').searchParams.get('revision') || ''),req.method==='HEAD');
        const body=await readJSON(req);
        const detail={expectedRevision:body.expectedRevision,note:body.note};
        if(name==='/api/admin/save')return sendJSON(res,200,await store.save(body.config,detail));
        return sendJSON(res,200,await store.restore(body.revision,detail));
      }catch(err){return sendJSON(res,/Another version is active/.test(err.message)?409:400,{error:err.message});}
    }
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    if (name === '/api/assets') {
      const files = [];
      for (const folder of assetFolders) await walk(folder, files);
      files.sort((a, b) => a.path.localeCompare(b.path));
      res.writeHead(200, {'Content-Type': mime['.json'], 'Cache-Control': 'no-store'});
      return res.end(req.method === 'HEAD' ? undefined : JSON.stringify({files}));
    }
    if (name === '/') { res.writeHead(302, {Location: home}); return res.end(); }
    if (name.split('/').some(piece => piece.startsWith('.'))) {res.writeHead(403);return res.end('Forbidden');}
    if (name.endsWith('/')) name += 'index.html';
    const file = await realpath(path.resolve(root, '.' + name));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.on('error', e => { console.error(`Could not start: ${e.message}. Close the other server or choose another PORT.`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Running at http://127.0.0.1:${server.address().port}/  (Ctrl+C to stop)`));
