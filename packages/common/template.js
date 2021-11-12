import { templateFormat } from '@utils'
import { randomId8 } from '@utils'

const xml = `
      <bpmn2:definitions 
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
       xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
       xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
       xmlns:flowable="http://flowable.org/bpmn"
       id="Definitions_{definitionsRandomId8}"
       targetNamespace="http://www.flowable.org/processdef"
       xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
         <bpmn2:process id="Process_{processRandomId8}" name="流程_{processRandomId8}">
           <bpmn2:startEvent id="Event_{startEventRandomId8}" name="开始" flowable:initiator="applyUserId"/>
         </bpmn2:process>
         <bpmndi:BPMNDiagram id="BPMNDiagram_{bpmnDiagramRandomId8}">
           <bpmndi:BPMNPlane id="Process_{processRandomId8}_di" bpmnElement="Process_{processRandomId8}">
             <bpmndi:BPMNShape id="Event_{startEventRandomId8}_di" bpmnElement="Event_{startEventRandomId8}">
               <dc:Bounds x="209" y="283" width="36" height="36"/>
               <bpmndi:BPMNLabel>
                 <dc:Bounds x="217" y="326" width="22" height="14"/>
               </bpmndi:BPMNLabel>
             </bpmndi:BPMNShape>
           </bpmndi:BPMNPlane>
         </bpmndi:BPMNDiagram>
      </bpmn2:definitions>`

export default {
  initTemplate: function () {
    return templateFormat(xml, {
      definitionsRandomId8: randomId8(),
      bpmnDiagramRandomId8: randomId8(),
      processRandomId8: randomId8(),
      startEventRandomId8: randomId8()
    })
  }
}
