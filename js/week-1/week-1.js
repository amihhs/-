// function searchStr(str, par) {
//     function split(str) {
//         let arr = [],
//             index = 0
//         for (let i of str) {
//             arr[index] = i
//             index++
//         }
//         return arr
//     }
//     let strList = split(str)
//     let parList = split(par)
//     for (let i = 0; i < strList.length; i++) {
//         for (let idx = 0; idx < parList.length; idx++) {
//             if (strList[i] === parList[idx]) {
//                 if (strList[i + 1] === parList[idx + 1]) return i
//             }
//         }
//     }
//     return false
// }

// // console.log(searchStr('kjhgass', 'ga'))





// // console.log(split('sags'))

// function searchStr(str,par) {
//     let sameNum = 0
//     for (let i of str) {
//         if (i === 'a') {
//             sameNum++
//         } else if (sameNum === 1 && i === 'b') {
//             sameNum++
//         } else if (sameNum === 2 && i === 'c') {
//             sameNum++
//         } else if (sameNum === 3 && i === 'd') {
//             sameNum++
//         } else if (sameNum === 4 && i === 'e') {
//             sameNum++
//         } else if (sameNum === 5 && i === 'f') {
//             sameNum++
//         } else{
//             sameNum = 0
//         }
//     }
//     if (sameNum === 6) return true
//     else return false
// }


// abcabx
// console.log(searchStr('abcdejjacjabcef'))


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


function searchStr(str) {
    let state = searchA
    let countAB = 0
    for (let i of str) {
        if (state === add) {
            countAB++
        }
        if (state === zero) {
            countAB = 0
        }
        if (state === end) {
            if(countAB<3) countAB = 0
            else return true
        }
        state = state(i)
    }
    if (state === end && countAB >= 3) {
        if (countAB >= 3) return true
        else return false
    }else{
        return false
    }

}
function searchA(str) {
    if (str === 'a') {
        return searchB
    } else {
       return zero
    }
}

function searchB(str) {
    if (str === 'b') return add
    else return zero
}
function searchX(str) {
    if (str === 'x') return end
    else return searchA(str)
}

function add(str) {
    return searchX(str)
}
function end(str) {
    return searchA(str)
}
function zero(str) {
    return searchA
}


console.log(searchStr('ababxbababxa'))
