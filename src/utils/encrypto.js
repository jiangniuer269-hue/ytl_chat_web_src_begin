import CryptoJS from 'crypto-js'
export default {
    //随机生成指定数量的16进制key
     generatekey(num) {
        let library = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let key = "";
        for (var i = 0; i < num; i++) {
            let randomPoz = Math.floor(Math.random() * library.length);
            key += library.substring(randomPoz, randomPoz + 1);
        }
        return key;
    },
    
    //加密
    encrypt(word, keyStr) {
        keyStr = keyStr ? keyStr : 'XXXXXXXXXXXXX'; //判断是否存在ksy，不存在就用定义好的key
        var key = CryptoJS.enc.Utf8.parse(keyStr);
        var srcs = CryptoJS.enc.Utf8.parse(word);
        var encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        return encrypted.toString();
    },
    //解密
    decrypt(word, keyStr) {
        keyStr = keyStr ? keyStr : 'XXXXXXXXXXXXX';
        var key = CryptoJS.enc.Utf8.parse(keyStr);
        var decrypt = CryptoJS.AES.decrypt(word, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    },

     //加密
     encryptfunc(str, key, iv) {
        var encode_str = '';
        key = CryptoJS.MD5(key).toString();
        iv = CryptoJS.MD5(iv).toString();
        var crypto_key = CryptoJS.enc.Utf8.parse(key);
        var crypto_iv = CryptoJS.enc.Utf8.parse(iv.substr(0, 8));
        if (typeof (word) == 'string') {
            encode_str = CryptoJS.TripleDES.encrypt(str, crypto_key, {
                iv: crypto_iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        } else {
            encode_str = CryptoJS.TripleDES.encrypt(JSON.stringify(str), crypto_key, {
                iv: crypto_iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        }
        return encode_str.toString();
    },
    //解密
     decryptfunc(str, key, iv) {
        key = CryptoJS.MD5(key).toString();
        iv = CryptoJS.MD5(iv).toString();
        var crypto_key = CryptoJS.enc.Utf8.parse(key);
        var crypto_iv = CryptoJS.enc.Utf8.parse(iv.substr(0, 8));
        var decrypt_str = CryptoJS.TripleDES.decrypt(str, crypto_key, {
            iv: crypto_iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypt_str.toString(CryptoJS.enc.Utf8);
    },
/**
 * 加密方法
 */
  encryptnew(word,key,iv) {
    //设置秘钥和秘钥偏移量
   let SECRET_KEY = CryptoJS.enc.Utf8.parse(key);
   let SECRET_IV = CryptoJS.enc.Utf8.parse(iv);
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, SECRET_KEY, {
        iv: SECRET_IV ,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding
    })
    return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
  }

}
