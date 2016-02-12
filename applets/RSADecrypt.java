/**
 * 
 */
package com.test;

import javacard.framework.Applet;
import javacard.framework.ISO7816;
import javacard.framework.ISOException;
import javacard.framework.APDU;
import javacard.security.KeyBuilder;
import javacard.security.RSAPrivateCrtKey;
import javacardx.crypto.Cipher;

/**
 * @author Wei-Ching
 *
 */
public class ApTest extends Applet {
     
     // Import the RSA Key
     private final static byte INS_SET_PRIVATE_KEY_CRT     = 0x22;
     
     // RSA Decryption
     private final static byte INS_RSA_DEC                    = 0x30;
     
     RSAPrivateCrtKey authRSAKeyCRT;
     
     Cipher rsaCipher;
     
     public ApTest()
     {
          // Sample 512 bits key
          // P  :   E1548B9DEB7F0E2FC34C6160718DCB83622BB7A88A2908A515A8D4C9E08AE285
          // /send 8022000020E1548B9DEB7F0E2FC34C6160718DCB83622BB7A88A2908A515A8D4C9E08AE285
          // Q  :   DC0C92731999BAFD49784B479F8F6B0FC5910A19AEE62C59586981B936EA7F49
          // /send 8022010020DC0C92731999BAFD49784B479F8F6B0FC5910A19AEE62C59586981B936EA7F49
          // dP :   31DFEECF5392D9E70489617C61660B47D770E9C3EA60CEC30B9A450F321E4BA9
          // /send 802202002031DFEECF5392D9E70489617C61660B47D770E9C3EA60CEC30B9A450F321E4BA9
          // dQ :   7C58B661487430D074B5FF8447CC59A99DF12A0DFD61A06A14A5FA62598005D1
          // /send 80220300207C58B661487430D074B5FF8447CC59A99DF12A0DFD61A06A14A5FA62598005D1
          // qInv : 77DB563AE62C4734436A8265D3F1812AD227F69BFD030DA4B67DB8B592DDA887
          // /send 802204002077DB563AE62C4734436A8265D3F1812AD227F69BFD030DA4B67DB8B592DDA887
          // M : C1AFB8D9C8EB94253248454C386B2E748B692B0AE2192A930124CDE7085A54EF59913DA187143B6877BF871CAFCAC4C5DCF2680BB962B921E5A915CE098C92ED
          // E : 010001
          authRSAKeyCRT = (RSAPrivateCrtKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_CRT_PRIVATE, (short)512, false);
          
          rsaCipher = Cipher.getInstance(Cipher.ALG_RSA_NOPAD, false);
     }
     
     public static void install(byte[] bArray, short bOffset, byte bLength) {
          // GP-compliant JavaCard applet registration
          new ApTest().register(bArray, (short) (bOffset + 1), bArray[bOffset]);
     }

     public void process(APDU apdu) {          
          // Good practice: Return 9000 on SELECT
          if (selectingApplet()) {
               return;
          }

          byte[] buf = apdu.getBuffer();
          switch (buf[ISO7816.OFFSET_INS]) {
          case (byte) 0x00:
               break;          
          case INS_SET_PRIVATE_KEY_CRT:
               processSetPrivateKeyCRT(apdu);
               break;
          case INS_RSA_DEC :
               processRSADecrypt(apdu);
               break;          
          default:
               // good practice: If you don't know the INStruction, say so:
               ISOException.throwIt(ISO7816.SW_INS_NOT_SUPPORTED);
          }
     }
     
     private void processSetPrivateKeyCRT(APDU apdu)
     {
          byte baAPDUBuffer[] = apdu.getBuffer();          

         // get APDU data
         apdu.setIncomingAndReceive();
                   
          byte P1 = baAPDUBuffer[ISO7816.OFFSET_P1];
          
          short sLc = (short)(baAPDUBuffer[ISO7816.OFFSET_LC] & 0x00FF);
                    
          switch (P1)     {
          case 0x00: // Set P
               authRSAKeyCRT.setP(baAPDUBuffer, ISO7816.OFFSET_CDATA, sLc);
               break;
          case 0x01: // Set Q
               authRSAKeyCRT.setQ(baAPDUBuffer, ISO7816.OFFSET_CDATA, sLc);
               break;
          case 0x02: // Set dP
               authRSAKeyCRT.setDP1(baAPDUBuffer, ISO7816.OFFSET_CDATA, sLc);
               break;
          case 0x03: // Set dQ
               authRSAKeyCRT.setDQ1(baAPDUBuffer, ISO7816.OFFSET_CDATA, sLc);
               break;
          case 0x04: // Set invQ
               authRSAKeyCRT.setPQ(baAPDUBuffer, ISO7816.OFFSET_CDATA, sLc);
               break;
          default:
               ISOException.throwIt(ISO7816.SW_WRONG_P1P2); // throw error
          }          
     }
     
     private void processRSADecrypt(APDU apdu)
     {
          
          byte baAPDUBuffer[] = apdu.getBuffer();          

         // get APDU data
         apdu.setIncomingAndReceive();
                    
          short sLc = (short)(baAPDUBuffer[ISO7816.OFFSET_LC] & 0x00FF);
                    
          if (sLc != 64)
               ISOException.throwIt(ISO7816.SW_WRONG_LENGTH);
                         
          rsaCipher.init(authRSAKeyCRT, Cipher.MODE_DECRYPT);                    
          
          rsaCipher.doFinal(baAPDUBuffer, ISO7816.OFFSET_CDATA, sLc, baAPDUBuffer, ISO7816.OFFSET_CDATA);
          
          short sLe = apdu.setOutgoing(); 
          
          if (sLe < sLc)
               ISOException.throwIt(ISO7816.SW_WRONG_LENGTH);
           
           apdu.setOutgoingLength((short)sLc);
           apdu.sendBytesLong(baAPDUBuffer, ISO7816.OFFSET_CDATA, sLc);
     }
}
