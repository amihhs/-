// 3  寻找字符串a

function searchCharA(params) {
    for(let i of params){
        if(i === 'a') return true;
    }
    return false;
}

console.log(searchCharA('gsda'))


// 4 寻找字符串ab
function searchStrAB(str, par) {
    function split(str) {
        let arr = [],
            index = 0
        for (let i of str) {
            arr[index] = i
            index++
        }
        return arr
    }
    let strList = split(str)
    let parList = split(par)
    for (let i = 0; i < strList.length; i++) {
        for (let idx = 0; idx < parList.length; idx++) {
            if (strList[i] === parList[idx]) {
                if (strList[i + 1] === parList[idx + 1]) return i
            }
        }
    }
    return false
}

console.log(searchStrAB('kjhgaabss', 'ab'))

// 5 找abcdef

function searchStr(str) {
    let sameNum = 0
    for (let i of str) {
        if (i === 'a') {
            sameNum++
        } else if (sameNum === 1 && i === 'b') {
            sameNum++
        } else if (sameNum === 2 && i === 'c') {
            sameNum++
        } else if (sameNum === 3 && i === 'd') {
            sameNum++
        } else if (sameNum === 4 && i === 'e') {
            sameNum++
        } else if (sameNum === 5 && i === 'f') {
            sameNum++
        } else{
            sameNum = 0
        }
    }
    if (sameNum === 6) return true
    else return false
}
console.log(searchStr('abcdef'))

// 6 使用状态机处理字符串

function searchStr(i) {
    let state = start
    for (let c of i) {
        state = state(c)
    }
    return state === end
}

function start(i) {
    if (i === 'a') {
        return foundA
    } else {
        return start
    }
}
function foundA(i) {
    if (i === 'b') {
        return foundB
    } else {
        return start(i)
    }
}
function foundB(i) {
    if (i === 'c') {
        return foundC
    } else {
        return start(i)
    }
}
function foundC(i) {
    if (i === 'd') {
        return foundD
    } else {
        return start(i)
    }
}
function foundD(i) {
    if (i === 'e') {
        return foundE
    } else {
        return start(i)
    }
}
function foundE(i) {
    if (i === 'f') {
        return end
    } else {
        return start(i)
    }
}
function end(i) {
    return end
}

// 7  状态机找abcabcabx

function searchStr(i) {
    let state = start
    for (let c of i) {
        state = state(c)
    }
    return state === end
}

function start(i) {
    if (i === 'a') {
        return foundA
    } else {
        return start
    }
}
function foundA(i) {
    if (i === 'b') {
        return foundB
    } else {
        return start(i)
    }
}
function foundB(i) {
    if (i === 'c') {
        return foundC
    } else {
        return start(i)
    }
}
function foundC(i) {
    if (i === 'a') {
        return foundA2
    } else {
        return start(i)
    }
}
function foundA2(i) {
    if (i === 'b') {
        return foundB2
    } else {
        return start(i)
    }
}
function foundB2(i) {
    if (i === 'x') {
        return end
    } else {
        return foundB(i)
    }
}
function end(i) {
    return end
}

// 9 server.js  
// 见 ./http/server.js

// 10 11 12 13 14

// 见 ./http/client_1.js



















// function searchStr(i) {
//     let state = start
//     let isc = false
//     for (let c of i) {
//         if (state === isC) {
//             isc = true
//         }else if(state === end && isc){
//             return state === end && isc
//         } else if(state === start) {
//             isc = false
//         }
//         state = state(c)
//     }
//     return state === end && isc
// }

// function start(i) {
//     if (i === 'a') {
//         return nextOne
//     } else {
//         return start
//     }
// }

// function nextOne(i) {
//     if (i === 'b') {
//         return nextTwo
//     }else {
//         return start(i)
//     }
// }

// function nextTwo(i) {
//     if (i === 'c') {
//         return isC
//     }else if(i === 'x'){
//         return end
//     } else {
//         return start(i)
//     }
// }
// function nextThress(i) {
//     if (i === 'x') {
//         return end
//     } else {
//         return start(i)
//     }
// }
// function isC(i) {
//     return start(i)
// }
// function end() {
//     return end
// }

// console.log(searchStr('aaabcabxvv'))


// function searchStr(str) {
//     let state = searchA
//     let countAB = 0
//     for (let i of str) {
//         if (state === add) {
//             countAB++
//         }
//         if (state === zero) {
//             countAB = 0
//         }
//         if (state === end) {
//             if(countAB<3) countAB = 0
//             else return true
//         }
//         state = state(i)
//     }
//     if (state === end && countAB >= 3) {
//         if (countAB >= 3) return true
//         else return false
//     }else{
//         return false
//     }

// }
// function searchA(str) {
//     if (str === 'a') {
//         return searchB
//     } else {
//        return zero
//     }
// }

// function searchB(str) {
//     if (str === 'b') return add
//     else return zero
// }
// function searchX(str) {
//     if (str === 'x') return end
//     else return searchA(str)
// }

// function add(str) {
//     return searchX(str)
// }
// function end(str) {
//     return searchA(str)
// }
// function zero(str) {
//     return searchA
// }


// console.log(searchStr('ababxbababxa'))


