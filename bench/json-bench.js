
/* global benchmark, competitor */



var json = require( '../lib/json.js' ) ;
var fs = require( 'fs' ) ;



var stringifyRaw = json.stringifier( { useToJSON: false } ) ;
var stringifyIndent = json.stringifier( { indent: '  ' } ) ;
var stringifyDepthLimit = json.stringifier( { depth: 20 } ) ;
var stringifyDepthLimit10 = json.stringifier( { depth: 10 } ) ;
var stringifyDocumentDepthLimit = json.stringifier( { documentDepth: 2 } ) ;
var stringifyCircularRefNotation = json.stringifier( { circularRefNotation: true } ) ;
var stringifyUniqueRefNotation = json.stringifier( { uniqueRefNotation: true } ) ;

var parseRaw = json.parser() ;
var parseDepthLimit = json.parser( { depth: 20 } ) ;
var parseDepthLimit10 = json.parser( { depth: 10 } ) ;
var parseRefNotation = json.parser( { refNotation: true } ) ;



benchmark( 'JSON stringify(), real-world normal object' , function() {
	
	var sample = require( '../sample/sample1.json' ) ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	var alt = require( './v0.1.7/json.js' ) ;
	competitor( 'v0.1.7' , function() {
		alt.stringify( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		stringifyRaw( sample ) ;
	} ) ;
	
	competitor( 'indent' , function() {
		stringifyIndent( sample ) ;
	} ) ;
	
	competitor( 'depthLimit' , function() {
		stringifyDepthLimit( sample ) ;
	} ) ;
	
	competitor( 'documentDepthLimit' , function() {
		stringifyDocumentDepthLimit( sample ) ;
	} ) ;
	
	competitor( 'circularRefNotation' , function() {
		stringifyCircularRefNotation( sample ) ;
	} ) ;
	
	competitor( 'uniqueRefNotation' , function() {
		stringifyUniqueRefNotation( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), real-world normal JSON' , function() {
	
	var sample = fs.readFileSync( __dirname + '/../sample/sample1.json' ).toString() ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	var alt = require( './v0.1.7/json.js' ) ;
	competitor( 'v0.1.7' , function() {
		alt.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
	
	competitor( 'depthLimit' , function() {
		parseDepthLimit( sample ) ;
	} ) ;
	
	competitor( 'refNotation' , function() {
		parseRefNotation( sample ) ;
	} ) ;
} ) ;





benchmark( 'JSON stringify(), flat object with big strings' , function() {
	
	var sample = require( '../sample/stringFlatObject.js' ) ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		stringifyRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON stringify(), flat object with big strings and full of bad chars' , function() {
	
	var sample = require( '../sample/garbageStringObject.js' ) ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		stringifyRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON stringify(), big flat object' , function() {
	
	var sample = require( '../sample/bigFlatObject.js' ) ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		stringifyRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON stringify(), big deep object' , function() {
	
	var sample = require( '../sample/bigDeepObject.js' ) ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		stringifyRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON stringify(), big deep object (1000) with depth limit' , function() {
	
	var sample = require( '../sample/bigDeepObject.js' ) ;
	
	competitor( 'Native JSON.stringify() (dont feature depth limit)' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	var alt = require( './v0.1.7/json.js' ) ;
	competitor( 'v0.1.7 (dont feature depth limit)' , function() {
		alt.stringify( sample ) ;
	} ) ;
	
	competitor( 'raw (without depth limit)' , function() {
		stringifyRaw( sample ) ;
	} ) ;
	
	competitor( 'depthLimit 10' , function() {
		stringifyDepthLimit10( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON stringify(), redundancy (objects that are in multiple places in a tree)' , function() {
	
	var s = require( '../sample/sample1.json' ) ;
	
	var sample = {
		a: s ,
		b: {
			c: "some data",
			d: s
		} ,
		e: "some data",
		f: {
			g: [ "some data" , s , "some data" , s ]
		}
	} ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	var alt = require( './v0.1.7/json.js' ) ;
	competitor( 'v0.1.7' , function() {
		alt.stringify( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		stringifyRaw( sample ) ;
	} ) ;
	
	competitor( 'uniqueRefNotation' , function() {
		stringifyUniqueRefNotation( sample ) ;
	} ) ;
} ) ;





benchmark( 'JSON parse(), dummy false' , function() {
	
	var sample = "false" ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), dummy number' , function() {
	
	var sample = "123456789.123456789" ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), dummy string' , function() {
	
	var sample = '"What a wonderful string!"' ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), dummy string one backslash' , function() {
	
	var sample = '"What a wonderful\\nstring!"' ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), dummy string many backslashes' , function() {
	
	var sample = '"\\tWhat\\n\\u0061\\u0010wonderful\\t\\u0009string!\\r\\n"' ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), flat object with big strings' , function() {
	
	var sample = JSON.stringify( require( '../sample/stringFlatObject.js' ) ) ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), flat object with big strings and full of bad chars' , function() {
	
	var sample = JSON.stringify( require( '../sample/garbageStringObject.js' ) ) ;

	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), big flat object' , function() {
	
	var sample = JSON.stringify( require( '../sample/bigFlatObject.js' ) ) ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), big flat object, prettyfied' , function() {
	
	var sample = JSON.stringify( require( '../sample/bigFlatObject.js' ) , null , '        ' ) ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), big deep object' , function() {
	
	var sample = JSON.stringify( require( '../sample/bigDeepObject.js' ) ) ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), big deep object (1000) with depth limit' , function() {
	
	var sample = JSON.stringify( require( '../sample/bigDeepObject.js' ) ) ;
	
	competitor( 'Native JSON.parse() (dont feature depth limit)' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	var alt = require( './v0.1.7/json.js' ) ;
	competitor( 'v0.1.7 (dont feature depth limit)' , function() {
		alt.parse( sample ) ;
	} ) ;
	
	competitor( 'raw (without depth limit)' , function() {
		parseRaw( sample ) ;
	} ) ;
	
	competitor( 'depthLimit 10' , function() {
		parseDepthLimit10( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), big deep object, prettyfied' , function() {
	
	var sample = JSON.stringify( require( '../sample/bigDeepObject.js' ) , null , '        ' ) ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( sample ) ;
	} ) ;
} ) ;





benchmark( 'JSON stringify() then parse(), redundancy (objects that are in multiple places in a tree)' , function() {
	
	var s = require( '../sample/sample1.json' ) ;
	
	var sample = {
		a: s ,
		b: {
			c: "some data",
			d: s
		} ,
		e: "some data",
		f: {
			g: [ "some data" , s , "some data" , s ]
		}
	} ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.parse( JSON.stringify( sample ) ) ;
	} ) ;
	
	var alt = require( './v0.1.7/json.js' ) ;
	competitor( 'v0.1.7' , function() {
		alt.parse( alt.stringify( sample ) ) ;
	} ) ;
	
	competitor( 'raw' , function() {
		parseRaw( stringifyRaw( sample ) ) ;
	} ) ;
	
	competitor( 'uniqueRefNotation/refNotation' , function() {
		parseRefNotation( stringifyUniqueRefNotation( sample ) ) ;
	} ) ;
} ) ;



