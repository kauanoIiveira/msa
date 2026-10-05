const temperature='\u00b0C';
function entry(column,name,unit,group,lower,upper,issues=[],questions=[]) {
  const pending=group==='heating'||issues.includes('inverted-source-limits')||issues.includes('vacuum-direction-unconfirmed');
  const draftRule=pending?{kind:'pending'}:upper==null?{kind:'lower',lower}:{kind:'range',lower,upper};
  return {code:`MSA_${column}`,name,unit,group,source:{column,name,unit,limits:{lower,upper}},draftRule,issues,questions};
}
const heating=[
  ['H',1,0,0],['J',2,255,265],['L',3,255,265],['N',4,252,262],['P',5,252,262],['R',6,252,262],
  ['T',7,265,275],['V',8,265,275],['X',9,0,0],['Z',10,0,0],['AB',11,250,260],['AD',12,260,270],
  ['AF',13,260,270],['AH',14,255,265],['AJ',15,270,280],['AL',16,270,280],['AN',17,270,280],
  ['AP',18,0,0],['AR',19,285,295],['AT',20,300,310],['AV',21,310,320]
].map(([column,zone,lower,upper])=>entry(column,`Aquecimento Z${zone}`,temperature,'heating',lower,upper,
  ['heating-semantics-unconfirmed',...(lower===0&&upper===0?['zero-zero-source-limits']:[])],
  ['O valor da zona e temperatura medida ou setpoint?', 'A zona e utilizada nesta receita? O que significam os limites 0/0?', 'A faixa vale durante aquecimento/setup ou somente em producao?']));
const entries=[
  entry('F','Temp Ambiente',temperature,'environment',13,30),...heating,
  entry('AX','Medida do Passo','mm','dimension',412,415),
  entry('AZ','Velocidade do Passo','%','cycle',19,20),
  entry('BB','Tempo de Vacuo','seg','cycle',75,85),
  entry('BD','Tempo de Resfriamento','seg','cycle',35,36),
  entry('BF','Tempo destacar','seg','cycle',0.8,0.9),
  entry('BH','Tempo Contra molde','seg','cycle',80,75,['inverted-source-limits'],
    ['Os valores 80 e 75 estao trocados ou correspondem a receitas/condicoes diferentes?']),
  entry('BJ','Tempo prensa corte','seg','cycle',10,15),
  entry('BL','Tempo de esteira saida','seg','cycle',28,30),
  entry('BN','Retardo de Passo','seg','delay',1,2),
  entry('BP','Retardo de Mesa','seg','delay',0.1,1),
  entry('BR','Retardo de Vacuo','seg','delay',4,5),
  entry('BT','Retardo de resfriamento','seg','delay',4,5),
  entry('BV','Retardo destacar','seg','delay',2,5),
  entry('BX','Retardo Contra Molde','seg','delay',1.5,5),
  entry('BZ','Retardo Prensa Corte','seg','delay',9.5,15),
  entry('CB','Retardo disco corte','seg','delay',7,9),
  entry('CD','Retardo esteria saida','seg','delay',0.5,1),
  entry('CF','Press\u00e3o Ar','bar','utility',6.5,null,['pressure-unit-unconfirmed'],
    ['A coleta usa bar, como na planilha, ou kgf/cm2, como parece na foto do instrumento?', 'Existe limite superior ou somente requisito minimo de 6,5?']),
  entry('CH','Vacuo','mm/Hg','utility',-600,null,['vacuum-direction-unconfirmed'],
    ['A regra assinada e valor <= -600 ou valor >= -600 mm/Hg?', 'A referencia e pressao relativa assinada ou magnitude do vacuo?'])
];
// References only: no readings, invented machine identities or automatic engineering approval.
export function getMsaParameterCatalog() {return structuredClone(entries);}
