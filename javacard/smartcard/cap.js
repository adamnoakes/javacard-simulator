var component = require('./component.js');

module.exports = {
    CAPfile: function(textArray) {
        console.log("text array:");
        console.log(textArray);
        var currentData = [];
        var static_fields = [];
        for(var j = 1; j<textArray.length; j++) {
            currentData = textArray[j];
            
            switch (j) {
                case 1:
                    this.COMPONENT_Header = new component.COMPONENT(currentData);
                    break;
                case 2:
                    this.COMPONENT_Directory = new component.COMPONENT(currentData);
                    break;
                case 3:
                    this.COMPONENT_Applet = new component.COMPONENT(currentData);
                    break;
                case 4:
                    this.COMPONENT_Import = new component.COMPONENT(currentData);
                    break;
                case 5:
                    this.COMPONENT_ConstantPool = new component.COMPONENT(currentData);
                    break;
                case 6:
                    this.COMPONENT_Class = new component.COMPONENT(currentData);
                    break;
                case 7:
                    this.COMPONENT_Method = new component.COMPONENT(currentData);
                    break;
                case 8:
                    this.COMPONENT_StaticField = new component.COMPONENT(currentData);
                    break;
                case 9:
                    this.COMPONENT_ReferenceLocation = new component.COMPONENT(currentData);
                    break;
                case 10:
                    this.COMPONENT_Export = new component.COMPONENT(currentData);
                    break;
                case 11:
                    this.COMPONENT_Descriptor = new component.COMPONENT(currentData);
                    break;
                case 12:
                    this.COMPONENT_Debug = new component.COMPONENT(currentData);
                    break;
                default:
                    break;
            }
        }
    },

    getInstallOfset: function(CAP, appletAID){
        for(var i=0; i < CAP.COMPONENT_Applet.applets.length; i++){//TODO --> change from 0
            if(CAP.COMPONENT_Applet.applets[i].AID.join() === appletAID.join()){
                return CAP.COMPONENT_Applet.applets[0].install_method_offset;
            }
        }
    },
    getStartCode: function(CAP, appletAID, token){
        var methdiff = 10000;
        var startcode = 0;
        //find class
        for(var j = 0; j < CAP.COMPONENT_Class.i_count; j++) {
            var cc = CAP.COMPONENT_Class.interface_info[j];
            if(!cc.flag_interface) {
                if ((cc.super_class_ref1 >= 128) && (cc.super_class_ref2 == 3) && (cc.public_method_table_base + cc.public_method_table_count - 1 >= token) && (cc.public_method_table_base <= token)) {
                    var tempdiff = cc.public_virtual_method_table[token - cc.public_method_table_base] - this.getInstallOfset(CAP, appletAID);
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