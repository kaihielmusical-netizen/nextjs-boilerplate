$j = jQuery;


function manageStringCapitalization( strCorrected, allowNonStandardCaps ){
	var selectedLang = $("#language option:selected").data("lang");
	if( (selectedLang == 'it') && ( ( !( $j( '#checkboxPreserveNonStandardCaps' ).is( ':visible' ) && $j( '#checkboxPreserveNonStandardCaps' ).is( ':checked' ) ) ) ) ){
		// italian uses "Sentence case", not "Title Case"
		strCorrected = sentenceCase(strCorrected);
	} else if( selectedLang == 'de' ){
		// don't fix caps
	} else if( selectedLang == 'fr' ){
		// don't fix caps
	} else if( selectedLang == 'sv' ){
		// don't fix caps
	} else if( !( $j( '#checkboxPreserveNonStandardCaps' ).is( ':visible' ) && $j( '#checkboxPreserveNonStandardCaps' ).is( ':checked' ) ) ){
		if( !allowNonStandardCaps || allowNonStandardCaps === false ){
			strCorrected = strCorrected.toTitleCase();
		}
	}
	return strCorrected;
}

// capitalize the first letter/character after a slash
function capitalizeAfterSlash( strCorrected ){
	if( strCorrected.match('\/') != null ){
		if( strCorrected.match('\/').index < strCorrected.length ){
			var nextCharAfterPunctuationPosition = strCorrected.match('\/').index+1;
			var nextCharAfterPunctuation = strCorrected.charAt(nextCharAfterPunctuationPosition);
			strCorrected = strCorrected.replaceAt(nextCharAfterPunctuationPosition,nextCharAfterPunctuation.toUpperCase());
		}
	}
	return strCorrected;
}

// upper-case the first letter/character after a colon & space 
function upperCaseAfterColonSpace( strCorrected ){
	if( strCorrected.match(/\: /) != null ){
		if( strCorrected.match(/\: /).index < strCorrected.length+1 ){
			var nextCharAfterPunctuationPosition = strCorrected.match(/\: /).index+2;
			var nextCharAfterPunctuation = strCorrected.charAt(nextCharAfterPunctuationPosition);
			strCorrected = strCorrected.replaceAt(nextCharAfterPunctuationPosition,nextCharAfterPunctuation.toUpperCase());
		}
	}
	return strCorrected;
}


// Fix capitalization
function fixCaps( str, isSongTitle, doTrim, allowNonStandardCaps, doContraction ){

	isSongTitle = (typeof isSongTitle !== 'undefined') ? isSongTitle : false;
	doTrim = (typeof doTrim !== 'undefined') ? doTrim : true;
	allowNonStandardCaps = (typeof allowNonStandardCaps !== 'undefined') ? allowNonStandardCaps : true;
	doContraction = (typeof doContraction !== 'undefined') ? doContraction : false;

	debug( isSongTitle, 'fixCaps isSongTitle' );

	if ($j('#checkboxPreserveNonStandardCaps:visible:checked').length > 0)
		{
		// cap tool
		removeHtmlFromInput(str);
		return false;
		}
	var strCorrected = $j(str).val();
	var attrName = $j(str).attr('name');

	if( !isSongTitle ){
		if (((!($j('#checkboxPreserveNonStandardCaps').is(':visible') && $j('#checkboxPreserveNonStandardCaps').is(':checked')))) && ((/[\u0400-\u04FF]/.test(strCorrected)) && (attrName != 'bandname'))) // with russian, only capitalize first letter of string (unless it's a band name)
			{
			debug('Russian caps');

			// are there featured artists? if so, preserve them so we can preserve their case
			strCorrected = strCorrected.replace("Feat.", "feat.");
			strCorrected = strCorrected.replace('\u0443\u0447\u002E', "feat."); // http://0xcc.net/jsescape/
			debug('\u0443\u0447\u002E');
			if (strCorrected.match(/\(feat\.\ (.*?)\)/) != null) // Title Case featured artists
				{
				var myFeaturedArtists = strCorrected.match(/\(feat\.\ (.*?)\)/)[1];	
				}
				
			strCorrected = strCorrected.toLowerCase();
			strCorrected = sentenceCase(strCorrected);
			
			if (typeof myFeaturedArtists != 'undefined')
				{
				debug('myFeaturedArtists: ' + myFeaturedArtists);
				debug('replacing ' + sentenceCase(myFeaturedArtists.toLowerCase()) + ' with ' + myFeaturedArtists);
				strCorrected = strCorrected.replace(sentenceCase(myFeaturedArtists.toLowerCase()),myFeaturedArtists);
				}
			strCorrected = sentenceCase(strCorrected);
			}
	}

	strCorrected = strCorrected.replace('( ', '(');
	strCorrected = strCorrected.replace(' )', ')');

	//remove html tags
	strCorrected = removeHtmlFromString(strCorrected);

	// remove semicolon
	if (strCorrected.match(';')) {
		strCorrected = strCorrected.replaceAll(';', '');
		alert('Sadly, semicolons are not allowed.');
	}
	
	// if non-english chars, exit - it mans that we still allow non-english but we have no clue how to fix it so we hope user knows what to do
	if (strCorrected.trim().match(/[^\u0000-\u007F]+/g)) { 
		debug('Exiting fixCaps() because of non-english chars: ' + strCorrected);
		$j(str).val(strCorrected);
		return false;
	}

	if( !isSongTitle ){
		strCorrected = manageStringCapitalization( strCorrected, allowNonStandardCaps );
	}

	// easy fixes
	strCorrected = strCorrected.replace("Feat,", "feat. ");
	strCorrected = strCorrected.replace("Feat.", "feat.");
	strCorrected = strCorrected.replace("(EP)", "EP");	
	strCorrected = strCorrected.replace("E.P.", "EP");	
	strCorrected = strCorrected.replace("(Single Version)", "");	
	strCorrected = strCorrected.replace("(Single)", "");	
	strCorrected = strCorrected.replace("Prod.by", "prod. by");	
	
	if (strCorrected.match(/\(LP\)/))
		{
		strCorrected = strCorrected.replace("(LP)", "");	
		alert('Digital stores don\'t allow the term "LP"');
		}

	if (strCorrected.match(/- LP\b/))
		{
		strCorrected = strCorrected.replace("- LP", "");	
		alert('Digital stores don\'t allow the term "LP"');
		}

	if (strCorrected.match(/\bLP\b/))
		{
		strCorrected = strCorrected.replace("LP", "");	
		alert('Digital stores don\'t allow the term "LP"');
		}
	
	// change "Disc 1" to "Vol. 1"
	var parting = strCorrected.match(/Disc ([0-9]+)\b/i); // "Vol 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length >= 2))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace('Disc ' + thisPart,'Vol. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// remove (explicit version)
	if (strCorrected.match(/[\[\(]?Explicit Version[\]\)]?/i))
		{
		strCorrected = strCorrected.replace(/[\(\[]?Explicit Version[\]\)]?/i, "");	
		alert('Stores don\'t allow "Explicit Version" in the song title. Instead, choose "YES" in the "Explicit Lyrics" selector, below.');
		}

	// remove (explicit version)
	if (strCorrected.match(/[\[\(]?Explicit Lyrics[\]\)]?/i))
		{
		strCorrected = strCorrected.replace(/[\(\[]?Explicit Lyrics[\]\)]?/i, "");	
		alert('Stores don\'t allow "Explicit Lyrics" in the song title. Instead, choose "YES" in the "Explicit Lyrics" selector, below.');
		}

	// remove (explicit)
	if (strCorrected.match(/[\[\(]explicit[\]\)]/i))
		{
		strCorrected = strCorrected.replace(/[\(\[]explicit[\]\)]/i, "");	
		alert('Stores don\'t allow "Explicit Version" in the song title. Instead, choose "YES" in the "Explicit Lyrics" selector, below.');
		}

	// remove (explicit)
	if (strCorrected.match(/[\[\(]explicit[\]\)]/i))
		{
		strCorrected = strCorrected.replace(/[\(\[]explicit[\]\)]/i, "");	
		alert('Stores don\'t allow "Explicit" in the song title. Instead, choose "YES" in the "Explicit Lyrics" selector, below.');
		}

	// remove (clean)
	if (strCorrected.match(/[\[\(]clean[\]\)]/i))
		{
		strCorrected = strCorrected.replace(/[\(\[]clean[\]\)]/i, "");	
		alert('Stores don\'t allow "Clean" in the song title. Instead, choose "NO" in the "Explicit Lyrics" selector, below.');
		}

	var corrections = [];
	
	// did they forget spaces?
	strCorrected = strCorrected.replace(/\)\[/g,') [');
	
	// is the artist entering their own name after a dash?
	if ($j('[name="bandname"]').length != 0)
		{
		wonkyArtistDashRegex = new RegExp("- " + escapeRegExp($j('[name="bandname"]').val()));
		strCorrected = strCorrected.replace(wonkyArtistDashRegex,'');
		}
		
	// change "Song Vol.1" to "Song, Vol. 1"
	var parting = strCorrected.match(/ Vol\.([0-9]+)($| \()/i); // "Vol 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 3))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' Vol\.' + thisPart,', Vol. ' + thisPart);
		strCorrected = strCorrected.replace(' VOL\.' + thisPart,', Vol. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song Vol 1." to "Song, Vol. 1"
	var parting = strCorrected.match(/ Vol ([0-9]+)(\.|$| \()/); // "Vol 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 3))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' Vol\.' + thisPart,', Vol. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song (ft. Bob)" to "Song (feat. bob)"
	var parting = strCorrected.match(/[\(\[]Ft\. ([^\)]*)?[\)\]]/i); 
	if ((parting != null) && (parting.length == 2))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace('Ft\. ' + thisPart,'feat. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song,Pt.1" to "Song, Pt. 1"
	var parting = strCorrected.toLowerCase().match(/[^ ]\,pt\. /); // "Vol 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 1))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(",pt.",", Pt.");
		$j('.partingInstructions').show();
		}
	
	// change "Song Vol. 1" to "Song, Vol. 1"
	var parting = strCorrected.match(/ Vol\. ([0-9]+)($| \()/i); // "Vol 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 3))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' Vol. ' + thisPart,', Vol. ' + thisPart);
		strCorrected = strCorrected.replace(' VOL. ' + thisPart,', Vol. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song Pt. 1" to "Song, Pt. 1"
	var parting = strCorrected.match(/ Pt\. ([0-9]+)($| \()/i); // "Vol 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 3))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' Pt. ' + thisPart,', Pt. ' + thisPart);
		strCorrected = strCorrected.replace(' PT. ' + thisPart,', Pt. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song - Part 1" to "Song, Pt. 1"
	var parting = strCorrected.match(/ \- Part ([0-9]+)($| \()/); // "Part 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 3))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' \- Part ' + thisPart,', Pt. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song: Chapter 1" to "Song, Chapter 1"
	var parting = strCorrected.match(/\: Chapter ([0-9]+)($| \()/); // "Part 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 3))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace('\: Chapter ' + thisPart,', Chapter ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song Part 1" to "Song, Pt. 1"
	var parting = strCorrected.match(/ Part ([0-9]+)$/)
	if ((parting != null) && (parting.length == 2))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' Part ' + thisPart,', Pt. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song Pt 1" to "Song, Pt. 1"
	var parting = strCorrected.match(/ Pt ([0-9]+)$/)
	if ((parting != null) && (parting.length == 2))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' Pt ' + thisPart,', Pt. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song Part II" to "Song, Pt. 2"
	var parting = strCorrected.match(/ Part (I|II|III|IV|V|VI|VII|VIII|IX|X)$/);
	if ((parting != null) && (parting.length == 2))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' Part ' + thisPart,', Pt. ' + Number.fromRoman(thisPart));
		$j('.partingInstructions').show();
		}
	
	// change "Song - Part 1" to "Song, Pt. 1"
	var parting = strCorrected.match(/ \- Part ([0-9]+)($| \()/); // "Part 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 3))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' \- Part ' + thisPart,', Pt. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song (Vol. 1)" to "Song, Vol. 1"
	var parting = strCorrected.match(/ \(Vol\. ([0-9]+)?\)/);
	debug(parting);
	if ((parting != null) && (parting.length > 1))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(/ \(Vol\. [0-9]+?\)/,', Vol\. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song Volume 1" to "Song, Vol. 1"
	var parting = strCorrected.match(/ [\(\[]Volume ([0-9]+)[\)\]]/); // "Part 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 2))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' (Volume ' + thisPart + ')',', Vol. ' + thisPart);
		$j('.partingInstructions').show();
		}

	// change "Song Volume 1" to "Song, Vol. 1"
	var parting = strCorrected.match(/ [\(\[]Volume ([0-9]+)[\)\]]/); // "Part 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 2))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' (Volume ' + thisPart + ')',', Vol. ' + thisPart);
		$j('.partingInstructions').show();
		}

	// change "Song Vol 1" to "Song, Vol. 1"
	var parting = strCorrected.match(/ Vol ([0-9]+)($| \()/); // "Part 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 3))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' Vol ' + thisPart,', Vol. ' + thisPart);
		$j('.partingInstructions').show();
		}
		
	// Fix contractions 
	if( doContraction ){
    	var contractionObj = JSON.parse($j('#newAlbumAutocorrect').text());
		for (var k in contractionObj){
			var item = contractionObj[k];
			strCorrected = strCorrected.replace(new RegExp("\\b" + k + "\\b", "gi"), item);
		}
	}
		
	strCorrected = strCorrected.replace(/''/g, "'");
	
	// change "Song Volume: 1" to "Song, Vol. 1"
	var parting = strCorrected.match(/ Volume\: ([0-9]+)($| \()/); // "Part 1" followed by end of line, or open parens
	if ((parting != null) && (parting.length == 3))
		{
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' Volume: ' + thisPart,', Vol. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "Song (Part 1)" to "Song, Pt. 1"
	var parting = strCorrected.match(/\(Part ([0-9]+)\)/); // (Part 1)
	if ((parting != null) && (parting.length == 2))
		{
		var partingStr = parting[0];
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' ' + partingStr,', Pt. ' + thisPart);
		$j('.partingInstructions').show();
		}
		
	// did they forget parens around feat.? Ex: "Song Feat. Bob"
	var feat = strCorrected.match(/ feat\. [^/)]+$/);
	if (feat != null)
		{
		strCorrected = strCorrected.replace('feat','(feat');
		strCorrected = strCorrected + ')';
		}
	
	// change "Song (Pt. 1)" to "Song, Pt. 1"
	var parting = strCorrected.match(/\(Pt\. ([0-9]+)\)/); // (Part 1)
	if ((parting != null) && (parting.length == 2))
		{
		var partingStr = parting[0];
		var thisPart = parting[1];
		strCorrected = strCorrected.replace(' ' + partingStr,', Pt. ' + thisPart);
		$j('.partingInstructions').show();
		}
	
	// change "inst" to "instrumental"
	strCorrected = strCorrected.replace(/ Inst\.$/,' (Instrumental)');
	strCorrected = strCorrected.replace(/ Inst$/,' (Instrumental)');
	strCorrected = strCorrected.replace(/\(Inst\.\)/,'(Instrumental)');
	strCorrected = strCorrected.replace(/\(Inst\)/,'(Instrumental)');
	
	// change "My Song (feat. Guy 1, Guy 2, & Guy 3)" to "My Song (feat. Guy 1, Guy 2 & Guy 3)"
	var isMatch = strCorrected.match(/\(feat\. .*?, &.*?\)/i);
	if (isMatch != null)
		{
		strCorrected = strCorrected.replace(', &',' &');
		}
	
	// change "Pt 1" to "Pt. 1"
	var partWithoutDot = new RegExp('([ \,])(pt)( [0-9]+)', "i")
	strCorrected = strCorrected.replace(partWithoutDot, "$1Pt.$3");


	// did they put (cover) in a song title?
	var isCover = strCorrected.match(/\(.*cover?\)/i);
	if (isCover)
		{
		alert('Looks like you\'re uploading a cover! That\'s cool, but don\'t put "' + isCover[0] + '" in the song title.\n\nJust put the song title, and no other information. Don\'t put the word "cover", don\'t put the original songwriter\'s name, don\'t put the instruments, style, or any other information.');
		strCorrected = strCorrected.replace(isCover[0],'');
		}
	
	// change "Pt.1" to "Pt. 1"
	var partWithoutDot = new RegExp('([ \,])(pt\.)([0-9]+)', "i")
	strCorrected = strCorrected.replace(partWithoutDot, "$1Pt. $3");
	
	// does the song title have a dash like "Song Title - Some Explanitory Reference"?
	if (strCorrected.match(/\- .*$/g) != null)
		{
		var dashAndWords = strCorrected.match(/\- .*$/g);
		if (dashAndWords.length == 1)
			{
			dashAndWords = dashAndWords[0].trim();
			var explanitoryReference = dashAndWords.replace(/\- /g,'').trim();
			var suggestedFormatting = strCorrected.replace(dashAndWords,' (' + explanitoryReference + ')');
			suggestedFormatting = suggestedFormatting.replace(/\s{2,}/g, ' ') // get rid of extra spaces
			var suggestedDashPopup = confirm('Looks like you\'re using a dash to denote an explanatory reference. If that\'s the case, stores will reject it.\n\nWe suggest converting:\n' + strCorrected + '\n\nTo:\n' + suggestedFormatting + '\n\nIs this okay?');
			if (suggestedDashPopup)
				{
				$j('#appleArtistIdContainer').show();
				$j('#artistName').attr('oldvalue',''); // activates apple artistid detection 
				$j('#artistName').keyup(); // activates apple artistid detection 				
				strCorrected = suggestedFormatting;
				}
			}
		}
		
	/*
	var parensArr = strCorrected.match(/\(.*?\)/g);
	if ((parensArr != null) && (parensArr.length > 1))
		{
		for (var i = 1; i < parensArr.length; i++) // start at 2nd (array pos 1) set of parens
			{
			var thisParens = parensArr[i];
			thisParens = thisParens.replace('(','[');
			thisParens = thisParens.replace(')',']');
			strCorrected = strCorrected.replace(parensArr[i],thisParens);
			}
		}
	*/
	
	// fix multiple sets of parens, turn them into brackets (function in header.js)
	strCorrected = fixMultipleSetsOfParensAndBracketsInSongTitle(strCorrected);

	// forgot a space before (feat.)?
	if (strCorrected.match(/[^ ]\(feat\./g) != null)
		{
		strCorrected = strCorrected.replace('(feat',' (feat');
		}

	// convert multiple spaces to 1 space 
	strCorrected = strCorrected.replace(/\s{2,}/g, ' ');

	// convert multiple commas to 1 comma 
	strCorrected = strCorrected.replace(/\,{2,}/g, ',');

	// spaces before or after parens? 
	strCorrected = strCorrected.replace(/\( /g,'(');
	strCorrected = strCorrected.replace(/ \)/g,')')
	strCorrected = strCorrected.replace(/\[ /g,'[');
	strCorrected = strCorrected.replace(/ \]/g,']')

	// put a space before a comma?
	if (strCorrected.match(' ,') != null)
		{
		strCorrected = strCorrected.replace(/\ \,/g,',');
		}
		
	// did they put quotes around the word "feat."?
	strCorrected = strCorrected.replace(/\"feat\.\"/g,'feat.')

	// did they include a year?
	/*
	var currentYear = new Date().getFullYear();

	for (i = currentYear-10; i <= currentYear+1; i++) 
		{
		var hasYear = strCorrected.match(i);
		if (hasYear != null)
			{
			strCorrected = strCorrected.replace(i,'');
			alert('Looks like you included the year ' + i + '. Stores don\'t allow that. If you\'re looking to specify the original recording date, set your Release Date to that year.');
			}
		}
	*/
	
	// convert Produced by to prod.?
	strCorrected = strCorrected.replace(/Produced by/g,'prod.')

	// convert "(Feat ..." to "(feat. ..."?
	strCorrected = strCorrected.replace('(Feat ','(feat. ')
	strCorrected = strCorrected.replace('[Feat ','[feat. ')
	
	// did the user used question marks instead of commas in his featured artists?
	if (strCorrected.match(/\(feat\. [^\)]+/g))
		{
		var questionString = strCorrected.match(/\(feat\. [^\)]+/g)[0];
		var questionStringOriginal = questionString;
		var questionArray = questionString.match(/ &/g);
		if (questionArray)
			{
			for (var i = 0; i < questionArray.length-1; i++) // minus 1, because keep the last one a question mark
				{
				questionString = questionString.replace(/ &/, ',')
				}
			strCorrected = strCorrected.replace(questionStringOriginal,questionString);
			}
		}
	// trim whitespace
	if (doTrim){
		strCorrected = strCorrected.trim();
	}

	// get rid of (original) and (original mix) and (original version) etc...
	debug('strCorrected before:');
	debug(strCorrected);
	debug('strCorrected after:');
	debug(strCorrected.replace(/[\(\[]Original Version.*?[\)\]]/g,''));

	if (strCorrected.replace(/[\(\[]Original Version.*?[\)\]]/g,'') != strCorrected)
		{	
		strCorrected = strCorrected.replace(/[\(\[]Original Version.*?[\)\]]/g,'').trim();
		corrections.push('original mix');
		}
	if (strCorrected.replace(/[\(\[]Original Mix.*?[\)\]]/g,'') != strCorrected)
		{	
		strCorrected = strCorrected.replace(/[\(\[]Original Mix.*?[\)\]]/g,'').trim();
		corrections.push('original mix');
		}
	
	// convert OST by to Original Soundtrack? (make sure this is below "original mix" removals n whatnot)
	strCorrected = strCorrected.replace(/\bOST\b/g,'Original Soundtrack')
	strCorrected = strCorrected.replace(/O\.S\.T\./,'Original Soundtrack')

	if (corrections.indexOf('original mix') != -1)
		{
		alert('We removed the word "Original" from your song title. Stores don\'t allow that. If it\'s the original version, no need to say so.');
		}
		
	// forgot closed parens? 
	if ((strCorrected.match(/\(feat\./)) && (!strCorrected.match(/\)/)))
		{
		strCorrected = strCorrected + ')';
		}

	// forgot a space after ampersand? 
	if (strCorrected.match(/\(feat\. .*?\&[^ ]/))
		{
		strCorrected = strCorrected.replace(/\&/,'& ');
		}
		
	// did they start & end with quotes? 
	if (strCorrected.match(/^\".*\"$/))
		{
		strCorrected = strCorrected.replace(/^\"/,'');
		strCorrected = strCorrected.replace(/\"$/,'');
		}
		
	/* DC-4562 - for Artist name, do not mess with capitalisation
	if( !isSongTitle ){
		strCorrected = capitalizeLetterAfterPeriod(strCorrected);
	}
	*/

	// get rid of extra spaces and parens 
	strCorrected = strCorrected.replace(/\({2,}/g, '(');
	strCorrected = strCorrected.replace(/\){2,}/g, ')');
	strCorrected = strCorrected.replace(/\s{2,}/g, ' ');
	debug('done in function:');
	debug(strCorrected);
	
	if( !isSongTitle ){
		// capitalize the first letter/character after a slash
		strCorrected = capitalizeAfterSlash( strCorrected );
	}

	// lower-case the first letter/character after a dollar sign 
	if (strCorrected.match(/\$/) != null)
		{
		if (strCorrected.match(/\$/).index < strCorrected.length)
			{
			var nextCharAfterPunctuationPosition = strCorrected.match(/\$/).index+1;
			var nextCharAfterPunctuation = strCorrected.charAt(nextCharAfterPunctuationPosition);
			strCorrected = strCorrected.replaceAt(nextCharAfterPunctuationPosition,nextCharAfterPunctuation.toLowerCase());
			}
		}

	if( !isSongTitle ){
		// upper-case the first letter/character after a colon & space
		strCorrected = upperCaseAfterColonSpace( strCorrected );
	}

	$j(str).val(strCorrected);

	if ($j('.newCollaboratorLink').is(':visible'))
		{
		collaboratorKeydown();
		}

	return strCorrected
	}


function fixSongTitleCaps( str ){
	handleNonStandardCapCheckbox( $j(str).val() );
	return fixCaps(
		str,
		true, // isSongTitle
		true, // doTrim
		true, // allowNonStandardCaps
		false // doContraction
	);
}

function nonStandardCaps( str ){
	// Farm it off to the actual method
	return fixCaps( 
		str,
		false, // isSongTitle
		true, // doTrim
		true, // allowNonStandardCaps
		false // doContraction
	);
}

/**
 * Removes the HTML from the given input field's current value
 * 
 * @param input Expects an HTML text input
 * @returns the cleaned string with no HTML
 */
function removeHtmlFromInput( input ) {
	var val = $(input).val();
	var correctedVal = (removeHtmlFromString(val));
	$(input).val(correctedVal);

	return correctedVal;
}

/**
 * Removes the HTML from a given string
 * 
 * @param string String to clean HTML from
 * @returns the cleaned string with no HTML
 */
function removeHtmlFromString( string ) {
	if(string.match(/(<([^>]+)>)/gi)) {
		string = string.replace(/(<([^>]+)>)/gi, '');
		alert('Not allowed to put html in an entry.');
	}

	return string;
}

function removeNotAllowedChars(input) {
	var strCorrected = $j(input).val();
	// remove semicolon
	if (strCorrected.match(';')) {
		strCorrected = strCorrected.replaceAll(';', '');
		alert('Sadly, semicolons are not allowed.');
		$j(input).val(strCorrected)
	}
}