    /* 
     *  RAM Functions  
     */
    module.exports = {
        getTransientData: function(RAM){return RAM.transient_data;};
        pushTransientData: function(RAM, val){RAM.transient_data.push(val);};
        setGRef: function(RAM, val){RAM.gRef = val;};
        getSelectStatementFlag: function(RAM){return RAM.select_statement_flag;};
        setInstallingAppletAID: function(RAM, aid){RAM.installingAppletAID = aid;};
        setCurrentComponent: function(RAM, val){RAM.currentComponent = val;};
        getCurrentComponent: function(RAM){return RAM.currentComponent;};
        getTempComponents: function(RAM){return RAM.tempComponents;};
        getTempComponent: function(RAM, pos){return RAM.tempComponents[pos];};
        setTempComponent: function(RAM, pos, val){RAM.tempComponents[pos] = val;};
        resetTempComponents: function(RAM){RAM.tempComponents = [];};
    }
    