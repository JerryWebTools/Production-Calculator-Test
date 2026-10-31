(()=>{'use strict';
const $=id=>document.getElementById(id), F=2.2046, SETTINGS_KEY='production-calculator-v22-settings', SAVED_KEY='production-calculator-v22-saved';
const CROPS={1:['normalCorn','shrunkenCorn','peas','beans','spinach','other'],3:['normalCorn','shrunkenCorn','peas','spinach','other'],4:['peas','beans'],leg:['normalCorn','shrunkenCorn','peas','beans','spinach','other'],standalone:['normalCorn','shrunkenCorn','peas','beans','spinach','other']};
const NAMES={normalCorn:'Normal Corn',shrunkenCorn:'Shrunken Corn',peas:'Peas',beans:'Beans',spinach:'Spinach',other:'Other'};
const read=(key,fallback)=>{try{const x=JSON.parse(localStorage.getItem(key));return x&&typeof x==='object'?x:fallback}catch{return fallback}};
let overrides=read(SETTINGS_KEY,{}),saved=Array.isArray(read(SAVED_KEY,[]))?read(SAVED_KEY,[]):[],line=null,mode=null,extraManual=false,settingReturn='calc',lastResult=null;
const fmt=(x,d)=>Number(x).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validPositive=x=>Number.isFinite(x)&&x>0;
const persist=(key,obj)=>{try{localStorage.setItem(key,JSON.stringify(obj));return true}catch{alert('Unable to save on this device. Check browser storage settings.');return false}};
function show(view){['home','modeScreen','coming','calc','settings','saved','quick','preferences','brain'].forEach(id=>$(id).hidden=id!==view);$('settingsBtn').hidden=false;$('homeRefreshBtn').hidden=view!=='home';document.body.classList.toggle('quick-active',view==='quick');if($('installBanner'))$('installBanner').hidden=view!=='home'||window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true||(()=>{try{return localStorage.getItem('production-calculator-install-banner-dismissed')==='yes'}catch{return false}})();document.body.classList.toggle('brain-active',view==='brain');const navOn=view!=='home'&&view!=='quick'&&view!=='brain';$('globalNav').hidden=!navOn;['back','modeBack','quickBack'].forEach(id=>$(id).hidden=true);const backId=view==='calc'?'back':view==='modeScreen'?'modeBack':view==='quick'?'quickBack':null;if(backId)$(backId).hidden=false;$('modeLabel').hidden=true;document.querySelector('header').classList.toggle('insideView',navOn);}
function title(name,sub){$('title').textContent=(document.querySelector('#calc:not([hidden])')&&sub&&['Treat & Pack','Treat Only','Pack Only'].includes(sub))?name+' · '+sub:name;$('subtitle').textContent=sub;}
function home(){line=null;mode=null;show('home');title('Production Calculator','Choose a production line.');}
function openLine(v){line=v;if(v==='bulk'){show('coming');title('Bulk Line','Work in progress');return;}if(v==='3'||v==='4'){show('modeScreen');title('Line '+v,'Choose a calculation mode.');return;}openCalc(v==='1'?'treat':'standalone');}
function cropOptions(select,items){select.innerHTML=items.map(c=>`<option value="${c}">${NAMES[c]}</option>`).join('');}
function defaults(l,c,s){return {over:(c==='spinach'&&(l==='3'||l==='standalone'||l==='leg')?0.5:s==='commercial'?1:0.5),chem:(l==='3'||l==='standalone'||l==='leg')?(c==='normalCorn'?1:c==='shrunkenCorn'?1.2:0):0};}
function settingKey(l,c,s){return `${l}|${c}|${s}`;}
function rates(l,c,s){return {...defaults(l,c,s),...(overrides[settingKey(l,c,s)]||{})};}
const isPackOnly=()=>line==='standalone'||line==='leg';
const lineName=v=>v==='standalone'?'Stand-Alone':v==='leg'?'Leg':v==='bulk'?'Bulk Line':'Line '+v;
function openCalc(m){mode=m;show('calc');title(lineName(line),isPackOnly()?'Pack Only':m==='pack'?'Treat & Pack':'Treat Only');$('modeLabel').textContent=isPackOnly()?'Pack Only':m==='pack'?'Treat & Pack':'Treat Only';$('cropField').hidden=line==='1'||((line==='3'||line==='4')&&mode==='treat');$('conditionField').hidden=!isPackOnly();$('tareField').hidden=!(isPackOnly()||m==='pack');$('extraPanel').hidden=!(mode==='pack'&&(line==='3'||line==='4'));$('bagResults').hidden=!(isPackOnly()||mode==='pack');$('standaloneGuide').hidden=!['standalone','leg','1','3','4'].includes(line);$('standaloneGuide').open=false;$('guideContent').replaceChildren();$('resultHeading').textContent=isPackOnly()?'Total Seed Required':'Seed to Treat';$('bagHeading').textContent='Net Seed Weight / EA';$('secondHeading').textContent='Gross Bag Weight / EA';cropOptions($('crop'),CROPS[line]);reset();renderSaved();}
function reset(){ $('availableKg').value=''; $('availableKg').value=''; $('crop').value=CROPS[line][0];$('seedType').value='commercial';$('condition').value='treated';$('packSize').value='';$('packUnit').value='KS';$('ea').value='';$('pc').value='';$('tare').value='0';$('tareUnit').value='KG';$('regular').value='auto';$('calcId').value='';$('sampleRows').innerHTML='';$('samplesBody').hidden=true;$('samplesToggle').textContent='Edit ▾';extraManual=false;$('extra').value='0';calculate();}
function back(){if(line==='3'||line==='4'){show('modeScreen');title('Line '+line,'Choose a calculation mode.');}else home();}
function unitKg(w,u,pc){if(u==='KG')return w;if(u==='G')return w/1000;if(u==='LB')return w/F;if(u==='KS')return w*1000/pc/F;if(u==='MS')return w*1000000/pc/F;return NaN;}
function sampleRows(){return [...document.querySelectorAll('.sample-row')].map(el=>({qty:el.querySelector('.sampleQty').value,weight:el.querySelector('.sampleWeight').value,unit:el.querySelector('.sampleUnit').value}));}
function addSample(row={qty:'1',weight:'',unit:'KG'}){if($('sampleRows').children.length>=20)return;const div=document.createElement('div');div.className='sample-row';div.innerHTML=`<label>Quantity<input class="sampleQty" type="number" min="1" step="1" value="${esc(row.qty)}"></label><label>Weight each<input class="sampleWeight" type="number" min="0" step="any" value="${esc(row.weight)}"></label><label>Unit<select class="sampleUnit">${['KG','G','LB','KS'].map(u=>`<option ${row.unit===u?'selected':''}>${u}</option>`).join('')}</select></label><button class="secondary removeSample" type="button" aria-label="Remove sample">✕</button>`;$('sampleRows').append(div);div.querySelector('.removeSample').onclick=()=>{div.remove();calculate();};div.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',calculate));calculate();}
function updateExtra(){if($('extraPanel').hidden)return;const ea=Number($('ea').value),suggested=validPositive(ea)?1+Math.ceil(ea/100):0;$('extraSuggested').textContent=`Suggested: +${suggested} EA`;$('eaSummary').textContent=`Calculated EA: ${validPositive(ea)?Math.floor(ea)+Math.max(0,Number($('extra').value)||0):'—'}`;}
function calculate(){lastResult=null;$('error').hidden=true;const size=Number($('packSize').value),order=Number($('ea').value),pc=Number($('pc').value),unit=$('packUnit').value,seed=$('seedType').value,crop=$('crop').value,condition=$('condition').value;const countPack=['KS','MS'].includes(unit),sampleUsesPC=sampleRows().some(r=>r.unit==='KS'&&r.weight!==''&&r.qty!=='');$('pcField').hidden=!(countPack||sampleUsesPC);updateExtra();const r=rates(line,crop,seed),chem=isPackOnly()?(condition==='treated'?r.chem:0):(mode==='pack'?r.chem:0),over=r.over;$('rates').textContent=`Overpack: ${over}% · Chemical Weight: ${chem}%${overrides[settingKey(line,crop,seed)]?' · Modified Settings':''}`;$('rates').classList.toggle('settingmodified',!!overrides[settingKey(line,crop,seed)]);const reg=$('regular').value==='auto'?(seed==='commercial'?5:3):$('regular').value==='none'?0:Number($('regular').value);let custom=0,invalidSample=false;for(const s of sampleRows()){if(s.qty===''&&s.weight==='')continue;const q=Number(s.qty),w=Number(s.weight);if(!Number.isInteger(q)||q<=0||!validPositive(w)||(s.unit==='KS'&&!validPositive(pc))){invalidSample=true;continue;}custom+=q*unitKg(w,s.unit,pc);}const samples=reg+custom;$('sampleSummary').textContent=`Samples: ${fmt(samples,3)} KG · ${fmt(samples*F,2)} LB`;
const valid=validPositive(size)&&Number.isInteger(order)&&order>0&&(!countPack||validPositive(pc))&&(!sampleUsesPC||validPositive(pc))&&!invalidSample&&(!(isPackOnly()||mode==='pack')||(Number.isFinite(Number($('tare').value))&&Number($('tare').value)>=0&&$('tare').value!==''));if(!valid){if(['standalone','leg','1','3','4'].includes(line)){$('standaloneGuide').hidden=true;$('guideContent').replaceChildren();}$('packAll').hidden=true;$('totalKg').textContent='—';$('totalLb').textContent='—';$('bagKg').textContent='—';$('bagLb').textContent='—';$('secondKg').classList.remove('tare-prompt');$('secondKg').textContent='—';$('secondLb').textContent='—';$('breakdown').innerHTML='';$('resultContext').textContent='Enter order details to calculate.';if(invalidSample){$('error').textContent='Complete or remove invalid custom sample rows.';$('error').hidden=false;}return;}
const base=unitKg(size,unit,pc),extra=$('extraPanel').hidden?0:Number($('extra').value),calcEa=order+extra;if(!Number.isInteger(extra)||extra<0){$('error').textContent='Extra EA must be a whole number of zero or greater.';$('error').hidden=false;return;}
const netBag=base*(1+over/100)*(1+chem/100),tareKg=(isPackOnly()||mode==='pack')?unitKg(Number($('tare').value),$('tareUnit').value,pc):0,scaleBag=netBag+tareKg;const seedBase=base*calcEa,overKg=seedBase*over/100,raw=isPackOnly()?netBag*order+samples:seedBase+overKg+samples;const totalKg=Math.ceil(raw),totalLb=totalKg*F;$('totalKg').textContent=fmt(totalKg,0)+' KG';$('totalLb').textContent=fmt(totalLb,2)+' LB';$('resultContext').textContent=`${calcEa} EA · ${fmt(samples,3)} KG samples included`;
if(isPackOnly()||mode==='pack'){$('bagKg').textContent=fmt(netBag,3)+' KG';$('bagLb').textContent=fmt(netBag*F,2)+' LB';$('secondKg').classList.toggle('tare-prompt',tareKg<=0);$('secondKg').textContent=tareKg>0?fmt(scaleBag,3)+' KG':'Enter Bag Tare to calculate';$('secondLb').textContent=tareKg>0?fmt(scaleBag*F,2)+' LB':'';}
const breakdown=[['Base KG / EA',fmt(base,3)+' KG / '+fmt(base*F,2)+' LB'],['Order EA',String(order)],['Extra EA',String(extra)],['Calculated EA',String(calcEa)],['Overpack',over+'%'],['Chemical Weight',chem+'%'],['Regular Sample',fmt(reg,3)+' KG'],['Custom Samples',fmt(custom,3)+' KG']];if(isPackOnly()||mode==='pack'){breakdown.push(['Bag Tare',fmt(tareKg,3)+' KG / '+fmt(tareKg*F,3)+' LB'],['Net Seed Weight / EA',fmt(netBag,3)+' KG / '+fmt(netBag*F,2)+' LB'],['Gross Bag Weight / EA',tareKg>0?fmt(scaleBag,3)+' KG / '+fmt(scaleBag*F,2)+' LB':'Enter Bag Tare to calculate']);}else{breakdown.push(['Base requirement',fmt(seedBase,3)+' KG'],['Overpack weight',fmt(overKg,3)+' KG']);if(mode==='pack')breakdown.push(['Finished Bag Target',fmt(netBag,3)+' KG / '+fmt(netBag*F,2)+' LB']);}breakdown.push(['Final rounded total',fmt(totalKg,0)+' KG / '+fmt(totalLb,2)+' LB']);$('breakdown').innerHTML=breakdown.map(([a,b])=>`<div class="detailrow"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join('');lastResult={line,mode,crop,seed,condition,packSize:size,packUnit:unit,pc:countPack||sampleUsesPC?pc:null,orderEa:order,extraEa:extra,calculatedEa:calcEa,over,chem,regular:reg,customSampleKg:custom,rawTotalKg:raw,regularSelection:$('regular').value,customSamples:sampleRows(),tareKg,netBag,scaleBag,base,seedBase,overKg,totalKg,totalLb,samples,bagKg:netBag,bagLb:netBag*F};if(['standalone','leg','1','3','4'].includes(line)){$('standaloneGuide').hidden=false;if($('standaloneGuide').open)renderCalculationGuide();}renderPackAll();}
// Operator-facing explanation uses the same already-computed values as calculate().
// It never changes any production formulas or stored results.
function renderCalculationGuide(){
 if(lastResult?.line==='leg'){renderLegGuide();return;}
 if(lastResult?.line==='1'){renderLine1Guide();return;}
 if(lastResult?.line==='3'){renderLine3Guide();return;}
 if(lastResult?.line==='4'){renderLine4Guide();return;}
 renderStandaloneGuide();
}
function renderLegGuide(){renderPackOnlyGuide('leg');}
function renderStandaloneGuide(){renderPackOnlyGuide('standalone');}
function renderPackOnlyGuide(expectedLine){
 const r=lastResult, el=$('guideContent');
 if(!r||r.line!==expectedLine){el.replaceChildren();return;}
 const es=prefs.language==='es';
 const text=(en,sp)=>es?sp:en;
 const n=x=>Number(x).toLocaleString('en-US',{maximumFractionDigits:5});
 const w=x=>fmt(x,5);
 const pct=x=>n(x);
 const overAdded=r.base*r.over/100;
 const perBagOver=r.base+overAdded;
 const chemAdded=perBagOver*r.chem/100;
 const seedOrder=r.netBag*r.orderEa;
 const raw=r.rawTotalKg;
 const totalLbs=r.totalLb;
 const row=(label,value)=>`<div class="guideRow"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
 const block=(num,title,explain,formula,result)=>`<section class="guideStep"><div class="guideStepTitle"><span class="guideNum">${num}</span><strong>${esc(title)}</strong></div><p>${esc(explain)}</p><div class="guideMath">${esc(formula)}</div>${result?`<div class="guideResult">${esc(result)}</div>`:''}</section>`;
 const size=r.packSize, unit=r.packUnit;
 let firstFormula,firstExplain;
 if(unit==='KS'||unit==='MS'){
   const seeds=size*(unit==='KS'?1000:1000000);
   firstFormula=`${n(size)} ${unit} × ${unit==='KS'?'1,000':'1,000,000'} = ${fmt(seeds,0)} ${text('seeds','semillas')}\n${fmt(seeds,0)} ÷ ${n(r.pc)} = ${n(r.base*F)} LB\n${n(r.base*F)} LB ÷ ${F} = ${w(r.base)} KG`;
   firstExplain=text(`Each bag needs ${fmt(seeds,0)} seeds. With ${n(r.pc)} seeds in one pound, we find the pounds needed, then change pounds to kilograms (KG).`, `Cada bolsa necesita ${fmt(seeds,0)} semillas. Como hay ${n(r.pc)} semillas en una libra, calculamos las libras y luego las convertimos a kilogramos (KG).`);
 }else if(unit==='LB'){
   firstFormula=`${n(size)} LB ÷ ${F} = ${w(r.base)} KG`;
   firstExplain=text('The pack size is in pounds (LB). We change it to kilograms (KG).','El tamaño de la bolsa está en libras (LB). Lo convertimos a kilogramos (KG).');
 }else if(unit==='G'){
   firstFormula=`${n(size)} G ÷ 1,000 = ${w(r.base)} KG`;
   firstExplain=text('The pack size is in grams. There are 1,000 grams in one kilogram.','El tamaño está en gramos. Un kilogramo tiene 1,000 gramos.');
 }else{
   firstFormula=`${n(size)} KG = ${w(r.base)} KG`;
   firstExplain=text('The pack size is already in kilograms (KG). No conversion is needed.','El tamaño ya está en kilogramos (KG). No necesitamos convertirlo.');
 }
 const customSampleDetails=(r.customSamples||[]).filter(s=>s.qty!==''&&s.weight!=='').map(s=>{
   const qty=Number(s.qty), amount=Number(s.weight);
   const eachKg=unitKg(amount,s.unit,r.pc);
   const totalKg=qty*eachKg;
   const converted=s.unit==='KG'?'':` = ${w(totalKg)} KG`;
   return `${n(qty)} ${text('samples','muestras')} × ${n(amount)} ${s.unit}${converted}${s.unit==='KG'?` = ${w(totalKg)} KG`:''}`;
 }).join('\n');
 const customSampleMath=customSampleDetails?`${customSampleDetails}\n`:'';
 const sampleSummaryMath=`${w(seedOrder)} + ${n(r.regular)} KG ${text('(regular samples)','(muestras regulares)')} + ${n(r.customSampleKg)} KG ${text('(custom samples)','(muestras adicionales)')} = ${w(raw)} KG`;
 const chemExplain=r.chem===0
   ?text('No chemical weight is added for this order.','No se agrega peso de tratamiento químico a esta orden.')
   :text(`The treatment adds ${pct(r.chem)}% to the weight. We calculate that extra weight and add it to the seed weight from Step 2.`,`El tratamiento agrega ${pct(r.chem)}% al peso. Calculamos ese peso adicional y lo sumamos al peso del paso 2.`);
 const tareExplain=r.tareKg>0
   ?text('The tare is the weight of the empty bag. Add it to the net weight to find what the scale should show. The empty bag is not included in the total seed needed.','La tara es el peso de la bolsa vacía. Se suma al peso neto para saber cuánto debe marcar la báscula. La bolsa vacía no se incluye en la semilla total necesaria.')
   :text('Enter the weight of the empty bag (tare) to find the total bag weight for the scale.','Ingresa el peso de la bolsa vacía (tara) para calcular el peso total que debe marcar la báscula.');
 el.innerHTML=`<p class="guideIntro">${esc(expectedLine==='leg'?text('These seven steps explain the current Leg — Concetti Pack Only calculation. Full precision is used; displayed examples may show fewer decimals.','Estos siete pasos explican el cálculo actual de Leg — Concetti Solo empaque. Se utiliza precisión completa; los ejemplos pueden mostrar menos decimales.'):text('These steps show how your order was calculated. The app keeps the full numbers for accuracy; some numbers below are shortened to make them easier to read.','Estos pasos muestran cómo se calculó tu orden. La app conserva los números completos para mayor precisión; algunos se muestran con menos decimales para facilitar la lectura.'))}</p>
 <div class="guideInput"><strong>${esc(text('Order details','Datos de la orden'))}</strong>
 ${expectedLine==='leg'?row(text('Line / mode','Línea / modo'),text('Leg · Concetti Pack Only','Leg · Concetti Solo empaque')):''}
 ${row(text('Crop / seed type','Cultivo / tipo de semilla'),`${NAMES[r.crop]} · ${r.seed==='commercial'?'Commercial':'Parent / Basic'}`)}
 ${row(text('Condition','Condición'),r.condition==='treated'?text('Treated','Tratada'):text('Untreated','Sin tratar'))}
 ${row(text('Pack size / order','Tamaño / orden'),`${n(size)} ${unit} × ${r.orderEa} EA`)}
 ${r.pc!==null?row(text('Seeds per pound (PC)','Semillas por libra (PC)'),n(r.pc)):''}
 ${row('Overpack / Chemical',`${pct(r.over)}% / ${pct(r.chem)}%`)}</div>
 ${block(1,text('Calculate Seed Weight per Bag','Calcular el peso de semilla por bolsa'),firstExplain,firstFormula,`${text('Seed weight before extras','Peso de semilla antes de extras')}: ${w(r.base)} KG / EA`)}
 ${block(2,text('Add Extra Seed (Overpack)','Agregar semilla extra (Overpack)'),text(`We add ${pct(r.over)}% extra seed to each bag to help make sure it has enough. This percentage comes from Formula Settings.`,`Agregamos ${pct(r.over)}% de semilla extra a cada bolsa para ayudar a asegurar que tenga suficiente. Este porcentaje viene de Formula Settings.`),`${w(r.base)} KG × ${pct(r.over)}% = ${w(overAdded)} KG ${text('extra','extra')}\n${w(r.base)} + ${w(overAdded)} = ${w(perBagOver)} KG`,`${text('Weight after overpack','Peso con overpack')}: ${w(perBagOver)} KG / EA`)}
 ${block(3,text('Add Chemical Weight','Agregar peso del tratamiento'),chemExplain,`${w(perBagOver)} KG × ${pct(r.chem)}% = ${w(chemAdded)} KG ${text('extra','extra')}\n${w(perBagOver)} + ${w(chemAdded)} = ${w(r.netBag)} KG`,`${text('Weight after treatment','Peso después del tratamiento')}: ${w(r.netBag)} KG / EA`)}
 ${block(4,text('Calculate Net Weight','Calcular el peso neto'),text('Net weight is the weight inside one bag, including extra seed and treatment weight, but without the empty bag.','El peso neto es lo que va dentro de una bolsa, incluyendo la semilla extra y el tratamiento, pero sin la bolsa vacía.'),`${text('Weight from Step 3','Peso del paso 3')}: ${w(r.netBag)} KG`,`${text('NET WEIGHT PER BAG','PESO NETO POR BOLSA')}: ${fmt(r.netBag,3)} KG`)}
 ${block(5,text('Calculate Gross Weight','Calcular el peso bruto'),tareExplain,`${w(r.netBag)} KG + ${w(r.tareKg)} KG ${text('(empty bag)','(bolsa vacía)')} = ${w(r.scaleBag)} KG`,r.tareKg>0?`${text('GROSS WEIGHT PER BAG','PESO BRUTO POR BOLSA')}: ${fmt(r.scaleBag,3)} KG`:text('Enter bag tare to get a scale target','Ingresa la tara para obtener el peso de báscula'))}
 ${block(6,text('Calculate Total Seed Needed','Calcular la semilla total necesaria'),text('Multiply the net weight by the number of bags, then add regular and custom samples. Do not add the weight of the empty bags.','Multiplica el peso neto por la cantidad de bolsas. Después agrega las muestras regulares y las adicionales. No agregues el peso de las bolsas vacías.'),`${w(r.netBag)} KG × ${r.orderEa} EA = ${w(seedOrder)} KG\n${customSampleMath}${sampleSummaryMath}`,`${text('Total before rounding','Total antes de redondear')}: ${w(raw)} KG`)}
 ${block(7,text('Round Up the Total Weight','Redondear el peso total hacia arriba'),text('If the total includes part of a kilogram, use the next whole kilogram so there is enough seed. If it is already a whole number, leave it as it is.','Si el total tiene una fracción de kilogramo, usamos el siguiente kilogramo entero para tener suficiente semilla. Si ya es un número entero, no cambia.'),`${text('Calculated weight','Peso calculado')}: ${w(raw)} KG\n${text('Rounded up','Redondeado hacia arriba')}: ${fmt(r.totalKg,0)} KG\n${fmt(r.totalKg,0)} KG × ${F} = ${fmt(totalLbs,2)} LB`,`${text('TOTAL SEED REQUIRED','SEMILLA TOTAL REQUERIDA')}: ${fmt(r.totalKg,0)} KG`)}
 <div class="guideFinal"><strong>${esc(text('Final results','Resultados finales'))}</strong>
 ${row(text('Net seed / EA','Peso neto / EA'),`${fmt(r.netBag,3)} KG`)}
 ${row(text('Gross bag / EA','Peso bruto / EA'),r.tareKg>0?`${fmt(r.scaleBag,3)} KG`:text('Enter tare','Ingresa tara'))}
 ${row(text('Total seed required','Semilla total requerida'),`${fmt(r.totalKg,0)} KG / ${fmt(r.totalLb,2)} LB`)}</div>
 <p class="guideFoot">${esc(expectedLine==='leg'?text('This guide explains how Leg calculates net and gross bag weights and the total material required for packing, including overpack, treatment weight when applicable, and samples. Empty-bag tare is included only in gross bag weight. Overpack and chemical percentages come from Formula Settings. Always follow approved production SOPs.','Esta guía explica cómo Leg calcula los pesos neto y bruto por bolsa y el material total requerido para empacar, incluyendo overpack, peso del tratamiento cuando corresponde y muestras. La tara de la bolsa vacía se incluye únicamente en el peso bruto. Los porcentajes de overpack y tratamiento vienen de Formula Settings. Sigue siempre los SOP de producción aprobados.'):text('This guide explains the current app calculation. Follow approved production SOPs. Overpack and chemical percentages can be changed in Formula Settings.','Esta guía explica el cálculo actual de la app. Sigue los SOP de producción aprobados. Los porcentajes de overpack y tratamiento se pueden cambiar en Formula Settings.'))}</p>`;
 $('guideSummary').textContent=text('📖 How Was This Calculated?','📖 ¿Cómo se calculó?');
}
// Line 1 (Treat Only) uses base weight * EA, then overpack, then samples.
// Chemical weight and bag tare are NOT part of this line's seed-to-treat formula.
function renderLine1Guide(){
 const r=lastResult,el=$('guideContent');
 if(!r||r.line!=='1'){el.replaceChildren();return;}
 const es=prefs.language==='es',t=(en,sp)=>es?sp:en;
 const n=x=>Number(x).toLocaleString('en-US',{maximumFractionDigits:5});
 const w=x=>fmt(x,5);
 const row=(a,b)=>`<div class="guideRow"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`;
 const block=(num,title,explain,formula,result)=>`<section class="guideStep"><div class="guideStepTitle"><span class="guideNum">${num}</span><strong>${esc(title)}</strong></div><p>${esc(explain)}</p><div class="guideMath">${esc(formula)}</div><div class="guideResult">${esc(result)}</div></section>`;
 const size=r.packSize,unit=r.packUnit;
 let baseFormula,baseExplain;
 if(unit==='KS'||unit==='MS'){
  const factor=unit==='KS'?1000:1000000,seeds=size*factor;
  baseFormula=`${n(size)} ${unit} × ${fmt(factor,0)} = ${fmt(seeds,0)} ${t('seeds','semillas')}\n${fmt(seeds,0)} ÷ ${n(r.pc)} = ${n(r.base*F)} LB\n${n(r.base*F)} LB ÷ ${F} = ${w(r.base)} KG`;
  baseExplain=t(`Each pack contains ${fmt(seeds,0)} seeds. Use the seed count (PC) to find the pounds, then convert pounds to KG.`,`Cada paquete contiene ${fmt(seeds,0)} semillas. Usamos el conteo de semillas (PC) para obtener libras y luego las convertimos a KG.`);
 }else if(unit==='LB'){
  baseFormula=`${n(size)} LB ÷ ${F} = ${w(r.base)} KG`;
  baseExplain=t('The pack size is in pounds. Convert it to kilograms.','El tamaño está en libras. Lo convertimos a kilogramos.');
 }else if(unit==='G'){
  baseFormula=`${n(size)} G ÷ 1,000 = ${w(r.base)} KG`;
  baseExplain=t('There are 1,000 grams in one kilogram.','Un kilogramo tiene 1,000 gramos.');
 }else{
  baseFormula=`${n(size)} KG = ${w(r.base)} KG`;
  baseExplain=t('The pack size is already in kilograms.','El tamaño ya está en kilogramos.');
 }
 const beforeOver=r.seedBase,extra=r.overKg,afterOver=beforeOver+extra,raw=r.rawTotalKg;
 const customDetails=(r.customSamples||[]).filter(s=>s.qty!==''&&s.weight!=='').map(s=>{
  const qty=Number(s.qty),amount=Number(s.weight),total=qty*unitKg(amount,s.unit,r.pc);
  return `${n(qty)} ${t('samples','muestras')} × ${n(amount)} ${s.unit} = ${w(total)} KG`;
 }).join('\n');
 const sampleLines=`${customDetails?customDetails+'\n':''}${w(afterOver)} + ${w(r.regular)} KG ${t('(regular samples)','(muestras regulares)')} + ${w(r.customSampleKg)} KG ${t('(custom samples)','(muestras adicionales)')} = ${w(raw)} KG`;
 el.innerHTML=`<p class="guideIntro">${esc(t('These steps explain how Line 1 calculates the seed to treat. The app uses full precision; some displayed numbers are shortened.','Estos pasos explican cómo Line 1 calcula la semilla para tratar. La app usa los números completos; algunos se muestran con menos decimales.'))}</p>
 <div class="guideInput"><strong>${esc(t('Order details','Datos de la orden'))}</strong>
 ${row(t('Line / mode','Línea / modo'),t('Line 1 · Treat Only','Línea 1 · Solo tratar'))}
 ${row(t('Seed type','Tipo de semilla'),r.seed==='commercial'?t('Commercial','Comercial'):t('Parent / Basic','Parent / Basic'))}
 ${row(t('Pack size / order','Tamaño / orden'),`${n(size)} ${unit} × ${r.orderEa} EA`)}
 ${r.pc!==null?row(t('Seeds per pound (PC)','Semillas por libra (PC)'),n(r.pc)):''}
 ${row('Overpack',`${n(r.over)}%`)}</div>
 ${block(1,t('Find the Seed Weight per Pack','Calcular el peso de semilla por paquete'),baseExplain,baseFormula,`${t('Base weight per pack','Peso base por paquete')}: ${w(r.base)} KG / EA`)}
 ${block(2,t('Calculate the Order Weight','Calcular el peso de la orden'),t('Multiply the weight of one pack by the number of packs ordered.','Multiplica el peso de un paquete por la cantidad de paquetes de la orden.'),`${w(r.base)} KG × ${r.calculatedEa} EA = ${w(beforeOver)} KG`,`${t('Order weight before overpack','Peso de la orden antes del overpack')}: ${w(beforeOver)} KG`)}
 ${block(3,t('Add Extra Seed (Overpack)','Agregar semilla extra (Overpack)'),t(`Add ${n(r.over)}% extra seed to the order. This percentage comes from Formula Settings.`,`Agregamos ${n(r.over)}% de semilla extra a la orden. El porcentaje viene de Formula Settings.`),`${w(beforeOver)} KG × ${n(r.over)}% = ${w(extra)} KG ${t('extra','extra')}\n${w(beforeOver)} + ${w(extra)} = ${w(afterOver)} KG`,`${t('Weight after overpack','Peso con overpack')}: ${w(afterOver)} KG`)}
 ${block(4,t('Add Samples','Agregar muestras'),t('Add the regular and custom samples to the order weight.','Suma las muestras regulares y adicionales al peso de la orden.'),sampleLines,`${t('Total before rounding','Total antes de redondear')}: ${w(raw)} KG`)}
 ${block(5,t('Round Up the Total Weight','Redondear el peso total hacia arriba'),t('If there is part of a kilogram, round up to the next whole kilogram so there is enough seed.','Si hay una fracción de kilogramo, redondea hacia arriba al siguiente kilogramo entero para tener suficiente semilla.'),`${t('Calculated weight','Peso calculado')}: ${w(raw)} KG\n${t('Rounded up','Redondeado hacia arriba')}: ${fmt(r.totalKg,0)} KG\n${fmt(r.totalKg,0)} KG × ${F} = ${fmt(r.totalLb,2)} LB`,`${t('SEED TO TREAT','SEMILLA PARA TRATAR')}: ${fmt(r.totalKg,0)} KG`)}
 <div class="guideFinal"><strong>${esc(t('Final results','Resultados finales'))}</strong>
 ${row(t('Order before overpack','Orden antes del overpack'),`${fmt(beforeOver,3)} KG`)}
 ${row(t('Extra seed (overpack)','Semilla extra (overpack)'),`${fmt(extra,3)} KG`)}
 ${row(t('Total samples','Muestras totales'),`${fmt(r.samples,3)} KG`)}
 ${row(t('Seed to treat','Semilla para tratar'),`${fmt(r.totalKg,0)} KG / ${fmt(r.totalLb,2)} LB`)}</div>
 <p class="guideFoot">${esc(t('This guide explains how Line 1 calculates the total seed needed for treatment, not the finished bag weight. The calculation includes overpack and samples. Overpack percentages can be adjusted in Formula Settings. Always follow approved production SOPs.','Esta guía explica cómo Line 1 calcula la cantidad total de semilla necesaria para el tratamiento, no el peso de una bolsa terminada. El cálculo incluye overpack y muestras. Los porcentajes de overpack se pueden ajustar en Formula Settings. Sigue siempre los SOP de producción aprobados.'))}</p>`;
 $('guideSummary').textContent=t('📖 How Was This Calculated?','📖 ¿Cómo se calculó?');
}
// Line 3 guide: explanatory only. Reads values already computed by calculate().
// Treat & Pack: extra EA affects the seed-to-treat quantity, not the bag target.
// Chemical weight affects the bag target, not the seed-to-treat total.
function renderLine3Guide(){
 const r=lastResult, el=$('guideContent');
 if(!r||r.line!=='3'){el.replaceChildren();return;}
 const es=prefs.language==='es', t=(en,sp)=>es?sp:en;
 const w=x=>fmt(x,5), n=x=>Number(x).toLocaleString('en-US',{maximumFractionDigits:5});
 const row=(a,b)=>`<div class="guideRow"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`;
 const block=(num,name,explain,math,result)=>`<section class="guideStep"><div class="guideStepTitle"><span class="guideNum">${num}</span><strong>${esc(name)}</strong></div><p>${esc(explain)}</p><div class="guideMath">${esc(math)}</div><div class="guideResult">${esc(result)}</div></section>`;
 const seeds=r.packSize*(r.packUnit==='KS'?1000:1000000);
 let firstMath,firstExplain;
 if(['KS','MS'].includes(r.packUnit)){
   firstMath=`${n(r.packSize)} ${r.packUnit} × ${r.packUnit==='KS'?'1,000':'1,000,000'} = ${fmt(seeds,0)} ${t('seeds','semillas')}\n${fmt(seeds,0)} ÷ ${n(r.pc)} = ${w(r.base*F)} LB\n${w(r.base*F)} LB ÷ ${F} = ${w(r.base)} KG`;
   firstExplain=t('Convert the seeds in one pack to pounds using the seed count (PC), then convert pounds to kilograms.','Convierte las semillas de un paquete a libras usando el conteo de semillas (PC) y después a kilogramos.');
 }else if(r.packUnit==='LB'){
   firstMath=`${n(r.packSize)} LB ÷ ${F} = ${w(r.base)} KG`;
   firstExplain=t('Convert the pack weight from pounds to kilograms.','Convierte el peso del paquete de libras a kilogramos.');
 }else if(r.packUnit==='G'){
   firstMath=`${n(r.packSize)} G ÷ 1,000 = ${w(r.base)} KG`;
   firstExplain=t('Convert grams to kilograms.','Convierte gramos a kilogramos.');
 }else{
   firstMath=`${n(r.packSize)} KG = ${w(r.base)} KG`;
   firstExplain=t('The pack size is already in kilograms.','El tamaño del paquete ya está en kilogramos.');
 }
 const before=r.seedBase, extra=r.overKg, after=before+extra, raw=r.rawTotalKg;
 const custom=(r.customSamples||[]).filter(x=>x.qty!==''&&x.weight!=='').map(x=>{
   const amount=Number(x.qty)*unitKg(Number(x.weight),x.unit,r.pc);
   return `${n(x.qty)} × ${n(x.weight)} ${x.unit} = ${w(amount)} KG`;
 }).join('\n');
 const sampleMath=`${custom?custom+'\n':''}${w(r.regular)} KG ${t('regular','regulares')} + ${w(r.customSampleKg)} KG ${t('custom','adicionales')} = ${w(r.samples)} KG`;
 const afterOverPerPack=r.base*(1+r.over/100), chemicalAdded=afterOverPerPack*r.chem/100;
 let steps=[
   block(1,t('Calculate Seed Weight per Pack','Calcular el peso de semilla por paquete'),firstExplain,firstMath,`${t('Base weight per pack','Peso base por paquete')}: ${w(r.base)} KG / EA`),
   block(2,t('Count All Packs','Contar todos los paquetes'),r.mode==='pack'?t('Line 3 adds the Extra EA selected for Concetti to the ordered packs.','Line 3 agrega los EA adicionales seleccionados para Concetti a los paquetes de la orden.'):t('In Treat Only mode, the order quantity is used without extra EA.','En modo Solo tratamiento se utiliza la cantidad de la orden sin EA adicionales.'),`${r.orderEa} EA + ${r.extraEa} ${t('extra EA','EA adicionales')} = ${r.calculatedEa} EA`,`${t('Packs for calculation','Paquetes para el cálculo')}: ${r.calculatedEa} EA`),
   block(3,t('Calculate the Order Seed Weight','Calcular el peso de semilla de la orden'),t('Multiply the seed weight per pack by the calculated EA.','Multiplica el peso de semilla por paquete por los EA calculados.'),`${w(r.base)} KG × ${r.calculatedEa} EA = ${w(before)} KG`,`${t('Order seed weight','Peso de semilla de la orden')}: ${w(before)} KG`),
   block(4,t('Add Extra Seed (Overpack)','Agregar semilla extra (Overpack)'),t(`Add ${n(r.over)}% overpack using the percentage from Formula Settings.`,`Agrega ${n(r.over)}% de overpack según Formula Settings.`),`${w(before)} KG × ${n(r.over)}% = ${w(extra)} KG\n${w(before)} + ${w(extra)} = ${w(after)} KG`,`${t('Weight after overpack','Peso con overpack')}: ${w(after)} KG`),
   block(5,t('Add Samples','Agregar muestras'),t('Add regular and custom samples to the seed weight.','Agrega las muestras regulares y adicionales al peso de semilla.'),`${sampleMath}\n${w(after)} + ${w(r.samples)} = ${w(raw)} KG`,`${t('Total before rounding','Total antes de redondear')}: ${w(raw)} KG`),
   block(6,t('Round Up Seed to Treat','Redondear semilla para tratar hacia arriba'),t('Round up to the next whole kilogram if there is a fraction.','Si hay una fracción de kilogramo, redondea hacia arriba al siguiente kilogramo entero.'),`${w(raw)} KG → ${fmt(r.totalKg,0)} KG\n${fmt(r.totalKg,0)} KG × ${F} = ${fmt(r.totalLb,2)} LB`,`${t('SEED TO TREAT','SEMILLA PARA TRATAR')}: ${fmt(r.totalKg,0)} KG`)
 ];
 if(r.mode==='pack'){
  steps.push(block(7,t('Calculate Net Bag Target','Calcular el peso neto objetivo por bolsa'),t('For Treat & Pack, the bag target includes overpack and chemical weight. This is separate from the Seed to Treat total.','Para Tratar y empacar, el peso objetivo de la bolsa incluye overpack y peso químico. Es independiente del total de semilla para tratar.'),`${w(r.base)} KG × (1 + ${n(r.over)}%) = ${w(afterOverPerPack)} KG\n${w(afterOverPerPack)} KG × ${n(r.chem)}% = ${w(chemicalAdded)} KG ${t('chemical','químico')}\n${w(afterOverPerPack)} + ${w(chemicalAdded)} = ${w(r.netBag)} KG`,`${t('NET BAG TARGET','PESO NETO OBJETIVO')}: ${fmt(r.netBag,3)} KG / EA`));
  steps.push(block(8,t('Calculate Gross Bag Target','Calcular el peso bruto objetivo por bolsa'),t('Add the empty bag weight (tare) to the net target. Bag tare does not increase the Seed to Treat total.','Suma la tara (peso de la bolsa vacía) al objetivo neto. La tara no aumenta el total de semilla para tratar.'),`${w(r.netBag)} KG + ${w(r.tareKg)} KG ${t('tare','tara')} = ${w(r.scaleBag)} KG`,r.tareKg>0?`${t('GROSS BAG TARGET','PESO BRUTO OBJETIVO')}: ${fmt(r.scaleBag,3)} KG / EA`:t('Enter bag tare to get a scale target','Ingresa la tara para obtener el objetivo de báscula')));
 }
 el.innerHTML=`<p class="guideIntro">${esc(t('These steps explain the current Line 3 calculation. Full precision is used; displayed examples may show fewer decimals.','Estos pasos explican el cálculo actual de Line 3. Se utiliza precisión completa; los ejemplos pueden mostrar menos decimales.'))}</p>
 <div class="guideInput"><strong>${esc(t('Order details','Datos de la orden'))}</strong>
 ${row(t('Mode','Modo'),r.mode==='pack'?t('Treat & Pack','Tratar y empacar'):t('Treat Only','Solo tratamiento'))}
 ${row(t('Crop / seed type','Cultivo / tipo de semilla'),`${NAMES[r.crop]} · ${r.seed==='commercial'?t('Commercial','Comercial'):t('Parent / Basic','Padre / Básica')}`)}
 ${row(t('Pack size / order','Tamaño / orden'),`${n(r.packSize)} ${r.packUnit} × ${r.orderEa} EA`)}
 ${r.pc!==null?row(t('Seeds per pound (PC)','Semillas por libra (PC)'),n(r.pc)):''}
 ${row('Overpack / Chemical',`${n(r.over)}% / ${n(r.chem)}%`)}</div>
 ${steps.join('\n')}
 <div class="guideFinal"><strong>${esc(t('Final results','Resultados finales'))}</strong>
 ${row(t('Calculated EA','EA calculados'),String(r.calculatedEa))}
 ${row(t('Order seed weight','Peso de semilla de la orden'),`${fmt(before,3)} KG`)}
 ${row(t('Overpack','Overpack'),`${fmt(extra,3)} KG`)}
 ${row(t('Total samples','Muestras totales'),`${fmt(r.samples,3)} KG`)}
 ${row(t('Seed to treat','Semilla para tratar'),`${fmt(r.totalKg,0)} KG / ${fmt(r.totalLb,2)} LB`)}
 ${r.mode==='pack'?row(t('Net bag target','Peso neto objetivo'),`${fmt(r.netBag,3)} KG / EA`):''}
 ${r.mode==='pack'?row(t('Gross bag target','Peso bruto objetivo'),r.tareKg>0?`${fmt(r.scaleBag,3)} KG / EA`:t('Enter tare','Ingresa tara')):''}</div>
 <p class="guideFoot">${esc(r.mode==='treat'?t('This guide explains how Line 3 calculates the total seed needed for treatment, including overpack and samples. Overpack percentages can be adjusted in Formula Settings. Always follow approved production SOPs.','Esta guía explica cómo Line 3 calcula la cantidad total de semilla necesaria para el tratamiento, incluyendo overpack y muestras. Los porcentajes de overpack se pueden ajustar en Formula Settings. Sigue siempre los SOP de producción aprobados.'):t('This guide explains how Line 3 calculates seed to treat and, in Treat & Pack mode, the bag targets. Overpack and chemical percentages come from Formula Settings. Chemical weight and empty-bag tare are not added to the Seed to Treat total. Always follow approved production SOPs.','Esta guía explica cómo Line 3 calcula la semilla para tratar y, en modo Tratar y empacar, los pesos objetivo por bolsa. Los porcentajes de overpack y tratamiento vienen de Formula Settings. El peso químico y la tara de la bolsa vacía no se agregan al total de semilla para tratar. Sigue siempre los SOP de producción aprobados.'))}</p>`;
 $('guideSummary').textContent=t('📖 How Was This Calculated?','📖 ¿Cómo se calculó?');
}
// Line 4 guide: explanatory only. Reads values already computed by calculate().
// Treat & Pack: extra EA affects the seed-to-treat quantity, not the bag target.
// Chemical weight affects the bag target, not the seed-to-treat total.
function renderLine4Guide(){
 const r=lastResult, el=$('guideContent');
 if(!r||r.line!=='4'){el.replaceChildren();return;}
 const es=prefs.language==='es', t=(en,sp)=>es?sp:en;
 const w=x=>fmt(x,5), n=x=>Number(x).toLocaleString('en-US',{maximumFractionDigits:5});
 const row=(a,b)=>`<div class="guideRow"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`;
 const block=(num,name,explain,math,result)=>`<section class="guideStep"><div class="guideStepTitle"><span class="guideNum">${num}</span><strong>${esc(name)}</strong></div><p>${esc(explain)}</p><div class="guideMath">${esc(math)}</div><div class="guideResult">${esc(result)}</div></section>`;
 const seeds=r.packSize*(r.packUnit==='KS'?1000:1000000);
 let firstMath,firstExplain;
 if(['KS','MS'].includes(r.packUnit)){
   firstMath=`${n(r.packSize)} ${r.packUnit} × ${r.packUnit==='KS'?'1,000':'1,000,000'} = ${fmt(seeds,0)} ${t('seeds','semillas')}\n${fmt(seeds,0)} ÷ ${n(r.pc)} = ${w(r.base*F)} LB\n${w(r.base*F)} LB ÷ ${F} = ${w(r.base)} KG`;
   firstExplain=t('Convert the seeds in one pack to pounds using the seed count (PC), then convert pounds to kilograms.','Convierte las semillas de un paquete a libras usando el conteo de semillas (PC) y después a kilogramos.');
 }else if(r.packUnit==='LB'){
   firstMath=`${n(r.packSize)} LB ÷ ${F} = ${w(r.base)} KG`;
   firstExplain=t('Convert the pack weight from pounds to kilograms.','Convierte el peso del paquete de libras a kilogramos.');
 }else if(r.packUnit==='G'){
   firstMath=`${n(r.packSize)} G ÷ 1,000 = ${w(r.base)} KG`;
   firstExplain=t('Convert grams to kilograms.','Convierte gramos a kilogramos.');
 }else{
   firstMath=`${n(r.packSize)} KG = ${w(r.base)} KG`;
   firstExplain=t('The pack size is already in kilograms.','El tamaño del paquete ya está en kilogramos.');
 }
 const before=r.seedBase, extra=r.overKg, after=before+extra, raw=r.rawTotalKg;
 const custom=(r.customSamples||[]).filter(x=>x.qty!==''&&x.weight!=='').map(x=>{
   const amount=Number(x.qty)*unitKg(Number(x.weight),x.unit,r.pc);
   return `${n(x.qty)} × ${n(x.weight)} ${x.unit} = ${w(amount)} KG`;
 }).join('\n');
 const sampleMath=`${custom?custom+'\n':''}${w(r.regular)} KG ${t('regular','regulares')} + ${w(r.customSampleKg)} KG ${t('custom','adicionales')} = ${w(r.samples)} KG`;
 const afterOverPerPack=r.base*(1+r.over/100), chemicalAdded=afterOverPerPack*r.chem/100;
 let steps=[
   block(1,t('Calculate Seed Weight per Pack','Calcular el peso de semilla por paquete'),firstExplain,firstMath,`${t('Base weight per pack','Peso base por paquete')}: ${w(r.base)} KG / EA`),
   block(2,t('Count All Packs','Contar todos los paquetes'),r.mode==='pack'?t('Line 4 adds the Extra EA selected by the operator to the ordered packs.','Line 4 agrega los EA adicionales seleccionados por el operador a los paquetes de la orden.'):t('In Treat Only mode, the order quantity is used without extra EA.','En modo Solo tratamiento se utiliza la cantidad de la orden sin EA adicionales.'),`${r.orderEa} EA + ${r.extraEa} ${t('extra EA','EA adicionales')} = ${r.calculatedEa} EA`,`${t('Packs for calculation','Paquetes para el cálculo')}: ${r.calculatedEa} EA`),
   block(3,t('Calculate the Order Seed Weight','Calcular el peso de semilla de la orden'),t('Multiply the seed weight per pack by the calculated EA.','Multiplica el peso de semilla por paquete por los EA calculados.'),`${w(r.base)} KG × ${r.calculatedEa} EA = ${w(before)} KG`,`${t('Order seed weight','Peso de semilla de la orden')}: ${w(before)} KG`),
   block(4,t('Add Extra Seed (Overpack)','Agregar semilla extra (Overpack)'),t(`Add ${n(r.over)}% overpack using the percentage from Formula Settings.`,`Agrega ${n(r.over)}% de overpack según Formula Settings.`),`${w(before)} KG × ${n(r.over)}% = ${w(extra)} KG\n${w(before)} + ${w(extra)} = ${w(after)} KG`,`${t('Weight after overpack','Peso con overpack')}: ${w(after)} KG`),
   block(5,t('Add Samples','Agregar muestras'),t('Add regular and custom samples to the seed weight.','Agrega las muestras regulares y adicionales al peso de semilla.'),`${sampleMath}\n${w(after)} + ${w(r.samples)} = ${w(raw)} KG`,`${t('Total before rounding','Total antes de redondear')}: ${w(raw)} KG`),
   block(6,t('Round Up Seed to Treat','Redondear semilla para tratar hacia arriba'),t('Round up to the next whole kilogram if there is a fraction.','Si hay una fracción de kilogramo, redondea hacia arriba al siguiente kilogramo entero.'),`${w(raw)} KG → ${fmt(r.totalKg,0)} KG\n${fmt(r.totalKg,0)} KG × ${F} = ${fmt(r.totalLb,2)} LB`,`${t('SEED TO TREAT','SEMILLA PARA TRATAR')}: ${fmt(r.totalKg,0)} KG`)
 ];
 if(r.mode==='pack'){
  steps.push(block(7,t('Calculate Net Bag Target','Calcular el peso neto objetivo por bolsa'),t('For Treat & Pack, the bag target includes overpack and chemical weight. This is separate from the Seed to Treat total.','Para Tratar y empacar, el peso objetivo de la bolsa incluye overpack y peso químico. Es independiente del total de semilla para tratar.'),`${w(r.base)} KG × (1 + ${n(r.over)}%) = ${w(afterOverPerPack)} KG\n${w(afterOverPerPack)} KG × ${n(r.chem)}% = ${w(chemicalAdded)} KG ${t('chemical','químico')}\n${w(afterOverPerPack)} + ${w(chemicalAdded)} = ${w(r.netBag)} KG`,`${t('NET BAG TARGET','PESO NETO OBJETIVO')}: ${fmt(r.netBag,3)} KG / EA`));
  steps.push(block(8,t('Calculate Gross Bag Target','Calcular el peso bruto objetivo por bolsa'),t('Add the empty bag weight (tare) to the net target. Bag tare does not increase the Seed to Treat total.','Suma la tara (peso de la bolsa vacía) al objetivo neto. La tara no aumenta el total de semilla para tratar.'),`${w(r.netBag)} KG + ${w(r.tareKg)} KG ${t('tare','tara')} = ${w(r.scaleBag)} KG`,r.tareKg>0?`${t('GROSS BAG TARGET','PESO BRUTO OBJETIVO')}: ${fmt(r.scaleBag,3)} KG / EA`:t('Enter bag tare to get a scale target','Ingresa la tara para obtener el objetivo de báscula')));
 }
 el.innerHTML=`<p class="guideIntro">${esc(t('These steps explain the current Line 4 calculation. Full precision is used; displayed examples may show fewer decimals.','Estos pasos explican el cálculo actual de Line 4. Se utiliza precisión completa; los ejemplos pueden mostrar menos decimales.'))}</p>
 <div class="guideInput"><strong>${esc(t('Order details','Datos de la orden'))}</strong>
 ${row(t('Mode','Modo'),r.mode==='pack'?t('Treat & Pack','Tratar y empacar'):t('Treat Only','Solo tratamiento'))}
 ${row(t('Crop / seed type','Cultivo / tipo de semilla'),`${NAMES[r.crop]} · ${r.seed==='commercial'?t('Commercial','Comercial'):t('Parent / Basic','Padre / Básica')}`)}
 ${row(t('Pack size / order','Tamaño / orden'),`${n(r.packSize)} ${r.packUnit} × ${r.orderEa} EA`)}
 ${r.pc!==null?row(t('Seeds per pound (PC)','Semillas por libra (PC)'),n(r.pc)):''}
 ${row('Overpack / Chemical',`${n(r.over)}% / ${n(r.chem)}%`)}</div>
 ${steps.join('\n')}
 <div class="guideFinal"><strong>${esc(t('Final results','Resultados finales'))}</strong>
 ${row(t('Calculated EA','EA calculados'),String(r.calculatedEa))}
 ${row(t('Order seed weight','Peso de semilla de la orden'),`${fmt(before,3)} KG`)}
 ${row(t('Overpack','Overpack'),`${fmt(extra,3)} KG`)}
 ${row(t('Total samples','Muestras totales'),`${fmt(r.samples,3)} KG`)}
 ${row(t('Seed to treat','Semilla para tratar'),`${fmt(r.totalKg,0)} KG / ${fmt(r.totalLb,2)} LB`)}
 ${r.mode==='pack'?row(t('Net bag target','Peso neto objetivo'),`${fmt(r.netBag,3)} KG / EA`):''}
 ${r.mode==='pack'?row(t('Gross bag target','Peso bruto objetivo'),r.tareKg>0?`${fmt(r.scaleBag,3)} KG / EA`:t('Enter tare','Ingresa tara')):''}</div>
 <p class="guideFoot">${esc(r.mode==='treat'?t('This guide explains how Line 4 calculates the total seed needed for treatment, including overpack and samples. Overpack percentages can be adjusted in Formula Settings. Always follow approved production SOPs.','Esta guía explica cómo Line 4 calcula la semilla necesaria para el tratamiento, incluyendo overpack y muestras. El porcentaje de overpack se puede ajustar en Formula Settings. Sigue siempre los SOP de producción aprobados.'):t('This guide explains how Line 4 calculates seed to treat and the net and gross bag targets. Overpack and chemical percentages come from Formula Settings. Chemical weight and empty-bag tare are not added to the Seed to Treat total. Always follow approved production SOPs.','Esta guía explica cómo Line 4 calcula la semilla para tratar y los pesos neto y bruto objetivo por bolsa. Los porcentajes de overpack y tratamiento vienen de Formula Settings. El peso químico y la tara de la bolsa vacía no se agregan al total de semilla para tratar. Sigue siempre los SOP de producción aprobados.'))}</p>`;
 $('guideSummary').textContent=t('📖 How Was This Calculated?','📖 ¿Cómo se calculó?');
}
$('standaloneGuide').addEventListener('toggle',()=>{if($('standaloneGuide').open)renderCalculationGuide()});
function capture(){calculate();if(!lastResult){alert('Enter a valid calculation before saving.');return;}const r=structuredClone(lastResult);r.id=(typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+String(Math.random());r.label=$('calcId').value.trim()||`Calculation ${saved.length+1}`;r.savedAt=new Date().toISOString();saved.unshift(r);if(persist(SAVED_KEY,saved))renderSaved();}
function row(a,b){return `<div class="detailrow"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`;}
function savedCard(r){const kind=r.line==='standalone'?'Stand-Alone':r.line==='leg'?'Leg':`Line ${r.line}`,description=(r.line==='standalone'||r.line==='leg')?'Pack Only':r.mode==='pack'?'Treat & Pack':'Treat Only',total=r.totalKg;let fields=[['Saved',new Date(r.savedAt).toLocaleString()],['Line / Mode',kind+' · '+description],['Crop',NAMES[r.crop]||'N/A'],['Seed Type',r.seed==='commercial'?'Commercial':'Parent / Basic']];if(r.line==='standalone'||r.line==='leg')fields.push(['Seed Condition',r.condition==='treated'?'Treated':'Untreated']);fields.push(['Pack Size',r.packSize+' '+r.packUnit],['Order EA',r.orderEa],['PC (Seeds/LB)',r.pc??'N/A'],['Extra EA',r.extraEa],['Calculated EA',r.calculatedEa],['Overpack',r.over+'%'],['Chemical Weight',r.chem+'%'],['Regular Sample',fmt(r.regular,3)+' KG'],['Custom Samples',r.customSamples.length? r.customSamples.map(s=>`${s.qty} × ${s.weight} ${s.unit}`).join('; '):'None'],['Total Samples',fmt(r.samples,3)+' KG / '+fmt(r.samples*F,2)+' LB']);if(r.line==='standalone'||r.line==='leg'||r.mode==='pack')fields.push(['Bag Tare',fmt(r.tareKg,3)+' KG / '+fmt(r.tareKg*F,3)+' LB'],['Net Seed Weight / EA',fmt(r.netBag,3)+' KG / '+fmt(r.netBag*F,2)+' LB'],['Gross Bag Weight / EA',r.tareKg>0?fmt(r.scaleBag,3)+' KG / '+fmt(r.scaleBag*F,2)+' LB':'Enter Bag Tare to calculate']);else fields.push(['Base KG / EA',fmt(r.base,3)+' KG / '+fmt(r.base*F,2)+' LB'],['Base Requirement',fmt(r.seedBase,3)+' KG'],['Overpack Weight',fmt(r.overKg,3)+' KG']);if(r.mode==='pack'&&r.line!=='standalone'&&r.line!=='leg')fields.push(['Finished Bag Target',fmt(r.bagKg,3)+' KG / '+fmt(r.bagLb,2)+' LB']);fields.push(['Total',fmt(r.totalKg,0)+' KG / '+fmt(r.totalLb,2)+' LB']);return `<article class="savedItem"><div class="savedHead"><div><strong>${esc(r.label)}</strong><div class="muted tiny">${esc(kind)} · ${esc(description)}</div><div class="muted tiny">${esc(NAMES[r.crop]||'')} · ${esc(r.packSize+' '+r.packUnit)} · ${r.orderEa} EA</div></div><div class="right"><strong>${fmt(total,0)} KG</strong><div class="muted tiny">${fmt(r.totalLb,2)} LB</div></div></div><details><summary>View Details</summary>${fields.map(([a,b])=>row(a,b)).join('')}</details><div class="actions"><button class="secondary small load" data-id="${esc(r.id)}">↩ Load Calculation</button><button class="secondary small danger delete" data-id="${esc(r.id)}">Delete</button></div></article>`;}
function renderSaved(){const relevant=saved.filter(r=>r.line===line);$('saved').hidden=!relevant.length||!line||line==='bulk';$('savedCount').textContent=`${relevant.length} Saved`;$('savedList').innerHTML=relevant.map(savedCard).join('');$('savedList').querySelectorAll('.delete').forEach(b=>b.onclick=()=>{if(confirm('Delete this saved calculation?')){saved=saved.filter(r=>r.id!==b.dataset.id);persist(SAVED_KEY,saved);renderSaved();}});$('savedList').querySelectorAll('.load').forEach(b=>b.onclick=()=>{const r=saved.find(x=>x.id===b.dataset.id);if(r)load(r);});}
function load(r){line=r.line;openCalc(r.mode);$('crop').value=r.crop;$('seedType').value=r.seed;$('condition').value=r.condition||'treated';$('packSize').value=r.packSize;$('packUnit').value=r.packUnit;$('pc').value=r.pc??'';$('ea').value=r.orderEa;$('regular').value=r.regularSelection||String(r.regular);$('calcId').value=r.label;$('sampleRows').innerHTML='';(r.customSamples||[]).forEach(addSample);if(isPackOnly()||r.mode==='pack'){$('tare').value=fmt(r.tareKg??0,3).replace(/,/g,'');$('tareUnit').value='KG';}if(r.mode==='pack'&&(r.line==='3'||r.line==='4')){$('extra').value=r.extraEa??0;extraManual=true;}calculate();window.scrollTo({top:0,behavior:'smooth'});}
function settingsFor(){const c=$('settingCrop').value,s=$('settingSeed').value,r=rates(line,c,s);$('settingOver').value=r.over;$('settingChem').value=r.chem;$('settingNote').textContent=`Editing ${NAMES[c]} · ${s==='commercial'?'Commercial':'Parent / Basic'}${overrides[settingKey(line,c,s)]?' · Modified Settings':''}`;}
function openSettings(){settingReturn='calc';show('settings');title('Formula Settings',lineName(line));cropOptions($('settingCrop'),CROPS[line]);$('settingCrop').value=$('crop').value;$('settingSeed').value=$('seedType').value;settingsFor();}
function saveSettings(){const over=Number($('settingOver').value),chem=Number($('settingChem').value);if($('settingOver').value===''||$('settingChem').value===''||![over,chem].every(v=>Number.isFinite(v)&&v>=0&&v<=100)){alert('Enter valid percentages between 0 and 100.');return;}if(!confirm(`Apply Overpack ${over}% and Chemical Weight ${chem}% to ${NAMES[$('settingCrop').value]} (${ $('settingSeed').value }) on ${lineName(line)}?`))return;overrides[settingKey(line,$('settingCrop').value,$('settingSeed').value)]={over,chem};if(persist(SETTINGS_KEY,overrides)){show('calc');title(lineName(line),'Calculator');calculate();}}
function restoreSettings(){const key=settingKey(line,$('settingCrop').value,$('settingSeed').value);if(!confirm('Restore default percentages for this crop and seed type?'))return;delete overrides[key];persist(SETTINGS_KEY,overrides);settingsFor();calculate();}
function changeTareUnit(){const prev=$('tareUnit').dataset.previous||'KG',next=$('tareUnit').value;let value=Number($('tare').value);if(Number.isFinite(value)&&prev!==next){value=prev==='KG'?value*F:value/F;$('tare').value=value.toFixed(3);} $('tareUnit').dataset.previous=next;calculate();}
function updateRegular(){if($('regular').value==='auto')return;calculate();}

// v2.3 preferences, translation, quick calculator and Pack All
const PREF_KEY='production-calculator-v23-preferences', HISTORY_KEY='production-calculator-v23-history';
const prefDefaults={language:'en',theme:'dark',color:'blue'};
let prefs={...prefDefaults,...read(PREF_KEY,{})},prefReturn='home',quickReturn='home',qValue='0',qFirst=null,qOp=null,qFresh=true,qExpression='',qConverter=true,qHistory=read(HISTORY_KEY,[]);
if(!Array.isArray(qHistory))qHistory=[];
const colorCodes={blue:'#2563eb',red:'#dc2626',green:'#15803d',yellow:'#b88a00',pink:'#be185d',gray:'#64748b',black:'#3f3f46'};
function applyPrefs(){if($('standaloneGuide')?.open&&['standalone','1','3','4'].includes(lastResult?.line))renderCalculationGuide();document.documentElement.dataset.theme=prefs.theme;document.documentElement.style.setProperty('--accent',colorCodes[prefs.color]||colorCodes.blue);document.documentElement.lang=prefs.language;['Language','Theme','Color'].forEach(k=>{const e=$('pref'+k);if(e)e.value=prefs[k.toLowerCase()]});translateUI();}
const translations={
'Production Calculator':'Production Calculator','Choose a production line.':'Selecciona una línea de producción.','Select a Production Line':'Seleccionar línea de producción','Line 1':'Line 1','Line 3':'Line 3','Line 4':'Line 4','Treat Only':'Solo tratamiento','Treat / Treat & Pack':'Tratar / Tratar y empacar','Leg':'Leg','Stand-Alone':'Stand-Alone','Pack Only':'Solo empaque','Bulk Line':'Bulk Line','Coming Soon 🚧':'Próximamente 🚧','Choose a mode':'Selecciona un modo','Treat & Pack':'Tratar y empacar','Seed to Treat':'Semilla por tratar','Seed to Treat + Bag Target':'Semilla por tratar + peso por bolsa','Crop Type':'Tipo de cultivo','Seed Type':'Tipo de semilla','Seed Condition':'Condición de semilla','Commercial':'Comercial','Parent / Basic':'Padre / Básica','Treated':'Tratada','Untreated':'Sin tratar','Pack Size':'Tamaño de empaque','Order EA':'EA de orden','Bag Tare Weight':'Tara de bolsa','Samples':'Muestras','Regular Sample':'Muestra regular','Edit ▾':'Editar ▾','Hide ▴':'Ocultar ▴','+ Add Custom Sample':'+ Agregar muestra personalizada','Extra EA':'EA adicionales','Net Seed Weight / EA':'Peso neto de semilla / EA','Gross Bag Weight / EA':'Peso bruto de bolsa / EA','Enter Bag Tare to calculate':'Ingresa la tara de la bolsa para calcular','Finished Bag Target':'Peso final por bolsa','Calculated EA':'EA calculados','Total Seed Required':'Semilla total requerida','Calculation Breakdown':'Desglose del cálculo','KILOGRAMS':'KILOGRAMOS','POUNDS':'LIBRAS','Save':'Guardar','Reset Inputs':'Restablecer datos','Saved Calculations':'Cálculos guardados','Settings':'Configuración','Formula Settings':'Configuración de fórmulas','Quick Calculator':'Calculadora rápida','Calculator + Unit Converter':'Calculadora + conversor de unidades','Converter ON':'Conversor activado','Converter OFF':'Conversor desactivado','Recent History':'Historial reciente','Clear':'Borrar','Close':'Cerrar','Apply Changes':'Aplicar cambios','Restore Defaults':'Restaurar valores','Pack All — Actual Available Seed':'Empacar todo — Semilla disponible real','Actual Available Seed (KG)':'Semilla disponible real (KG)','Calculation Summary':'Resumen del cálculo','Back to Home':'Volver al inicio','No recent calculations.':'Sin cálculos recientes.','Complete Bags':'Bolsas completas','Remaining Seed':'Semilla restante','PO Estimated EA':'EA estimados en PO','Actual EA Difference':'Diferencia de EA reales','Formula Settings':'Configuración de fórmulas',"✦ What's New · v2.5 TEST · Build 1":'✦ Novedades · v2.5 TEST · Build 1'};
const originalText=new WeakMap();
function translateUI(){const spanish=prefs.language==='es';document.querySelectorAll('button, label, h1, h2, strong, summary, .eyebrow, .pill, small').forEach(el=>{if(el.closest('#quickHistory,#packAllOutput,#savedList,#breakdown'))return;for(const node of el.childNodes){if(node.nodeType!==3)continue;if(!originalText.has(node))originalText.set(node,node.nodeValue);const base=originalText.get(node);const trimmed=base.trim();if(!trimmed)continue;const clean=trimmed.replace(/^[←▦⚙️💾]+\s*/u,'');const t=translations[clean];if(t)node.nodeValue=spanish?base.replace(clean,t):base;}});document.querySelectorAll('option').forEach(el=>{if(!el.dataset.originalLabel)el.dataset.originalLabel=el.textContent;const t=translations[el.dataset.originalLabel];el.textContent=spanish&&t?t:el.dataset.originalLabel;});}
function openPrefs(){prefReturn=document.querySelector('#quick:not([hidden])')?'quick':document.querySelector('#calc:not([hidden])')?'calc':document.querySelector('#settings:not([hidden])')?'settings':'home';show('preferences');title('Settings','Language, theme and button color');applyPrefs();}
function closePrefs(){show(prefReturn==='settings'?'calc':prefReturn);if(prefReturn==='home')home();else if(prefReturn==='quick')title('Quick Calculator','Calculator + Unit Converter');else title(lineName(line),'Calculator');}
function openQuick(from){quickReturn=from;show('quick');$('quickHistoryPanel').hidden=true;$('unitPanel').hidden=true;title('Quick Calculator','Calculator + Unit Converter');$('quickBack').textContent=from==='home'?'← Back to Home':`← Back to ${lineName(line)} Summary`;renderQuick();translateUI();}
function backQuick(){if(quickReturn==='home')home();else{show('calc');title(lineName(line),'Calculator');calculate();}}
const convPairs={'kg-lb':['KG','LB',F],'lb-kg':['LB','KG',1/F],'g-oz':['g','oz',1/28.349523125],'oz-g':['oz','g',28.349523125],'ml-foz':['mL','fl oz',1/29.5735295625],'foz-ml':['fl oz','mL',29.5735295625],'l-gal':['L','gal',1/3.785411784],'gal-l':['gal','L',3.785411784]};
function quickFmt(x){return Number.isFinite(x)?Number(x.toPrecision(12)).toLocaleString('en-US',{maximumFractionDigits:5}):'Error';}
function renderQuick(){const pair=convPairs[$('converterPair').value];$('quickNumber').textContent=qValue==='Error'?'Error':qValue.endsWith('.')?qValue:quickFmt(Number(qValue));$('quickExpression').textContent=qExpression;const live=$('quickLiveResult');const b=Number(qValue);const liveValue=qOp&&qFirst!==null&&!qFresh&&qValue!=='Error'?(qOp==='+'?qFirst+b:qOp==='−'?qFirst-b:qOp==='×'?qFirst*b:b===0?NaN:qFirst/b):null;live.hidden=liveValue===null||!Number.isFinite(liveValue);live.textContent=live.hidden?'':`= ${quickFmt(liveValue)}`;$('converterLabel').hidden=!qConverter;$('converterToggle').textContent=qConverter?'Converter ON':'Converter OFF';$('converterToggle').setAttribute('aria-pressed',String(qConverter));$('quickConverted').textContent=qConverter&&qValue!=='Error'?`${quickFmt(Number(qValue)*pair[2])} ${pair[1]}`:'';
const last=qHistory[0];$('quickLastCalculation').textContent=last?`${last.expression} ${quickFmt(last.value)}`:'No calculations yet.';
if (!$('quickHistoryPanel').hidden) {
$('quickHistory').innerHTML=qHistory.length?qHistory.map((x,i)=>`<button type="button" class="historyItem" data-history="${i}"><small>${esc(x.expression)}</small><strong>${esc(quickFmt(x.value))}</strong></button>`).join(''):'No recent calculations.';
$('quickHistory').querySelectorAll('[data-history]').forEach(b=>b.onclick=()=>{const x=qHistory[Number(b.dataset.history)];qValue=String(x.value);qExpression='';qOp=null;qFirst=null;qFresh=true;$('quickHistoryPanel').hidden=true;renderQuick()});
}}
function quickKey(k){if(k==='AC'){qValue='0';qFirst=null;qOp=null;qFresh=true;qExpression='';}else if(k==='⌫'){qValue=qValue.length<2||qValue==='Error'?'0':qValue.slice(0,-1);}else if(k==='±'){qValue=String(-Number(qValue));}else if(k==='%'){qValue=String(Number(qValue)/100);}else if(['+','−','×','÷'].includes(k)){qFirst=Number(qValue);qOp=k;qFresh=true;qExpression=`${quickFmt(qFirst)} ${k}`;}else if(k==='='){if(qOp&&qFirst!==null){const b=Number(qValue),r=qOp==='+'?qFirst+b:qOp==='−'?qFirst-b:qOp==='×'?qFirst*b:b===0?NaN:qFirst/b;qExpression=`${quickFmt(qFirst)} ${qOp} ${quickFmt(b)} =`;qValue=Number.isFinite(r)?String(Number(r.toPrecision(12))):'Error';if(Number.isFinite(r)){qHistory.unshift({expression:qExpression,value:Number(qValue)});qHistory=qHistory.slice(0,200);persist(HISTORY_KEY,qHistory);}qOp=null;qFirst=null;qFresh=true;}}else if(k==='.'){if(qFresh){qValue='0.';qFresh=false;}else if(!qValue.includes('.'))qValue+='.';}else if(/^\d$/.test(k)){qValue=qFresh||qValue==='0'||qValue==='Error'?k:qValue.replace(/\D/g,'').length<12?qValue+k:qValue;qFresh=false;}renderQuick();}
function renderPackAll(){const supported=(line==='3'||line==='4')&&mode==='pack'||isPackOnly();$('packAll').hidden=!supported;if(!supported||!lastResult)return;const raw=$('availableKg').value,out=$('packAllOutput');if(raw===''){out.textContent='Enter available KG to calculate complete bags.';return;}const available=Number(raw),r=lastResult;if(!Number.isFinite(available)||available<0){out.textContent='Enter a valid KG amount.';return;}const reserve=r.samples;const usable=Math.max(0,available-reserve);const perBag=(r.line==='standalone'||r.line==='leg')?r.netBag:r.base*(1+r.over/100);if(!(perBag>0)){out.textContent='Complete the order inputs first.';return;}const ea=Math.max(0,Math.floor((usable+1e-9)/perBag));const remaining=Math.max(0,usable-ea*perBag);const difference=ea-r.orderEa;out.innerHTML=`<div class="detailrow"><span>PO Estimated EA</span><strong>${r.orderEa}</strong></div><div class="detailrow"><span>Samples Reserved</span><strong>${fmt(reserve,3)} KG</strong></div><div class="detailrow"><span>Complete Bags</span><strong>${ea} EA</strong></div><div class="detailrow"><span>Remaining Seed</span><strong>${fmt(remaining,3)} KG</strong></div><div class="detailrow"><span>Actual EA Difference</span><strong>${difference>0?'+':''}${difference} EA</strong></div>`;}
$('quickHome').onclick=()=>openQuick('home');$('quickSummary').onclick=()=>openQuick('calc');$('quickBack').onclick=backQuick;$('converterToggle').onclick=()=>{qConverter=!qConverter;renderQuick()};$('converterPair').onchange=renderQuick;// Handle touch on contact, avoiding Safari double-tap zoom and delayed synthesized clicks.
// Keep normal click for mouse, trackpad, and keyboard accessibility.
document.querySelectorAll('#quick .quickKeys [data-key]').forEach(b=>{
  let lastTouch=0;
  b.addEventListener('touchstart',event=>{
    if(event.touches.length!==1)return;
    event.preventDefault();
    lastTouch=Date.now();
    quickKey(b.dataset.key);
  },{passive:false});
  b.addEventListener('click',event=>{
    if(Date.now()-lastTouch<750){event.preventDefault();return;}
    quickKey(b.dataset.key);
  });
});$('clearHistory').onclick=()=>{if(!confirm(prefs.language==='es'?'¿Borrar todo el historial de la calculadora?':'Clear all calculator history?'))return;qHistory=[];persist(HISTORY_KEY,qHistory);renderQuick()};$('availableKg').addEventListener('input',renderPackAll);$('settingsBtn').onclick=openPrefs;$('prefsBack').onclick=closePrefs;$('formulaSettings').onclick=()=>{if(!line){alert(prefs.language==='es'?'Abre una línea para editar sus fórmulas.':'Open a line to edit its formulas.');return;}openSettings();};['Language','Theme','Color'].forEach(k=>$('pref'+k).addEventListener('change',()=>{prefs[k.toLowerCase()]=$('pref'+k).value;persist(PREF_KEY,prefs);applyPrefs()}));applyPrefs();

// Full-screen calculator tools, persistent history, and additional unit conversions.
const unitGroups={
 length:{units:['in','cm','mm','ft','m'],factors:{in:0.0254,cm:0.01,mm:0.001,ft:0.3048,m:1}},
 weight:{units:['lb','kg','oz','g'],factors:{lb:0.45359237,kg:1,oz:0.028349523125,g:0.001}},
 volume:{units:['fl oz (US)','mL','L','gal (US)'],factors:{'fl oz (US)':0.0295735295625,mL:0.001,L:1,'gal (US)':3.785411784}},
 temperature:{units:['°F','°C']},pressure:{units:['psi','bar','kPa'],factors:{psi:6.894757293168,bar:100,kPa:1}}
};
function unitSetup(){const group=unitGroups[$('unitCategory').value];for(const id of ['unitFrom','unitTo'])$(id).innerHTML=group.units.map(u=>`<option value="${esc(u)}">${esc(u)}</option>`).join('');$('unitTo').selectedIndex=1;unitCalculate();}
function unitCalculate(){const g=unitGroups[$('unitCategory').value],raw=$('unitAmount').value,from=$('unitFrom').value,to=$('unitTo').value,n=Number(raw);let v=NaN;if(raw!==''&&Number.isFinite(n)){if(g===unitGroups.temperature){v=from===to?n:from==='°F'?(n-32)*5/9:n*9/5+32;}else v=n*g.factors[from]/g.factors[to];}const output=Number.isFinite(v)?`${Number(v.toPrecision(12)).toLocaleString('en-US',{maximumFractionDigits:7})} ${to}`:'—';$('unitResult').textContent=output;return output;}
$('quickExit').onclick=backQuick;$('quickHomeButton').onclick=home;
$('quickHistoryOpen').onclick=()=>{$('quickHistoryPanel').hidden=false;renderQuick()};$('quickHistoryClose').onclick=()=>$('quickHistoryPanel').hidden=true;
$('unitOpen').onclick=()=>{$('unitPanel').hidden=false;unitCalculate()};$('unitClose').onclick=()=>$('unitPanel').hidden=true;
$('unitCategory').onchange=unitSetup;['unitFrom','unitTo','unitAmount'].forEach(id=>$(id).addEventListener('input',unitCalculate));$('unitSwap').onclick=()=>{const f=$('unitFrom').value;$('unitFrom').value=$('unitTo').value;$('unitTo').value=f;unitCalculate()};
$('unitCopy').onclick=async()=>{const result=unitCalculate();if(result==='—')return;const txt=`${$('unitAmount').value} ${$('unitFrom').value} = ${result}`;try{await navigator.clipboard.writeText(txt)}catch{window.prompt('Copy result:',txt)}};
unitSetup();
// Five taps on the footer version label unlock the secret arcade (Home only).
let secretTaps=0,secretLast=0;
function secretTap(){if($('home').hidden)return;const now=Date.now();secretTaps=now-secretLast<1100?secretTaps+1:1;secretLast=now;if(secretTaps>=5){secretTaps=0;show('brain');if(typeof window.startBrainBreak==='function')window.startBrainBreak();}}
$('brainSecretTrigger').addEventListener('click',secretTap);
$('brainSecretTrigger').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();secretTap();}});
window.returnBrainHome=home;
// Navigation
 $('homeShortcut').onclick=home;
 document.querySelectorAll('[data-line]').forEach(b=>b.onclick=()=>openLine(b.dataset.line));document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>openCalc(b.dataset.mode));$('comingBack').onclick=home;$('modeBack').onclick=home;$('back').onclick=back;$('settingsBtn').onclick=openPrefs;$('closeSettings').onclick=()=>{show('calc');title(lineName(line),'Calculator');calculate();};$('settingCrop').onchange=settingsFor;$('settingSeed').onchange=settingsFor;$('applySettings').onclick=saveSettings;$('restoreSettings').onclick=restoreSettings;
$('samplesToggle').onclick=()=>{$('samplesBody').hidden=!$('samplesBody').hidden;$('samplesToggle').textContent=$('samplesBody').hidden?'Edit ▾':'Hide ▴';};$('addSample').onclick=()=>addSample();$('extraMinus').onclick=()=>{extraManual=true;$('extra').value=Math.max(0,Number($('extra').value)-1);calculate();};$('extraPlus').onclick=()=>{extraManual=true;$('extra').value=Number($('extra').value)+1;calculate();};$('extra').oninput=()=>{extraManual=true;calculate();};$('save').onclick=capture;$('reset').onclick=reset;
['crop','seedType','condition','packSize','packUnit','pc','regular','tare'].forEach(id=>$(id).addEventListener('input',calculate));$('ea').addEventListener('input',()=>{extraManual=false;calculate();});$('tareUnit').addEventListener('change',changeTareUnit);$('tareUnit').dataset.previous='KG';home();
// TEST release notes: each TEST build has its own seen key.
// Increment the build and update the notes with every future TEST release.
const RELEASE_KEY='production-calculator-whats-new-v2.5-test-build-6';
const releaseNotes={
  en:{title:"What's New · TEST Build 6",items:["Added How Was This Calculated? to Leg — Concetti Pack Only (English and Spanish).","Seven steps explain pack seed weight, overpack, chemical weight when treated, net and gross bag weight, samples, and rounding.","Kept Calculation Breakdown, production formulas, existing saved calculations, and the update system unchanged."],note:"TEST VERSION — NOT FOR PRODUCTION. Verify Leg results against approved production procedures.",close:'Continue'},
  es:{title:'Novedades · TEST Build 6',items:['Agregamos ¿Cómo se calculó? a Leg — Concetti Solo empaque (inglés y español).','Siete pasos explican el peso de semilla por bolsa, overpack, peso químico cuando está tratada, pesos neto y bruto, muestras y redondeo.','Conservamos Calculation Breakdown, las fórmulas, los cálculos guardados y el sistema de actualizaciones.'],note:'VERSIÓN DE PRUEBA — NO USAR EN PRODUCCIÓN. Verifica los resultados de Leg con los procedimientos aprobados.',close:'Continuar'}
};
let whatsNewPreviouslyFocused=null;
function showWhatsNew(){
  const t=releaseNotes[prefs.language==='es'?'es':'en'];
  $('whatsNewTitle').textContent=t.title;
  const list=$('whatsNewItems');list.replaceChildren();
  t.items.forEach(s=>{const li=document.createElement('li');li.textContent=s;list.appendChild(li)});
  $('whatsNewNote').textContent=t.note;
  $('whatsNewClose').textContent=t.close;
  whatsNewPreviouslyFocused=document.activeElement;
  $('whatsNewModal').hidden=false;
  $('whatsNewClose').focus();
}
function closeWhatsNew(){
  $('whatsNewModal').hidden=true;
  try{localStorage.setItem(RELEASE_KEY,'seen')}catch{}
  if(whatsNewPreviouslyFocused&&whatsNewPreviouslyFocused.isConnected)whatsNewPreviouslyFocused.focus();
}
// Install guide: static instructions work without network; QR links to the official production site.
const INSTALL_URL='https://jerrywebtools.github.io/Production-Calculator/';
const INSTALL_DISMISS_KEY='production-calculator-install-banner-dismissed';
const installCopy={
 en:{heading:'Install Prod Calc',intro:'Add Prod Calc to your phone’s Home Screen for quick access.',ios:'iPhone / iPad · Safari',android:'Android · Chrome',iosSteps:['Open Prod Calc in Safari.','Tap the Share button (square with arrow).','Choose Add to Home Screen.','Confirm the name Prod Calc and tap Add.'],androidSteps:['Open Prod Calc in Chrome.','Tap the three-dot menu.','Choose Install app or Add to Home screen.','Confirm the installation.'],qr:'Scan to open Prod Calc',qrNote:'This QR code opens the official app (not the test version).',open:'Open official Prod Calc',copy:'Copy link',copied:'Link copied',banner:'Want faster access? Add Prod Calc to your Home Screen.',show:'Show Instructions',dismiss:'Not Now'},
 es:{heading:'Instalar Prod Calc',intro:'Agrega Prod Calc a la pantalla de inicio de tu teléfono para abrirla fácilmente.',ios:'iPhone / iPad · Safari',android:'Android · Chrome',iosSteps:['Abre Prod Calc en Safari.','Toca Compartir (cuadro con flecha).','Selecciona Agregar a pantalla de inicio.','Confirma el nombre Prod Calc y toca Agregar.'],androidSteps:['Abre Prod Calc en Chrome.','Toca el menú de tres puntos.','Selecciona Instalar app o Agregar a pantalla principal.','Confirma la instalación.'],qr:'Escanea para abrir Prod Calc',qrNote:'Este código QR abre la aplicación oficial (no la versión de pruebas).',open:'Abrir Prod Calc oficial',copy:'Copiar enlace',copied:'Enlace copiado',banner:'¿Quieres acceso rápido? Agrega Prod Calc a tu pantalla de inicio.',show:'Ver instrucciones',dismiss:'Ahora no'}
};
function applyInstallCopy(){
 const v=installCopy[prefs.language==='es'?'es':'en'];
 for(const [id,key] of [['installHeading','heading'],['installIntro','intro'],['installIosTitle','ios'],['installAndroidTitle','android'],['installQrTitle','qr'],['installQrNote','qrNote'],['installLink','open'],['installCopy','copy'],['installBannerText','banner'],['installBannerShow','show'],['installBannerDismiss','dismiss']])$(id).textContent=v[key];
 for(const [id,key] of [['installIosSteps','iosSteps'],['installAndroidSteps','androidSteps']]){const el=$(id);el.replaceChildren();v[key].forEach(step=>{const li=document.createElement('li');li.textContent=step;el.append(li)});}
}
function standaloneInstall(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;}
function showInstallBanner(){let dismissed=false;try{dismissed=localStorage.getItem(INSTALL_DISMISS_KEY)==='yes'}catch{}$('installBanner').hidden=standaloneInstall()||dismissed;}
$('installBannerShow').addEventListener('click',()=>{openPrefs();$('installHeading').scrollIntoView({block:'center',behavior:'smooth'});});
$('installBannerDismiss').addEventListener('click',()=>{$('installBanner').hidden=true;try{localStorage.setItem(INSTALL_DISMISS_KEY,'yes')}catch{}});
$('installCopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(INSTALL_URL);$('installCopyStatus').textContent=installCopy[prefs.language==='es'?'es':'en'].copied}catch{window.prompt('Copy URL:',INSTALL_URL)}});
// Manual refresh: check connectivity and request the latest service worker before reloading.
// Does not clear localStorage, IndexedDB, or saved calculator history.
const refreshText={
 en:{heading:'Refresh App',help:'Reload Prod Calc to get the latest published files. Requires internet. Your saved calculations and settings stay on this device.',button:'↻ Refresh App',working:'Checking for updated files…',offline:'Unable to reach the app server. Check your connection and try again.',failed:'Could not refresh. Please try again when connected.'},
 es:{heading:'Actualizar aplicación',help:'Vuelve a cargar Prod Calc para obtener los archivos más recientes. Requiere internet. Tus cálculos y ajustes guardados permanecen en este dispositivo.',button:'↻ Actualizar aplicación',working:'Buscando archivos actualizados…',offline:'No se pudo conectar al servidor. Revisa tu conexión e inténtalo de nuevo.',failed:'No se pudo actualizar. Inténtalo de nuevo cuando tengas conexión.'}
};
function applyRefreshCopy(){const t=refreshText[prefs.language==='es'?'es':'en'];$('refreshHeading').textContent=t.heading;$('refreshHelp').textContent=t.help;if(!$('refreshAppBtn').disabled)$('refreshAppBtn').textContent=t.button;$('homeRefreshBtn').textContent=prefs.language==='es'?'↻ Actualizar':'↻ Refresh';}
$('prefLanguage').addEventListener('change',applyRefreshCopy);
applyRefreshCopy();
$('homeRefreshBtn').addEventListener('click',()=>{$('refreshAppBtn').click();});
$('refreshAppBtn').addEventListener('click',async()=>{
 const t=refreshText[prefs.language==='es'?'es':'en'];
 const btn=$('refreshAppBtn'),status=$('refreshAppStatus');
 btn.disabled=true;status.textContent=t.working;
 try{
  // This request must reach the server; a cached/offline fallback is not enough.
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
  let response;
  try{response=await fetch('./index.html?refresh_check='+Date.now(),{cache:'no-store',signal:controller.signal});}finally{clearTimeout(timeout)}
  if(!response.ok||response.type==='opaque')throw Error('unavailable');
  if('serviceWorker' in navigator){const reg=await navigator.serviceWorker.getRegistration();if(reg)await reg.update();}
  const url=new URL(window.location.href);url.searchParams.set('refresh',Date.now().toString());
  window.location.replace(url.toString());
 }catch(error){status.textContent=t.offline;btn.disabled=false;btn.textContent=t.button;}
});
$('whatsNewPrefs').addEventListener('click',showWhatsNew);
$('prefLanguage').addEventListener('change',applyInstallCopy);
applyInstallCopy();showInstallBanner();
$('whatsNewOpen').addEventListener('click',showWhatsNew);
$('whatsNewClose').addEventListener('click',closeWhatsNew);
$('whatsNewModal').addEventListener('click',e=>{if(e.target===$('whatsNewModal'))closeWhatsNew()});
document.addEventListener('keydown',e=>{if(!$('whatsNewModal').hidden){if(e.key==='Escape')closeWhatsNew();if(e.key==='Tab'){e.preventDefault();$('whatsNewClose').focus()}}});
try{if(localStorage.getItem(RELEASE_KEY)!=='seen')showWhatsNew()}catch{showWhatsNew()}

// TEST build update discovery: version.json is fetched from the network, not local storage.
// A build is advertised only after the hosting server returns a different build id.
const LOCAL_TEST_BUILD='v2.5-test-build-6';
const updateCopy={
 en:{title:'Update Available',description:'A newer TEST build is available.',button:'Update Now',working:'Installing update…',retry:'Could not finish updating. Check your connection and try again.'},
 es:{title:'Actualización disponible',description:'Hay una versión más reciente de TEST.',button:'Actualizar ahora',working:'Instalando actualización…',retry:'No se pudo completar la actualización. Revisa tu conexión e inténtalo de nuevo.'}
};
let remoteTestBuild=null,updateInProgress=false,lastUpdateCheck=0;
function renderUpdateBanner(){
 const t=updateCopy[prefs.language==='es'?'es':'en'];
 $('updateBannerTitle').textContent=t.title;$('updateBannerDescription').textContent=t.description;
 if(!updateInProgress)$('updateNowBtn').textContent=t.button;
 $('updateBanner').hidden=!(remoteTestBuild&&Number(remoteTestBuild.split('-').pop())>Number(LOCAL_TEST_BUILD.split('-').pop()));
}
async function fetchRemoteTestBuild(){
 const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),9000);
 try{
  const response=await fetch('./version.json?update_check='+Date.now(),{cache:'no-store',signal:abort.signal});
  if(!response.ok||response.type==='opaque')throw Error('network');
  const data=await response.json();
  if(!data||typeof data.build!=='string'||!/^v2\.5-test-build-\d+$/.test(data.build))throw Error('invalid version');
  return data.build;
 }finally{clearTimeout(timeout)}
}
async function checkForTestUpdates(force=false){
 if(updateInProgress||(!force&&Date.now()-lastUpdateCheck<60000))return;
 lastUpdateCheck=Date.now();
 try{remoteTestBuild=await fetchRemoteTestBuild();renderUpdateBanner();}catch{/* Offline or server unavailable: do not announce a speculative update. */}
}
$('updateNowBtn').addEventListener('click',async()=>{
 if(updateInProgress)return;
 const t=updateCopy[prefs.language==='es'?'es':'en'];
 updateInProgress=true;$('updateNowBtn').disabled=true;$('updateNowBtn').textContent=t.working;
 $('updateBannerStatus').textContent='';
 try{
  // Reconfirm online, so we never claim success from an offline cache.
  const published=await fetchRemoteTestBuild();
  if(Number(published.split('-').pop())<=Number(LOCAL_TEST_BUILD.split('-').pop())){remoteTestBuild=null;renderUpdateBanner();return;}
  if('serviceWorker' in navigator){
   const reg=await navigator.serviceWorker.getRegistration();
   if(reg){await reg.update();if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});}
  }
  // A cache-busted navigation fetches the new HTML; SW uses network-first.
  const next=new URL(location.href);next.searchParams.set('updated',Date.now().toString());
  location.replace(next.toString());
 }catch(e){$('updateBannerStatus').textContent=t.retry;}
 finally{updateInProgress=false;$('updateNowBtn').disabled=false;renderUpdateBanner();}
});
$('prefLanguage').addEventListener('change',renderUpdateBanner);
renderUpdateBanner();
window.addEventListener('pageshow',()=>checkForTestUpdates(true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkForTestUpdates(true)});
window.addEventListener('online',()=>checkForTestUpdates(true));
setInterval(()=>{if(!document.hidden)checkForTestUpdates()},5*60*1000);
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
checkForTestUpdates(true);
})();
