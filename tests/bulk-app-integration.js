// Run with: node tests/bulk-app-integration.js
// Exercises the actual bulkUpdate() extracted from app.js with mocked DOM controls.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const start=source.indexOf('function bulkSetUnit(unit){'),end=source.indexOf('function renderPackAll()',start);
assert.ok(start>=0&&end>start,'bulkUpdate source not found');
const bulk=source.slice(start,end);
const ids='bulkCrop bulkSeed bulkCondition bulkBasis bulkUnit bulkSamples bulkOver bulkChem bulkPc bulkSize bulkEa bulkFullNet bulkAvailable bulkSuggested bulkManualEa bulkPcField bulkFullNetField bulkSizeLabel bulkError bulkOutput bulkAllOutput bulkAllInputs bulkRestore bulkReset bulkSizeText bulkOrderType bulkTotePreset'.split(' ');
function simulate(overrides={}){
 const elements=Object.fromEntries(ids.map(id=>[id,{value:'',hidden:false,firstChild:{textContent:''},innerHTML:'',textContent:'',replaceChildren(){this.innerHTML=''},addEventListener(){}}]));
 const defaults={bulkCrop:'peas',bulkOrderType:'export',bulkTotePreset:'1000',bulkSeed:'commercial',bulkCondition:'untreated',bulkBasis:'total',bulkUnit:'KG',bulkSize:'29741',bulkFullNet:'1000',bulkEa:'30',bulkOver:'0.5',bulkChem:'0',bulkSamples:'5',bulkSuggested:'1005'};
 for(const [id,value] of Object.entries({...defaults,...overrides}))elements[id].value=String(value);
 const context={$:id=>elements[id],fmt:(n,d)=>Number(n).toFixed(d),esc:s=>String(s),F:2.2046,unitKg:(w,u,pc)=>u==='KG'?w:u==='LB'?w/2.2046:u==='KS'?w*1000/pc/2.2046:u==='MS'?w*1e6/pc/2.2046:NaN};
 vm.runInNewContext(bulk+'\nbulkUpdate();',{...context,document:{querySelectorAll:()=>[]}},{timeout:1000});
 return {result:elements.bulkOutput.innerHTML,all:elements.bulkAllOutput.innerHTML,error:elements.bulkError.hidden?'':elements.bulkError.textContent};
}
function includes(actual,expected){assert.ok(actual.includes(expected),'Expected '+JSON.stringify(expected)+' in '+actual.slice(-500));}
includes(simulate({bulkSize:30000}).result,'30155.000 KG');
includes(simulate().result,'29895.000 KG');
includes(simulate({bulkCrop:'shrunkenCorn',bulkCondition:'treated',bulkBasis:'per',bulkUnit:'MS',bulkSize:5,bulkPc:3896,bulkEa:60,bulkOver:1,bulkChem:1.2}).result,'35765.000 KG');
includes(simulate({bulkCrop:'shrunkenCorn',bulkBasis:'per',bulkSize:778,bulkEa:4,bulkOver:0,bulkAvailable:3120.5,bulkSuggested:778,bulkManualEa:4}).all,'3.500 KG');
includes(simulate({bulkAvailable:200,bulkSuggested:1005,bulkManualEa:1}).all,'Seed Shortfall at Selected Fill');
includes(simulate({bulkAvailable:40000,bulkSuggested:1005,bulkManualEa:30}).all,'partial tote');
includes(simulate({bulkSize:''}).error,'Enter a positive NET');
includes(simulate({bulkBasis:'per',bulkUnit:'MS',bulkPc:''}).error,'PC for KS/MS');
includes(simulate({bulkAvailable:30000,bulkSuggested:''}).all,'Enter valid available seed');
includes(simulate({bulkBasis:'total',bulkSize:741,bulkEa:1,bulkAvailable:800,bulkSuggested:745,bulkManualEa:1}).all,'Meets basic PO checks');
const screenshotCase=simulate({bulkCrop:'normalCorn',bulkBasis:'total',bulkSize:12650,bulkFullNet:1000,bulkEa:30,bulkOver:1,bulkChem:0,bulkSamples:5});
includes(screenshotCase.result,'12785 KG');
includes(screenshotCase.result,'426 KG');
assert.ok(!screenshotCase.error,'Screenshot order should not be blocked: '+screenshotCase.error);
console.log('PASS: 11 actual bulkUpdate integration scenarios');
