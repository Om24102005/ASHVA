"use strict";
/* ============================================================
   ASHVA · data layer — palette, fonts, fleet, routes, gear
   ============================================================ */

const C={base:'#17110D',surf:'#1F1813',well:'#1a130d',ink:'#F4EBDD',dim:'#B7A793',faint:'#7C6C5C',
  ember:'#E2542A',sun:'#F2873E',amber:'#F3A93B',green:'#2ea043',red:'#ef4444',
  line:'rgba(244,235,221,.1)',line2:'rgba(244,235,221,.06)'};

const F={s:"'Instrument Serif',serif",g:"'Space Grotesk',sans-serif",m:"'JetBrains Mono',monospace"};

/* per-bike / per-route cinematic gradient fallbacks (carry the look if a photo 404s) */
const G={
  himalayan:"linear-gradient(160deg,rgba(42,29,18,.2),#17110D 72%),radial-gradient(120% 85% at 72% 8%,rgba(226,84,42,.55),transparent 60%),linear-gradient(160deg,#3a2a1a,#17110D)",
  livewire:"linear-gradient(160deg,rgba(16,35,31,.25),#17110D 72%),radial-gradient(120% 85% at 28% 2%,rgba(45,190,168,.5),transparent 56%),linear-gradient(160deg,#10231f,#17110D)",
  ducati:"linear-gradient(160deg,rgba(46,20,16,.2),#17110D 70%),radial-gradient(120% 85% at 76% 4%,rgba(239,68,68,.55),transparent 56%),linear-gradient(160deg,#3a1a14,#17110D)",
  r6:"linear-gradient(160deg,rgba(16,26,46,.25),#17110D 72%),radial-gradient(120% 85% at 30% 4%,rgba(86,130,245,.45),transparent 56%),linear-gradient(160deg,#101a2e,#17110D)",
  ktm:"linear-gradient(160deg,rgba(44,28,12,.2),#17110D 70%),radial-gradient(120% 85% at 72% 4%,rgba(243,169,59,.5),transparent 56%),linear-gradient(160deg,#382410,#17110D)",
  leh:"linear-gradient(180deg,rgba(23,17,13,.15),#17110D),radial-gradient(110% 75% at 50% 0%,#3a5170,transparent 62%),linear-gradient(160deg,#1c2738,#17110D)",
  spiti:"linear-gradient(180deg,rgba(23,17,13,.15),#17110D),radial-gradient(110% 75% at 50% 2%,#7a5a3c,transparent 60%),linear-gradient(160deg,#2c2114,#17110D)",
  konkan:"linear-gradient(180deg,rgba(23,17,13,.12),#17110D),radial-gradient(110% 75% at 50% 2%,#1f6f74,transparent 60%),linear-gradient(160deg,#103034,#17110D)",
  rann:"linear-gradient(180deg,rgba(23,17,13,.1),#17110D),radial-gradient(110% 78% at 50% 4%,#d8b878,transparent 58%),linear-gradient(160deg,#3a2e1a,#17110D)"
};
const U="?auto=format&fit=crop&w=1400&q=80";

const BIKES=[
 {id:'him',maker:'ROYAL ENFIELD',name:'Himalayan 450',kicker:'ADVENTURE',type:'Adventure',tag:'Built for the high passes.',
  price:1800,rating:4.9,rides:312,grad:G.himalayan,photo:'https://images.unsplash.com/photo-1558981403-c5f9899a28bc'+U,
  engine:'452cc',power:'40 bhp',torque:'40 Nm',top:'151 km/h',weight:'196 kg',range:'450 km',tank:'17 L',
  about:'The Sherpa 450 breathes easy where oxygen runs thin. Long-travel Showa forks, a 21-inch front and a round TFT that maps the next pass — engineered ground-up for Ladakh’s broken tarmac and everything beyond it.',
  features:['452cc Sherpa Single','Switchable ABS','Round TFT + Maps','21" Front Wheel','200mm Travel','Tubeless Spoked']},
 {id:'lw',maker:'HARLEY-DAVIDSON',name:'LiveWire One',kicker:'ELECTRIC',type:'Electric',tag:'Silent. Instant. Relentless.',
  price:3600,rating:4.8,rides:148,grad:G.livewire,photo:'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87'+U,
  engine:'15.5 kWh',power:'105 bhp',torque:'116 Nm',top:'177 km/h',weight:'249 kg',range:'235 km',tank:'15.5 kWh',
  about:'Harley’s Revelation motor delivers all 116 Nm the instant you twist. No clutch, no gears, no noise — only a relentless electric shove and a range that tops up over a roadside chai stop.',
  features:['H-D Revelation Motor','0–100 in 3.0s','7 Ride Modes','DC Fast Charge','Cornering ABS','Cellular + GPS']},
 {id:'duc',maker:'DUCATI',name:'SuperSport 950',kicker:'SPORT',type:'Sport',tag:'Italian fire, road-tuned.',
  price:4200,rating:4.9,rides:96,grad:G.ducati,photo:'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2'+U,
  engine:'937cc',power:'110 bhp',torque:'93 Nm',top:'250 km/h',weight:'210 kg',range:'300 km',tank:'16 L',
  about:'A Panigale heart detuned for the real world. The 937cc Testastretta sings from one hairpin’s apex to the next, while a taller screen and roomier ergonomics let it devour ghats all day long.',
  features:['937cc Testastretta','Ducati Quick Shift','3 Riding Modes','Cornering ABS','Öhlins Ready','Full TFT Dash']},
 {id:'r6',maker:'YAMAHA',name:'YZF-R6',kicker:'SUPERSPORT',type:'Supersport',tag:'Born on the circuit.',
  price:3900,rating:4.7,rides:210,grad:G.r6,photo:'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838'+U,
  engine:'599cc',power:'117 bhp',torque:'61.7 Nm',top:'257 km/h',weight:'190 kg',range:'260 km',tank:'17 L',
  about:'A homologation special straight off the World Supersport grid. The 599cc four spins to the moon and the Deltabox frame reads the road telepathically — pure circuit DNA loosed onto open tarmac.',
  features:['599cc Inline-4','Deltabox Frame','Quick Shifter','6-Axis IMU','320mm Discs','YCC-T Throttle']},
 {id:'ktm',maker:'KTM',name:'790 Duke',kicker:'NAKED',type:'Naked',tag:'The scalpel of the hills.',
  price:3200,rating:4.8,rides:177,grad:G.ktm,photo:'https://images.unsplash.com/photo-1609630875171-b1321377ee65'+U,
  engine:'799cc',power:'105 bhp',torque:'87 Nm',top:'230 km/h',weight:'169 kg',range:'330 km',tank:'14 L',
  about:'The Scalpel. A compact LC8c parallel-twin wrapped in the lightest chassis in its class, carving switchbacks with surgical menace and electronics sharp enough to keep every input honest.',
  features:['799cc LC8c Twin','Cornering ABS','Track Pack','Quickshifter+','Lean Traction','TFT Dash']}
];

const INCLUDED=['Unlimited kilometres','24×7 roadside assist','Tyre & puncture cover','2 helmets + riding gear','Live GPS tracker','Sanitised on delivery'];

const ROUTES=[
 {id:'leh',name:'Manali → Leh',region:'LADAKH',days:6,km:490,alt:'5,359m',terrain:'HIGH ALTITUDE',grad:G.leh,
  photo:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'+U,bikes:['him','ktm'],
  blurb:'The pilgrimage every rider owes themselves — two of the world’s highest motorable passes in six unforgettable days.',
  legs:[{d:'DAY 1',km:80,t:'Manali → Jispa',n:'Climb out of the deodar pines into the season’s first thin air.'},
   {d:'DAY 2',km:120,t:'Jispa → Sarchu',n:'Baralacha La at 4,890m. The high plateau opens like a held breath.'},
   {d:'DAY 3',km:110,t:'Sarchu → Pang',n:'The Gata Loops, then the More Plains run flat and forever.'},
   {d:'DAY 4',km:90,t:'Pang → Leh',n:'Tanglang La crowns it before you drop into the Indus valley.'}]},
 {id:'spiti',name:'Spiti Circuit',region:'HIMACHAL',days:8,km:820,alt:'4,551m',terrain:'REMOTE',grad:G.spiti,
  photo:'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'+U,bikes:['him','ktm'],
  blurb:'A full loop through the cold desert — monasteries, fossil villages and the loneliest tarmac in India.',
  legs:[{d:'DAY 1',km:200,t:'Shimla → Sangla',n:'Apple orchards give way to the green Baspa gorge.'},
   {d:'DAY 2',km:180,t:'Sangla → Kaza',n:'Cross into the cold desert at the Khab confluence.'},
   {d:'DAY 3',km:240,t:'Kaza → Komic → Kaza',n:'The world’s highest villages and the Kee monastery.'},
   {d:'DAY 4',km:200,t:'Kaza → Manali',n:'Kunzum La and the Chandra valley close the loop.'}]},
 {id:'konkan',name:'Konkan Coast',region:'MAHARASHTRA',days:5,km:560,alt:'Sea level',terrain:'COASTAL',grad:G.konkan,
  photo:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'+U,bikes:['duc','lw'],
  blurb:'Cliff roads above the Arabian Sea, ferry crossings and white-sand coves the highways forgot.',
  legs:[{d:'DAY 1',km:140,t:'Mumbai → Alibaug',n:'Salt air, a ferry crossing and the first warm beach.'},
   {d:'DAY 2',km:150,t:'Alibaug → Ganpatipule',n:'Cliff roads carved high above the Arabian Sea.'},
   {d:'DAY 3',km:130,t:'Ganpatipule → Tarkarli',n:'White sand, still backwaters and sour-sweet kokum.'},
   {d:'DAY 4',km:140,t:'Tarkarli → Goa',n:'Cross the Terekhol river into the northern beaches.'}]},
 {id:'rann',name:'Rann of Kutch',region:'GUJARAT',days:4,km:420,alt:'Sea level',terrain:'DESERT',grad:G.rann,
  photo:'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0'+U,bikes:['him','lw'],
  blurb:'Ride straight at the horizon across an infinite white salt desert that meets the sky and never blinks.',
  legs:[{d:'DAY 1',km:110,t:'Ahmedabad → Bhuj',n:'Leave the city behind for the dry frontier country.'},
   {d:'DAY 2',km:100,t:'Bhuj → Dholavira',n:'Harappan ruins marooned on a white island.'},
   {d:'DAY 3',km:90,t:'Dholavira → White Rann',n:'Infinite salt, flat to every horizon at once.'},
   {d:'DAY 4',km:120,t:'White Rann → Bhuj',n:'Kala Dungar viewpoint, then the long road home.'}]}
];

const GEAR=[
 {id:'cam',n:'Action Cam',d:'4K helmet mount',p:400},
 {id:'jkt',n:'ADV Jacket',d:'CE armour, vented',p:350},
 {id:'comm',n:'Bluetooth Comms',d:'Convoy intercom',p:250},
 {id:'boot',n:'Riding Boots',d:'Waterproof, ankle',p:300},
 {id:'bag',n:'Tank Bag',d:'Magnetic, 18L',p:200},
 {id:'glove',n:'Gloves',d:'Knuckle-armoured',p:150}
];

const HUBS=[
 {id:'Manali',sub:'Himachal · Base camp',km:'0 km'},
 {id:'Leh',sub:'Ladakh · Summit hub',km:'490 km'},
 {id:'Delhi',sub:'NCR · Metro pickup',km:'540 km'}
];

const METHODS=[
 {id:'UPI',d:'GPay · PhonePe · Paytm'},
 {id:'Card',d:'Visa · Mastercard · RuPay'},
 {id:'Netbanking',d:'All major banks'},
 {id:'Wallet',d:'ASHVA Wallet · ₹2,400'}
];
