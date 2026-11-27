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
function show(view){['home','modeScreen','coming','bulkCalc','calc','settings','saved','quick','quickSeed','boxSplit','preferences','brain'].forEach(id=>$(id).hidden=id!==view);$('settingsBtn').hidden=false;$('homeRefreshBtn').hidden=view!=='home';document.body.classList.toggle('quick-active',view==='quick');if($('installBanner'))$('installBanner').hidden=view!=='home'||window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true||(()=>{try{return localStorage.getItem('production-calculator-install-banner-dismissed')==='yes'}catch{return false}})();document.body.classList.toggle('brain-active',view==='brain');const navOn=view!=='home'&&view!=='quick'&&view!=='brain';$('globalNav').hidden=!navOn;['back','modeBack','quickBack'].forEach(id=>$(id).hidden=true);const backId=(view==='calc'||view==='bulkCalc'||view==='boxSplit')?'back':view==='modeScreen'?'modeBack':view==='quick'?'quickBack':null;if(backId)$(backId).hidden=false;$('modeLabel').hidden=true;document.querySelector('header').classList.toggle('insideView',navOn);}
function title(name,sub){const tr=v=>prefs.language==='es'?(translations[v]||v):v;const label=(document.querySelector('#calc:not([hidden])')&&sub&&['Treat & Pack','Treat Only','Pack Only'].includes(sub))?name+' · '+sub:name;$('title').textContent=tr(label);$('subtitle').textContent=tr(sub);}
function home(){line=null;mode=null;show('home');title('Production Calculator','Choose a production line.');}
function openLine(v){line=v;if(v==='bulk'){show('bulkCalc');title('Bulk Line','Pack Only · TEST');bulkDefaults();return;}if(v==='3'||v==='4'){show('modeScreen');title('Line '+v,'Choose a calculation mode.');return;}openCalc(v==='1'?'treat':'standalone');}
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
function calculate(){lastResult=null;$('error').hidden=true;const size=Number($('packSize').value),order=Number($('ea').value),pc=Number($('pc').value),unit=$('packUnit').value,seed=$('seedType').value,crop=$('crop').value,condition=$('condition').value;const countPack=['KS','MS'].includes(unit),sampleUsesPC=sampleRows().some(r=>r.unit==='KS'&&r.weight!==''&&r.qty!=='');$('pcField').hidden=!(countPack||sampleUsesPC);updateExtra();const r=rates(line,crop,seed),chem=isPackOnly()?(condition==='treated'?r.chem:0):(mode==='pack'?r.chem:0),over=r.over;$('rates').textContent=`Overpack: ${over}% · Chemical Weight: ${chem}%${overrides[settingKey(line,crop,seed)]?' · Modified Settings':''}`;$('rates').classList.toggle('settingmodified',!!overrides[settingKey(line,crop,seed)]);const reg=$('regular').value==='auto'?(seed==='commercial'?5:1.5):$('regular').value==='none'?0:Number($('regular').value);let custom=0,invalidSample=false;for(const s of sampleRows()){if(s.qty===''&&s.weight==='')continue;const q=Number(s.qty),w=Number(s.weight);if(!Number.isInteger(q)||q<=0||!validPositive(w)||(s.unit==='KS'&&!validPositive(pc))){invalidSample=true;continue;}custom+=q*unitKg(w,s.unit,pc);}const samples=reg+custom;$('sampleSummary').textContent=`Samples: ${fmt(samples,3)} KG · ${fmt(samples*F,2)} LB`;
const valid=validPositive(size)&&Number.isInteger(order)&&order>0&&(!countPack||validPositive(pc))&&(!sampleUsesPC||validPositive(pc))&&!invalidSample&&(!(isPackOnly()||mode==='pack')||(Number.isFinite(Number($('tare').value))&&Number($('tare').value)>=0&&$('tare').value!==''));if(!valid){if(['standalone','leg','1','3','4'].includes(line)){$('standaloneGuide').hidden=true;$('guideContent').replaceChildren();}$('packAll').hidden=true;$('totalKg').textContent='—';$('totalLb').textContent='—';$('bagKg').textContent='—';$('bagLb').textContent='—';$('secondKg').classList.remove('tare-prompt');$('secondKg').textContent='—';$('secondLb').textContent='—';$('breakdown').innerHTML='';$('resultContext').textContent='Enter order details to calculate.';if(invalidSample){$('error').textContent='Complete or remove invalid custom sample rows.';$('error').hidden=false;}return;}
const base=unitKg(size,unit,pc),extra=$('extraPanel').hidden?0:Number($('extra').value),calcEa=order+extra;if(!Number.isInteger(extra)||extra<0){$('error').textContent='Extra EA must be a whole number of zero or greater.';$('error').hidden=false;return;}
const netBag=base*(1+over/100)*(1+chem/100),tareKg=(isPackOnly()||mode==='pack')?unitKg(Number($('tare').value),$('tareUnit').value,pc):0,scaleBag=netBag+tareKg;const seedBase=base*calcEa,overKg=seedBase*over/100,raw=isPackOnly()?netBag*order+samples:seedBase+overKg+samples;const totalKg=Math.ceil(raw),totalLb=totalKg*F;$('totalKg').textContent=fmt(totalKg,0)+' KG';$('totalLb').textContent=fmt(totalLb,2)+' LB';$('resultContext').textContent=`${calcEa} EA · ${fmt(samples,3)} KG samples included`;
if(isPackOnly()||mode==='pack'){$('bagKg').textContent=fmt(base,3)+' KG';$('bagLb').textContent=fmt(base*F,2)+' LB';$('secondKg').classList.toggle('tare-prompt',tareKg<=0);$('secondKg').textContent=tareKg>0?fmt(scaleBag,3)+' KG':'Enter Bag Tare to calculate';$('secondLb').textContent=tareKg>0?fmt(scaleBag*F,2)+' LB':'';}
const breakdown=[['Base KG / EA',fmt(base,3)+' KG / '+fmt(base*F,2)+' LB'],['Order EA',String(order)],['Extra EA',String(extra)],['Calculated EA',String(calcEa)],['Overpack',over+'%'],['Chemical Weight',chem+'%'],['Regular Sample',fmt(reg,3)+' KG'],['Custom Samples',fmt(custom,3)+' KG']];if(isPackOnly()||mode==='pack'){breakdown.push(['Bag Tare',fmt(tareKg,3)+' KG / '+fmt(tareKg*F,3)+' LB'],['Net Seed Weight / EA',fmt(base,3)+' KG / '+fmt(base*F,2)+' LB'],['Fill Weight / EA',fmt(netBag,3)+' KG / '+fmt(netBag*F,2)+' LB'],['Gross Bag Weight / EA',tareKg>0?fmt(scaleBag,3)+' KG / '+fmt(scaleBag*F,2)+' LB':'Enter Bag Tare to calculate']);}else{breakdown.push(['Base requirement',fmt(seedBase,3)+' KG'],['Overpack weight',fmt(overKg,3)+' KG']);if(mode==='pack')breakdown.push(['Finished Bag Target',fmt(netBag,3)+' KG / '+fmt(netBag*F,2)+' LB']);}breakdown.push(['Final rounded total',fmt(totalKg,0)+' KG / '+fmt(totalLb,2)+' LB']);$('breakdown').innerHTML=breakdown.map(([a,b])=>`<div class="detailrow"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join('');lastResult={line,mode,crop,seed,condition,packSize:size,packUnit:unit,pc:countPack||sampleUsesPC?pc:null,orderEa:order,extraEa:extra,calculatedEa:calcEa,over,chem,regular:reg,customSampleKg:custom,rawTotalKg:raw,regularSelection:$('regular').value,customSamples:sampleRows(),tareKg,netBag,scaleBag,base,seedBase,overKg,totalKg,totalLb,samples,bagKg:netBag,bagLb:netBag*F};if(['standalone','leg','1','3','4'].includes(line)){$('standaloneGuide').hidden=false;if($('standaloneGuide').open)renderCalculationGuide();}renderPackAll();}
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
 const w=x=>fmt(x,3), lb=x=>fmt(x,2);
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
   firstFormula=`${n(size)} ${unit} × ${unit==='KS'?'1,000':'1,000,000'} = ${fmt(seeds,0)} ${text('seeds','semillas')}\n${fmt(seeds,0)} ÷ ${n(r.pc)} = ${lb(r.base*F)} LB\n${lb(r.base*F)} LB ÷ ${F} = ${w(r.base)} KG`;
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
 const sampleSummaryMath=`${w(seedOrder)} + ${w(r.regular)} KG ${text('(regular samples)','(muestras regulares)')} + ${w(r.customSampleKg)} KG ${text('(custom samples)','(muestras adicionales)')} = ${w(raw)} KG`;
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
 const w=x=>fmt(x,3), lb=x=>fmt(x,2);
 const row=(a,b)=>`<div class="guideRow"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`;
 const block=(num,title,explain,formula,result)=>`<section class="guideStep"><div class="guideStepTitle"><span class="guideNum">${num}</span><strong>${esc(title)}</strong></div><p>${esc(explain)}</p><div class="guideMath">${esc(formula)}</div><div class="guideResult">${esc(result)}</div></section>`;
 const size=r.packSize,unit=r.packUnit;
 let baseFormula,baseExplain;
 if(unit==='KS'||unit==='MS'){
  const factor=unit==='KS'?1000:1000000,seeds=size*factor;
  baseFormula=`${n(size)} ${unit} × ${fmt(factor,0)} = ${fmt(seeds,0)} ${t('seeds','semillas')}\n${fmt(seeds,0)} ÷ ${n(r.pc)} = ${lb(r.base*F)} LB\n${lb(r.base*F)} LB ÷ ${F} = ${w(r.base)} KG`;
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
 const w=x=>fmt(x,3), lb=x=>fmt(x,2), n=x=>Number(x).toLocaleString('en-US',{maximumFractionDigits:5});
 const row=(a,b)=>`<div class="guideRow"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`;
 const block=(num,name,explain,math,result)=>`<section class="guideStep"><div class="guideStepTitle"><span class="guideNum">${num}</span><strong>${esc(name)}</strong></div><p>${esc(explain)}</p><div class="guideMath">${esc(math)}</div><div class="guideResult">${esc(result)}</div></section>`;
 const seeds=r.packSize*(r.packUnit==='KS'?1000:1000000);
 let firstMath,firstExplain;
 if(['KS','MS'].includes(r.packUnit)){
   firstMath=`${n(r.packSize)} ${r.packUnit} × ${r.packUnit==='KS'?'1,000':'1,000,000'} = ${fmt(seeds,0)} ${t('seeds','semillas')}\n${fmt(seeds,0)} ÷ ${n(r.pc)} = ${lb(r.base*F)} LB\n${lb(r.base*F)} LB ÷ ${F} = ${w(r.base)} KG`;
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
 const w=x=>fmt(x,3), lb=x=>fmt(x,2), n=x=>Number(x).toLocaleString('en-US',{maximumFractionDigits:5});
 const row=(a,b)=>`<div class="guideRow"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`;
 const block=(num,name,explain,math,result)=>`<section class="guideStep"><div class="guideStepTitle"><span class="guideNum">${num}</span><strong>${esc(name)}</strong></div><p>${esc(explain)}</p><div class="guideMath">${esc(math)}</div><div class="guideResult">${esc(result)}</div></section>`;
 const seeds=r.packSize*(r.packUnit==='KS'?1000:1000000);
 let firstMath,firstExplain;
 if(['KS','MS'].includes(r.packUnit)){
   firstMath=`${n(r.packSize)} ${r.packUnit} × ${r.packUnit==='KS'?'1,000':'1,000,000'} = ${fmt(seeds,0)} ${t('seeds','semillas')}\n${fmt(seeds,0)} ÷ ${n(r.pc)} = ${lb(r.base*F)} LB\n${lb(r.base*F)} LB ÷ ${F} = ${w(r.base)} KG`;
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
let prefs={...prefDefaults,...read(PREF_KEY,{})},prefReturn='home',quickReturn='home',qValue='0',qFirst=null,qOp=null,qFresh=true,qExpression='',qConverter=true,qHistory=read(HISTORY_KEY,[]),qMiniValue='0',qMiniUnit='LB',qActive='right',qUndo=[];
if(!Array.isArray(qHistory))qHistory=[];
const colorCodes={blue:'#2563eb',red:'#dc2626',green:'#15803d',yellow:'#facc15',pink:'#be185d',gray:'#64748b',black:'#000000'};
function syncPrefChoices(){document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===prefs.theme)));document.querySelectorAll('[data-color-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.colorChoice===prefs.color)));}
document.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>{$('prefTheme').value=b.dataset.themeChoice;$('prefTheme').dispatchEvent(new Event('change'));}));
document.querySelectorAll('[data-color-choice]').forEach(b=>b.addEventListener('click',()=>{$('prefColor').value=b.dataset.colorChoice;$('prefColor').dispatchEvent(new Event('change'));}));
function applyPrefs(){if(prefs.theme==='oled')prefs.theme='dark';if($('standaloneGuide')?.open&&['standalone','1','3','4'].includes(lastResult?.line))renderCalculationGuide();syncPrefChoices();document.documentElement.dataset.theme=prefs.theme;document.documentElement.dataset.quickAccent=prefs.color;document.documentElement.style.setProperty('--accent',colorCodes[prefs.color]||colorCodes.blue);document.documentElement.lang=prefs.language;['Language','Theme','Color'].forEach(k=>{const e=$('pref'+k);if(e)e.value=prefs[k.toLowerCase()]});translateUI();if($('quickSeed')&&!$('quickSeed').hidden)renderQuickSeed();if($('boxSplit')&&!$('boxSplit').hidden)splitRender();}
const translations={
'Production Calculator':'Production Calculator','Choose a production line.':'Selecciona una línea de producción.','Select a Production Line':'Seleccionar línea de producción','Line 1':'Line 1','Line 3':'Line 3','Line 4':'Line 4','Treat Only':'Solo tratamiento','Treat / Treat & Pack':'Tratar / Tratar y empacar','Leg':'Leg','Stand-Alone':'Stand-Alone','Pack Only':'Solo empaque','Bulk Line':'Bulk Line','Coming Soon 🚧':'Próximamente 🚧','Choose a mode':'Selecciona un modo','Treat & Pack':'Tratar y empacar','Seed to Treat':'Semilla por tratar','Seed to Treat + Bag Target':'Semilla por tratar + peso por bolsa','Crop Type':'Tipo de cultivo','Seed Type':'Tipo de semilla','Seed Condition':'Condición de semilla','Commercial':'Comercial','Parent / Basic':'Padre / Básica','Treated':'Tratada','Untreated':'Sin tratar','Pack Size':'Tamaño de empaque','Order EA':'EA de orden','Bag Tare Weight':'Tara de bolsa','Samples':'Muestras','Regular Sample':'Muestra regular','Edit ▾':'Editar ▾','Hide ▴':'Ocultar ▴','+ Add Custom Sample':'+ Agregar muestra personalizada','Extra EA':'EA adicionales','Net Seed Weight / EA':'Peso neto de semilla / EA','Gross Bag Weight / EA':'Peso bruto de bolsa / EA','Enter Bag Tare to calculate':'Ingresa la tara de la bolsa para calcular','Finished Bag Target':'Peso final por bolsa','Calculated EA':'EA calculados','Total Seed Required':'Semilla total requerida','Calculation Breakdown':'Desglose del cálculo','KILOGRAMS':'KILOGRAMOS','POUNDS':'LIBRAS','Save':'Guardar','Reset Inputs':'Restablecer datos','Saved Calculations':'Cálculos guardados','Settings':'Configuración','Formula Settings':'Configuración de fórmulas','Quick Calculator':'Calculadora rápida','Quick Seed Calculator':'Calculadora rápida de semillas','Manual seed and bag weight calculation':'Cálculo manual de semilla y peso por bolsa','Pack Size / Unit':'Tamaño / Unidad','Seed Count (PC)':'Conteo de semillas (PC)','Quantity (EA)':'Cantidad (EA)','Overpack %':'Overpack %','Chemical Weight %':'Peso químico %','Samples (KG)':'Muestras (KG)','Enter Order Details':'Ingresar detalles de orden','Select Unit':'Seleccionar unidad','Results':'Resultados','TOTAL SEED REQUIRED':'SEMILLA TOTAL REQUERIDA','Chemical (%)':'Químico (%)','Bag Tare':'Tara de bolsa','Normal Corn':'Maíz normal','Shrunken Corn':'Maíz shrunken','Other / Untreated':'Otro / Sin tratar','Net Seed Weight':'Peso neto de semilla','Fill Weight':'Peso de llenado','Gross Bag Weight':'Peso bruto de bolsa','Seed to Treat (rounded KG)':'Semilla para tratar (KG redondeados)','Calculator + Unit Converter':'Calculadora + conversor de unidades','Converter ON':'Conversor activado','Converter OFF':'Conversor desactivado','Recent History':'Historial reciente','Clear':'Borrar','Close':'Cerrar','Apply Changes':'Aplicar cambios','Restore Defaults':'Restaurar valores','Pack All — Actual Available Seed':'Empacar todo — Semilla disponible real','Actual Available Seed (KG)':'Semilla disponible real (KG)','Calculation Summary':'Resumen del cálculo','Back to Home':'Volver al inicio','No recent calculations.':'Sin cálculos recientes.','Complete Bags':'Bolsas completas','Remaining Seed':'Semilla restante','PO Estimated EA':'EA estimados en PO','Actual EA Difference':'Diferencia de EA reales','Formula Settings':'Configuración de fórmulas',"✦ What's New · v2.5 TEST · Build 1":'✦ Novedades · v2.5 TEST · Build 1'};
Object.assign(translations,{"PO Weight Calculator":"Calculadora de peso del PO","PO Required (KG)":"Peso requerido del PO (KG)","Box Weights (KG)":"Pesos de cajas (KG)","Gross":"Bruto","Tare":"Tara","Net":"Neto","Last Box Allocation":"Distribución de la última caja","+ Add Box":"+ Agregar caja","Gross − Tare = Net":"Bruto − Tara = Neto","Reset this calculation?":"¿Restablecer este cálculo?","All entered box weights and the required PO NET will be cleared.":"Se borrarán los pesos ingresados y el Neto requerido del PO.","Enter the required PO NET and each box Gross / Tare. The last box is split between the PO and Return.":"Ingresa el Neto requerido del PO y los pesos bruto y tara de cada caja. La última caja se divide entre el PO y la devolución.","Gross / Tare · Last Box":"Bruto / Tara · Última caja","Enter the required NET and box weights to see the split.":"Ingresa el peso neto requerido y los pesos de las cajas para ver la distribución.","Reset":"Restablecer","Enter required NET":"Ingresa el peso neto requerido"});
Object.assign(translations,{"Appearance":"Apariencia","Choose how the app looks.":"Elige cómo se ve la aplicación.","Accent Color":"Color de acento","Choose the color of buttons and highlighted panels.":"Elige el color de los botones y paneles destacados."});
Object.assign(translations,{"Enter Order Details":"Ingresar detalles de la orden","Operation Mode":"Modo de operación","Treating Only":"Solo tratamiento","Treating & Packing":"Tratamiento y empaque","Packing Only":"Solo empaque","Select Unit":"Seleccionar unidad","Seed Count (PC)":"Conteo de semillas (PC)","Quantity (EA)":"Cantidad (EA)","Overpack (%)":"Sobrellenado (%)","Chemical (%)":"Químico (%)","Samples (KG)":"Muestras (KG)","Bag Tare (KG)":"Tara de bolsa (KG)","Optional":"Opcional","Results":"Resultados","TOTAL SEED REQUIRED":"SEMILLA TOTAL REQUERIDA","Net Seed / EA":"Semilla neta / EA","Fill Weight / EA":"Peso de llenado / EA","Gross Bag Weight / EA (with tare)":"Peso bruto por bolsa / EA (con tara)","Pack All Calculator":"Calculadora de empaque total","Available Seed (KG) — Before Chemical":"Semilla disponible (KG) — Antes del químico","FULL BAGS POSSIBLE":"BOLSAS COMPLETAS POSIBLES","PO Estimated EA":"EA estimadas del PO","Actual EA Difference":"Diferencia real de EA","Remaining Seed":"Semilla restante","Seed Used for Bags":"Semilla utilizada en bolsas","Total Fill Weight":"Peso total de llenado","Calculation Breakdown":"Desglose del cálculo","📖 How Was This Calculated?":"📖 ¿Cómo se calculó?","Reset this calculation?":"¿Restablecer este cálculo?","All order details and current results will be cleared.":"Se borrarán los detalles de la orden y los resultados actuales.","All order details and current results will be cleared. This action cannot be undone.":"Se borrarán todos los datos de la orden y los resultados actuales. Esta acción no se puede deshacer.","Cancel":"Cancelar","Examples: 2500 seeds/lb":"Ejemplo: 2500 semillas/lb","Examples: 100 bags":"Ejemplo: 100 bolsas","Examples: 1% Commercial · 0.5% Parent":"Ejemplos: 1% comercial · 0.5% parental","Examples: 5 KG, 3 KG, or 0 KG of seed for samples":"Ejemplos: 5 KG, 3 KG o 0 KG de semilla para muestras","Examples: 0.100 KG":"Ejemplo: 0.100 KG","Examples: 100KS, 80KS, 50KS, 25KS, 20KS, 10KS, 500KS - 1MS, 5MS - 25KG, 20KG, 10KG, 1KG - 50LB":"Ejemplos: 100KS, 80KS, 50KS, 25KS, 20KS, 10KS, 500KS - 1MS, 5MS - 25KG, 20KG, 10KG, 1KG - 50LB","Total seed required for the order, including overpack and samples. Excludes chemical weight and bag tare.":"Semilla total de la orden, incluido sobrellenado y muestras. Excluye químico y tara.","Actual seed weight per bag, before overpack and chemical weight.":"Peso real de semilla por bolsa, antes del sobrellenado y químico.","Target fill weight per bag, including overpack and chemical weight. Excludes bag tare.":"Peso objetivo de llenado por bolsa, incluido sobrellenado y químico. Excluye la tara.","Fill weight plus bag tare. Shown only when tare is entered.":"Peso de llenado más tara. Se muestra solo cuando se ingresa la tara.","Samples (KG) are reserved first. Chemical changes finished fill weight, not available seed required.":"Primero se reservan las muestras (KG). El químico modifica el peso final de llenado, no la semilla disponible necesaria.","After samples and full bags":"Después de muestras y bolsas completas","Excludes reserved samples and chemical":"Excluye muestras reservadas y químico","Includes chemical when Chemical (%) is above 0":"Incluye químico cuando Químico (%) es mayor que 0","Treating • Treating & Packing • Packing":"Tratamiento • Tratamiento y empaque • Empaque","Seed to Treat + Fill Weight":"Semilla para tratar + peso de llenado","Manual seed and bag weight calculation":"Cálculo manual de semilla y peso de bolsa","Quick Seed Calculator":"Calculadora rápida de semillas","TOTAL SEED TO TREAT":"SEMILLA TOTAL PARA TRATAR","TOTAL SEED FOR PACKING":"SEMILLA TOTAL PARA EMPACAR","Pack Size":"Tamaño de empaque"});
const originalText=new WeakMap();
function translateUI(){const spanish=prefs.language==='es';document.querySelectorAll('button, label, h1, h2, strong, summary, .eyebrow, .pill, small, #preferences .prefVisualGroup h3, #preferences .prefVisualGroup p, #boxSplit .splitHead span, #boxSplit .boxSplitPanel > p, #boxSplit .splitColumns strong').forEach(el=>{if(el.closest('#quickHistory,#packAllOutput,#savedList,#breakdown'))return;for(const node of el.childNodes){if(node.nodeType!==3)continue;if(!originalText.has(node))originalText.set(node,node.nodeValue);const base=originalText.get(node);const trimmed=base.trim();if(!trimmed)continue;const clean=trimmed.replace(/^[←▦⚙️💾]+\s*/u,'');const t=translations[clean];if(t)node.nodeValue=spanish?base.replace(clean,t):base;}});const qs=$('quickSeed');if(qs){qs.querySelectorAll('*').forEach(el=>{if(el.closest('#qsBreakdown,#qsGuide')||el.matches('#qsOperationHelp,#qsChemHelp,#qsTotalHeading,#qsPackAllStatus,#qsPackAllDifferenceMessage,#qsError,#qsPackAllError,#qsTotalCard .qsMeaning'))return;for(const node of el.childNodes){if(node.nodeType!==3)continue;if(!originalText.has(node))originalText.set(node,node.nodeValue);const base=originalText.get(node),trimmed=base.trim();const translated=translations[trimmed];if(translated)node.nodeValue=spanish?base.replace(trimmed,translated):base;}});}const pageTitle=$('title'),pageSubtitle=$('subtitle');for(const el of [pageTitle,pageSubtitle]){if(!el)continue;const current=el.textContent;const english=Object.entries(translations).find(([en,sp])=>sp===current)?.[0]||current;const translated=translations[english];if(translated)el.textContent=spanish?translated:english;}const splitTarget=$('splitTarget');if(splitTarget)splitTarget.placeholder=spanish?'Ingresa el peso neto requerido':'Enter required NET';document.querySelectorAll('option').forEach(el=>{if(!el.dataset.originalLabel)el.dataset.originalLabel=el.textContent;const t=translations[el.dataset.originalLabel];el.textContent=spanish&&t?t:el.dataset.originalLabel;});}
function openPrefs(){prefReturn=document.querySelector('#quick:not([hidden])')?'quick':document.querySelector('#quickSeed:not([hidden])')?'quickSeed':document.querySelector('#boxSplit:not([hidden])')?'boxSplit':document.querySelector('#calc:not([hidden])')?'calc':document.querySelector('#settings:not([hidden])')?'settings':'home';show('preferences');title('Settings','Language, theme and button color');applyPrefs();}
function closePrefs(){show(prefReturn==='settings'?'calc':prefReturn);if(prefReturn==='home')home();else if(prefReturn==='quick')title('Quick Calculator','Calculator + Unit Converter');else if(prefReturn==='quickSeed'){title('Quick Seed Calculator','Manual seed and bag weight calculation');renderQuickSeed();}else if(prefReturn==='boxSplit'){title(splitT('PO Weight Calculator','Calculadora de peso del PO'),splitT('Gross / Tare / Net','Bruto / Tara / Neto'));splitRender();}else title(lineName(line),'Calculator');}
function openQuick(from){qActive='right';$('percentPanel').hidden=true;quickReturn=from;show('quick');$('quickHistoryPanel').hidden=true;$('unitPanel').hidden=true;$('seedPanel').hidden=true;title('Quick Calculator','Calculator + Unit Converter');$('quickBack').textContent=from==='home'?'← Back to Home':from==='quickSeed'?'← Back to Quick Seed':`← Back to ${lineName(line)} Summary`;renderQuick();translateUI();}
function backQuick(){if(quickReturn==='home')home();else if(quickReturn==='quickSeed')openQuickSeed();else{show('calc');title(lineName(line),'Calculator');calculate();}}
const KG_TO_LB=2.2046226218487757;
const convPairs={'kg-lb':['KG','LB',KG_TO_LB],'lb-kg':['LB','KG',1/KG_TO_LB],'g-oz':['g','oz',1/28.349523125],'oz-g':['oz','g',28.349523125],'ml-foz':['mL','fl oz',1/29.5735295625],'foz-ml':['fl oz','mL',29.5735295625],'l-gal':['L','gal',1/3.785411784],'gal-l':['gal','L',3.785411784]};
function quickFmt(x){return Number.isFinite(x)?Number(x.toPrecision(14)).toLocaleString('en-US',{maximumFractionDigits:8}):'Error';}
function quickTwo(x){return Number.isFinite(x)?x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):'Error';}
function quickInputFmt(s){if(s==='Error')return 'Error';const parts=String(s).split('.');const a=Number(parts[0]||0).toLocaleString('en-US',{maximumFractionDigits:0});return parts.length>1?a+'.'+parts[1]:a;}
function quickMiniConverted(){return Number(qMiniValue)*(qMiniUnit==='LB'?1/KG_TO_LB:KG_TO_LB);}
function quickSnapshot(){return {qValue,qFirst,qOp,qFresh,qExpression,qConverter,qMiniValue,qMiniUnit,qActive,pair:$('converterPair').value,history:JSON.parse(JSON.stringify(qHistory))};}
function quickSaveUndo(){qUndo.push(quickSnapshot());if(qUndo.length>80)qUndo.shift();}
function quickUndoAction(){if(!qUndo.length)return;const s=qUndo.pop();({qValue,qFirst,qOp,qFresh,qExpression,qConverter,qMiniValue,qMiniUnit,qActive}=s);$('converterPair').value=s.pair;qHistory=s.history;persist(HISTORY_KEY,qHistory);renderQuick();}
function quickHistoryAdd(type,expression,value){qHistory.unshift({type,expression,value});qHistory=qHistory.slice(0,200);persist(HISTORY_KEY,qHistory);}
function quickResizeNumbers(){
  // Measure the rendered text, not an estimated Arial width. iOS uses system fonts,
  // and a canvas approximation can leave trailing digits clipped.
  const fit=(id,max,min)=>{
    const el=$(id);
    if(!el||!el.getClientRects().length)return;
    let available=el.clientWidth-6;
    if(id==='quickMiniInput'||id==='quickMiniOutput'){
      const holder=el.parentElement,unit=holder.lastElementChild;
      const gap=parseFloat(getComputedStyle(holder).columnGap)||4;
      available=holder.clientWidth-unit.getBoundingClientRect().width-gap-6;
    }
    if(available<=0)return;
    const range=document.createRange();
    range.selectNodeContents(el);
    const fits=size=>{
      el.style.fontSize=size+'px';
      return range.getBoundingClientRect().width<=available;
    };
    if(fits(max))return;
    if(!fits(min)){el.style.fontSize=min+'px';return;}
    let low=min,high=max;
    for(let i=0;i<11;i++){
      const mid=(low+high)/2;
      if(fits(mid))low=mid;else high=mid;
    }
    el.style.fontSize=(Math.floor(low*10)/10)+'px';
  };
  // Always start large for short values, then shrink as more digits are entered.
  // A 12px minimum keeps up to 14 input digits plus separators visible on phones.
  fit('quickNumber',qConverter?68:92,12);
  fit('quickMiniInput',24,10);
  fit('quickMiniOutput',24,10);
}

function renderQuick(){
  const pair=convPairs[$('converterPair').value],on=qConverter;
  if(!on)qActive='right';
  $('quickDisplays').classList.toggle('converterOff',!on);
  $('quickMini').hidden=!on;
  $('quickSecondary').hidden=!on;
  $('quickMini').classList.toggle('quickSelected',on&&qActive==='left');
  $('quickMini').setAttribute('aria-pressed',String(on&&qActive==='left'));
  $('quickCalcPanel').setAttribute('aria-pressed',String(qActive==='right'));
  $('quickCalcPanel').classList.toggle('quickSelected',qActive==='right');
  $('quickMiniInput').textContent=quickInputFmt(qMiniValue);
  $('quickMiniInputUnit').textContent=qMiniUnit;
  $('quickMiniOutput').textContent=quickTwo(quickMiniConverted());
  $('quickMiniOutputUnit').textContent=qMiniUnit==='LB'?'KG':'LB';
  $('quickNumber').textContent=qExpression.endsWith('=')&&qOp===null&&qFresh&&qValue!=='Error'?quickTwo(Number(qValue)):quickInputFmt(qValue);
  $('quickExpression').textContent=qExpression;
  const live=$('quickLiveResult'),b=Number(qValue);
  const liveValue=qOp&&qFirst!==null&&!qFresh&&qValue!=='Error'?(qOp==='+'?qFirst+b:qOp==='−'?qFirst-b:qOp==='×'?qFirst*b:b===0?NaN:qFirst/b):null;
  live.hidden=liveValue===null||!Number.isFinite(liveValue);live.textContent=live.hidden?'':`= ${quickTwo(liveValue)}`;
  $('converterToggle').querySelector('.toolLabel').textContent=on?'Converter ON':'Converter OFF';
  $('converterToggle').setAttribute('aria-pressed',String(on));
  $('quickMainSwap').textContent=`${pair[0]} → ${pair[1]} ⇄`;
  $('quickConverted').textContent=on&&qValue!=='Error'?`${quickTwo(Number(qValue)*pair[2])} ${pair[1]}`:'';
  $('quickUndo').disabled=!qUndo.length;
  const last=qHistory.find(x=>x.type!=='conversion');
  $('quickLastCalculation').textContent=last?`${last.expression} ${quickTwo(Number(last.value))}`:'No calculations yet.';
  if(!$('quickHistoryPanel').hidden){
    $('quickHistory').innerHTML=qHistory.length?qHistory.map((x,i)=>`<button type="button" class="historyItem" data-history="${i}"><small>${x.type==='conversion'?'CONVERSION':'CALCULATION'} · ${esc(x.expression)}</small><strong>${esc(x.type==='conversion'?quickTwo(Number(x.value))+' '+(x.target||''):quickTwo(Number(x.value)))}</strong></button>`).join(''):'No recent calculations.';
    $('quickHistory').querySelectorAll('[data-history]').forEach(btn=>btn.onclick=()=>{const x=qHistory[Number(btn.dataset.history)];quickSaveUndo();qValue=String(x.value);qExpression='';qOp=null;qFirst=null;qFresh=true;qActive='right';if(x.type==='conversion'&&x.target){$('converterPair').value=x.target==='KG'?'kg-lb':'lb-kg'}$('quickHistoryPanel').hidden=true;renderQuick();});
  }
  requestAnimationFrame(quickResizeNumbers);
}
function quickSelect(side){if(side==='left'&&!qConverter)return;qActive=side;renderQuick();}
function quickKey(k){
  const mini=qActive==='left'&&qConverter;
  if(mini){
    if(['+','−','×','÷','='].includes(k))return;
    quickSaveUndo();
    if(k==='AC')qMiniValue='0';
    else if(k==='⌫')qMiniValue=qMiniValue.length<2?'0':qMiniValue.slice(0,-1);
    else if(k==='±')qMiniValue=String(-Number(qMiniValue));
    else if(k==='%')qMiniValue=String(Number(qMiniValue)/100);
    else if(k==='.'){if(!qMiniValue.includes('.'))qMiniValue+='.';}
    else if(/^\d$/.test(k)){qMiniValue=qMiniValue==='0'?k:qMiniValue.replace(/\D/g,'').length<14?qMiniValue+k:qMiniValue;}
    renderQuick();return;
  }
  if(k==='='){if(qOp===null||qFirst===null||qFresh)return;}
  quickSaveUndo();
  if(k==='AC'){qValue='0';qFirst=null;qOp=null;qFresh=true;qExpression='';}
  else if(k==='⌫'){qValue=qValue.length<2||qValue==='Error'?'0':qValue.slice(0,-1);qFresh=false;}
  else if(k==='±'){qValue=String(-Number(qValue));qFresh=false;}
  else if(k==='%'){const value=Number(qValue);qValue=String(qFirst!==null&&['+','−'].includes(qOp)?qFirst*value/100:value/100);qFresh=false;}
  else if(['+','−','×','÷'].includes(k)){
    if(qOp!==null&&qFirst!==null&&!qFresh){quickCalculate(false);}
    qFirst=Number(qValue);qOp=k;qFresh=true;qExpression=`${quickFmt(qFirst)} ${k}`;
  }
  else if(k==='=')quickCalculate(true);
  else if(k==='.'){if(qFresh){qValue='0.';qFresh=false;}else if(!qValue.includes('.'))qValue+='.';}
  else if(/^\d$/.test(k)){qValue=qFresh||qValue==='0'||qValue==='Error'?k:qValue.replace(/\D/g,'').length<14?qValue+k:qValue;qFresh=false;}
  renderQuick();
}
function quickCalculate(record){
  if(qOp===null||qFirst===null||qFresh)return;
  const a=qFirst,b=Number(qValue),op=qOp;
  const r=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:b===0?NaN:a/b;
  qExpression=`${quickFmt(a)} ${op} ${quickFmt(b)} =`;
  qValue=Number.isFinite(r)?String(Number(r.toPrecision(15))):'Error';
  if(record&&Number.isFinite(r))quickHistoryAdd('calculation',qExpression,Number(qValue));
  qOp=null;qFirst=null;qFresh=true;
}
function quickUseMini(){
  if(!qConverter)return;
  const converted=quickMiniConverted();if(!Number.isFinite(converted))return;
  quickSaveUndo();
  const target=qMiniUnit==='LB'?'KG':'LB';
  quickHistoryAdd('conversion',`${quickInputFmt(qMiniValue)} ${qMiniUnit} →`,converted);
  qHistory[0].target=target;persist(HISTORY_KEY,qHistory);
  qValue=String(Number(converted.toPrecision(15)));
  if(qOp===null)qExpression='';
  qFresh=false;qActive='right';
  $('converterPair').value=target==='KG'?'kg-lb':'lb-kg';
  renderQuick();
}
// Bulk Line calculator. All scale targets are KG; treated chemical is an existing weight factor.
let bulkEaManual=false;
function bulkAutoEa(){
 const crop=$('bulkCrop').value;
 if(crop!=='normalCorn'&&crop!=='shrunkenCorn')return null;
 if($('bulkBasis').value!=='total')return null;
 const size=Number($('bulkSize').value),pc=Number($('bulkPc').value),unit=$('bulkUnit').value;
 const net=unitKg(size,unit,pc),over=Number($('bulkOver').value)/100;
 const chem=$('bulkCondition').value==='treated'?Number($('bulkChem').value)/100:0;
 const factor=(1+over)*(1+chem);
 if(!(net>0)||!Number.isFinite(net)||!(factor>0))return null;
 return Math.max(1,Math.round(net*factor/700));
}
function bulkSyncEa(){
 const ea=bulkAutoEa();
 if(ea!==null&&!bulkEaManual)$('bulkEa').value=String(ea);
 bulkUpdate();
}
function bulkSetUnit(unit){
 $('bulkUnit').value=unit;
 document.querySelectorAll('[data-bulk-unit]').forEach(b=>{const selected=b.dataset.bulkUnit===unit;b.classList.toggle('qsUnitActive',selected);b.setAttribute('aria-pressed',String(selected));});
}
function bulkOrderDefaults(){
 const crop=$('bulkCrop').value,type=$('bulkOrderType').value;
 const corn=crop==='normalCorn'||crop==='shrunkenCorn';
 const orderType=$('bulkOrderType');
 const cornOption=orderType.querySelector('[value="weight"]');
 if(corn&&!cornOption){const option=document.createElement('option');option.value='weight';option.textContent='Corn · Equal Tote Fill';orderType.prepend(option);}
 if(!corn&&cornOption)cornOption.remove();
 orderType.value=corn?'weight':type==='weight'?'export':type;
 const selectedType=$('bulkOrderType').value;
 const count=selectedType==='count',domestic=selectedType==='domestic';
 const preset=$('bulkTotePreset');
 preset.replaceChildren();
 const options=domestic?[['2000lb','2,000 LB'],['2500lb','2,500 LB'],['1134','1,134 KG'],['custom','Custom NET']]:[['1000','1,000 KG'],['custom','Custom NET']];
 options.forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;preset.append(option);});
 $('bulkFullNetField').hidden=corn;
 $('bulkBasis').value=count?'per':'total';
 $('bulkSize').value=count?'5':domestic?'2000':corn?'2500':'30000';
 bulkSetUnit(count?'MS':domestic?'LB':'KG');
 bulkEaManual=false;
 $('bulkEa').value=corn?String(Math.max(1,Math.round(2500*1.01/700))):'30';
 bulkTotePreset();
 bulkDefaults();
 bulkSyncEa();
}
function bulkTotePreset(){
 const preset=$('bulkTotePreset').value;
 if(preset!=='custom')$('bulkFullNet').value=preset==='2000lb'?String(2000/F):preset==='2500lb'?String(2500/F):preset;
 bulkUpdate();
}
function bulkUpdate(){
 const g=id=>$(id),n=id=>Number(g(id).value),crop=g('bulkCrop').value,seed=g('bulkSeed').value,condition=g('bulkCondition').value,basis=g('bulkBasis').value,unit=g('bulkUnit').value;
 const isCorn=crop==='normalCorn'||crop==='shrunkenCorn',isCount=['KS','MS'].includes(unit),samples=n('bulkSamples'),over=n('bulkOver')/100,chem=condition==='treated'?n('bulkChem')/100:0,pc=n('bulkPc'),factor=(1+over)*(1+chem);
 g('bulkPcField').hidden=!isCount;g('bulkFullNetField').hidden=isCorn||basis!=='total'||isCount;g('bulkSizeText').textContent=basis==='total'?'Total PO NET':'NET / Tote';
 const err=g('bulkError'),out=g('bulkOutput'),all=g('bulkAllOutput'),availableRaw=g('bulkAvailable').value.trim();
 g('bulkAllInputs').hidden=availableRaw==='';err.hidden=true;all.replaceChildren();
 const fail=s=>{err.textContent=s;err.hidden=false;out.replaceChildren();};
 const weight=x=>fmt(x,3)+' KG / '+fmt(x*F,2)+' LB';
 const row=(a,b)=>`<div class="detailrow"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`;
 if([over,chem,samples].some(x=>!Number.isFinite(x)||x<0)||['bulkOver','bulkChem','bulkSamples'].some(id=>g(id).value===''))return fail('Enter valid overpack, existing chemical weight, and sample amounts.');
 const size=n('bulkSize'),orderEa=n('bulkEa');if(g('bulkSize').value.trim()===''||g('bulkEa').value.trim()===''||!(size>0)||!Number.isInteger(orderEa)||orderEa<1||(isCount&&(!(pc>0)||g('bulkPc').value.trim()==='')))return fail('Enter a positive NET amount, whole tote count, and PC for KS/MS.');
 
 const net=unitKg(size,unit,pc),totalNet=basis==='total'?net:net*orderEa;
 const fullNet=basis==='total'&&!isCorn?n('bulkFullNet'):net;if(!(fullNet>0)||basis==='total'&&!isCorn&&g('bulkFullNet').value.trim()==='')return fail('Enter a positive standard NET / Full Tote.');
 // Total-PO orders: allow final partial tote when the total is not evenly divisible by the standard net/tote target.
 const referenceFullCount=basis==='total'?Math.floor((totalNet+1e-7)/fullNet):orderEa;
 const referenceLeftover=basis==='total'?totalNet-referenceFullCount*fullNet:0;
 const referencePartial=basis==='total'&&Math.abs(referenceLeftover)>1e-7?Math.max(0,referenceLeftover):0;
 // Preserve a full/partial order only when its EA matches that arrangement.
 // Otherwise, distribute total PO NET evenly across the operator's requested EA.
 const mixed=!isCorn&&basis==='total'&&referenceFullCount+(referencePartial>1e-8?1:0)===orderEa;
 const uniform=basis==='total'&&!mixed;
 const toteNet=uniform?totalNet/orderEa:fullNet;
 const exactFull=uniform?orderEa:referenceFullCount;
 const partialNet=uniform?0:referencePartial;
 const rawFill=toteNet*factor,scale=Math.ceil(rawFill-1e-9);
 const partialFill=partialNet>1e-8?Math.ceil(partialNet*factor-1e-9):0;
 const packedNet=uniform?totalNet:exactFull*toteNet+partialNet;
 const totalFill=exactFull*scale+partialFill,required=totalFill+samples;
 const primaryScale=exactFull>0?scale:partialFill;
 const partialOnly=exactFull===0&&partialNet>0;
 const recommendedEa=isCorn&&basis==='total'&&!isCount?Math.max(1,Math.round(totalNet*factor/700)):null;
 const recommendedNet=recommendedEa?totalNet/recommendedEa:null;
 const recommendedFill=recommendedEa?Math.ceil(recommendedNet*factor-1e-9):null;
 const recommendedTotal=recommendedEa?recommendedEa*recommendedFill+samples:null;
 const breakdown=[
  ['Net Seed Weight / Tote',weight(partialOnly?partialNet:toteNet)],
  ['Overpack',fmt(over*100,2)+'%'],
  ['Chemical Weight',fmt(chem*100,2)+'%'],
  ['Order EA',String(orderEa)],
  ['Full Totes',String(exactFull)],...(uniform?[['Distribution','Equal NET per tote']]:[]),
  ...(partialNet>1e-8?[['Partial Tote NET',weight(partialNet)],['Partial Tote Fill Weight',weight(partialFill)]]:[]),
  ['Total NET Packed',weight(packedNet)],
  ['Total Fill Weight',weight(totalFill)],
  ['Samples',weight(samples)],
  ['Final rounded total',weight(required)]
 ];
 out.innerHTML=`${recommendedEa!==null?`<div class="qsTotalCard bulkRecommendation"><strong>RECOMMENDED CORN TOTE PLAN · NEAR 700 KG</strong><div class="qsTotalNumber">${recommendedEa} EA × ${fmt(recommendedFill,0)} KG</div><div class="qsLb">NET / Tote: ${fmt(recommendedNet,3)} KG · Total Seed Required: ${fmt(recommendedTotal,0)} KG</div><button type="button" id="bulkApplyRecommendation" class="qsReset">Use ${recommendedEa} totes</button></div>`:''}<div class="qsTotalCard"><strong>TOTAL SEED REQUIRED</strong><div class="qsTotalNumber">${fmt(required,0)} KG</div><div class="qsLb">${fmt(required*F,2)} LB · ${orderEa} EA · ${fmt(samples,3)} KG samples included</div></div><div class="qsSmallCards"><div class="qsSmallCard"><span>Net Seed Weight / Tote</span><div class="qsSmallNumber">${fmt(partialOnly?partialNet:toteNet,3)} KG</div><div class="qsLb">${fmt((partialOnly?partialNet:toteNet)*F,2)} LB</div></div><div class="qsSmallCard"><span>Fill Weight / Tote</span><div class="qsSmallNumber">${fmt(primaryScale,0)} KG</div><div class="qsLb">${fmt(primaryScale*F,2)} LB</div></div></div>${partialNet>1e-8?row('Partial Tote Fill Weight',weight(partialFill)):''}<details class="qsDisclosure"><summary>'+splitT('Calculation Breakdown','Desglose del cálculo')+'</summary><div class="bulkBreakdown">${breakdown.map(([label,value])=>row(label,value)).join('')}<p class="muted tiny">NET × (1 + Overpack) × (1 + Chemical Weight) = Fill Weight. Bulk Line rounds each tote fill target UP to a whole KG; samples are added once.</p></div></details>`;
 const applyRecommendation=$('bulkApplyRecommendation');
 if(applyRecommendation)applyRecommendation.addEventListener('click',()=>{bulkEaManual=false;bulkSyncEa();});
 if(!availableRaw)return;
 const available=n('bulkAvailable'),suggest=n('bulkSuggested'),manualRaw=g('bulkManualEa').value.trim(),manual=manualRaw?Number(manualRaw):null;
 if(!Number.isFinite(available)||available<0||g('bulkSuggested').value.trim()===''||!(suggest>=1)||manual!==null&&(!Number.isInteger(manual)||manual<1)){all.innerHTML='<p class="error">Enter valid available seed, fill target, and optional whole tote count.</p>';return;}
 if(available<samples){all.innerHTML='<p class="error">Available seed is less than the sample reserve.</p>';return;}
 const usable=available-samples,fill=Math.floor(suggest),autoEa=Math.floor((usable+1e-9)/fill);
 const ea=manual===null?autoEa:manual,used=ea*fill,remaining=usable-used,delta=ea-orderEa,possibleAtOrderEa=orderEa>0?Math.floor(usable/orderEa):0,orderShortfall=available-required,orderCanPack=orderShortfall>=-1e-9,selectedFillMeetsPO=fill>=(exactFull>0?scale:partialFill),selectedEaMeetsPO=ea>=orderEa,selectedSeedFits=remaining>=-1e-9,selectedPlanMeetsPO=selectedFillMeetsPO&&selectedEaMeetsPO&&selectedSeedFits&&orderCanPack&&!((partialNet>1e-8)&&exactFull>0);
 all.innerHTML=`<h2>${manual===null?'Auto Suggestion':'Operator Adjusted'}</h2><div class="huge">${ea} EA × ${fmt(fill,0)} KG</div>${row('Samples Reserved',weight(samples))}${row('PO Order EA',String(orderEa))}${row('PO Required (including samples)',weight(required))}${row('PO Seed Status',orderCanPack?'Enough seed for PO':'Short '+weight(-orderShortfall))}${row('Selected Plan vs PO',selectedPlanMeetsPO?'Meets basic PO checks':'Review / Does not meet PO checks')}${partialNet>1e-8&&exactFull>0?'<p class="error">This PO contains a partial tote. Pack All assumes equal fill weight for all totes, so its EA suggestion cannot confirm this mixed full/partial order. Use Order Results for the PO target.</p>':''}${row('Selected Fill vs PO Tote Target',selectedFillMeetsPO?'Meets reference tote target':'Below reference target by '+weight((exactFull>0?scale:partialFill)-fill))}${row('Selected EA vs PO',selectedEaMeetsPO?'Meets order EA':'Short '+String(orderEa-ea)+' EA')}${!selectedFillMeetsPO?'<p class="error">Selected fill weight is below the calculated PO full-tote target. This plan does not meet the PO NET/overpack requirement.</p>':''}${row('Suggested KG / Tote for PO EA',weight(possibleAtOrderEa))}${row('Full Totes',String(ea))}${row('EA Difference', (delta>0?'+':'')+delta)}${remaining>=0?row('Unused Seed After Full Totes',weight(remaining)):row('Seed Shortfall at Selected Fill',weight(-remaining))}${remaining<0?'<p class="error">Not enough seed for the selected number of totes at this fill weight.</p>':''}<p class="muted tiny">Scale fill suggestion rounded DOWN; confirm first tote capacity. Remaining seed excludes reserved samples.</p>`;
}
function bulkDefaults(){
 const crop=$('bulkCrop').value,seed=$('bulkSeed').value,condition=$('bulkCondition').value;
 $('bulkOver').value=seed==='parent'?'0.5':(crop==='normalCorn'||crop==='shrunkenCorn'?'1':'0.5');
 $('bulkChem').value=condition==='treated'?(crop==='normalCorn'?'1':crop==='shrunkenCorn'?'1.2':'0'):'0';
 $('bulkSamples').value=seed==='parent'?'1.5':'5';$('bulkSuggested').value=(crop==='normalCorn'||crop==='shrunkenCorn')?'700':'1005';$('bulkManualEa').value='';bulkSyncEa();
}
['bulkBasis','bulkSize','bulkUnit','bulkPc','bulkOver','bulkChem'].forEach(id=>$(id).addEventListener('input',bulkSyncEa));
$('bulkEa').addEventListener('input',()=>{bulkEaManual=true;bulkUpdate();});
function bulkStepEa(change){
 const current=Number($('bulkEa').value);
 $('bulkEa').value=String(Math.max(1,(Number.isInteger(current)&&current>=1?current:1)+change));
 bulkEaManual=true;
 bulkUpdate();
}
$('bulkEaMinus').addEventListener('click',()=>bulkStepEa(-1));
$('bulkEaPlus').addEventListener('click',()=>bulkStepEa(1));
['bulkSamples','bulkAvailable','bulkSuggested','bulkManualEa','bulkFullNet'].forEach(id=>$(id).addEventListener('input',bulkUpdate));
['bulkSeed','bulkCondition'].forEach(id=>$(id).addEventListener('change',bulkDefaults));
$('bulkCrop').addEventListener('change',()=>{
 const crop=$('bulkCrop').value,corn=crop==='normalCorn'||crop==='shrunkenCorn';
 const select=$('bulkOrderType');
 if(corn){if(!select.querySelector('[value="weight"]')){const opt=document.createElement('option');opt.value='weight';opt.textContent='Corn · Equal Tote Fill';select.prepend(opt);}select.value='weight';}
 else{select.querySelector('[value="weight"]')?.remove();select.value='export';}
 bulkOrderDefaults();
});
$('bulkOrderType').addEventListener('change',bulkOrderDefaults);
$('bulkTotePreset').addEventListener('change',bulkTotePreset);
$('bulkFullNet').addEventListener('input',()=>{$('bulkTotePreset').value='custom';});
document.querySelectorAll('[data-bulk-unit]').forEach(button=>button.addEventListener('click',()=>{bulkSetUnit(button.dataset.bulkUnit);bulkSyncEa();}));
$('bulkReset').addEventListener('click',()=>{
 ['bulkCrop','bulkSeed','bulkCondition'].forEach((id,i)=>$(id).value=['peas','commercial','untreated'][i]);$('bulkOrderType').value='export';
 $('bulkSize').value='1000';$('bulkEa').value='30';$('bulkFullNet').value='1000';$('bulkPc').value='';$('bulkAvailable').value='';
 document.querySelectorAll('[data-bulk-unit]').forEach(b=>{const selected=b.dataset.bulkUnit==='KG';b.classList.toggle('qsUnitActive',selected);b.setAttribute('aria-pressed',String(selected));});
 bulkOrderDefaults();
});
$('bulkRestore').addEventListener('click',()=>{$('bulkManualEa').value='';$('bulkSuggested').value=($('bulkCrop').value==='normalCorn'||$('bulkCrop').value==='shrunkenCorn')?'700':'1005';bulkUpdate();});
function renderPackAll(){const supported=line==='1'||((line==='3'||line==='4')&&mode==='pack')||isPackOnly();$('packAll').hidden=!supported;if(!supported||!lastResult)return;const raw=$('availableKg').value,out=$('packAllOutput');if(raw===''){out.textContent='Enter available KG to calculate complete bags.';return;}const available=Number(raw),r=lastResult;if(!Number.isFinite(available)||available<0){out.textContent='Enter a valid KG amount.';return;}const reserve=r.samples;const usable=Math.max(0,available-reserve);if(available<reserve){out.innerHTML=`<p class="error">Not enough available seed for samples: ${fmt(available,3)} KG available, ${fmt(reserve,3)} KG reserved.</p>`;return;}const perBag=(r.line==='standalone'||r.line==='leg')?r.netBag:r.base*(1+r.over/100);if(!(perBag>0)){out.textContent='Complete the order inputs first.';return;}const ea=Math.max(0,Math.floor((usable+1e-9)/perBag));const remaining=Math.max(0,usable-ea*perBag);const difference=ea-r.orderEa;const unitLabel=r.line==='1'?'EA equivalents':'Complete Bags';out.innerHTML=`<div class="detailrow"><span>PO Estimated EA</span><strong>${r.orderEa}</strong></div><div class="detailrow"><span>Samples Reserved</span><strong>${fmt(reserve,3)} KG</strong></div><div class="detailrow"><span>${unitLabel}</span><strong>${ea} EA</strong></div><div class="detailrow"><span>Remaining Seed</span><strong>${fmt(remaining,3)} KG</strong></div><div class="detailrow"><span>Actual EA Difference</span><strong>${difference>0?'+':''}${difference} EA</strong></div>`;}
$('quickHome').onclick=()=>openQuick('home');$('quickSummary').onclick=()=>openQuick('calc');$('quickBack').onclick=backQuick;
$('converterToggle').onclick=()=>{quickSaveUndo();qConverter=!qConverter;if(!qConverter)qActive='right';renderQuick()};
$('converterPair').onchange=renderQuick;
$('quickUndo').onclick=quickUndoAction;
$('quickMiniUse').onclick=quickUseMini;
$('quickMiniSwap').onclick=()=>{quickSaveUndo();qMiniUnit=qMiniUnit==='LB'?'KG':'LB';qActive='left';renderQuick()};
$('quickMainSwap').onclick=()=>{quickSaveUndo();$('converterPair').value=$('converterPair').value==='kg-lb'?'lb-kg':'kg-lb';qActive='right';renderQuick()};
for(const [id,side] of [['quickMini','left'],['quickCalcPanel','right']]){
  $(id).addEventListener('click',event=>{if(!event.target.closest('button'))quickSelect(side)});
  $(id).addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target===$(id)){event.preventDefault();quickSelect(side)}});
}
window.addEventListener('resize',()=>requestAnimationFrame(quickResizeNumbers));
if('ResizeObserver' in window){const quickSizeObserver=new ResizeObserver(()=>{if(!$('quick').hidden)requestAnimationFrame(quickResizeNumbers)});quickSizeObserver.observe($('quickCalcPanel'));quickSizeObserver.observe($('quickMini'));}
// Handle touch on contact, avoiding Safari double-tap zoom and delayed synthesized clicks.
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
});$('clearHistory').onclick=()=>{if(!confirm(prefs.language==='es'?'¿Borrar todo el historial de la calculadora?':'Clear all calculator history?'))return;quickSaveUndo();qHistory=[];persist(HISTORY_KEY,qHistory);renderQuick()};$('availableKg').addEventListener('input',renderPackAll);$('settingsBtn').onclick=openPrefs;$('prefsBack').onclick=closePrefs;$('formulaSettings').onclick=()=>{if(!line){alert(prefs.language==='es'?'Abre una línea para editar sus fórmulas.':'Open a line to edit its formulas.');return;}openSettings();};['Language','Theme','Color'].forEach(k=>$('pref'+k).addEventListener('change',()=>{prefs[k.toLowerCase()]=$('pref'+k).value;persist(PREF_KEY,prefs);applyPrefs()}));applyPrefs();

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
$('quickHistoryOpen').onclick=()=>{$('quickHistoryPanel').hidden=false;$('seedPanel').hidden=true;renderQuick()};$('quickHistoryClose').onclick=()=>$('quickHistoryPanel').hidden=true;
$('unitOpen').onclick=()=>{$('unitPanel').hidden=false;$('seedPanel').hidden=true;$('percentPanel').hidden=true;unitCalculate()};$('unitClose').onclick=()=>$('unitPanel').hidden=true;
$('unitCategory').onchange=unitSetup;['unitFrom','unitTo','unitAmount'].forEach(id=>$(id).addEventListener('input',unitCalculate));$('unitSwap').onclick=()=>{const f=$('unitFrom').value;$('unitFrom').value=$('unitTo').value;$('unitTo').value=f;unitCalculate()};
$('unitCopy').onclick=async()=>{const result=unitCalculate();if(result==='—')return;const txt=`${$('unitAmount').value} ${$('unitFrom').value} = ${result}`;try{await navigator.clipboard.writeText(txt)}catch{window.prompt('Copy result:',txt)}};
unitSetup();
// Seed Converter: KG / LB / KS, based on seeds per pound (PC).
const seedCopyText={
 en:{title:'Seed Converter',intro:'Convert seed quantities between kilograms, pounds and thousands of seeds (KS).',from:'Enter unit',amount:'Amount',pc:'PC — Seeds per pound',note:'1 KS = 1,000 seeds. PC is required to calculate KS.',copy:'Copy Results',invalid:'Enter a nonnegative amount and a PC greater than zero.',back:'← Back'},
 es:{title:'Conversor de semillas',intro:'Convierte cantidades de semillas entre kilogramos, libras y miles de semillas (KS).',from:'Unidad de entrada',amount:'Cantidad',pc:'PC — Semillas por libra',note:'1 KS = 1,000 semillas. Necesitas PC para calcular KS.',copy:'Copiar resultados',invalid:'Ingresa una cantidad no negativa y un PC mayor que cero.',back:'← Volver'}
};
function renderSeedConverter(){
 const t=seedCopyText[prefs.language==='es'?'es':'en'];
 $('seedTitle').textContent=t.title;$('seedIntro').textContent=t.intro;$('seedFromLabel').textContent=t.from;$('seedAmountLabel').textContent=t.amount;$('seedPcLabel').textContent=t.pc;$('seedNote').textContent=t.note;$('seedCopy').textContent=t.copy;$('seedClose').textContent=t.back;
 $('seedOpen').textContent=prefs.language==='es'?'🌱 Conversor de semillas':'🌱 Seed Converter';
 const raw=$('seedAmount').value,rawPc=$('seedPc').value,amount=Number(raw),pc=Number(rawPc),unit=$('seedFrom').value;
 const valid=raw.trim()!==''&&rawPc.trim()!==''&&Number.isFinite(amount)&&amount>=0&&Number.isFinite(pc)&&pc>0;
 const lb=unit==='KG'?amount*2.2046226218487757:unit==='LB'?amount:amount*1000/pc;
 const kg=lb/2.2046226218487757,ks=lb*pc/1000;
 const format=v=>v.toLocaleString('en-US',{maximumFractionDigits:4});
 $('seedKg').textContent=valid?format(kg):'—';$('seedLb').textContent=valid?format(lb):'—';$('seedKs').textContent=valid?format(ks):'—';
 $('seedError').textContent=valid?'':t.invalid;$('seedCopy').disabled=!valid;
 return valid?`KG: ${format(kg)}\nLB: ${format(lb)}\nKS: ${format(ks)}\nPC: ${format(pc)}`:null;
}
$('seedOpen').addEventListener('click',()=>{$('seedPanel').hidden=false;$('unitPanel').hidden=true;$('quickHistoryPanel').hidden=true;renderSeedConverter()});
$('seedClose').addEventListener('click',()=>{$('seedPanel').hidden=true;$('unitPanel').hidden=false;unitCalculate()});
$('unitStandard').addEventListener('click',()=>{$('seedPanel').hidden=true;$('unitPanel').hidden=false;unitCalculate()});
['seedFrom','seedAmount','seedPc'].forEach(id=>$(id).addEventListener('input',renderSeedConverter));
$('seedCopy').addEventListener('click',async()=>{const output=renderSeedConverter();if(!output)return;try{await navigator.clipboard.writeText(output)}catch{const input=document.createElement('textarea');input.value=output;document.body.appendChild(input);input.select();document.execCommand('copy');input.remove()}});
$('prefLanguage').addEventListener('change',renderSeedConverter);
renderSeedConverter();

/* Build 9 percent modes. Input results are unit-neutral and retain full precision. */
const percentModes={
 add:{a:'Amount',b:'Percentage (%)',help:'Add a percentage of the amount.',compute:(a,b)=>a*(1+b/100)},
 subtract:{a:'Amount',b:'Percentage (%)',help:'Subtract a percentage of the amount.',compute:(a,b)=>a*(1-b/100)},
 of:{a:'Amount',b:'Percentage (%)',help:'Find the percentage of an amount.',compute:(a,b)=>a*b/100},
 ratio:{a:'Part',b:'Total',help:'What percentage is the part of the total?',compute:(a,b)=>b===0?NaN:a/b*100,percent:true},
 change:{a:'Original Amount',b:'New Amount',help:'Find the percentage change from original to new.',compute:(a,b)=>a===0?NaN:(b-a)/Math.abs(a)*100,percent:true},
 reverse:{a:'Final Amount',b:'Added Percentage (%)',help:'Find the original amount before the percentage was added.',compute:(a,b)=>b===-100?NaN:a/(1+b/100)}
};
const percentDefaults={add:[1400,1],subtract:[1400,1],of:[1400,1],ratio:[14,1400],change:[1400,1470],reverse:[1414,1]};
let percentComputed=NaN;
function renderPercent(){
 const mode=percentModes[$('percentMode').value],rawA=$('percentAmount').value,rawB=$('percentRate').value;
 $('percentAmountLabel').textContent=mode.a;$('percentRateLabel').textContent=mode.b;$('percentHelp').textContent=mode.help;
 percentComputed=rawA.trim()===''||rawB.trim()===''?NaN:mode.compute(Number(rawA),Number(rawB));
 const valid=Number.isFinite(percentComputed);
 $('percentResult').textContent=valid?quickTwo(percentComputed)+(mode.percent?'%':''):'—';
 $('percentExplanation').textContent=valid?(mode.percent?'Percentage result':'Amount result · same unit as input'):'Enter valid values (denominator must not be zero).';
 $('percentUse').disabled=!valid;
}
$('percentOpen').onclick=()=>{$('percentPanel').hidden=false;$('unitPanel').hidden=true;$('seedPanel').hidden=true;$('quickHistoryPanel').hidden=true;renderPercent()};
$('percentClose').onclick=()=>{$('percentPanel').hidden=true;renderQuick()};
$('percentMode').onchange=()=>{const [a,b]=percentDefaults[$('percentMode').value];$('percentAmount').value=a;$('percentRate').value=b;renderPercent()};
['percentAmount','percentRate'].forEach(id=>$(id).addEventListener('input',renderPercent));
$('percentUse').onclick=()=>{renderPercent();if(!Number.isFinite(percentComputed))return;quickSaveUndo();const mode=$('percentMode').value;const expression=mode+'('+ $('percentAmount').value+', '+$('percentRate').value+')';quickHistoryAdd('calculation',expression+' =',percentComputed);qValue=String(Number(percentComputed.toPrecision(15)));qFresh=false;qActive='right';if(qOp===null)qExpression='';$('percentPanel').hidden=true;renderQuick()};
renderPercent();

// Five taps on the footer version label unlock the secret arcade (Home only).
let secretTaps=0,secretLast=0;
function secretTap(){if($('home').hidden)return;const now=Date.now();secretTaps=now-secretLast<1100?secretTaps+1:1;secretLast=now;if(secretTaps>=5){secretTaps=0;show('brain');if(typeof window.startBrainBreak==='function')window.startBrainBreak();}}
$('brainSecretTrigger').addEventListener('click',secretTap);
$('brainSecretTrigger').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();secretTap();}});
window.returnBrainHome=home;

// Quick Seed Calculator — approved demo layout and calculation rules.
// Net Seed / EA = base seed only. Fill = (base + overpack) × (1 + chemical %).
// Seed to Treat = ceil((base + overpack) × EA + sample KG).
// Chemical and bag tare NEVER increase Seed to Treat.
const QS_DRAFT_KEY='production-calculator-quick-seed-draft-v1';
const qsDraftFields=['qsSize','qsEa','qsPc','qsOver','qsChem','qsSamples','qsTare','qsAvailable'];
let qsOperation='both';
function saveQuickSeedDraft(){try{localStorage.setItem(QS_DRAFT_KEY,JSON.stringify({fields:Object.fromEntries(qsDraftFields.map(id=>[id,$(id).value])),unit:$('qsUnit').value,operation:qsOperation}));}catch(e){console.warn('Quick Seed draft could not be saved',e);}}
function restoreQuickSeedDraft(){try{const raw=localStorage.getItem(QS_DRAFT_KEY);if(!raw)return;const draft=JSON.parse(raw);if(draft&&draft.fields){qsDraftFields.forEach(id=>{if(typeof draft.fields[id]==='string')$(id).value=draft.fields[id];});if(['KS','MS','KG','LB'].includes(draft.unit))$('qsUnit').value=draft.unit;if(['treat','both','pack'].includes(draft.operation))qsOperation=draft.operation;}}catch(e){console.warn('Quick Seed draft could not be restored',e);}}
function syncQsOperation(){const chemField=$('qsChem'),chemHelp=$('qsChemHelp');if(chemField){const treatingOnly=qsOperation==='treat';chemField.disabled=treatingOnly;chemField.hidden=treatingOnly;const na=$('qsChemNA');if(na)na.hidden=!treatingOnly;chemField.placeholder=treatingOnly?'N/A':'1';chemField.setAttribute('aria-label',treatingOnly?'Chemical percentage not applicable for Treating Only':'Chemical percentage');if(chemHelp)chemHelp.textContent=prefs.language==='es'?(treatingOnly?'No requerido para Solo tratamiento':'Ejemplos: 1% normal · 1.2% arrugada · 0% sin tratar'):(treatingOnly?'Not required for Treating Only':'Examples: 1% Normal · 1.2% Shrunken · 0% Untreated');}document.querySelectorAll('[data-qs-operation]').forEach(b=>{const active=b.dataset.qsOperation===qsOperation;b.classList.toggle('qsOperationActive',active);b.setAttribute('aria-pressed',String(active));});const heading=$('qsTotalHeading');if(heading)heading.textContent=prefs.language==='es'?(qsOperation==='pack'?'SEMILLA TOTAL PARA EMPACAR':qsOperation==='treat'?'SEMILLA TOTAL PARA TRATAR':'SEMILLA TOTAL REQUERIDA'):(qsOperation==='pack'?'TOTAL SEED FOR PACKING':qsOperation==='treat'?'TOTAL SEED TO TREAT':'TOTAL SEED REQUIRED');const help=$('qsOperationHelp');if(help){const es=prefs.language==='es';const messages={treat:es?'Calcula la semilla necesaria para tratamiento, sin pesos de empaque.':'Calculate seed needed for treatment. No packing weights.',both:es?'Calcula la semilla para tratamiento y los pesos objetivo por bolsa.':'Calculate seed needed for treatment and target bag weights.',pack:es?'Calcula la semilla para empaque y los pesos objetivo por bolsa.':'Calculate seed needed for packing and target bag weights.'};help.textContent=messages[qsOperation]||messages.both;help.dataset.align=qsOperation==='treat'?'left':qsOperation==='pack'?'right':'center';}}
const QS_ORDERS_KEY='production-calculator-quick-seed-saved-orders-v1';
function qsReadOrders(){try{const v=JSON.parse(localStorage.getItem(QS_ORDERS_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function qsWriteOrders(v){try{localStorage.setItem(QS_ORDERS_KEY,JSON.stringify(v));return true}catch{return false}}
function qsSavedMessage(en,es){$('qsSaveMessage').textContent=prefs.language==='es'?es:en}
function qsRenderOrders(){
 const es=prefs.language==='es',target=$('qsSavedOrders');target.replaceChildren();
 const orders=qsReadOrders();
 if(!orders.length){const p=document.createElement('p');p.className='qsExamples';p.textContent=es?'Todavía no hay órdenes guardadas.':'No saved orders yet.';target.append(p);return}
 orders.forEach(order=>{
  const row=document.createElement('div');row.className='qsSavedItem';
  const info=document.createElement('div');info.className='qsSavedInfo';
  const name=document.createElement('strong');name.textContent=order.name;
  const detail=document.createElement('small');detail.textContent=[order.operation==='treat'?(es?'Solo tratamiento':'Treating Only'):order.operation==='pack'?(es?'Solo empaque':'Packing Only'):(es?'Tratamiento y empaque':'Treating & Packing'),order.fields?.qsEa?order.fields.qsEa+' EA':'',order.date?new Date(order.date).toLocaleDateString(es?'es-US':'en-US'):''].filter(Boolean).join(' · ');
  info.append(name,detail);
  const actions=document.createElement('div');actions.className='qsSavedActions';
  const load=document.createElement('button');load.type='button';load.textContent=es?'Abrir':'Open';load.onclick=()=>{
   qsDraftFields.forEach(id=>{$(id).value=typeof order.fields?.[id]==='string'?order.fields[id]:''});
   $('qsUnit').value=['KS','MS','KG','LB'].includes(order.unit)?order.unit:'KS';
   qsOperation=['treat','both','pack'].includes(order.operation)?order.operation:'both';
   $('qsOrderName').value=order.name;renderQuickSeed();qsSavedMessage('Order loaded.','Orden cargada.');window.scrollTo({top:0,behavior:'smooth'});
  };
  const del=document.createElement('button');del.type='button';del.className='qsDeleteOrder';del.textContent=es?'Eliminar':'Delete';del.onclick=()=>{
   if(!confirm(es?'¿Eliminar esta orden guardada?':'Delete this saved order?'))return;
   if(qsWriteOrders(qsReadOrders().filter(x=>x.id!==order.id))){qsRenderOrders();qsSavedMessage('Saved order deleted.','Orden guardada eliminada.')}else qsSavedMessage('Could not delete the order.','No se pudo eliminar la orden.');
  };
  actions.append(load,del);row.append(info,actions);target.append(row);
 });
}
$('qsSaveOrder').onclick=()=>{
 const name=$('qsOrderName').value.trim();const es=prefs.language==='es';
 if(!name){qsSavedMessage('Enter an order name or number first.','Primero ingresa un nombre o número de orden.');$('qsOrderName').focus();return}
 if($('qsTotalKg').textContent==='—'){qsSavedMessage('Complete a valid calculation before saving.','Completa un cálculo válido antes de guardar.');return}
 const orders=qsReadOrders();
 if(orders.some(x=>x.name.toLowerCase()===name.toLowerCase())&&!confirm(es?'Ya existe una orden con ese nombre. ¿Reemplazarla?':'An order with that name exists. Replace it?'))return;
 const record={id:String(Date.now())+'-'+Math.random().toString(36).slice(2),name,date:new Date().toISOString(),fields:Object.fromEntries(qsDraftFields.map(id=>[id,$(id).value])),unit:$('qsUnit').value,operation:qsOperation};
 const updated=[record,...orders.filter(x=>x.name.toLowerCase()!==name.toLowerCase())];
 if(qsWriteOrders(updated)){qsRenderOrders();qsSavedMessage('Order saved on this device.','Orden guardada en este dispositivo.')}else qsSavedMessage('Could not save. Check device storage.','No se pudo guardar. Revisa el almacenamiento.');
};
$('qsQuickShortcut').onclick=()=>openQuick('quickSeed');
restoreQuickSeedDraft();
function openQuickSeed(){
 show('quickSeed');title('Quick Seed Calculator','Manual seed and bag weight calculation');
 renderQuickSeed();translateUI();qsRenderOrders();window.scrollTo({top:0,behavior:'smooth'});
}
// Pack All works from available seed BEFORE chemical treatment.
// Samples are reserved first; only full EA can be packed. The remainder is seed,
// not chemical or empty-bag tare. All math uses unrounded per-bag weights.
function renderPackAll(order){
 const error=$('qsPackAllError'),field=$('qsAvailable'),expanded=$('qsPackAllExpanded');const es=prefs.language==='es',t=(en,sp)=>es?sp:en;
 const outputs=['qsPackAllEa','qsPackAllStatus','qsPackAllPoEa','qsPackAllDifference','qsPackAllDifferenceMessage','qsPackAllRemaining','qsPackAllUsed','qsPackAllFillTotal'];
 const clear=()=>outputs.forEach(id=>$(id).textContent='—');
 error.hidden=true;
 const value=field.value.trim();
 // Keep the section compact until available seed is entered.
 expanded.hidden=!value;
 if(!value){clear();return;}
 if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)){
  clear();error.textContent=t('Enter a valid nonnegative available seed weight in KG.','Ingresa un peso válido de semilla disponible en KG, mayor o igual a cero.');error.hidden=false;return;
 }
 if(!order){clear();error.textContent=t('Complete the order details above to calculate Pack All.','Completa los detalles de la orden para calcular el empaque total.');error.hidden=false;return;}
 const available=Number(value),usable=available-order.samples;
 if(!Number.isFinite(available)||available<0||!Number.isFinite(usable)||!Number.isFinite(order.seedPerBag)||order.seedPerBag<=0){
  clear();error.textContent=t('Available Seed is too large or invalid.','La cantidad de semilla disponible es demasiado grande o no es válida.');error.hidden=false;return;
 }
 const count=Math.max(0,Math.floor(usable/order.seedPerBag));
 const used=count*order.seedPerBag;
 const remaining=Math.max(0,usable-used);
 const fillTotal=count*order.fillPerBag;
 const difference=count-order.ea;
 if(!Number.isSafeInteger(count)||!Number.isSafeInteger(difference)||![used,remaining,fillTotal].every(Number.isFinite)){
  clear();error.textContent=t('Values are too large to calculate safely.','Los valores son demasiado grandes para calcular con seguridad.');error.hidden=false;return;
 }
 $('qsPackAllEa').textContent=fmt(count,0)+' EA';
 $('qsPackAllStatus').textContent=order.chemicalPct===0?t('Untreated Seed','Semilla sin tratar'):t('Treated Seed (chemical added to fill weight)','Semilla tratada (químico incluido en peso de llenado)');
 $('qsPackAllPoEa').textContent=fmt(order.ea,0)+' EA';
 $('qsPackAllDifference').textContent=(difference>0?'+':'')+fmt(difference,0)+' EA';
 $('qsPackAllDifferenceMessage').textContent=difference>0?t('Extra bags possible','Bolsas adicionales posibles'):difference<0?t('Bags short of order','Bolsas faltantes de la orden'):t('Exact order quantity','Cantidad exacta de la orden');
 $('qsPackAllRemaining').textContent=fmt(remaining,3)+' KG';
 $('qsPackAllUsed').textContent=fmt(used,3)+' KG';
 $('qsPackAllFillTotal').textContent=fmt(fillTotal,3)+' KG';
 if(available<order.samples){
  error.textContent=t('Available seed is less than the samples reserved. No full bags can be packed.','La semilla disponible es menor que las muestras reservadas. No se pueden empacar bolsas completas.');
  error.hidden=false;
 }
}
function renderQuickSeed(){syncQsOperation();saveQuickSeedDraft();const es=prefs.language==='es',t=(en,sp)=>es?sp:en;
 $('qsPackAllHint').textContent=t('Enter available seed to estimate how many full bags you can pack.','Ingresa la semilla disponible para calcular cuántas bolsas completas puedes empacar.');
 $('qsAvailable').placeholder=t('Example: ','Ejemplo: ')+(($('qsTotalKg').textContent.match(/[\\d,]+/)||[])[0]||'1838')+' KG';
 const unit=$('qsUnit').value,needsPc=unit==='KS'||unit==='MS';
 $('qsPcField').hidden=!needsPc;
 document.querySelectorAll('[data-qs-unit]').forEach(b=>{const active=b.dataset.qsUnit===unit;b.classList.toggle('qsUnitActive',active);b.setAttribute('aria-pressed',String(active));});
 const ids=['qsSize','qsEa','qsOver','qsSamples'];if(qsOperation!=='treat')ids.push('qsChem');
 const fieldsComplete=ids.every(id=>$(id).value!=='')&&(!needsPc||$('qsPc').value!=='');
 const size=Number($('qsSize').value),ea=Number($('qsEa').value),pc=Number($('qsPc').value);
 const over=Number($('qsOver').value),chem=qsOperation==='treat'?0:Number($('qsChem').value),samples=Number($('qsSamples').value);
 const tare=$('qsTare').value===''?0:Number($('qsTare').value);
 const clear=()=>{renderPackAll(null);['qsNetKg','qsNetLb','qsFillKg','qsFillLb','qsGrossKg','qsGrossLb','qsTotalKg','qsTotalLb'].forEach(id=>$(id).textContent='—');$('qsBreakdown').replaceChildren();$('qsGuide').replaceChildren();$('qsGrossCard').hidden=true;};
 $('qsError').hidden=true;
 if(!fieldsComplete){clear();return;}
 const numericFields=['qsSize','qsEa','qsPc','qsOver','qsSamples','qsTare'];if(qsOperation!=='treat')numericFields.push('qsChem');
 const numericSyntax=numericFields.every(id=>id==='qsPc'&&!needsPc||id==='qsTare'&&$('qsTare').value===''||/^(?:\d+(?:\.\d*)?|\.\d+)$/.test($(id).value.trim()));
 const valid=numericSyntax&&Number.isFinite(size)&&size>0&&Number.isSafeInteger(ea)&&ea>0&&(!needsPc||Number.isFinite(pc)&&pc>0)&&
   [over,chem].every(x=>Number.isFinite(x)&&x>=0&&x<=100)&&[samples,tare].every(x=>Number.isFinite(x)&&x>=0);
 if(!valid){clear();$('qsError').textContent=t('Enter a positive pack size, whole-number EA, valid PC for KS/MS, percentages from 0 to 100, and nonnegative samples/tare.','Ingresa tamaño positivo, EA entero, PC válido para KS/MS, porcentajes de 0 a 100 y muestras/tara no negativas.');$('qsError').hidden=false;return;}
 const exactLbPerKg=2.2046226218487757;
 const base=unit==='KS'?size*1000/pc/exactLbPerKg:unit==='MS'?size*1000000/pc/exactLbPerKg:unit==='LB'?size/exactLbPerKg:size;
 const overKg=base*over/100,seedWithOverpack=base+overKg;
 const chemicalKg=seedWithOverpack*chem/100,fill=seedWithOverpack+chemicalKg,gross=fill+tare;
 const orderSeed=seedWithOverpack*ea,raw=orderSeed+samples;
 // Packing Only estimates finished treated fill weight; treatment modes use untreated seed.
 const modeRaw=raw,total=Math.ceil(modeRaw); // Available seed and samples are measured before chemical treatment in all modes.
 if(![base,overKg,seedWithOverpack,chemicalKg,fill,gross,orderSeed,raw,total].every(Number.isFinite)||!Number.isSafeInteger(total)){
   clear();$('qsError').textContent=t('The values are too large to calculate safely.','Los valores son demasiado grandes para calcular con seguridad.');$('qsError').hidden=false;return;
 }
 const kg=x=>fmt(x,3),lb=x=>fmt(x*exactLbPerKg,2),pct=x=>Number(x).toLocaleString('en-US',{maximumFractionDigits:5});
 const setWeight=(prefix,value,round=false)=>{$(prefix+'Kg').textContent=fmt(value,round?0:3)+' KG';$(prefix+'Lb').textContent=lb(value)+' LB';};
 setWeight('qsNet',base);setWeight('qsFill',fill);setWeight('qsGross',gross);setWeight('qsTotal',total,true);
 $('qsAvailable').placeholder=t('Example: ','Ejemplo: ')+fmt(total,0)+' KG';
 const fillCard=$('qsFillKg').closest('.qsSmallCard');if(fillCard)fillCard.hidden=qsOperation==='treat';
 const totalMeaning=$('qsTotalKg').closest('.qsTotalCard')?.querySelector('.qsMeaning');
 if(totalMeaning)totalMeaning.textContent=t('Seed required before chemical, including overpack and samples. Chemical and bag tare are excluded in every operation mode.','Semilla requerida antes del químico, incluyendo sobrellenado y muestras. Se excluyen químico y tara en todos los modos.');
 $('qsGrossCard').hidden=qsOperation==='treat'||$('qsTare').value===''||tare<=0;
 renderPackAll({seedPerBag:seedWithOverpack,fillPerBag:fill,samples,chemicalPct:chem,ea});

 // Show a complete per-bag section first, then the matching totals for the entire order.
 // All displayed values are rounded; calculations below retain full precision.
 const totalNet=base*ea,totalOver=overKg*ea,totalChemical=chemicalKg*ea;
 const totalFill=fill*ea,totalTare=tare*ea,totalGross=gross*ea;
 const weight=x=>kg(x)+' KG / '+lb(x)+' LB';
 const breakdown=$('qsBreakdown');breakdown.replaceChildren();
 const addHeading=label=>{const h=document.createElement('h3');h.className='qsBreakHeading';h.textContent=label;breakdown.append(h);};
 const addRow=(name,value)=>{const div=document.createElement('div');div.className='detailrow';const label=document.createElement('span');label.textContent=name;const strong=document.createElement('strong');strong.textContent=value;div.append(label,strong);breakdown.append(div);};
 addHeading(t('Order Details','Detalles de la orden'));
 addRow(t('Pack Size','Tamaño de bolsa'),pct(size)+' '+unit);
 if(needsPc)addRow(t('Seed Count (PC)','Conteo de semillas (PC)'),pct(pc)+' '+t('seeds/LB','semillas/LB'));
 addRow(t('Quantity','Cantidad'),ea+' EA');
 addRow(t('Overpack (%)','Sobrellenado (%)'),pct(over)+'%');
 if(qsOperation!=='treat')addRow(t('Chemical (%)','Químico (%)'),pct(chem)+'%');
 addRow(t('Samples (KG)','Muestras (KG)'),kg(samples)+' KG');
 if(qsOperation!=='treat')addRow(t('Bag Tare (KG)','Tara de bolsa (KG)'),$('qsTare').value===''?t('Not entered','No ingresada'):kg(tare)+' KG');
 addHeading(t('Per Bag (1 EA)','Por bolsa (1 EA)'));
 [
 [t('Net Seed / EA (before overpack)','Semilla neta / EA (antes del sobrellenado)'),weight(base)],
 [t('Overpack / EA','Sobrellenado / EA'),pct(over)+'% = '+weight(overKg)],
 [t('Seed + Overpack / EA','Semilla + sobrellenado / EA'),weight(seedWithOverpack)],
 ...(qsOperation!=='treat'?[[t('Chemical Weight / EA','Peso químico / EA'),pct(chem)+'% = '+weight(chemicalKg)],[t('Fill Weight / EA','Peso de llenado / EA'),weight(fill)]]:[]),
 ...(qsOperation!=='treat'&&tare>0?[[t('Bag Tare / EA','Tara de bolsa / EA'),weight(tare)],[t('Gross Bag Weight / EA','Peso bruto / EA'),weight(gross)]]:[])
 ].forEach(([name,value])=>addRow(name,value));
 addHeading(t('Order Totals ('+ea+' EA)','Totales de la orden ('+ea+' EA)'));
 [
 [t('Total Net Seed (before overpack)','Semilla neta total (antes del sobrellenado)'),weight(totalNet)],
 [t('Total Overpack','Sobrellenado total'),weight(totalOver)],
 [t('Total Seed + Overpack','Semilla total + sobrellenado'),weight(orderSeed)],
 ...(qsOperation!=='treat'?[[t('Total Chemical Weight','Peso químico total'),weight(totalChemical)],[t('Total Fill Weight','Peso de llenado total'),weight(totalFill)]]:[]),
 ...(qsOperation!=='treat'&&tare>0?[[t('Total Bag Tare','Tara total de bolsas'),weight(totalTare)],[t('Total Gross Bag Weight','Peso bruto total de bolsas'),weight(totalGross)]]:[])
 ].forEach(([name,value])=>addRow(name,value));
 addHeading(t('Seed Required','Semilla requerida'));
 addRow(t('Samples','Muestras'),weight(samples));
 addRow(t('Seed + Overpack + Samples','Semilla + sobrellenado + muestras'),weight(raw));
 addRow(qsOperation==='pack'?t('TOTAL SEED FOR PACKING (rounded up)','SEMILLA TOTAL PARA EMPACAR (redondeada)'):qsOperation==='both'?t('TOTAL SEED TO TREAT & PACK (rounded up)','SEMILLA TOTAL PARA TRATAR Y EMPACAR (redondeada)'):t('TOTAL SEED TO TREAT (rounded up)','SEMILLA TOTAL PARA TRATAR (redondeada)'),weight(total));

 const conversion=needsPc
   ?pct(size)+' '+unit+' × '+(unit==='KS'?'1,000':'1,000,000')+' = '+fmt(size*(unit==='KS'?1000:1000000),0)+' '+t('seeds','semillas')+'\n'+fmt(size*(unit==='KS'?1000:1000000),0)+' ÷ '+pct(pc)+' PC = '+lb(base)+' LB\n'+lb(base)+' LB ÷ 2.20462 ≈ '+kg(base)+' KG'
   :unit==='LB'?pct(size)+' LB ÷ 2.20462 ≈ '+kg(base)+' KG':pct(size)+' KG = '+kg(base)+' KG';
 const steps=[
 {
  title:t('Calculate Net Seed per Bag','Calcular semilla neta por bolsa'),
  explanation:t('This is the actual untreated seed weight needed for one bag based on its pack size. For KS/MS, seed count (PC) converts the number of seeds into pounds, then kilograms. No overpack or chemical is included.','Es el peso real de semilla sin tratar necesario para una bolsa según su tamaño. Para KS/MS, el conteo PC convierte las semillas a libras y después a kilogramos. No incluye sobrellenado ni químico.'),
  math:conversion
 },
 {
  title:t('Add Overpack per Bag','Agregar sobrellenado por bolsa'),
  explanation:t('Overpack is extra seed added to each bag. Multiply the base seed weight by the selected overpack percentage, then add it to the base seed weight.','El sobrellenado es semilla adicional por bolsa. Multiplica el peso base por el porcentaje de sobrellenado y súmalo al peso base.'),
  math:kg(base)+' KG × '+pct(over)+'% = '+kg(overKg)+' KG\n'+kg(base)+' + '+kg(overKg)+' = '+kg(seedWithOverpack)+' KG'
 },
 {
  title:t('Calculate Total Net Seed and Overpack','Calcular semilla neta total y sobrellenado'),
  explanation:t('Multiply the seed weight for one bag by the quantity of bags (EA). This shows the total base seed, total overpack, and combined seed needed for the order before samples.','Multiplica el peso de semilla de una bolsa por la cantidad de bolsas (EA). Así obtienes la semilla base total, el sobrellenado total y la semilla combinada para la orden antes de muestras.'),
  math:kg(base)+' KG × '+ea+' EA = '+kg(totalNet)+' KG '+t('net seed','semilla neta')+'\n'+kg(overKg)+' KG × '+ea+' EA = '+kg(totalOver)+' KG '+t('overpack','sobrellenado')+'\n'+kg(totalNet)+' + '+kg(totalOver)+' = '+kg(orderSeed)+' KG'
 },
 {
  title:t('Calculate Chemical Weight','Calcular peso químico'),
  explanation:t('Chemical weight is calculated from seed plus overpack. It changes the treated fill weight, but does not increase the seed quantity that must be treated. The total is for all EA.','El peso químico se calcula sobre la semilla con sobrellenado. Aumenta el peso de llenado tratado, pero no la cantidad de semilla que se debe tratar. El total corresponde a todas las EA.'),
  math:kg(seedWithOverpack)+' KG × '+pct(chem)+'% = '+kg(chemicalKg)+' KG / EA\n'+kg(chemicalKg)+' KG × '+ea+' EA = '+kg(totalChemical)+' KG '+t('total chemical','químico total')
 },
 {
  title:t('Calculate Fill Weight','Calcular peso de llenado'),
  explanation:t('Fill Weight is the target weight of treated seed inside each bag: seed plus overpack plus chemical. Multiplying by EA gives the total treated fill weight for the order. Bag tare is excluded.','El peso de llenado es el peso objetivo de semilla tratada dentro de cada bolsa: semilla más sobrellenado más químico. Multiplicarlo por EA da el peso total de llenado tratado. No incluye tara.'),
  math:kg(seedWithOverpack)+' + '+kg(chemicalKg)+' = '+kg(fill)+' KG / EA\n'+kg(fill)+' KG × '+ea+' EA = '+kg(totalFill)+' KG '+t('total fill','llenado total')
 },
 ...(tare>0?[{
  title:t('Add Bag Tare for Gross Weight','Agregar tara para peso bruto'),
  explanation:t('Bag tare is the empty bag weight. Add it to Fill Weight to get the gross weight per bag; multiply by EA for the order total. Tare does not affect Seed to Treat.','La tara es el peso de la bolsa vacía. Súmala al peso de llenado para obtener el peso bruto por bolsa; multiplica por EA para el total. La tara no afecta la semilla requerida para tratar.'),
  math:kg(fill)+' + '+kg(tare)+' = '+kg(gross)+' KG / EA\n'+kg(tare)+' KG × '+ea+' EA = '+kg(totalTare)+' KG '+t('total tare','tara total')+'\n'+kg(gross)+' KG × '+ea+' EA = '+kg(totalGross)+' KG '+t('total gross','bruto total')
 }]:[]),
 {
  title:t('Calculate Total Seed Required','Calcular semilla total requerida'),
  explanation:t('Start with total seed plus overpack for all bags, then add the sample weight in KG. Round the result UP to the next whole KG. Chemical weight and bag tare are never included.','Comienza con la semilla total más sobrellenado para todas las bolsas y agrega el peso de muestras en KG. Redondea HACIA ARRIBA al siguiente KG entero. Nunca incluyas químico ni tara.'),
  math:kg(orderSeed)+' KG + '+kg(samples)+' KG '+t('samples','muestras')+' = '+kg(raw)+' KG\n'+t('Round up','Redondear hacia arriba')+': '+fmt(total,0)+' KG / '+lb(total)+' LB'
 }
 ];
 const guide=$('qsGuide');guide.replaceChildren();
 const visibleSteps=qsOperation==='treat'?steps.filter((_,i)=>![3,4,5].includes(i)):steps;
 const intro=document.createElement('p');intro.className='muted tiny';
 intro.textContent=t('Steps display rounded numbers, but calculations use full internal precision. KG: 3 decimals; LB: 2 decimals.','Los pasos muestran números redondeados, pero los cálculos usan precisión interna completa. KG: 3 decimales; LB: 2 decimales.');
 guide.append(intro);
 visibleSteps.forEach((step,i)=>{
  const section=document.createElement('section');section.className='guideStep';
  const h=document.createElement('strong');h.textContent=(i+1)+'. '+step.title;
  const desc=document.createElement('p');desc.className='qsStepMeaning';desc.textContent=step.explanation;
  const math=document.createElement('div');math.className='guideMath';math.textContent=step.math;
  section.append(h,desc,math);guide.append(section);
 });
}
$('qsAvailable').addEventListener('input',renderQuickSeed);
$('quickSeedHome').onclick=openQuickSeed;
$('qsReset').onclick=()=>{$('qsResetConfirm').hidden=false;$('qsCancelReset').focus();};$('qsCancelReset').onclick=()=>{$('qsResetConfirm').hidden=true;$('qsReset').focus();};$('qsConfirmReset').onclick=()=>{qsDraftFields.forEach(id=>$(id).value='');$('qsUnit').value='KS';qsOperation='both';try{localStorage.removeItem(QS_DRAFT_KEY);}catch(e){}$('qsResetConfirm').hidden=true;renderQuickSeed();};document.querySelectorAll('[data-qs-operation]').forEach(b=>b.addEventListener('click',()=>{qsOperation=b.dataset.qsOperation;renderQuickSeed();}));
document.querySelectorAll('[data-qs-unit]').forEach(b=>b.addEventListener('click',()=>{$('qsUnit').value=b.dataset.qsUnit;renderQuickSeed();}));
['qsSize','qsEa','qsPc','qsOver','qsChem','qsSamples','qsTare'].forEach(id=>{
 const el=$(id);
 // Text + decimal inputmode allows consistent selection/caret behavior on mobile and desktop.
 // Focus, click and touch all place the insertion point after the existing number.
 const moveCaret=()=>{if(document.activeElement===el&&typeof el.setSelectionRange==='function'){const n=el.value.length;el.setSelectionRange(n,n);}};
 el.addEventListener('focus',moveCaret);
 el.addEventListener('click',moveCaret);
 el.addEventListener('touchend',()=>requestAnimationFrame(moveCaret),{passive:true});
 el.addEventListener('input',renderQuickSeed);
});

// PO Weight Calculator: operator enters gross and tare for each box; last box is split by NET.
const splitRows=[{gross:'',tare:''},{gross:'',tare:''},{gross:'',tare:''},{gross:'',tare:''}];
function splitNum(value){const x=Number(String(value).replace(/,/g,''));return String(value).trim()!==''&&Number.isFinite(x)&&x>=0?x:null;}
function splitWeight(x){return fmt(x,1)+' KG / '+fmt(x*F,1)+' LB';}
function splitT(en,es){return prefs.language==='es'?es:en;}
function splitRender(){
 const host=$('splitRows');host.replaceChildren();
 splitRows.forEach((box,i)=>{
  const row=document.createElement('div');row.className='splitRow';
  row.innerHTML='<span class="splitIndex">'+(i+1)+'</span><label><span class="srOnly">Gross box '+(i+1)+'</span><input type="text" inputmode="decimal" aria-label="Box '+(i+1)+' Gross" placeholder="'+splitT("Gross","Bruto")+'"></label><label><span class="srOnly">Tare box '+(i+1)+'</span><input type="text" inputmode="decimal" aria-label="Box '+(i+1)+' Tare" placeholder="'+splitT("Tare","Tara")+'"></label><output class="splitNet" aria-label="Box '+(i+1)+' Net Weight">—</output><button type="button" class="secondary splitRemove" aria-label="Remove box '+(i+1)+'">×</button>';
  const inputs=row.querySelectorAll('input');inputs[0].value=box.gross;inputs[1].value=box.tare;
  inputs.forEach((el,k)=>{const key=k===0?'gross':'tare';el.addEventListener('input',()=>{box[key]=el.value;splitCalculate();});el.addEventListener('blur',()=>{const value=splitNum(el.value);if(value!==null){box[key]=fmt(value,1);el.value=box[key];}splitCalculate();});});
  row.querySelector('button').addEventListener('click',()=>{if(splitRows.length<=1)return;splitRows.splice(i,1);splitRender();});
  host.append(row);
 });
 splitCalculate();
}
function splitCalculate(){
 const target=splitNum($('splitTarget').value),result=$('splitResults'),total=$('splitTotal');
 const valid=splitRows.map((b,i)=>({i,gross:splitNum(b.gross),tare:splitNum(b.tare)}));
 const entered=valid.filter(x=>x.gross!==null||x.tare!==null);
 const netOutputs=$('splitRows').querySelectorAll('.splitNet');
 valid.forEach((x,i)=>{const net=x.gross!==null&&x.tare!==null&&x.gross>=x.tare?x.gross-x.tare:null;if(netOutputs[i])netOutputs[i].textContent=net===null?'—':fmt(net,1);});

 if(!entered.length){total.textContent=splitT("Total Net: —","Neto total: —");result.innerHTML='<p class="muted">'+splitT('Enter Gross and Tare weights to calculate the split.',"Ingresa los pesos bruto y tara para calcular la distribución.")+'</p>';return;}
 if(entered.some(x=>x.gross===null||x.tare===null||x.tare>x.gross)){
  total.textContent='';result.innerHTML='<p class="error">'+splitT('Each entered box needs valid Gross and Tare; Tare cannot exceed Gross.',"Cada caja necesita pesos bruto y tara válidos; la tara no puede superar el bruto.")+'</p>';return;
 }
 const boxes=entered.map(x=>({...x,net:x.gross-x.tare}));
 const totalNet=boxes.reduce((s,x)=>s+x.net,0);
 total.innerHTML='<span class="splitTotalLabel">'+splitT('Total Net',"Neto total")+'</span><strong class="splitTotalKg">'+fmt(totalNet,1)+' KG</strong><span class="splitTotalLb">'+fmt(totalNet*F,1)+' LB</span><span class="muted tiny">'+boxes.length+' '+(boxes.length===1?splitT('box entered',"caja ingresada"):splitT('boxes entered',"cajas ingresadas"))+'</span>';
 if(target===null||target<=0){result.innerHTML='<p class="muted">'+splitT('Enter Required PO NET to calculate the allocation.',"Ingresa el Neto requerido del PO para calcular la distribución.")+'</p>';return;}
 if(totalNet+1e-8<target){result.innerHTML='<p class="error">'+splitT('Short ',"Faltan ")+splitWeight(target-totalNet)+splitT(' for the PO. Add more boxes or correct the weights.'," para el PO. Agrega más cajas o corrige los pesos.")+'</p>';return;}
 let remaining=target,split=null;
 for(const box of boxes){if(remaining>box.net+1e-8){remaining-=box.net;continue;}split={...box,poNet:Math.max(0,remaining),returnNet:Math.max(0,box.net-remaining)};break;}
 if(!split){result.innerHTML='<p class="error">'+splitT('Unable to allocate the entered weights.',"No se pueden distribuir los pesos ingresados.")+'</p>';return;}
 const before=target-split.poNet;
 const row=(name,value)=>'<div class="detailrow splitBreakRow"><span class="splitBreakLabel">'+name+'</span><span class="splitBreakValues"><strong class="splitBreakKg">'+fmt(value,1)+' KG</strong><small class="splitBreakLb">'+fmt(value*F,1)+' LB</small></span></div>';
 result.innerHTML='<p class="muted tiny">'+splitT('Box ',"Caja ")+(split.i+1)+' · '+splitT('NET','Neto')+' '+splitWeight(split.net)+'</p>'+
 '<div class="splitCards"><div class="card mini"><strong>'+splitT('PO NET — Last Box',"Neto del PO — Última caja")+'</strong><div class="number">'+fmt(split.poNet,1)+' KG</div><p class="muted tiny">'+splitT('Gross on scale: ',"Bruto en báscula: ")+fmt(split.poNet+split.tare,1)+splitT(' KG (includes tare)'," KG (incluye tara)")+'</p></div>'+
 '<div class="card mini"><strong>'+splitT('RETURN NET',"Neto a devolver")+'</strong><div class="number">'+fmt(split.returnNet,1)+' KG</div><p class="muted tiny">'+splitT('Return Gross: ',"Bruto de devolución: ")+fmt(split.returnNet+split.tare,1)+splitT(' KG if using the same tare'," KG si se utiliza la misma tara")+'</p></div></div>'+
 '<details><summary>'+splitT('Calculation Breakdown','Desglose del cálculo')+'</summary>'+row(splitT("NET before last box","Neto antes de la última caja"),before)+row(splitT("Last box Gross","Bruto de última caja"),split.gross)+row(splitT("Last box Tare","Tara de última caja"),split.tare)+row(splitT("Last box NET","Neto de última caja"),split.net)+row(splitT("PO NET from last box","Neto del PO de última caja"),split.poNet)+row(splitT("NET to Return","Neto a devolver"),split.returnNet)+row(splitT("Total PO NET","Neto total del PO"),target)+'</details>'+
 (totalNet>target+split.returnNet+1e-8?'<p class="muted tiny">'+splitT('Additional boxes after the PO is filled are not included in the last-box return amount.',"Las cajas adicionales después de completar el PO no se incluyen en la devolución de la última caja.")+'</p>':'');
}
$('boxSplitHome').addEventListener('click',()=>{show('boxSplit');title(splitT('PO Weight Calculator',"Calculadora de peso del PO"),splitT('Gross / Tare / Net',"Bruto / Tara / Neto"));splitRender();});
$('splitTarget').addEventListener('input',splitCalculate);
$('splitAdd').addEventListener('click',()=>{splitRows.push({gross:'',tare:''});splitRender();});
$('splitReset').addEventListener('click',()=>{$('splitResetConfirm').hidden=false;});
$('splitCancelReset').addEventListener('click',()=>{$('splitResetConfirm').hidden=true;});
$('splitConfirmReset').addEventListener('click',()=>{splitRows.splice(0,splitRows.length,...Array.from({length:4},()=>({gross:'',tare:''})));$('splitTarget').value='';$('splitResetConfirm').hidden=true;splitRender();});

// Navigation
 $('homeShortcut').onclick=home;
 document.querySelectorAll('[data-line]').forEach(b=>b.onclick=()=>openLine(b.dataset.line));document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>openCalc(b.dataset.mode));$('comingBack').onclick=home;$('modeBack').onclick=home;$('back').onclick=back;$('settingsBtn').onclick=openPrefs;$('closeSettings').onclick=()=>{show('calc');title(lineName(line),'Calculator');calculate();};$('settingCrop').onchange=settingsFor;$('settingSeed').onchange=settingsFor;$('applySettings').onclick=saveSettings;$('restoreSettings').onclick=restoreSettings;
$('samplesToggle').onclick=()=>{$('samplesBody').hidden=!$('samplesBody').hidden;$('samplesToggle').textContent=$('samplesBody').hidden?'Edit ▾':'Hide ▴';};$('addSample').onclick=()=>addSample();$('extraMinus').onclick=()=>{extraManual=true;$('extra').value=Math.max(0,Number($('extra').value)-1);calculate();};$('extraPlus').onclick=()=>{extraManual=true;$('extra').value=Number($('extra').value)+1;calculate();};$('extra').oninput=()=>{extraManual=true;calculate();};$('save').onclick=capture;$('reset').onclick=reset;
['crop','seedType','condition','packSize','packUnit','pc','regular','tare'].forEach(id=>$(id).addEventListener('input',calculate));$('ea').addEventListener('input',()=>{extraManual=false;calculate();});$('tareUnit').addEventListener('change',changeTareUnit);$('tareUnit').dataset.previous='KG';home();
// TEST release notes: each TEST build has its own seen key.
// Increment the build and update the notes with every future TEST release.
const RELEASE_KEY='production-calculator-whats-new-v2.5-test-build-38';
const releaseNotes={
 en:{title:"What's New · TEST Build 38",items:["Fixed accent contrast in Settings, installation instructions and refresh section.","Appearance and Accent Color previews retain their neutral theme colors.","Calculation formulas are unchanged."],note:"TEST VERSION — NOT FOR PRODUCTION. Verify calculations before use.",close:"Continue"},
 es:{title:"Novedades · TEST Build 38",items:["Contraste corregido en Configuración, instrucciones de instalación y actualización.","Las vistas de apariencia y color conservan los colores del tema.","Las fórmulas no cambiaron."],note:"VERSIÓN DE PRUEBA — NO USAR EN PRODUCCIÓN. Verifica los cálculos antes de usar.",close:"Continuar"}
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
const LOCAL_TEST_BUILD='v2.5-test-build-38';
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
