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