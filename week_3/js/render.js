const images = require('images')

function render(viewport, el){
    if(el.style){
        var img = images(el.style.width, el.style.height)
        if(el.style['background-color']){
            let color = el.style['background-color'] || 'rgb(255,255,255)'
            color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
            img.fill(Number(RegExp.$1),Number(RegExp.$2),Number(RegExp.$3),1)
            viewport.draw(img, el.style.left||0, el.style.top||0)
        }

    }
    
    if(el.children){
        for(let c of el.children){
            render(viewport, c)
        }
    }
}





module.exports = render