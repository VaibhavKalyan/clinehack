import test from 'node:test';
import assert from 'node:assert/strict';
import { getMissingFields, matchSchemes, schemes } from '../lib/eligibility';
import type { Profile, Scheme } from '../lib/contracts';
import { validateData } from '../scripts/validate-data';

const base: Profile = { age: 30, state: 'Telangana', annualIncome: 100000, occupation: 'worker' };
const match = (id: string, profile: Profile = base) => matchSchemes(profile).find(m => m.scheme.id === id)!;

for (const [id, min, max] of [['pmsby',18,70], ['pmjjby',18,50], ['apy',18,40], ['pm-sym',18,40], ['nps-traders',18,40]] as const) {
  for (const [age, status] of [[min-1,'not_eligible'],[min,'likely'],[max,'likely'],[max+1,'not_eligible']] as const) {
    test(`${id} age boundary ${age}`, () => assert.equal(match(id,{...base,age}).status,status));
  }
}
for (const [age, gender, status] of [[17,'female','not_eligible'],[18,'female','likely'],[50,'female','likely'],[30,'male','not_eligible'],[30,'other','not_eligible']] as const) {
  test(`PMUY ${age} ${gender}`, () => assert.equal(match('pmuy',{...base,age,gender}).status,status));
}
for (const [age, gender, status] of [[0,'female','likely'],[9,'female','likely'],[10,'female','not_eligible'],[9,'male','not_eligible']] as const) {
  test(`Sukanya child ${age} ${gender}`, () => assert.equal(match('sukanya-samriddhi',{...base,age,gender}).status,status));
}
for (const age of [49,50,55,60,80]) test(`SCSS preserves exceptions at ${age}`, () => assert.equal(match('scss',{...base,age}).status,age < 50 ? 'not_eligible' : 'likely'));
test('Land owned still does not establish PM-KISAN approval', () => assert.equal(match('pm-kisan',{...base,ownsLand:true}).status,'likely'));
test('No land fails modeled PM-KISAN rule', () => assert.equal(match('pm-kisan',{...base,ownsLand:false}).status,'not_eligible'));
test('Unknown land is requested', () => assert.ok(match('pm-kisan').missingFields.includes('ownsLand')));
test('Base fields exactly ordered', () => assert.deepEqual(getMissingFields({}),['age','state','annualIncome','occupation']));
test('Zero age and income are present', () => assert.deepEqual(getMissingFields({...base,age:0,annualIncome:0}),[]));
test('Empty state is missing', () => assert.deepEqual(getMissingFields({...base,state:'  '}),['state']));
test('Blank occupation is missing', () => assert.deepEqual(getMissingFields({...base,occupation:''}),['occupation']));
for (const age of [-1,121,NaN,Infinity,18.5,'30',null]) test(`Invalid runtime age ${String(age)} unknown`, () => {
  const p = {...base,age} as Profile;
  assert.ok(getMissingFields(p).includes('age'));
  assert.equal(match('pmsby',p).status,'likely');
});
for (const annualIncome of [-1,NaN,Infinity,'1000',null]) test(`Invalid income ${String(annualIncome)} unknown`, () => assert.ok(getMissingFields({...base,annualIncome} as Profile).includes('annualIncome')));
test('Duplicate age rules do not duplicate missing field', () => assert.equal(match('pmsby',{}).missingFields.filter(f=>f==='age').length,1));
test('Failure takes precedence over missing field', () => assert.equal(match('pmuy',{age:17}).status,'not_eligible'));
test('Female case and whitespace normalize at runtime', () => assert.equal(match('pmuy',{...base,gender:' FEMALE ' as Profile['gender']}).status,'likely'));
test('String false is unknown, not a boolean', () => assert.ok(match('pm-kisan',{...base,ownsLand:'false' as unknown as boolean}).missingFields.includes('ownsLand')));
test('All curated entries remain partial', () => assert.ok(schemes.every(s=>s.coverage==='partial')));
test('No invented verification dates', () => assert.ok(schemes.every(s=>s.last_verified===null)));
test('Curated dataset meets the target size and includes anchor schemes', () => {
  assert.ok(schemes.length >= 30, `expected at least 30 schemes, found ${schemes.length}`);
  const ids = schemes.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length, 'scheme ids must be unique');
  for (const anchor of ['nsp-csss', 'nsp-pms-sc', 'nsp-pms-obc', 'nmmss', 'pm-yasasvi', 'inspire-she', 'up-scholarship', 'telangana-epass', 'karnataka-ssp', 'mahadbt', 'nsap-oldage', 'nsap-widow', 'nsap-disability', 'pm-kisan']) {
    assert.ok(ids.includes(anchor), `missing anchor scheme ${anchor}`);
  }
});
test('Dataset validates', () => assert.deepEqual(validateData(schemes),[]));
test('No profile returns approved eligibility', () => assert.ok(matchSchemes({}).every(m=>m.status!=='eligible')));
test('Annual income is not turnover or monthly-income eligibility', () => assert.equal(match('nps-traders',{...base,annualIncome:20000000}).status,'likely'));
test('Result order and contents deterministic', () => assert.deepEqual(matchSchemes(base),matchSchemes(base)));
test('Input not mutated', () => { const p=Object.freeze({...base}); matchSchemes(p); assert.deepEqual(p,base); });
test('Scores finite within bounds', () => assert.ok(matchSchemes({}).every(m=>Number.isFinite(m.score)&&m.score>=0&&m.score<=100)));
test('Failure score zero', () => assert.equal(match('pmsby',{...base,age:10}).score,0));
test('Every result explains limitations', () => assert.ok(matchSchemes(base).every(m=>m.reasons.some(r=>r.includes('Partial screening')))));
test('Fresh calls do not retain missing field mutations', () => { match('pmuy',{}).missingFields.push('category'); assert.ok(!match('pmuy',{}).missingFields.includes('category')); });

// Synthetic fixture exercises generic operators without inventing dataset policy.
test('Generic in/eq/numeric engine and complete coverage', () => {
  const fixture: Scheme = {...schemes[0],id:'test-fixture',coverage:'complete',last_verified:'2025-01-01',rules:[{field:'state',op:'in',value:['Telangana','Andhra Pradesh']},{field:'annualIncome',op:'lte',value:100000},{field:'isStudent',op:'eq',value:false}]};
  schemes.push(fixture);
  try {
    assert.equal(match(fixture.id,{...base,state:' TELANGANA ',isStudent:false}).status,'eligible');
    assert.equal(match(fixture.id,{...base,isStudent:true}).status,'not_eligible');
    assert.equal(match(fixture.id,{...base,annualIncome:100001,isStudent:false}).status,'not_eligible');
    assert.equal(match(fixture.id,{...base,state:'Kerala',isStudent:false}).status,'not_eligible');
    assert.equal(match(fixture.id,base).status,'likely');
    fixture.last_verified=null;
    assert.equal(match(fixture.id,{...base,isStudent:false}).status,'likely');
  } finally { schemes.pop(); }
});

for (const [label, change] of [
  ['duplicate id',(s: any[])=>s.push({...s[0]})],
  ['bad URL',(s: any[])=>s[0].source_url='https://example.com'],
  ['HTTP URL',(s: any[])=>s[0].source_url='http://pmkisan.gov.in'],
  ['missing field',(s: any[])=>delete s[0].benefit],
  ['unknown key',(s: any[])=>s[0].invented=true],
  ['bad date',(s: any[])=>s[0].last_verified='2025-02-30'],
  ['future date',(s: any[])=>s[0].last_verified='2999-01-01'],
  ['bad coverage',(s: any[])=>s[0].coverage='unknown'],
  ['empty steps',(s: any[])=>s[0].steps=[]],
  ['bad field',(s: any[])=>s[0].rules=[{field:'income',op:'gte',value:1}]],
  ['bad operator',(s: any[])=>s[0].rules=[{field:'age',op:'lt',value:18}]],
  ['type coercion',(s: any[])=>s[0].rules=[{field:'age',op:'gte',value:'18'}]],
  ['empty in',(s: any[])=>s[0].rules=[{field:'state',op:'in',value:[]}]],
  ['numeric in',(s: any[])=>s[0].rules=[{field:'age',op:'in',value:['18']}]],
] as const) test(`Validator rejects ${label}`, () => { const data=structuredClone(schemes); change(data); assert.ok(validateData(data).length); });