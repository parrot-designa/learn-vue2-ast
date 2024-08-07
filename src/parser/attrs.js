import { dirRE, addAttr, bindRE, dynamicArgRE, argRE,onRE,modifierRE } from "../helpers";
import { parseFilters } from "../parser/filter-parse";
import { addDirective } from "./directive";
import { addHandler } from "./events";

function parseModifiers(name){
    const match = name.match(modifierRE)
    if (match) {
      const ret = {}
      match.forEach(m => {
        ret[m.slice(1)] = true
      })
      return ret
    }
}
 
/**
 * 给ast上增加attr属性
 * 
 * attrsList指的是所有属性
 * attrsMap指的是所有属性的map映射
 * 而attrs 指的是
 */
export function processAttrs(
    el
){
    const list = el.attrsList;
    let i,l,name,rawName,value,isDynamic,modifiers;
    for(i = 0,l = list.length; i < l; i++){
        name = rawName = list[i].name;
        value = list[i].value

        // 匹配到指令
        if(dirRE.test(name)){
            el.hasBindings = true;

            modifiers = parseModifiers(name.replace(dirRE, ''))

            if(modifiers){
                name = name.replace(modifierRE,'')
            }

            // 匹配到bind
            if(bindRE.test(name)){
                name = name.replace(bindRE, '')
                value = parseFilters(value)
                isDynamic = dynamicArgRE.test(name)
                if (isDynamic) {
                    // 去掉[ ]
                    name = name.slice(1, -1)
                }
                addAttr(el, name, value, list[i], isDynamic)
            }else if(onRE.test(name)){
                name = name.replace(onRE, '')
                isDynamic = dynamicArgRE.test(name)
                if (isDynamic) {
                    name = name.slice(1, -1)
                }
                addHandler(el, name, value,modifiers, isDynamic)
            }else{
                name = name.replace(dirRE, '')
                /**
                 * argRE 的定义通常是 /:(.*)$ 或类似的模式，这意在匹配指令名称后紧跟的 : 和任何跟随其后的字符序列直到字符串结尾。
                 * 
                 * argMatch 的作用
                 * 
                 * 当一个指令带有参数时，argRE 将会匹配这个参数，并且 argMatch 将是一个数组，其中 argMatch[1] 就是匹配到的参数字符串。
                 * 如果没有匹配到参数，argMatch 将为 null。
                 * 
                 * <!-- 带有参数的指令 -->
                 * <button v-my-directive:my-arg="someValue">Click me!</button>
                 * 
                 * 在上面的例子中，v-my-directive 是指令名称，而 my-arg 是参数。
                 * 当 argRE 应用于 v-my-directive:my-arg 时，它会匹配 :my-arg，并且 argMatch[1] 将是 my-arg。
                 */
                const argMatch = name.match(argRE)
                let arg = argMatch && argMatch[1]
                isDynamic = false
                if (arg) {
                    name = name.slice(0, -(arg.length + 1))
                    if (dynamicArgRE.test(arg)) {
                        // 去除空格 v-my-directive:[aaa] 
                        arg = arg.slice(1, -1)
                        isDynamic = true
                    }
                }
                addDirective(
                    el,
                    name,
                    rawName,
                    value,
                    arg,
                    isDynamic
                )
            }
        } else{
            addAttr(el, name, JSON.stringify(value), list[i]);
        }
    }
}

export function processRawAttrs(el) {
    const list = el.attrsList
    const len = list.length
    if (len) {
      const attrs = (el.attrs = new Array(len))
      for (let i = 0; i < len; i++) {
        attrs[i] = {
          name: list[i].name,
          value: JSON.stringify(list[i].value)
        }
      }
    } else if (!el.pre) {
      // non root node in pre blocks with no attributes
      el.plain = true
    }
}