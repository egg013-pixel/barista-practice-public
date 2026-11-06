/** Local-only PLY -> SPZ conversion. No external uploads or rendering service. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {chromium}=require('@playwright/test');
(async()=>{
 const input=path.resolve(process.argv[2]||'');if(!input.endsWith('.ply'))throw Error('Pass the cropped .ply produced by prepare-examiner-reference.py');
 const dir=path.dirname(require.resolve('@sparkjsdev/spark')),three=path.dirname(require.resolve('three'));
 const files={'/input.ply':input,'/spark.js':path.join(dir,'spark.module.js'),'/three.module.js':path.join(three,'three.module.js'),'/three.core.js':path.join(three,'three.core.js'),'/Pass.js':path.resolve(three,'../examples/jsm/postprocessing/Pass.js')};
 let bytes;
 const html=`<script type="importmap">{"imports":{"three":"/three.module.js","three/addons/postprocessing/Pass.js":"/Pass.js","@sparkjsdev/spark":"/spark.js"}}</script><script type="module">import{SplatMesh,writeSpz}from'@sparkjsdev/spark';const mesh=new SplatMesh({url:'/input.ply',lod:false});await mesh.initialized;const{fileBytes}=await writeSpz(mesh.packedSplats,{version:3,maxSh:0});await fetch('/output',{method:'POST',body:fileBytes});mesh.dispose();document.body.dataset.done='yes';</script><body></body>`;
 const server=http.createServer((req,res)=>{
  if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}
  if(req.method==='POST'&&req.url==='/output'){const chunks=[];req.on('data',c=>chunks.push(c));req.on('end',()=>{bytes=Buffer.concat(chunks);res.end('ok');});return;}
  const file=files[req.url];if(!file){res.statusCode=404;res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
  const page=await browser.newPage();page.on('pageerror',error=>console.error(error.message));await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForSelector('body[data-done=yes]',{timeout:90000});
  if(!bytes?.length)throw Error('No converted SPZ returned');
  const output=path.resolve(__dirname,'../public/models/examiner/provided-examiner.spz');fs.writeFileSync(output,bytes);
  const meta=JSON.parse(fs.readFileSync(input+'.json','utf8'));const manifest={file:path.basename(output),sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,...meta};
  fs.writeFileSync(path.join(path.dirname(output),'reference.json'),JSON.stringify(manifest,null,2)+'\n');console.log('Converted reference splats locally:',bytes.length,'bytes');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
