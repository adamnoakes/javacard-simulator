var capJS = require('./cap.js');
var jcvm = require('./jcvm.js');

function Installer(processor) {
	this.processor = processor;
	this.INS = 0;
	this.P1 = 0;
	this.P2 = 0;
	this.LC = 0;
	this.buffer = undefined;
	this.currentComponent = null;
    this.tempComponents = [];
    this.installation_failed = false;
	this.execute = function(buffer){
        this.INS = buffer[1];    //@adam instruction
        this.P1 = buffer[2];     //@adam parameter 1
        this.P2 = buffer[3];     //@adam parameter 2
        this.LC = buffer[4];
        this.buffer = buffer;
        //check if function exists first
        //check if installation failed first adn return 0x6421 if true
        console.log(this.INS);
        return this[this.INS]();
	};
	this[0xB0] = function(){
		this.currentComponent = null;
        this.tempComponents = [];
        console.log("new package");
        return "0x9000"
	};
	this[0xB2] = function (){
		console.log("new compoent");
        this.currentComponent = this.P1;
        this.tempComponents[this.currentComponent] = [];
        console.log("set currentComponent");
        //AppletManager.CurrentComponent = P1;
        //PageMethods.startComponent(cardname; P1);
        console.log("new compoent");
        return "0x9000";
	};
	this[0xB4] = function(){
		//Component Data
        var data = this.buffer.slice(5, 5 + this.LC);
        //this.asyncState = false;
        console.log("component data = " + data);
        //why get current component from variable and not from parameter?
        //PageMethods.writeComponent(cardname; AppletManager.CurrentComponent; data; Result_Method);
        //response = Result;
        //this.tempComponents[this.currentComponent] = [null];
        this.tempComponents[this.currentComponent].push.apply(this.tempComponents[this.currentComponent], data);
        console.log("saved data");
        return "0x9000";
        //if (response == 0) { gSW = "0x9000" } else { gSW = "0x" + response.toString(16); PageMethods.abortPackage(cardname); installation_failed = true;};
    };
    this[0xBC] = function(){
    	//End Component
        this.currentComponent = null;
        return "0x9000";
    };
    this[0xBA] = function(){
    	//End Package (write package)
        //gcardname = cardname;
        this.processor.writePackage(new capJS.CAPfile(this.tempComponents));
        //PageMethods.endPackage(gcardname; Result_Method);
        //gpID = Number(Result);
        //clear tempcomponents
        //var CAP = getCAP(cardname; gpID);

        //setupStaticFields(CAP; gpID);
        return "0x9000";
    };
    this[0xB8] = function(){
        var AIDLength = this.buffer[5];
        var createAID = this.buffer.slice(6, 6+AIDLength);
        var params = undefined;
        //get the cap 
        var packageToCreate = this.processor.getPackage(createAID);
        //if the package does not exists the we can't create an instance --> fail.
        if(!packageToCreate){
            return "0x6443";
        }
        //console.log(packageToCreate.COMPONENT_Applet.applets);

        //For every applet in the package; we are going to create an instance of it
        //normally only one applet
        for(var i=0; i < packageToCreate.COMPONENT_Applet.applets.length; i++){//TODO --> change from 0
            install_method_offset = packageToCreate.COMPONENT_Applet.applets[0].install_method_offset;
            this.processor.setInstallingAppletAID(packageToCreate.COMPONENT_Applet.applets[0].AID);
            params =[];
            params[0] = this.buffer;
            params[1] = AIDLength + 7;
            params[2] = this.buffer[AIDLength + 1];
            console.log("attempt jcvm");
            jcvm.executeBytecode(packageToCreate, install_method_offset, params, 1, -1, this.processor);
       	}
        return "0x9000";
    };
}

exports.Installer = Installer;