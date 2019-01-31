var bsv = require('bsv');
var PrivateKey = bsv.PrivateKey;
var PublicKey = bsv.PublicKey;
var Hash = bsv.crypto.Hash;
var BN = bsv.crypto.BN;
var Point = bsv.crypto.Point;

function CDKpriv(privateKey,id){
    var privKey = PrivateKey(privateKey)
    var idbuf = new Buffer(id);
    var pubkey = privKey.toPublicKey();
    var hash = Hash.sha512hmac(new Buffer(id),new Buffer(pubkey.toString()));
    var leftpart = BN.fromBuffer(hash.slice(0, 32));
    var newPrivateKey = leftpart.mul(privKey.bn).umod(Point.getN()).toBuffer({size: 32});
    if(!PrivateKey.isValid(newPrivateKey)){
        return CDKpriv(privateKey,Buffer.concat([idbuf,new Buffer('\0')]));
    }
    return new PrivateKey(new BN(newPrivateKey));
}
function CDKpub(publicKey,id){
    var idbuf = new Buffer(id);
    var pubkey = PublicKey(publicKey);
    var hash = Hash.sha512hmac(new Buffer(id),new Buffer(pubkey.toString()));
    var leftpart = BN.fromBuffer(hash.slice(0, 32));
    //OR if(PublicKey.isValid(Point.getG().mul(leftpart).add(pubkey.point)))
    try {
        var newpublicKey = PublicKey.fromPoint(pubkey.point.mul(leftpart));
    } catch (e) {
        return CDKpub(publicKey,Buffer.concat([idbuf,new Buffer('\0')]));
    }
    return newpublicKey;
}
module.exports = {
  CDKpriv: CDKpriv,
  CDKpub: CDKpub
}