var api = require('./api.js');
var mnemonics = require('../utilities/mnemonics.js');
var eeprom = require('../smartcard/eeprom.js');
var ram = require('../smartcard/ram.js');
var ins = require('./instruction-functions.js');
var utilities = require('../utilities/utilities.js');
var cap = require('../smartcard/cap.js');
var ISO7816 = require('../javacard/framework/ISO7816.js');

//JCVM

module.exports = {
    /**
     * Sets up execution environment for standard APDU command and pushes
     * executeBytecode function call onto event loop.
     *
     * @param  {SmartCard} smartcard The SmartCard object.
     * @param  {Array}     params
     * @param  {Function}  cb       Called by executeBytecode
     */
    process: function(smartcard, params, cb){
        var capFile = smartcard.EEPROM.selectedApplet.CAP;
        var appletReference = smartcard.EEPROM.selectedApplet.appletRef;
        var i = cap.getStartCode(capFile, smartcard.EEPROM.selectedApplet.AID, 7) - 1;
        var opcodes = capFile.COMPONENT_Method.method_info;
        if (opcodes[i] > 127) {
            i += 4;
        } else {
            i += 2;
        }
        var currentFrame = 0;
        var frames = [];
        frames[currentFrame] = new this.Frame();

        frames[currentFrame].local_vars.push(Number(appletReference));
        frames[currentFrame].local_vars.push(params[0]);

        setImmediate(function() {
            executeBytecode(smartcard, capFile, i, frames, currentFrame, cb);
        });
    },

    /**
     * Sets up execution environment for select applet APDU command and pushes
     * executeBytecode function call onto event loop.
     *
     * @param  {SmartCard} smartcard The SmartCard object.
     * @param  {Array}     params
     * @param  {Function}  cb        Called by executeBytecode.
     */
    selectApplet: function(smartcard, cb){
        var capFile = smartcard.EEPROM.selectedApplet.CAP;
        var appletReference = smartcard.EEPROM.selectedApplet.appletRef;
        var i = cap.getStartCode(capFile, smartcard.EEPROM.selectedApplet.AID, 6) - 1;
        var opcodes = capFile.COMPONENT_Method.method_info;
        if (opcodes[i] > 127) {
            i += 4;
        } else {
            i += 2;
        }
        var currentFrame = 0;
        var frames = [];
        frames[currentFrame] = new this.Frame();
        frames[currentFrame].local_vars.push(Number(appletReference));

        setImmediate(function() {
            executeBytecode(smartcard, capFile, i, frames, currentFrame, cb);
        });
    },

    /**
     * Sets up execution environment for create instance APDU command and pushes
     * executeBytecode function call onto event loop.
     *
     * @param  {SmartCard} smartcard The SmartCard object.
     * @param  {CAPfile}   capFile   CAPfile of package to creat instance of.
     * @param  {Array}     params
     * @param  {Number}    appletRef
     * @param  {Function}  cb        Called by executeBytecode.
     */
    createInstance: function(smartcard, capFile, params, appletRef, cb){
        var i = capFile.COMPONENT_Applet.applets[appletRef].install_method_offset - 1;
        var opcodes = capFile.COMPONENT_Method.method_info;
        if (opcodes[i] > 127) {
            i += 4;
        } else {
            i += 2;
        }
        var currentFrame = 0;
        var frames = [];
        frames[currentFrame] = new this.Frame();

        var address = smartcard.EEPROM.heap.length;
        //stores buffer on the heap
        eeprom.pushToHeap(smartcard, params[0]);
        frames[currentFrame].local_vars.push("#H" + address);
        frames[currentFrame].local_vars.push(params[1]);
        frames[currentFrame].local_vars.push(params[2]);

        setImmediate(function() {
            executeBytecode(smartcard, capFile, i, frames, currentFrame, cb);
        });

    },

    /**
     * Frame constructor
     * @constructor
     */
    Frame: function (){
        this.local_vars = [];
        this.operand_stack = [];
        this.invoker = -1;
        this.return_pointer = 0;
    }
};

/**
 * Executes a single Opcode instruction, opcodes[i].
 * This function should only be called by wrapping inside setImmediate to
 * ensure that it does not block the event loop.
 *
 * @param  {SmartCard}  smartcard
 * @param  {CAPfile}    capFile
 * @param  {Number}     i         The instruction pointer
 * @param  {Array}      frames
 * @param  {Number}     currentFrame
 * @param  {Function}   cb
 */
function executeBytecode(smartcard, capFile, i, frames, currentFrame, cb){
    var opcodes = capFile.COMPONENT_Method.method_info;
    var operandStack = frames[currentFrame].operand_stack;
    var localVariables = frames[currentFrame].local_vars;
    var invoker = frames[currentFrame].invoker;
    var constantPool = capFile.COMPONENT_ConstantPool.constant_pool;
    var heap = smartcard.EEPROM.heap;//should not be used for writing to heap
    var tempOperands;
    var tempValue;
    var apiresult;
    var words, params;
    var v, w, v1, v2, v1w1, v1w2, v2w1, v2w2, val, val1, val2, vres, sa;
    var res, lc, branch;
    var info, objref, retval;

    switch (opcodes[i]) {
        case mnemonics.nop: //0x0
            i++; break;
        case mnemonics.aconst_null: //0x01
            operandStack.push(null);
            i++; break;
        case mnemonics.sconst_m1: //0x02
            operandStack.push(mnemonics.short_s - 1);
            i++; break;
        case mnemonics.sconst_0: //0x03
            operandStack.push(0);
            i++; break;
        case mnemonics.sconst_1: //0x04
            operandStack.push(1);
            i++; break;
        case mnemonics.sconst_2: //0x05
            operandStack.push(2);
            i++; break;
        case mnemonics.sconst_3: //0x06
            operandStack.push(3);
            i++; break;
        case mnemonics.sconst_4: //0x07
            operandStack.push(4);
            i++; break;
        case mnemonics.sconst_5: //0x08
            operandStack.push(5);
            i++; break;
        case mnemonics.iconst_m1: //0x09
            pushOperands(operandStack, [mnemonics.short_s - 1, mnemonics.short_s - 1]);
            i++; break;
        case mnemonics.iconst_0: //0x0A
            pushOperands(operandStack, [0,0]);
            i++; break;
        case mnemonics.iconst_1: //0x0B
            pushOperands(operandStack, [0,1]);
            i++; break;
        case mnemonics.iconst_2: //0x0C
            pushOperands(operandStack, [0,2]);
            i++; break;
        case mnemonics.iconst_3: //0x0D
            pushOperands(operandStack, [0,3]);
            i++; break;
        case mnemonics.iconst_4: //0x0E
            pushOperands(operandStack, [0,4]);
            i++; break;
        case mnemonics.iconst_5: //0x0F
            pushOperands(operandStack, [0,5]);
            i++; break;
        case mnemonics.bspush: //0x10 //bspush, byte
            operandStack.push(utilities.byteToShort(opcodes[i + 1]));
            i += 2; break;
        case mnemonics.sspush: //0x11 //bspush, byte1, byte2
            operandStack.push((opcodes[i + 1] << 8) + opcodes[i + 2]);
            i += 3; break;
        case mnemonics.bipush: //0x12 //bipush, byte
            tempOperands = utilities.convertIntegerToWords(utilities.byteToInt(opcodes[i + 1], 16));
            pushOperands(operandStack, tempOperands);
            i += 2; break;
        case mnemonics.sipush: //0x13 //bipush, byte1, byte2
            tempOperands = utilities.convertIntegerToWords(utilities.shortToInt((opcodes[i + 1] << 8) + opcodes[i + 2]));
            pushOperands(operandStack, tempOperands);
            i += 3; break;
        case mnemonics.iipush: //0x14 //iipush, byte1, byte2, byte3, byte4
            operandStack.push((opcodes[i + 1] << 24) + (opcodes[i + 2] << 16) +
                (opcodes[i + 3] << 8) + opcodes[i + 4]);
            i += 5; break;
        case mnemonics.aload: //0x15 //aload, index
            operandStack.push(localVariables[opcodes[i + 1]]);
            i += 2; break;
        case mnemonics.sload: //0x16
            operandStack.push(localVariables[opcodes[i + 1]]);
            i += 2; break;
        case mnemonics.iload: //0x17 //iload, index
            tempOperands = localVariables.slice(opcodes[i+1], opcodes[i+1] + 2);
            pushOperands(operandStack, tempOperands);
            i += 2; break;
        case mnemonics.aload_0: //0x18
            operandStack.push(localVariables[0]);
            i++; break;
        case mnemonics.aload_1: //0x19
            operandStack.push(localVariables[1]);
            i++; break;
        case mnemonics.aload_2: //0x1A
            operandStack.push(localVariables[2]);
            i++; break;
        case mnemonics.aload_3: //0x1B
            operandStack.push(localVariables[3]);
            i++; break;
        case mnemonics.sload_0: //0x1C
            operandStack.push(localVariables[4]);
            i++; break;
        case mnemonics.sload_1: //0x1D
            operandStack.push(localVariables[1]);
            i++; break;
        case mnemonics.sload_2: //0x1E
            operandStack.push(localVariables[2]);
            i++; break;
        case mnemonics.sload_3: //0x1F
            operandStack.push(localVariables[3]);
            i++; break;
        case mnemonics.iload_0: //0x20
            pushOperands(operandStack, localVariables.slice(0,2));
            i++; break;
        case mnemonics.iload_1: //0x21
            pushOperands(operandStack, localVariables.slice(1,3));
            i++; break;
        case mnemonics.iload_2: //0x22
            pushOperands(operandStack, localVariables.slice(2,4));
            i++; break;
        case mnemonics.iload_3: //0x23
            pushOperands(operandStack, localVariables.slice(3,5));
            i++; break;
        case mnemonics.aaload: //0x24
            operandStack.push(ins.xaload(smartcard, operandStack));
            i++; break;
        case mnemonics.baload: //0x25
            operandStack.push(utilities.byteToShort(ins.xaload(smartcard, operandStack)));
            i++; break;
        case mnemonics.saload: //0x26
            operandStack.push(ins.xaload(smartcard, operandStack));
            i++; break;
        case mnemonics.iaload: //0x27
            pushOperands(operandStack,
                utilities.convertIntegerToWords(ins.xaload(smartcard, operandStack)));
            i++; break;
        case mnemonics.astore: //0x28 //astore, index
            localVariables[opcodes[i + 1]] = operandStack.pop();
            i += 2; break;
        case mnemonics.sstore: //0x29 //sstore, index
            localVariables[opcodes[i + 1]] = operandStack.pop();
            i += 2; break;
        case mnemonics.istore: //0x2A //istore, index
            localVariables[opcodes[i + 1] + 1] = operandStack.pop();
            localVariables[opcodes[i + 1]] = operandStack.pop();
            i += 2; break;
        case mnemonics.astore_0: //0x2B
            localVariables[0] = operandStack.pop();
            i++; break;
        case mnemonics.astore_1: //0x2C
            localVariables[1] = operandStack.pop();
            i++; break;
        case mnemonics.astore_2: //0x2D
            localVariables[2] = operandStack.pop();
            i++; break;
        case mnemonics.astore_3: //0x2E
            localVariables[3] = operandStack.pop();
            i++; break;
        case mnemonics.sstore_0: //0x2F
            localVariables[0] = operandStack.pop();
            i++; break;
        case mnemonics.sstore_1: //0x30
            localVariables[1] = operandStack.pop();
            i++; break;
        case mnemonics.sstore_2: //0x31
            localVariables[2] = operandStack.pop();
            i++; break;
        case mnemonics.sstore_3: //0x32
            localVariables[3] = operandStack.pop();
            i++; break;
        case mnemonics.istore_0: //0x33
            ins.istore(operandStack, localVariables, 1);//TODO -> check if should be 0?
            i++; break;
        case mnemonics.istore_1: //0x34
            ins.istore(operandStack, localVariables, 2);
            i++; break;
        case mnemonics.istore_2: //0x35
            ins.istore(operandStack, localVariables, 2);
            i++; break;
        case mnemonics.istore_3: //0x36
            ins.istore(operandStack, localVariables, 3);
            i++; break;
        case mnemonics.aastore: //0x37
            ins.xastore(smartcard, operandStack);
            i++; break;
        case mnemonics.bastore: //0x38 update byte array index
            ins.xastore(smartcard, operandStack);
            i++; break;
        case mnemonics.sastore: //0x39
            ins.xastore(smartcard, operandStack);
            i++; break;
        case mnemonics.iastore: //0x3A
            ins.iastore(smartcard, operandStack);
            i++; break;
        case mnemonics.pop: //0x3B
            operandStack.pop();
            i++; break;
        case mnemonics.pop2: //0x3C
            operandStack.pop(); operandStack.pop();
            i++; break;
        case mnemonics.dup: //0x3D
            w = operandStack.pop();
            operandStack.push(w); operandStack.push(w);
            i++; break;
        case mnemonics.dup2: //0x3E
            v1 = operandStack.pop();
            v2 = operandStack.pop();
            operandStack.push(v2); operandStack.push(v1);
            operandStack.push(v2); operandStack.push(v1);
            i++; break;
        case mnemonics.dup_x: //0x3F
            ins.dupX(operandStack, opcodes[i + 1]);
            i += 2; break;
        case mnemonics.swap_x: //0x40
            ins.swapX(operandStack, opcodes[i + 1]);
            i += 2; break;
        case mnemonics.sadd:  //0x41
            sa = Number(operandStack.pop());
            sa += Number(operandStack.pop());
            operandStack.push(sa % mnemonics.short_s);
            i++; break;
        case mnemonics.iadd:  //0x42
            v2w2 = Number(operandStack.pop());
            v2w1 = Number(operandStack.pop());
            v1w2 = Number(operandStack.pop());
            v1w1 = Number(operandStack.pop());
            val = (v2w1 << 8) + v2w2 + (v1w1 << 8) + v1w2;
            words = utilities.convertIntegerToWords(val % mnemonics.int_s);
            operandStack.push(words[0]);
            operandStack.push(words[1]);
            i++; break;
        case mnemonics.ssub:  //0x43
            sa = Number(operandStack.pop());
            sa = Number(operandStack.pop()) - sa;
            operandStack.push(sa % mnemonics.short_s);
            i++; break;
        case mnemonics.isub:  //0x44
            v2w2 = Number(operandStack.pop());
            v2w1 = Number(operandStack.pop());
            v1w2 = Number(operandStack.pop());
            v1w1 = Number(operandStack.pop());

            val = ((v1w1 << 8) + v1w2) - ((v2w1 << 8) + v2w2);
            words = utilities.convertIntegerToWords(val % mnemonics.int_s);

            operandStack.push(words[0]);
            operandStack.push(words[1]);
            i++; break;
        case mnemonics.smul: //0x45
            sa = Number(operandStack.pop());
            sa *= Number(operandStack.pop());
            operandStack.push(sa);
            i++; break;
        case mnemonics.imul: //0x46
            v2w2 = Number(operandStack.pop());
            v2w1 = Number(operandStack.pop());
            v1w2 = Number(operandStack.pop());
            v1w1 = Number(operandStack.pop());

            val = ((v1w1 << 8) + v1w2) * ((v2w1 << 8) + v2w2);
            words = utilities.convertIntegerToWords(val % mnemonics.int_s);

            operandStack.push(words[0]);
            operandStack.push(words[1]);
            i++; break;
        case mnemonics.sdiv: //0x47
            sa = Number(operandStack.pop());
            if (sa === 0) { executeBytecode.exception_handler(mnemonics.jlang,9,""); }
            sa = Math.round(operandStack.pop() / sa);
            operandStack.push(sa);
            i++; break;
        case mnemonics.idiv: //0x48
            v2w2 = Number(operandStack.pop());
            v2w1 = Number(operandStack.pop());
            v1w2 = Number(operandStack.pop());
            v1w1 = Number(operandStack.pop());
            val = (v2w1 << 8) + v2w2;
            if (val === 0) { executeBytecode.exception_handler(mnemonics.jlang,9,""); }

            val = Math.round((v1w1 * mnemonics.short_s + v1w2) / val);
            words = utilities.convertIntegerToWords(val % mnemonics.int_s);

            operandStack.push(words[0]);
            operandStack.push(words[1]);
            i++; break;
        case mnemonics.srem: //0x49
            v2 = Number(operandStack.pop());
            v1 = Number(operandStack.pop());
            if (v2 === 0) { executeBytecode.exception_handler(mnemonics.jlang,9,""); }
            v = v1 - (v1 / v2) * v2;

            operandStack.push(v);
            i++; break;
        case mnemonics.irem: //0x4A
            v2w2 = Number(operandStack.pop());
            v2w1 = Number(operandStack.pop());
            v1w2 = Number(operandStack.pop());
            v1w1 = Number(operandStack.pop());
            v2 = v2w1 << 8 + v2w2;
            v1 = v1w1 << 8 + v1w2;
            if (v2 === 0) { executeBytecode.exception_handler(mnemonics.jlang,9,""); }
            vres = utilities.convertIntegerToWords(v1 - (v1 / v2) * v2);

            operandStack.push(vres[0]);
            operandStack.push(vres[1]);
            i++; break;
        case mnemonics.sneg: //0x4B
            v = (-Number(operandStack.pop())) % mnemonics.short_s;
            operandStack.push(v);
            i++; break;
        case mnemonics.ineg: //0x4C
            v2 = operandStack.pop();
            v1 = operandStack.pop();
            vres = utilities.convertIntegerToWords((-v1 * mnemonics.short_s + v2) % mnemonics.int_s);
            operandStack.push(vres[0]);
            operandStack.push(vres[1]);
            i++; break;
        case mnemonics.sshl: //0x4D
            v2 = operandStack.pop();
            v1 = operandStack.pop();

            v2 = v2 & 31;
            vres = (v1 << v2) % mnemonics.short_s;
            operandStack.push(vres);
            i++; break;
        case mnemonics.ishl: //0x4E
            v2w2 = operandStack.pop();
            v2w1 = operandStack.pop();
            v1w2 = operandStack.pop();
            v1w1 = operandStack.pop();
            v2 = v2w1 * mnemonics.short_s + v2w2;
            v1 = (v1w1 * mnemonics.short_s + v1w2) % Math.pow(2, 32);
            vres = 0;

            v2 = v2 & 31;
            vres = utilities.convertIntegerToWords((v1 << v2) % mnemonics.int_s);

            operandStack.push(vres[0]);
            operandStack.push(vres[1]);
            i++; break;
        case mnemonics.sshr: //0x4F
            v2 = operandStack.pop();
            v1 = operandStack.pop();

            v2 = v2 & 31;
            vres = (v1 >> v2) % mnemonics.short_s;
            operandStack.push(vres);
            i++; break;
        case mnemonics.ishr: //0x50
            v2w2 = operandStack.pop();
            v2w1 = operandStack.pop();
            v1w2 = operandStack.pop();
            v1w1 = operandStack.pop();
            v2 = v2w1 * mnemonics.short_s + v2w2;
            v1 = (v1w1 * mnemonics.short_s + v1w2) % Math.pow(2, 32);
            vres = 0;

            v2 = v2 & 31;
            vres = utilities.convertIntegerToWords((v1 >> v2) % mnemonics.int_s);

            operandStack.push(vres[0]);
            operandStack.push(vres[1]);
            i++; break;
        case mnemonics.sushr: //0x51
            v2 = operandStack.pop();
            v1 = operandStack.pop();
            vres = 0;

            v1 = v1 % Math.pow(2, 32);
            v2 = v2 & 31;
            vres = (v1 >> v2) & mnemonics.short_s;
            operandStack.push(vres);

            i++; break;
        case mnemonics.iushr: //0x52
            v2w2 = operandStack.pop();
            v2w1 = operandStack.pop();
            v1w2 = operandStack.pop();
            v1w1 = operandStack.pop();
            v2 = v2w1 * mnemonics.short_s + v2w2;
            v1 = v1w1 * mnemonics.short_s + v1w2;
            vres = 0;

            v2 = 31 & v2;
            vres = utilities.convertIntegerToWords((v1 >> v2) % mnemonics.int_s);
            operandStack.push(vres[0]);
            operandStack.push(vres[1]);
            i++; break;
        case mnemonics.sand: //0x53
            v2 = operandStack.pop();
            v1 = operandStack.pop();
            res = v1 & v2;
            operandStack.push(res);
            i++; break;
        case mnemonics.iand: //0x54
            v2w2 = operandStack.pop();
            v2w1 = operandStack.pop();
            v1w2 = operandStack.pop();
            v1w1 = operandStack.pop();
            v2 = v2w1 * mnemonics.short_s + v2w2;
            v1 = v1w1 * mnemonics.short_s + v1w2;
            res = utilities.convertIntegerToWords(v1 & v2);

            operandStack.push(res[0]);
            operandStack.push(res[1]);
            i++; break;
        case mnemonics.sor: //0x55
            v2 = operandStack.pop();
            v1 = operandStack.pop();
            res = v1 | v2;
            operandStack.push(res);
            i++; break;
        case mnemonics.ior: //0x56
            v2w2 = operandStack.pop();
            v2w1 = operandStack.pop();
            v1w2 = operandStack.pop();
            v1w1 = operandStack.pop();
            v2 = v2w1 * mnemonics.short_s + v2w2;
            v1 = v1w1 * mnemonics.short_s + v1w2;
            res = utilities.convertIntegerToWords(v1 | v2);

            operandStack.push(res[0]);
            operandStack.push(res[1]);
            i++; break;
        case mnemonics.sxor: //0x57
            v2 = operandStack.pop();
            v1 = operandStack.pop();
            res = v1 ^ v2;
            operandStack.push(res);
            i++; break;
        case mnemonics.ixor: //0x58
            v2w2 = operandStack.pop();
            v2w1 = operandStack.pop();
            v1w2 = operandStack.pop();
            v1w1 = operandStack.pop();
            v2 = v2w1 * mnemonics.short_s + v2w2;
            v1 = v1w1 * mnemonics.short_s + v1w2;
            res = utilities.convertIntegerToWords(v1 ^ v2);

            operandStack.push(res[0]);
            operandStack.push(res[1]);
            i++; break;
        case mnemonics.sinc: //0x59
            //sinc, index, const
            lc = opcodes[i + 1];
            localVariables[lc] =
                (localVariables[lc] + utilities.byteToShort(opcodes[i + 2], 16)) % mnemonics.short_s;
            i += 3;
            break;
        case mnemonics.iinc: //0x5A
            //iinc, index, const
            lc = opcodes[i + 1];
            v = utilities.convertIntegerToWords((localVariables[lc] * mnemonics.short_s + localVariables[lc + 1] + utilities.byteToInt(opcodes[i + 2], 16)) % mnemonics.int_s);
            localVariables[lc] = v[0];
            localVariables[lc + 1] = v[1];
            i += 3;
            break;
        case mnemonics.s2b: //0x5B
            val = operandStack.pop() & 0xFF;
            operandStack.push(val);
            i++; break;
        case mnemonics.s2i: //0x5C
            val = utilities.convertIntegerToWords(utilities.shortToInt(operandStack.pop()));
            operandStack.push(val[0]);
            operandStack.push(val[1]);
            i++; break;
        case mnemonics.i2b: //0x5D
            v2 = operandStack.pop();
            v1 = operandStack.pop();
            v = utilities.byteToShort(v2 & 0xFF);
            operandStack.push(v);
            i++; break;
        case mnemonics.i2s: //0x5E
            v2 = operandStack.pop();
            v1 = operandStack.pop();
            operandStack.push(v2);
            i++; break;
        case mnemonics.icmp: //0x5F
            v2w2 = operandStack.pop();
            v2w1 = operandStack.pop();
            v1w2 = operandStack.pop();
            v1w1 = operandStack.pop();
            v2 = utilities.intToValue(v2w1 * mnemonics.short_s + v2w2);
            v1 = utilities.intToValue(v1w1 * mnemonics.short_s + v1w2);

            if (v1 > v2) { operandStack.push(1); }
            else if (v1 < v2) { operandStack.push(mnemonics.short_s - 1); }
            else { operandStack.push(0); }
            i++; break;
        case mnemonics.ifeq: //0x60
            i += (operandStack.pop() === 0 ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.ifne: //0x61
            i += (operandStack.pop() !== 0 ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.iflt: //0x62 //iflt, branch
            i += (operandStack.pop() < 0 ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.ifge: //0x63 //ifge, branch
            i += (operandStack.pop() >= 0 ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.ifgt: //0x64 //ifgt, branch
            i += (operandStack.pop() > 0 ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.ifle: //0x65 //ifle, branch
            i += (operandStack.pop() <= 0 ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.ifnull: //0x66
            i += (operandStack.pop() === null ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.ifnonnull: //0x67 //ifnonnull, branch
            i += (operandStack.pop() !== 0 ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.if_acmpeq: //0x68 //if_acmpeq, branch
            i += (operandStack.pop() == operandStack.pop() ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.if_acmpne: //0x69
            i += (operandStack.pop() != operandStack.pop() ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.if_scmpeq: //0x6A
            i += (operandStack.pop() == operandStack.pop() ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.if_scmpne: //0x6B
            i += (operandStack.pop() != operandStack.pop() ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.if_scmplt: //0x6C //val2  //val1
            i += (operandStack.pop() > operandStack.pop() ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.if_scmpge: //0x6D //val2  //val1
            i += (operandStack.pop() <= operandStack.pop() ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.if_scmpgt: //0x6E //val2  //val1
            i += (operandStack.pop() < operandStack.pop() ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.if_scmple: //0x6F //val2  //val1
            i += (operandStack.pop() >= operandStack.pop() ? utilities.byteToValue(opcodes[i + 1]) : 2);
            break;
        case mnemonics.goto: //0x70
            i += utilities.byteToValue(opcodes[i + 1]);
            break;
        case mnemonics.jsr: //0x71 //jsr, branchbyte1,branchbyte2
            operandStack.push(i + 3);
            i += utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            break;
        case mnemonics.ret: //0x72 //ret, index
            i = localVariables[opcodes[i + 1]];
            break;
        case mnemonics.stableswitch: //0x73
            i += ins.stableswitch(operandStack, opcodes, i);
            break;
        case mnemonics.itableswitch: //0x74
            i += ins.itableswitch(operandStack, opcodes, i);
            break;
        case mnemonics.slookupswitch: //0x75
            i += ins.slookupswitch(operandStack, opcodes, i);
            break;
        case mnemonics.ilookupswitch: //0x76
            i += ins.ilookupswitch(operandStack, opcodes, i);
            break;
        case mnemonics.areturn: //0x77
            frames[invoker].operand_stack.push(operandStack.pop());
            operandStack = [];
            currentFrame = invoker;
            i = frames[currentFrame].return_pointer;
            break;
        case mnemonics.sreturn: //0x78
            val = operandStack.pop();
            if (invoker >= 0) {
                frames[invoker].operand_stack.push(val);
                operandStack = [];
                currentFrame = invoker;
                i = frames[currentFrame].return_pointer;
            } else if(val === 0){
                return cb(new Error(),"0x6999");
            } else {
                return cb(undefined, "0x9000");
            }
            break;
        case mnemonics.ireturn: //0x79
            var w2 = operandStack.pop();
            var w1 = operandStack.pop();
            operandStack = [];
            frames[invoker].operand_stack.push(w1);
            frames[invoker].operand_stack.push(w2);
            currentFrame = invoker;
            i = frames[currentFrame].return_pointer;
            break;
        case mnemonics.return_v: //0x7A
            operandStack = [];
            currentFrame = invoker;
            if (currentFrame >= 0) {
                i = frames[currentFrame].return_pointer;
            } else { i = -1; }
            break;
        case mnemonics.getstatic_a: //0x7B //robin: slice stops the constantpool being edited
            operandStack.push(ins.getstatic(constantPool, opcodes.slice(i+1, i+3), 2));
            i += 3; break;
        case mnemonics.getstatic_b: //0x7C
            operandStack.push(ins.getstatic(constantPool, opcodes.slice(i+1, i+3), 1));
            i += 3; break;
        case mnemonics.getstatic_s: //0x7D
            operandStack.push(ins.getstatic(constantPool, opcodes.slice(i+1, i+3), 2));
            i += 3; break;
        case mnemonics.getstatic_i: //0x7E
            tempOperands = utilities.convertIntegerToWords(
                ins.getstatic(constantPool, opcodes.slice(i+1, i+3), 4));
            pushOperands(operandStack, tempOperands);
            i += 3; break;
        case mnemonics.putstatic_a: //0x7F
            ins.putstatic(constantPool, opcodes.slice(i+1, i+3), operandStack.pop(), 2);
            i += 3; break;
        case mnemonics.putstatic_b: //0x80
            ins.putstatic(constantPool, opcodes.slice(i+1, i+3), operandStack.pop(), 1);
            i += 3; break;
        case mnemonics.putstatic_s: //0x81
            ins.putstatic(constantPool, opcodes.slice(i+1, i+3), operandStack.pop(), 2);
            i += 3; break;
        case mnemonics.putstatic_i: //0x82
            tempValue = operandStack.pop() + (operandStack.pop() << 8);
            ins.putstatic(constantPool, opcodes.slice(i+1, i+3), val, 4);
            i += 3; break;
        case mnemonics.getfield_a: //0x83
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = operandStack.pop();
            retval = getfield(info, objref);
            operandStack.push(retval);
            i += 2;
            break;
        case mnemonics.getfield_b: //0x84
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = operandStack.pop();
            retval = getfield(info, objref);
            operandStack.push(retval);
            i += 2;
            break;
        case mnemonics.getfield_s: //0x85
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = operandStack.pop();
            retval = getfield(info, objref);
            operandStack.push(retval);
            i += 2;
            break;
        case mnemonics.getfield_i: //0x86
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = operandStack.pop();
            retval = getfield(info, objref);

            val = utilities.convertIntegerToWords(retval);
            operandStack.push(val[0]);
            operandStack.push(val[1]);

            i += 2;
            break;
        case mnemonics.putfield_a: //0x87
            info = constantPool[opcodes[i + 1]].info.slice(0);
            val = operandStack.pop();
            objref = operandStack.pop();

            putfield(info, val, objref);
            i += 2;
            break;
        case mnemonics.putfield_b: //0x88
            info = constantPool[opcodes[i + 1]].info.slice(0);
            val = operandStack.pop();
            objref = operandStack.pop();

            putfield(info, val, objref);

            i += 2;
            break;
        case mnemonics.putfield_s: //0x89
            info = constantPool[opcodes[i + 1]].info.slice(0);
            val = operandStack.pop();
            objref = operandStack.pop();

            putfield(info, val, objref);
            i += 2;
            break;
        case mnemonics.putfield_i: //0x8A
            info = constantPool[opcodes[i + 1]].info.slice(0);
            val2 = operandStack.pop();
            val1 = operandStack.pop();
            val = (val1 << 8) + val2;
            objref = operandStack.pop();

            putfield(info, val, objref);

            i += 2;
            break;
        case mnemonics.invokevirtual: //0x8B
            params = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            frames[currentFrame].return_pointer = i + 3;
            if(params[0] >= 128){
                apiresult = ins.invokevirtualExternal(smartcard, capFile, heap,
                  operandStack, params);
                if(apiresult instanceof Error){
                    return apiError(apiresult, cb);
                }
                i += 3; break;
            } else {
                i = ins.invokevirtualInternal(capFile, opcodes, operandStack,
                  frames, params);
                frames[frames.length - 1].invoker = currentFrame;
                currentFrame = frames.length - 1;
            }
            break;
        case mnemonics.invokespecial: //0x8C
            params = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);//info
            frames[currentFrame].return_pointer = i + 3;
            if(params[0] >= 128){
                apiresult = ins.invokespecialExternal(smartcard, capFile, heap,
                  operandStack, params);
                if(apiresult instanceof Error){
                    return apiError(apiresult, cb);
                }
                i += 3; break;
            } else {
                i = ins.invokespecialInternal(opcodes, operandStack, frames,
                  params);
                frames[frames.length - 1].invoker = currentFrame;
                currentFrame = frames.length - 1;
            }
            break;
        case mnemonics.invokestatic: //0x8D
            params = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            frames[currentFrame].return_pointer = i + 3;
            if(params[0] >= 128){
                apiresult = ins.invokestaticExternal(smartcard, capFile, heap,
                  operandStack, params);
                if(apiresult instanceof Error){
                    return apiError(apiresult, cb);
                }
                i += 3; break;
            } else {
                currentFrame = frames.length;
                i = ins.invokespecialInternal(opcodes, operandStack, frames,
                  params);
            }
            break;
        case mnemonics.invokeinterface: //0x8E
            //invokeinterface, nargs, ind1, ind2, method
            var numOfArgs = opcodes[i + 1];
            var classRef = constantPool[(opcodes[i + 2] << 8) + opcodes[i + 3]].info;
            var methodToken = opcodes[i + 4];
            apiresult = ins.invokeinterface(smartcard, capFile, operandStack,
              classRef, methodToken, numOfArgs);
            if(apiresult instanceof Error){
                return apiError(apiresult, cb);
            }
            i+=4; break;
        case mnemonics.new_v: //0x8F

            //new, ind1, ind2
            var ref = heap.length;

            var done = false;
            info = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            //var hv = "";

            while (!done) {

                if (info[0] < 128) {
                    //get class
                    var offset = (info[0] << 8) + info[1];
                    var clsno;
                    for (var j = 0; j < capFile.COMPONENT_Class.i_count; j++) {
                        if (capFile.COMPONENT_Class.interface_info[j].start == offset) {
                            //allocate space on the heap
                            clsno = j;
                            var dis = capFile.COMPONENT_Class.interface_info[j].declared_instance_size;
                            //hv += ","+offset;
                            eeprom.pushToHeap(smartcard, offset);

                            //for (var k = 0; k < dis; k++) { hv += ",0"; }
                            for (var k = 0; k < dis; k++) { eeprom.pushToHeap(smartcard, 0); }

                            info[0] = capFile.COMPONENT_Class.interface_info[j].super_class_ref1;
                            info[1] = capFile.COMPONENT_Class.interface_info[j].super_class_ref2;

                            break;
                        }
                    }

                } else {
                    var clsno = ((info[0] - 128) << 8) + info[1];
                    //hv += ",A"+clsno+","+objectheap.length;
                    eeprom.pushToHeap(smartcard, 160+clsno);
                    eeprom.pushToHeap(smartcard, smartcard.EEPROM.objectheap.length);
                    if ((info[1] == 3) && (capFile.COMPONENT_Import.packages[info[0] - 128].AID.join() === mnemonics.jframework.join())) {
                        ram.setGRef(smartcard.RAM, ref);
                    }

                    eeprom.appendObjectHeap(smartcard.EEPROM, api.newObject(capFile.COMPONENT_Import.packages[info[0] - 128].AID, info[1]));
                    done = true;
                }
            }

            //newHeap(hv);
            operandStack.push(ref);
            i += 3;
            break;
        case mnemonics.newarray: //0x90
            //newarray, atype
            var count = operandStack.pop();
            //var atype = opcodes[i + 1];
            var ref = heap.length;
            if (count < 0) { executeBytecode.exception_handler(mnemonics.jlang,6,"");}

            //allocate space on heap
           // var heapspace = [];
            eeprom.pushToHeap(smartcard, count);
            for (var j = 0; j < count; j++) {
               eeprom.pushToHeap(smartcard, 0);
            }
            //newHeap(hv);
            //push ref onto operand stack

            operandStack.push(ref);

            i += 2;
            break;
        case mnemonics.anewarray: //0x91
            var index = (opcodes[i + 1] << 8) + opcodes[i + 2];
            info = constantPool[index].info.slice(0);
            var count = utilities.shortToValue(operandStack().pop());
            if (count < 0) { executeBytecode.exception_handler(mnemonics.jlang,6,""); }
            var dis = 0;
            //var ref = heap.length;

            var done = false;
            info = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            var hv = "";
            var tv = [];
            var totalsize = 0;
            while (!done) {

                if (info[0] < 128) {
                    //get class
                    var offset = (info[0] << 8) + info[1];
                    var clsno;
                    for (var j = 0; j < capFile.COMPONENT_Class.i_count; j++) {
                        if (capFile.COMPONENT_Class.interface_info[j].start == offset) {
                            //allocate space on the heap
                            clsno = j;
                            var dis = capFile.COMPONENT_Class.interface_info[j].declared_instance_size;
                            tv.push(offset);

                            for (var k = 0; k < dis; k++) { tv.push(0); }

                            info[0] = capFile.COMPONENT_Class.interface_info[j].super_class_ref1;
                            info[1] = capFile.COMPONENT_Class.interface_info[j].super_class_ref2;

                            break;
                        }
                    }

                } else {
                    var clsno = ((info[0] - 128) << 8) + info[1];
                    //tv += ",A" + clsno + "," + objectheap.length;
                    tv.push(160+clsno);
                    tv.push(smartcard.EEPROM.objectheap.length);
                    if ((info[1] == 3) && (capFile.COMPONENT_Import.packages[info[0] - 128].AID.join() === mnemonics.jframework.join())) { ram.setGRef(smartcard.RAM, ref); }

                    eeprom.appendObjectHeap(smartcard.EEPROM, api.newObject(capFile.COMPONENT_Import.packages[info[0] - 128].AID, info[1]));
                    done = true;
                }
            }

            var ref = heap.length;

            //var hv = "," + count;
            eeprom.pushToHeap(smartcard, count);
            var ival = 0;
            for (var j = 0; j < count; j++) {
                ival = ref + dis * (j + 1) + 1;
                eeprom.pushToHeap(smartcard, ival);
                //hv += "," + ival;
            }

            for (var j = 0; j < count; j++) {
                //hv += ","+ dis;
                //hv += tv;
                eeprom.pushToHeap(smartcard, tv);
            }
            //newHeap(hv);
            operandStack.push(ref);
            i += 3;
            break;
        case mnemonics.arraylength: //0x92
            var arref = operandStack.pop();
            if (arref === null) { executeBytecode.exception_handler(mnemonics.jlang,6,""); }
            var ar = heap[arref];
            if (ar.slice(0, 2) == "#H") {
                ar = heap[Number(ar.split("#H")[1])].length;
            }

            operandStack.push(ar);
            i++; break;
        case mnemonics.athrow: //0x93
            objref = operandStack.pop();
            var oheap = heap[objref];
            //search for catch clause
            if(oheap.slice(0,1) == "A") {
                var ncls = Number(oheap.slice(1));
                var pk = 0;
                while (ncls > 255) { ncls -= 256; pk++; }
                executeBytecode.exception_handler(capFile.COMPONENT_Import.packages[pk].AID,ncls,"");
            } else {executeBytecode.exception_handler(mnemonics.jlang, 2, "");}

            i++; break;
        case mnemonics.checkcast: //0x94 !!!!!!!!!!!!!NOT IMPLEMENTED
        //    objref = operandStack.pop();
        //    operandStack.push(1);
            i += 4;
            break;
        //case mnemonics.instanceof_v: //0x95 !!!!!!!!!!!!!NOT IMPLEMENTED
        //    objref = operandStack.pop();
        //    operandStack.push(1);
        //    //search for catch clause
        //    i += 4;
        //    break;
        case mnemonics.sinc_w: //0x96
            var index = opcodes[i + 1];
            var byte = (opcodes[i + 2] << 8) + opcodes[i + 3];
            localVariables[index] += byte;
            i += 4;
            break;
        case mnemonics.iinc_w: //0x97
            var index = opcodes[i + 1];
            var byte = (opcodes[i + 2] << 8) + opcodes[i + 3];
            var inc = utilities.convertIntegerToWords(localVariables[index] * mnemonics.short_s + localVariables[index + 1] + byte);
            localVariables[index] = inc[0];
            localVariables[index + 1] = inc[1];
            i += 4;
            break;
        case mnemonics.ifeq_w: //0x98
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val = utilities.shortToValue(operandStack.pop());

            if (val === 0) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.ifne_w: //0x99
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val = utilities.shortToValue(operandStack.pop());

            if (val !== 0) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.iflt_w: //0x9A
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val = utilities.shortToValue(operandStack.pop());

            if (val < 0) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.ifge_w: //0x9B
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val = utilities.shortToValue(operandStack.pop());

            if (val >= 0) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.ifgt_w: //0x9C
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val = utilities.shortToValue(operandStack.pop());

            if (val > 0) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.ifle_w: //0x9D
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val = utilities.shortToValue(operandStack.pop());

            if (val < 0) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.ifnull_w: //0x9E
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val = operandStack.pop();

            if (val === null) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.ifnonnull_w: //0x9F
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val = operandStack.pop();

            if (val !== null) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.if_acmpeq_w: //0xA0
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val2 = operandStack.pop();
            val1 = operandStack.pop();

            if (val1 == val2) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.if_acmpne_w: //0xA1
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val2 = operandStack.pop();
            val1 = operandStack.pop();

            if (val1 != val2) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.if_scmpeq_w: //0xA2
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val2 = operandStack.pop();
            val1 = operandStack.pop();

            if (val == val2) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.if_scmpne_w: //0xA3
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val2 = operandStack.pop();
            val1 = operandStack.pop();

            if (val1 != val2) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.if_scmplt_w: //0xA4
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val2 = operandStack.pop();
            val1 = operandStack.pop();

            if (val1 < val2) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.if_scmpge_w: //0xA5
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val2 = operandStack.pop();
            val1 = operandStack.pop();

            if (val1 >= val2) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.if_scmpgt_w: //0xA6
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val2 = operandStack.pop();
            val1 = operandStack.pop();

            if (val1 > val2) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.if_scmple_w: //0xA7
            branch = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            val2 = operandStack.pop();
            val1 = operandStack.pop();

            if (val1 >= val2) {
                i += branch;
            } else {
                i += 3;
            }
            break;
        case mnemonics.goto_w: //0xA8
            i += utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
            break;
        case mnemonics.getfield_a_w: //0xA9
            objref = operandStack.pop();
            info = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            retval = getfield(info, objref);
            operandStack.push(retval);
            i += 3;
            break;
        case mnemonics.getfield_b_w: //0xAA
            objref = operandStack.pop();
            info = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            retval = getfield(info, objref);
            operandStack.push(retval);
            i += 3;
            break;
        case mnemonics.getfield_s_w: //0xAB
            objref = operandStack.pop();
            info = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            retval = getfield(info, objref);
            operandStack.push(retval);
            i += 3;
            break;
        case mnemonics.getfield_i_w: //0xAC
            objref = operandStack.pop();
            info = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            retval = getfield(info, objref);

            val = utilities.convertIntegerToWords(retval);
            operandStack.push(val[0]);
            operandStack.push(val[1]);
            i += 3;
            break;
        case mnemonics.getfield_a_this: //0xAD

            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = localVariables[0];

            retval = getfield(info, objref);
            operandStack.push(retval);

            i += 2;
            break;
        case mnemonics.getfield_b_this: //0xAE
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = localVariables[0];

            retval = getfield(info, objref);
            operandStack.push(retval);
            i += 2;
            break;
        case mnemonics.getfield_s_this: //0xAF
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = localVariables[0];

            retval = getfield(info, objref);
            operandStack.push(retval);
            i += 2;
            break;
        case mnemonics.getfield_i_this: //0xB0
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = localVariables[0];

            retval = getfield(info, objref);

            val = utilities.convertIntegerToWords(retval);
            operandStack.push(val[0]);
            operandStack.push(val[1]);
            i += 2;
            break;
        case mnemonics.putfield_a_w: //0xB1
            info = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            val = operandStack.pop();
            objref = operandStack.pop();

            putfield(info, val, objref);
            i += 3;
            break;
        case mnemonics.putfield_b_w: //0xB2
            info = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            val = operandStack.pop();
            objref = operandStack.pop();

            putfield(info, val, objref);
            i += 3;
            break;
        case mnemonics.putfield_s_w: //0xB3
            info = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            val = operandStack.pop();
            objref = operandStack.pop();

            putfield(info, val, objref);
            i += 3;
            break;
        case mnemonics.putfield_i_w: //0xB4

            info = constantPool[(opcodes[i + 1] << 8) + opcodes[i + 2]].info.slice(0);
            val2 = operandStack.pop();
            val1 = operandStack.pop();
            val = (val1 << 8) + val2;
            objref = operandStack.pop();

            putfield(info, val, objref);

            i += 3;
            break;
        case mnemonics.putfield_a_this: //0xB5
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = localVariables[0];
            val = operandStack.pop();

            putfield(info, val, objref);
            i += 2;
            break;
        case mnemonics.putfield_b_this: //0xB6
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = localVariables[0];
            val = operandStack.pop();

            putfield(info, val, objref);
            i += 2;
            break;
        case mnemonics.putfield_s_this: //0xB7
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = localVariables[0];
            val = operandStack.pop();

            putfield(info, val, objref);
            i += 2;
            break;
        case mnemonics.putfield_i_this: //0xB8
            info = constantPool[opcodes[i + 1]].info.slice(0);
            objref = localVariables[0];
            val2 = operandStack.pop();
            val1 = operandStack.pop();
            val = (val1 << 8) + val2;

            putfield(info,val,objref);

            i += 2;
            break;
        default:
            alert("Unsupported Bytecode " + opcodes[i].toString(16));
            break;
    }
    function getfield(info,objref) {
        var infoclass = (info[0] << 8) + info[1];
        if (objref === null) { executeBytecode.exception_handler(mnemonics.jlang,7,""); }
        var bfound = false;
        var oheap = objref;
        var retval;
        var dis;
        var jf;

        //assume internal
        var refclass = heap[objref];
        while (!bfound) {
            //get object field size
            if (refclass == infoclass) {
                bfound = true;
                retval = heap[oheap + info[2] + 1];
            } else {

                for (var j = 0; j < capFile.COMPONENT_Class.i_count; j++) {
                    if (capFile.COMPONENT_Class.interface_info[j].start == refclass) {
                        jf = j;
                        break;
                    }
                }
                oheap += capFile.COMPONENT_Class.interface_info[jf].declared_instance_size + 1;
                refclass = (capFile.COMPONENT_Class.interface_info[jf].super_class_ref1 << 8) +
                    capFile.COMPONENT_Class.interface_info[jf].super_class_ref2;
            }

        }
        return retval;

    }


    function putfield(info, val, objref) {

        var infoclass = (info[0] << 8) + info[1];
        if (objref === null) { executeBytecode.exception_handler(mnemonics.jlang,7,""); }
        var bfound = false;
        var oheap = objref;
        var dis;
        var jf;

        //assume internal
        var refclass = heap[objref];
        while (!bfound) {
            //get object field size
            if (refclass === infoclass) {
                bfound = true;
                eeprom.setHeap(smartcard, oheap + info[2] + 1, val);
            } else {
                for (var j = 0; j < capFile.COMPONENT_Class.i_count; j++) {
                    if (capFile.COMPONENT_Class.interface_info[j].start == refclass) {
                        jf = j;
                        break;
                    }
                }
                oheap += capFile.COMPONENT_Class.interface_info[jf].declared_instance_size + 1;
                refclass = (capFile.COMPONENT_Class.interface_info[jf].super_class_ref1 << 8) +
                    capFile.COMPONENT_Class.interface_info[jf].super_class_ref2;
            }
        }
    }

    if(currentFrame >= 0){
        setImmediate(function(){
            executeBytecode(smartcard, capFile, i, frames, currentFrame, cb);
        });
    } else {
        setImmediate(function(){
            cb(undefined, "0x9000");
        });
    }
}

/**
 * Parses and sends api error message
 * @param  {Error}   apiresult
 * @param  {Function} cb
 */
function apiError(apiresult, cb){
    var apdu = ISO7816.get(apiresult.message);
    if(apdu){
        apdu = "0x" + apdu.toString(16);
    } else {
        apdu = "0x6F00";
    }
    cb(apiresult, apdu);
}

function pushOperands(operandStack, array){
    Array.prototype.push.apply(operandStack, array);
}
