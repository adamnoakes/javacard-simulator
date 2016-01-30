/* 
 *  RAM Functions  
 */
module.exports = {
    RAM: function(){
        this.transient_data = [];
        this.gRef = undefined;
        this.asyncstate = false;
        this.transaction_flag = false;
        this.transaction_buffer = [];
        this.select_statement_flag = 0;
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
    