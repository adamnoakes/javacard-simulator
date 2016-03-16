/*
 *  RAM Functions
 */
module.exports = {
    /**
     * RAM object contructor
     * @constructor
     */
    RAM: function(){
        this.transientData = [];
        this.gRef = undefined;
        this.transaction_buffer = [];
        this.installingAppletAID = undefined;
        this.selectedApplet = {'AID': undefined, 'appletRef': undefined, 'CAP': undefined};
        this.currentComponent = null;
        this.tempComponents = [];
    },
    getTransientData: function(RAM){return RAM.transientData;},
    pushTransientData: function(RAM, val){RAM.transientData.push(val);},
    setGRef: function(RAM, val){RAM.gRef = val;},
    setInstallingAppletAID: function(RAM, aid){RAM.installingAppletAID = aid;},
    setCurrentComponent: function(RAM, val){RAM.currentComponent = val;},
    getCurrentComponent: function(RAM){return RAM.currentComponent;},
    getTempComponent: function(RAM, pos){return RAM.tempComponents[pos];},
    setTempComponent: function(RAM, pos, val){RAM.tempComponents[pos] = val;},
    resetTempComponents: function(RAM){RAM.tempComponents = [];}
};
