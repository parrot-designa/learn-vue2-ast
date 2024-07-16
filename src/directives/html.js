import { addProp } from "../parser/props";

export default function html(el,dir){
    if(dir.value){
        addProp(el, 'innerHTML', `_s(${dir.value})`)
    }
}