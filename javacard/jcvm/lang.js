
module.exports = {
	run: function(clas, method, type, param, obj, objref, smartcard){
		switch (clas) {
            case 0:  //Object
                return obj;
            case 1:  //Throwable
            case 2:  //Exception
            case 3:  //RuntimeException
            case 4:  //IndexOutOfBoundsException 
            case 5:  //ArrayIndexOutOfBoundsException
            case 6:  //NegativeArraySizeException
            case 7:  //NullPointerException
            case 8:  //ClassCastException
            case 9:  //ArithmeticException
            case 10:  //SecurityException
            case 11:  //ArrayStoreException

                if (method === 0) {
                    return obj.constr();
                }
                return new Error('ArrayStoreException');
            default:
                alert("unsupported class");
        }
	}
}