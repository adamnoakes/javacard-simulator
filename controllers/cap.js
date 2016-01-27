module.exports = {
    getInstallOfset = function(CAP, appletAID){
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
                    var tempdiff = cc.public_virtual_method_table[token - cc.public_method_table_base] - getInstallOfset(appletAID);
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