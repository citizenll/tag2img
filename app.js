const file = document.getElementById('file')
const canvas = document.querySelector('canvas')
const textEl = document.querySelector('#text')
const ctx = canvas.getContext('2d')
const fontSize = 30
let cacheMap = new Map()
let img,
    direction = 2,
    tagList = []
file.onchange = fileChange
;(function() {
    touchHandle()
    draw()
})()

function selectHandle() {
    let select = document.querySelector('#direction')
    direction = parseInt(select.value)
}

function fileChange() {
    let imgFile = file.files[0]
    if (!imgFile) return
    let imgUrl = window.URL.createObjectURL(imgFile)
    img = new Image()
    img.src = imgUrl
    img.onload = () => {
        drwaBg(img)
    }
}

function drwaBg(img) {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
}

function windowToCanvas(canvas, x, y) {
    var bbox = canvas.getBoundingClientRect()
    return {
        x: x - bbox.left,
        y: y - bbox.top
    }
}

function touchHandle() {
    let move = false,
        target
    canvas.addEventListener('mousedown', e => {
        let { clientX, clientY } = e
        let { x, y } = windowToCanvas(canvas, clientX, clientY)
        let obj = tagList.find(v => {
            let offsetX = Math.abs(v.x - x)
            let offsetY = Math.abs(v.y - y)
            if (v.x == x) return offsetX <= 20
            if (v.y == y) return offsetY <= 20
            return Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)) <= 20
        })
        move = obj != undefined
        target = obj
    })
    document.onmousemove = e => {
        if (move) {
            let { clientX, clientY } = e
            let { x, y } = windowToCanvas(canvas, clientX, clientY)
            target.x = x
            target.y = y
        }
    }
    document.onmouseup = () => (move = false)
}

function markHandle() {
    let tag = document.getElementById('tag').value
    let x = canvas.width / 2,
        y = canvas.height / 2
    tagList.push({ x, y, direction, tag })

    drawMark(x, y, direction, tag)
}

function drawMark(x, y, direction, tag) {
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#ffffff66'
    ctx.arc(x, y, 20, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff77'
    ctx.stroke()
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.fillStyle = '#fff'
    ctx.arc(x, y, 8, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()
    drawLine(x, y, direction, tag)
}

function drawLine(x, y, direction, tag) {
    const shortGap = 24,
        longGap = 80
    let o = {
        '1': {
            offsetX: -longGap,
            startXoffset: -shortGap,
            startYoffset: -shortGap
        },
        '2': {
            offsetX: longGap,
            startXoffset: shortGap,
            startYoffset: -shortGap
        },
        '3': {
            offsetX: longGap,
            startXoffset: shortGap,
            startYoffset: shortGap
        },
        '4': {
            offsetX: -longGap,
            startXoffset: -shortGap,
            startYoffset: shortGap
        }
    }
    let { offsetX, startXoffset, startYoffset } = o[direction]
    let startX = x,
        startY = y
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineWidth = 2
    ctx.lineTo(startX + startXoffset, y + startYoffset)
    let endX = startX + startXoffset + offsetX,
        endY = y + startYoffset
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = '#fff'
    ctx.stroke()
    ctx.closePath()
    let textX = offsetX < 0 ? endX - 6 - getStrLen(tag) : endX + 2
    drawText(textX, endY, tag)
}

function getStrLen(str) {
    if (!str) return 0
    if (cacheMap.get(str)) return cacheMap.get(str)
    textEl.style.fontSize = `${fontSize}px`
    textEl.innerText = str
    let width = textEl.getBoundingClientRect().width
    cacheMap.set(str, width)
    return width
}

function drawText(x, y, text) {
    ctx.font = `${fontSize}px Yahei`
    ctx.fillStyle = '#fff'
    ctx.fillText(text, x, ~~(y + fontSize / 2 - 2))
}

function draw() {
    requestAnimationFrame(draw)
    if (!img) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drwaBg(img)
    tagList.forEach(item => {
        let { x, y, direction, tag } = item
        drawMark(x, y, direction, tag)
    })
}
