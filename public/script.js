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
    $(".select").css({width: "auto",
                    height: "auto"});
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
    if(e.pageY < Yo && e.pageX < Xo) {
        $("#select").css({top: e.pageY,
                          left: e.pageX,
                          right: containerW - Xo,
                          bottom: containerH - Yo});   
    } else if(e.pageY < Yo) {
        $("#select").css({top: e.pageY,
                          left: Xo,
                          right: containerW - e.pageX,
                          bottom: containerH - Yo});   
    } else if(e.pageX < Xo) {
        $("#select").css({top: Yo,
                          left: e.pageX,
                          right: containerW - Xo,
                          bottom: containerH - e.pageY});   
    } else {
        $("#select").css({top: Yo,
                          left: Xo,
                          right: containerW - e.pageX,
                          bottom: containerH - e.pageY});   
    } 
}


$(function(){
    let items = document.querySelectorAll(".item");
    for (var i = 0; i < items.length; i++) {
        items[i].id = "item-" + i;
        items[i].addEventListener('click', function(e) {
            this.classList.add("selected");
            selected = document.querySelectorAll('.selected');
        });
        var x = document.createElement("DIV");  
        x.id = "ph-"+i;
        x.classList.add("placeholder");
        document.getElementsByClassName("row")[0].appendChild(x);
        dragElement(items[i]);
    }
    pholders = document.querySelectorAll('.placeholder');
    for (var i = 0; i < items.length; i++) {
        let rect = pholders[i].getBoundingClientRect();
        items[i].style.top = rect.y + "px";
        items[i].style.left = rect.x + "px";  
    }
    

})


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
    let child = document.getElementById("select");
    while(child){
        container.removeChild(child);
        child = document.getElementById("select");
    }
});

function showTrash(){
    if(!document.querySelector("#trash")){
        var i = document.createElement("I");  
        i.id = "trash";
        i.classList.add("trash","fas", "fa-trash-alt");
        document.querySelector(".container").appendChild(i);
        setTimeout(function(){
            TweenLite.to(i, 1, {opacity: 1})
        }, 100)
    }
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        console.log("start drag")
        if(elmnt.classList.contains("selected")){
            document.onmousemove = elementDrag;
        } 
        document.onmouseup = closeDragElement;
    }

    function elementDrag(e) {
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
        const elIndex = Array.prototype.indexOf.call(selected, elmnt);
        selected.forEach(function(sibling, index){
            
            var interval = Math.floor(index/5)-Math.floor(elIndex/5);
            y = (elmnt.offsetTop - pos2 + 220*interval) + "px";
            x = (elmnt.offsetLeft - pos1 + 140*((index+5)%5-elIndex%5)) + "px";
            if(index < elIndex){
                TweenLite.to(sibling, 0.3, {top:y, left:x});
            } else if(index > elIndex){
                TweenLite.to(sibling, 0.3, {top:y, left:x});
            }
        })
    }

    function closeDragElement(e){
        /* stop moving when mouse button is released:*/
        let selected = document.querySelectorAll(".selected");
        document.onmouseup = null;
        document.onmousemove = null;
        // for (var i = 0; i < selected.length; i++) {
        //     selected[i].classList.remove("selected");
        // }
        snapToPlace(elmnt);
    }
}

function snapToPlace(el){
    let wx = window.scrollX;
    let wy = window.scrollY;
    let pholders = document.querySelectorAll(".placeholder");
    let elRect = el.getBoundingClientRect();
    let p1 = [elRect.x + elRect.width/2, elRect.y+elRect.height/2];
    let pholder = pholders[0];
    let d = 10000;
    pholders.forEach(function(p){
        let rect = p.getBoundingClientRect();
        let p2 = [rect.x + rect.width/2, rect.y+rect.height/2];
        if(d > distance(p1, p2)){
           d = distance(p1, p2)
            pholder = p;
        }
    })
    let pRect = pholder.getBoundingClientRect();
    TweenLite.to(el, .4, {top:wy+ pRect.y+"px", left:wx +pRect.x+"px"});

}


function distance(p1, p2){
    let dx = p2[0] - p1[0];
    let dy = p2[1] - p1[1];
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
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
    
}


var target = document.querySelector('.container');
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
    
        if(mutation.type === "childList"){
            let target = mutation.target
            if(target.className === "row"){
                let node = mutation.addedNodes[0];
                if(node.classList.contains("item")){
                    console.log("added item")
                    initItem(node);
                } 
            }
        }

    });    
});

observer.observe(target, { attributes: true, childList: true, characterData: true, subtree: true });



