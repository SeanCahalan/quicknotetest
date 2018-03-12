var itemContext = new Object();

const container = document.getElementsByClassName("container")[0];
function mouseDownFunction(e, Xo, Yo){
    let items = document.querySelectorAll(".item");
    if(!e.target.classList.contains("selected")){
        if(!e.ctrlKey && !e.shiftKey){
            for (var i = 0; i < items.length; i++) {
                items[i].classList.remove("selected");
            }
        }
        if(e.shiftKey){
            let end = Array.prototype.indexOf.call(items, e.target);
            let start = 0;
            for (var i = 0; i < items.length; i++) {
                if(items[i].classList.contains("selected")){
                    start = i;
                }
            }
            for (var i = start; i <= end; i++) {
                items[i].classList.add("selected");
            }
        }
    }

    var x = document.createElement("DIV");  
    x.id = "select";
    container.appendChild(x);
    TweenLite.to(x, 1, {opacity: 1})
}

function insideRect(item, box){
    return !(item.right < box.left || 
                item.left > box.right || 
                item.bottom < box.top || 
                item.top > box.bottom)
}
function overlap(item){
    var domRect = item.getBoundingClientRect();
    var select = document.getElementById("select");
    var selRect = select.getBoundingClientRect();
    if(insideRect(domRect, selRect)){
        return true;
    }
    return false;
}
function select(e){
    let items = document.getElementsByClassName("item");
    for(let i = 0, len = items.length; i < len; i++){
        if(overlap(items[i])){
            items[i].classList.add("selected"); 
            selected = document.querySelectorAll('.selected');
        } else {
            if(!e.ctrlKey){
                items[i].classList.remove("selected");
            }
        }
    }
}

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


$(function(){
    let items = qsa(".item");
    for (var i = 0; i < items.length; i++) {
        items[i].id = "item-" + i;
        items[i].addEventListener('click', function(e) {
            this.classList.add("selected");
            selected = qs('.selected');
        });
        var x = document.createElement("DIV");  
        x.id = "ph-"+i;
        x.classList.add("placeholder");
        qs(".row").appendChild(x);
        dragElement(items[i]);
    }
    let pholders = qsa('.placeholder');
    for (var i = 0; i < items.length; i++) {
        let rect = pholders[i].getBoundingClientRect();
        items[i].style.top = rect.y + "px";
        items[i].style.left = rect.x + "px";
        itemContext[items[i].id] = pholders[i];
    }
})

window.addEventListener('resize', function(){
    let items = qsa(".item");
    for (var i = 0; i < items.length; i++) {
        let rect = itemContext[items[i].id].getBoundingClientRect();
        items[i].style.top = rect.y + "px";
        items[i].style.left = rect.x + "px";
    }
}, true);


container.addEventListener("mousedown", function(e){
    container.onmousemove = function(e) {
        mouseMoveFunction(e, Xo, Yo);
    }
    if ($(event.target).closest('.item').length) {
        if(e.target.classList.contains('selected')){
            container.onmousemove = null;
        }
    } 
    let Xo = e.pageX;
    let Yo = e.pageY;  
    mouseDownFunction(e, Xo, Yo); 
});

container.addEventListener("mouseup", function(e){
    container.onmousemove = null;
    let child = qs('#select');
    while(child){
        container.removeChild(child);
        child = qs("select");
    }
});

function showTrash(){
    if(!document.querySelector("#trash")){
        var i = document.createElement("I");  
        i.id = "trash";
        i.classList.add("trash","fas", "fa-trash-alt");
        document.querySelector(".container").appendChild(i);
        // let svg = document.querySelector("svg");
        //     TweenLite.to(svg, 1, {opacity: 1})

    }
}

function dragElement(elmnt) {
    var swapTarget = null;
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        if(elmnt.classList.contains("selected")){
            document.onmousemove = elementDrag;
        } 
        document.onmouseup = closeDragElement;
    }

    function elementDrag(e) {
        let selected = qsa(".selected");
        let array = Array.prototype.slice.call(selected, 0);
        let sorted = array.sort(function(a, b){
            if(itemContext[a.id].id > itemContext[b.id].id){
                return 1;
            } else if (itemContext[a.id].id > itemContext[b.id].id){
                return -1;
            } else {
                return 0;
            }
        });

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
        const elIndex = sorted.indexOf(elmnt);
        sorted.forEach(function(sibling, index){
            
            var interval = Math.floor(index/5)-Math.floor(elIndex/5);
            y = (elmnt.offsetTop - pos2 + 220*interval) + "px";
            x = (elmnt.offsetLeft - pos1 + 140*((index+5)%5-elIndex%5)) + "px";
            if(index < elIndex){
                TweenLite.to(sibling, 0.3, {top:y, left:x});
            } else if(index > elIndex){
                TweenLite.to(sibling, 0.3, {top:y, left:x});
            }
        })
        if(selected.length === 1){
            let items = qsa('.item');
            let closest = itemContext[ elmnt ];
            let elRect = elmnt.getBoundingClientRect();
            let p1 = [elRect.x + elRect.width/2, elRect.y+elRect.height/2];
            let d = 10000;
            for(let i = 0; i<items.length; i++){
                let rect = itemContext[items[i].id].getBoundingClientRect();
                let p2 = [rect.x + rect.width/2, rect.y+rect.height/2];
                if(d > distance(p1, p2)){
                    d = distance(p1, p2)
                    closest = itemContext[items[i].id];
                    closestElement = items[i];
                }
            }
            if(closest !== itemContext[elmnt.id]){
                swapTarget = closestElement;
            }
        }

    }

    function closeDragElement(e){
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
        let selected = qsa(".selected");
        if(selected.length > 1){
            selected.forEach(function(item){
                snapToPlace(item);
            })
        } else if (swapTarget) {
            swapPlaces(elmnt, swapTarget);
            swapTarget = null;
        } else {
            snapToPlace(elmnt);
        }
    }
}

function snapToPlace(el, delay){
    let wx = window.scrollX;
    let wy = window.scrollY;

    let pholder = itemContext[el.id];
    let d = Number(pholder.id.substring(3))*0.05;
    d = 0;
    let pRect = pholder.getBoundingClientRect();
    TweenLite.to(el, .4, {delay: d, top:wy+ pRect.y+"px", left:wx +pRect.x+"px"});
}

function swapPlaces(item, target){
    console.log("attempt swap")
    let wx = window.scrollX;
    let wy = window.scrollY;

    let itemPlace = itemContext[item.id];

    let targetPlace = itemContext[target.id];
    let tRect = targetPlace.getBoundingClientRect();
    TweenLite.to(item, .4, {top:wy+ tRect.y+"px", left:wx +tRect.x+"px"});
    itemContext[item.id] = targetPlace;

    let iRect = itemPlace.getBoundingClientRect();
    TweenLite.to(target, .4, {top:wy+ iRect.y+"px", left:wx +iRect.x+"px"});
    itemContext[target.id] = itemPlace;
}

const addbutton = document.querySelector(".add-button");
addbutton.onclick = function(e){
    let items = document.querySelectorAll(".item");
    var x = document.createElement("DIV");  
    x.id = "item-"+items.length;
    x.classList.add("item");
    x.textContent = 'DIV'+items.length;
    document.getElementsByClassName("row")[0].appendChild(x);
}

function initItem(item){
    let items = document.querySelectorAll(".item");

  
    item.addEventListener('click', function(e) {
        this.classList.add("selected");
        selected = document.querySelectorAll('.selected');
    });

    var x = document.createElement("DIV");  
    x.id = "ph-"+items.length;
    x.classList.add("placeholder");
    document.getElementsByClassName("row")[0].appendChild(x);

    let rect = x.getBoundingClientRect();
    item.style.top = rect.y + "px";
    item.style.left = rect.x + "px";  

    dragElement(item);
    itemContext[item.id] = x;
    
}


var target = document.querySelector('.container');
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
    
        if(mutation.type === "childList"){
            let target = mutation.target
            if(target.className === "row"){
                let node = mutation.addedNodes[0];
                if(node.classList.contains("item")){
                    initItem(node);
                } 
            }
        }

    });    
});

observer.observe(target, { attributes: true, childList: true, characterData: true, subtree: true });



