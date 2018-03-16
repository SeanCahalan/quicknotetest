var qs = function(query){
    return (document.querySelector(query));
}

var qsa = function(query){
    return (document.querySelectorAll(query));
}

var distance = function(p1, p2){
    let dx = p2[0] - p1[0];
    let dy = p2[1] - p1[1];
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

var sortByPlace = function(array){
    return array.sort(function(a, b){
        let x = Number(itemContext[a.id].id.substring(3));
        let y = Number(itemContext[b.id].id.substring(3));
        return x - y;
    });
}

var firstMissingNumber = function(array){
    let boolflag = new Array(array.length);
    for(let i = 0, len = array.length; i < len; i++){
        if(array[i] < len){
            boolflag[array[i]] = 1;
        }
    }
    for(let i = 0, len = boolflag.length; i < len; i++){
        if(!boolflag[i])
            return i;
    }
    return array.length;
}

var getStyle = function(node, style){
    return getComputedStyle(node)[style];
}