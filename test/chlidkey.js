var chai = require('chai')
var should = chai.should()
var expect = chai.expect

var ibe = require('..')
var bsv = require('bsv')

var aliceKey = bsv.PrivateKey('d51a296b37e924944c811a0c32a98c7a28952a5c2a37d16b44c3c67a466e3d0c')
var bobKey = bsv.PrivateKey('80595f7f87f45b91cd7f2c9cef33a74310ff984ccc1a8b82b8a7ff9f015c5f84')

var Id1 = 'Some coffee'
var Id2 = 'Maybe some suger?'
var Id3 = 'Or Milk?'

describe('IBE-like ChildKey Deriving', function () {
  describe('Standalone', function () {
    describe('Multiplication', function () {
        it('should derive child PrivateKey correctly', function () {
          ibe.childKey_mul(bobKey, Id1).toString().should.equal('9b4694504c8fed986849be252c4c772a28515372bf16a300c321364ae652aa1e')
        })

        it('should derive hardened child PrivateKey correctly', function () {
          ibe.childKey_mul(bobKey, Id1, true).toString().should.equal('b4775eb27ec1c37a197cf1f6ff2d3fde778d9068895533b2edc9785d9131cd8b')
        })

        it('should derive child PublicKey correctly', function () {
          var bobPublicKey = bobKey.publicKey
          ibe.childKey_mul(bobPublicKey, Id1).toString().should.equal('03cbf13561f4b58fa7fb0c7f325d4a11b0193182b1ed39144db681d36d1ecaef13')
        })

        it('should derived child keys pairing', function () {
          var bobPublicKey = bobKey.publicKey
          ibe.childKey_mul(bobPublicKey, Id1).toString().should.equal(ibe.childKey_mul(bobKey,Id1).publicKey.toString())
        })
    })
    describe('Addition', function () {
        it('should derive child PrivateKey correctly', function () {
          ibe.childKey_add(bobKey, Id1).toString().should.equal('77a916fc95d2a10456d4068f29c7c9b1b69130b04aebdad5b0104018e0cdc530')
        })

        it('should derive hardened child PrivateKey correctly', function () {
          ibe.childKey_add(bobKey, Id1, true).toString().should.equal('5fe4a21bf775d5e64556fa57f23438f83f6a09ed8608987bafb7dc6e09ae9534')
        })

        it('should derive child PublicKey correctly', function () {
          var bobPublicKey = bobKey.publicKey
          ibe.childKey_add(bobPublicKey, Id1).toString().should.equal('030b6c3d12b7fffeeb2363b9fc2d01dcebd54078ef1930facaab7f5bc927c9bd00')
        })

        it('should derived child keys pairing', function () {
          var bobPublicKey = bobKey.publicKey
          ibe.childKey_add(bobPublicKey, Id1).toString().should.equal(ibe.childKey_add(bobKey,Id1).publicKey.toString())
        })        
    })

  })

  describe('Integrate Into BSV', function () {
    it('should derive child PrivateKey correctly', function () {
      bobKey.childKey(Id1).toString().should.equal('77a916fc95d2a10456d4068f29c7c9b1b69130b04aebdad5b0104018e0cdc530')
    })

    it('should derive hardened child PrivateKey correctly', function () {
      bobKey.childKey(Id1, true).toString().should.equal('5fe4a21bf775d5e64556fa57f23438f83f6a09ed8608987bafb7dc6e09ae9534')
    })

    it('should derive child PublicKey correctly', function () {
      var bobPublicKey = bobKey.publicKey
      bobPublicKey.childKey(Id1).toString().should.equal('030b6c3d12b7fffeeb2363b9fc2d01dcebd54078ef1930facaab7f5bc927c9bd00')
    })

    it('should derived child keys pairing', function () {
      var bobPublicKey = bobKey.publicKey
      bobPublicKey.childKey(Id1).toString().should.equal(bobKey.childKey(Id1).publicKey.toString())
    })

    it('should chained deriving working', function () {
      bsv.PrivateKey.isValid(bobKey
        .childKey(Id1)
        .childKey(Id2)
        .childKey(Id3)
      ).should.equal(true)
      bsv.PublicKey.isValid(bobKey
        .publicKey
        .childKey(Id1)
        .childKey(Id2)
        .childKey(Id3)
      ).should.equal(true)
    })

    it('should chained deriving pairing', function () {
      bobKey.publicKey
        .childKey(Id1)
        .childKey(Id2)
        .childKey(Id3)
        .toString()
        .should.equal(bobKey
          .childKey(Id1)
          .childKey(Id2)
          .childKey(Id3)
          .publicKey
          .toString()
        )
    })
  })
})