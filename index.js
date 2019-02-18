var bsv = require('bsv')
var PrivateKey = bsv.PrivateKey
var PublicKey = bsv.PublicKey
var Hash = bsv.crypto.Hash
var BN = bsv.crypto.BN
var Point = bsv.crypto.Point

function CKDpriv_mul (privateKey, id, harden = false) {
  privateKey = PrivateKey(privateKey)
  var key = harden ? privateKey : privateKey.publicKey
  //hash function doesn't matter.
  var nbuf = Hash.sha256hmac(key.toBuffer(), Buffer.from(id))
  var n = BN.fromBuffer(nbuf)
  var childPrivkeyBN = privateKey.bn.mul(n).umod(Point.getN())
  return PrivateKey(childPrivkeyBN)
}

function CKDpub_mul (publicKey, id, harden = false) {
  if(harden)throw new Error('Impossible to derive hardened public key')

  publicKey = PublicKey(publicKey)
  var nbuf = Hash.sha256hmac(publicKey.toBuffer(), Buffer.from(id))
  var n = BN.fromBuffer(nbuf)
  var childPubkeyPoint = publicKey.point.mul(n)
  return PublicKey.fromPoint(childPubkeyPoint)
}

function CKDpriv_add (privateKey, id, harden = false){
  privateKey = PrivateKey(privateKey)
  var key = harden ? privateKey : privateKey.publicKey
  //hash function doesn't matter.
  var nbuf = Hash.sha256hmac(key.toBuffer(), Buffer.from(id))
  var n = BN.fromBuffer(nbuf)
  var childPrivkeyBN = n.add(privateKey.bn).umod(Point.getN())
  if (!PrivateKey.isValid(childPrivkeyBN)) {
    return CKDpriv_add(privateKey, Buffer.concat([Buffer.from(id), Buffer.from('\0')]), harden)
  }
  return PrivateKey(childPrivkeyBN)
}

function CKDpub_add (publicKey, id, harden = false){
  if(harden) throw new Error('Impossible to derive hardened public key')

  var publicKey = PublicKey(publicKey)
  var nbuf = Hash.sha256hmac(publicKey.toBuffer(), Buffer.from(id))
  var n = BN.fromBuffer(nbuf)
  var childPubkeyPoint = publicKey.point.add(Point.getG().mul(n))
  if (!PublicKey.isValid(childPubkeyPoint)) {
      return CKDpub_add(publicKey, Buffer.concat([Buffer.from(id), Buffer.from('\0')]), harden)
  }
  return PublicKey(childPubkeyPoint)
}

function childKey_mul (key, id, harden){
  if(PrivateKey.isValid(key))return CKDpriv_mul(key, id, harden)
  if(PublicKey.isValid(key))return CKDpub_mul(key, id, harden)
  return null
}

function childKey_add (key, id, harden){
  if(PrivateKey.isValid(key))return CKDpriv_add(key, id, harden)
  if(PublicKey.isValid(key))return CKDpub_add(key, id, harden)
  return null
}

PrivateKey.prototype.childKey = function (id, harden) {
  return CKDpriv_add(this, id, harden)
}

PublicKey.prototype.childKey = function (id, harden) {
  return CKDpub_add(this, id, harden)
}

PrivateKey.prototype.childKey_mul = function (id, harden) {
  return CKDpriv_mul(this, id, harden)
}

PublicKey.prototype.childKey_mul = function (id, harden) {
  return CKDpub_mul(this, id, harden)
}

module.exports = {
  CKDpriv_add: CKDpriv_add,
  CKDpub_add: CKDpub_add,
  childKey_add: childKey_add,
  CKDpriv_mul: CKDpriv_mul,
  CKDpub_mul: CKDpub_mul,
  childKey_mul: childKey_mul,
  
  CKDpriv: CKDpriv_add,
  CKDpub: CKDpub_add,
  childKey: childKey_add
}
