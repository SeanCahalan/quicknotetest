var itemContext = new Object();

const container = document.getElementsByClassName("container")[0];
function mouseDownFunction(e, Xo, Yo){
    let items = qsa(".item");
    if(!e.target.classList.contains("selected")){
        if(!e.ctrlKey && !e.shiftKey){
            for (var i = 0; i < items.length; i++) {
                items[i].classList.remove("selected");
            }
        }
        if(e.shiftKey){
            let array = Array.prototype.slice.call(items, 0);
            let sorted = sortByPlace(array);
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
    let items = qsa(".item");
    for(let i = 0, len = items.length; i < len; i++){
        if(overlap(items[i])){
            items[i].classList.add("selected"); 
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

document.addEventListener("DOMContentLoaded", function(event) { 
    let items = qsa(".item");
    for (var i = 0; i < items.length; i++) {
        items[i].id = "item-" + i;
        items[i].addEventListener('click', function(e) { 
            this.classList.add("selected");
        });
        var x = document.createElement("DIV");  
        x.id = "ph-"+i;
        x.classList.add("placeholder");
        qs(".row").appendChild(x);
        dragElement(items[i]);
        //resizeElement(items[i]);
    }
    let pholders = qsa('.placeholder');
    for (var i = 0; i < items.length; i++) {
        let rect = pholders[i].getBoundingClientRect();
        items[i].style.top = rect.y + "px";
        items[i].style.left = rect.x + "px";
        itemContext[items[i].id] = pholders[i];
    }
});

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
        // if(e.target.classList.contains('selected')){
            
            container.onmousemove = null;
        // }
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
        child = qs("#select");
    }
});


let trash = qs(".trash");
function showTrash(){
    if(!trash.classList.contains('active')){
        trash.classList.add('active');
        trash.style.left = window.innerWidth/2 - trash.getBoundingClientRect().width/2 + "px";
        TweenLite.to(trash, 1, {opacity: 1})
    }  
}
function hideTrash(){
    TweenLite.to(trash, 1, {opacity: 0})
    setTimeout(function(){
        trash.classList.remove('active');
    },1000)   
}

function dragElement(elmnt) {
    var swapTarget = null;
    var deleteSelected = false;
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
       
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;

        document.onmousemove = elementDrag;
       
        document.onmouseup = closeDragElement;
    }

    function elementDrag(e) {
        let selected = qsa(".selected");
        let array = Array.prototype.slice.call(selected, 0);
        console.log(array)
        let sorted = sortByPlace(array);

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
            var dif = (index+5)%5-elIndex%5;
            y = (elmnt.offsetTop - pos2 + 220*interval) + "px";
            x = (elmnt.offsetLeft - pos1 + 140*dif) + "px";
            var absDif = Math.abs(dif);
            if(index < elIndex){
                TweenLite.to(sibling, 0.3*(1+0.3*absDif), {top:y, left:x});
            } else if(index > elIndex){
                TweenLite.to(sibling, 0.3*(1+0.3*absDif), {top:y, left:x});
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
                let ceRect = closestElement.getBoundingClientRect();
               
                if(insideRect(ceRect, elRect)){
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
                x = (elmnt.offsetLeft - pos1 + 110*dif) + "px";
                TweenLite.to(item, 0.3, {opacity: 0.8, scale: 0.8, left: x});
           
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
            console.log(array)
            let sorted = sortByPlace(array);
            sorted.forEach(function(item, index){
                snapToPlace(item, index*0.035);
            })
        } else if (swapTarget) {
     
            swapPlaces(elmnt, swapTarget);
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

const addbutton = document.querySelector(".add-button");
addbutton.onclick = function(e){
    let items = document.querySelectorAll(".item");
    let array = Array.prototype.slice.call(items, 0);
    itemIds = array.map(function(el){
        return Number(el.id.substring(5));
    })
    let itemId = firstMissingNumber(itemIds);
    console.log(itemId);
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

function initItem(item){
    let items = qsa(".item");
    let pholders = qsa('.placeholder');

    item.addEventListener('click', function(e) {
        this.classList.add("selected");
    });

    let x = null;
    pholders.forEach(function(p){
        if(p.id.substring(3) === item.id.substring(5)){
            console.log(p.id)
            x = p;
        }
    })
    if(!x){
        console.log("new placeholder");
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



