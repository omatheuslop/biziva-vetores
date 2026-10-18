import {parseJSON,cleanText} from './assistant.mjs'
const number=(value,min=0,max=2000)=>{if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw Error('Dimensão inválida.');return value}
export function parseVector(text){
  const data=parseJSON(text)
  const width=number(data.width,100,2000);const height=number(data.height,100,2000)
  if(!Array.isArray(data.shapes)||!data.shapes.length||data.shapes.length>40)throw Error('Use entre 1 e 40 formas.')
  return {title:cleanText(data.title,120),width,height,shapes:data.shapes.map(shape=>{
    if(!['rect','circle','text'].includes(shape.type)||!/^#[a-f0-9]{6}$/i.test(shape.fill))throw Error('Forma ou cor inválida.')
    const result={type:shape.type,fill:shape.fill,x:number(shape.x,0,width),y:number(shape.y,0,height)}
    if(shape.type==='rect'){result.width=number(shape.width,1,width);result.height=number(shape.height,1,height);if(result.x+result.width>width||result.y+result.height>height)throw Error('Retângulo fora da área.')}
    if(shape.type==='circle'){result.r=number(shape.r,1,Math.min(width,height)/2);if(result.x-result.r<0||result.y-result.r<0||result.x+result.r>width||result.y+result.r>height)throw Error('Círculo fora da área.')}
    if(shape.type==='text'){result.text=cleanText(shape.text,100);result.fontSize=number(shape.fontSize,14,120)}
    return result
  })}
}
export function vectorXML(data,doc){
  const ns='http://www.w3.org/2000/svg'
  const svg=doc.createElementNS(ns,'svg')
  svg.setAttribute('width',String(data.width));svg.setAttribute('height',String(data.height));svg.setAttribute('viewBox',`0 0 ${data.width} ${data.height}`)
  const title=doc.createElementNS(ns,'title');title.textContent=data.title;svg.append(title)
  for(const shape of data.shapes){
    const node=doc.createElementNS(ns,shape.type)
    node.setAttribute('fill',shape.fill)
    if(shape.type==='circle'){node.setAttribute('cx',String(shape.x));node.setAttribute('cy',String(shape.y));node.setAttribute('r',String(shape.r))}
    else {node.setAttribute('x',String(shape.x));node.setAttribute('y',String(shape.y))}
    if(shape.type==='rect'){node.setAttribute('width',String(shape.width));node.setAttribute('height',String(shape.height))}
    if(shape.type==='text'){node.textContent=shape.text;node.setAttribute('font-size',String(shape.fontSize));node.setAttribute('font-family','Arial, sans-serif')}
    svg.append(node)
  }
  return new doc.defaultView.XMLSerializer().serializeToString(svg)
}
export function inspectVector(svg){
  const issues=[]
  if(!svg.querySelector('title'))issues.push('Inclua um título SVG para ajudar a identificar o material.')
  const small=[...svg.querySelectorAll('text')].filter(node=>parseFloat(node.getAttribute('font-size')||'16')<14)
  if(small.length)issues.push(`${small.length} textos menores que 14; revise a leitura na exportação.`)
  if(svg.querySelector('image[href^="http"],image[*|href^="http"]'))issues.push('Há imagens externas. Confira a disponibilidade e os direitos antes de distribuir.')
  return issues
}
