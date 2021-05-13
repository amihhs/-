// //1. 允许小数的四则运算产生式 
// 四则运算表达式 ::= 加法算式
// 加法算式 ::= (加法算式 ("+"|"-") 乘法算式）| 乘法算式
// 乘法算式 ::= (乘法算式 ("*"|"/") 数字) | 数字
// 数字 ::= {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}{"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}.{"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}

// //2. 允许括号的四则运算产生式
// 四则运算表达式 ::= 加法算式
// 加法算式 ::= (加法算式 ("+"|"-") 乘法算式）| 乘法算式
// 乘法算式 ::= (乘法算式 ("*"|"/") 括号算式) | 括号算式
// 括号算式 ::= (括号算式 ("*"|"/"|"+"|"-") 数字) | 数字
// 数字 ::= {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}{"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}.{"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}


//3
// inputElement ::= whiteSpace | lineTerminator | comment | token

// whiteSpace ::= 符合Unicode的空格

// lineTerminator ::= 符合Unicode的换行符

// comment ::= singleLineComment | multiLineComment
// singleLineComment ::= "/""/" any*
// multiLineComment ::= "/""*" ([^*] | "*"[^/])* "*""/"

// token ::= literal | keywords | identifier | punctuator
// literal ::= numberLiteral | stringLiteral | booleanLiteral | nullLiteral
// keywords ::= 'if' ...
// identifier ::=  标识符
// punctuator ::+ '-' ...

//5

// program ::= statement+

// statement ::= expressionStatement | ifStatement | forStatement 
// | variableDeclaration | functionDeclaration | classDeclaration 
// | breakStatement | continueStatement | returnStatement | throwStatement 
// | tryStatement | block 

// expressionStatement ::=  expression ";"
// expression ::= additiveExpression
// additiveExpression ::= multiplicativeExpression | additiveExpression ("+" | "-") multiplicativeExpression
// multiplicativeExpression ::= unaryExpression | multiplicativeExpression ("*" | "/") unaryExpression

// unaryExpression ::= primaryExpression | ("+" | "-" | "typeof")primaryExpression

// primaryExpression ::= "("expression")" | literal | identifier

// ifStatement ::= "if" "(" expression ")" statement 

// block ::= "{" statement "}"

// tryStatement ::= "try" "{" statement+  "}" "catch" "(" expression ")" "{" statement+ "}"

class XRegExp {
    constructor(source, flag, root = 'root') {
        this.table = new Map()
        this.regexp = new RegExp(this.complileRegExp(source, root, 0).source, flag);
        console.log(this.regexp)
        console.log(this.table)
    }
    complileRegExp(source, name, start) {
        if (source[name] instanceof RegExp)
            return {
                source: source[name].source,
                length: 0
            }
        let length = 0

        let regexp = source[name].replace(/<([^>]*?)>/g, (str, $1) => {
            this.table.set(start + length, $1)

            ++length

            let r = this.complileRegExp(source, $1, start + length)

            length += r.length
            return "(" + r.source + ")"
        })
        return {
            source: regexp,
            length: length
        }
    }

    exec(str) {
        let r = this.regexp.exec(str)
        for (let i = 1; i < r.length; i++) {
            if (r[i] !== void 0) {
                r[this.table.get(i - 1)] = r[i]
                console.log(this.table.get(i - 1))
            }
        }
        console.log(JSON.stringify(r[0]))
        return r
    }
    get lastIndex() {
        return this.regexp.lastIndex
    }
    set lastIndex(v) {
        return this.regexp.lastIndex = v
    }

}
function scan(str) {
    let regexp = new XRegExp({
        inputElement: "<whiteSpace>|<lineTerminator>|<comment>|<token>",
        whiteSpace: / /,
        lineTerminator: /\n/,
        comment: /\/\/[^\n]*|\/\*(?:[^*]|\*[^\/])\*\//,
        token: "<literal>|<keywords>|<identifier>|<punctuator>",
        literal: "<numberLiteral>|<stringLiteral>|<booleanLiteral>|<nullLiteral>",
        numberLiteral: /(?:[1-9][0-9]|0)(?:\.[0-9]*|\.[0-9]+)/,
        stringLiteral: /\"(?:[^"\n]|\\[\s\S])*\"|\'(?:[^"\n]|\\[\s\S])*\'/,
        booleanLiteral: /true|false/,
        nullLiteral: /null/,
        keywords: /if|new|for|function|else|let|var|const/,
        identifier: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
        punctuator: /\+|-|\*|\/|%|\+\+|\=\=|\=|--|\,|\?|\:|\{|\}|\(|\)|\<|\>|!|;|\./
    }, "g", "inputElement")

    while (regexp.lastIndex < str.length) {
        let r = regexp.exec(str)
        if (!r[0].length)
            break;
    }
}

scan(`
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let cell = document.createElement('div');
            cell.classList.add("cell");
            cell.innerText = pattern[i * 3 + j] == 2 ? "❌" : pattern[i * 3 + j] == 3 ? "⭕" : "";
            BroadcastChannel.appendChild(document.createElement("br"))
        }
    }
`)
