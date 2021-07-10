const EOF = Symbol('EOF');
const pa = /^[a-zA-Z]$/;
let tokenList = [];
let currentToken = null;
let currentAttribute = null;
let stack;
let rules = [];





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

        if (!token.isClosing)
            stack.push(element)
    } else if (token.tokenType === 'tagEnd') {
        if (top.tagName === token.tagName) {
            if (top.tagName === 'style') {
                
            }
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
        return data;
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
    }else{
        return data;
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
        return endTagOpen
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
        return afterAttributeName(i)
    } else if (i == '=') {
        return beforeAttributeValue
    }else{
        return beforeAttributeName
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

    } else if (i == '>') {
        return beforeAttributeName
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



export function parseHTML(html) {
    tokenList = []
    currentToken = null
    currentAttribute = null
    stack = [{ node: 'document', children: [] }]
    rules = []
    let state = data

    for (let i of html) {
        state = state(i)
    }
    state = state(EOF)
    // console.log(tokenList)
    // console.log(JSON.stringify(stack))
    return stack[0]
}