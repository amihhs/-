class XRegExp {
    constructor(source, flag, root = 'root') {
        this.table = new Map()
        this.regexp = new RegExp(this.complileRegExp(source, root, 0).source, flag);
    }
    complileRegExp(source, name, start) {
        if (source[name] instanceof RegExp)
            return {
                source: source[name].source,
                length: 0
            }
        let length = 0

        let regexp = source[name].replace(/\<([^>]*)\>/g, (str, $1) => {
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
            }
        }
        return r
    }
    get lastIndex() {
        return this.regexp.lastIndex
    }
    set lastIndex(v) {
        return this.regexp.lastIndex = v
    }

}
module.exports = function* scan(str) {
    let regexp = new XRegExp({
        inputElement: "<whiteSpace>|<lineTerminator>|<comment>|<token>",
        whiteSpace: / /,
        lineTerminator: /\n/,
        comment: /\/\*(?:[^*]|\*[^\/])*\*\/|\/\/[^\n]*/,
        token: "<literal>|<keywords>|<identifier>|<punctuator>",
        literal: "<numberLiteral>|<stringLiteral>|<booleanLiteral>|<nullLiteral>",
        numberLiteral: /0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+|(?:[1-9][0-9]*|0)(?:\.[0-9]*)?|\.[0-9]+/,
        stringLiteral: /\"(?:[^"\n]|\\[\s\S])*\"|\'(?:[^'\n]|\\[\s\S])*\'/,
        // objectLiteral: /\{.*\}/,
        booleanLiteral: /true|false/,
        nullLiteral: /null/,
        keywords: /if|new|for|function|else|let|var|const|break|continue/,
        identifier: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
        punctuator: /\|\||\&\&|\+|\-|\*|\/|%|\+\+|\=\=|\=|\-\-|\,|\?|\:|\{|\}|\(|\)|\<|\>|!|;|\./
    }, "g", "inputElement")

    while (regexp.lastIndex < str.length) {
        let r = regexp.exec(str)

        if (r.whiteSpace) {

        } else if (r.lineTerminator) {

        } else if (r.comment) {

        } else if (r.numberLiteral) {
            yield {
                type: 'NumberLiteral',
                value: r[0]
            }
        } else if (r.stringLiteral) {
            yield {
                type: 'StringLiteral',
                value: r[0]
            }
        } else if (r.booleanLiteral) {
            yield {
                type: 'BooleanLiteral',
                value: r[0]
            }
        } else if (r.nullLiteral) {
            yield {
                type: 'NullLiteral',
                value: null
            }
        } else if (r.identifier) {
            yield {
                type: 'Identifier',
                name: r[0]
            }
        } else if (r.keywords) {
            yield {
                type: r[0],
                keywords: true
            }
        } else if (r.punctuator) {
            yield {
                type: r[0],
            }
        }else{
            throw new Error('unexpected token' + r[0])
        }

        if (!r[0].length)
            break;
    }
    yield {
        type: 'EOF'
    }
}

