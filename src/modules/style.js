import { getAndRemoveAttr,getBindingAttr } from "../helpers";
import { parseStyleText } from "../helpers/util";

// 用于生成ast时设置staticStyle
function transformNode(el){
    const staticStyle = getAndRemoveAttr(el, 'style')

    if(staticStyle){
        el.staticStyle = JSON.stringify(parseStyleText(staticStyle))
    }

    const styleBinding = getBindingAttr(el, 'style', false);
    if (styleBinding) {
        el.styleBinding = styleBinding
    }
}

function genData(el){
    let data = '';
    if(el.staticStyle){
        data += `staticStyle:${el.staticStyle},`
    }
    if (el.styleBinding) {
        data += `style:(${el.styleBinding}),`
    }
    return data
}

export default {
    staticKeys: ['staticStyle'],
    transformNode,
    genData
}