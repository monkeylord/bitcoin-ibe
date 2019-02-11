var chai = require('chai')
var should = chai.should()
var expect = chai.expect

var ibe = require('..')
var bsv = require('bsv')

/* Test Data from IETF 5091(IBCS) */

/* HashToRange

   Input:

   s =
   54:68:69:73:20:41:53:43:49:49:20:73:74:72:69:6e:67:20:77:69:74
   :68:6f:75:74:20:6e:75:6c:6c:2d:74:65:72:6d:69:6e:61:74:6f:72
   ("This ASCII string without null-terminator")

   n = 0xffffffffffffffffffffefffffffffffffffffff

   hashfcn = 1.3.14.3.2.16 (SHA-1)

   Output:

   v = 0x79317c1610c1fc018e9c53d89d59c108cd518608
*/

var s = 'This ASCII string without null-terminator'
var v = Buffer.from('79317c1610c1fc018e9c53d89d59c108cd518608','hex')

/* Pairing

   Input:

   q = 0xfffffffffffffffffffffffffffbffff

   p = 0xbffffffffffffffffffffffffffcffff3

   E/F_p: y^2 = x^3 + 1

   A = (0x489a03c58dcf7fcfc97e99ffef0bb4634,
   0x510c6972d795ec0c2b081b81de767f808)

   B = (0x40e98b9382e0b1fa6747dcb1655f54f75,
   0xb497a6a02e7611511d0db2ff133b32a3f)

   Output:

   e'(A, B) = (0x8b2cac13cbd422658f9e5757b85493818,
   0xbc6af59f54d0a5d83c8efd8f5214fad3c)
*/

/* BFderivePubl

   Input:

   id = 6f:42:62 ("Bob")

   version = 2

   p = 0xa6a0ffd016103ffffffffff595f002fe9ef195f002fe9efb

   q = 0xffffffffffffffffffffffeffffffffffff

   P = (0x6924c354256acf5a0ff7f61be4f0495b54540a5bf6395b3d,
   0x024fd8e2eb7c09104bca116f41c035219955237c0eac19ab)

   P_pub = (0xa68412ae960d1392701066664d20b2f4a76d6ee715621108,
   0x9e7644e75c9a131d075752e143e3f0435ff231b6745a486f)

   Output:

   Q_id = (0x22fa1207e0d19e1a4825009e0e88e35eb57ba79391498f59,
   0x982d29acf942127e0f01c881b5ec1b5fe23d05269f538836)
*/

/* (BFextractPriv)

   Input:

   s = 0x749e52ddb807e0220054417e514742b05a0

   version = 2

   p = 0xa6a0ffd016103ffffffffff595f002fe9ef195f002fe9efb

   q = 0xffffffffffffffffffffffeffffffffffff

   P = (0x6924c354256acf5a0ff7f61be4f0495b54540a5bf6395b3d,
   0x024fd8e2eb7c09104bca116f41c035219955237c0eac19ab)

   P_pub = (0xa68412ae960d1392701066664d20b2f4a76d6ee715621108,
   0x9e7644e75c9a131d075752e143e3f0435ff231b6745a486f)

   Output:

   Q_id = (0x8212b74ea75c841a9d1accc914ca140f4032d191b5ce5501,
   0x950643d940aba68099bdcb40082532b6130c88d317958657)
*/

/* (BFencrypt)

      Note: the following values can also be used to test
      Algorithm 5.5.1 (BFdecrypt).

   Input:

   m = 48:69:20:74:68:65:72:65:21 ("Hi there!")

   id = 6f:42:62 ("Bob")

   version = 2

   p = 0xa6a0ffd016103ffffffffff595f002fe9ef195f002fe9efb

   q = 0xffffffffffffffffffffffeffffffffffff

   P = (0x6924c354256acf5a0ff7f61be4f0495b54540a5bf6395b3d,
   0x024fd8e2eb7c09104bca116f41c035219955237c0eac19ab)

   P_pub = (0xa68412ae960d1392701066664d20b2f4a76d6ee715621108,
   0x9e7644e75c9a131d075752e143e3f0435ff231b6745a486f)

   Output:

   Using the random value rho =
   0xed5397ff77b567ba5ecb644d7671d6b6f2082968, we get the
   following output:

   U =
   (0x1b5f6c461497acdfcbb6d6613ad515430c8b3fa23b61c585e9a541b199e
   2a6cb,
   0x9bdfbed1ae664e51e3d4533359d733ac9a600b61048a7d899104e826a0ec
   4fa4)

   V =
   e0:1d:ad:81:32:6c:b1:73:af:c2:8d:72:2e:7a:32:1a:7b:29:8a:aa

   W = f9:04:ba:40:30:e9:ce:6e:ff
*/

