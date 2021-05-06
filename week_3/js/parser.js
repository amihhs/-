const css = require('css')
const layout = require('./layout.js')

const EOF = Symbol('EOF')
const pa = /^[a-zA-Z]$/
let tokenList = []
let currentToken = null
let currentAttribute = null
let stack = [{ node: 'document', children: [] }]

let rules = []

function specificity(selector) {
    let p = [0, 0, 0, 0]
    if (!selector) return p
    let selectorParts = selector.trim().split(/\s+/)  // .p .c -> ['.p', '.c']
    for (let i of selectorParts) {
        if (i.charAt(0) === '#') {
            p[1] += 1
        } else if (i.charAt(0) === '.') {
            let sl = i.trim().slice(1).split('.')    //.p.c -> p.p -> ['p','c'] 忽略.p#c
            p[2] += sl.length
        } else {
            p[3] += 1
        }
    }
    return p
}

// 计算优先级
function compare(sp1, sp2) {
    if (sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0]
    }
    if (sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1]
    }
    if (sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2]
    }
    return sp1[3] - sp2[3]
}

// 是否符合
function match(el, selector) {
    if (!el || !el.tagName || !selector)
        return false

    if (el.attribute.class)
        var classList = el.attribute.class.trim().split(/\s+/)  //"p  c" -> ['p','c']
    else
        var classList = []
    if (el.attribute.id)
        var id = el.attribute.id.trim()
    else
        var id = ''

    var tagName = el.tagName
    // 处理选择器p.class#id
    var cl = [],
        sid = '',
        tag = '',
        str = null
    if (selector.includes('#')) { //有无id
        str = selector.split('#')
        id = str[1]
        if (id.includes('.')) {   // p#id.class
            let l = id.split('.')
            sid = l.shift()
            cl = cl.concat(l)
        }
    }
    if (str) {  // p.class
        if (str[0].includes('.')) {
            let l = str[0].split('.')
            tag = l.shift()
            cl = cl.concat(l)
        } else {
            tag = str[0]
        }
    } else {
        if (selector.includes('.')) {
            let l = selector.split('.')
            tag = l.shift()
            cl = cl.concat(l)
        }
    }
    let isTrue = false
    if (sid.length > 0 && id == sid) isTrue = true
    if (cl.length > 0) {
        for (let i of cl) {
            if (!classList.includes(i)) return false
        }
        isTrue = true
    }
    if (tag.length > 0 || tag == tagName) isTrue = true

    if (isTrue)
        return true

    return false

    // if (selector.trim().charAt(0) === '#' && el.attribute.id) {
    //     if (el.attribute.id.trim() === selector.trim().slice(1)) {
    //         return true
    //     }
    // } else if (selector.trim().charAt(0) === '.' && el.attribute.class) {
    //     let classList = el.attribute.class.trim().split(/\s+/)  //"p  c" -> ['p','c']
    //     let sl = selector.trim().slice(1).split('.')    //.p.c -> p.p -> ['p','c']
    //     for (let i of sl) {
    //         if (!classList.includes(i)) return false
    //     }
    //     return true
    // } else if (selector === el.tagName) {
    //     return true
    // }
    // return false
}
function addCssRules(str) {
    let ast = css.parse(str)
    // console.log(JSON.stringify(ast,null,'    '))
    rules.push(...ast.stylesheet.rules)
}

// 向dom添加css
function computedCss(el) {
    let elements = stack.slice().reverse()
    if (!el.computedStyle) el.computedStyle = {}
    for (let rule of rules) {
        let selectorParser = rule.selectors[0].split(/\s+/).reverse()

        if (!match(el, selectorParser[0])) {
            continue
        }

        let matched = false
        var j = 1
        for (let i = 0; i < elements.length; i++) {
            if (match(elements[i], selectorParser[j])) {
                j++
            }
        }
        if (j >= selectorParser.length) {
            matched = true
        }
        if (matched) {
            let declarations = rule.declarations
            let sp = specificity(rule.selectors[0])
            for (let dec of declarations) {
                if (!el.computedStyle[dec.property]) {
                    el.computedStyle[dec.property] = {}
                }
                // !important
                if (dec.value.includes('!important')) {
                    if (!el.computedStyle[dec.property].isImportant) {
                        el.computedStyle[dec.property].value = dec.value
                        el.computedStyle[dec.property].specificity = sp
                        el.computedStyle[dec.property].isImportant = true
                    } else {
                        if (compare(el.computedStyle[dec.property].specificity, sp) < 0) {
                            el.computedStyle[dec.property].value = dec.value
                            el.computedStyle[dec.property].specificity = sp
                        }
                    }
                } else {
                    if (!el.computedStyle[dec.property].specificity) {
                        el.computedStyle[dec.property].value = dec.value
                        el.computedStyle[dec.property].specificity = sp
                    } else if (compare(el.computedStyle[dec.property].specificity, sp) < 0) {
                        el.computedStyle[dec.property].value = dec.value
                        el.computedStyle[dec.property].specificity = sp
                    }
                }


            }

        }
    }

}


function emit(token) {
    let top = stack[stack.length - 1]
    if (token.tokenType === 'text') {
        top.children.push({
            node: 'text',
            content: token.content
        })
    }
    if (token.tokenType === 'tagStart') {
        let element = {
            tagName: '',
            attribute: {},
            children: []
        }
        element.tagName = token.tagName
        element.node = token.tagName
        for (let i of Object.keys(token)) {
            if (i !== 'tagName' && i !== 'tokenType' && i !== 'isClosing') {
                element.attribute[i] = token[i]
            }
        }
        element.parent = top
        top.children.push(element)

        // 挂载css
        computedCss(element)

        if (!token.isClosing)
            stack.push(element)
    } else if (token.tokenType === 'tagEnd') {
        if (top.tagName === token.tagName) {
            if (top.tagName === 'style') {
                addCssRules(top.children[0].content)
            }
            layout.layout(top)
            stack.pop()
        } else {
            throw new Error('标签不对')
        }
    }
    tokenList.push(token)
    // console.log(token)
}
function data(i) {
    if (i === '<') {
        if (currentToken) {   //如果有text就emit
            emit(currentToken)
            currentToken = null
        }
        return tagOpen
    } else if (i == EOF) {
        emit({
            tokenType: 'EOF',
        })
    } else {
        if (currentToken) {
            currentToken.content += i
        } else {
            currentToken = {
                tokenType: 'text',
                content: i
            }
        }
        return data
    }
}
function tagOpen(i) {
    if (i === '/') return endTagOpen
    else if (i.match(pa)) {
        if (currentToken) {
            currentToken.tagName += i
        } else {
            currentToken = {
                tokenType: 'tagStart',
                tagName: i
            }
        }
        return tagName
    }

}
function endTagOpen(i) {
    if (i.match(pa)) {
        if (currentToken) {
            currentToken.tagName += i
        } else {
            currentToken = {
                tokenType: 'tagEnd',
                tagName: i
            }
        }
        return tagName
    }
    else if (i === '>') {
        emit(currentToken)
        currentToken = null
        return data
    }
    else if (i == EOF) {
        emit({
            tokenType: 'EOF',
        })

    }

}
function tagName(i) { //html中有效的空格符：/t /n /f ' ' 四个
    if (i.match(/^[\t\f\n ]$/)) {
        currentAttribute = {
            key: '',
            value: ''
        }
        return beforeAttributeName
    }
    else if (i === '/') {
        return selfClosingStartTag
    }
    else if (i === '>') {
        if (currentToken) emit(currentToken)
        currentToken = null
        return data
    }
    else if (i.match(pa)) {
        currentToken.tagName += i
        return tagName
    }
    else return tagName

}
//
function selfClosingStartTag(i) {
    if (i === '>') {
        currentToken.isClosing = true
        emit(currentToken)
        currentToken = null
        return data
    } else if (i === EOF) {
        emit({
            tokenType: 'EOF',
        })
    } else {

    }
}
// 属性
function beforeAttributeName(i) {
    if (i.match(/^[\t\f\n ]$/)) {
        return beforeAttributeName
    } else if (i == '/' || i == '>' || i == EOF) {
        return afterAttributeName(i)
    }
    else if (i === '=') {

    }
    else {
        currentAttribute = {
            key: '',
            value: ''
        }
        return AttributeName(i)
    }
}

function AttributeName(i) {
    if (i.match(pa)) {
        currentAttribute.key += i
        return AttributeName
    } else if (i.match(/^[\t\f\n ]$/) || i == '/' || i == '>' || i == EOF) {
        return afterAttributeName
    } else if (i == '=') {
        return beforeAttributeValue
    }
}
function beforeAttributeValue(i) {
    if (i == '\'') {
        return signQuoted
    } else if (i == '\"') {
        return doubleQuoted
    } else if (i == '>') {

    } else {
        return unquoQuoted
    }
}
function signQuoted(i) {
    if (i == '\'') {
        currentToken[currentAttribute.key] = currentToken[currentAttribute.value]
        currentAttribute = null
        return beforeAttributeName
    } else if (i == '\u0000') {

    } else if (i == EOF) {

    } else {
        currentAttribute.value += i
        return signQuoted
    }
}
function doubleQuoted(i) {
    if (i == '\"') {
        currentToken[currentAttribute.key] = currentAttribute.value
        return beforeAttributeName
    } else if (i == '\u0000') {

    } else if (i == EOF) {

    } else {
        currentAttribute.value += i
        return doubleQuoted
    }
}
function unquoQuoted(i) {
    if (i.match(/^[\t\f\n ]$/)) {
        currentToken[currentAttribute.key] = currentToken[currentAttribute.value]
        return beforeAttributeName
    } else if (i == '/') {
        currentToken[currentAttribute.key] = currentToken[currentAttribute.value]
        return selfClosingStartTag
    } else if (i == '>') {
        currentToken[currentAttribute.key] = currentToken[currentAttribute.value]
        emit(currentToken)
        currentToken = null
        return data
    } else if (i == '\u0000') {

    } else if (i == EOF) {

    } else {
        currentAttribute.value += i
        return unquoQuoted
    }

}

function afterAttributeName(i) {
    if (i.match(/^[\t\f\n ]$/)) {
        return afterAttributeName
    } else if (i == '/') {
        return selfClosingStartTag
    } else if (i == '>') {
        currentToken[currentAttribute.key] = currentAttribute.value
        currentAttribute = {
            key: '',
            value: ''
        }
        emit(currentToken)
        currentToken = null
        return data
    } else if (i == '\u0000') {

    } else if (i == EOF) {

    } else {
        currentToken[currentAttribute.key] = currentToken[currentAttribute.value]
        currentAttribute = {
            key: '',
            value: ''
        }
        return AttributeName(i)
    }
}



module.exports.parseHTML = function parseHTML(html) {
    let state = data

    for (let i of html) {
        state = state(i)
    }
    state = state(EOF)
    // console.log(tokenList)
    // console.log(JSON.stringify(stack))
    return stack[0]
}