

var json = require( '../lib/json.js' ) ;
var fs = require( 'fs' ) ;





benchmark( 'JSON stringify(), real-world normal JSON' , function() {
	
	var sample = require( '../sample/sample1.json' ) ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	var alt = require( './v0.1.7/json.js' ) ;
	competitor( 'json.stringify() v0.1.7' , function() {
		alt.stringify( sample ) ;
	} ) ;
	
	competitor( 'json.stringify()' , function() {
		json.stringify( sample ) ;
	} ) ;
	
	competitor( 'json.stringify() circularRefNotation mode' , function() {
		json.stringify( sample , { mode: 'circularRefNotation' } ) ;
	} ) ;
	
	competitor( 'json.stringify() uniqueRefNotation mode' , function() {
		json.stringify( sample , { mode: 'uniqueRefNotation' } ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), real-world normal JSON' , function() {
	
	var sample = fs.readFileSync( __dirname + '/../sample/sample1.json' ).toString() ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	var alt = require( './v0.1.7/json.js' ) ;
	competitor( 'json.parse() v0.1.7' , function() {
		alt.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse() refNotation mode' , function() {
		json.parse( sample , { mode: 'refNotation' } ) ;
	} ) ;
} ) ;





benchmark( 'JSON stringify(), flat object with big strings' , function() {
	
	var sample = require( '../sample/stringFlatObject.js' ) ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	competitor( 'json.stringify()' , function() {
		json.stringify( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON stringify(), flat object with big strings and full of bad chars' , function() {
	
	var sample = require( '../sample/garbageStringObject.js' ) ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	competitor( 'json.stringify()' , function() {
		json.stringify( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON stringify(), big flat object' , function() {
	
	var sample = require( '../sample/bigFlatObject.js' ) ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	competitor( 'json.stringify()' , function() {
		json.stringify( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON stringify(), big deep object' , function() {
	
	var sample = require( '../sample/bigDeepObject.js' ) ;
	
	competitor( 'Native JSON.stringify()' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	competitor( 'json.stringify()' , function() {
		json.stringify( sample , { depth: Infinity } ) ;
	} ) ;
} ) ;



benchmark( 'JSON stringify(), big deep object (1000) with depth limit' , function() {
	
	var sample = require( '../sample/bigDeepObject.js' ) ;
	
	competitor( 'Native JSON.stringify() (dont feature depth limit)' , function() {
		JSON.stringify( sample ) ;
	} ) ;
	
	var alt = require( './v0.1.7/json.js' ) ;
	competitor( 'json.parse() v0.1.7 (dont feature depth limit)' , function() {
		alt.stringify( sample ) ;
	} ) ;
	
	competitor( 'json.stringify() without depth limit' , function() {
		json.stringify( sample , { depth: Infinity } ) ;
	} ) ;
	
	competitor( 'json.parse() with depth limited to 10' , function() {
		json.stringify( sample , { depth: 10 } ) ;
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
	competitor( 'json.stringify() v0.1.7' , function() {
		alt.stringify( sample ) ;
	} ) ;
	
	competitor( 'json.stringify()' , function() {
		json.stringify( sample ) ;
	} ) ;
	
	competitor( 'json.stringify() uniqueRefNotation mode' , function() {
		json.stringify( sample , { mode: 'uniqueRefNotation' } ) ;
	} ) ;
} ) ;





benchmark( 'JSON parse(), dummy false' , function() {
	
	var sample = "false" ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), dummy number' , function() {
	
	var sample = "123456789.123456789" ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), dummy string' , function() {
	
	var sample = '"What a wonderful string!"' ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), dummy string one backslash' , function() {
	
	var sample = '"What a wonderful\\nstring!"' ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), dummy string many backslashes' , function() {
	
	var sample = '"\\tWhat\\n\\u0061\\u0010wonderful\\t\\u0009string!\\r\\n"' ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), flat object with big strings' , function() {
	
	var sample = JSON.stringify( require( '../sample/stringFlatObject.js' ) ) ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), flat object with big strings and full of bad chars' , function() {
	
	var sample = JSON.stringify( require( '../sample/garbageStringObject.js' ) ) ;

	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), big flat object' , function() {
	
	var sample = JSON.stringify( require( '../sample/bigFlatObject.js' ) ) ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), big flat object, prettyfied' , function() {
	
	var sample = JSON.stringify( require( '../sample/bigFlatObject.js' ) , null , '        ' ) ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), big deep object' , function() {
	
	var sample = JSON.stringify( require( '../sample/bigDeepObject.js' ) ) ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample , { depth: Infinity } ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), big deep object (1000) with depth limit' , function() {
	
	var sample = JSON.stringify( require( '../sample/bigDeepObject.js' ) ) ;
	
	competitor( 'Native JSON.parse() (dont feature depth limit)' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	var alt = require( './v0.1.7/json.js' ) ;
	competitor( 'json.parse() v0.1.7 (dont feature depth limit)' , function() {
		alt.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse() without depth limit' , function() {
		json.parse( sample , { depth: Infinity } ) ;
	} ) ;
	
	competitor( 'json.parse() with depth limited to 10' , function() {
		json.parse( sample , { depth: 10 } ) ;
	} ) ;
} ) ;



benchmark( 'JSON parse(), big deep object, prettyfied' , function() {
	
	var sample = JSON.stringify( require( '../sample/bigDeepObject.js' ) , null , '        ' ) ;
	
	competitor( 'Native JSON.parse()' , function() {
		JSON.parse( sample ) ;
	} ) ;
	
	competitor( 'json.parse()' , function() {
		json.parse( sample , { depth: Infinity } ) ;
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
	competitor( 'json.stringify() v0.1.7' , function() {
		alt.parse( alt.stringify( sample ) ) ;
	} ) ;
	
	competitor( 'json.stringify()' , function() {
		json.parse( json.stringify( sample ) ) ;
	} ) ;
	
	competitor( 'json.stringify() uniqueRefNotation mode' , function() {
		json.parse( json.stringify( sample , { mode: 'uniqueRefNotation' } ) , { mode: 'refNotation' } ) ;
	} ) ;
} ) ;



