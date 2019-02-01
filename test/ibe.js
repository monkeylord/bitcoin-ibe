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
    it('should derive child PrivateKey correctly', function () {
      ibe.childKey(bobKey, Id1).toString().should.equal('9b4694504c8fed986849be252c4c772a28515372bf16a300c321364ae652aa1e')
    })

    it('should derive child PublicKey correctly', function () {
      var bobPublicKey = bobKey.publicKey
      ibe.childKey(bobPublicKey, Id1).toString().should.equal('03cbf13561f4b58fa7fb0c7f325d4a11b0193182b1ed39144db681d36d1ecaef13')
    })

    it('should derived child keys pairing', function () {
      var bobPublicKey = bobKey.publicKey
      ibe.childKey(bobPublicKey, Id1).toString().should.equal(ibe.childKey(bobKey,Id1).publicKey.toString())
    })
  })

  describe('Integrate Into BSV', function () {
    it('should derive child PrivateKey correctly', function () {
      bobKey.childKey(Id1).toString().should.equal('9b4694504c8fed986849be252c4c772a28515372bf16a300c321364ae652aa1e')
    })

    it('should derive child PublicKey correctly', function () {
      var bobPublicKey = bobKey.publicKey
      bobPublicKey.childKey(Id1).toString().should.equal('03cbf13561f4b58fa7fb0c7f325d4a11b0193182b1ed39144db681d36d1ecaef13')
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