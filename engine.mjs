export const AS_OF = '2026-11-06';
export const STORES = ['Harbour', 'Garden'];
export const WEIGHTS = ['Under 5 g', '5–<15 g', '15–25 g', 'Over 25 g'];
export const PRICES = ['Under CNY 3,000', 'CNY 3,000–<6,000', 'CNY 6,000–<10,000', 'CNY 10,000+'];
export const weightBand = n => n < 5 ? 0 : n < 15 ? 1 : n <= 25 ? 2 : 3;
export const priceBand = n => n < 3000 ? 0 : n < 6000 ? 1 : n < 10000 ? 2 : 3;
export const daysBetween = (a,b) => Math.floor((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/86400000);
export function recent(date, asOf, days) { const d=daysBetween(asOf,date); return d>=0 && d<days; }
export function matchesNeed(item, need) {
  return need.basis==='weight' ? weightBand(item.weight_g)===Number(need.band) : need.basis==='budget' ? priceBand(item.unit_price)===Number(need.band) : false;
}
export function analyse(data, options={}) {
  const asOf=options.asOf||AS_OF, window=Number(options.window||90), reserve=Number(options.reserve??1), slowAge=Number(options.slowAge||90);
  const stock=data.inventory;
  const sales=data.sales.filter(s=>recent(s.date,asOf,window));
  const needs=data.demand.filter(n=>recent(n.date,asOf,window));
  const sold=(store,sku)=>sales.filter(s=>s.store===store&&s.sku===sku).reduce((v,s)=>v+s.qty,0);
  const recommendations=[], covered=new Set(), allocated=new Map();
  const sources=[...stock].sort((a,b)=>a.received_date.localeCompare(b.received_date));
  for(const item of sources) {
    const sourceSold=sold(item.store,item.sku), age=daysBetween(asOf,item.received_date);
    const key=item.store+'|'+item.sku;
    if(sourceSold>1 || age<slowAge || item.qty<=reserve) continue;
    for(const target of STORES.filter(s=>s!==item.store)) {
      const inquiries=needs.filter(n=>n.store===target&&n.reason==='no_match'&&matchesNeed(item,n));
      const targetQty=stock.filter(x=>x.store===target&&weightBand(x.weight_g)===weightBand(item.weight_g)).reduce((a,x)=>a+x.qty,0);
      const group=target+'|'+weightBand(item.weight_g);
      if(inquiries.length>=2&&targetQty<=1&&!covered.has(group)&&(item.qty-reserve-(allocated.get(key)||0))>0) {
        covered.add(group);allocated.set(key,(allocated.get(key)||0)+1);
        recommendations.push({id:'transfer|'+key+'|'+target,kind:'Transfer',store:target,from:item.store,sku:item.sku,band:weightBand(item.weight_g),qty:1,title:`Review ${item.sku}: ${item.store} to ${target}`,evidence:`${inquiries.length} matching unmet inquiries at ${target}; ${targetQty} pieces in its weight band. Source: ${item.qty} pieces, ${sourceSold} sold in ${window} days, oldest receipt ${age} days ago.`,check:'Confirm style and final price with both managers. One piece is a review proposal under demo rules; keep the source reserve.',cost:item.unit_cost});
      }
    }
    recommendations.push({id:'reduce|'+key,kind:'Reduce replenishment',store:item.store,sku:item.sku,band:weightBand(item.weight_g),qty:null,title:`Review future orders for ${item.sku} at ${item.store}`,evidence:`${item.qty} pieces remain; ${sourceSold} sold in ${window} days; receipt age ${age} days.`,check:'Check display requirements, availability history and special customers before reducing orders.'});
  }
  for(const store of STORES) for(let band=0;band<4;band++) {
    const items=stock.filter(x=>x.store===store&&weightBand(x.weight_g)===band);
    const qty=items.reduce((a,x)=>a+x.qty,0);
    const groupSales=sales.filter(s=>s.store===store&&stock.some(x=>x.store===store&&x.sku===s.sku&&weightBand(x.weight_g)===band)).reduce((a,s)=>a+s.qty,0);
    const requests=needs.filter(n=>n.store===store&&n.reason==='no_match'&&n.basis==='weight'&&Number(n.band)===band).length;
    if(qty<=1&&(groupSales>=4||requests>=2)&&!covered.has(store+'|'+band)) recommendations.push({id:`replenish|${store}|${band}`,kind:'Replenishment review',store,band,qty:null,title:`Review ${WEIGHTS[band]} availability at ${store}`,evidence:`${groupSales} pieces sold in ${window} days; ${qty} pieces currently available; ${requests} matching unmet inquiries.`,check:'Check transfers first, then lead time, incoming orders and minimum stock. Purchase quantity is not calculated in this prototype.'});
  }
  for(const store of STORES) {
    const count=needs.filter(n=>n.store===store&&n.reason==='over_budget').length;
    if(count>=2) recommendations.push({id:'mix|'+store,kind:'Price / mix review',store,qty:null,title:`Review affordability at ${store}`,evidence:`${count} inquiries reported an available item above budget.`,check:'Check suitable lighter pieces, workmanship charges and styles. Extra stock alone may not solve the issue.'});
  }
  return {recommendations,sales,needs,stockValue:stock.reduce((a,x)=>a+x.qty*x.unit_cost,0),units:stock.reduce((a,x)=>a+x.qty,0),sold:sales.reduce((a,x)=>a+x.qty,0)};
}
export function parseCSV(text) {
  const rows=[];let row=[],field='',quote=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++) {const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){field+='"';i++;}else quote=!quote;}else if(!quote&&(c===','||c==='\n'||c==='\r')){row.push(field);field='';if(c!==','){if(row.some(x=>x.trim()))rows.push(row);row=[];if(c==='\r'&&text[i+1]==='\n')i++;}}else field+=c;}
  if(quote)throw new Error('Unclosed quoted CSV field.');
  row.push(field);if(row.some(x=>x.trim()))rows.push(row);
  if(rows.length<2)throw new Error('CSV needs a header and at least one data row.');
  const header=rows.shift().map(s=>s.trim());if(new Set(header).size!==header.length)throw new Error('Duplicate CSV column.');
  return rows.map((r,i)=>{if(r.length!==header.length)throw new Error(`Row ${i+2}: incorrect column count.`);return Object.fromEntries(header.map((h,j)=>[h,r[j].trim()]));});
}
export function validateRows(rows,type,asOf=AS_OF) {
  const fields=type==='inventory'?['store','sku','style','weight_g','unit_price','unit_cost','qty','received_date']:['id','date','store','sku','qty','net_value'];
  const seen=new Set();
  return rows.map((r,i)=>{
    for(const f of fields)if(r[f]===undefined||r[f]==='')throw new Error(`Row ${i+2}: missing ${f}.`);
    if(!STORES.includes(r.store))throw new Error(`Row ${i+2}: store must be Harbour or Garden for this demo.`);
    const key=type==='inventory'?r.store+'|'+r.sku:r.id;
    if(seen.has(key))throw new Error(`Row ${i+2}: duplicate ${type==='inventory'?'store / SKU':'transaction ID'}.`);seen.add(key);
    const out={...r};
    for(const f of type==='inventory'?['weight_g','unit_price','unit_cost','qty']:['qty','net_value']){out[f]=Number(r[f]);if(!Number.isFinite(out[f])||out[f]<0)throw new Error(`Row ${i+2}: invalid ${f}.`);}
    if(!Number.isInteger(out.qty)||out.qty<(type==='sales'?1:0))throw new Error(`Row ${i+2}: invalid quantity.`);
    if(type==='inventory'&&out.weight_g<=0)throw new Error(`Row ${i+2}: weight must be positive.`);
    const date=type==='inventory'?r.received_date:r.date;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||date>asOf)throw new Error(`Row ${i+2}: invalid or future date.`);
    return out;
  });
}
export function toCSV(rows) {if(!rows.length)return '';const keys=Object.keys(rows[0]);const cell=v=>{let s=String(v??'');if(typeof v==='string'&&/^[=+@\-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};return [keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(cell).join(',')).join('\r\n');}
export function effortTotals(logs,month) {const selected=logs.filter(l=>l.date.startsWith(month));const sum=(actor,phase)=>selected.filter(l=>l.actor===actor&&l.phase===phase).reduce((a,l)=>a+Number(l.minutes),0)/60;return {vendorSetup:sum('vendor','setup'),vendorRecurring:sum('vendor','recurring'),clientSetup:sum('client','setup'),clientRecurring:sum('client','recurring')};}
