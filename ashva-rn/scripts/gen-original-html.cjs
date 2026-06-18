const fs=require('fs'),path=require('path');
const root='/Users/omendarsingh/REN/www';
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
// full-screen native mode (skips the desktop phone-frame; OS draws status bar)
html=html.replace('<html lang="en">','<html lang="en" class="native">');
// inline stylesheet
const css=fs.readFileSync(path.join(root,'css/styles.css'),'utf8');
html=html.replace('<link rel="stylesheet" href="css/styles.css">','<style>\n'+css+'\n</style>');
// inline every local script (preserve index.html order); repoint API at cloud
let count=0;
html=html.replace(/<script src="([^"]+)"><\/script>/g,(m,src)=>{
  let code=fs.readFileSync(path.join(root,src),'utf8');
  if(src.endsWith('config.js')){
    code=code.replace(/http:\/\/[0-9.]+:4000/g,'https://ashva-api.onrender.com')
             .replace(/http:\/\/localhost:4000/g,'https://ashva-api.onrender.com');
  }
  count++;
  return '<script>\n'+code+'\n</script>';
});
const out='/* AUTO-GENERATED from www/ — the exact original ASHVA app, inlined for WebView.\n   Do not edit by hand; regenerate from www/ if the original changes. */\n/* eslint-disable */\nexport const ORIGINAL_HTML = '+JSON.stringify(html)+';\n';
fs.writeFileSync('/Users/omendarsingh/REN/ashva-rn/src/originalHtml.ts',out);
console.log('inlined scripts:',count,'| html bytes:',html.length);
