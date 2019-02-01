var bsv = require('bsv')
var PrivateKey = bsv.PrivateKey
var PublicKey = bsv.PublicKey
var Hash = bsv.crypto.Hash
var BN = bsv.crypto.BN
var Point = bsv.crypto.Point

function CKDpriv (privateKey, id) {
  var nbuf = Hash.sha256hmac(privateKey.publicKey.toBuffer(), Buffer.from(id))
  var n = BN.fromBuffer(nbuf)
  var childPrivkeyBN = privateKey.bn.mul(n).umod(Point.getN())
  return PrivateKey(childPrivkeyBN)
}

function CKDpub (publicKey, id) {
  var nbuf = Hash.sha256hmac(publicKey.toBuffer(), Buffer.from(id))
  var n = BN.fromBuffer(nbuf)
  var childPubkeyPoint = publicKey.point.mul(n)
  return PublicKey.fromPoint(childPubkeyPoint)
}

function childKey (key, id){
  if(PrivateKey.isValid(key))return CKDpriv(key, id)
  if(PublicKey.isValid(key))return CKDpub(key, id)
  return null;
}

PrivateKey.prototype.childKey = function (Id) {
  return CKDpriv(this, Id)
}

PublicKey.prototype.childKey = function (Id) {
  return CKDpub(this, Id)
}

module.exports = {
  CKDpriv: CKDpriv,
  CKDpub: CKDpub,
  childKey: childKey
}
