var api = require('./api.js');
var opcodes = require('../utilities/opcodes.js');
var eeprom = require('../smartcard/eeprom.js');
var ram = require('../smartcard/ram.js');
var smartcard = require('../smartcard/smartcard.js');
var apdu = require('../framework/APDU.js');

//JCVM
function frame() {
    this.local_vars = [];
    this.operand_stack = [];
    this.invoker = -1;
    this.return_pointer = 0;
}
function executeBytecode(CAPfile, startbytecode, parameters, method, appref, smartcard) {
    console.log("executing byte code");
    var frames = [];
    var heap = [];
    
    frames[0] = new frame();
    var i = 1;
    gSW = "";

    var opcode = CAPfile.COMPONENT_Method.method_info; //get bytecode array from CAP

    i = startbytecode - 1;
    var ctu = true;
    var current_frame = 0;
    var nargs = 0;
    
    //Check if header is extended
    if (opcode[i] > 127) {
        nargs = opcode[i + 2];
        i += 4;
    } else {
        
        nargs = parseInt(opcodes.pad(opcode[i + 1].toString(16)).slice(0, 1), 16);
        i += 2;
    }
    
    switch(method) {
        case 0:
            //process method
            
            frames[current_frame].local_vars.push(Number(appref));
            frames[current_frame].local_vars.push(parameters[0]);
            //APIs.applets[0] = objectheap.length;

            //objectheap.push(new Applet());
            break;
        case 1:
            //install method
            var address = eeprom.getHeapSize(smartcard.EEPROM);
            var bArr = parameters[0];
            var ghs;
            console.log("install method");

            //modified by anoakes

            /*var hv = "," + bArr.length;
            if (bArr.length > 0) {
                for (var j = 0; j < bArr.length; j++) {
                    hv += "," + bArr[j]; 
                }
            }*/
            //@anoakes
            //eeprom.appendHeap(smartcard.EEPROM, bArr.length);
            eeprom.appendHeap(smartcard.EEPROM, bArr);

            frames[current_frame].local_vars.push("#H" + address);
            frames[current_frame].local_vars.push(parameters[1]);
            frames[current_frame].local_vars.push(parameters[2]);
            //installed_flag = false; //will need to be enabled later

            break;
        case 2: //Select Method
            frames[current_frame].local_vars.push(Number(appref));
            break;
        case 3: //Deselect Method
            frames[current_frame].local_vars.push(Number(appref));
            break;
        default:
            alert("Unknown Start Method");
    }
    
    
    //START OF BYTECODE EXECUTION
    while (ctu) {
        //for printing jcvm output, enable later
        //if (cJCVM) { document.getElementById("Text2").value += i + "; " + opcodes.pad(opcode[i].toString(16)) + "; " + current_frame + "; " + frames[current_frame].operand_stack + "; " + frames[current_frame].local_vars + ";\n"; }
        switch (opcode[i]) {

            case opcodes.nop: //0x0
                i++;
                break;
            case opcodes.aconst_null: //0x01
                frames[current_frame].operand_stack.push(null);
                i++;
                break;
            case opcodes.sconst_m1: //0x02
                frames[current_frame].operand_stack.push(opcodes.short_s - 1);
                i++;
                break;
            case opcodes.sconst_0: //0x03
                frames[current_frame].operand_stack.push(0);
                i++;
                break;
            case opcodes.sconst_1: //0x04
                frames[current_frame].operand_stack.push(1);
                i++;
                break;
            case opcodes.sconst_2: //0x05
                frames[current_frame].operand_stack.push(2);
                i++;
                break;
            case opcodes.sconst_3: //0x06
                frames[current_frame].operand_stack.push(3);
                i++;
                break;
            case opcodes.sconst_4: //0x07
                frames[current_frame].operand_stack.push(4);
                i++;
                break;
            case opcodes.sconst_5: //0x08
                frames[current_frame].operand_stack.push(5);
                i++;
                break;
            case opcodes.iconst_m1: //0x09
                frames[current_frame].operand_stack.push(opcodes.short_s - 1);
                frames[current_frame].operand_stack.push(opcodes.short_s - 1);
                i++;
                break;
            case opcodes.iconst_0: //0x0A
                frames[current_frame].operand_stack.push(0);
                frames[current_frame].operand_stack.push(0);
                i++;
                break;
            case opcodes.iconst_1: //0x0B
                frames[current_frame].operand_stack.push(0);
                frames[current_frame].operand_stack.push(1);
                i++;
                break;
            case opcodes.iconst_2: //0x0C
                frames[current_frame].operand_stack.push(0);
                frames[current_frame].operand_stack.push(2);
                i++;
                break;
            case opcodes.iconst_3: //0x0D
                frames[current_frame].operand_stack.push(0);
                frames[current_frame].operand_stack.push(3);
                i++;
                break;
            case opcodes.iconst_4: //0x0E
                frames[current_frame].operand_stack.push(0);
                frames[current_frame].operand_stack.push(4);
                i++;
                break;
            case opcodes.iconst_5: //0x0F
                frames[current_frame].operand_stack.push(0);
                frames[current_frame].operand_stack.push(5);
                i++;
                break;
            case opcodes.bspush: //0x10
                //bspush, byte
                frames[current_frame].operand_stack.push(opcodes.ByteToShort(opcode[i + 1]));
                i += 2;
                break;
            case opcodes.sspush: //0x11
                //bspush, byte1, byte2
                frames[current_frame].operand_stack.push((opcode[i + 1] << 8) + opcode[i + 2]);
                i += 3;
                break;
            case opcodes.bipush: //0x12
                //bipush, byte
                var v = opcodes.convertIntegerToWords(opcodes.ByteToInt(opcode[i + 1], 16));
                frames[current_frame].operand_stack.push(v[0]);
                frames[current_frame].operand_stack.push(v[1]);
                i += 2;
                break;
            case opcodes.sipush: //0x13
                //bipush, byte1, byte2
                var v = opcodes.convertIntegerToWords(opcodes.ShortToInt((opcode[i + 1] << 8) + opcode[i + 2]));
                frames[current_frame].operand_stack.push(v[0]);
                frames[current_frame].operand_stack.push(v[1]);
                i += 3;
                break;
            case opcodes.iipush: //0x14
                //iipush, byte1, byte2, byte3, byte4
                frames[current_frame].operand_stack.push((opcode[i + 1] << 24) + (opcode[i + 2] << 16) +
                    (opcode[i + 3] << 8) + opcode[i + 4]);
                i += 5;
                break;
            case opcodes.aload: //0x15
                //aload, index
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[opcode[i + 1]]);
                i += 2;
                break;
            case opcodes.sload: //0x16
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[opcode[i + 1]]);
                i += 2;
                break;
            case opcodes.iload: //0x17
                //iload, index
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[opcode[i + 1]]);
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[opcode[i + 1] + 1]);
                i += 2;
                break;
            case opcodes.aload_0: //0x18
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[0]);

                i++;
                break;
            case opcodes.aload_1: //0x19
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[1]);

                i++;
                break;
            case opcodes.aload_2: //0x1A
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[2]);
                i++;
                break;
            case opcodes.aload_3: //0x1B
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[3]);
                i++;
                break;
            case opcodes.sload_0: //0x1C
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[4]);
                i++;
                break;
            case opcodes.sload_1: //0x1D
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[1]);
                i++;
                break;
            case opcodes.sload_2: //0x1E
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[2]);
                i++;
                break;
            case opcodes.sload_3: //0x1F
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[3]);
                i++;
                break;
            case opcodes.iload_0: //0x20
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[0]);
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[1]);
                i++;
                break;
            case opcodes.iload_1: //0x21
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[1]);
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[2]);
                i++;
                break;
            case opcodes.iload_2: //0x22
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[2]);
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[3]);
                i++;
                break;
            case opcodes.iload_3: //0x23
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[3]);
                frames[current_frame].operand_stack.push(frames[current_frame].local_vars[4]);
                i++;
                break;
            case opcodes.aaload: //0x24
                var index = frames[current_frame].operand_stack.pop();
                var arref = frames[current_frame].operand_stack.pop();
                var value = loadArray(smartcard, arref)[index];

                frames[current_frame].operand_stack.push(value);
                i++;
                break;
            case opcodes.baload: //0x25
                var index = frames[current_frame].operand_stack.pop();
                var arref = frames[current_frame].operand_stack.pop();
                var value = opcodes.ByteToShort(loadArray(smartcard, arref)[index]);

                frames[current_frame].operand_stack.push(value);
                i++;
                break;
            case opcodes.saload: //0x26
                var index = frames[current_frame].operand_stack.pop();
                var arref = frames[current_frame].operand_stack.pop();
                var value = loadArray(smartcard, arref)[index];

                frames[current_frame].operand_stack.push(value);
                i++;
                break;
            case opcodes.iaload: //0x27
                var index = frames[current_frame].operand_stack.pop();
                var arref = frames[current_frame].operand_stack.pop();
                var value = loadArray(smartcard, arref)[index];
                var val = opcodes.convertIntegerToWords(value);
                frames[current_frame].operand_stack.push(val[0]);
                frames[current_frame].operand_stack.push(val[1]);
                i++;
                break;
            case opcodes.astore: //0x28
                //astore, index
                frames[current_frame].local_vars[opcode[i + 1]] = frames[current_frame].operand_stack.pop();
                i += 2;
                break;
            case opcodes.sstore: //0x29
                //sstore, index
                frames[current_frame].local_vars[opcode[i + 1]] = frames[current_frame].operand_stack.pop();
                i += 2;
                break;
            case opcodes.istore: //0x2A
                //istore, index
                frames[current_frame].local_vars[opcode[i + 1] + 1] = frames[current_frame].operand_stack.pop();
                frames[current_frame].local_vars[opcode[i + 1]] = frames[current_frame].operand_stack.pop();
                i += 2;
                break;
            case opcodes.astore_0: //0x2B
                frames[current_frame].local_vars[0] = frames[current_frame].operand_stack.pop();
                i++;
                break;
            case opcodes.astore_1: //0x2C
                frames[current_frame].local_vars[1] = frames[current_frame].operand_stack.pop();
                i++;
                break;
            case opcodes.astore_2: //0x2D
                frames[current_frame].local_vars[2] = frames[current_frame].operand_stack.pop();
                i++;
                break;
            case opcodes.astore_3: //0x2E
                frames[current_frame].local_vars[3] = frames[current_frame].operand_stack.pop();
                i++;
                break;
            case opcodes.sstore_0: //0x2F
                frames[current_frame].local_vars[0] = frames[current_frame].operand_stack.pop();
                i++;
                break;
            case opcodes.sstore_1: //0x30
                frames[current_frame].local_vars[1] = frames[current_frame].operand_stack.pop();
                i++;
                break;
            case opcodes.sstore_2: //0x31
                frames[current_frame].local_vars[2] = frames[current_frame].operand_stack.pop();
                i++;
                break;
            case opcodes.sstore_3: //0x32
                frames[current_frame].local_vars[3] = frames[current_frame].operand_stack.pop();
                i++;
                break;
            case opcodes.istore_0: //0x33
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                v1 = (v1 * opcodes.short_s + v2) % opcodes.int_s;
                frames[current_frame].local_vars[1] = v1;
                i++;
                break;
            case opcodes.istore_1: //0x34
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                v1 = (v1 * opcodes.short_s + v2) % opcodes.int_s;
                frames[current_frame].local_vars[2] = v1;
                i++;
                break;
            case opcodes.istore_2: //0x35
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                v1 = (v1 * opcodes.short_s + v2) % opcodes.int_s;
                frames[current_frame].local_vars[2] = v1;
                i++;
                break;
            case opcodes.istore_3: //0x36
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                v1 = (v1 * opcodes.short_s + v2) % opcodes.int_s;
                frames[current_frame].local_vars[3] = v1;
                i++;
                break;
            case opcodes.aastore: //0x37
                var value = frames[current_frame].operand_stack.pop();
                var index = frames[current_frame].operand_stack.pop();
                var arref = frames[current_frame].operand_stack.pop();
                loadArray(smartcard, arref)[index] = value;
                //storeArray(smartcard, arref, index, value);
                i++;
                break;
            case opcodes.bastore: //0x38 update byte array index
                var value = frames[current_frame].operand_stack.pop();
                var index = frames[current_frame].operand_stack.pop();
                var arref = frames[current_frame].operand_stack.pop();
                loadArray(smartcard, arref)[index] = value;
                //storeArray(smartcard, arref, index, value);
                i++;
                break;
            case opcodes.sastore: //0x39
                var value = frames[current_frame].operand_stack.pop();
                var index = frames[current_frame].operand_stack.pop();
                var arref = frames[current_frame].operand_stack.pop();
                loadArray(smartcard, arref)[index] = value;
                //storeArray(smartcard, arref, index, value);
                i++;
                break;
            case opcodes.iastore: //0x3A
                var value = frames[current_frame].operand_stack.pop();
                var index = frames[current_frame].operand_stack.pop();
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                var value = (v1 << 8) + v2;
                loadArray(smartcard, arref)[index] = value;
                //storeArray(smartcard, arref, index, value);
                i++;
                break;
            case opcodes.pop: //0x3B
                frames[current_frame].operand_stack.pop();
                i++;
                break;
            case opcodes.pop2: //0x3C
                frames[current_frame].operand_stack.pop();
                frames[current_frame].operand_stack.pop();
                i++;
                break;
            case opcodes.dup: //0x3D
                var v = frames[current_frame].operand_stack.pop();
                frames[current_frame].operand_stack.push(v);
                frames[current_frame].operand_stack.push(v);
                i++;
                break;
            case opcodes.dup2: //0x3E
                var v1 = frames[current_frame].operand_stack.pop();
                var v2 = frames[current_frame].operand_stack.pop();
                frames[current_frame].operand_stack.push(v2);
                frames[current_frame].operand_stack.push(v1);
                frames[current_frame].operand_stack.push(v2);
                frames[current_frame].operand_stack.push(v1);
                i++;
                break;
            case opcodes.dup_x: //0x3F
                //dup_x, mn
                var m = parseInt(opcodes.pad(opcode[i + 1].toString(16)).slice(0, 1), 16);
                var n = parseInt(opcodes.pad(opcode[i + 1].toString(16)).slice(1), 16);
                var ar = [];

                if (n == 0) {
                    for (var j = 0; j < m; j++) {
                        ar.push(frames[current_frame].operand_stack.pop());
                    }
                } else {
                    for (var j = 0; j < n; j++) {
                        ar.push(frames[current_frame].operand_stack.pop());
                    }
                }

                for (var j = m - 1; j >= 0; j--) {
                    frames[current_frame].operand_stack.push(ar[j]);
                }
                for (var j = n - 1; j >= 0; j--) {
                    frames[current_frame].operand_stack.push(ar[j]);
                }

                i += 2;
                break;
            case opcodes.swap_x: //0x40
                //swap_x, mn
                var m = parseInt(opcode[i + 1].slice(0, 1), 16);
                var n = parseInt(opcode[i + 1].slice(1), 16);
                var arM = [];
                var arN = [];

                for (var j = 0; j < m; j++) {
                    arM.push(frames[current_frame].operand_stack.pop());
                }
                for (var j = 0; j < n; j++) {
                    arN.push(frames[current_frame].operand_stack.pop());
                }

                for (var j = 0; j < n; j++) {
                    frames[current_frame].operand_stack.push(arN.pop());
                }

                for (var j = 0; j < m; j++) {
                    frames[current_frame].operand_stack.push(arM.pop());
                }

                i += 2;
                break;
            case opcodes.sadd:  //0x41
                var sa = Number(frames[current_frame].operand_stack.pop());
                sa += Number(frames[current_frame].operand_stack.pop());
                frames[current_frame].operand_stack.push(sa % opcodes.short_s);
                i++;
                break;
            case opcodes.iadd:  //0x42
                var v2w2 = Number(frames[current_frame].operand_stack.pop());
                var v2w1 = Number(frames[current_frame].operand_stack.pop());
                var v1w2 = Number(frames[current_frame].operand_stack.pop());
                var v1w1 = Number(frames[current_frame].operand_stack.pop());

                var val = (v2w1 << 8) + v2w2 + (v1w1 << 8) + v1w2;
                var words = opcodes.convertIntegerToWords(val % opcodes.int_s);

                frames[current_frame].operand_stack.push(words[0]);
                frames[current_frame].operand_stack.push(words[1]);
                i++;
                break;
            case opcodes.ssub:  //0x43
                var sa = Number(frames[current_frame].operand_stack.pop());
                sa = Number(frames[current_frame].operand_stack.pop()) - sa;
                frames[current_frame].operand_stack.push(sa % opcodes.short_s);
                i++;
                break;
            case opcodes.isub:  //0x44
                var v2w2 = Number(frames[current_frame].operand_stack.pop());
                var v2w1 = Number(frames[current_frame].operand_stack.pop());
                var v1w2 = Number(frames[current_frame].operand_stack.pop());
                var v1w1 = Number(frames[current_frame].operand_stack.pop());

                var val = ((v1w1 << 8) + v1w2) - ((v2w1 << 8) + v2w2);
                var words = opcodes.convertIntegerToWords(val % opcodes.int_s);

                frames[current_frame].operand_stack.push(words[0]);
                frames[current_frame].operand_stack.push(words[1]);
                i++;
                break;
            case opcodes.smul: //0x45
                var sa = Number(frames[current_frame].operand_stack.pop());
                sa *= Number(frames[current_frame].operand_stack.pop());
                frames[current_frame].operand_stack.push(sa);
                i++;
                break;
            case opcodes.imul: //0x46
                var v2w2 = Number(frames[current_frame].operand_stack.pop());
                var v2w1 = Number(frames[current_frame].operand_stack.pop());
                var v1w2 = Number(frames[current_frame].operand_stack.pop());
                var v1w1 = Number(frames[current_frame].operand_stack.pop());

                var val = ((v1w1 << 8) + v1w2) * ((v2w1 << 8) + v2w2);
                var words = opcodes.convertIntegerToWords(val % opcodes.int_s);

                frames[current_frame].operand_stack.push(words[0]);
                frames[current_frame].operand_stack.push(words[1]);
                i++;
                break;
            case opcodes.sdiv: //0x47
                var sa = Number(frames[current_frame].operand_stack.pop());
                if (sa == 0) { executeBytecode.exception_handler(jlang,9,""); };
                sa = Math.round(frames[current_frame].operand_stack.pop() / sa);
                frames[current_frame].operand_stack.push(sa);
                i++;
                break;
            case opcodes.idiv: //0x48
                var v2w2 = Number(frames[current_frame].operand_stack.pop());
                var v2w1 = Number(frames[current_frame].operand_stack.pop());
                var v1w2 = Number(frames[current_frame].operand_stack.pop());
                var v1w1 = Number(frames[current_frame].operand_stack.pop());
                var val = (v2w1 << 8) + v2w2;
                if (val == 0) { executeBytecode.exception_handler(jlang,9,""); };

                val = Math.round((v1w1 * opcodes.short_s + v1w2) / val);
                var words = opcodes.convertIntegerToWords(val % opcodes.int_s);

                frames[current_frame].operand_stack.push(words[0]);
                frames[current_frame].operand_stack.push(words[1]);
                i++;
                break;
            case opcodes.srem: //0x49
                var v2 = Number(frames[current_frame].operand_stack.pop());
                var v1 = Number(frames[current_frame].operand_stack.pop());
                if (v2 == 0) { executeBytecode.exception_handler(jlang,9,""); };
                var v = v1 - (v1 / v2) * v2;

                frames[current_frame].operand_stack.push(v);
                i++;
                break;
            case opcodes.irem: //0x4A
                var v2w2 = Number(frames[current_frame].operand_stack.pop());
                var v2w1 = Number(frames[current_frame].operand_stack.pop());
                var v1w2 = Number(frames[current_frame].operand_stack.pop());
                var v1w1 = Number(frames[current_frame].operand_stack.pop());
                var v2 = v2w1 << 8 + v2w2;
                var v1 = v1w1 << 8 + v1w2;
                if (v2 == 0) { executeBytecode.exception_handler(jlang,9,""); };
                var vres = opcodes.convertIntegerToWords(v1 - (v1 / v2) * v2);

                frames[current_frame].operand_stack.push(vres[0]);
                frames[current_frame].operand_stack.push(vres[1]);
                i++;
                break;
            case opcodes.sneg: //0x4B
                var v = (-Number(frames[current_frame].operand_stack.pop())) % opcodes.short_s;
                frames[current_frame].operand_stack.push(v);
                i++;
                break;
            case opcodes.ineg: //0x4C
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                var vres = opcodes.convertIntegerToWords((-v1 * opcodes.short_s + v2) % opcodes.int_s);
                frames[current_frame].operand_stack.push(vres[0]);
                frames[current_frame].operand_stack.push(vres[1]);
                i++;
                break;
            case opcodes.sshl: //0x4D
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();

                v2 = v2 & 31;
                var vres = (v1 << v2) % opcodes.short_s;
                frames[current_frame].operand_stack.push(vres);
                i++;
                break;
            case opcodes.ishl: //0x4E
                var v2w2 = frames[current_frame].operand_stack.pop();
                var v2w1 = frames[current_frame].operand_stack.pop();
                var v1w2 = frames[current_frame].operand_stack.pop();
                var v1w1 = frames[current_frame].operand_stack.pop();
                var v2 = v2w1 * opcodes.short_s + v2w2;
                var v1 = (v1w1 * opcodes.short_s + v1w2) % Math.pow(2, 32);
                var vres = 0;

                v2 = v2 & 31;
                vres = opcodes.convertIntegerToWords((v1 << v2) % opcodes.int_s);

                frames[current_frame].operand_stack.push(vres[0]);
                frames[current_frame].operand_stack.push(vres[1]);
                i++;
                break;
            case opcodes.sshr: //0x4F
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();

                v2 = v2 & 31;
                var vres = (v1 >> v2) % opcodes.short_s;
                frames[current_frame].operand_stack.push(vres);
                i++;
                break;
            case opcodes.ishr: //0x50
                var v2w2 = frames[current_frame].operand_stack.pop();
                var v2w1 = frames[current_frame].operand_stack.pop();
                var v1w2 = frames[current_frame].operand_stack.pop();
                var v1w1 = frames[current_frame].operand_stack.pop();
                var v2 = v2w1 * opcodes.short_s + v2w2;
                var v1 = (v1w1 * opcodes.short_s + v1w2) % Math.pow(2, 32);
                var vres = 0;

                v2 = v2 & 31;
                vres = opcodes.convertIntegerToWords((v1 >> v2) % opcodes.int_s);

                frames[current_frame].operand_stack.push(vres[0]);
                frames[current_frame].operand_stack.push(vres[1]);
                i++;
                break;
            case opcodes.sushr: //0x51
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                var vres = 0;

                v1 = v1 % Math.pow(2, 32);
                v2 = v2 & 31;
                vres = (v1 >> v2) & opcodes.short_s;
                frames[current_frame].operand_stack.push(vres);

                i++;
                break;
            case opcodes.iushr: //0x52
                var v2w2 = frames[current_frame].operand_stack.pop();
                var v2w1 = frames[current_frame].operand_stack.pop();
                var v1w2 = frames[current_frame].operand_stack.pop();
                var v1w1 = frames[current_frame].operand_stack.pop();
                var v2 = v2w1 * opcodes.short_s + v2w2;
                var v1 = v1w1 * opcodes.short_s + v1w2;
                var vres = 0;

                v2 = 31 & v2;
                vres = opcodes.convertIntegerToWords((v1 >> v2) % opcodes.int_s);
                frames[current_frame].operand_stack.push(vres[0]);
                frames[current_frame].operand_stack.push(vres[1]);
                i++;
                break;
            case opcodes.sand: //0x53
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                var res = v1 & v2;
                frames[current_frame].operand_stack.push(res);
                i++;
                break;
            case opcodes.iand: //0x54
                var v2w2 = frames[current_frame].operand_stack.pop();
                var v2w1 = frames[current_frame].operand_stack.pop();
                var v1w2 = frames[current_frame].operand_stack.pop();
                var v1w1 = frames[current_frame].operand_stack.pop();
                var v2 = v2w1 * opcodes.short_s + v2w2;
                var v1 = v1w1 * opcodes.short_s + v1w2;
                var res = opcodes.convertIntegerToWords(v1 & v2);

                frames[current_frame].operand_stack.push(res[0]);
                frames[current_frame].operand_stack.push(res[1]);
                i++;
                break;
            case opcodes.sor: //0x55
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                var res = v1 | v2;
                frames[current_frame].operand_stack.push(res);
                i++;
                break;
            case opcodes.ior: //0x56
                var v2w2 = frames[current_frame].operand_stack.pop();
                var v2w1 = frames[current_frame].operand_stack.pop();
                var v1w2 = frames[current_frame].operand_stack.pop();
                var v1w1 = frames[current_frame].operand_stack.pop();
                var v2 = v2w1 * opcodes.short_s + v2w2;
                var v1 = v1w1 * opcodes.short_s + v1w2;
                var res = opcodes.convertIntegerToWords(v1 | v2);

                frames[current_frame].operand_stack.push(res[0]);
                frames[current_frame].operand_stack.push(res[1]);
                i++;
                break;
            case opcodes.sxor: //0x57
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                var res = v1 ^ v2;
                frames[current_frame].operand_stack.push(res);
                i++;
                break;
            case opcodes.ixor: //0x58
                var v2w2 = frames[current_frame].operand_stack.pop();
                var v2w1 = frames[current_frame].operand_stack.pop();
                var v1w2 = frames[current_frame].operand_stack.pop();
                var v1w1 = frames[current_frame].operand_stack.pop();
                var v2 = v2w1 * opcodes.short_s + v2w2;
                var v1 = v1w1 * opcodes.short_s + v1w2;
                var res = opcodes.convertIntegerToWords(v1 ^ v2);

                frames[current_frame].operand_stack.push(res[0]);
                frames[current_frame].operand_stack.push(res[1]);
                i++;
                break;
            case opcodes.sinc: //0x59
                //sinc, index, const
                var lc = opcode[i + 1];
                frames[current_frame].local_vars[lc] =
                    (frames[current_frame].local_vars[lc] + opcodes.ByteToShort(opcode[i + 2], 16)) % opcodes.short_s;
                i += 3;
                break;
            case opcodes.iinc: //0x5A
                //iinc, index, const
                var lc = opcode[i + 1];
                var v = opcodes.convertIntegerToWords((frames[current_frame].local_vars[lc] * opcodes.short_s + frames[current_frame].local_vars[lc + 1] + opcodes.ByteToInt(opcode[i + 2], 16)) % opcodes.int_s);
                frames[current_frame].local_vars[lc] = v[0];
                frames[current_frame].local_vars[lc + 1] = v[1];
                i += 3;
                break;
            case opcodes.s2b: //0x5B
                var val = frames[current_frame].operand_stack.pop() & 0xFF;
                frames[current_frame].operand_stack.push(val);
                i++;
                break;
            case opcodes.s2i: //0x5C
                var val = opcodes.convertIntegerToWords(opcodes.ShortToInt(frames[current_frame].operand_stack.pop()));
                frames[current_frame].operand_stack.push(val[0]);
                frames[current_frame].operand_stack.push(val[1]);
                i++;
                break;
            case opcodes.i2b: //0x5D
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                var v = opcodes.ByteToShort(v2 & 0xFF);
                frames[current_frame].operand_stack.push(v);
                i++;
                break;
            case opcodes.i2s: //0x5E
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                frames[current_frame].operand_stack.push(v2);
                i++;
                break;
            case opcodes.icmp: //0x5F
                var v2w2 = frames[current_frame].operand_stack.pop();
                var v2w1 = frames[current_frame].operand_stack.pop();
                var v1w2 = frames[current_frame].operand_stack.pop();
                var v1w1 = frames[current_frame].operand_stack.pop();
                var v2 = opcodes.IntToValue(v2w1 * opcodes.short_s + v2w2);
                var v1 = opcodes.IntToValue(v1w1 * opcodes.short_s + v1w2);

                if (v1 > v2) { frames[current_frame].operand_stack.push(1); }
                else if (v1 < v2) { frames[current_frame].operand_stack.push(opcodes.short_s - 1); }
                else { frames[current_frame].operand_stack.push(0); }
                i++;
                break;
            case opcodes.ifeq: //0x60
                //ifeq, branch
                if (frames[current_frame].operand_stack.pop() == 0) { i += opcodes.ByteToValue(opcode[i + 1]); }
                else { i += 2; }
                break;
            case opcodes.ifne: //0x61
                //ifne, branch
                if (frames[current_frame].operand_stack.pop() != 0) { i += opcodes.ByteToValue(opcode[i + 1]); }
                else { i += 2; }
                break;
            case opcodes.iflt: //0x62
                //iflt, branch
                if (frames[current_frame].operand_stack.pop() < 0) { i += opcodes.ByteToValue(opcode[i + 1]); }
                else { i += 2; }
                break;
            case opcodes.ifge: //0x63
                //ifge, branch
                if (frames[current_frame].operand_stack.pop() >= 0) { i += opcodes.ByteToValue(opcode[i + 1]); }
                else { i += 2; }
                break;
            case opcodes.ifgt: //0x64
                //ifgt, branch
                if (frames[current_frame].operand_stack.pop() > 0) { i += opcodes.ByteToValue(opcode[i + 1]); }
                else { i += 2; }
                break;
            case opcodes.ifle: //0x65
                //ifle, branch
                if (frames[current_frame].operand_stack.pop() <= 0) { i += opcodes.ByteToValue(opcode[i + 1]); }
                else { i += 2; }
                break;
            case opcodes.ifnull: //0x66
                //ifnull, branch
                if (frames[current_frame].operand_stack.pop() == null) { i += opcodes.ByteToValue(opcode[i + 1]); }
                else { i += 2; }
                break;
            case opcodes.ifnonnull: //0x67
                //ifnonnull, branch
                if (frames[current_frame].operand_stack.pop() != null) { i += opcodes.ByteToValue(opcode[i + 1]); }
                else { i += 2; }
                break;
            case opcodes.if_acmpeq: //0x68
                //if_acmpeq, branch
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                if (v1 == v2) { i += opcodes.ByteToValue(opcode[i + 1]); }
                else { i += 2; }
                break;
            case opcodes.if_acmpne: //0x69
                //if_acmpne, branch
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                if (v1 != v2) { i += opcodes.ByteToValue(opcode[i + 1]); }
                else { i += 2; }
                break;
            case opcodes.if_scmpeq: //0x6A
                var branch = opcodes.ByteToValue(opcode[i + 1]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 == val2) {
                    i += branch;
                } else {
                    i += 2;
                }
                break;
            case opcodes.if_scmpne: //0x6B
                var branch = opcodes.ByteToValue(opcode[i + 1]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 != val2) {
                    i += branch;
                } else {
                    i += 2;
                }
                break;
            case opcodes.if_scmplt: //0x6C
                var branch = opcodes.ByteToValue(opcode[i + 1]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 < val2) {
                    i += branch;
                } else {
                    i += 2;
                }
                break;
                break;
            case opcodes.if_scmpge: //0x6D
                var branch = opcodes.ByteToValue(opcode[i + 1]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 >= val2) {
                    i += branch;
                } else {
                    i += 2;
                }
                break;
            case opcodes.if_scmpgt: //0x6E
                var branch = opcodes.ByteToValue(opcode[i + 1]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 > val2) {
                    i += branch;
                } else {
                    i += 2;
                }
                break;
            case opcodes.if_scmple: //0x6F
                var branch = opcodes.ByteToValue(opcode[i + 1]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 <= val2) {
                    i += branch;
                } else {
                    i += 2;
                }
                break;
            case opcodes.goto: //0x70
                i += opcodes.ByteToValue(opcode[i + 1]);
                break;
            case opcodes.jsr: //0x71
                //jsr, branchbyte1,branchbyte2
                frames[current_frame].operand_stack.push(i + 3);
                i += opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                break;
            case opcodes.ret: //0x72
                //ret, index
                i = frames[current_frame].local_vars[opcode[i + 1]];
                break;
            case opcodes.stableswitch: //0x73
                //stableswitch, defaultbyte1, defaultbyte2, lowbyte1, lowbyte2, 
                //highbyte1, highbyte2, jump offsets...
                var defaultbyte = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var low = opcodes.ShortToValue((opcode[i + 3] << 8) + opcode[i + 4]);
                var high = opcodes.ShortToValue((opcode[i + 5] << 8) + opcode[i + 6]);
                var arrsize = high - low + 1;
                var jumptable = [];
                var index = opcodes.ShortToValue(frames[current_frame].operand_stack.pop());

                for (var j = 0; j < arrsize; j++) {
                    jumptable[j] = opcodes.ShortToValue((opcode[i + 2 * j + 7] << 8) + opcode[i + 2 * j + 8]);
                }

                if ((index < low) || (index > high)) {
                    i += defaultbyte;
                } else {
                    i += jumptable[index - low];
                }

                break;
            case opcodes.itableswitch: //0x74
                //itableswitch, defaultbyte1, defaultbyte2, lowbyte1, lowbyte2, lowbyte3, lowbyte4, 
                //highbyte1, highbyte2, highbyte3, highbyte4, jump offsets...
                var defaultbyte = opcodes.ShortToValue((opcode[i + 1] + opcode[i + 2], 16));
                var low = opcodes.IntToValue((opcode[i + 3] << 24) + (opcode[i + 4] << 16) + (opcode[i + 5] << 8) + opcode[i + 6]);
                var high = opcodes.IntToValue((opcode[i + 7] << 24) + (opcode[i + 8] << 16) + (opcode[i + 9] << 8) + opcode[i + 10]);
                var arrsize = high - low + 1;
                var jumptable = [];
                var index2 = frames[current_frame].operand_stack.pop();
                var index = frames[current_frame].operand_stack.pop();

                index = opcodes.IntToValue(index * opcodes.short_s + index2);
                for (var j = 0; j < arrsize; j++) {
                    jumptable[j] = opcodes.ShortToValue((opcode[i + 2 * j + 11] << 8) + opcode[i + 2 * j + 12]);
                }

                if ((index < low) || (index > high)) {
                    i += defaultbyte;
                } else {
                    i += jumptable[index - low];
                }
                break;
            case opcodes.slookupswitch: //0x75
                //slookupswitch, defaultbyte1, defaultbyte2, npairs1, npairs2, 
                //match-offset pairs...
                var key = opcodes.ShortToValue(frames[current_frame].operand_stack.pop());
                var defaultbyte = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var npairs = (opcode[i + 3] << 8) + opcode[i + 4];

                var bfound = false;
                for (var j = 0; j < npairs; j++) {
                    if (opcodes.ShortToValue((opcode[i + 4 * j + 5] << 8) + opcode[i + 4 * j + 6]) == key) {
                        bfound = true;
                        i += opcodes.ShortToValue((opcode[i + 4 * j + 7] << 8) + opcode[i + 4 * j + 8]);
                        break;
                    }
                }
                if (!bfound) { i += defaultbyte };

                break;
            case opcodes.ilookupswitch: //0x76
                //ilookupswitch, defaultbyte1, defaultbyte2, npairs1, npairs2, 
                //match-offset pairs...
                var key2 = frames[current_frame].operand_stack.pop();
                var key = frames[current_frame].operand_stack.pop();
                var defaultbyte = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var npairs = (opcode[i + 3] << 8) + opcode[i + 4];
                key = opcodes.IntToValue(key * opcodes.short_s + key2);

                var bfound = false;
                for (var j = 0; j < npairs; j++) {
                    if (opcodes.IntToValue((opcode[i + 6 * j + 5] << 24) + (opcode[i + 6 * j + 6] << 16) + (opcode[i + 6 * j + 7] << 8) + opcode[i + 6 * j + 8]) == key) {
                        bfound = true;
                        i += opcodes.ShortToValue((opcode[i + 6 * j + 9] << 8) + opcode[i + 6 * j + 10]);
                        break;
                    }
                }
                if (!bfound) { i += defaultbyte };

                break;
            case opcodes.areturn: //0x77
                frames[frames[current_frame].invoker].operand_stack.push(frames[current_frame].operand_stack.pop());
                frames[current_frame].operand_stack = [];
                current_frame = frames[current_frame].invoker;
                i = frames[current_frame].return_pointer;
                break;
            case opcodes.sreturn: //0x78
                var val = frames[current_frame].operand_stack.pop();
                if (frames[current_frame].invoker >= 0) {
                    frames[frames[current_frame].invoker].operand_stack.push(val);
                    frames[current_frame].operand_stack = [];
                    current_frame = frames[current_frame].invoker;
                    i = frames[current_frame].return_pointer;
                } else { ctu = false; if (val == 0) { gSW = "0x6999"; } }
               
                break;
            case opcodes.ireturn: //0x79
                var w2 = frames[current_frame].operand_stack.pop();
                var w1 = frames[current_frame].operand_stack.pop();
                frames[current_frame].operand_stack = [];

                frames[frames[current_frame].invoker].operand_stack.push(w1);
                frames[frames[current_frame].invoker].operand_stack.push(w2);

                current_frame = frames[current_frame].invoker;
                i = frames[current_frame].return_pointer;
                break;
            case opcodes.return_v: //0x7A
                frames[current_frame].operand_stack = [];
                current_frame = frames[current_frame].invoker;
                if (current_frame >= 0) {
                    i = frames[current_frame].return_pointer;
                } else { i = -1; }
                break;
            case opcodes.getstatic_a: //0x7B
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);//slice stops the constantpool being edited
                var val = getstatic(info, 2);
                frames[current_frame].operand_stack.push(val);
                i += 3;
                break;
            case opcodes.getstatic_b: //0x7C
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var val = getstatic(info, 1);
                frames[current_frame].operand_stack.push(val);
                i += 3;
                break;
            case opcodes.getstatic_s: //0x7D
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var val = getstatic(info, 2);
                frames[current_frame].operand_stack.push(val);
                i += 3;
                break;
            case opcodes.getstatic_i: //0x7E
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var val = getstatic(info, 4);
                var w = opcodes.convertIntegerToWords(val);
                frames[current_frame].operand_stack.push(w[0]);
                frames[current_frame].operand_stack.push(w[1]);
                i += 3;
                break;
            case opcodes.putstatic_a: //0x7F
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var val = frames[current_frame].operand_stack.pop();
                putstatic(info, val, 2);
                i += 3;
                break;
            case opcodes.putstatic_b: //0x80
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var val = frames[current_frame].operand_stack.pop();
                putstatic(info, val, 1);
                i += 3;
                break;
            case opcodes.putstatic_s: //0x81
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var val = frames[current_frame].operand_stack.pop();
                putstatic(info, val, 2);
                i += 3;
                break;
            case opcodes.putstatic_i: //0x82
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var v2 = frames[current_frame].operand_stack.pop();
                var v1 = frames[current_frame].operand_stack.pop();
                var val = (v1 << 8) + v2;
                putstatic(info, val, 4);
                i += 3;
                break;
            case opcodes.getfield_a: //0x83
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].operand_stack.pop();
                var retval = getfield(info, objref);
                frames[current_frame].operand_stack.push(retval);
                i += 2;
                break;
            case opcodes.getfield_b: //0x84
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].operand_stack.pop();
                var retval = getfield(info, objref);
                frames[current_frame].operand_stack.push(retval);
                i += 2;
                break;
            case opcodes.getfield_s: //0x85
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].operand_stack.pop();
                var retval = getfield(info, objref);
                frames[current_frame].operand_stack.push(retval);
                i += 2;
                break;
            case opcodes.getfield_i: //0x86
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].operand_stack.pop();
                var retval = getfield(info, objref);

                var val = opcodes.convertIntegerToWords(retval);
                frames[current_frame].operand_stack.push(val[0]);
                frames[current_frame].operand_stack.push(val[1]);

                i += 2;
                break;
            case opcodes.putfield_a: //0x87
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var val = frames[current_frame].operand_stack.pop();
                var objref = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);
                i += 2;
                break;
            case opcodes.putfield_b: //0x88
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var val = frames[current_frame].operand_stack.pop();
                var objref = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);

                i += 2;
                break;
            case opcodes.putfield_s: //0x89
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var val = frames[current_frame].operand_stack.pop();
                var objref = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);
                i += 2;
                break;
            case opcodes.putfield_i: //0x8A
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();
                var val = (val1 << 8) + val2;
                var objref = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);

                i += 2;
                break;
            case opcodes.invokevirtual: //0x8B
                //iv, indexbyte1, indexbyte2

                frames[current_frame].return_pointer = i + 3;
                var par = [];
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var i0 = info[0];
                var ref = -1;
                var objref;
                var obj;
                var os = 0;
                var index = -1;
                var oref;
                var oheap;
                var heapref;
                var found = false;
                
                if (i0 >= 128) {
                    //external
                    var args = [];
                    i0 -= 128;
                    
                    var mAID = CAPfile.COMPONENT_Import.packages[i0].AID;

                    var na = api.getNumberOfArguments(mAID, info[1], info[2], 3);

                    for (var j = 0; j < na; j++) { args.push(frames[current_frame].operand_stack.pop()); };
                    for (var j = 0; j < na; j++) { par.push(args.pop()); };
                    
                    oref = frames[current_frame].operand_stack.pop();
                    if(oref instanceof Object){
                        obj = oref;
                    } else {
                        var ocls = eeprom.getHeapValue(smartcard.EEPROM, oref);
                        oheap = oref;
                        var clssig = ((i0 << 8) + info[1]);
                        while (!found) {
                            if (160 + clssig == ocls) {
                                found = true;
                                oheap++;
                            } else {
                                for (var j = 0; j < CAPfile.COMPONENT_Class.i_count; j++) {
                                    if (CAPfile.COMPONENT_Class.interface_info[j].start == ocls) {
                                        oheap += CAPfile.COMPONENT_Class.interface_info[j].declared_instance_size + 1;
                                        ocls = eeprom.getHeapValue(smartcard.EEPROM, oheap);
                                        break;
                                    }
                                }
                            }
                        }
                        heapref = eeprom.getHeapValue(smartcard.EEPROM, oheap);
                        obj = eeprom.getObjectHeapValue(smartcard.EEPROM, heapref);
                    }
                    loadAnyArrays(smartcard, par);
                    var apiresult = api.run(mAID, info[1], info[2], 3, par, obj, heapref, smartcard);

                    if(apiresult instanceof Error){
                        throw apiresult;
                    }

                    if(apiresult !== undefined){//if not void
                        if(apiresult.constructor === Array){//if array
                            var hl = eeprom.getHeapSize(smartcard.EEPROM);
                            //eeprom.appendHeap(smartcard.EEPROM, apiresult.length);
                            eeprom.appendHeap(smartcard.EEPROM, apiresult);
                            frames[current_frame].operand_stack.push("#H" + hl);
                        } else if(!apiresult.type) {//if it doesn't have a type, i.e it's not transient
                            frames[current_frame].operand_stack.push(apiresult);
                        } else {
                            //Transient Array
                            //do nothing
                        }
                    }
                    i += 3;
                } else {
                    //internal
                    var clssig = ((i0 << 8) + info[1]);

                    for (var j = 0; j < CAPfile.COMPONENT_Class.i_count; j++) {
                        if (CAPfile.COMPONENT_Class.interface_info[j].start == clssig) {
                            index = j;
                            break;
                        }
                    }


                    var tblindex;
                    //get bytecode offset of method
                    if (info[2] < 128) {
                        tblindex = info[2] - CAPfile.COMPONENT_Class.interface_info[index].public_method_table_base;
                        os = CAPfile.COMPONENT_Class.interface_info[index].public_virtual_method_table[tblindex] - 1;
                    } else {
                        info[2] -= 128;
                        tblindex = info[2] - CAPfile.COMPONENT_Class.interface_info[index].package_method_table_base;
                        os = CAPfile.COMPONENT_Class.interface_info[index].package_virtual_method_table[tblindex] - 1;
                    }

                    var nargs;
                    //Method component
                    if (opcode[os] > 127) {
                        nargs = opcode[os + 2];
                        os += 4;
                    } else {
                        nargs = parseInt(opcodes.pad(opcode[os + 1].toString(16)).slice(0, 1), 16);
                        os += 2;
                    }

                    var args = [];
                    //pop args & obj ref from stack
                    for (var l = 0; l < nargs; l++) { args.push(frames[current_frame].operand_stack.pop()); }

                    //create new stack frame
                    ref = frames.length;
                    frames[ref] = new frame();
                    frames[ref].invoker = current_frame;
                    //push onto new frame local vars
                    for (var l = 0; l < nargs; l++) { frames[ref].local_vars.push(args.pop()); }

                    current_frame = ref;
                    i = os;

                }
                break;
            case opcodes.invokespecial: //0x8C
                var tag = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].tag;
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var i0 = info[0];
                //static method
                var par = [];
                frames[current_frame].return_pointer = i + 3;

                var ref = -1;
                var os = -1;

                var oref;
                var oheap;



                //get the method bytecode offset 
                if (i0 >= 128) {
                    //external - lookup APIs
                    //get import aid
                    i0 -= 128;
                    var args = [];
                    //var rval;
                    var found = false;

                    //get import package AID
                    var mAID = CAPfile.COMPONENT_Import.packages[i0].AID;

                    //get nb of parameters
                    var na = api.getNumberOfArguments(mAID, info[1], info[2], 6);
                    //load params onto array
                    for (var j = 0; j < na; j++) { args[j] = frames[current_frame].operand_stack.pop(); };
                    for (var j = 0; j < na; j++) { par.push(args.pop()); };

                    oref = frames[current_frame].operand_stack.pop();
 
                    var ocls = eeprom.getHeapValue(smartcard.EEPROM, oref);
                    oheap = oref;
                    var clssig = ((i0 << 8) + info[1]);
                    while (!found) {
                        if (160 + clssig == ocls) {//clssig + 160 changed from A + clssig
                            found = true;
                            oheap++;
                        } else {
                            for (var j = 0; j < CAPfile.COMPONENT_Class.i_count; j++) {
                                if (CAPfile.COMPONENT_Class.interface_info[j].start === ocls) {
                                    oheap += CAPfile.COMPONENT_Class.interface_info[j].declared_instance_size + 1;
                                    ocls = eeprom.getHeapValue(smartcard.EEPROM, oheap);
                                    break;
                                }
                            }
                        }

                    }
                    
                    //execute method
                    var heapref = eeprom.getHeapValue(smartcard.EEPROM, oheap);
                    var obj = eeprom.getObjectHeapValue(smartcard.EEPROM, heapref);
                    loadAnyArrays(smartcard, par);
                    var apiresult = api.run(mAID, info[1], info[2], 6, par, obj, heapref, smartcard);

                    if(apiresult instanceof Error){
                        throw apiresult;
                    }
                    //process results

                    var hl = eeprom.getHeapSize(smartcard.EEPROM);

                    if(apiresult !== undefined){//if not void
                        if(apiresult.constructor === Array){//if array
                            frames[current_frame].operand_stack.push("#H" + hl);
                            //eeprom.appendHeap(smartcard.EEPROM, apiresult.length);
                            eeprom.appendHeap(smartcard.EEPROM, apiresult);
                            //newHeap(hv);
                        } else if(!apiresult.type) {//if it doesn't have a type, i.e it's not transient
                            frames[current_frame].operand_stack.push(apiresult);
                        } else {
                            //Transient Array
                            //do nothing
                        }
                    }
                    i += 3;
                } else {
                    //internal - 
                    os = (info[1] << 8) + info[2] - 1;


                    //create new stack frame
                    var args = [];
                    ref = frames.length;
                    frames[ref] = new frame();
                    frames[ref].invoker = current_frame;

                    var nargs;
                    //Method component
                    if (opcode[os] > 127) {
                        nargs = opcode[os + 2];
                        os += 4;
                    } else {
                        nargs = parseInt(opcodes.pad(opcode[os + 1].toString(16)).slice(0, 1), 16);
                        os += 2;
                    }

                    //pop args & obj ref from stack
                    for (var l = 0; l < nargs; l++) {
                        args.push(frames[current_frame].operand_stack.pop());
                    }
                    
                    //push onto new frame local vars
                    for (var l = 0; l < nargs; l++) {
                        frames[ref].local_vars.push(args.pop());
                    }

                    current_frame = ref;
                    i = os;
                }
                break;
            case opcodes.invokestatic: //0x8D
                var tag = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].tag;
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var i0 = info[0];
                //static method
                var par = [];
                frames[current_frame].return_pointer = i + 3;

                var ref = -1;
                var os = -1;

                //get the method bytecode offset 
                if (i0 >= 128) {
                    //external - lookup APIs
                    //get import aid
                    i0 -= 128;
                    var args = [];

                    var mAID = CAPfile.COMPONENT_Import.packages[i0].AID;

                    var na = api.getNumberOfArguments(mAID, info[1], info[2], 6);
                    for (var j = 0; j < na; j++) { args.push(frames[current_frame].operand_stack.pop()); };
                    for (var j = 0; j < na; j++) { par.push(args.pop()); };
                    loadAnyArrays(smartcard, par);
                    console.log(i);
                    var apiresult = api.run(mAID, info[1], info[2], 6, par, null, null, smartcard);

                    if(apiresult instanceof Error){
                        throw apiresult;
                    }
                    var hl = eeprom.getHeapSize(smartcard.EEPROM);

                    if(apiresult !== undefined){//if not void
                        if(apiresult.constructor === Array){//if array
                            //New Persistent Array
                            //eeprom.appendHeap(smartcard.EEPROM, apiresult.length);
                            eeprom.appendHeap(smartcard.EEPROM, apiresult);
                            frames[current_frame].operand_stack.push("#H" + hl);
                        } else if(!apiresult.transientArray) {//if it doesn't have a typ, i.e it's not transient
                            frames[current_frame].operand_stack.push(apiresult);
                        } else {
                            //New Transient Array
                            frames[current_frame].operand_stack.push("T" + ram.getTransientData(smartcard.RAM).length + "#" + apiresult.array.length + "#" + par[1]);
                            //for (var j = 0; j < apiresult.array.length; j++) {
                            ram.pushTransientData(smartcard.RAM, apiresult.array);
                            //}
                            //break;
                        }
                    }
                    i += 3;
                } else {
                    //internal
                    os = (info[1] << 8) + info[2] - 1;

                    //create new stack frame
                    var args = [];
                    ref = frames.length;
                    frames[ref] = new frame();
                    frames[ref].invoker = current_frame;
                    var nargs;
                    //Method component
                    if (opcode[os] > 127) {
                        nargs = opcode[os + 2];
                        os += 4;
                    } else {
                        nargs = parseInt(opcodes.pad(opcode[os + 1].toString(16)).slice(0, 1), 16);
                        os += 2;
                    }

                    //pop args & obj ref from stack
                    for (var l = 0; l < nargs - 1; l++) { args.push(frames[current_frame].operand_stack.pop()); }

                    //push onto new frame local vars
                    for (var l = 0; l < args.length; l++) { frames[ref].local_vars.push(args.pop()); }
                    current_frame = ref;
                    i = os;
                }
                break;
            case opcodes.invokeinterface: //0x8E
                //invokeinterface, nargs, ind1, ind2, method
                var nargs = opcode[i + 1];
                var classRef = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 2] << 8) + opcode[i + 3]].info;
                var packageAID = CAPfile.COMPONENT_Import.packages[(classRef[0] >= 128 ? classRef[0] - 128 : classRef[0])].AID;
                var classToken = classRef[1];
                var typeToken = classRef[2];
                var class_offset = (info[0] << 8) + info[1];
                var methodToken = opcode[i + 4];
                var args = frames[current_frame].operand_stack.slice(-(nargs-1));
                loadAnyArrays(smartcard, args);
                frames[current_frame].operand_stack.length = frames[current_frame].operand_stack.length - (nargs -1);
                var object = frames[current_frame].operand_stack.pop();

                var apiresult = api.run(packageAID, classToken, methodToken, typeToken, args, object, null, smartcard);
                i+=4;

                break;
            case opcodes.new_v: //0x8F

                //new, ind1, ind2
                var ref = eeprom.getHeapSize(smartcard.EEPROM);
                

                var done = false;
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                //var hv = "";

                while (!done) {

                    if (info[0] < 128) {
                        //get class
                        var offset = (info[0] << 8) + info[1];
                        var clsno;
                        for (var j = 0; j < CAPfile.COMPONENT_Class.i_count; j++) {
                            if (CAPfile.COMPONENT_Class.interface_info[j].start == offset) {
                                //allocate space on the heap
                                clsno = j;
                                var dis = CAPfile.COMPONENT_Class.interface_info[j].declared_instance_size;
                                //hv += ","+offset;
                                eeprom.appendHeap(smartcard.EEPROM, offset);
                                
                                //for (var k = 0; k < dis; k++) { hv += ",0"; }
                                for (var k = 0; k < dis; k++) { eeprom.appendHeap(smartcard.EEPROM, 0); }
                                
                                info[0] = CAPfile.COMPONENT_Class.interface_info[j].super_class_ref1;
                                info[1] = CAPfile.COMPONENT_Class.interface_info[j].super_class_ref2;

                                break;
                            }
                        }

                    } else {
                        var clsno = ((info[0] - 128) << 8) + info[1];
                        //hv += ",A"+clsno+","+objectheap.length;
                        eeprom.appendHeap(smartcard.EEPROM, 160+clsno);
                        eeprom.appendHeap(smartcard.EEPROM, eeprom.getObjectHeap(smartcard.EEPROM).length);
                        if ((info[1] == 3) && (CAPfile.COMPONENT_Import.packages[info[0] - 128].AID.join() === opcodes.jframework.join())) {
                            ram.setGRef(smartcard.RAM, ref);
                        }

                        eeprom.appendObjectHeap(smartcard.EEPROM, api.newObject(CAPfile.COMPONENT_Import.packages[info[0] - 128].AID, info[1]));
                        done = true;
                    }
                }

                //newHeap(hv);
                frames[current_frame].operand_stack.push(ref);
                i += 3;
                break;
            case opcodes.newarray: //0x90
                //newarray, atype
                var count = frames[current_frame].operand_stack.pop();
                var atype = opcode[i + 1];
                var ref = eeprom.getHeapSize(smartcard.EEPROM);
                if (count < 0) { executeBytecode.exception_handler(jlang,6,"");}

                //allocate space on heap
               // var heapspace = [];
                eeprom.appendHeap(smartcard.EEPROM, count);
                for (var j = 0; j < count; j++) {
                   eeprom.appendHeap(smartcard.EEPROM, 0);
                };
                //newHeap(hv);
                //push ref onto operand stack

                frames[current_frame].operand_stack.push(ref);

                i += 2;
                break;
            case opcodes.anewarray: //0x91
                var index = (opcode[i + 1] << 8) + opcode[i + 2];
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[index].info.slice(0);
                var count = opcodes.ShortToValue(frames[current_frame].operand_stack().pop());
                if (count < 0) { executeBytecode.exception_handler(jlang,6,""); }
                var dis = 0;
                //var ref = heap.length;

                var done = false;
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var hv = "";
                var tv = [];
                var totalsize = 0;
                while (!done) {

                    if (info[0] < 128) {
                        //get class
                        var offset = (info[0] << 8) + info[1];
                        var clsno;
                        for (var j = 0; j < CAPfile.COMPONENT_Class.i_count; j++) {
                            if (CAPfile.COMPONENT_Class.interface_info[j].start == offset) {
                                //allocate space on the heap
                                clsno = j;
                                var dis = CAPfile.COMPONENT_Class.interface_info[j].declared_instance_size;
                                tv.push(offset);

                                for (var k = 0; k < dis; k++) { tv.push(0); }

                                info[0] = CAPfile.COMPONENT_Class.interface_info[j].super_class_ref1;
                                info[1] = CAPfile.COMPONENT_Class.interface_info[j].super_class_ref2;

                                break;
                            }
                        }

                    } else {
                        var clsno = ((info[0] - 128) << 8) + info[1];
                        //tv += ",A" + clsno + "," + objectheap.length;
                        tv.push(160+clsno);
                        tv.push(eeprom.getObjectHeap(smartcard.EEPROM).length);
                        if ((info[1] == 3) && (CAPfile.COMPONENT_Import.packages[info[0] - 128].AID.join() === jframework.join())) { ram.setGRef(smartcard.RAM, ref); };

                        eeprom.appendObjectHeap(smartcard.EEPROM, api.newObject(CAPfile.COMPONENT_Import.packages[info[0] - 128].AID, info[1]));
                        done = true;
                    }
                }

                var ref = eeprom.getHeapSize(smartcard.EEPROM);

                //var hv = "," + count;
                eeprom.appendHeap(smartcard.EEPROM, count);
                var ival = 0;
                for (var j = 0; j < count; j++) {
                    ival = ref + dis * (j + 1) + 1;
                    eeprom.appendHeap(smartcard.EEPROM, ival);
                    //hv += "," + ival;
                }

                for (var j = 0; j < count; j++) {
                    //hv += ","+ dis;
                    //hv += tv;
                    eeprom.appendHeap(smartcard.EEPROM, tv);
                }
                //newHeap(hv);
                frames[current_frame].operand_stack.push(ref);
                i += 3;
                break;
            case opcodes.arraylength: //0x92
                var arref = frames[current_frame].operand_stack.pop();
                if (arref == null) { executeBytecode.exception_handler(jlang,6,""); }
                var ar = eeprom.getHeapValue(smartcard.EEPROM, arref);
                if (ar.slice(0, 2) == "#H") {
                    ar = eeprom.getHeapValue(Number(ar.split("#H")[1])).length;
                }

                frames[current_frame].operand_stack.push(ar);
                i++;
                break;
            case opcodes.athrow: //0x93
                var objref = frames[current_frame].operand_stack.pop();
                var oheap = eeprom.getHeapValue(smartcard.EEPROM, objref);
                //search for catch clause
                if(oheap.slice(0,1) == "A") {
                    var ncls = Number(oheap.slice(1));
                    var pk = 0
                    while (ncls > 255) { ncls -= 256; pk++; }
                    executeBytecode.exception_handler(CAPfile.COMPONENT_Import.packages[pk].AID,ncls,"");
                } else {executeBytecode.exception_handler(jlang, 2, "");}
    
                i++;
                break;
            case opcodes.checkcast: //0x94 !!!!!!!!!!!!!NOT IMPLEMENTED
            //    var objref = frames[current_frame].operand_stack.pop();
            //    frames[current_frame].operand_stack.push(1);
                i += 4;
                break;
            //case instanceof_v: //0x95 !!!!!!!!!!!!!NOT IMPLEMENTED
            //    var objref = frames[current_frame].operand_stack.pop();
            //    frames[current_frame].operand_stack.push(1);
            //    //search for catch clause
            //    i += 4;
            //    break;
            case opcodes.sinc_w: //0x96
                var index = opcode[i + 1];
                var byte = (opcode[i + 2] << 8) + opcode[i + 3];
                frames[current_frame].local_vars[index] += byte;
                i += 4;
                break;
            case opcodes.iinc_w: //0x97
                var index = opcode[i + 1];
                var byte = (opcode[i + 2] << 8) + opcode[i + 3];
                var inc = opcodes.convertIntegerToWords(frames[current_frame].local_vars[index] * opcodes.short_s + frames[current_frame].local_vars[index + 1] + byte);
                frames[current_frame].local_vars[index] = inc[0];
                frames[current_frame].local_vars[index + 1] = inc[1];
                i += 4;
                break;
            case opcodes.ifeq_w: //0x98
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val = opcodes.ShortToValue(frames[current_frame].operand_stack.pop());

                if (val == 0) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.ifne_w: //0x99
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val = opcodes.ShortToValue(frames[current_frame].operand_stack.pop());

                if (val != 0) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.iflt_w: //0x9A
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val = opcodes.ShortToValue(frames[current_frame].operand_stack.pop());

                if (val < 0) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.ifge_w: //0x9B
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val = opcodes.ShortToValue(frames[current_frame].operand_stack.pop());

                if (val >= 0) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.ifgt_w: //0x9C
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val = opcodes.ShortToValue(frames[current_frame].operand_stack.pop());

                if (val > 0) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.ifle_w: //0x9D
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val = opcodes.ShortToValue(frames[current_frame].operand_stack.pop());

                if (val < 0) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.ifnull_w: //0x9E
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val = frames[current_frame].operand_stack.pop();

                if (val == null) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.ifnonnull_w: //0x9F
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val = frames[current_frame].operand_stack.pop();

                if (val != null) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.if_acmpeq_w: //0xA0
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 == val2) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.if_acmpne_w: //0xA1
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 != val2) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.if_scmpeq_w: //0xA2
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val == val2) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.if_scmpne_w: //0xA3
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 != val2) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.if_scmplt_w: //0xA4
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 < val2) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.if_scmpge_w: //0xA5
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 >= val2) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.if_scmpgt_w: //0xA6
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 > val2) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.if_scmple_w: //0xA7
                var branch = opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();

                if (val1 >= val2) {
                    i += branch;
                } else {
                    i += 3;
                }
                break;
            case opcodes.goto_w: //0xA8
                i += opcodes.ShortToValue((opcode[i + 1] << 8) + opcode[i + 2]);
                break;
            case opcodes.getfield_a_w: //0xA9
                var objref = frames[current_frame].operand_stack.pop();
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var retval = getfield(info, objref);
                frames[current_frame].operand_stack.push(retval);
                i += 3;
                break;
            case opcodes.getfield_b_w: //0xAA
                var objref = frames[current_frame].operand_stack.pop();
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var retval = getfield(info, objref);
                frames[current_frame].operand_stack.push(retval);
                i += 3;
                break;
            case opcodes.getfield_s_w: //0xAB
                var objref = frames[current_frame].operand_stack.pop();
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var retval = getfield(info, objref);
                frames[current_frame].operand_stack.push(retval);
                i += 3;
                break;
            case opcodes.getfield_i_w: //0xAC
                var objref = frames[current_frame].operand_stack.pop();
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var retval = getfield(info, objref);

                var val = opcodes.convertIntegerToWords(retval);
                frames[current_frame].operand_stack.push(val[0]);
                frames[current_frame].operand_stack.push(val[1]);
                i += 3;
                break;
            case opcodes.getfield_a_this: //0xAD

                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].local_vars[0];

                var retval = getfield(info, objref);
                frames[current_frame].operand_stack.push(retval);

                i += 2;
                break;
            case opcodes.getfield_b_this: //0xAE
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].local_vars[0];
                
                var retval = getfield(info, objref);
                frames[current_frame].operand_stack.push(retval);
                i += 2;
                break;
            case opcodes.getfield_s_this: //0xAF
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].local_vars[0];

                var retval = getfield(info, objref);
                frames[current_frame].operand_stack.push(retval);
                i += 2;
                break;
            case opcodes.getfield_i_this: //0xB0
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].local_vars[0];

                var retval = getfield(info, objref);

                var val = opcodes.convertIntegerToWords(retval);
                frames[current_frame].operand_stack.push(val[0]);
                frames[current_frame].operand_stack.push(val[1]);
                i += 2;
                break;
            case opcodes.putfield_a_w: //0xB1
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var val = frames[current_frame].operand_stack.pop();
                var objref = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);
                i += 3;
                break;
            case opcodes.putfield_b_w: //0xB2
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var val = frames[current_frame].operand_stack.pop();
                var objref = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);
                i += 3;
                break;
            case opcodes.putfield_s_w: //0xB3
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var val = frames[current_frame].operand_stack.pop();
                var objref = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);
                i += 3;
                break;
            case opcodes.putfield_i_w: //0xB4

                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[(opcode[i + 1] << 8) + opcode[i + 2]].info.slice(0);
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();
                var val = (val1 << 8) + val2;
                var objref = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);

                i += 3;
                break;
            case opcodes.putfield_a_this: //0xB5
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].local_vars[0];
                var val = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);
                i += 2;
                break;
            case opcodes.putfield_b_this: //0xB6
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].local_vars[0];
                var val = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);
                i += 2;
                break;
            case opcodes.putfield_s_this: //0xB7
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].local_vars[0];
                var val = frames[current_frame].operand_stack.pop();

                putfield(info, val, objref);
                i += 2;
                break;
            case opcodes.putfield_i_this: //0xB8
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[opcode[i + 1]].info.slice(0);
                var objref = frames[current_frame].local_vars[0];
                var val2 = frames[current_frame].operand_stack.pop();
                var val1 = frames[current_frame].operand_stack.pop();
                var val = (val1 << 8) + val2;

                putfield(info,val,objref);

                i += 2;
                break;
            default: alert("Unsupported Bytecode " + opcode[i].toString(16));



        }
            if ((current_frame < 0) || (gSW.length > 0)) { ctu = false; };
        //Text1.value = Text1.value + "(" + current_frame + ") ; lvar " + frames[current_frame].local_vars + "; os " + frames[current_frame].operand_stack + "; " + heap.length + "\n";
   }
        


        function getstatic(info, size) {
            var barr = []
            //convertToBytes(val, size);
            var offset = (info[1] << 8) + info[2];
 
            var sf = readStaticField().split(",");

            for (var j = 0; j < size; j++) {
                barr[j] = sf[offset + j];
            };

            return opcodes.convertFromBytes(barr);
        }



        function putstatic(info,val,size) {

            var barr = opcodes.convertToBytes(val, size);
            var offset = (info[1] << 8) + info[2];
            var sf = readStaticField().split(",");

            for (var j = 0; j < size; j++) {
                sf[offset + j] = barr[j];
            };

            var opstr = "";
            for (var j = 0; j < sf.length - 1; j++) {
                opstr += sf[j] + ",";
            }
            writeStaticField(opstr);
        }




        function getfield(info,objref) {

            var infoclass = (info[0] << 8) + info[1];
            if (objref == null) { executeBytecode.exception_handler(jlang,7,""); };
            var bfound = false;
            var oheap = objref;
            var retval;
            var dis;
            var jf;
            
            //assume internal
            var refclass = eeprom.getHeapValue(smartcard.EEPROM, objref);
            while (!bfound) {
                //get object field size
                if (refclass == infoclass) {
                    bfound = true;
                    retval = eeprom.getHeapValue(smartcard.EEPROM, oheap + info[2] + 1);
                } else {

                    for (var j = 0; j < CAPfile.COMPONENT_Class.i_count; j++) {
                        if (CAPfile.COMPONENT_Class.interface_info[j].start == refclass) {
                            jf = j;
                            break;
                        }
                    }
                    oheap += CAPfile.COMPONENT_Class.interface_info[jf].declared_instance_size + 1;
                    refclass = (CAPfile.COMPONENT_Class.interface_info[jf].super_class_ref1 << 8) +
                        CAPfile.COMPONENT_Class.interface_info[jf].super_class_ref2;
                }

            }
            return retval;
            
        }
            

        function putfield(info, val, objref) {

            var infoclass = (info[0] << 8) + info[1];
            if (objref == null) { executeBytecode.exception_handler(jlang,7,""); };
            var bfound = false;
            var oheap = objref;
            var dis;
            var jf;

            //assume internal
            var refclass = eeprom.getHeapValue(smartcard.EEPROM, objref);
            while (!bfound) {
                //get object field size
                if (refclass === infoclass) {
                    bfound = true;
                    eeprom.setHeapValue(smartcard.EEPROM, oheap + info[2] + 1, val);
                } else {
                    for (var j = 0; j < CAPfile.COMPONENT_Class.i_count; j++) {
                        if (CAPfile.COMPONENT_Class.interface_info[j].start == refclass) {
                            jf = j;
                            break;
                        }
                    }
                    oheap += CAPfile.COMPONENT_Class.interface_info[jf].declared_instance_size + 1;
                    refclass = (CAPfile.COMPONENT_Class.interface_info[jf].super_class_ref1 << 8) +
                        CAPfile.COMPONENT_Class.interface_info[jf].super_class_ref2;
                }
            }
        }

        

        executeBytecode.exception_handler = function (throwpk, throwtype, reason) {

            var ehs = CAPfile.COMPONENT_Method.exception_handlers;
            var ehc = CAPfile.COMPONENT_Method.handler_count;
            var bfound = false;
            var hoffset = 0;
            var realtype;
            

            for (var j = 0; j < ehc; j++) {
                //get class ref
                var info = CAPfile.COMPONENT_ConstantPool.constant_pool[ehs[j].catch_type_index].info.slice(0);
                info[0] -= 128;
                handlertype = info[1];
                //check correct package and bytecode range
                
                if((i >= ehs[j].start_offset) && (i < (ehs[j].start_offset + ehs[j].active_length)) && (ehs[j].catch_type_index > 0)) {

                    var handlerpk = CAPfile.COMPONENT_Import.packages[info[0]].AID;
                    if ((handlerpk.join() === throwpk.join()) && (handlertype.join() === throwtype.join())) { bfound = true; }
                    if (handlerpk.join() === jlang.join()) {
                        switch (handlertype) {
                            case 2: bfound = true; break;
                            case 3: if (throwtype > 2) { bfound = true; }; break;
                            case 4: if ((throwtype == 5) && (handlerpk.join() === throwpk.join())) { bfound = true; }; break;
                        }
                    } else if (handlerpk.join() === jframework.join()) {
                        switch (handlertype) {
                            case 5: if ((handlerpk.join() === throwpk.join()) && (throwtype>5) && (throwtype<16)) { bfound = true; }; break;
                            case 4: if ((throwtype == 16) && (handlerpk.join() === throwpk)) { bfound = true; }; break;
                         }
                    }

                    if (bfound) { hoffset = ehs[j].handler_offset; break;}
                }
            };

            if (bfound) { i = hoffset-1;
            } else {
                switch (throwpk.join()) {
                    case jframework.join():
                        switch (throwtype) {
                            case 4:
                                CardException.throwIt(reason); break;
                            case 5:
                                CardRuntimeException.throwIt(reason); break;
                            case 7:
                                ISOException.throwIt(reason); break;
                            case 11:
                                PINException.throwIt(reason); break;
                            case 12:
                                APDUException.throwIt(reason); break;
                            case 13:
                                SystemException.throwIt(reason); break;
                            case 14:
                                TransactionException.throwIt(reason); break;
                            case 15:
                                UserException.throwIt(reason); break;
                            default:
                                Exception.throwIt(reason); break;
                        }
                    case jlang.join():
                        switch (throwtype) {
                            case 1:
                                Throwable.throwIt(reason); break;
                            case 2:
                                Exception.throwIt(reason); break;
                            case 3:
                                RuntimeException.throwIt(reason); break;
                            case 4:
                                IndexOutOfBoundsException.throwIt(reason); break;
                            case 5:
                                ArrayIndexOutOfBoundsException.throwIt(reason); break;
                            case 6:
                                NegativeArraySizeException.throwIt(reason); break;
                            case 7:
                                NullPointerException.throwIt(reason); break;
                            case 8:
                                ClassCastException.throwIt(reason); break;
                            case 9:
                                ArithmeticException.throwIt(reason); break;
                            case 10:
                                SecurityException.throwIt(reason); break;
                            case 11:
                                ArrayStoreException.throwIt(reason); break;
                            default:
                                Exception.throwIt(reason); break;
                        }
                    default:
                        Exception.throwIt(reason); break;
                }
            }
            
        }
        
}

function loadArray(smartcard, parameter){
    var references;
    if(typeof parameter == 'string' ||
        parameter instanceof String){
        if (parameter.toString().slice(0, 2) == "#H") {
            references = parameter.split('#H');
            return eeprom.getHeapValue(smartcard.EEPROM, Number(references[1]));
        } else if (parameter.toString().slice(0, 1) == "T"){
            references = parameter.slice(1).split("#");
            if(smartcard.RAM.transient_data[Number(references[0])] === undefined){
                smartcard.RAM.transient_data[Number(references[0])] = [];
            }
            return smartcard.RAM.transient_data[Number(references[0])];
        }
    }
    return parameter;
}
function loadAnyArrays(smartcard, parameters){
    for(var i = 0; i< parameters.length; i++){
        parameters[i] = loadArray(smartcard, parameters[i]);
    }
}

exports.executeBytecode = executeBytecode;