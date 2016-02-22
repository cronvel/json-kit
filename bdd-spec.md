# TOC
   - [JSON](#json)
<a name=""></a>
 
<a name="json"></a>
# JSON
stringify().

```js
testStringifyEq( undefined ) ;
testStringifyEq( null ) ;
testStringifyEq( true ) ;
testStringifyEq( false ) ;

testStringifyEq( 0 ) ;
testStringifyEq( 0.0000000123 ) ;
testStringifyEq( -0.0000000123 ) ;
testStringifyEq( 1234 ) ;
testStringifyEq( -1234 ) ;
testStringifyEq( NaN ) ;
testStringifyEq( Infinity ) ;
testStringifyEq( - Infinity ) ;

testStringifyEq( '' ) ;
testStringifyEq( '0' ) ;
testStringifyEq( '1' ) ;
testStringifyEq( '123' ) ;
testStringifyEq( 'A' ) ;
testStringifyEq( 'ABC' ) ;
testStringifyEq( '\ta"b"c\n\rAB\tC\né~\'#&|_\\-ł"»¢/æ//nĸ^' ) ;
testStringifyEq( '\t\v\x00\x01\x7f\x1fa\x7fa' ) ;

testStringifyEq( {} ) ;
testStringifyEq( {a:1,b:'2'} ) ;
testStringifyEq( {a:1,b:'2',c:true,d:null,e:undefined} ) ;
testStringifyEq( {a:1,b:'2',sub:{c:true,d:null,e:undefined,sub:{f:''}}} ) ;

testStringifyEq( [] ) ;
testStringifyEq( [1,'2'] ) ;
testStringifyEq( [1,'2',[null,undefined,true]] ) ;

testStringifyEq( require( '../sample/sample1.json' ) ) ;
testStringifyEq( require( '../sample/stringFlatObject.js' ) ) ;

// Investigate why it does not work
//testStringifyEq( require( '../sample/garbageStringObject.js' ) ) ;
```

parse().

```js
testParseEq( 'null' ) ;
testParseEq( 'true' ) ;
testParseEq( 'false' ) ;

testParseEq( '0' ) ;
testParseEq( '1' ) ;
testParseEq( '123' ) ;
testParseEq( '-123' ) ;
testParseEq( '123.456' ) ;
testParseEq( '-123.456' ) ;
testParseEq( '0.123' ) ;
testParseEq( '-0.123' ) ;
testParseEq( '0.00123' ) ;
testParseEq( '-0.00123' ) ;

testParseEq( '""' ) ;
testParseEq( '"abc"' ) ;
testParseEq( '"abc\\"def"' ) ;
testParseEq( '"abc\\ndef\\tghi\\rjkl"' ) ;
testParseEq( '"abc\\u0000\\u007f\\u0061def\\"\\"jj"' ) ;

testParseEq( '{}' ) ;
testParseEq( '{"a":1}' ) ;
testParseEq( '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false}' ) ;
testParseEq( '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false,"sub":{"g":123,"h":{},"i":{"j":"J!"}}}' ) ;

testParseEq( '[]' ) ;
testParseEq( '[1,2,3]' ) ;
testParseEq( '[-12,1.5,"toto",true,false,null,0.3]' ) ;
testParseEq( '[-12,1.5,"toto",true,false,null,0.3,[1,2,3],[4,5,6]]' ) ;

testParseEq( '{"a":1,"b":"string","c":"","d":null,"e":true,"f":false,"sub":{"g":123,"h":[1,2,3],"i":["j","J!"]}}' ) ;
testParseEq( '[-12,1.5,"toto",{"g":123,"h":[1,2,3],"i":["j","J!"]},true,false,null,0.3,[1,2,3],[4,5,6]]' ) ;

testParseEq( ' { "a" :   1 , "b":  \n"string",\n  "c":"" \t,\n\t"d" :   null,"e":true,   "f"   :   false  , "sub":{"g":123,"h":[1,2,3],"i":["j","J!"]}}' ) ;

testParseEq( fs.readFileSync( __dirname + '/../sample/sample1.json' ).toString() ) ;
```

