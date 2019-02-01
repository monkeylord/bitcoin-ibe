# Bitcoin-IBE
Bitcoin ID-Based Encryption

Derive Child Keys from Parent Keys and ASCII string.

It's not exactly the IBE, but is IBE-like and useful in child key deriving.

### What IBE do in Bitcoin

With Bitcoin-IBE, you are allowed to use Public/Private Key like 

~~~
coffee@[Key]
Version1@/home/fileA@[FileSystemKey]
Jack@[BitMail Key]

or

[Key]/coffee
~~~

Bitcoin-IBE can derive child public key from parent public key without knowing parent/child private key, while Bitcoin-IBE derive coordinated child private key with master private key, with same ASCII string.

#### Anonymous Transaction

Bitcoin-IBE enable anonymous transactions

For example, if Alice want to send some transactions to Bob(real person or a filesystem).

Alice knows Bob's Public Key, but not Bob's private key.
Alice want to send a transaction to Bob, but don't want Bob revealing his public key to unlock it.

> 1. Alice use Id agreed with Bob.
> 2. Alice derive a child public key from Bob's Public Key and Id.
> 3. Alice send transaction to address associated with child public key.
> 4. Bob derive child private key from Bob's Private Key and same Id used by Alice.
> 5. Bob locate and unlock transaction send by Alice by child private key.
>

As Bob's Public Key is never revealed, Alice can send multiple transactions to different child Public Key address which can only be located by Bob. As an observer without Bob's Public Key, Carol won't know whom the transactions are sent to, nor who unlocks the transactions. 

Bob's public key can be used multiple times by Alice, while Bob can unlock transactions.


### Install

#### Nodejs

~~~shell
npm install bitcoin-ibe
~~~

#### In Browser

~~~html
<script src='https://unpkg.com/bsv'></script>
<script src='https://unpkg.com/bitcoin-ibe'></script>
~~~

### Usage

First, we have a master key pair.

~~~javascript
var bsv = require("bsv");

var parentPrivateKey = new bsv.PrivateKey();
//<PrivateKey: 93bfa48ea502c4e52d471bb59704162f35dcfa48822c6af81ff94de9567496ec, network: livenet>
var parentPublicKey = parentPrivateKey.toPublicKey();
//<PublicKey: 02033cf62f21f8cf870c310588de1ac018c042e329cd89b05cbb3cee0761fb5ee2>
~~~

#### Derive Public Key with Parent Public Key

~~~javascript
var ibe = require("bitcoin-ibe");

var pPublicKey = "02033cf62f21f8cf870c310588de1ac018c042e329cd89b05cbb3cee0761fb5ee2";
var id = "Some_ASCII_String";
var cPublicKey = ibe.CDKpub(pPublicKey,id);
//<PublicKey: 0279e8bc2a30235a77a989ed5284d05c5e8359f185401ad00e05fef5ed28c2c930>
~~~

#### Derive Private Key with Parent Private Key

~~~javascript
var ibe = require("bitcoin-ibe");

var pPrivateKey = "93bfa48ea502c4e52d471bb59704162f35dcfa48822c6af81ff94de9567496ec";
var id = "Some_ASCII_String";
var cPrivateKey = ibe.CDKpriv(pPrivateKey,id);
//<PrivateKey: f3135f809708ff6e614981dbbe5fb30eb361bb0b964a5be64ed16a9485b6f7cf, network: livenet>

//The Derived child Private/Public Key are also pair.
cPrivateKey.toPublicKey()
//<PublicKey: 0279e8bc2a30235a77a989ed5284d05c5e8359f185401ad00e05fef5ed28c2c930>
~~~

### Specification: Key Derivation

Bitcoin IBE Key Derivation is a variant of ECDH, where ID-generated shared secret play as child PublicKey.

#### Derive Public Key with Parent Public Key

The IBE Child Public Key is derived in following step:

1. ID and PublicKey are serialized.
2. Let BN = HMAC-SHA256(serialized_PublicKey, serialized_id).
3. The returned public key = PublicKey.fromPoint(PublicKey * BN)

#### Derive Private Key with Parent Private Key

The IBE Child Private Key is derived in following step:

1. Get PublicKey from PrivateKey.
2. ID and PublicKey are serialized.
3. Let BN = HMAC-SHA512(serialized_PublicKey, serialized_id).
4. The returned private key = (BN * PrivateKey) mod N

#### Demo

~~~javascript
var bsv = require('bsv')

var bob = bsv.PrivateKey()
var bobPubkey = bob.publicKey
var Id = "buy coffee"

var nbuf = bsv.crypto.Hash.sha256hmac(bobPubkey.toBuffer(),Buffer.from('Id'))
var n = bsv.crypto.BN.fromBuffer(nbuf)
console.log("n is calculated from ID and public key")

var pubkeyPoint = bobPubkey.point.mul(n)
var bobcoffeePublicKey = bsv.PublicKey.fromPoint(pubkeyPoint)
console.log("That's the address alice should sent money to: " + bobcoffeePublicKey.toAddress())

var privateBN = bob.bn.mul(n).umod(bsv.crypto.Point.getN())
var bobcoffeePrivateKey = bsv.PrivateKey(privateBN)
console.log("Derived from bob private key and Id:" + bobcoffeePrivateKey.publicKey)
console.log("Derived from bob public key and Id without knowing bob private key:" + bobcoffeePublicKey)
console.log("Bob can take the money now.")

~~~

#### IBE Key URI

The Bitcoin IBE should be specified as 

~~~
[ASCII_String]@[ParentKey]
or
[ParentKey]/[ASCII_String]
~~~

ParentKey can be Public Key or Private Key.

ASCII_String is ID used to derive key from ParentKey.

The derived key is also can be used as ParentKey, the following URI is allowed

~~~
[Another_ASCII_String]@[ASCII_String]@[ParentKey]
~~~

Thus, the character '@' is preserved and should not be used in ASCII_String.

The character '@' and '/' in URI should be escaped.

A URLEncoding of ASCII_String is also recommanded.

### Security

Let parent private key be *p* , then parent public key is pG.

Let *q* be hashed ASCII string.

The child public key derived is exactly the shared secret in ECDH. Which is 

> qpG = pqG = (pq % N)G

While the paired child private is

> pq % N

Retrieving p from *pq % N* and *q* is very hard. It may be Phi-hiding assumption used in RSA. 

However, security level may not be more than RSA-512 if an attack know both child private key and Id. So it's not adviced to reveal any of your private keys with Id. 

Retrieving *pG* from *(pq % N)G* is similar to retrieving G from qG, should be very hard.

Thus, don't play as PKG when using this method. 

You should only use this method to generate private keys for yourself, and to let other people generate child public keys from your public key and Id.

### Licence

MIT

### Reference
[ID-Based Encryption](https://en.wikipedia.org/wiki/ID-based_encryption)

[BIP 32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Child_key_derivation_CKD_functions)