/*
 *  RAM Functions
 */
module.exports = {
    /**
     * RAM object contructor
     * @constructor
     */
    RAM: function(){
        this.transient_data = [];
        this.gRef = undefined;
        this.asyncstate = false;
        this.transaction_buffer = [];
        this.heap = [0xA0,0x00];
        this.objectheap = [];
        this.select_statement_flag = 0; //should probabl be stored in processor
        this.installation_failed = false;
        this.installingAppletAID = undefined;
        this.currentComponent = null;
        this.tempComponents = [];
    },
    getTransientData: function(RAM){return RAM.transient_data;},
    pushTransientData: function(RAM, val){RAM.transient_data.push(val);},
    setGRef: function(RAM, val){RAM.gRef = val;},
    getSelectStatementFlag: function(RAM){return RAM.select_statement_flag;},
    setInstallingAppletAID: function(RAM, aid){RAM.installingAppletAID = aid;},
    setCurrentComponent: function(RAM, val){RAM.currentComponent = val;},
    getCurrentComponent: function(RAM){return RAM.currentComponent;},
    getTempComponents: function(RAM){return RAM.tempComponents;},
    getTempComponent: function(RAM, pos){return RAM.tempComponents[pos];},
    setTempComponent: function(RAM, pos, val){RAM.tempComponents[pos] = val;},
    resetTempComponents: function(RAM){RAM.tempComponents = [];},
}
