//状态机 匹配字符串
class MatchStr {
    constructor(str, parser) {
        this.parserLen = parser.length
        this.strLen = str.length
        this.str = str
        this.parser = parser
        if (this.parserLen === 0 || this.strLen) return false
        // 生成状态 好像没用上
        for (let i = 0; i <= str.length; i++) {
            this[`status_${i}`] = i
        }

        // 初始化状态
        this.current = this.status_0
        this.partList = []
    }
    searchStr() {
        let isTrue = false,    //是否匹配成功
            isEnd = false,   //是否结束
            left = 0, //左边界
            strLen = this.strLen,
            parserLen = this.parserLen,
            currentMatchIndex = 0,
            currentSearchIndex = 0,
            currentMatchStr = '',
            currentSearchStr = ''
        //生成部分匹配表
        this.partList = this.part(this.parser)
        while (!isTrue || !isEnd) {

            currentMatchStr = this.str[currentMatchIndex]
            currentSearchStr = this.parser[currentSearchIndex]

            if (this.current === this[`status_${currentSearchIndex}`]) {
                if (currentMatchStr === currentSearchStr) { //匹配成功
                    currentSearchIndex++
                    if (currentSearchIndex === parserLen) return true
                    this.current = this[`status_${currentSearchIndex}`]
                } else {
                    let count = currentSearchIndex,   //已经匹配的长度
                        part
                    if (count - 1 > 0) part = this.partList[count - 1]  //对应的部分匹配值
                    else part = 0

                    let leftStep = count - part

                    if (count > 0 && part > 0) {
                        left += leftStep > 0 ? leftStep : 0        //左边界右移
                        currentSearchIndex = part                  //未匹配成，回位置
                        currentMatchIndex = left + count           //有部分匹配值，不回边界
                    } else {
                        left += 1
                        currentSearchIndex = 0             //未匹配成，没有部分匹配值，起始
                        currentMatchIndex = left          //没有部分匹配值，回有边界
                    }

                    currentSearchStr = this.parser[currentSearchIndex]
                    currentMatchStr = this.str[currentMatchIndex]
                    this.current = this[`status_${currentSearchIndex}`]
                    if (currentMatchStr === currentSearchStr) {
                        currentSearchIndex++
                        this.current = this[`status_${currentSearchIndex}`]
                    }
                }
                currentMatchIndex++ //字符指针右移
                if (currentMatchIndex >= strLen) return false
            }
        }
        return isTrue
    }
    //生成部分匹配表
    part(str) {
        let partList = [],
            partStr = [],
            len = str.length
        //分割字符串
        for (let i = 0; i < len; i++) {
            partStr.push(str.substr(0, i + 1))
        }
        partStr.map((v, i) => {
            // console.log(v)
            let pre = this.pre(v),
                next = this.next(v),
                len = 0
            // console.log(pre)
            // console.log(next)
                
            pre.map(val => {
                if (next.includes(val)) {
                    len += val.length
                }
            })
            partList[i] = len
        })
        return partList
    }
    //生成前缀表
    pre(str) {
        let len = str.length
        let list = []
        for (let i = 0; i < len; i++) {
            list.push(str.substr(0, i + 1))
        }
        list.pop()
        return list
    }
    //生成后缀表
    next(str) {
        let len = str.length
        let list = []
        for (let i = 0; i < len; i++) {
            list.push(str.substr(i, len))
        }
        list.shift()
        return list
    }
}

let a = 'BBC ABCDAB ABCDABCDABDE'
let b = 'ABCDABD'
let mStr = new MatchStr(a, b)
let isTrue = mStr.searchStr()
// let aaa = mStr.next('AB')
console.log(isTrue)
// console.log(aaa)