"use strict";
/* ============================================================
   ASHVA · router / state machine.
   Now wired to the real backend: OTP auth, gatekeeper, custom KYC
   (MinIO upload), and DB-backed bookings. Screen markup lives in
   js/screens/*.js. API in js/api.js.
   ============================================================ */

const VIEWS={
  auth:viewAuth, gatekeeper:viewGatekeeper, home:viewHome, detail:viewDetail, booking:viewBooking,
  gear:viewGear, kyc:viewKyc, payment:viewPayment, pass:viewPass, routes:viewRoutes, route:viewRoute,
  bookings:viewBookings, trip:viewTrip, garage:viewGarage, gsub:viewGsub
};
const TABS=['home','routes','bookings','garage'];
const SPINNER=`<span style="display:inline-block;width:17px;height:17px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle"></span>`;

/* shared 6-cell OTP view (auth + gatekeeper) */
function otpCellsView(otp){
  otp=otp||'';
  return [0,1,2,3,4,5].map(i=>{const f=otp[i];return `<div style="flex:1;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:${F.g};font-weight:600;font-size:22px;color:${C.ink};background:${f?'rgba(226,84,42,.08)':C.surf};border:1px solid ${f?C.ember:C.line}">${f||''}</div>`;}).join('');
}

class Ashva{
  constructor(){
    this.s={
      screen:'auth',stack:[],
      auth:{mode:'email',val:'',step:'enter',otp:'',channel:null,dest:'',challengeId:null,busy:false},
      gk:{step:'phone',val:'',otp:'',challengeId:null,busy:false},
      kyc:{docType:'aadhaar',idNumber:'',fullName:'',docs:{},record:null,busy:false},
      bikeId:'him',routeId:'leh',
      bk:{bikeId:'him',hub:'Manali',date:14,days:6,gear:new Set(),method:'UPI',verified:false},
      fav:new Set(),seg:'active',gtab:null,
      user:null,assetMap:{},confirmed:null,
      prefs:{weather:true,convoy:false,ecall:true,offline:false}
    };
    this.timers=[];
    this.app=$('#app');this.nav=$('#nav');
    this.app.addEventListener('click',e=>this.onClick(e));
    this.app.addEventListener('input',e=>this.onInput(e));
    this.nav.addEventListener('click',e=>this.onClick(e));

    // restore a persisted session (instant boot), then refresh in the background
    const sess=API.getSession();
    if(sess&&sess.user){
      this.s.user=sess.user;
      const step=gateStep(sess.user);
      this.s.screen=(step&&!this.gkSkipped())?'gatekeeper':'home';
      if(step)this.s.gk.step=step;
      this.loadAssets();
      this.refreshMe();
    }else{
      const h=(typeof location!=='undefined'&&location.hash||'').slice(1);
      if(h&&VIEWS[h])this.s.screen=h;
    }
    this.render();
  }

  /* --- lifecycle --- */
  clearTimers(){this.timers.forEach(t=>clearInterval(t));this.timers=[];}
  go(screen,data){this.s.stack.push(this.s.screen);if(data)Object.assign(this.s,data);this.s.screen=screen;this.render();}
  tab(screen){this.s.stack=[];this.s.screen=screen;this.render();}
  back(){const p=this.s.stack.pop();if(p){this.s.screen=p;this.render();}}

  render(){
    this.clearTimers();
    const isTab=TABS.includes(this.s.screen);
    this.app.innerHTML=`<div class="scr" style="animation:a-screen .34s cubic-bezier(.16,1,.3,1)">${this.view()}</div>`;
    const nativeShell=document.documentElement.classList.contains('native');
    const bot=isTab?96:34;
    this.app.style.paddingBottom=nativeShell?`calc(${bot}px + env(safe-area-inset-bottom))`:bot+'px';
    this.nav.style.display=isTab?'block':'none';
    if(isTab)this.nav.innerHTML=this.navView();
    this.app.scrollTop=0;
    this.mount();
  }
  view(){
    try{return VIEWS[this.s.screen](this);}
    catch(err){return `<div style="padding:80px 24px;color:${C.red};font-family:${F.m}">render error in ${this.s.screen}: ${err.message}</div>`;}
  }
  mount(){
    if(this.s.screen==='home')mountHome(this);
    if(this.s.screen==='trip')mountTrip(this);
    if(this.s.screen==='kyc'&&!this.s.kyc.record)this.loadKyc();
  }

  navView(){
    const items=[['home','home','Explore'],['routes','routes','Routes'],['bookings','book','Bookings'],['garage','user','Garage']];
    const cur=this.s.screen;
    return `<div style="background:${C.base};border-top:1px solid ${C.line};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);padding:12px 14px calc(30px + env(safe-area-inset-bottom));box-shadow:0 -18px 30px -10px rgba(23,17,13,.9)">
      <div style="display:flex;justify-content:space-around;padding-top:4px">
      ${items.map(([sc,ic,lb])=>{const a=cur===sc;return `<div class="press" data-act="nav" data-to="${sc}" style="display:flex;flex-direction:column;align-items:center;gap:5px;color:${a?C.ember:C.faint};flex:1">
        ${navIcon(ic)}
        <span style="font-family:${F.m};font-size:9px;letter-spacing:.12em;text-transform:uppercase">${lb}</span>
        <div style="width:4px;height:4px;border-radius:50%;background:${a?C.ember:'transparent'}"></div>
      </div>`;}).join('')}
      </div></div>`;
  }

  /* --- inputs --- */
  onInput(e){
    const a=e.target,id=a.id;
    if(id==='authIn'){
      let v=a.value;if(this.s.auth.mode==='mobile')v=v.replace(/\D/g,'').slice(0,10);
      this.s.auth.val=v;
      const valid=authValid(this);const btn=$('#contBtn');
      if(btn){btn.style.background=valid?C.ember:'rgba(226,84,42,.25)';btn.style.color=valid?'#fff':'rgba(255,255,255,.4)';btn.style.pointerEvents=valid?'auto':'none';}
    }else if(id==='gkIn'){
      let v=a.value;if(this.s.gk.step==='phone')v=v.replace(/\D/g,'').slice(0,10);
      this.s.gk.val=v;
    }else if(id==='kycId'){this.s.kyc.idNumber=a.value;}
    else if(id==='kycName'){this.s.kyc.fullName=a.value;}
  }

  /* --- clicks --- */
  onClick(e){
    const t=e.target.closest('[data-act]');if(!t)return;
    const a=t.dataset.act,d=t.dataset;
    switch(a){
      case 'back':this.back();break;
      case 'nav':this.tab(d.to);break;
      case 'amode':this.s.auth.mode=d.m;this.s.auth.val='';this.render();break;
      case 'continue':this.authContinue();break;
      case 'google':this.googleSignin();break;
      case 'achange':this.s.auth.step='enter';this.s.auth.otp='';this.s.auth.challengeId=null;this.render();break;
      case 'resend':this.authResend();break;
      case 'otpkey':this.otpKey(d.k);break;
      case 'gksend':this.gkSend();break;
      case 'gkkey':this.gkKey(d.k);break;
      case 'gkchange':this.s.gk.otp='';this.s.gk.challengeId=null;this.render();break;
      case 'gkskip':try{localStorage.setItem('ashva.gkskip','1');}catch{}this.s.stack=[];this.s.screen='home';this.render();break;
      case 'bike':this.go('detail',{bikeId:d.id});break;
      case 'route':this.go('route',{routeId:d.id});break;
      case 'herobar':setHero(this,+d.i,true);break;
      case 'fav':this.toggleFav(d.id);break;
      case 'configure':this.s.bk.bikeId=d.id;this.s.bk.gear=new Set();this.s.bk.verified=false;this.go('booking');break;
      case 'hub':this.s.bk.hub=d.h;this.render();break;
      case 'date':this.s.bk.date=+d.d;this.render();break;
      case 'dur':this.s.bk.days=Math.max(1,Math.min(30,this.s.bk.days+ +d.v));this.render();break;
      case 'gearnext':this.go('gear');break;
      case 'gear':this.toggleGear(d.g);break;
      case 'kycnext':this.go('kyc');break;
      case 'kycdoc':this.s.kyc.docType=d.t;this.render();break;
      case 'kycpic':this.kycPic(d.p);break;
      case 'kycsubmit':this.kycSubmit();break;
      case 'paynext':if(this.s.bk.verified)this.go('payment');break;
      case 'method':this.s.bk.method=d.m;this.render();break;
      case 'pay':this.pay();break;
      case 'startride':this.go('trip');break;
      case 'endride':this.tab('bookings');break;
      case 'sos':this.flash('SOS sent · control room notified',C.red);break;
      case 'hazard':this.flash('Hazard lights on',C.amber);break;
      case 'seg':this.s.seg=d.s;this.render();break;
      case 'viewpass':this.go('pass');break;
      case 'routebike':{const r=route(this.s.routeId);this.go('detail',{bikeId:r.bikes[0]});break;}
      case 'gsub':this.go('gsub',{gtab:d.sub});break;
      case 'toggle':this.s.prefs[d.k]=!this.s.prefs[d.k];this.render();break;
      case 'signout':this.signOut();break;
    }
  }

  /* --- session helpers --- */
  setBtn(sel,html){const b=$(sel);if(b){b.innerHTML=html;b.style.pointerEvents='none';b.style.opacity='.85';}}
  refreshMe(){API.me().then(r=>{if(r.ok&&r.data.user){this.s.user=r.data.user;const sess=API.getSession();if(sess){sess.user=r.data.user;API.setSession(sess);}}});}
  loadAssets(){API.assets().then(r=>{if(r.ok){const m={};r.data.assets.forEach(a=>{if(a.slug)m[a.slug]=a.id;});this.s.assetMap=m;}});}
  afterLogin(){
    this.loadAssets();
    const step=gateStep(this.s.user);
    this.s.stack=[];
    if(step&&!this.gkSkipped()){this.s.gk={step,val:'',otp:'',challengeId:null,busy:false};this.s.screen='gatekeeper';}
    else this.s.screen='home';
    this.render();
  }
  gkSkipped(){try{return localStorage.getItem('ashva.gkskip')==='1';}catch{return false;}}
  signOut(){
    API.setSession(null);
    try{localStorage.removeItem('ashva.gkskip');}catch{}
    this.s.user=null;this.s.confirmed=null;this.s.assetMap={};
    this.s.stack=[];this.s.auth={mode:'email',val:'',step:'enter',otp:'',channel:null,dest:'',challengeId:null,busy:false};
    this.s.screen='auth';this.render();
  }

  /* --- auth (real OTP) --- */
  authContinue(){
    if(!authValid(this))return;
    const mode=this.s.auth.mode;
    const channel=mode==='mobile'?'phone':'email';
    const dest=mode==='mobile'?('+91 '+this.s.auth.val):this.s.auth.val;
    this.setBtn('#contBtn',SPINNER);
    API.startOtp(channel,dest).then(r=>{
      if(r.ok){
        this.s.auth.channel=channel;this.s.auth.dest=dest;this.s.auth.challengeId=r.data.challengeId;
        this.s.auth.step='otp';this.s.auth.otp='';this.render();
        this.flash('Code sent to '+dest,C.sun);
      }else{this.flash(r.error.message,C.red);this.render();}
    });
  }
  authResend(){
    const a=this.s.auth;a.otp='';
    API.startOtp(a.channel,a.dest).then(r=>{if(r.ok){a.challengeId=r.data.challengeId;this.flash('New code sent',C.sun);}else this.flash(r.error.message,C.red);this.render();});
  }
  otpKey(k){
    const a=this.s.auth;
    if(k==='⌫')a.otp=a.otp.slice(0,-1);else if(a.otp.length<6)a.otp+=k;
    const cells=$('#otpCells');if(cells)cells.innerHTML=otpCellsView(a.otp);
    if(a.otp.length===6)this.verifyAuthOtp();
  }
  verifyAuthOtp(){
    const a=this.s.auth;
    API.otpSignin({channel:a.channel,destination:a.dest,challengeId:a.challengeId,code:a.otp,countryCode:'+91'}).then(r=>{
      if(r.ok){API.setSession(r.data);this.s.user=r.data.user;this.afterLogin();}
      else{this.flash(r.error.message,C.red);a.otp='';this.render();}
    });
  }
  googleSignin(){
    const G=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.GoogleAuth;
    if(!G){this.flash('Google sign-in needs setup — use email or phone',C.amber);return;}
    G.signIn().then(res=>{
      const idToken=(res&&res.authentication&&res.authentication.idToken)||res.idToken;
      return API.googleSignin(idToken);
    }).then(r=>{
      if(r&&r.ok){API.setSession(r.data);this.s.user=r.data.user;this.afterLogin();}
      else if(r)this.flash(r.error.message,C.red);
    }).catch(()=>this.flash('Google sign-in cancelled',C.amber));
  }

  /* --- gatekeeper (verify the other contact channel) --- */
  gkValid(){const g=this.s.gk;return g.step==='phone'?/^\d{10}$/.test(g.val):/^\S+@\S+\.\S+$/.test(g.val);}
  gkSend(){
    if(!this.gkValid()){this.flash(this.s.gk.step==='phone'?'Enter a valid 10-digit number':'Enter a valid email',C.red);return;}
    const g=this.s.gk;const dest=g.step==='phone'?('+91 '+g.val):g.val;
    this.setBtn('#gkSendBtn',SPINNER);
    API.contactStart(g.step,dest).then(r=>{
      if(r.ok){g.dest=dest;g.challengeId=r.data.challengeId;g.otp='';this.render();this.flash('Code sent to '+dest,C.sun);}
      else{this.flash(r.error.message,C.red);this.render();}
    });
  }
  gkKey(k){
    const g=this.s.gk;
    if(k==='⌫')g.otp=g.otp.slice(0,-1);else if(g.otp.length<6)g.otp+=k;
    const cells=$('#gkCells');if(cells)cells.innerHTML=otpCellsView(g.otp);
    if(g.otp.length===6)this.gkVerify();
  }
  gkVerify(){
    const g=this.s.gk;
    API.contactVerify(g.challengeId,g.otp).then(r=>{
      if(r.ok){
        this.s.user=r.data.user;const sess=API.getSession();if(sess){sess.user=r.data.user;API.setSession(sess);}
        const step=gateStep(r.data.user);
        if(step){this.s.gk={step,val:'',otp:'',challengeId:null,busy:false};this.flash('Now verify your '+step,C.sun);this.render();}
        else{this.flash('Verified — welcome to ASHVA',C.green);this.s.stack=[];this.s.screen='home';this.render();}
      }else{this.flash(r.error.message,C.red);g.otp='';this.render();}
    });
  }

  /* --- custom KYC (real upload to MinIO) --- */
  loadKyc(){API.kycGet().then(r=>{if(r.ok&&r.data.record){this.s.kyc.record=r.data.record;if(['in_review','pending','approved'].includes(r.data.record.status))this.s.bk.verified=true;this.render();}});}
  async pickImage(){
    const Cam=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Camera;
    if(Cam){
      try{const photo=await Cam.getPhoto({quality:70,allowEditing:false,resultType:'uri',source:'PROMPT'});return {url:photo.webPath};}
      catch{return null;}
    }
    return await new Promise((resolve)=>{
      const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.setAttribute('capture','environment');
      inp.onchange=()=>{const f=inp.files&&inp.files[0];if(!f){resolve(null);return;}resolve({url:URL.createObjectURL(f),file:f});};
      inp.click();
    });
  }
  kycPic(p){
    this.pickImage().then(r=>{if(r){this.s.kyc.docs[p]=r;this.render();}}).catch(()=>this.flash('Could not capture photo',C.red));
  }
  async kycSubmit(){
    const k=this.s.kyc;
    if(!k.idNumber||!k.idNumber.trim()){this.flash('Enter your ID number',C.red);return;}
    const pages=Object.keys(k.docs);
    if(!pages.length){this.flash('Add at least one document photo',C.red);return;}
    this.setBtn('#kycSubmitBtn',SPINNER);
    try{
      const form=new FormData();
      form.append('docType',k.docType);form.append('idNumber',k.idNumber.trim());form.append('fullName',(k.fullName||'').trim());
      for(const p of pages){
        const dd=k.docs[p];let blob=dd.file;
        if(!blob){const resp=await fetch(dd.url);blob=await resp.blob();}
        form.append(p,blob,p+'.jpg');
      }
      const r=await API.kycSubmit(form);
      if(r.ok){this.s.kyc.record=r.data.record;this.s.bk.verified=true;this.flash('KYC submitted for review',C.green);this.render();}
      else{this.flash(r.error.message,C.red);this.render();}
    }catch{this.flash('Could not submit KYC. Try again.',C.red);this.render();}
  }

  /* --- booking (real DB) --- */
  pay(){
    const bk=this.s.bk;
    const assetId=this.s.assetMap[bk.bikeId];
    if(!assetId){this.flash('Fleet not loaded yet — please retry',C.red);return;}
    this.setBtn('#payBtn',SPINNER);
    const gear=[...bk.gear].map(id=>{const g=GEAR.find(x=>x.id===id);return g?{id:g.id,name:g.n,pricePerDay:g.p}:null;}).filter(Boolean);
    API.bookingCreate({assetId,days:bk.days,hub:bk.hub,gear}).then(r=>{
      if(r.ok){
        const b=r.data.booking;
        this.s.confirmed={ref:b.reference,bike:bike(bk.bikeId),hub:b.hub,rider:(this.s.user&&this.s.user.displayName)||'Rider',days:b.days,
          range:dlabel(bk.date)+' – '+dlabel(bk.date+bk.days),total:b.totalAmount};
        this.s.stack=['home','bookings'];this.s.screen='pass';this.render();
      }else{this.flash(r.error.message,C.red);this.render();}
    });
  }

  /* --- misc --- */
  toggleFav(id){if(this.s.fav.has(id))this.s.fav.delete(id);else this.s.fav.add(id);this.render();}
  toggleGear(id){const g=this.s.bk.gear;if(g.has(id))g.delete(id);else g.add(id);this.render();}
  flash(msg,col){
    const old=$('#flash');if(old)old.remove();
    const el=document.createElement('div');el.id='flash';
    el.style.cssText=`position:absolute;top:64px;left:24px;right:24px;z-index:80;padding:14px 18px;background:${C.surf};border:1px solid ${col};color:${col};font-family:${F.m};font-size:11px;letter-spacing:.08em;text-align:center;animation:rise .3s ease`;
    el.textContent=msg;$('#device').appendChild(el);
    const t=setTimeout(()=>{if(el)el.remove();},2200);this.timers.push(t);
  }
}

window.addEventListener('DOMContentLoaded',()=>{window.ashva=new Ashva();});
