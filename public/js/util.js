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