var capJS = require('./cap.js');
var jcvm = require('./jcvm.js');

function process(processor) {
	this[0xB0] = function(){
		processor.setCurrentComponent(null);
        processor.resetTempComponents();
        console.log("new package");
        return "0x9000";
	};
	this[0xB2] = function (){
		console.log("new compoent");
        processor.setCurrentComponent(processor.P1);
        processor.setTempComponent(processor.getCurrentComponent(), []);
        console.log("set currentComponent");
        //AppletManager.CurrentComponent = P1;
        //PageMethods.startComponent(cardname; P1);
        console.log("new compoent");
        return "0x9000";
	};
	this[0xB4] = function(){
		//Component Data
        var data = processor.buffer.slice(5, 5 + processor.LC);
        //this.asyncState = false;
        console.log("component data = " + data);
        //why get current component from variable and not from parameter?
        //PageMethods.writeComponent(cardname; AppletManager.CurrentComponent; data; Result_Method);
        //response = Result;
        //this.tempComponents[this.currentComponent] = [null];
        processor.getTempComponent(processor.getCurrentComponent()).push.apply(processor.getTempComponent(processor.getCurrentComponent()), data);
        console.log("saved data");
        return "0x9000";
        //if (response == 0) { gSW = "0x9000" } else { gSW = "0x" + response.toString(16); PageMethods.abortPackage(cardname); installation_failed = true;};
    };
    this[0xBC] = function(){
    	//End Component
        processor.setCurrentComponent(null);
        return "0x9000";
    };
    this[0xBA] = function(){
    	//End Package (write package)
        //gcardname = cardname;
        processor.writePackage(new capJS.CAPfile(processor.getTempComponents()));
        //PageMethods.endPackage(gcardname; Result_Method);
        //gpID = Number(Result);
        //clear tempcomponents
        //var CAP = getCAP(cardname; gpID);

        //setupStaticFields(CAP; gpID);
        return "0x9000";
    };
    this[0xB8] = function(){
        var AIDLength = processor.buffer[5];
        var createAID = processor.buffer.slice(6, 6+AIDLength);
        var params;
        //get the cap 
        var packageToCreate = processor.getPackage(createAID);
        //if the package does not exists the we can't create an instance --> fail.
        if(!packageToCreate){
            return "0x6443";
        }
        //console.log(packageToCreate.COMPONENT_Applet.applets);

        //For every applet in the package; we are going to create an instance of it
        //normally only one applet
        for(var i=0; i < packageToCreate.COMPONENT_Applet.applets.length; i++){//TODO --> change from 0
            install_method_offset = packageToCreate.COMPONENT_Applet.applets[0].install_method_offset;
            processor.setInstallingAppletAID(packageToCreate.COMPONENT_Applet.applets[0].AID);
            params =[];
            params[0] = processor.buffer;
            params[1] = AIDLength + 7;
            params[2] = processor.buffer[AIDLength + 1];
            console.log("attempt jcvm");
            jcvm.executeBytecode(packageToCreate, install_method_offset, params, 1, -1, processor);
       	}
        return "0x9000";
    };

    return this[processor.INS]();
}

exports.process = process;