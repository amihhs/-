function init() {
    let node = document.getElementById('box');
    node.innerHTML = ""
    for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            let el = document.createElement('div');

            el.setAttribute('class', 'cell');
            if (map[100 * y + x] == 1) {
                el.style.backgroundColor = "black";
            }
            if (map[100 * y + x] == 2) {
                map[100 * y + x] = 0
            }
            el.addEventListener('mousemove', () => {
                if (mouserdown) {
                    if (clear) {
                        el.style.backgroundColor = "";
                        map[100 * y + x] = 0;
                    } else {
                        el.style.backgroundColor = "black";
                        map[100 * y + x] = 1;

                    }
                }
            })
            node.appendChild(el);

        }
    }


    let mouserdown = false;
    let clear = false;

    document.addEventListener("mousedown", e => {
        mouserdown = true;
        clear = (e.which === 3)
    });
    document.addEventListener("mouseup", () => mouserdown = false);
    document.addEventListener("contextmenu", e => e.preventDefault());
}

function save() {
    localStorage['map'] = JSON.stringify(map)
}
function clearAll() {
    map = new Array(100 * 100).fill(0);
    init();
}

let type = 2; //1广发式 2启发式

async function findPath(map, start, end) {
    let start_time = Date.now();
    let end_time = 0;

    if (type == 1) {
        var queue = [start];
    } else if (type == 2) {
        var queue = new Sorted([start], (a, b) => distance(a) - distance(b));
    }

    var table = Object.create(map);
    var step = new Array(10000).fill(Infinity);
    step[100 * start[1] + start[0]] = 0;

    let box = document.getElementById('box')

    async function insert(x, y, pre, fromStart) {
        if (x < 0 || x >= 100 || y < 0 || y >= 100) {
            return false;
        }
        if (table[100 * y + x] === 1) {
            return false;
        }

        if (fromStart >= step[100 * y + x]) {
            return false;
        }

        table[y * 100 + x] = pre; //前一个节点位置
        step[y * 100 + x] = fromStart;


        box.children[100 * y + x].style.backgroundColor = "lightgreen";
        map[y * 100 + x] = 2;


        if (type == 1) {
            queue.push([x, y]);
        } else if (type == 2) {
            queue.give([x, y]);
        }
    }
    function distance(point) {
        return (point[0] - end[0]) ** 2 + (point[1] - end[1]) ** 2;
    }


    let len;
    if (type == 1) {
        len = queue.length;
    } else if (type == 2) {
        len = queue.data.length;

    }
    let x, y;
    while (len) {
        if (type == 1) {
            [x, y] = queue.shift();
        } else if (type == 2) {
            [x, y] = queue.take();
        }

        let fromStart = step[100 * y + x];

        if (x === end[0] && y === end[1]) {
            box.children[100 * y + x].style.backgroundColor = "red";
            let path = [];

            while (x != start[0] || y != start[1]) {
                path.push(table[100 * y + x]);
                [x, y] = table[100 * y + x];
                // await sleep(30);
                box.children[100 * y + x].style.backgroundColor = "red";
            }

            end_time = Date.now();
            console.log(end_time - start_time + 'ms')

            type = 1;
            // findPath(map, [0,0], [50,60])

            return path;
        }

        await insert(x - 1, y, [x, y], fromStart + 10)
        await insert(x + 1, y, [x, y], fromStart + 10)
        await insert(x, y - 1, [x, y], fromStart + 10)
        await insert(x, y + 1, [x, y], fromStart + 10)

        await insert(x - 1, y - 1, [x, y], fromStart + 14)
        await insert(x - 1, y + 1, [x, y], fromStart + 14)
        await insert(x + 1, y + 1, [x, y], fromStart + 14)
        await insert(x + 1, y - 1, [x, y], fromStart + 14)


    }


    return null
}
function sleep(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t)
    })
}

class Sorted {
    constructor(data, compare) {
        this.data = data.slice();
        this.compare = compare || ((a, b) => a - b);
    }

    take() {
        if (!this.data.length) return false;

        let min = this.data[0],
            minIndex = 0;

        for (let i = 1; i < this.data.length; i++) {
            if (this.compare(min, this.data[i]) > 0) {
                min = this.data[i];
                minIndex = i;
            }
        }

        this.data[minIndex] = this.data[this.data.length - 1];
        this.data.pop();

        return min;

    }

    give(v) {
        this.data.push(v)
    }
}