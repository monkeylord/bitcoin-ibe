# SECURITY CONCERN: CHILD PRIVATE KEY DERIVING IS REVERSABLE, YOU SHOULD NOT EXPOSE ANY OF YOUR PRIVATE KEY
# Bitcoin-IBE
Bitcoin ID-Based Encryption

Derive Child Keys from Parent Keys and ASCII string.

It's not exactly the IBE in pairing cryptography, but is IBE-like and useful in child key deriving.

### What IBE do in Bitcoin

#### Child Key Deriving

With Bitcoin-IBE, you are allowed to use Child Public/Private Key like 

~~~
coffee@[Key]
Jack@[BitMail Key]
[Key]/coffee

or

Version1@([FileSystemKey]/home/fileA)
~~~

Bitcoin-IBE can derive child public key from parent public key without knowing parent/child private key, while Bitcoin-IBE derive coordinated child private key with master private key, with same ASCII string.

NOTE: It's an IBE-like method, but not as secure as IBE. Child Private Key Deriving is reversible if others know `Parent Public Key`, `Child Private Key` and `ID`. You should keep all private keys secret and never expose any of them. (or keep `ID` secret)

#### ID-Based Encryption on secp256k1

It's hard to find a bilinear pairing on secp256k1, PR welcomed if you can build one.

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

The security concern here is reusing private key, it may be possible to extract master private key from child keys' signatures when using a faulty random number generator.

So if Bob want to spend those transactions, it's recommanded that bob spent all transactions once, and change his public key.

#### Anonymous Communication with ECIES

With help of ECIES, anonymous communication is enabled.

Alice knows Bob's Identity Public Key(IPK), which is used in ECIES, and never used to sign.

> 1. Alice generate a alice session key, then send alice session public key to Bob's IPK address, encrypted with ECIES.
> 2. Bob decrypt the session public key, and derive multiple child public keys (from child key '1' to 'n') from it as communication address.
> 3. Bob generate a bob session key, then send Bob session public key to alice_session_public_key.childKey('0').address, encrypted with ECIES.
> 4. Now both Alice and Bob can send messages to each other, without revealing who the messages are sending to.

Alice can also negociate sessions with Bob_IPK.childKey('Secret only shared between Alice and Bob'), which initiate hidden session.

#### Public Indentity with Certificate

As far as we know, ECDSA signature's security may be weaken by reusing. Child key derivation won't mitigate this.

Besides, public key can be extracted from ECDSA signature, which will reveal signer's identity to the public(Sometimes you don't want to let everyone know) when signature goes public.

So if you want to post something on chain publicly with your signature, it's safer to use a certificate which enable you with non-ECDSA signature.

> 1. You have an Indentity Key.
> 2. You sign a certificate with it, and public it(or it's signature) on chain with the Indentity Public Key(IPK).
> 3. You sign a message(a blog maybe) with certificate, and post the message and signature to IPK.childKey('Shared Secret like "blog"').childKey('1').address
> 4. Now anyone who knows the 'Shared Secret' and your certificate can locate your message and verify it.

As you only sign once, there won't be reusing problem.

In this scenerio, your public keys on blockchain are used as address, and address only. (You can attach a donation address to your blog if you want some)

#### Public Indentity with Pairing-Based IBE(The real one)

Just the same with `Public Indentity with Certificate`, but certificate is replaced with public parameters of pairing-based IBE.

> 1. You have an Indentity Key.
> 2. You sign a set of public parameters with Indentity Key, and public it on chain with the Indentity Public Key(IPK).
> 3. You sign a message(a blog maybe) with IBEKEY('Shared Secret like "blog"'||'1'), and post the message and signature to IPK.childKey('Shared Secret like "blog"').childKey('1').address
> 4. Now anyone who knows the 'Shared Secret' can locate your message and verify it.

In this scenerio, you are actually playing PKG(for youself in this case), it's possible to use all IBE tricks, while child key derivation provide addresses for the same ID.

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
//<PublicKey: 030aed0a4592715acd59bec6c4311fae0eb6465f23eca7c0fdf0cdac50f5a36b9f>
~~~

#### Derive Public Key with Parent Public Key

~~~javascript
var ibe = require("bitcoin-ibe");

var id = "Some_ASCII_String";
var childPublicKey = ibe.CKDpub(parentPublicKey,id);
//<PublicKey: 03f9b7bd8cde33f80acbfa49c7d133fe2901450fe5a97ac505c816ae6ee1dd6be1>

//Or use integrated way.
var childPublicKey = parentPublicKey.childKey(id);

~~~

#### Derive Private Key with Parent Private Key

~~~javascript
var ibe = require("bitcoin-ibe");

var id = "Some_ASCII_String";
var childPrivateKey = ibe.CKDpriv(parentPrivateKey,id);
//<PrivateKey: 38cd7085f4d645ec5655b3af75f022619abfcba4e96b231fca7ea907f5586aa7, network: livenet>

//Or use integrated way.
var childPrivateKey = parentPrivateKey.childKey(id);

//The Derived child Private/Public Key are also pair.
childPrivateKey.toPublicKey()
//<PublicKey: 03f9b7bd8cde33f80acbfa49c7d133fe2901450fe5a97ac505c816ae6ee1dd6be1>
~~~

### Specification: Key Derivation

Bitcoin IBE Key Derivation is a variant of ECDH, where ID-generated shared secret play as child PublicKey.

#### Derive Public Key with Parent Public Key

The IBE-like Child Public Key is derived in following step:

1. ID and PublicKey are serialized.
2. Let BN = HMAC-SHA256(serialized_PublicKey, serialized_id).
3. The returned public key = PublicKey.fromPoint(PublicKey * BN)

#### Derive Private Key with Parent Private Key

The IBE-like Child Private Key is derived in following step:

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

It's recommanded that Bitcoin-IBE child key be specified as 

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



### Licence

[MIT](https://github.com/monkeylord/bitcoin-ibe/blob/master/LICENSE.md)

### Reference
[ID-Based Encryption](https://en.wikipedia.org/wiki/ID-based_encryption)
