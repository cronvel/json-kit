/*
	JSON Kit

	Copyright (c) 2016 - 2020 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



const spp = require( 'smart-preprocessor' ) ;

const json = {} ;
module.exports = json ;



json.stringifyStream = require( './stringifyStream.js' ) ;
json.parseStream = require( './parseStream.js' ) ;



json.stringifier = function createStringifier( options ) {
	var config = {} ;

	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	config.noDepthTracking = true ;

	// Depth limit
	if ( typeof options.depth === 'number' && options.depth > 0 ) {
		config.depthLimitValue = options.depth ;
		delete config.noDepthTracking ;
	}
	else {
		config.noDepthLimit = true ;
	}

	// Document depth limit
	if ( typeof options.documentDepth === 'number' && options.documentDepth > 0 ) {
		config.documentDepthLimitValue = options.documentDepth ;
	}
	else {
		config.noDocumentDepthLimit = true ;
	}

	// Indentation
	if ( typeof options.indent === 'string' ) {
		config.indentString = options.indent ;
		delete config.noDepthTracking ;
	}
	else {
		config.noIndent = true ;
	}

	// Use custom .toJSON() function?
	if ( options.useToJSON === false ) {
		config.noToJSON = true ;
	}

	// Ref Notations
	if ( options.circularRefNotation ) {
		config.noUniqueRefNotation = true ;
	}
	else if ( options.uniqueRefNotation ) {
		config.noCircularRefNotation = true ;
	}
	else {
		config.noCircularRefNotation = true ;
		config.noUniqueRefNotation = true ;
	}

	// Mask
	if ( ! options.propertyMask ) {
		config.noPropertyMask = true ;
	}

	// Ordered keys
	if ( options.orderedKeys ) {
		config.orderedKeys = true ;
	}

	// Use local _enumerate_
	if ( options.localEnumerate ) {
		config.localEnumerate = true ;

		// Force documentDepthLimit, even if Infinity, because localEnumerate track the documentDepth
		delete config.noDocumentDepthLimit ;
	}

	return module.preprocessorRequire( './stringify.template.js' , config , { multi: true } ) ;
} ;



json.parser = function createParser( options ) {
	var config = {} ;

	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	config.noDepthTracking = true ;

	// Depth limit
	if ( typeof options.depth === 'number' && options.depth > 0 ) {
		config.depthLimitValue = options.depth ;
		delete config.noDepthTracking ;
	}
	else {
		config.noDepthLimit = true ;
	}

	// Ref Notations
	if ( ! ( options.refNotation || options.circularRefNotation || options.uniqueRefNotation ) ) {
		config.noRefNotation = true ;
	}

	return module.preprocessorRequire( './parse.template.js' , config , { multi: true } ) ;
} ;

