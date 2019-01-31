# Bitcoin-IBE
Bitcoin ID-Based Encryption

Derive Child Keys from Parent Keys and ASCII string.

### What IBE do in Bitcoin

With IBE, you are allowed to use Public/Private Key like 

~~~
coffee@[Key]
Version1@/home/fileA@[FileSystemKey]
Jack@[BitMail Key]
~~~

IBE can derive child public key from master public key without knowing master/child private key, while IBE derive coordinated child private key with master private key, with same ASCII string.

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

IBE Key Derivation is similar to BIP 32, and based on same elliptic curve feature.

Thus, IBE Key Derivation should follow BIP32's approach, which will reduce complexity.

#### Derive Public Key with Parent Public Key

The IBE Child Public Key is derived in following step:

1. ID and PublicKey are serialized.
2. Let I = HMAC-SHA512(serialized_PublicKey, serialized_id).
3. Let BN = big number parsed from first 32 bytes of I.
4. The returned public key = PublicKeyfromPoint(PublicKey * BN)
5. In case returned public key is invalid, one should append 0x00 to serialized_id and proceed again.

#### Derive Private Key with Parent Private Key

The IBE Child Private Key is derived in following step:

1. Get PublicKey from PrivateKey.
2. ID and PublicKey are serialized.
3. Let I = HMAC-SHA512(serialized_PublicKey, serialized_id).
4. Let BN = big number parsed from first 32 bytes of I.
5. The returned private key = (BN * PrivateKey) mod N
6. In case returned private key is invalid, one should append 0x00 to serialized_id and proceed again.

#### IBE Key URI

The IBE should be specified as 

~~~
[ASCII_String]@[ParentKey]
~~~

ParentKey can be Public Key or Private Key.

ASCII_String is ID used to derive key from ParentKey.

The derived key is also can be used as ParentKey, the following URI is allowed

~~~
[Another_ASCII_String]@[ASCII_String]@[ParentKey]
~~~

Thus, the character '@' is preserved and should not be used in ASCII_String.

The '@' character in URI should be escaped to %40.

A URLEncoding of ASCII_String is also recommanded.

### Security

The parent keys are protected under Diffie-Hellman secert exchanges. ID with extra data are hashed to big integer, and play as private key. Let p=parent_privatekey, let n=ID-generatedInteger, N,G is from Elliptic curve.  Public Key of p is P=pG. Child private key is (m*n) mod N. Child public key is mnG (which is (mn mod P)G).

### Licence

MIT

### Reference
[ID-Based Encryption](https://en.wikipedia.org/wiki/ID-based_encryption)

[BIP 32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Child_key_derivation_CKD_functions)