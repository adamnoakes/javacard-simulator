/*!
 * lang
 * @author Adam Noakes
 * University of Southamption
 */

/**
* Module dependencies.
* @private
*/
var le = require('../java/lang/Exceptions.js');

/**
 * Module exports.
 * @private
 */
module.exports = {
	run: function(classToken, method, type, param, obj){
		switch (classToken) {
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
							return new Error('Unsupported Method');
            default:
              return new Error('Unsupported Method');
        }
	},
    newObject: function(classToken){
        switch (classToken) {
            case 0:
                return {};//new Object()
            case 1:
                return new Throwable();
            case 2:
                return new Exception();
            case 3:
                return new RuntimeException();
            case 4:
                return new IndexOutOfBoundsException();
            case 5:
                return new ArrayIndexOutOfBoundsException();
            case 6:
                return new NegativeArraySizeException();
            case 7:
                return new NullPointerException();
            case 8:
                return new ClassCastException();
            case 9:
                return new ArithmeticException();
            case 10:
                return new SecurityException();
            case 11:
                return new ArrayStoreException();
            default:
                return new Error('Unsupported Object');
        }
    }
};
