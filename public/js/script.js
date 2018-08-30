// dictionary: key = item.id, val = placeholder
var itemContext = new Object();

// init for any items already in the DOM on load
document.addEventListener("DOMContentLoaded", function(event) { 
    let items = qsa(".item");
    for (var i = 0; i < items.length; i++) {
        items[i].id = "item-" + i;
        var ph = document.createElement("DIV");  
        ph.id = "ph-"+i;
        ph.classList.add("placeholder");
        qs(".row").appendChild(ph);
        dragElement(items[i]);
    }
    let pholders = qsa('.placeholder');
    let wx = window.scrollX;
    let wy = window.scrollY;
    setTimeout(function(){
        for (var i = 0; i < items.length; i++) {
            let rect = pholders[i].getBoundingClientRect();
            items[i].style.top = wy + rect.y + "px";
            items[i].style.left = wx + rect.x + "px";
            itemContext[items[i].id] = pholders[i];
        }
    }, 100);
});

// re-align items on window resize
window.addEventListener('resize', function(){
    let wx = window.scrollX;
    let wy = window.scrollY;
    let items = qsa(".item");
    for (var i = 0; i < items.length; i++) {
        let rect = itemContext[items[i].id].getBoundingClientRect();
        items[i].style.top = wy + rect.y + "px";
        items[i].style.left = wx + rect.x + "px";
    }
}, true);

const container = qs(".container");
// listen for mousedown to disable the document mousemove if the
// event target is an item
container.addEventListener("mousedown", function(e){
    container.onmousemove = function(e) {
        mouseMoveFunction(e, Xo, Yo);
    }
    if ($(event.target).closest('.item').length) {  
        container.onmousemove = null;
    } 
    let Xo = e.pageX;
    let Yo = e.pageY;  
    mouseDownFunction(e, Xo, Yo); 
});

// document mousedown
// handle shift/ctrl select and add selection div to the dom
function mouseDownFunction(e, Xo, Yo){
    let items = qsa(".item");
    if(!e.target.classList.contains("selected")){
        if(!e.ctrlKey && !e.shiftKey){
            for (var i = 0; i < items.length; i++) {
                items[i].classList.remove("selected");
            }
        }
        if(e.shiftKey){
            let sorted = sortByPlace(nodeArray(items));
            let end = sorted.indexOf(e.target);
            let start = 0;
            for (var i = 0; i < end; i++) {
                if(sorted[i].classList.contains("selected")){
                    start = i;
                }
            }
            for (var i = start; i <= end; i++) {
                sorted[i].classList.add("selected");
            }
        }
    }
    if(e.target.classList.contains('item')){
        e.target.classList.add("selected");
    } 
    var x = document.createElement("DIV");  
    x.id = "select";
    container.appendChild(x);
    TweenLite.to(x, 1, {opacity: 1})
}

// check if an item overlaps with the selection box
function selected(item){
    var domRect = item.getBoundingClientRect();
    var select = document.getElementById("select");
    var selRect = select.getBoundingClientRect();
    if(insideRect(domRect, selRect)){
        return true;    
    }
    return false;
}

// add the selected class to items that are overlapped by selection
function select(e){
    let items = qsa(".item");
    for(let i = 0, len = items.length; i < len; i++){
        if(selected(items[i])){
            items[i].classList.add("selected"); 
        } else {
            if(!e.ctrlKey){
                items[i].classList.remove("selected");
            }
        }
    }
}

// document mousemove
// manipulate the selection box, check if items are selected
function mouseMoveFunction(e, Xo, Yo){
    let containerW = container.offsetWidth;
    let containerH = container.offsetHeight;
    select(e);
    let selectBox = qs('#select');
    if(e.pageY < Yo) {
        selectBox.style.top = e.pageY + "px";
        selectBox.style.bottom = containerH - Yo + "px";
        if(e.pageX > Xo) {
            selectBox.style.left = Xo + "px";
            selectBox.style.right = containerW - e.pageX + "px";
        } else {
            selectBox.style.left = e.pageX + "px";
            selectBox.style.right = containerW - Xo + "px";
        }
    } else  {
        selectBox.style.top = Yo + "px";
        selectBox.style.bottom = containerH - e.pageY + "px";
        if(e.pageX < Xo){
            selectBox.style.left = e.pageX + "px";
            selectBox.style.right = containerW - Xo + "px";
        } else {
            selectBox.style.left = Xo + "px";
            selectBox.style.right = containerW - e.pageX + "px";
        }
    }
}

// document mouseup listener
// disable the mousemove and remove the selection div from the dom
container.addEventListener("mouseup", function(e){
    container.onmousemove = null;
    let child = qs('#select');
    while(child){
        container.removeChild(child);
        child = qs("#select");
    }
});

// return the placeholder index of an element
function phIndex(elmnt){
    return Number(itemContext[elmnt.id].id.substring(3));
}

let trash = qs(".trash");
// make the trash icon visible
function showTrash(){
    if(!trash.classList.contains('active')){
        trash.classList.add('active');
        trash.style.left = window.innerWidth/2 - trash.getBoundingClientRect().width/2 + "px";
        TweenLite.to(trash, 1, {opacity: 1})
    }  
}

// hide the trash icon
function hideTrash(){
    TweenLite.to(trash, 1, {opacity: 0})
    setTimeout(function(){
        trash.classList.remove('active');
    },1000)   
}

// item drag function with enclosed mouse event functions
// handles the dragging and resizing of items
function dragElement(elmnt) {
    var swapTarget = null;
    var deleteSelected = false;
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    // item onmousedown
    // if corners clicked: onmousemove = resizeItem
    // else: onmousemove = dragItem
    function dragMouseDown(e) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        box = elmnt.getBoundingClientRect();
        pos3 = e.clientX;
        pos4 = e.clientY;
        if(box.left + 10 > e.pageX || box.right - 10 < e.pageX){
            let rightExpand = (e.pageX > box.right - 10);
            console.log(rightExpand);
            document.onmousemove = function(e) {
                resizeItem(e, rightExpand, box.width);
            }
            elmnt.classList.add("resize");
        } else {
            elmnt.classList.remove("resize");
            document.onmousemove = dragItem;
        }
        document.onmouseup = closeDragElement;
    }

    // item onmousemove
    // grow or shrink item in the right or left direction
    function resizeItem(e, rightExpand, Wo) {  
        let box = elmnt.getBoundingClientRect();
        let pholders = qsa('.placeholder');
        let openPholders = nodeArray(pholders).filter((ph, i) => !qs('#item-'+i));
    
        let adjacent = [pholders[phIndex(elmnt)]];
        let i = (rightExpand) ? 0 : openPholders.length - 1;
        let id = phIndex(elmnt);
        // get the adjacent open placeholders
        for(i; (rightExpand) ? (i < openPholders.length) : (i >= 0); (rightExpand) ? (i++) : (i--)){
            let phId = Number(openPholders[i].id.substring(3));
            if((rightExpand) ? (phId - id) : (id - phId) == 1){
                id = phId;
                adjacent.push(openPholders[i]);
            }
        }
        // snap item to the appropriate edge if within threshold
        let edge = (rightExpand) ? box.left : box.right;
        let body = qs('body').getBoundingClientRect();
        for(let i = 0; i < adjacent.length; i++){
            let pRect = adjacent[i].getBoundingClientRect();
            let pEdge = (rightExpand) ? pRect.right : pRect.left;
            if(Math.abs( e.pageX - pEdge ) < 100){
                elmnt.style.right =  body.width - box.right + "px";
                elmnt.style.width = "auto"; 
                if(rightExpand){
                    TweenLite.to(elmnt, .3, {"right": body.width - pEdge})
                } else {
                    TweenLite.to(elmnt, .3, {"left": pEdge})
                }
            }
        }
        document.onmouseup = reOrderResize;
    }

    // item onmouseup
    // reassign item and placeholder ids, match ph width to resized item width
    function reOrderResize(e){
        document.onmouseup = null;
        document.onmousemove = null;
        let outerWidth = elmnt.getBoundingClientRect().width;

        elmnt.style.width = outerWidth - 2*Number(getStyle(elmnt, "border-top-width").substring(0, 1)) + "px";
        elmnt.style.right = "";

        let pholders = nodeArray(qsa('.placeholder'));
        let overlap = pholders.filter(ph => 
            insideRect(ph.getBoundingClientRect(), elmnt.getBoundingClientRect())
        );
        let firstPh = overlap[0];
        let lastPh = overlap[overlap.length -1 ];
        let displacement = Math.abs(pholders.indexOf(firstPh) - pholders.indexOf(lastPh));
        firstPh.style.width = outerWidth + "px";
        for(let i = pholders.indexOf(firstPh) + 1; i <= pholders.indexOf(lastPh); i++){
            qs('.row').removeChild(pholders[i]);
        }
        pholders = nodeArray(qsa('.placeholder'));
        for(let i = pholders.indexOf(firstPh) + 1; i < pholders.length; i++){
            pholders[i].id = "ph-" + i;
        }
        pholders = Array.prototype.slice.call(qsa('.placeholder'), 0);
        let items = qsa('.item');
        for(let i = 0; i < items.length; i++){
            let ph = pholders.filter(ph => 
                insideRect(ph.getBoundingClientRect(), items[i].getBoundingClientRect())
            )[0];
            delete(itemContext[items[i].id]);
            items[i].id = "item-" + ph.id.substring(3);
            itemContext[items[i].id] = ph;    
        }
    }

    // item onmousemove
    // drag item to mouse
    function dragItem(e) {
        let selected = qsa(".selected");
        let sorted = sortByPlace(nodeArray(selected));

        showTrash();
        e = e || window.event;
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        let y = (elmnt.offsetTop - pos2) + "px";
        let x = (elmnt.offsetLeft - pos1) + "px";
        TweenLite.to(elmnt, 0, {top:y, left:x});
        // tween the other selected items to follow the one being dragged
        const elIndex = sorted.indexOf(elmnt);
        sorted.forEach(function(sibling, index){
            var interval = Math.floor(index/5)-Math.floor(elIndex/5);
            var dif = (index+5)%5-elIndex%5;
            y = (elmnt.offsetTop - pos2 + 220*interval) + "px";
            x = (elmnt.offsetLeft - pos1 + 140*dif) + "px";
            var absDif = Math.abs(dif);
            if(index != elIndex){
                TweenLite.to(sibling, 0.2*(1+0.3*absDif), {top:y, left:x});
            }
        })
        if(selected.length === 1){
            let items = qsa('.item');
            let pholders = qsa('.placeholder');
            let closestPlace = itemContext[ elmnt ];
            let elRect = elmnt.getBoundingClientRect();
            let p1 = [elRect.x + elRect.width/2, elRect.y+elRect.height/2];
            let d = 10000;
            for(let i = 0; i<pholders.length; i++){
                let rect = pholders[i].getBoundingClientRect();
                let p2 = [rect.x + rect.width/2, rect.y+rect.height/2];
                if(d > distance(p1, p2)){
                    d = distance(p1, p2)
                    closestPlace = pholders[i];
                }
            }

            let closestElement = qs("#" +
                Object.keys(itemContext).filter((itemId) =>
                    itemContext[itemId] === closestPlace
                )[0]
            );
              
            if(closestPlace !== itemContext[elmnt.id]){
                let ceRect = null;
                if(closestElement)
                    ceRect = closestElement.getBoundingClientRect();
               
                if(ceRect && insideRect(ceRect, elRect)){
                    swapTarget = closestElement;
                    qsa('.ready-swap').forEach(function(x){
                        x.classList.remove('ready-swap');
                    })
                    closestElement.classList.add('ready-swap');
                } else {
                    qsa('.ready-swap').forEach(function(x){
                        x.classList.remove('ready-swap');
                    })
                    swapTarget = null;
                    if(insideRect(closestPlace.getBoundingClientRect(), elRect)){
                        swapTarget = closestPlace;
                    } else {
                        swapTarget = null;
                    }
                }   
            } else {
                swapTarget = null;
                qsa('.ready-swap').forEach(function(x){
                    x.classList.remove('ready-swap');
                })
            }
        }
        if(insideRect(trash.getBoundingClientRect(), elmnt.getBoundingClientRect())){
            deleteSelected = true;
            sorted.forEach(function(item, index){
                var dif = (index+5)%5-elIndex%5;
                var interval = Math.floor(index/5)-Math.floor(elIndex/5);
                x = (elmnt.offsetLeft - pos1 + 70*dif) + "px";
                y = (elmnt.offsetTop - pos2 + 110*interval) + "px";
                TweenLite.to(item, 0.3, {opacity: 0.8, scale: 0.5, left: x, top: y});
           
            })
        } else {
            deleteSelected = false;
            sorted.forEach(function(item, index){
                TweenLite.to(item, 0.3, {opacity: 1, scale:1});
           
            })
        }
    }

    function closeDragElement(e){
        hideTrash();
        elmnt.classList.remove("resize");
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
        let selected = qsa(".selected");
        if(deleteSelected){
            let wx = window.scrollX;
            let wy = window.scrollY;
            let t = trash.getBoundingClientRect();
            let tx = t.x + t.width/2 + "px";
            let ty = t.y + t.height/2 + "px";
            selected.forEach(function(item){
                TweenLite.to(item, 0, {scale: 0.01});
                item.style.transformOrigin = "0 0";
            })
            selected.forEach(function(item){
                TweenLite.to(item, 0.3, {top: ty, left: tx});
            })
            setTimeout(function(){
                selected.forEach(function(item){
                    deleteItem(item);
                })
            }, 300) 
        } else if(selected.length > 1){
            let array = Array.prototype.slice.call(selected, 0);
            let sorted = sortByPlace(array);
            sorted.forEach(function(item, index){
                snapToPlace(item, index*0.035);
            })
        } else if (swapTarget) {
            if(swapTarget.classList.contains('placeholder')){
                snapToNewPlace(elmnt, swapTarget);
            } else {
                swapPlaces(elmnt, swapTarget);
            }
            swapTarget = null;
        } else {
            snapToPlace(elmnt, 0);
        }
        qsa('.ready-swap').forEach(function(x){
            x.classList.remove('ready-swap');
        })
        
    }
}


function snapToPlace(el, delay){
    let wx = window.scrollX;
    let wy = window.scrollY;
    let pholder = itemContext[el.id];
    let pRect = pholder.getBoundingClientRect();
    TweenLite.to(el, .4, {delay: delay, top:wy+ pRect.y+"px", left:wx +pRect.x+"px"});
}

function swapPlaces(item, target){
    let wx = window.scrollX;
    let wy = window.scrollY;

    let itemId = item.id;
    let itemPlace = itemContext[item.id];

    let targetPlace = itemContext[target.id];
    let tRect = targetPlace.getBoundingClientRect();
    TweenLite.to(item, .4, {top:wy+ tRect.y+"px", left:wx +tRect.x+"px"});
    item.id = target.id;
    // itemContext[item.id] = targetPlace;

    let iRect = itemPlace.getBoundingClientRect();
    TweenLite.to(target, .4, {top:wy+ iRect.y+"px", left:wx +iRect.x+"px"});
    target.id = itemId;
    // itemContext[target.id] = itemPlace;
}

function snapToNewPlace(item, target){
    let wx = window.scrollX;
    let wy = window.scrollY;

    let tRect = target.getBoundingClientRect();
    TweenLite.to(item, .4, {top:wy+ tRect.y+"px", left:wx +tRect.x+"px"});
    delete(itemContext[item.id]);
    item.id = "item-" + target.id.substring(3);
    itemContext[item.id] = target;
}

const addbutton = document.querySelector(".add-button");
addbutton.onclick = function(e){
    let items = document.querySelectorAll(".item");
    let array = Array.prototype.slice.call(items, 0);
    itemIds = array.map(function(el){
        return Number(el.id.substring(5));
    })
    let itemId = firstMissingNumber(itemIds);
    var x = document.createElement("DIV"); 
    x.classList.add("item");
    if(itemId == null){
        itemId = 0;
    } else if(itemId < 0){
        itemId = (sorted[0] !== 0) ? 0 : items.length;  
    }

    x.id = "item-"+itemId;
    x.textContent = 'DIV'+itemId;
    
    document.getElementsByClassName("row")[0].appendChild(x);
}

const reOrder = qs('.re-order');
reOrder.onclick = function(e){
    let items = qsa('.item');
    let array = Array.prototype.slice.call(items, 0);
    sorted = sortByPlace(array);
    sorted.forEach(function(item, index){
        if(Number(item.id.substring(5)) !== index){
            console.log(item.id, index);
            Object.defineProperty(itemContext, "item-"+index,
                Object.getOwnPropertyDescriptor(itemContext, item.id));
            delete itemContext[item.id];
            item.id = "item-"+index;
        }
    })
    let pholders = qsa('.placeholder');
    sorted.forEach(function(item, index){
        itemContext[item.id] = pholders[index];
        snapToPlace(item, 0);
    })
    let itemlen = qsa('.item').length;
    let phlen = qsa('.placeholder').length;
    for(let i=itemlen; i < phlen; i++){
        qs('.row').removeChild(pholders[i]);
    }
}

function initItem(item){
    let items = qsa(".item");
    let pholders = qsa('.placeholder');

    let x = null;
    pholders.forEach(function(p){
        if(p.id.substring(3) === item.id.substring(5)){
            x = p;
        }
    })
    if(!x){
        x = document.createElement("DIV");  
        x.id = "ph-"+(items.length-1);
        x.classList.add("placeholder");
        document.getElementsByClassName("row")[0].appendChild(x);
    }

    let rect = x.getBoundingClientRect();
    item.style.top = rect.y + "px";
    item.style.left = rect.x + "px";  

    dragElement(item);
    itemContext[item.id] = x;
}

function deleteItem(item){
    delete itemContext[item.id];
    qs('.row').removeChild(item);
}

var target = document.querySelector('.container');
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if(mutation.type === "childList"){
            let target = mutation.target
            if(target.className === "row"){
                if(mutation.removedNodes.length){
                    console.log("removed node")
                } else {
                    let node = mutation.addedNodes[0];
                    if(node.classList.contains("item")){
                        initItem(node);
                    } 
                } 
            }
        }
    });    
});

observer.observe(target, { attributes: true, childList: true, characterData: true, subtree: true });



