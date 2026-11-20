const fs = require('fs');
const sharp = require('/Users/aryan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='/Users/aryan/Documents/Codex/2026-09-22/can';
const icons=JSON.parse(fs.readFileSync(root+'/work/tripzy-icons.json','utf8'));
const artwork=[]; const texts=[];
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const path=(d,fill,stroke='',sw=1,extra='')=>artwork.push(`<path d="${d}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''} ${extra}/>`);
const rect=(x,y,w,h,r,fill,stroke='',sw=1)=>artwork.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`);
const circle=(x,y,r,fill,stroke='',sw=1)=>artwork.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`);
const text=(x,y,w,lines,size=24,color='#092859',weight=500,align='left',line=1.25)=>texts.push({x,y,w,lines:Array.isArray(lines)?lines:[lines],size,color,weight,align,line});
function icon(key,x,y,size,color){
 let svg=icons[key]; if(typeof svg!=='string')svg=svg.svg;
 artwork.push(`<g transform="translate(${x} ${y}) scale(${size/64})" color="${color}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${svg.replace(/<svg[^>]*>/,'').replace('</svg>','')}</g>`);
}
const defs=`<defs>
<linearGradient id="bg" x2="1" y2="1"><stop stop-color="#f4fbff"/><stop offset="1" stop-color="#e1f4ff"/></linearGradient>
<linearGradient id="blue"><stop stop-color="#047cf5"/><stop offset="1" stop-color="#003b9e"/></linearGradient>
<linearGradient id="green"><stop stop-color="#00af82"/><stop offset="1" stop-color="#006149"/></linearGradient>
<linearGradient id="gold"><stop stop-color="#e7a000"/><stop offset="1" stop-color="#946400"/></linearGradient>
<linearGradient id="navy" x2="1" y2="1"><stop stop-color="#0057b8"/><stop offset="1" stop-color="#061c4c"/></linearGradient>
<linearGradient id="sBlue" x2="1" y2="1"><stop stop-color="#72dcff"/><stop offset="1" stop-color="#26a9fb"/></linearGradient>
<linearGradient id="sGreen" x2="1" y2="1"><stop stop-color="#89f2c9"/><stop offset="1" stop-color="#29d5a2"/></linearGradient>
<linearGradient id="sPurple" x2="1" y2="1"><stop stop-color="#ceb3ff"/><stop offset="1" stop-color="#a070ef"/></linearGradient>
<linearGradient id="sCoral" x2="1" y2="1"><stop stop-color="#ffb9ae"/><stop offset="1" stop-color="#ff787e"/></linearGradient>
<linearGradient id="sGold" x2="1" y2="1"><stop stop-color="#ffe783"/><stop offset="1" stop-color="#ffc82f"/></linearGradient>
<linearGradient id="pBlue" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#d9f0ff"/></linearGradient>
<linearGradient id="pGreen" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#d7f6e9"/></linearGradient>
<linearGradient id="pGold" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#fff1c6"/></linearGradient>
<marker id="arrBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#0879e9"/></marker>
<marker id="arrGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#09b880"/></marker>
<marker id="arrGold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#dfab11"/></marker>
</defs>`;
rect(0,0,1920,1080,0,'url(#bg)');
// Sparse route and dot motifs maintain a bright, uncluttered background.
for(let i=0;i<31;i++)for(let j=0;j<7;j++){
 const x=24+i*11,y=22+j*11;
 if((i*13+j*7)%11<8)circle(x,y,1.5,'#b6dff4');
 if((i*7+j*5)%11<8)circle(1920-x,y,1.5,'#b6dff4');
}
path('M0 779Q420 683 899 801T1920 742V1080H0Z','#cbeeff');
path('M0 842Q580 754 980 866T1920 807V1080H0Z','#dff5ff');
path('M34 456Q199 381 368 441T623 410','none','#9ad0ed',2,'stroke-dasharray="6 9"');
path('M1298 410Q1480 484 1874 439','none','#9ad0ed',2,'stroke-dasharray="6 9"');
text(340,22,1240,'TRIPZY IMPACT ECOSYSTEM',53,'#06245c',800,'center');
rect(823,101,274,5,2.5,'#00a6e7');
// Four stakeholder cards.
function card(x,y,title,items,key,theme){
 const t={blue:['#057ae8','url(#blue)','url(#pBlue)','#e2f4ff'],green:['#00a879','url(#green)','url(#pGreen)','#d2f6e7'],gold:['#d99a00','url(#gold)','url(#pGold)','#ffebad']}[theme];
 rect(x+3,y+7,550,265,24,'#c6e0ec');
 rect(x,y,550,265,24,t[2],t[0],2);
 rect(x+2,y+2,546,8,5,t[0]);
 circle(x+93,y+120,67,'#fff',t[0],2); circle(x+93,y+120,58,t[3]);
 icon(key,x+49,y+77,88,t[0]);
 rect(x+181,y+26,345,53,16,t[1]);
 text(x+187,y+36,333,title,title==='LOCAL PARTNERS'?28:30,'#fff',750,'center');
 items.forEach((label,i)=>{circle(x+191,y+121+i*43,5,t[0]);text(x+209,y+104+i*43,320,label,24,'#0b2855',550);});
}
card(48,151,'TOURISTS',['Safer travel','Easy planning','Time & cost savings'],'tourist','blue');
card(1322,151,'LOCAL PARTNERS',['More customers','Secure payments','Economic empowerment'],'handshake','green');
card(48,525,'ENVIRONMENT',['Sustainable tourism','Responsible travel','Controlled growth'],'leaf','green');
card(1322,525,'GOVERNMENT',['Tourism insights','Trend monitoring','Efficient governance'],'government','gold');
// Directional connections between stakeholder cards and the central ecosystem.
path('M302 514Q275 470 302 427','none','#09b880',7,'stroke-linecap="round" marker-end="url(#arrGreen)"');
path('M1603 427Q1630 470 1603 514','none','#09b880',7,'stroke-linecap="round" marker-end="url(#arrGreen)"');
path('M616 182Q647 147 690 137','none','#0879e9',7,'stroke-linecap="round" marker-end="url(#arrBlue)"');
path('M1230 138Q1271 150 1305 187','none','#09b880',7,'stroke-linecap="round" marker-end="url(#arrGreen)"');
path('M1304 720Q1270 752 1227 759','none','#dfab11',7,'stroke-linecap="round" marker-end="url(#arrGold)"');
path('M691 760Q645 747 615 716','none','#dfab11',7,'stroke-linecap="round" marker-end="url(#arrGold)"');
const cx=960,cy=449,ro=291,ri=145;
circle(cx,cy+7,305,'#bcddec'); circle(cx,cy,304,'#fff','#65cdf6',3);
const point=(r,a)=>[cx+r*Math.cos(a*Math.PI/180),cy+r*Math.sin(a*Math.PI/180)];
function sector(a,b,fill){const p=point(ro,a),q=point(ro,b),u=point(ri,b),v=point(ri,a);path(`M${p}A${ro} ${ro} 0 0 1 ${q}L${u}A${ri} ${ri} 0 0 0 ${v}Z`,fill,'#fff',6,'stroke-linejoin="round"');}
['sBlue','sGreen','sPurple','sCoral','sGold'].forEach((fill,i)=>sector(-126+i*72,-54+i*72,`url(#${fill})`));
circle(cx,cy,143,'url(#navy)','#fff',4);
icon('plane',917,344,86,'#fff');
text(815,427,290,'TRIPZY',51,'#fff',800,'center');
rect(914,493,92,5,2.5,'#30e0e5');
text(834,514,252,['AI TRAVEL','ECOSYSTEM'],19,'#fff',700,'center',1.15);
icon('map',928,169,64,'#073673'); text(870,242,180,['AI Trip','Planner'],25,'#06285a',700,'center',1.12);
icon('hotelbus',1136,307,71,'#065c60');text(1103,391,151,['Verified Hotels','& Transport'],20,'#063945',700,'center',1.16);
icon('language',1063,536,69,'#37277c');text(989,620,220,['Multilingual','Assistant'],23,'#2a245e',700,'center',1.16);
icon('weather',789,536,70,'#07366a');text(710,620,230,['Weather &','SOS Support'],23,'#082953',700,'center',1.16);
icon('shieldcard',716,307,71,'#084c6b');text(671,393,168,['Secure','Payments'],24,'#082953',700,'center',1.16);
// A crisp foundation panel, with native text over scalable artwork.
path('M960 769V810','none','#0879e9',9,'stroke-linecap="round" marker-end="url(#arrBlue)"');
rect(48,839,1824,213,25,'#fff','#a2d7ef',2);
rect(48,829,1824,68,22,'url(#navy)');
text(544,846,832,'BUSINESS SUSTAINABILITY',32,'#fff',750,'center');
rect(61,909,589,131,16,'#e6f5ff');rect(665,909,589,131,16,'#e0f8ef');rect(1269,909,589,131,16,'#ede7ff');
const bottom=[{x:61,c:'#0065c9',t:'REVENUE',key:'revenue',l:['Subscriptions • Booking commissions','Partnerships • Grants']},{x:665,c:'#00765c',t:'SUPPORT',key:'cloud',l:['Cloud & technology • Tourism departments','Local communities']},{x:1269,c:'#603aaf',t:'GROWTH',key:'growth',l:['Cities → States → National reach','Millions of users']}];
bottom.forEach(({x,c,t,key,l})=>{circle(x+65,974,43,'#fff',c,1.5);icon(key,x+37,946,56,c);text(x+126,926,445,t,30,c,750,'center');text(x+116,973,462,l,20.5,'#12325c',500,'center',1.35);});
const svgText=texts.map(t=>`<text x="${t.align==='center'?t.x+t.w/2:t.x}" y="${t.y+t.size*.88}" fill="${t.color}" font-family="Arial, Helvetica, sans-serif" font-size="${t.size}" font-weight="${t.weight}" ${t.align==='center'?'text-anchor="middle"':''}>${t.lines.map((l,i)=>`<tspan x="${t.align==='center'?t.x+t.w/2:t.x}" dy="${i?t.size*t.line:0}">${esc(l)}</tspan>`).join('')}</text>`).join('');
const svgHead='<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160" viewBox="0 0 1920 1080">';
const background=svgHead+defs+artwork.join('')+'</svg>';
const svg=svgHead+defs+artwork.join('')+svgText+'</svg>';
const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tripzy Impact Ecosystem — 4K Vivid</title><style>*{box-sizing:border-box}html,body{margin:0;padding:0;background:#e7f5fc}.page{position:relative;width:3840px;height:2160px;overflow:hidden;font-family:Arial,Helvetica,sans-serif}.art{position:absolute;inset:0;width:3840px;height:2160px}.label{position:absolute;margin:0;white-space:nowrap}</style></head><body><main class="page" data-document-role="page" data-label="Tripzy Impact Ecosystem — 4K Vivid"><img class="art" alt="Scalable Tripzy circular infographic artwork and connectors" src="data:image/svg+xml;base64,${Buffer.from(background).toString('base64')}"/>${texts.map(t=>`<div class="label" style="left:${t.x*2}px;top:${t.y*2}px;width:${t.w*2}px;font-size:${t.size*2}px;line-height:${t.line};font-weight:${t.weight};color:${t.color};text-align:${t.align}">${t.lines.map(esc).join('<br>')}</div>`).join('')}</main></body></html>`;
fs.writeFileSync(root+'/outputs/tripzy-4k-vivid.html',html);
fs.writeFileSync(root+'/outputs/tripzy-4k-vivid.svg',svg);
sharp(Buffer.from(svg)).png().toFile(root+'/outputs/tripzy-4k-vivid.png').then(info=>console.log(JSON.stringify(info)));
