
var gsAID = "";
var gcardname = "";
var gpID = 0;
var gSW = "";
var installed_flag = false;
var transient_data = [];
var transaction_buffer = [];
var transaction_flag = false;
var installation_failed = false;
var select_statement_flag = 0;

function AppletManager() {


    AppletManager.SelectedAppletIndex = -1;
    AppletManager.CurrentComponent = 0;
    AppletManager.ParentAID = "";
    AppletManager.SelectedAppletAID = "";
    AppletManager.installbc = 0;

    AppletManager.ProcessAPDU = function (cardname,buffer) {
        
        var apdu = new APDU();
        apdu.constr(buffer);
        objectheap[0] = apdu;
        var save = apdu.save();
        gSW = "";
        APISave(0, save);
        asyncState = false;
        transaction_flag = false;
        transaction_buffer = [];

        var CLA = buffer[0];    //@adam class of instruction, category
        var INS = buffer[1];    //@adam instruction
        var P1 = buffer[2];     //@adam parameter 1
        var P2 = buffer[3];     //@adam parameter 2
        var LC = buffer[4];     //@adam length of command data
        var sAID = "";
        var details = "";
        var response = "";
        var CAP;
        
        var found = false;
        iapp = [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01];

        var Result;
        
        function Result_Method(ResultString) {
            
            Result = ResultString;

        }
       
        gcardname = cardname;
        function getCAP(cardname, pID) {
            var details = "";
            var compArray = [];
            asyncState = false;

            for (var j = 1; j <= 13; j++) {
                //Result = "";
                PageMethods.getComponent(cardname, pID, j, Result_Method);
                details = Result;
                 
                compArray[j] = details;     
            }

            var CAP = new CAPfile(compArray);
            return CAP;
        }

        //@adam if select applet command
        if ((CLA == 0) && (INS == 0xA4) && (P1 == 0x04) && (P2 == 0x00)) {

            //@adam initialises the transient array by recreating and assigning all values to zero
            ResetTransientData(2); //Reset Transient Data (On Deselect)
            select_statement_flag = 1;
            //DESELECT CURRENT APPLET
            if (AppletManager.SelectedAppletIndex >= 0) {
                
                var CAP = getCAP(cardname, gpID);
                
                var startcode = getStartCode(CAP, AppletManager.installbc, 4);
                var params = [];
               
                if (startcode > 0) {
                    Recover.BackupAll();
                    executeBytecode(CAP, startcode, params, 3, gRef);
                }
            }


            //SELECT APPLET
            sAID = ""; //@applet id as a string
            
            var bf1 = true;//@adam checks if command data is installer appler
            for (var j = 0; j < LC; j++) {if (buffer[5 + j] != iapp[j]) { bf1 = false; } }

            //@adam if above is true: Installer
            if (bf1) {
                AppletManager.SelectedAppletIndex = -1; //we have selected an applet now
                for (var j = 0; j < iapp.length; j++) {
                    sAID = sAID + addpad(iapp[j]) + " ";//aAid = 
                }
                AppletManager.SelectedAppletAID = sAID;


                found = true;
            } else {
                
                //Search table for applet
                for (var j = 0; j < LC; j++) {
                    sAID = sAID + addpad(buffer[5+j]) + " ";
                }


                //@adam First method called to server in applet manager
                //@adam get applet details
                PageMethods.getAppDetails(cardname, sAID, Result_Method);
                details = Result;

                if (details.length > 0) {
                    var m = details.split(","); //@adam m = applet details
                    var opID = gpID; //@adam don't know what these stand for
                    gpID = m[0];
                   
                    var SelectedAppletIndex = m[0];
                    var ParentAID = Number(m[1]); //@adam what package it is part of
                    var SelectedAppletAID = m[2];
                    
                    gRef = m[3];//@adam something to do with eeprom maybe/ memory location
                    found = true;
                    var fwp = -1;
                    
                    //@adam get parent's aid and ____? by it's package index
                    PageMethods.getAppPackage1(cardname, ParentAID, Result_Method);
                    
                    m = Result.split(",");
                    var pID = Number(m[1]);
                    var installbc = Number(m[3]);//^^^^^____?
                    
                    gpID = pID;
                    
                    var CAP = getCAP(cardname, gpID); //@adam the actual applet 
                    
                    
                    //get framework import pck index 
                    for(var j = 0; j < CAP.COMPONENT_Import.count; j++) { 
                        if(CAP.COMPONENT_Import.packages[j].AID == jframework) {
                            fwp = j;
                        }
                    }
                    
                    Recover.BackupAll();
                    //Check/Update APDU Class
                    var upd = fwp * 256 + 10;

                    setHeap(0, "A" + upd);

                    var startcode = getStartCode(CAP, installbc, 6);
                    var params = [];
                    
                    //execute select method
                    if (startcode > 0) {
                        executeBytecode(CAP, startcode, params, 2, gRef);
                    }

                    if (gSW == "") {
                        //If Select method succeeded then start process method
                        startcode = getStartCode(CAP, installbc, 7);
                        params[0] = 0;
                        executeBytecode(CAP, startcode, params, 0, gRef);
                    }

                    if (gSW == "") {
                        //On success update selected applet values
                        AppletManager.SelectedAppletIndex = SelectedAppletIndex;
                        AppletManager.ParentAID = ParentAID;
                        AppletManager.SelectedAppletAID = SelectedAppletAID;
                        AppletManager.installbc = installbc;
                    } else { gpID = opID;  }

                } else{found = false}
            }


            if (!found) {
                gSW = "0x6A82"; //@adam no applet found code
            } else {
                if (gSW == "") { gSW = "0x9000"; }; //@adam succesful execution
            }

            return gSW;
        }
        
        var strout = "";
        select_statement_flag = 0;
        if ((AppletManager.SelectedAppletIndex == -1) && (CLA == 0x80)) {

            switch (INS) {
                case 0xB0: //New Package
                    PageMethods.newPackage(cardname);
                    installation_failed = false;
                    gSW = "0x9000";
                    break;
                case 0xB2: //New Component
                    if (!installation_failed) {

                        AppletManager.CurrentComponent = P1;
                        PageMethods.startComponent(cardname, P1);

                        gSW = "0x9000";
                    } else { gSW = "0x6421"; };
                    break;
                case 0xB4: //Component Data
                    var data = buffer.slice(5, 5 + LC);
                    if (!installation_failed) {
                        asyncState = false;
                        //why get current component from variable and not from parameter?
                        PageMethods.writeComponent(cardname, AppletManager.CurrentComponent, data, Result_Method);
                        response = Result;
                    
                        if (response == 0) { gSW = "0x9000" } else { gSW = "0x" + response.toString(16); PageMethods.abortPackage(cardname); installation_failed = true;};
                    } else { gSW = "0x6421"; };
                    break;
                case 0xB8: //Create Instance
                    
                    var AIDLength = buffer[5];
                    var compArray = [];

                    var sAID = "";
                    var pID = 0;
                    
                    var appref = 0;

                    for (var j = 0; j < AIDLength; j++) {
                        sAID += addpad(buffer[6 + j]) + " ";
                    }
                    var mStr = "!";

                    var pointer = AIDLength + 6;
                    
                    PageMethods.getAppPackage(cardname, sAID, Result_Method);

                    mStr = Result;
                    var m = mStr.split(",");
                    pID = Number(m[1]);
                    AppletManager.installbc = Number(m[3]);
                    appref = Number(m[4]);

                    if (pID < 0) { return 0x6443; }
                    
                    //Load Cap file
                    gpID = pID;
                    Recover.BackupAll(); //Backup in case of failure
                    
                    CAP = getCAP(cardname, pID);


                    gsAID = sAID;
                    //Execute Install bytecode
                    var nparam = buffer[pointer];
                    //var bArray = buffer.slice(pointer + 1, pointer + nparam + 1);
                    var params = [];
                    params[0] = buffer;
                    params[1] = pointer+1;
                    params[2] = nparam;
                    //objectheap.push(null);
                    

                    executeBytecode(CAP, AppletManager.installbc, params, 1, -1);
                    
                    if (!installed_flag) { ISOException.throwIt(0x6444); };
                    //gSW = "0x9000";
                    break;
                case 0xBA: //End Package
                    gcardname = cardname;
                    if (!installation_failed) {
                        
                        PageMethods.endPackage(gcardname, Result_Method);
                        gpID = Number(Result);

                        var CAP = getCAP(cardname, gpID);

                        setupStaticFields(CAP, gpID);
                        gSW = "0x9000";
                    } else { gSW = "0x6421";}

                    
                    break;
                case 0xBC: //End Component
                    AppletManager.CurrentComponent = 0;
                    if (!installation_failed) {
                        gSW = "0x9000";
                    } else { gSW = "0x6421";}
                    break;
                case 0xBE: //Abort Package
                    AppletManager.CurrentComponent = 0;
                    PageMethods.abortPackage(gcardname);
                    gSW = "0x9000";
                    break;
                default:
                    gSW = "0x6D00";
                    break;
            } 
            
        } else if (AppletManager.SelectedAppletIndex > -1) {
            //Process APDU

            var CAP = getCAP(cardname, gpID);
            
            var startcode = getStartCode(CAP, AppletManager.installbc, 7);
            var params = [];
            params[0] = 0; //objectheap.length;
 
            Recover.BackupAll();
 
            executeBytecode(CAP, startcode, params, 0, gRef);

            strout = ""
            if (apdu.getCurrentState() >= 3) {
                for (var k = 0; k < APDU.buffer.length; k++) {
                    strout += addX(addpad(APDU.buffer[k])) + " ";
                }
            }

        } else { return "0x6D00"; }


        if (gSW == "") { gSW = "0x9000"; }
        return strout + " " + gSW;

    }

    

    function getStartCode(CAP,installbc,token) {
        var methdiff = 10000;
        var startcode = 0;
        //find class
        for(var j = 0; j < CAP.COMPONENT_Class.i_count; j++) {
            var cc = CAP.COMPONENT_Class.interface_info[j];
            if(!cc.flag_interface) {
                if ((cc.super_class_ref1 >= 128) && (cc.super_class_ref2 == 3) && (cc.public_method_table_base + cc.public_method_table_count - 1 >= token) && (cc.public_method_table_base <= token)) {
                    var tempdiff = cc.public_virtual_method_table[token - cc.public_method_table_base] - installbc;
                    if ((tempdiff < methdiff) && (tempdiff > 0)) {
                        methdiff = tempdiff;
                        startcode = cc.public_virtual_method_table[token - cc.public_method_table_base];
                    }
                }
             }
        }
        return startcode;
    }


}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= Number(new Date().getTime())) {
    }
}

function addpad(d) {
    var hex = Number(d).toString(16);

    while (hex.length < 2) {
        hex = "0" + hex;
    }

    return hex; //"0x" +
}

function addX(d) { return "0x" + d;}


function setupStaticFields(CAPfile,pk) {

    //setup static fields
    var s = "";
    //segment 1

    var sri = CAPfile.COMPONENT_StaticField.array_init_count; 

    for (var j = 0; j < sri; j++) {
        var t = CAPfile.COMPONENT_StaticField.array_init[j].type;
        var ct = CAPfile.COMPONENT_StaticField.array_init[j].count;
        var vals = CAPfile.COMPONENT_StaticField.array_init[j].values;
        var size = 0;
        switch (t) {
            case 2:
            case 3:
                size = 1; break;
            case 4:
                size = 2; break;
            case 5:
                size = 4; break;
        }

        var ratio = (ct / size);
        ghs = getHeapSize();
        s += (ghs >> 8) & 0xFF + "," + ghs & 0xFF + ",";

        setHeap(-1, ratio);
        var k = 0;
        var tempval;
        for (var k = 0; k < ratio;) {

            switch (size) {
                case 1:
                    tempval = vals[k];
                    break;
                case 2:
                    tempval = (vals[k] << 8) + vals[k + 1];
                    break;
                case 4:
                    tempval = (vals[k] << 24) + (vals[k + 1] << 16) + (vals[k + 2] << 8) + vals[k + 3];
                    break;
            }
            setHeap(-1, tempval);
            k += size;
        }

    }

    //segment 2

    sri = CAPfile.COMPONENT_StaticField.reference_count - sri; 
    for (var j = 0; j < sri; j++) {
        s += "0,0,";
    }

    //segment 3
    sri = CAPfile.COMPONENT_StaticField.default_value_count; 
    for (var j = 0; j < sri; j++) {
        s += "0,"; 
    }

    //segment 4
    sri = CAPfile.COMPONENT_StaticField.non_default_value_count; 
    for (var j = 0; j < sri; j++) {
        s += CAPfile.COMPONENT_StaticField.non_default_values[j] + ",";
    }

    newStaticField(pk, s);


}

