function getStyle(el) {
    var styleCss = el.computedStyle
    if (!el.style) {
        el.style = {}
        for (let prop in styleCss) {
            var p = styleCss.value
            el.style[prop] = styleCss[prop].value
            if (el.style[prop].toString().match(/px$/))
                el.style[prop] = parseInt(el.style[prop])
            if (el.style[prop].toString().match(/^[0-9\.]+$/))
                el.style[prop] = parseInt(el.style[prop])
            // if(el.style[prop].toString().match(/%$/)) //%
            //     el.style[prop] = parseInt(el.style[prop])
        }
    }
    return el.style
}

function layout(el) {
    if (Object.keys(el.computedStyle).length < 1) {// 有无css
        return
    }
    var styleCss = getStyle(el)
    // 初始化 主轴和交叉轴
    var mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;

    if (!Object.keys(styleCss).includes('display') || styleCss.display !== 'flex') {// 是否flex布局
        return
    }

    el.children = el.children.filter(function (a) {
        return a.node !== 'text'
    })
    el.children.sort(function (a, b) {
        a = getStyle(a)
        b = getStyle(b)
        return (a.order || 0) - (b.order || 0)
    })


    Array.from(['width', 'height']).forEach(i => {
        if (styleCss[i] == 'auto' || styleCss[i] == '') styleCss[i] = null
    })

    if (!styleCss.flexFlow) {
        if (!styleCss.flexWrap) {
            styleCss.flexWrap = 'nowrap'
        }
        if (!styleCss.flexDirection) {
            styleCss.flexDirection = 'row'
        }
    } else {
        styleCss.flexDirection = styleCss.flexFlow.trim().split(/\s+/)[0]
        styleCss.flexWrap = styleCss.flexFlow.trim().split(/\s+/)[1]
    }
    if (!styleCss.justifyContent) {
        styleCss.justifyContent = 'flex-start'
    }
    if (!styleCss.alignItems || styleCss.alignItems === 'auto') {
        styleCss.alignItems = 'stretch'
    }
    if (!styleCss.alignContent || styleCss.alignContent === 'auto') {
        styleCss.alignContent = 'stretch'
    }

    if (styleCss.flexDirection == 'row') {
        mainSize = 'width'
        mainStart = 'left'
        mainEnd = 'right'
        mainSign = +1
        mainBase = 0

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if (styleCss.flexDirection == 'row-reverse') {
        mainSize = 'width'
        mainStart = 'right'
        mainEnd = 'left'
        mainSign = -1
        mainBase = styleCss.width

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'

    }
    if (styleCss.flexDirection == 'column') {
        mainSize = 'height'
        mainStart = 'top'
        mainEnd = 'bottom'
        mainSign = +1
        mainBase = styleCss.height


        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'

    }
    if (styleCss.flexDirection == 'column-reverse') {
        mainSize = 'height'
        mainStart = 'bottom'
        mainEnd = 'top'
        mainSign = -1
        mainBase = 0

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'

    }
    if (styleCss.flexWrap == 'wrap-reverse') {
        var tmp = crossStart
        crossStart = crossEnd
        crossEnd = tmp
        crossSign = -1
    } else {
        crossBase = 0
        crossSign = +1
    }
    var isAutoMainsize = false,
        styleCss = getStyle(el),
        childrenList = el.children

    if (!styleCss[mainSize]) {
        let size = 0
        Array.from(childrenList).forEach(i => {
            if (styleCss[mainSize] !== null || styleCss[mainSize] !== (void 0)) {
                size += styleCss[mainSize]
            }
        })
        styleCss[mainSize] = size
        isAutoMainsize = true
        el.isAutoMainsize = isAutoMainsize
    }

    //分行
    var list = []
    var line = { mainSpace: 0, crossSpace: 0, list: list }
    var lines = [line]

    var mainSpace = styleCss[mainSize]
    var crossSpace = 0
    Array.from(childrenList).forEach(i => {
        let iStyle = getStyle(i)
        if (iStyle[mainSize] === null) {
            iStyle[mainSize] = 0
        }
        if (iStyle.flex) {
            list.push(i)
            // mainSpace -= iStyle[mainSize]
        } else if (styleCss.flexWrap === 'nowrap' && isAutoMainsize) {
            mainSpace -= iStyle[mainSize]
            if (iStyle[crossSize] !== null && iStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, iStyle[crossSize])
            }
            list.push(i)
        } else {
            if (iStyle[mainSize] > styleCss[mainSize]) {  //处理子元素大于父元素
                iStyle[mainSize] = styleCss[mainSize]
            }
            if (iStyle[mainSize] > mainSpace) {
                line.mainSpace = mainSpace
                line.crossSpace = crossSpace

                list = []
                line.list = list
                line = {}
                lines.push(line)

                mainSpace = styleCss[mainSize]
                crossSpace = 0
            } else {
                list.push(i)
            }
            mainSpace -= iStyle[mainSize]
            if (iStyle[crossSize] !== null && iStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, iStyle[crossSize])
            }
        }
    })
    line.mainSpace = mainSpace
    if (styleCss.flexWrap === 'nowrap' && isAutoMainsize) {
        line.crossSpace = (styleCss[crossSize] !== undefined) ? styleCss[crossSize] : crossSpace
    } else {
        line.crossSpace = crossSpace
    }

    //主轴
    if (lines[0].mainSpace < 0) {
        let scale = styleCss[mainSize] / (styleCss[mainSize] - lines.line.mainSpace)
        let currentMain = mainBase
        let list = lines.line.list
        list.forEach(i => {
            let iStyle = getStyle(i)
            if (iStyle.flex) {
                i[mainSize] = 0
            }
            iStylei[mainSize] = iStyle[mainSize] * scale
            iStyle[mainStart] = currentMain
            iStylei[mainEnd] = iStyle[mainStart] - mainSign * iStyle[mainSize]
            currentMain = iStyle[mainEnd]
        })
    } else {
        lines.forEach(item => {
            let mainSpace = item.mainSpace
            let list = item.list
            let flexTotal = 0
            list.forEach(i => {
                let iStyle = getStyle(i)
                if (iStyle.flex !== null && iStyle.flex !== (void 0)) {
                    flexTotal += parseInt(iStyle.flex)
                }
            })

            if (flexTotal > 0) {
                let currentMain = mainBase
                list.forEach(i => {
                    let iStyle = getStyle(i)
                    if (iStyle.flex) {
                        iStyle[mainSize] = (lines[0].mainSpace / flexTotal) * parseInt(iStyle.flex) //mainSpace应该是总的而不是单个的
                    }
                    iStyle[mainStart] = currentMain
                    iStyle[mainEnd] = iStyle[mainStart] + mainSign * iStyle[mainSize]
                    currentMain = iStyle[mainEnd]
                })
            } else {
                if (styleCss.justifyContent === 'flex-start') {
                    var currentMain = mainBase
                    var step = 0
                }
                if (styleCss.justifyContent === 'flex-end') {
                    var currentMain = mainSpace * mainSign + mainBase
                    var step = 0
                }
                if (styleCss.justifyContent === 'center') {
                    var currentMain = mainSpace / 2 * mainSign + mainBase
                    var step = 0
                }
                if (styleCss.justifyContent === 'space-between') {
                    var currentMain = mainBase
                    var step = mainSpace / (list.length - 1) * mainSign
                }
                if (styleCss.justifyContent === 'flex-around') {
                    var step = mainSpace / list.length * mainSign
                    var currentMain = step / 2 + mainBase

                }
                if (styleCss.justifyContent === 'flex-evenly') {
                    var step = mainSpace / (list.length + 1) * mainSign
                    var currentMain = step + mainBase
                }
                list.forEach(i => {
                    let iStyle = getStyle(i)

                    iStyle[mainStart] = currentMain
                    iStyle[mainEnd] = iStyle[mainStart] + mainSign * iStyle[mainSize]
                    currentMain = iStyle[mainEnd] + step
                })
            }
        })
    }

    // 交叉轴

    var crossSpace
     
    if(!styleCss[crossSize]){
        crossSpace = 0
        styleCss[crossSize] = 0
        for(let i=0; i<lines.length;i++){
            styleCss[crossSize] = styleCss[crossSize] + lines[i].crossSpace  //交叉轴空间
        }
    }else{
        crossSpace = styleCss[crossSize]
        for(let i=0; i<lines.length;i++){
            crossSpace -= lines[i].crossSpace  //剩余空间
        }
    }

    if(styleCss.flexWrap === 'wrap-reverse'){
        crossBase = styleCss[crossSize]
    }else{
        crossBase = 0
    }
    var step

    if(styleCss.alignContent === 'flex-start'){
        crossBase += 0
        step = 0
    }
    if(styleCss.alignContent === 'flex-end'){
        crossBase += crossSign * crossSpace
        step = 0
    }
    if(styleCss.alignContent === 'center'){
        crossBase += crossSign * crossSpace /2
        step = 0
    }
    if(styleCss.alignContent === 'space-between'){
        crossBase += 0
        step = crossSpace / (lines.length -1)
    }
    if(styleCss.alignContent === 'flex-around'){
        step = crossSpace / (lines.length * 2)
        crossBase += crossSign * step/2
    }
    if(styleCss.alignContent === 'stretch'){
        crossBase += 0
        step = 0
    }

    lines.forEach(line => {
        var lineCrossSize = styleCss.alignContent === 'stretch' ? line.crossSpace  + crossSpace / lines.length : line.crossSpace

        line.list.forEach(i => {
            let iStyle = getStyle(i)
            let align = iStyle.alignSelf || styleCss.alignItems

            if(iStyle[crossSize] === null){
                iStyle[crossSize] = (align === 'stretch') ? lineCrossSize:0
            }
            if(align == 'flex-start'){
                iStyle[crossStart] = crossBase
                iStyle[crossEnd] = iStyle[crossStart] + iStyle[crossSize]*crossSign
            }
            if(align == 'flex-end'){
                iStyle[crossEnd] = crossBase + lineCrossSize*crossSign
                iStyle[crossStart] = iStyle[crossEnd] - iStyle[crossStart]*crossSign
            }
            if(align == 'center'){
                iStyle[crossStart] = crossBase + (lineCrossSize - iStyle[crossSize]) / 2 *crossSign
                iStyle[crossEnd] = iStyle[crossStart] + iStyle[crossSize]*crossSign
            }
            if(align == 'stretch'){
                iStyle[crossStart] = crossBase
                iStyle[crossEnd] = iStyle[crossStart] +  crossSign * ((iStyle[crossSize] !== null && iStyle[crossSize] !== (void 0)) ? iStyle[crossSize] :lineCrossSize)
                iStyle[crossSize] = (iStyle[crossEnd] - iStyle[crossStart]) * crossSign
            }

        })
        crossBase += crossSign * (lineCrossSize + step)
    });

}


module.exports.layout = layout