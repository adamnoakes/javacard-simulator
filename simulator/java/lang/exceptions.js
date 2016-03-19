/*!
 * lang-exceptions
 * @author Adam Noakes
 * University of Southampton
 */

 /**
  * Module exports.
  * @public
  */

 module.exports = {
     getNullPointer: function(){
         return new Error('NullPointerException');
     },
     getArrayIndexOutOfBounds: function(){
         return new Error('ArrayIndexOutOfBoundsException');
     }
 };
