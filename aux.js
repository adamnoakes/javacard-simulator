function addPad(d) {
    var hex = Number(d).toString(16).toUpperCase();

    while (hex.length < 2) {
        hex = "0" + hex;
    }

    return hex; //"0x" +
}

exports.addPad = addPad;