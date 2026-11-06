import {AS_OF} from './engine.mjs';
export function makeDemo(){
 const inventory=[
  {store:'Harbour',sku:'N008',style:'Fine cable',weight_g:8,unit_price:8600,unit_cost:6900,qty:5,received_date:'2026-06-01'},
  {store:'Garden',sku:'N008',style:'Fine cable',weight_g:8,unit_price:8600,unit_cost:6900,qty:0,received_date:'2026-10-01'},
  {store:'Harbour',sku:'N012',style:'Classic rope',weight_g:12,unit_price:12900,unit_cost:10400,qty:1,received_date:'2026-10-01'},
  {store:'Garden',sku:'N012',style:'Classic rope',weight_g:12,unit_price:12900,unit_cost:10400,qty:1,received_date:'2026-10-01'},
  {store:'Harbour',sku:'N028',style:'Heritage chain',weight_g:28,unit_price:29800,unit_cost:24700,qty:6,received_date:'2026-02-01'},
  {store:'Garden',sku:'N028',style:'Heritage chain',weight_g:28,unit_price:29800,unit_cost:24700,qty:2,received_date:'2026-05-01'},
  {store:'Harbour',sku:'N004',style:'Light link',weight_g:4,unit_price:4400,unit_cost:3400,qty:1,received_date:'2026-10-01'},
  {store:'Garden',sku:'N004',style:'Light link',weight_g:4,unit_price:4400,unit_cost:3400,qty:2,received_date:'2026-10-01'}
 ];
 const sales=[];let id=1;
 for(const [store,sku,count] of [['Harbour','N008',1],['Garden','N008',7],['Harbour','N012',5],['Garden','N012',6],['Garden','N028',1],['Harbour','N004',6],['Garden','N004',4]])for(let j=0;j<count;j++){const item=inventory.find(x=>x.store===store&&x.sku===sku);sales.push({id:'DEMO-'+id++,date:`2026-10-${String(3+(j*3)%27).padStart(2,'0')}`,store,sku,qty:1,net_value:item.unit_price});}
 const demand=[...Array.from({length:4},(_,i)=>({id:'Q'+i,date:`2026-11-0${i+1}`,store:'Garden',basis:'weight',band:1,reason:'no_match'})),...Array.from({length:3},(_,i)=>({id:'B'+i,date:`2026-11-0${i+1}`,store:'Harbour',basis:'budget',band:1,reason:'over_budget'}))];
 return {asOf:AS_OF,inventory,sales,demand,decisions:{},effort:[]};
}
