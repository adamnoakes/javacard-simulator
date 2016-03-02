/*!
 * lang-exceptions
 * @author Adam Noakes
 * University of Southampton
 */

 /**
  * Module exports.
  * @public
  */

 /**
  * NOTE: possible problem with this code returning objects on method 0 instead
  * of void, will have to be checked later.
  */
 module.exports = {
     getNullPointer: function(nullPointer){
         return new Error('NullPointerException');
     },
     getArrayIndexOutOfBounds: function(){
         return new Error('ArrayIndexOutOfBoundsException');
     }
 };
