import {mountAssistant} from './assistant.mjs'
import {parseVector,vectorXML,inspectVector} from './vector.mjs'
export function startBiziva(editor){
  const doc=editor.$container.ownerDocument
  const host=doc.createElement('div');doc.body.append(host)
  return mountAssistant(host,{
    title:'Biziva Vetores',
    description:'Crie uma composição vetorial editável a partir do briefing. Somente formas e texto validados são adicionados ao SVG.',
    placeholder:'Um cartão de visita elegante para uma clínica, com título e detalhes geométricos…',
    sourceUrl:'https://github.com/omatheuslop/biziva-vetores',
    instruction:'Retorne somente JSON {"title":"Descrição acessível","width":800,"height":600,"shapes":[{"type":"rect","x":0,"y":0,"width":800,"height":600,"fill":"#102030"},{"type":"text","x":40,"y":80,"text":"Título","fontSize":40,"fill":"#FFFFFF"}]}. Máximo 40 formas. Tipos rect, circle (x e y são centro; use r) e text. Dimensões 100 a 2000. Todas as formas devem caber na tela. Texto até 100 caracteres; fontSize entre 14 e 120. Cor hex de seis dígitos. Não use imagens, HTML, SVG bruto ou URLs. Crie composição profissional baseada no briefing sem inventar dados.',
    parse:parseVector,
    inspect:()=>inspectVector(editor.svgCanvas.getSvgContent()),
    apply:data=>{
      const added=editor.svgCanvas.importSvgString(vectorXML(data,doc),true,true)
      if(!added)throw Error('O editor não aceitou a composição. Seu desenho foi mantido.')
    }
  })
}
