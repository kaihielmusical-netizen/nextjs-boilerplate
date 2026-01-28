try { 	// test browser compatibility
	window.addEventListener("error", function(evt) {
		var msg = evt.message || "unhandled error";
		logError(msg, {
			"message"  : msg,
			"filename" : evt.filename || null,
			"lineno"   : evt.lineno   || null,
			"colno"    : evt.colno    || null,
			"error"    : evt.error    || null,
			"stack"    : evt.stack    || null
		});
	});

	var foo = new FormData();
}
catch(err) {
	console.debug('Browser not compatible');
	$j(document).ready(function()
		{
		$j('#distroEntireFormContainer').html($j('#distroBrowserIncompatible').html())
		})
}

String.prototype.equalsIgnoreCase = function(other) {
	return this.toLowerCase() === other.toLowerCase();
};

String.prototype.isEmpty = function() {
    return this.trim() == "";
};

String.prototype.hashCode = function() {
	let result = 0;
	for (const char of this) {
		result = ((result << 5) - result + char.charCodeAt(0)) | 0;
	}
	return result;
}

// Global AJAX request handlers for artist search (can be aborted)
let getAppleArtistIDAjax;
let getSpotifyArtistIDAjax;
let getGoogleArtistIDAjax;

// Global timer handlers for artist search (can be cleared)
let artistAppleVerifyThingTimer;
let artistAppleSearchyThingTimer;
let artistSpotifySearchyThingTimer;
let artistGoogleSearchyThingTimer;
let artistInstagramSearchyThingTimer;
let artistFacebookSearchyThingTimer;

function randomNameGenerator()
	{
	var data = {};
	$j('.nameGeneratorSpinner').show();
	var myGet = $j.get('/api/nameGenerator/',data,function(response)
		{
		$j('.nameGeneratorSpinner').hide();
		$j('#artistName').val(response.name);
		$j('#artistName').blur();
		$j('#artistName').trigger('change');
		},'json')
	myGet.error(function()
		{
		$j('.nameGeneratorSpinner').hide();
		sweetAlert('','Oopsie, the name generator isn\'t working right now. Sorry bout dat!','error');
		})
	}


function getDurationOfFreshlyUploadedAudioFile(event,onFinish) // put this in any file input onChange. onFinish is a function
	{
	// begin: create html5 audio element
	var audioElementName = "sound_" + uuid();
	$j('body').append('<audio class="invisible" id="' + audioElementName + '" controls></audio>');
	// end: create html5 audio element
	var sound = document.getElementById(audioElementName);
	sound.onloadedmetadata = function(){onFinish(sound.duration);} // returns seconds
	sound.src = URL.createObjectURL(event.target.files[0]);
	}

function calculateCroppieMobileSelection() // based on calculateCropSelection()
	{
	// {"x1":12,"y1":0,"x2":280,"y2":268,"width":268,"height":268,"heightThumb":268,"widthThumb":280,"heightFull":2864,"widthFull":3000,"cropY":0,"cropX":128,"cropSquareSize":2864}
	var croppieDetails = $j('.artworkPreview').croppie('get'); // [topLeftX, topLeftY, bottomRightX, bottomRightY]

	var selectionElement = $j('.js-uploadSelectionInput').length ? $j('.js-uploadSelectionInput') : $j('#artwork');
	selection = {}
	selection.heightFull = selectionElement.attr('heightFull')*1;
	selection.widthFull = selectionElement.attr('widthFull')*1;
	selection.x1 = croppieDetails.points[ 0 ];
	selection.y1 = croppieDetails.points[ 1 ];
	selection.heightThumb = $j('.cr-image').height()*1;
	selection.widthThumb = $j('.cr-image').width()*1;

	if (selection.heightFull > selection.widthFull)
		{
		console.log('selection 1:');
		selection.cropX = 0;
		console.log('Math.floor(' + selection.heightFull + ' *( ' + selection.y1 + '/' + selection.heightThumb + '))')
		selection.cropY = Math.floor(selection.heightFull*(selection.y1/selection.heightThumb));
		selection.cropSquareSize = selection.widthFull;
		}
	else
		{
		console.log('selection 2:');
		selection.cropY = 0;
		selection.cropX = Math.floor(selection.widthFull*(selection.x1/selection.widthThumb));
		selection.cropSquareSize = selection.heightFull;
		}

	console.log(selection);
	$j('.artworkCropCoordinates').val(JSON.stringify(selection));
	return selection
	}

function calculateCroppieSelection() // based on calculateCropSelection()
	{
	// {"x1":12,"y1":0,"x2":280,"y2":268,"width":268,"height":268,"heightThumb":268,"widthThumb":280,"heightFull":2864,"widthFull":3000,"cropY":0,"cropX":128,"cropSquareSize":2864}
	selection = {}
	selection.heightFull = $j('#artwork').attr('heightFull')*1;
	selection.widthFull = $j('#artwork').attr('widthFull')*1;
	selection.croppie = $j('.artworkPreview').croppie('get'); // [topLeftX, topLeftY, bottomRightX, bottomRightY]
	console.debug(selection);
	$j('.artworkCropCoordinates').val(JSON.stringify(selection));
	return selection
	}

function calculateCropSelection(img,selection)
	{
	console.debug('img:');
	console.debug(img);
	selection.heightThumb = $j(img).height()*1;
	selection.widthThumb = $j(img).width()*1;
	selection.heightFull = $j('#artwork').attr('heightFull')*1;
	selection.widthFull = $j('#artwork').attr('widthFull')*1;
	console.debug('selection pre start:');
	console.debug(selection);
	console.debug('selection pre end^^');
	if (selection.heightFull > selection.widthFull)
		{
		console.debug('selection 1:');
		selection.cropX = 0;
		console.debug('Math.floor(' + selection.heightFull + ' *( ' + selection.y1 + '/' + selection.heightThumb + '))')
		selection.cropY = Math.floor(selection.heightFull*(selection.y1/selection.heightThumb));
		selection.cropSquareSize = selection.widthFull;
		}
	else
		{
		console.debug('selection 2:');
		selection.cropY = 0;
		selection.cropX = Math.floor(selection.widthFull*(selection.x1/selection.widthThumb));
		selection.cropSquareSize = selection.heightFull;
		}

	/*
	if (isNaN(selection.cropY) || isNaN(selection.cropX))
		{
		console.debug('redoing imagecropper');
		previewImageCropper('.artworkPreview');

		}
	*/

	return selection
	}

function previewImageCroppieMobile(selector) // based on previewImageCropper()
	{
	var selectionElement = $j('.js-uploadSelectionInput').length ? $j('.js-uploadSelectionInput') : $j('#artwork');
	coords = {}
	coords.heightFull = selectionElement.attr('heightFull')*1;
	coords.widthFull = selectionElement.attr('widthFull')*1;

	$j('.existingPreviewImage').hide();
	$j( '.js-uploadSelectionInput' ).hide();
	var myCroppie = $j(selector).croppie(
		{
		enableExif:true,
		viewport:{ width: 280, height: 280, type: 'square' },
		boundary:{ width: 300, height: 300 },
		enableResize: false,
		enableZoom: false,
		showZoomer: false,
		update:function(data)
			{
			calculateCroppieMobileSelection();
			previewSongTitleImage();
			}
		});
	}

function previewImageCroppie(selector) // based on previewImageCropper()
	{
	coords = {}
	coords.heightFull = $j('.artworkInputBoxVisible').attr('heightFull')*1;
	coords.widthFull = $j('.artworkInputBoxVisible').attr('widthFull')*1;

	$j('.existingPreviewImage').hide();
	$j('.distroFileInput').hide();
	$j('.artworkInputBoxInvisible').hide();
	var myCroppie = $j(selector).croppie(
		{
		enableExif:true,
		/* viewport:'square', */
		viewport:{ width: coords.widthFull, height: coords.widthFull, type: 'square' },
		update:function(data)
			{
			calculateCroppieSelection();
			}
		});
	}

function previewImageCropper(selector)
	{

	    // begin: set orientation for exif orientation
	    var input = document.getElementById('artwork');
	    $j('.existingPreviewImage').hide();
		getOrientation(input.files[0], function(orientation)
			{
			console.debug('orientation: ' + orientation);
			if (orientation == 6)
				{
				// $j('.artworkPreview').css('transform','rotate(90deg)');
				}
		    });
	    // end: set orientation for exif orientation

		var myImage = $j(selector);
		if (myImage.width() > myImage.height())
			{
			var initialX1 = myImage.width()/2-myImage.height()/2;
			var initialY1 = 0;
			var initialX2 = myImage.height()+myImage.width()/2-myImage.height()/2;
			var initialY2 = myImage.height();
			$j('.artworkInputBoxVisible').removeClass('artworkInputBoxVisibleBorder');
			$j('.resizeWithArtwork').height(myImage.height());
 			}
		else
			{
			var initialX1 = 0;
			var initialY1 = myImage.height()/2-myImage.width()/2
			var initialX2 = myImage.width();
			var initialY2 = myImage.width()+myImage.height()/2-myImage.width()/2;
			$j('.artworkInputBoxVisible').removeClass('artworkInputBoxVisibleBorder');
			$j('.resizeWithArtwork').width(myImage.width());
			}
		myImage.imgAreaSelect({ // http://odyniec.net/projects/imgareaselect/
        handles: true,
		aspectRatio:"1:1",
		resizable:false,
		handles: false,
		persistent:true,
		x1:initialX1,
		y1:initialY1,
		x2:initialX2,
		y2:initialY2,
		parent: myImage.parent(),
		onInit: function(img, selection)
			{
			previewImageCropper( '.artworkPreview' ); // workaround for chrome on windows not working on initial upload
			selection = calculateCropSelection(img,selection);
 			console.debug(selection)
			$j('.artworkCropCoordinates').val(JSON.stringify(selection));

			previewSongTitleImage();
			},
		onSelectEnd: function(img, selection)
			{
			selection = calculateCropSelection(img,selection);
			console.debug(selection)
			$j('.artworkCropCoordinates').val(JSON.stringify(selection));

			previewSongTitleImage();
			}
		})
	}

function previewSongTitleImage() {
	const artworkSrc = $j('.artworkPreview').attr('src');
	const selectionData = $j('.artworkCropCoordinates').val();
	// Handle song title preview(s)
	const songTitlePreview = $j('.songTitlePreviewArtwork');
	if (songTitlePreview.length) {
		if (artworkSrc) {
			songTitlePreview.html(`<img class="square-album-artwork" src="${artworkSrc}">`).show();
			$j('.square-album').hide();
			updateArtworkPosition($j('.square-album-artwork'), selectionData);
		} else {
			songTitlePreview.html('').hide();
			$j('.square-album').show();
		}
	}
	// Handle release preview cover art
	const rpCoverArt = $j('.rp-cover-art img');
	if (rpCoverArt.length) {
		rpCoverArt.attr('src', artworkSrc || '/images/rp-sample-image.png');
		updateArtworkPosition(rpCoverArt, selectionData);
	}
}

function updateArtworkPosition(element, selectionData) {
	if (!selectionData) {
		element.css('objectPosition', '0px 0px');
		return;
	}
	const selection = JSON.parse(selectionData);
	const songPreviewPX = element.width();
	let objectPositionRight = 0;
	let objectPositionBottom = 0;
	if (selection.widthFull > selection.heightFull) {
		// landscape
		const ratio = selection.widthFull / selection.heightFull;
		const scale = songPreviewPX / selection.widthFull;
		objectPositionRight = -Math.round(selection.cropX * scale * ratio);
	} else {
		// portrait
		const ratio = selection.heightFull / selection.widthFull;
		const scale = songPreviewPX / selection.heightFull;
		objectPositionBottom = -Math.round(selection.cropY * scale * ratio);
	}
	element.css('objectPosition', `${objectPositionRight}px ${objectPositionBottom}px`);
}

function distributionAgreement()
	{
	$j('.termsSpinner').hide();
	$j('.requiredCheckboxContainer').removeClass('checkboxHighlight');
	if ($j('.requiredTermsCheckbox:not(:checked)').length > 0)
		{
		$j('.requiredCheckboxContainer').addClass('checkboxHighlight');
		setTimeout(function()
			{
			alert('Please check the box to indicate you agree.');
			},100)
		}
	else
		{
		var data = {};
		$j('.termsSpinner').show();
		$j.post('/api/distributionAgreementAgree/',data,function()
			{
			window.location.reload(false);
			})
		}
	}

function customUpcClick(wantsCustomUpc)
	{
	if (wantsCustomUpc)
		{
		$j('.customUpcForm').slideDown('fast',function()
			{
			$j('#customUpc').focus();
			});
		}
	else
		{
		$j('.customUpcForm').stop().hide();
		$j('#customUpc').val('');
		}
	}


function setDragListeners()
	{
	// Artwork
	$j('.artworkInputBoxInvisible').on('dragover',function()
		{
		$j('.artworkInputBoxVisible').addClass('artworkInputBoxVisibleDragOver');
		$j('.artworkVisible').css('opacity','0');
		});

	$j('.artworkInputBoxInvisible').on('dragleave',function()
		{
		$j('.artworkInputBoxVisible').removeClass('artworkInputBoxVisibleDragOver');
		$j('.artworkVisible').css('opacity','1');
		});

	$j('.artworkInputBoxInvisible').on('drop',function()
		{
		$j('.artworkInputBoxVisible').removeClass('artworkInputBoxVisibleDragOver');
		$j('.artworkVisible').css('opacity','1');
		});


	// audio file
	$j(document).on('dragover', '.audioFileInputBoxInvisible', function()
		{
		$j('.audioFileInputBoxVisible').addClass('artworkInputBoxVisibleDragOver');
		//$j('.artworkVisible').css('opacity','0');
		});

	$j(document).on('dragleave', '.audioFileInputBoxInvisible', function()
		{
		$j('.audioFileInputBoxVisible').removeClass('artworkInputBoxVisibleDragOver');
		//$j('.artworkVisible').css('opacity','1');
		});

	$j(document).on('drop', '.audioFileInputBoxInvisible', function()
		{
		$j('.audioFileInputBoxVisible').removeClass('artworkInputBoxVisibleDragOver');
		//$j('.artworkVisible').css('opacity','1');
		});

	// dolbyAtmos file
	$j(document).on('dragover', '.dolbyAtmosFileInputBoxInvisible', function()
		{
		$j('.dolbyAtmosFileInputBoxVisible').addClass('artworkInputBoxVisibleDragOver');
		//$j('.artworkVisible').css('opacity','0');
		});

	$j(document).on('dragleave', '.dolbyAtmosFileInputBoxInvisible', function()
		{
		$j('.dolbyAtmosFileInputBoxVisible').removeClass('artworkInputBoxVisibleDragOver');
		//$j('.artworkVisible').css('opacity','1');
		});

	$j(document).on('drop', '.dolbyAtmosFileInputBoxInvisible', function()
		{
		$j('.dolbyAtmosFileInputBoxVisible').removeClass('artworkInputBoxVisibleDragOver');
		//$j('.artworkVisible').css('opacity','1');
		})


	}

window.onload = function()
	{
	$j(document).ready(function()
		{
		setDragListeners();
		})
	}

//DC-4811 - split compound band name into array of artists
function getCompondArtists(bandname) {
	var andRegex = [' and ',' And ', ' AND ', ' x ', ' X ', ' a ', ' A ', ' y ', ' Y ', ' with ', ' With ', ' WITH ', '&', ',', '/'];
	var artists = bandname.split(new RegExp(andRegex.join('|'), 'g'));

	return artists.map(function(s){return s.trim()});
}

function compoundDetector(str) {
	var andRegex = /\band\b|\bx\b|\ba\b|\by\b|\/|\bwith\b|[^\&]+[\&]+[^\&]+|\,/g;

	if (str.toLowerCase().match(andRegex) == null) {
		var andArray = [];
	} else {
		var andArray = str.toLowerCase().match(andRegex);
	}

	return andArray;
}

// DSPs tricky functions to control artist URLs
function clickedArtistIdUrl(store, obj) {
	switch (store) {
		case 'apple':
			$j('.appleArtistLinkUrl').removeClass('highlightSubtle');
			break;
		case 'spotify':
			$j('.spotifyArtistLinkUrl').removeClass('highlightSubtle');
			break;
		case 'google':
			$j('.googleArtistLinkUrl').removeClass('highlightSubtle');
			break;
		// TODO instagramProfile, facebookProfile here when we add Searchy thing
	}
	$j(obj).addClass('highlightSubtle');
}

function clickedArtistIdRadioButton(store, obj) {
	switch (store) {
		case 'apple':
			$j('.myCustomAppleUri').val('');
			$j('.enterMultiMatchCustomAppleUri').hide();
			$j('.appleArtistLinkUrl').removeClass('highlightSubtle');
			updateArtistBioVisibility(false);
			bandNameVerifyArtist();
			break;
		case 'spotify':
			$j('.myCustomSpotifyUri').val('');
			$j('.enterMultiMatchCustomSpotifyUri').hide();
			$j('.spotifyArtistLinkUrl').removeClass('highlightSubtle');
			break;
		case 'google':
			$j('.myCustomGoogleUri').val('');
			$j('.enterMultiMatchCustomGoogleUri').hide();
			$j('.googleArtistLinkUrl').removeClass('highlightSubtle');
			break;
		// TODO instagramProfile, facebookProfile here when we add Searchy thing
	}
}

function clickedMultiMatchRadioButton(store) {
	switch (store) {
		case 'apple':
			var myVal = $j('.appleArtistIdMultipleMatches:checked').val();
			$j('.myCustomAppleUri').val('');
			if (myVal == 'notListed') {
				$j('.enterMultiMatchCustomAppleUri').slideDown( 'fast' );
			} else {
				$j('.enterMultiMatchCustomAppleUri').stop().hide();
			}
			updateArtistBioVisibility(myVal == 'new');
			bandNameVerifyArtist();
			break;
		case 'spotify':
			var myVal = $j('.spotifyArtistIdMultipleMatches:checked').val();
			$j('.myCustomSpotifyUri').val('');
			if (myVal == 'notListed') {
				$j('.enterMultiMatchCustomSpotifyUri').slideDown('fast');
			} else {
				$j('.enterMultiMatchCustomSpotifyUri').stop().hide();
			}
			break;
		case 'google':
			var myVal = $j('.googleArtistIdMultipleMatches:checked').val();
			$j('.myCustomGoogleUri').val('');
			if (myVal == 'notListed') {
				$j('.enterMultiMatchCustomGoogleUri').slideDown('fast');
			} else {
				$j('.enterMultiMatchCustomGoogleUri').stop().hide();
			}
			break;
		// TODO instagramProfile, facebookProfile here when we add Searchy thing
	}
}


function checkedZeroMatchesRadioButton(store) {
	switch (store) {
		case 'apple':
			var myVal = $j('.appleArtistIdZeroMatches:checked').val();
			$j('.myCustomAppleUri').val('');
			if (myVal == 'new') {
				$j('.enterZeroMatchCustomAppleUri').stop().hide();
			} else {
				$j('.enterZeroMatchCustomAppleUri').slideDown('fast');
			}
			updateArtistBioVisibility(myVal == 'new');
			bandNameVerifyArtist();
			break;
		case 'spotify':
			var myVal = $j('.spotifyArtistIdZeroMatches:checked').val();
			$j('.myCustomSpotifyUri').val('');
			if (myVal == 'new') {
				$j( '.enterZeroMatchCustomSpotifyUri' ).stop().hide();
			} else {
				$j( '.enterZeroMatchCustomSpotifyUri' ).slideDown( 'fast' );
			}
			break;
		case 'google':
			var myVal = $j('.googleArtistIdZeroMatches:checked').val();
			$j('.myCustomGoogleUri').val('');
			if (myVal == 'new') {
				$j('.enterZeroMatchCustomGoogleUri').stop().hide();
			} else {
				$j('.enterZeroMatchCustomGoogleUri').slideDown('fast');
			}
			break;
		case 'instagramProfile':
			var myVal = $j('.instagramProfileArtistIdZeroMatches:checked').val();
			$j('.myCustomInstagramProfileUri').val('');
			if (myVal == 'new') {
				$j('.enterZeroMatchCustomInstagramProfileUri').stop().hide();
			} else {
				$j('.enterZeroMatchCustomInstagramProfileUri').slideDown('fast');
			}
			break;
		case 'facebookProfile':
			var myVal = $j('.facebookProfileArtistIdZeroMatches:checked').val();
			$j('.myCustomFacebookProfileUri').val('');
			if (myVal == 'new') {
				$j('.enterZeroMatchCustomFacebookProfileUri').stop().hide();
			} else {
				$j('.enterZeroMatchCustomFacebookProfileUri').slideDown('fast');
			}
			break;
		default:
			console.warn("Store not supported: " + store);
	}
}

function clickedOneMatchRadioButton(store) {
	switch (store) {
		case 'apple':
			var myVal = $j('.appleArtistIdOneMatch:checked').val();
			$j('.myCustomAppleUri').val('');
			if (myVal == 'notListed') {
				$j('.enterOneMatchCustomAppleUri').slideDown('fast');
			} else {
				$j('.enterOneMatchCustomAppleUri').stop().hide();
			}
			updateArtistBioVisibility(myVal == 'new');
			bandNameVerifyArtist();
			break;
		case 'spotify':
			var myVal = $j('.spotifyArtistIdOneMatch:checked').val();
			$j('.myCustomSpotifyUri').val('');
			if (myVal == 'notListed') {
				$j('.enterOneMatchCustomSpotifyUri').slideDown('fast');
			} else {
				$j('.enterOneMatchCustomSpotifyUri').stop().hide();
			}
			break;
		case 'google':
			var myVal = $j('.googleArtistIdOneMatch:checked').val();
			$j('.myCustomGoogleUri').val('');
			if (myVal == 'notListed') {
				$j('.enterOneMatchCustomGoogleUri').slideDown('fast');
			} else {
				$j('.enterOneMatchCustomGoogleUri').stop().hide();
			}
			break;
		// TODO instagramProfile, facebookProfile here when we add Searchy thing
	}
}


function checkedTooManyMatchesRadioButton(store) {
	switch (store) {
		case 'apple':
			var myVal = $j('.appleArtistIDTooManyMatches:checked').val();
			$j('.myCustomAppleUri').val('');
			if (myVal == 'new') {
				$j('.enterCustomAppleUri').stop().hide();
			} else {
				$j('.enterCustomAppleUri').slideDown('fast');
			}
			updateArtistBioVisibility(myVal == 'new');
			bandNameVerifyArtist();
			break;
		case 'spotify':
			var myVal = $j('.spotifyArtistIDTooManyMatches:checked').val();
			$j('.myCustomSpotifyUri').val('');
			if (myVal == 'new') {
				$j('.enterCustomSpotifyUri').stop().hide();
			} else {
				$j('.enterCustomSpotifyUri').slideDown('fast');
			}
			break;
		case 'google':
			var myVal = $j('.googleArtistIDTooManyMatches:checked').val();
			$j('.myCustomGoogleUri').val('');
			if (myVal == 'new') {
				$j('.enterCustomGoogleUri').stop().hide();
			} else {
				$j('.enterCustomGoogleUri').slideDown('fast');
			}
			break;
		// TODO instagramProfile, facebookProfile here when we add Searchy thing
	}
}

function hideUriChooser(store, errorThrown) {
	switch (store) {
		case 'apple':
			if (errorThrown == 'Arist name too common') { // if artist name too common (ex: Pablo), then set the artistId to "new"
				$j('#appleArtistIdTooManyMatches').show();
				$j('.appleArtistLinkUrl').attr('href','');
				$j('.appleArtistLinkUrl').text('');
				$j('.appleArtistIDOneMatch').attr('value','');
				// $j('#artistName').attr('appleArtistId','');
			} else {
				$j('#appleArtistIdContainer').hide();
				$j('#appleArtistIdSpinner').hide();
                $j('.artist-mapping-section-apple').hide();
				// $j('#artistName').removeAttr('appleArtistId');
			}
			break;
		case 'spotify':
			if (errorThrown == 'Arist name too common') { // if artist name too common (ex: Pablo), then set the artistId to "new"
				$j('#spotifyArtistIdTooManyMatches').show();
				$j('.spotifyArtistLinkUrl').attr('href','');
				$j('.spotifyArtistLinkUrl').text('');
				$j('.spotifyArtistIDOneMatch').attr('value','');
				// $j('#artistName').attr('spotifyArtistId','');
			} else {
				$j('#spotifyArtistIdContainer').hide();
				$j('#spotifyArtistIdSpinner').hide();
                $j('.artist-mapping-section-spotify').hide();
				// $j('#artistName').removeAttr('spotifyArtistId');
			}
			break;
		case 'google':
			if (errorThrown == 'Arist name too common') { // if artist name too common (ex: Pablo), then set the artistId to "new"
				$j('#googleArtistIdTooManyMatches').show();
				$j('.googleArtistLinkUrl').attr('href','');
				$j('.googleArtistLinkUrl').text('');
				$j('.googleArtistIDOneMatch').attr('value','');
				// $j('#artistName').attr('googleArtistId','');
			} else {
				$j('#googleArtistIdContainer').hide();
				$j('#googleArtistIdSpinner').hide();
				$j('.artist-mapping-section-google').hide();
				// $j('#artistName').removeAttr('googleArtistId');
			}
			break;
		// TODO instagramProfile, facebookProfile here when we add Searchy thing
		case 'instagramProfile':
			$j('#instagramProfileArtistIdContainer').hide();
			break;
		case 'facebookProfile':
			$j('#facebookProfileArtistIdContainer').hide();
			break;
	}
}



function initArtistSearchArea() {
	// apple init stuff
	$j('.enterCustomAppleUri').stop().hide();
	$j('#appleArtistIdRadioButtonDiv').html(''); // delete all radio buttons
	$j('.appleArtistIdMatchSection').hide();
	$j('#appleArtistIdFound').hide();
	$j('#appleArtistIdSpinner').show();

	// spotify init stuff
	$j('.enterCustomSpotifyUri').stop().hide();
	$j('#spotifyArtistIdRadioButtonDiv').html(''); // delete all radio buttons
	$j('.spotifyArtistIdMatchSection').hide();
	$j('#spotifyArtistIdFound').hide();
	$j('#spotifyArtistIdSpinner').show();

	// google init stuff
	$j('.enterCustomGoogleUri').stop().hide();
	$j('#googleArtistIdRadioButtonDiv').html(''); // delete all radio buttons
	$j('.googleArtistIdMatchSection').hide();
	$j('#googleArtistIdFound').hide();
	$j('#googleArtistIdSpinner').show();

	// TODO instagramProfile, facebookProfile here when we add Searchy thing
}

/**
 * Initializes ArtistMappingComponent instances for Spotify, Apple, and Google
 *  Uses DOM selectors defined across new/main.cfm to initialize the components
 */
function initializeArtistMappingComponents() {
	// Spotify Artist Mapping Component
	window.spotifyArtistMapping = new ArtistMappingComponent('#spotifyArtistIdContainer', {
		platform: 'spotify',
		selectors: {
			loading: '#spotifyArtistIdSpinner',
			multipleMatches: '#spotifyArtistIdMultipleMatches',
			zeroMatches: '#spotifyArtistIdZeroMatches',
			tooManyMatches: '#spotifyArtistIdTooManyMatches',
			found: '#spotifyArtistIdFound',
			customInput: '.myCustomSpotifyUri',
			radioButtonContainer: '#spotifyArtistIdRadioButtonDiv',
			radioButtonTemplate: '#spotifyArtistIdRadioButtonTemplate',
			artistNamePlaceholder: '.spotifyArtistIdName',
			artistNameFoundPlaceholder: '.spotifyArtistIdNameFound'
		},
		fieldName: 'spotifyArtistID'
	});

	// Apple Music Artist Mapping Component
	window.appleArtistMapping = new ArtistMappingComponent('#appleArtistIdContainer', {
		platform: 'apple',
		selectors: {
			loading: '#appleArtistIdSpinner',
			multipleMatches: '#appleArtistIdMultipleMatches',
			zeroMatches: '#appleArtistIdZeroMatches',
			tooManyMatches: '#appleArtistIdTooManyMatches',
			found: '#appleArtistIdFound',
			customInput: '.myCustomAppleUri',
			radioButtonContainer: '#appleArtistIdRadioButtonDiv',
			radioButtonTemplate: '#appleArtistIdRadioButtonTemplate',
			artistNamePlaceholder: '.appleArtistIdName',
			artistNameFoundPlaceholder: '.appleArtistIdNameFound'
		},
		fieldName: 'appleArtistID'
	});

	// Google/YouTube Music Artist Mapping Component
	window.googleArtistMapping = new ArtistMappingComponent('#googleArtistIdContainer', {
		platform: 'google',
		selectors: {
			loading: '#googleArtistIdSpinner',
			multipleMatches: '#googleArtistIdMultipleMatches',
			zeroMatches: '#googleArtistIdZeroMatches',
			tooManyMatches: '#googleArtistIdTooManyMatches',
			found: '#googleArtistIdFound',
			customInput: '.myCustomGoogleUri',
			radioButtonContainer: '#googleArtistIdRadioButtonDiv',
			radioButtonTemplate: '#googleArtistIdRadioButtonTemplate',
			artistNamePlaceholder: '.googleArtistIdName',
			artistNameFoundPlaceholder: '.googleArtistIdNameFound'
		},
		fieldName: 'googleArtistID'
	});
}

function processArtistIdLookup(response, bandname, myDelay) {

    // Favor new ArtistMappingComponent here to replace the "searchThingy" stuff below
    if (window.appleArtistMapping && window.spotifyArtistMapping && window.googleArtistMapping){
        console.log('using new ArtistMappingComponent for apple, spotify, and google');
        window.appleArtistMapping.search(bandname);
        window.spotifyArtistMapping.search(bandname);
        window.googleArtistMapping.search(bandname);
        return;
    }

	if (response.appleId) { // this means we've already logged the artistid for this artist/user
		$j('#appleArtistIdFound').show();
		$j('.appleArtistIdNameFound').text(bandname);
		$j('#appleArtistIdSpinner').hide();
		$j('#artistName').attr('appleArtistId', response.appleId);
	} else {
		$j('#artistName').attr('appleArtistId', '');
	}

	if (response.spotifyId) { // this means we've already logged the artistid for this artist/user
		$j('#spotifyArtistIdFound').show();
		$j('.spotifyArtistIdNameFound').text(bandname);
		$j('#spotifyArtistIdSpinner').hide();
		$j('#artistName').attr('spotifyArtistId', response.spotifyId);
	} else {
		$j('#artistName').attr('spotifyArtistId', '');
	}

	if (response.googleId) { // this means we've already logged the artistid for this artist/user
		$j('#googleArtistIdFound').show();
		$j('.googleArtistIdNameFound').text(bandname);
		$j('#googleArtistIdSpinner').hide();
		$j('#artistName').attr('googleArtistId', response.googleId);
	} else {
		$j('#artistName').attr('googleArtistId', '');
	}

	// TODO instagramProfile, facebookProfile here when we add Searchy thing

	if (!bandname || !isIdCheckRequired('apple')) {
		// $j('#artistName').removeAttr('appleArtistId');
		$j('#appleArtistIdContainer').hide();
		$j('.artist-mapping-section-apple').hide();
	} else if (!response.appleId) {
		$j('#appleArtistIdContainer').show();
		$j('.artist-mapping-section-apple').show();
		doAppleArtistSearchyThing(myDelay);
	}

	if (!bandname || !isIdCheckRequired('spotify')) {
		// $j('#artistName').removeAttr('spotifyArtistId');
		$j('#spotifyArtistIdContainer').hide();
		$j('.artist-mapping-section-spotify').hide();
	} else if (!response.spotifyId) {
		$j('#spotifyArtistIdContainer').show();
		$j('.artist-mapping-section-spotify').show();
		doSpotifyArtistSearchyThing(myDelay);
	}

	if (!bandname || !isIdCheckRequired('google')) {
		// $j('#artistName').removeAttr('googleArtistId');
		$j('#googleArtistIdContainer').hide();
		$j('.artist-mapping-section-google').hide();
	} else if (!response.googleId) {
		$j('#googleArtistIdContainer').show();
		$j('.artist-mapping-section-google').show();
		doGoogleArtistSearchyThing(myDelay);
	}

	// TODO instagramProfile, facebookProfile here when we add Searchy thing
}

function doAppleArtistSearchyThing(myDelay) {
	var bandnameOriginal = $j('#artistName').val().trim();
	var bandname = getLowerBandname(bandnameOriginal);
	var bandnameMD5 = customMD5(bandname);
	var bandnameObject = getVerifiedBandnames(bandnameMD5);
	if (typeof getAppleArtistIDAjax != 'undefined') {
		getAppleArtistIDAjax.abort();
	}

	if (bandnameObject.appleIdLookup) {
		parseAppleArtistSearchyThing(bandnameObject.appleIdLookup, bandnameOriginal);
		bandNameVerifyArtist();
	} else {
		artistAppleSearchyThingTimer = setTimeout(function() {
			// Prefer shared module when present (POC / future LD flag), otherwise fall back to legacy code.
			if (window.DKArtistSearch && typeof window.DKArtistSearch.searchApple == 'function') {
				var appleSearchRequest = window.DKArtistSearch.searchApple({
					bandname: bandname,
					onSuccess: function(result) {
						var response = result.raw;
						if (!response.status || response.status == 'ok') {
							bandnameObject.appleIdLookup = response;
						}

						if (bandname == $j('#artistName').attr('oldValue')) {
							parseAppleArtistSearchyThing(response, bandnameOriginal);
						}

						bandNameVerifyArtist();
					},
					onError: function(result) {
						if (result.httpStatus == 500) {
							// DC-15288 3rd party API error
							parseAppleArtistSearchyThing([], bandnameOriginal);
						} else {
							hideUriChooser('apple', result.error.message);
						}
					}
				});
				getAppleArtistIDAjax = appleSearchRequest.jqXHR;
			} else {
				getAppleArtistIDAjax = $j.get({
					url: '/api/v1/artist/apple/search/',
					data: { bandname: bandname },
					dataType: 'json',
					success: function(response) {
						if (!response.status || response.status == 'ok') {
							bandnameObject.appleIdLookup = response;
						}

						if (bandname == $j('#artistName').attr('oldValue')) {
							parseAppleArtistSearchyThing(response, bandnameOriginal);
						}

						bandNameVerifyArtist();
					},
					error: function(request, textStatus, errorThrown) {
						if ( request.status == 500) {
							// DC-15288 3rd party API error
							parseAppleArtistSearchyThing([], bandnameOriginal);
						} else if (errorThrown != 'abort') {
							hideUriChooser('apple', errorThrown);
						}
					}
				});
			}
		}, myDelay); // timeout so we don't overload apple's api rate-limiting
	}
}

function parseAppleArtistSearchyThing(response, bandname) {

	$j('.appleArtistIdName').text(bandname); // show [whatever] in "there are [x] artists named [whatever]..."
	$j('#appleArtistIdSpinner').hide();
	$j('#appleArtistIdContainer input[type=radio]').prop("checked", false);
	if (response.length >= 200) {
		hideUriChooser('apple', 'Arist name too common');
		$j('#appleArtistIdTooManyMatches input.defaultRadio').prop("checked", true).trigger("change");
	} else if (response.length == 0) {
		$j('#appleArtistIdZeroMatches').show();
		$j('#appleArtistIdZeroMatches input.defaultRadio').prop("checked", true).trigger("change");
		// $j('#artistName').attr('appleArtistId','new');
	} else {
		$j('#appleArtistIdMultipleMatches').show();
		// $j('#appleArtistIdMultipleMatches input.defaultRadio').prop("checked", true);
		for (var i = 0; i < response.length; i++) {
			var appleArtistIdTemplate = $j('#appleArtistIdRadioButtonTemplate').text(); // get the blank template
			appleArtistIdTemplate = appleArtistIdTemplate.replace(/\[appleArtistIdHrefText\]/gi, response[i].name );
			appleArtistIdTemplate = appleArtistIdTemplate.replace(/\[appleArtistIdHref\]/gi, 'https://music.apple.com/artist/' + response[i].artistId);
			appleArtistIdTemplate = appleArtistIdTemplate.replace(/\[appleArtistId\]/gi, response[i].artistId);
			if ( response[i].recentTitle ) {
				var recentTitle = response[i].recentTitle.name;
			} else {
				var recentTitle = "";
			}
			var recentTitleText=recentTitle;
			if (recentTitleText.length > 100) {
				recentTitleText = recentTitleText.substring(1, 100) + '...';
			}
			appleArtistIdTemplate = appleArtistIdTemplate.replace(/\[appleArtistIdLatestRelease\]/gi, recentTitleText );
			appleArtistIdTemplate = appleArtistIdTemplate.replace(/\[appleArtistIdLatestReleaseTitle\]/gi, recentTitle );

			if (response[i].images && response[i].images.length){
				var img = response[i].images[ response[i].images.length -1 ].url;
			} else {
				// TODO need a better placeholder image?
				var img = "/images/avatar-blank.png";
			}
			appleArtistIdTemplate = appleArtistIdTemplate.replace(/\[appleArtistIdImage\]/gi, img);

			// $j('#artistName').removeAttr('appleArtistId');
			$j('#appleArtistIdRadioButtonDiv').append(appleArtistIdTemplate);
			if (!response[i].recentTitle ) {
				$j('#appleArtistIdRadioButtonDiv').find('#apple-artist-' + response[i].artistId).hide();
			}
		}
		var artistMatches = $j("#appleArtistIdMultipleMatches .artist-matches");
		artistMatches.find(".multiple-artist-matches").toggle(response.length > 1);
		artistMatches.find(".single-artist-match").toggle(response.length == 1);
	}
}

function doSpotifyArtistSearchyThing(myDelay) {
	var bandnameOriginal = $j('#artistName').val().trim();
	var bandname = getLowerBandname(bandnameOriginal);
	var bandnameMD5 = customMD5(bandname);
	var bandnameObject = getVerifiedBandnames(bandnameMD5);
	if (typeof getSpotifyArtistIDAjax != 'undefined') {
		getSpotifyArtistIDAjax.abort();
	}

	if (bandnameObject.spotifyIdLookup) {
		parseSpotifyArtistSearchyThing(bandnameObject.spotifyIdLookup, bandnameOriginal);
	} else {
		artistSpotifySearchyThingTimer = setTimeout(function() {
			// Prefer shared module when present (POC / future LD flag), otherwise fall back to legacy code.
			if (window.DKArtistSearch && typeof window.DKArtistSearch.searchSpotify == 'function') {
				var spotifySearchRequest = window.DKArtistSearch.searchSpotify({
					bandname: bandname,
					onSuccess: function(result) {
						bandnameObject.spotifyIdLookup = result.raw;

						if (bandname == $j('#artistName').attr('oldValue')) {
							parseSpotifyArtistSearchyThing(bandnameObject.spotifyIdLookup, bandnameOriginal);
						}
					},
					onError: function(result) {
						if (result.httpStatus == 500) {
							// DC-15288 3rd party API error
							parseSpotifyArtistSearchyThing([], bandnameOriginal);
						} else {
							hideUriChooser('spotify', result.error.message);
						}
					}
				});
				getSpotifyArtistIDAjax = spotifySearchRequest.jqXHR;
			} else {
				getSpotifyArtistIDAjax = $j.get({
					url: '/api/v1/artist/spotify/search/',
					data: { bandname: bandname },
					dataType: 'json',
					success: function(response) {
						bandnameObject.spotifyIdLookup = response;

						if (bandname == $j('#artistName').attr('oldValue')) {
							parseSpotifyArtistSearchyThing(bandnameObject.spotifyIdLookup, bandnameOriginal);
						}
					},
					error: function(request, textStatus, errorThrown) {
						if (request.status == 500) {
							// DC-15288 3rd party API error
							parseSpotifyArtistSearchyThing([], bandnameOriginal);
						} else if (errorThrown != 'abort') {
							hideUriChooser('spotify', errorThrown);
						}
					}
				});
			}
		}, myDelay); // timeout so we don't overload spotify's api rate-limiting
	}
}

function parseSpotifyArtistSearchyThing(response, bandname) {
	$j('.spotifyArtistIdName').text(bandname); // show [whatever] in "there are [x] artists named [whatever]..."
	$j('#spotifyArtistIdSpinner').hide();
	$j('#spotifyArtistIdContainer input[type=radio]').prop("checked", false);
	if (response.length >= 200) {
		hideUriChooser('spotify', 'Arist name too common');
		$j('#spotifyArtistIdTooManyMatches input.defaultRadio').prop("checked", true).trigger("change");
	} else if (response.length == 0) {
		$j('#spotifyArtistIdZeroMatches').show();
		$j('#spotifyArtistIdZeroMatches input.defaultRadio').prop("checked", true).trigger("change");
		// $j('#artistName').attr('spotifyArtistId','new');
	} else {
		// console.debug('we found spotify matches!');
		$j('#spotifyArtistIdMultipleMatches').show();
		// $j('#spotifyArtistIdMultipleMatches input.defaultRadio').prop("checked", true);
		for (var i = 0; i < response.length; i++) {
			// console.debug('processing spotify match: ' + i);
			var spotifyArtistIdTemplate = $j('#spotifyArtistIdRadioButtonTemplate').text(); // get the blank template
			spotifyArtistIdTemplate = spotifyArtistIdTemplate.replace(/\[spotifyArtistIdHrefText\]/gi, response[i].name );
			spotifyArtistIdTemplate = spotifyArtistIdTemplate.replace(/\[spotifyArtistIdHref\]/gi, 'https://open.spotify.com/artist/' + response[i].id);
			var recentTitle = response[i].latestAlbum ? response[i].latestAlbum : "";
			spotifyArtistIdTemplate = spotifyArtistIdTemplate.replace(/\[spotifyArtistIdLatestRelease\]/gi, recentTitle );
			var thisSpotifyUri = response[i].uri;
			// thisSpotifyUri = thisSpotifyUri.replace("spotify:artist:", ""); // get rid of first part of spotify uri
			spotifyArtistIdTemplate = spotifyArtistIdTemplate.replace(/\[spotifyArtistId\]/gi, thisSpotifyUri);
			if (response[i].images && response[i].images.length){
				var img = response[i].images[ response[i].images.length -1 ].url;
			} else {
				// TODO need a better placeholder image?
				var img = "/images/avatar-blank.png";
			}
			spotifyArtistIdTemplate = spotifyArtistIdTemplate.replace(/\[spotifyArtistIdImage\]/gi, img);

			// $j('#artistName').removeAttr('spotifyArtistId');
			$j('#spotifyArtistIdRadioButtonDiv').append(spotifyArtistIdTemplate);
		}
		var artistMatches = $j("#spotifyArtistIdMultipleMatches .artist-matches");
		artistMatches.find(".multiple-artist-matches").toggle(response.length > 1);
		artistMatches.find(".single-artist-match").toggle(response.length == 1);
	}
}


function showArtistInfo( obj, info ){
	var el= $j( obj ).parent().parent().find(".artistDetail");
	el.find(".albumName").text( info.name );
	el.show();
}

function doGoogleArtistSearchyThing(myDelay) {
	var bandnameOriginal = $j('#artistName').val().trim();
	var bandname = getLowerBandname(bandnameOriginal);
	var bandnameMD5 = customMD5(bandname);
	var bandnameObject = getVerifiedBandnames(bandnameMD5);
	if (typeof getGoogleArtistIDAjax != 'undefined') {
		getGoogleArtistIDAjax.abort();
	}

	if (bandnameObject.googleIdLookup) {
		parseGoogleArtistSearchyThing(bandnameObject.googleIdLookup, bandnameOriginal);
	} else {
		artistGoogleSearchyThingTimer = setTimeout(function() {
			// Prefer shared module when present (POC / future LD flag), otherwise fall back to legacy code.
			if (window.DKArtistSearch && typeof window.DKArtistSearch.searchGoogle == 'function') {
				var googleSearchRequest = window.DKArtistSearch.searchGoogle({
					bandname: bandname,
					onSuccess: function(result) {
						bandnameObject.googleIdLookup = result.raw;

						if (bandname == $j('#artistName').attr('oldValue')) {
							parseGoogleArtistSearchyThing(bandnameObject.googleIdLookup, bandnameOriginal);
						}
					},
					onError: function(result) {
						if (result.httpStatus == 500) {
							// DC-15288 3rd party API error
							parseGoogleArtistSearchyThing([], bandnameOriginal);
						} else {
							hideUriChooser('google', result.error.message);
						}
					}
				});
				getGoogleArtistIDAjax = googleSearchRequest.jqXHR;
			} else {
				getGoogleArtistIDAjax = $j.get({
					url: '/api/v1/artist/google/search/',
					data: { bandname: bandname },
					dataType: 'json',
					success: function(response) {
						bandnameObject.googleIdLookup = response;

						if (bandname == $j('#artistName').attr('oldValue')) {
							parseGoogleArtistSearchyThing(bandnameObject.googleIdLookup, bandnameOriginal);
						}
					},
					error: function(request, textStatus, errorThrown) {
						if (request.status == 500) {
							// DC-15288 3rd party API error
							parseGoogleArtistSearchyThing([], bandnameOriginal);
						} else if (errorThrown != 'abort') {
							hideUriChooser('google', errorThrown);
						}
					}
				});
			}
		}, myDelay); // timeout so we don't overload google's api rate-limiting
	}
}

function parseGoogleArtistSearchyThing(response, bandname) {
	$j('.googleArtistIdName').text(bandname); // show [whatever] in "there are [x] artists named [whatever]..."
	$j('#googleArtistIdSpinner').hide();
	$j('#googleArtistIdContainer input[type=radio]').prop("checked", false);
	if (response.length >= 200) {
		hideUriChooser('google', 'Arist name too common');
		$j('#googleArtistIdTooManyMatches input.defaultRadio').prop("checked", true).trigger("change");
	} else if (response.length == 0) {
		$j('#googleArtistIdZeroMatches').show();
		$j('#googleArtistIdZeroMatches input.defaultRadio').prop("checked", true).trigger("change");
		// $j('#artistName').attr('googleArtistId','new');
	} else {
		// console.debug('we found google matches!');
		$j('#googleArtistIdMultipleMatches').show();
		// $j('#googleArtistIdMultipleMatches input.defaultRadio').prop("checked", true);
		for (var i = 0; i < response.length; i++) {
			// console.debug('processing google match: ' + i);
			var googleArtistIdTemplate = $j('#googleArtistIdRadioButtonTemplate').text(); // get the blank template

			// check for blank image
			if (!response[i].imageUri || !response[i].imageUri.startsWith('https')) {
				response[i].imageUri = '/images/avatar2.jpg'; // use distrokid default avatar
			}
			googleArtistIdTemplate = googleArtistIdTemplate.replace(/\[googleArtistIdHrefText\]/gi, response[i].name );
			googleArtistIdTemplate = googleArtistIdTemplate.replace(/\[googleArtistIdHref\]/gi, response[i].uri);
			googleArtistIdTemplate = googleArtistIdTemplate.replace(/\[googleArtistId\]/gi, response[i].id);
			googleArtistIdTemplate = googleArtistIdTemplate.replace(/\[googleArtistIdImage\]/gi, response[i].imageUri);
			// $j('#artistName').removeAttr('googleArtistId');
			$j('#googleArtistIdRadioButtonDiv').append(googleArtistIdTemplate);
		}
		var artistMatches = $j("#googleArtistIdMultipleMatches .artist-matches");
		artistMatches.find(".multiple-artist-matches").toggle(response.length > 1);
		artistMatches.find(".single-artist-match").toggle(response.length == 1);
	}
}

function doInstagramProfileArtistSearchyThing(myDelay) {
	var bandnameOriginal = $j('#artistName').val().trim();
	var instagramProfileUrl = $j('.myCustomInstagramProfileUri ').val().trim();
	if (instagramProfileUrl.length == 0) {
		$j('#instagramProfileArtistIdContainer .validation-error').hide(); // DC-16721 .text("");
		return;
	}
	var bandname = getLowerBandname(bandnameOriginal);
	var bandnameMD5 = customMD5(bandname);
	var bandnameObject = getVerifiedBandnames(bandnameMD5);
	if (typeof getinstagramProfileArtistIDAjax != 'undefined') {
		getinstagramProfileArtistIDAjax.abort();
	}

	if (bandnameObject.instagramProfileIdLookup) {
		parseInstagramProfileArtistSearchyThing(bandnameObject.instagramProfileIdLookup, bandnameOriginal);
	} else {
		var validatedProfile = parseInstagramProfileId( instagramProfileUrl );
		parseInstagramProfileArtistSearchyThing({
			success: validatedProfile.length ? true: false,
			error: ""
		}, bandnameOriginal);
	}
}

function parseInstagramProfileArtistSearchyThing(response, bandname) {
	//$j('.instagramProfileArtistIdName').text(bandname); // show [whatever] in "there are [x] artists named [whatever]..."
	$j('#instagramProfileArtistIdSpinner').hide();
	//$j('#instagramProfileArtistIdContainer input[type=radio]').prop("checked", false);
	var $validation = $j('#instagramProfileArtistIdContainer .validation-error');
	if ( response.success ) {
		$validation.hide(); // DC-16721 .text("");
		//$j('#instagramProfileArtistIdZeroMatches input.defaultRadio').prop("checked", true).trigger("change");
	} else {
		$validation.show(); // DC-16721 .text( response.error );
	}
	updateMetaProfileUrl( bandname, 'Instagram', false );
}

function doFacebookProfileArtistSearchyThing(myDelay) {
	var bandnameOriginal = $j('#artistName').val().trim();
	var facebookProfileUrl = $j('.myCustomFacebookProfileUri').val().trim();
	if (facebookProfileUrl.length == 0) {
		$j('#facebookProfileArtistIdContainer .validation-error').hide(); // DC-16721 .text("");
		return;
	}
	var bandname = getLowerBandname(bandnameOriginal);
	var bandnameMD5 = customMD5(bandname);
	var bandnameObject = getVerifiedBandnames(bandnameMD5);
	if (typeof getfacebookProfileArtistIDAjax != 'undefined') {
		getfacebookProfileArtistIDAjax.abort();
	}

	if (bandnameObject.facebookProfileIdLookup) {
		parseFacebookProfileArtistSearchyThing(bandnameObject.facebookProfileIdLookup, bandnameOriginal);
	} else {
		var validatedProfile = parseFacebookProfileId( facebookProfileUrl );
		parseFacebookProfileArtistSearchyThing({
			success: validatedProfile.length ? true: false,
			error: ""
		}, bandnameOriginal);
	}
}

function parseFacebookProfileArtistSearchyThing(response, bandname) {
	//$j('.facebookProfileArtistIdName').text(bandname); // show [whatever] in "there are [x] artists named [whatever]..."
	$j('#facebookProfileArtistIdSpinner').hide();
	//$j('#facebookProfileArtistIdContainer input[type=radio]').prop("checked", false);
	var $validation = $j('#facebookProfileArtistIdContainer .validation-error');
	if ( response.success ) {
		$validation.hide(); // DC-16721 .text("");
		//$j('#facebookProfileArtistIdZeroMatches input.defaultRadio').prop("checked", true).trigger("change");
	} else {
		$validation.show(); // DC-16721 .text( response.error );
	}
	updateMetaProfileUrl( bandname, 'Facebook', false );
}



function handleNonStandardCapCheckbox( string ){
	var isStandardCaps   = checkStandardCapitalization( string );

	if( !isStandardCaps ){
		// SomEThInG sTRanGe HaS bEEn sUbMiTTeD
		$j( '#nonStandardCapsCheckbox' ).show();
	} else {
		$j( '#nonStandardCapsCheckbox' ).hide();
	}
}



/**
 * Checks to see if the provided string contains cap characters within the word (not the first letter)
 * @param {*} string
 */
function checkStandardCapitalization( string ){
	var isStandardCaps = true;

	if( isAllLowerCase( string ) ){
		return false; // isStandardCaps = false
	}

	// Fix contractions
	string = fixContractions( string );

	var arrWords = string.split( ' ' );
    for( var i = 0; i < arrWords.length; i++ ){
		var thisWord = arrWords[ i ];
		if( isAllLowerCase( thisWord ) ){
			return false; // isStandardCaps = false;
		}
        var j = 0;
        while( j <= thisWord.length ){
            var thisChar = thisWord.charAt( j );
            if( isAlphaNumeric( thisChar ) && thisChar !== '' && thisChar == thisChar.toUpperCase() && j > 0 ){
                isStandardCaps = false;
            }
            j++;
        }
    }
    return isStandardCaps;
}

function isAlphaNumeric( string ){
	var letterNumber = /^[0-9a-zA-Z]+$/;
	if( string.match( letterNumber ) ){
		return true;
	} else {
		return false;
	}
}

function fixContractions( string ){
	var contractionObj = JSON.parse($j('#newAlbumAutocorrect').text());
	for( var k in contractionObj ){
		var item = contractionObj[k];
		string = string.replace( new RegExp( "\\b" + k + "\\b", "gi" ), item );
	}
	return string;
}

/**
 * Returns a boolean value whether or not the given string is all in lowercase (non-standard caps)
 * @param {*} string
 */
function isAllLowerCase( string ){
	return ( string == string.toLowerCase() ) ? true : false;
}


function checkArtistAMConnection( bandname ){
	var toggleAudiomack = function( show ) {
		var audiomackExtraContentEl = $j( '#audiomackExtraContent' );
		if( show ){
			audiomackExtraContentEl.show();
			$j('.optIntoExtrasAfterUpload').show();
		} else {
			$j( '.js-audiomackExtraCheckbox' ).prop( 'checked', false );
			audiomackExtraContentEl.hide();
		}
	};

	if ($j.trim(bandname).length === 0){
		toggleAudiomack( false );
	} else {
		$j.ajax( {
			url: '/api/audiomack/verifyAudiomackArtistConnection/',
			type: 'POST',
			data: {
				artistName: bandname
			},
			success: function( response ){
				toggleAudiomack( response.isAudiomackConnected );
			}
		} );
	}
}

function doSongPreviews() {
	var artistName = $j('#artistName').val().trim();
	var isMups = $('#editReleaseForm').length ? true : false;
	// begin: add "other than"
	if (artistName != '') {
		$j('.otherThanArtist').show().text('other than ' + artistName);
	} else {
		$j('.otherThanArtist').hide();
	}
	// end: add "other than"

	$j('.uploadFileTitle').each(function() {
		var trackNum = $j(this).attr('tracknum');
		var thisGetFeat = getFeat(trackNum);
		var title_root = $j(this).val().trim();
		//if html tags are present, do now allow this function to evaluate them
		if (title_root.match(/(<([^>]+)>)/gi)) {
			return;
		}
		var title_feat = arrayToSentenceAmpersand(arrayRemoveDuplicates(thisGetFeat['sortedByRole']['Featuring'])).trim();
		var title_version = trackLevelVersionsToPayload(trackNum).versions.trim();
		var thisPreview = $j('.songTitlePreview[tracknum="' + trackNum + '"]');
		var thisPreviewSmall = $j('.songTitlePreviewSmall[tracknum="' + trackNum + '"]');
		var thisPreviewString = '';

		if (title_root) {
			// show root song title
			thisPreviewString = title_root;

			var showNotes = [];
			// append featured artist
			if (title_feat) {
				showNotes.push('feat');
				thisPreviewString = thisPreviewString + ' (feat. ' + title_feat + ')';
			}

			// begin: show notes
			if (title_version) {
				if (showNotes.length > 0) {
					thisPreviewString = thisPreviewString + ' [' + title_version + ']';
					showNotes.push('brackets');
				} else {
					thisPreviewString = thisPreviewString + ' (' + title_version + ')';
				}
			}
			if (typeof thisGetFeat.sortedByRole['Producer'] != 'undefined') {
				if (thisGetFeat.sortedByRole['Producer'].length > 0) {
					showNotes.push('producer');
				}
			}

			if (typeof thisGetFeat.sortedByRole['Primary'] != 'undefined') {
				if (thisGetFeat.sortedByRole['Primary'].length > 0) {
					showNotes.push('primary');
				}
			}

			if (typeof thisGetFeat.sortedByRole['Remixer'] != 'undefined') {
				if (thisGetFeat.sortedByRole['Remixer'].length > 0) {
					showNotes.push('remixer');

					// set default version to "remix"
					var versionVal = $j('.distroVersion[tracknum=' + trackNum + ']:checked').val();
					if (versionVal == '') {
						$j('.distroVersion[tracknum=' + trackNum + '][value="Remix"]').prop('checked',true).trigger('change');
					}
				}
			}

			if (showNotes.length > 0) {
				$j('.featNotes[tracknum="' + trackNum + '"]').hide();
				$j('.featNotes[tracknum="' + trackNum + '"]').hide();
				$j('.songTitleNotes[tracknum="' + trackNum + '"]').show();
				$j(showNotes).each(function(index, value) {
					$j('.featNotes[note="boilerplate"][tracknum="' + trackNum + '"]').show();
					$j('.featNotes[note="' + value + '"][tracknum="' + trackNum + '"]').show();
				});
			} else {
				$j('.songTitleNotes[tracknum="' + trackNum + '"]').hide();
			}
			// end: show notes
		} else {
			thisPreviewString = 'Track ' + trackNum;
		}
		$j(thisPreview).html(thisPreviewString);

		// begin: add fine print
		var primaryArtist = $('#artistName').val().trim() || 'Artist Name';
		var allArtists = [primaryArtist]; // start with primary artist

		if (thisGetFeat.artistsUnique.length > 0) {
			allArtists = allArtists.concat(thisGetFeat.artistsUnique); // add secondary artist(s)
		}
		allArtists = arrayRemoveDuplicates(allArtists);
		$j(thisPreviewSmall).html(arrayToCommaSeparated(allArtists));

		//Release Preview Experiment
		if ($("#release-preview-container").length > 0) {
			var songTitle = title_root ? thisPreviewString : "Song Title";
			$(`#rp-tracklist-track-${trackNum}-song-title`).text(songTitle);
			$(`#rp-tracklist-track-${trackNum}-artists`).text(arrayToCommaSeparated(allArtists));
		}
	});

	//MUPS edit does not have feat artist mapping, skip
	if (!isMups){
		doFeatArtistMapping();
	}
}

function doFeatArtistMapping() {
	var masterList = getMasterList();
	// begin: initialize "feat. artist mapping" form
	$j('.featMappingFormGoesHere').html('');
	// end: initialize "feat. artist mapping" form

	// begin: populate featured artist mapping form
	$j(masterList['uniqueArtists']).each(function(index) {
		var artistMappingTemplate = $j('#featArtistMappingFormTemplate').html();
		var artistRole = masterList['artistRole'][this].join(", ");
		artistRole = artistRole.includes('Primary') ? artistRole : artistRole + ' (optional)';

		artistMappingTemplate = artistMappingTemplate.replace(/\[name\]/gi, this);
		artistMappingTemplate = artistMappingTemplate.replace(/\[index\]/gi, index);
		artistMappingTemplate = artistMappingTemplate.replace(/\[role\]/gi, artistRole);

		$j('.featMappingFormGoesHere').append(artistMappingTemplate);

		// begin: populate defaults
		if (typeof myArtistMappingStruct[this] != 'undefined') {
			var thisSection = $j('.artistMappingSection').last();
			var apple = myArtistMappingStruct[this]['apple'] != null ? myArtistMappingStruct[this]['apple'] : '';
			var spotify = myArtistMappingStruct[this]['spotify'] != null ? myArtistMappingStruct[this]['spotify'] : '';
			var google = myArtistMappingStruct[this]['google'] != null ? myArtistMappingStruct[this]['google'] : '';
			// TODO instagramProfile, facebookProfile here when we add Searchy thing

			if ((apple.trim() != '') && (apple.trim() != 'new')) {
				$j(thisSection).find('.mappingInput[dsp="apple"]').val(apple);
				$j('.featArtistMappingRadio[value="1"]').last().click();
			}

			if ((spotify.trim() != '') && (spotify.trim() != 'new')) {
				$(thisSection).find('.mappingInput[dsp="spotify"]').val(spotify);
				$j('.featArtistMappingRadio[value="1"]').last().click();
			}

			if ((google.trim() != '') && (google.trim() != 'new')) {
				$(thisSection).find('.mappingInput[dsp="google"]').val('https://music.youtube.com/channel/' + google);
				$j('.featArtistMappingRadio[value="1"]').last().click();
			}
			// TODO instagramProfile, facebookProfile here when we add Searchy thing
		}
		// end: populate defaults
	});

	toggleArtistMappingTr();
	// end: populate featured artist mapping form
}

function getMasterList() {
	// begin: make master list of featured artists, and remove duplicates
	var masterList = {};
	masterList['uniqueArtists'] = [];
	masterList['artistRole'] = {};
	masterList['artistIds'] = {};

	// begin: primary artist(s)
	var primaryArtist = $j('#artistName').val().trim();
	var isBand = $j('input:radio[name=compoundBandName][value="band"]').prop("checked");
	var isColaboration = $j('input:radio[name=compoundBandName][value="collaboration"]').prop("checked");
	if (isColaboration) {
		var compoundPrimary = getCompondArtists(primaryArtist);
		masterList['roles'] = {};
		masterList['roles']['primary'] = [];
		$j(compoundPrimary).each(function() {
			masterList['uniqueArtists'].push(this);
			masterList['artistRole'][this] = ['Primary'];
			masterList['roles']['primary'].push(this);
		});
	}
	/* Let's not display collab band in the bottom section
	else if (isBand) {
		masterList['uniqueArtists'].push(primaryArtist);
		masterList['artistRole'][primaryArtist] = ['Primary'];
		masterList['roles'] = {};
		masterList['roles']['primary'] = [];
		masterList['roles']['primary'].push(primaryArtist);
	}
	*/
	// end: primary artist(s)

	for (var x = 1; x <= howManyTracks(); x++) {
		var thisGetFeat = getFeat(x);
		masterList['uniqueArtists'] = masterList['uniqueArtists'].concat(thisGetFeat.artistsUnique);

		// begin: make array of roles for each artist
		$j(masterList['uniqueArtists']).each(function() {
			if (typeof masterList['artistRole'][this] === 'undefined') {
				masterList['artistRole'][this] = [];
			}

			if (typeof thisGetFeat.artistRole[this] != 'undefined') {
				masterList['artistRole'][this] = masterList['artistRole'][this].concat(thisGetFeat.artistRole[this]);
				masterList['artistRole'][this] = arrayRemoveDuplicates(masterList['artistRole'][this]);
			}
		});
		// end: make array of roles for each artist
	}

	masterList['uniqueArtists'] = arrayRemoveDuplicates(masterList['uniqueArtists']);
	// end: make master list of featured artists, and remove duplicates

	// begin: get artist IDs
	$j(masterList['uniqueArtists']).each(function(index, val) {
		var thisAppleURI = $j('.mappingInput[dsp="apple"][index="' + index + '"]:visible').val();
		var thisSpotifyURI = $j('.mappingInput[dsp="spotify"][index="' + index + '"]:visible').val();
		var thisGoogleURI = $j('.mappingInput[dsp="google"][index="' + index + '"]:visible').val();
		masterList['artistIds'][val] = {};
		masterList['artistIds'][val]['appleURI'] = typeof thisAppleURI === 'undefined' ? '' : parseAppleId(thisAppleURI);
		masterList['artistIds'][val]['spotifyURI'] = typeof thisSpotifyURI === 'undefined' ? 'new' : parseSpotifyId(thisSpotifyURI);
		masterList['artistIds'][val]['googleURI'] = typeof thisGoogleURI === 'undefined' ? '' : parseGoogleId(thisGoogleURI);
		// TODO instagramProfile, facebookProfile here when we add Searchy thing
	});
	// end: get artist IDs

	return masterList;
}

function getFeat(track) {
	var featStruct = {}
	featStruct['sortedByOrder'] = [];
	featStruct['artistsUnique'] = [];
	featStruct['artistRole'] = {};
	featStruct['artistsAndCorrespondingRoles'] = {};
	featStruct['artistsAndCorrespondingRoles']['artists'] = [];
	featStruct['artistsAndCorrespondingRoles']['roles'] = [];

	// begin: init "sorted by role"
	featStruct['sortedByRole'] = {};
	var roles = $j('.featRole[tracknum="' + track + '"]:first').find('option'); // visible or invisible
	$j(roles).each(function()
		{
		var thisRole = $j(this).val().trim();
		featStruct['sortedByRole'][thisRole] = [];
		})
	// end: init "sorted by role"

	var featCount =  $j('.featInput[tracknum="' + track + '"]:visible').length;
	for (var x = 1; x <= featCount; x++) {
		var role = $j('.featRole[tracknum="' + track + '"]:visible').eq(x-1).val().trim();
		var name = $j('.featInput[tracknum="' + track + '"]:visible').eq(x-1).val().trim();

		if (name.trim() != '') {
			var thisFeat = {};
			thisFeat['role'] = role;
			thisFeat['name'] = name;

			// begin: struct of artists to role (supports multiple roles per artist, yay!
			if (typeof featStruct['artistRole'][name] === 'undefined') {
				featStruct['artistRole'][name] = [];
			}
			if (featStruct['artistRole'][name].indexOf(role) == -1) {
				featStruct['artistRole'][name].push(role);
			}
			// end: struct of artists to role (supports multiple roles per artist, yay!

			// list of uniqie artists
			featStruct['artistsUnique'].push(name);
			featStruct['artistsUnique'] = arrayRemoveDuplicates(featStruct['artistsUnique']);

			// sorted by order
			featStruct['sortedByOrder'].push(thisFeat); // add to array

			// sorted by role
			featStruct['sortedByRole'][role].push(name);

			// artists with corresponding roles
			featStruct['artistsAndCorrespondingRoles']['artists'].push(name);
			featStruct['artistsAndCorrespondingRoles']['roles'].push(role);

		}
	}
	return featStruct;
}

function featFormClose(obj) {
	$j(obj).parentsUntil('.featFormParent').remove();
	doSongPreviews();
}

function bandNameKeyUp(displayInstantly) {
	var displayInstantly = typeof displayInstantly !== 'undefined' ? displayInstantly : false;
	if (/[`’′᾿]/.test($j('#artistName').val())) {
		$j('#artistName').val($j('#artistName').val().replace(/[`’′᾿]/g, "'"));
	}
	var bandnameOriginal = $j('#artistName').val().trim();
	var bandname         = getLowerBandname(bandnameOriginal);
	var bandnameMD5      = customMD5(bandname);
	var compoundArray    = compoundDetector(bandname);
	var isCompound       = compoundArray.length > 0;
	var isBand           = $j('input:radio[name=compoundBandName][value="band"]').prop("checked");

	handleNonStandardCapCheckbox( bandnameOriginal );

	var bandnameObject = getVerifiedBandnames(bandnameMD5);
	bandnameObject.artistIdLookup = (window.allMyLiveArtists && window.allMyLiveArtists[bandnameMD5]) ? window.allMyLiveArtists[bandnameMD5] : {};
	if (bandnameObject.artistIdLookup.appleId && bandnameObject.artistIdLookup.appleId != 'new') {
		bandnameObject.status = 'ok';
	}
	$j('.myBandName').text(bandname != '' ? bandnameOriginal : 'my artist');

	if(containsEmojis(bandname, true)) {
		$j('.primaryArtistEmojiWarning').slideDown('fast');
	}
	else {
		$j('.primaryArtistEmojiWarning').slideUp('fast');
	}

	//do not allow html in the bandname field
	if (bandname.match(/(<([^>]+)>)/gi)) {
		return;
	}

	console.debug('rock on: ' + bandname);

	// See if we can show the Audiomack extra
	if ($j( '#audiomackExtraContent' ).length) {
		if (isCompound) {
			checkArtistAMConnection( getCompondArtists(bandname)[0] ); // first artist in compound bandname
		} else {
			checkArtistAMConnection( bandname );
		}
	}

	// begin: are they trying to put a featured artist in the primary artist area?
	if (bandname.match(new RegExp('\\bfeaturing\\b'))) {
		$j('.primaryFeaturedArtistWarning').slideDown('fast');
	} else if (bandname.match(new RegExp('\\bft\\b'))) {
		$j('.primaryFeaturedArtistWarning').slideDown('fast');
	} else if (bandname.match(new RegExp('\\bfeat\\b'))) {
		$j('.primaryFeaturedArtistWarning').slideDown('fast');
	}
	// end: are they trying to put a featured artist in the primary artist area?

	if (isCompound) {
		$j('.compoundDetected').text(compoundArray[0].toUpperCase());
		if (displayInstantly) {
			$j('.compoundBandname').show();
		} else {
			$j('.compoundBandname').slideDown();
		}
	} else {
		$j('.compoundBandname').stop().hide();
		$j('input[type="radio"][name="compoundBandName"]').removeAttr('checked')
	}

	if (typeof $j('#artistName').attr('oldValue') === 'undefined') {
		$j('#artistName').attr('oldValue', '');
		$('#verifyArtistFailContainer').hide();
		$('#verifyArtistSuccessContainer').hide();
	}

	if (!bandname || (isCompound && !isBand)) {
		// $j('#artistName').removeAttr('appleArtistId');
		$j('.artistIdContainer').hide();
	} else {
		$j('.artistIdContainer').show();
	}

	if (bandname && bandname != $j('#artistName').attr('oldValue')) {
		initArtistSearchArea();
		killArtistIdSearch();

		// this means we've already logged the artistid for this artist/user
		$j('#artistName').attr('instagramProfileArtistId', bandnameObject.artistIdLookup.instagramProfileId ? bandnameObject.artistIdLookup.instagramProfileId : '');
		$j('#artistName').attr('facebookProfileArtistId', bandnameObject.artistIdLookup.facebookProfileId ? bandnameObject.artistIdLookup.facebookProfileId : '');
		updateMetaProfileUrl( bandnameOriginal, 'Instagram', true );
		updateMetaProfileUrl( bandnameOriginal, 'Facebook', true );

		var youtubechannelartistholderEl = $j( '.youtubechannelartistholder' );
		if( youtubechannelartistholderEl.length ) {
			youtubechannelartistholderEl.html(bandnameOriginal);
		}

		var myDelay = displayInstantly ? 0 : 1000; // when upload form first loads, do the ajax quickly
		processArtistIdLookup(bandnameObject.artistIdLookup, bandnameOriginal, myDelay);
		// if (!bandnameObject.status) {
		// 	verifyArtistSuccess();
		// }
	}

	$j('#artistName').attr('oldValue', bandname);

	// begin: populate artist name where needed
	var selectedOriginalArtistName = $j('select#artistName:visible option:selected').val();
	var selectedOriginalArtistName_original = $j('select#artistName:visible option:selected').attr('originalValue')
	$j('.selectedOriginalArtistName').text(selectedOriginalArtistName);
	$j('.selectedOriginalArtistName_original').text(selectedOriginalArtistName_original);
	// end: populate artist name where needed

	// begin: reset collaborator if needed
	if ($j('.collaborator').is(':visible')) {
		if ($j('.collaborator:visible').attr('mainArtist') != selectedOriginalArtistName_original) {
			collaboratorClose();
			resetArtistPulldownToOriginalValues();
		}
	}
	// end: reset collaborator if needed

	if (!needToVerifyArtist()) {
		verifyArtistSuccess();
	}

	// Update Full rebrand checkbox new artist on Edit Release page
	if ($j('.newArtistName').length > 0) {
		var oldArtistName = $j('.oldArtistName').text();
		$j('.newArtistName').text(bandnameOriginal);
		if (oldArtistName === bandnameOriginal || isCompound) {
			$j('.fullRebrandCheckbox').hide();
		} else {
			$j('.fullRebrandCheckbox').show();
		}
	}

	doSongPreviews();
}

function updateMetaProfileUrl( bandnameOriginal, service, autoFill ){
	var _service = service.toLowerCase();
	// update form labels
	$j( '.' + _service + 'ProfileArtistIdName' ).text( bandnameOriginal );

	var bandname       = getLowerBandname(bandnameOriginal);
	var bandnameMD5    = customMD5(bandname);
	var bandnameObject = getVerifiedBandnames(bandnameMD5);
	bandnameObject.artistIdLookup = (window.allMyLiveArtists && window.allMyLiveArtists[bandnameMD5]) ? window.allMyLiveArtists[bandnameMD5] : {};
	var profile = bandnameObject.artistIdLookup[ _service + 'ProfileId' ];
	var found = false;
	if ( autoFill && profile ) {
		if ( profile.toLowerCase() == "new" ){
			// already answered no
			$j( '#' + _service + 'ProfileArtistIdContainer input[type=radio]').prop("checked", true);
		} else if ( profile.length > 0 ) {
			// already provided
			found = true;
		} else {
			// yes, show enter
			$j('#' + _service + 'ProfileArtistIdZeroMatches input.defaultRadio').prop("checked", true);
		}
	} else { // new bandname
		$j( '#' + _service + 'ProfileArtistIdZeroMatches input.defaultRadio' ).prop("checked", true);
	}
	var zeroMatches = $j('.enterZeroMatchCustom' + service + 'ProfileUri');
	if ( autoFill ) {
		$j( '.myCustom' + service + 'ProfileUri' ).val( "" );
	}
	if ( !autoFill || !profile ) {
		zeroMatches.slideDown('fast'); // show form
	} else {
		zeroMatches.stop().hide(); // hide form
	}
	$j( '#' + _service + 'ProfileArtistIdFound' ).toggle( found );
	$j( '#' + _service + 'ProfileArtistIdZeroMatches').toggle( !found );
}

function updateAppleRequirementsTitle(obj, tracknum){
	var title = $j(obj).val();
	$('.requirements-track-name').eq(tracknum-1).text(title);
}

// DC-27350: Updates the "Additional Apple Requirements" credits section when user changes track quantity
function updateAppleRequirements() {
	var numTracks = howManyTracks();
	var $songDivs = $('.requirements-song');
	resetAdditionalRequirementsStatus();
	// remove existing songs
	if ($songDivs.length > 1) {
		$songDivs.slice(1).remove();
	}

	var $remainingSong = $('.requirements-credits-section .requirements-song').first();

	//Remove outdated click event listeners
	$(".requirements-song-header").off("click");

	//Ensure first song is expanded
	$remainingSong.addClass("open");

	// clear existing input data
	var $performers = $remainingSong.find('.requirements-performer');
	if ($performers.length > 1) {
		$performers.not(':first').remove();
	}
	var $producers = $remainingSong.find('.requirements-producer');
	if ($producers.length > 1) {
		$producers.not(':first').remove();
	}
	$remainingSong.find('select').each(function() {
		$(this).val('unselected');
	});
	$remainingSong.find('input[type="text"]').val('');
	$remainingSong.find('.requirements-track-name').text('Song title');

	// duplicate section for each track quantity
	for (var i = 1; i < numTracks; i++) {
		var $clonedSong = $remainingSong.clone();
		var trackNum = i + 1;
		$clonedSong.removeClass("open");
		$clonedSong.find('.requirements-track-number').text(trackNum);
		$clonedSong.find('.requirements-performer-section').attr('tracknum', trackNum);
		$clonedSong.find('.requirements-producer-section').attr('tracknum', trackNum);
		$clonedSong.find('select.performer-role').attr('id', `track-${trackNum}-performer-1-role`);
		$clonedSong.find('input[name="performer-name"]').attr('id', `track-${trackNum}-performer-1-name`);
		$clonedSong.find('select.producer-role').attr('id', `track-${trackNum}-producer-1-role`);
		$clonedSong.find('input[name="producer-name"]').attr('id', `track-${trackNum}-producer-1-name`);
		$('.requirements-credits-section').append($clonedSong);
	}

	// show or hide the 'copy credit' action depending on the number of tracks
	if (numTracks == 1) {
		$('.requirements-credits-section .credit-action.copy-credit').hide();
	} else {
		$('.requirements-credits-section .credit-action.copy-credit').show();
	}

	// add accordion logic
	$(".requirements-credits-section .requirements-song .requirements-song-header").after().on("click", function(e){
		$(this).closest(".requirements-song")
			.toggleClass("open");
	});
}

function bandNameVerifyArtist() {
	console.log('bandNameVerifyArtist happen +++++++');
	if (typeof artistAppleVerifyThingTimer != 'undefined') {
		clearTimeout(artistAppleVerifyThingTimer);
	}
	var bandname = getLowerBandname();
	if (!bandname || !needToVerifyArtist()) {
		verifyArtistSuccess();
		return;
	}
	var bandnameMD5 = customMD5(bandname);
	var bandnameMD5Normal = customMD5(getBandname());
	var bandnameObject = getVerifiedBandnames(bandnameMD5);
	// if we already checked and got "ok" or "fail" we don't check again
	if (bandnameObject.status[bandnameMD5Normal] && bandnameObject.status[bandnameMD5Normal] != 'error') {
		console.log('CACHE happen =======');
		verifyArtist();
	} else {
		$('#verifyArtistCheckingContainer').show();
		artistAppleVerifyThingTimer = setTimeout(function() {
			// we don't want to send two requests for the same bandname
			if (!bandnameObject.verifyArtist) {
				console.log('verify happen =======');
				bandnameObject.verifyArtist = $j.get({
					url: '/api/artistNameLookupApple/verifyArtist.cfm',
					data: {bandname: getBandname()},
					dataType: 'json',
					success: function(response) {
						if (response.status == 'ok' || response.status == 'error' || response.status == 'fail' || response.status == 'emoji') {
							bandnameObject.status[bandnameMD5Normal] = response.status;
							if (response.message) {
								bandnameObject.errorMessage[bandnameMD5Normal] = response.message;
							}
						}
						if (bandnameMD5 == customMD5(getLowerBandname())) {
							verifyArtist();
						}
					},
					beforeSend: function() {
						$('#verifyArtistCheckingContainer').show();
					},
					complete: function() {
						bandnameObject.verifyArtist = null;
						if (bandnameMD5 == customMD5(getLowerBandname())) {
							$('#verifyArtistCheckingContainer').hide();
						}
					}
				});
			}
		}, 3000);
	}
}

function getVerifiedBandnames(bandnameMD5) {
	if (!window.verifiedBandnames) {
		window.verifiedBandnames = {};
	}
	if (!window.verifiedBandnames[bandnameMD5]) {
		window.verifiedBandnames[bandnameMD5] = {};
	}
	if (!window.verifiedBandnames[bandnameMD5].status) {
		window.verifiedBandnames[bandnameMD5].status = {};
	}
	if (!window.verifiedBandnames[bandnameMD5].errorMessage) {
		window.verifiedBandnames[bandnameMD5].errorMessage = {};
	}
	return window.verifiedBandnames[bandnameMD5];
}

function getBandname(bandname) {
	return bandname ? bandname.trim() : $j('#artistName').val().trim();
}

function getLowerBandname(bandname) {
	return bandname ? bandname.trim().toLowerCase() : $j('#artistName').val().trim().toLowerCase();
}

function needToVerifyArtist() {
	var bandname = getLowerBandname();
	var compoundArray = compoundDetector(bandname);
	var isCompound = compoundArray.length > 0;
	var isBand = $j('input:radio[name=compoundBandName][value="band"]').prop("checked");
	var getAppleId = getAppleIdFromForm();
	if ((isCompound && !isBand) || !isIdCheckRequired('apple') || getAppleId != 'new') {
		return false;
	}
	return true;
}

function verifyArtist(isSubmit) {
	var bandname = getLowerBandname();
	if (!needToVerifyArtist()) {
		verifyArtistSuccess();
		return true;
	}
	var bandnameMD5 = customMD5(bandname);
	var bandnameMD5Normal = customMD5(getBandname());
	var bandnameObject = getVerifiedBandnames(bandnameMD5);
	if (!bandnameObject.status[bandnameMD5Normal] && Boolean(isSubmit)) {
		scrollTo($('#artistName'));
		$('#artistName').focus();
		resetUploadDoneButton();
		sweetAlert('', 'Checking name availability, please wait', 'warning', 'OK, GOT IT', 'center');
		return false;
	}
	if (bandnameObject.status[bandnameMD5Normal] && bandnameObject.status[bandnameMD5Normal] == 'emoji') {
		resetUploadDoneButton();
		verifyArtistEmojiFail(bandname, Boolean(isSubmit) );
		return false;
	}
	if (bandnameObject.status[bandnameMD5Normal] && bandnameObject.status[bandnameMD5Normal] == 'fail') {
		resetUploadDoneButton();
		verifyArtistFail(getBandname(), Boolean(isSubmit) );
		return false;
	}
	verifyArtistSuccess();
	return true;
}

function verifyArtistFail(bandname, isSubmit) {
	var alreadyFailed = $j('#artistName').hasClass('verifyArtistFail');
	$j('#artistName').addClass('verifyArtistFail');
	$('#verifyArtistFailContainer').show();
	$('#verifyArtistSuccessContainer').hide();
	if (!alreadyFailed || Boolean(isSubmit)) {
		scrollTo($('#artistName'));
		$('#artistName').focus();
		sweetAlert('Too many artists with that name', 'Streaming services won\'t allow any more artists with the name "' + bandname + '". Please use a different name.', 'error', 'OK, GOT IT', 'center');
	}
}

function verifyArtistEmojiFail(bandname, isSubmit) {
	var alreadyDisplayingNotification = $j('#artistName').hasClass('verifyArtistHasEmoji');
	$j('#artistName').addClass('verifyArtistHasEmoji');
	$j('#verifyArtistSuccessContainer').hide();
	if (!alreadyDisplayingNotification || Boolean(isSubmit)) {
		scrollTo('#artistName');
		$j('#artistName').focus();
		sweetAlert("It looks like you're using an emoji", "We get it. They're fun. But streaming services won't allow them in your artist name.", 'error', 'OK, I WILL REMOVE THEM', 'center');
	}
}

function verifyArtistSuccess() {
	$('#verifyArtistCheckingContainer').hide();
	$j('#artistName').removeClass('verifyArtistFail');
	$('#verifyArtistFailContainer').hide();
	if (needToVerifyArtist()) {
		if (typeof verifyArtistSuccessTimer != 'undefined') {
			clearTimeout(verifyArtistSuccessTimer);
		}
		$('#verifyArtistSuccessContainer').show();
		verifyArtistSuccessTimer = setTimeout(function() {
			$('#verifyArtistSuccessContainer').fadeOut('fast');
		}, 3000);
	} else {
		$('#verifyArtistSuccessContainer').hide();
	}
}

function resetArtistPulldownToOriginalValues()
	{
	$j('.artistOption').each(function()
		{
		var thisOriginalValue = $j(this).attr('originalValue');
		$j(this).val(thisOriginalValue).text(thisOriginalValue);
		})
	}

function collaboratorClose()
	{
	if ($j('.newCollaboratorLink:visible').length == 0)
		{
		return false
		}
	var mainArtist = $j('select#artistName:visible option:selected').attr('originalValue');
	$j('.newCollaborator').hide();
	$j('select#artistName:visible option:selected').val(mainArtist).text(mainArtist);
	}

function cancelCollabInput(){
	$j('.newCollaborator').hide();
	$j('.newCollaboratorLink').show();
	$j('input:radio[name=compoundBandName][value="collaboration"]').prop("checked",false);
	var mainArtist = $j('select#artistName:visible option:selected').attr('originalValue');
	$j( 'select#artistName:visible option:selected' ).val( mainArtist ).text( mainArtist );
	bandNameKeyUp();
}

function toggleCollaboratorInput()
	{
	// quit if not applicable
	if ($j('.newCollaboratorLink:visible').length == 0)
		{
		return false
		}


	// Is the selected artist already a collab?
	if( $j( '.compoundBandname' ).is( ':visible' ) ){
		// If so, display the sweet alert
		Swal.fire( {
			type: 'warning',
			text: 'Sorry, you can\'t add a third collaborator',
			confirmButtonText: 'OK'
		} );
		return false;
	}

	var mainArtist = $j('select#artistName:visible option:selected').attr('originalValue');

	$j('.collaborator').first().val('');

	if ($j('.newCollaborator').is(':visible'))
		{
		collaboratorClose();
		}
	else
		{
		$j('.collaborator:visible').first().val('');
		$j('.newCollaborator').show();
		$j('.collaborator:visible').attr('mainArtist',mainArtist);
		$j('.collaborator').focus();
		$j('.newCollaboratorLink').hide();
		$j('input:radio[name=compoundBandName][value="collaboration"]').prop("checked",true);
		}
	}

function collaboratorKeydown(obj)
	{
	if (obj) {
		nonStandardCaps(obj);
	}

	if (/[`’′᾿]/.test($j('.collaborator:visible').first().val())) {
		$j('.collaborator:visible').first().val($j('.collaborator:visible').first().val().replace(/[`’′᾿]/g, "'"));
	}

	var mainArtist = $j('select#artistName:visible option:selected').attr('originalValue');
	var collaborator = $j('.collaborator:visible').first().val();
	// var collaboratorMainArtist = $j('.collaborator:visible').attr('mainArtist');

	// quit if not applicable
	// if ($j('.newCollaboratorLink:visible').length == 0)
	// 	{
	// 	return false
	// 	}

	// compile new artist name
	var newArtist = (mainArtist + ' and ' + collaborator).trim();

	// update artist dropdown
	if (collaborator && collaborator.length > 0)
		{
		$j('select#artistName:visible option:selected').val(newArtist).text(newArtist);
		}
	// else
	// 	{
	// 	$j('select#artistName:visible option:selected').val(mainArtist).text(mainArtist);
	// 	}

	bandNameKeyUp();
	}

function killArtistIdSearch() {
	if (typeof artistAppleVerifyThingTimer != 'undefined') {
		clearTimeout(artistAppleVerifyThingTimer);
	}
	if (typeof artistAppleSearchyThingTimer != 'undefined') {
		clearTimeout(artistAppleSearchyThingTimer);
	}
	if (typeof artistSpotifySearchyThingTimer != 'undefined') {
		clearTimeout(artistSpotifySearchyThingTimer);
	}
	if (typeof artistGoogleSearchyThingTimer != 'undefined') {
		clearTimeout(artistGoogleSearchyThingTimer);
	}
	if (typeof artistInstagramSearchyThingTimer != 'undefined') {
		clearTimeout(artistInstagramSearchyThingTimer);
	}
	if (typeof artistFacebookSearchyThingTimer != 'undefined') {
		clearTimeout(artistFacebookSearchyThingTimer);
	}
}

function socialMediaPackClick(obj, isMobileEvent=false)
	{
	var isChecked = $(obj).is(':checked');

	// DC-31762: Sync both checkboxes for spotlight SMP experiment
	$('#socialmediapack, #socialmediapack_alternate').prop('checked', isChecked);

	var eventName = 'album extra' + (isMobileEvent ? ' mobile' : '');
	var eventData = {
		eventName: eventName,
		notes: 'social media pack',
		albumuuid: $('#albumuuid').val(),
		isSavedToSql: false
	};
	if (isChecked)
		{
		$('#socialMediaPackRequirements').slideDown('fast');
		eventData.action = 'select';
		}
	else
		{
		$('#socialMediaPackRequirements').stop().hide();
		eventData.action = 'deselect';
		}
	$.post('/api/uploadFormEvents/',eventData);
	}

function socialMediaPackModalClick(obj, isMobileEvent=false)
	{
	var isChecked = $(obj).is(':checked');

	// Check if payment method is required (for Variant 1 and Variant 2)
	var requirePaymentMethod = $("#mobile-extras").data("require-payment-method");

	// Only sync both checkboxes if we're NOT about to show the CC modal
	// When CC modal is shown, the change event listener will uncheck the checkbox
	// and we don't want to sync them in that case
	if (!requirePaymentMethod) {
		// Sync both checkboxes for spotlight SMP experiment
		$('#socialmediapack, #socialmediapack_alternate').prop('checked', isChecked);
	}

	var eventName = 'album extra' + (isMobileEvent ? ' mobile' : '');
	var eventData = {
		eventName: eventName,
		notes: 'social media pack',
		albumuuid: $('#albumuuid').val(),
		isSavedToSql: false
	};
	if (isChecked)
		{
		// If payment method is required, the change event listener will handle the CC modal
		// Don't show SMP modal here - it will be shown after CC is added via checkSelectedExtra callback
		if (!requirePaymentMethod) {
			showSmpModal(obj);
		}
		eventData.action = 'select';
		}
	else
		{
		// When unchecking, sync both checkboxes
		$('#socialmediapack, #socialmediapack_alternate').prop('checked', false);
		eventData.action = 'deselect';
		}
	$.post('/api/uploadFormEvents/',eventData);
}

function socialMediaPackAlbumClick(obj, albumuuid) {

	var isChecked = $j(obj).is(':checked');
	var eventData = {
		type: 'album page event',
		eventName: 'album extra',
		notes: 'social media pack',
		albumuuid: albumuuid,
	};
	if (isChecked) {

		$j('#socialMediaPackRequirements').slideDown('fast');
		eventData.action = 'select';
	} else {

		$j('#socialMediaPackRequirements').stop().hide();
		eventData.action = 'deselect';
	}
	$.post('/api/kinesisEvents/', eventData);
}

function youtubeMoneyClick(obj)
	{
	var isChecked = $j(obj).is(':checked');
	if (isChecked)
		{
		$j('#youtubeWroteSome').slideDown('fast');
		}
	else
		{
		$j('#youtubeWroteSome').stop().hide();
		}
	}

function youtubeSongWriterRadioChange(obj)
	{
	var wrote = $j(obj).attr('wrote');
	if (wrote == 'some')
		{
		$j('#youtubeWroteSomePercent').slideDown('fast');
		}
	else
		{
		$j('#youtubeWroteSomePercent').stop().hide();
		}
	}

function youtubeContentIDshow(obj)
	{
	var embed = $j('#YouTubeMoneyVideo IFRAME');
	if ( !embed.attr( 'src' ) ){
		$j('#YouTubeMoneyVideo IFRAME').attr('src',"https://www.youtube.com/embed/9g2U12SsRns?rel=0&amp;showinfo=0");
	}
	$j('#YouTubeMoneyVideo').show();
	$j('#closeContentIDvideoDiv').show();
	$j(obj).hide();
	}

function youtubeContentIDhide(obj)
	{
	$j('#YouTubeMoneyVideo').hide();
	$j('#watchContentIDVideoDiv').show();
	$j(obj).hide();
	}


function genreChange() {

	var $genre1 = $("#genrePrimary");
	if ($genre1.length == 0) // if this function is called on a page where we dont even have a form...
		return false;

	var $genre2 = $("#genreSecondary");

	// ATTN: do not remove these variables without refactoring the subgenre block below which uses them by concatenating substrings
	var objValue1 = $genre1.val();
	var objValue2 = $genre2.val();
	var genre1 = $j("#genrePrimary option[value='" + objValue1 + "']").attr('genre');
	var genre2 = $j("#genrePrimary option[value='" + objValue2 + "']").attr('genre');

	// DC-27218 Mups pre-edit
	var subgenre1 = $('#subGenrePrimary').attr('data-subgenre1');
	var subgenre2 = $('#subGenreSecondary').attr('data-subgenre2');

	// begin: show subgenre selector
	$j(['Primary','Secondary']).each(function(subgenreNum,subgenreDesc) // loop through genre1 and genre2
		{
		subgenreNum++; // starts at zero so lets add 1...
		if ((allGenres[eval('objValue' + subgenreNum)] != undefined) && (!$j('.subGenre' + subgenreNum + 'Row').is(':visible'))) // if there *are* subgenres...
			{
			$j('.subgenre' + subgenreNum + 'Desc').text(eval('genre'+subgenreNum));
			$j('.subGenre' + subgenreNum + 'Row').fadeIn(70).fadeOut(70).fadeIn(70).fadeOut(70).fadeIn(70);
			$j('#subGenre' + subgenreDesc).html('');
			$j('#subGenre' + subgenreDesc)
				.append($j("<option></option>")
				.attr("value","")
				.text('Select ' + eval('genre'+subgenreNum).toLowerCase() + ' subgenre'));
			$j(allGenres[eval('objValue' + subgenreNum)]).each(function(key,value)
				{
				$j('#subGenre' + subgenreDesc)
					.append($j("<option></option>")
					.attr("value",value.value)
					.text(value.text));
				})
			}

		if (allGenres[eval('objValue' + subgenreNum)] == undefined) // if no associated subgenres, hide it
			{
			$j('.subGenre' + subgenreNum + 'Row').hide();
			$j('#subGenre' + subgenreDesc).html('<option></option>'); // this blank option makes it so there's always a subgenre selected, even if its null
			}
		});

		// set subgenres value
		if (subgenre1 !== undefined) {
			$('#subGenrePrimary').val(subgenre1);
		}
		if (subgenre2 !== undefined) {
			$('#subGenreSecondary').val(subgenre2);
		}
	// end: show subgenre selector

	var genre1 = $genre1.find("option:selected").text();

	if (isGenreSelected("Hip Hop/Rap", true)) {
		$('.distroExplicit[value=1]').prop('checked', true);
	}

	// show beatport unlimited if Electronic genre selected
	var isElectronic = isGenreSelected("Electronic");
	$(".beatportUnlimited").toggle(isElectronic);

	// DC-34791: If genre is not Electronic, uncheck Beatport checkbox and recalculate extras total
	if (!isElectronic) {
		$('input[type="checkbox"][extra="beatport"]').prop('checked', false);
		if (typeof extrasCheck === 'function') {
			extrasCheck();
		}
	}

	if (isGenreSelected("Classical")) {
		$(".classicalNotice").slideDown("fast");
		$(".composerRow").fadeIn("fast");
	}
	else {
		$(".classicalNotice").stop().hide();
		$(".composerRow").stop().fadeOut("fast");
	}

	if (isGenreSelected("Soundtrack")) {
		$(".soundtrackNotice").slideDown("fast");
	}
	else {
		$(".soundtrackNotice").stop().hide();
	}

	if ((isGenreSelected("Comedy", true) || isGenreSelected("Spoken word", true)) && isStoreSelected("facebook")) {
		var $notice = $(".metaGenreNotice");
		$notice.find(".genre").text(genre1);
		$notice.slideDown("fast");
	}
	else {
		$(".metaGenreNotice").stop().hide();
	}
	toggleRequirementsContainerUploadFormVisibility();
}

$j( document ).ready( function(){
	genreChange();

	$j( '.artistNameSelectCollab' ).on( 'change', function( e ){
		$j( '.newCollaboratorLink' ).show();
		$j( '.newCollaborator' ).hide();
	} );

	// DC-6851 - Adding onclick social popup function to prep SiteTrans translated share text
	$j( '.js-ShareText' ).on( 'click', function( e ){
		e.preventDefault();
		var thisSocial      = $j( this ).attr( 'data-social' );
		var thisAlbumTitle  = $j( this ).attr( 'data-albumtitle' );
		var thisReleaseLink = $j( '#socialShareLink' ).html();
		// build string
		var shareText = $j( '#socialShareText1' ).html() + '"' + thisAlbumTitle + '" ' + $j( '#socialShareText2' ).html() + ' ' + $j( '#socialShareLink' ).html() + ' ' + $j( '#socialShareText3' ).html();
		switch( thisSocial ) {
			case 'x':
				var thisURL = 'https://x.com/intent/tweet?text=' + encodeURIComponent( shareText ) + '&source=distrokid';
				break;
			case 'linkedin':
				var thisURL = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent( thisReleaseLink );
				break;
			case 'pinterest':
				var thisURL = 'https://pinterest.com/pin/create/button/?url=' + encodeURIComponent( thisReleaseLink ) + '&media=' + encodeURIComponent('https://distrokid.com/images/logo_og_image.png') + '&description=' + encodeURIComponent( shareText );
				break;
		}
		popup( thisURL, 'Pre-save', 600, 400 );
		console.debug( thisURL );
	} );


} )

function doneDeleting(obj)
	{
	if ($j('.allGoodInStores').length == 0)
		{
		$j('#removeFromSelectStoresButtons').hide();
		$j('#removeFromSelectStoresPleaseWait').hide();
		$j('#removeFromSelectStoresDone').show();
		$j('#removeFromSelectStoresDiv').hide();
		}

	if ($j('#removeFromSelectStoresLink').attr('id') != 'removeFromSelectStoresLink')
		{
		$j(obj).hide();
		$j('.allGoodInStores').html('<i class="fa fa-check-circle"></i> Deleted. If it\'s in stores already, allow 2-5 days to fully disappear.')
		$j('.theMessage').html('<i class="fa fa-check-circle"></i> Deleted. If it\'s in stores already, allow 2-5 days to fully disappear.')
		}
	else
		{
		$j(obj).hide();
		}
	// $j('.allGoodInStores').hide();
	}

function albumOrSingle()
	{
	if (howManyTracks() == 1)
		{
		return 'single'
		}
	else
		{
		return 'album'
		}
	}

/*
 * this function is for the myCurrencyProducts struct which holds the currency and price info for that currency
 * it takes the product as an arg, and returns the product price rounded properly
 */
function getProductPrice(product='', amount=0, symbol=false) {
	if (product != '') {
		amount = myCurrencyProducts['prices'][product];
	} else {
		convertedAmount = amount * myCurrencyProducts['exchangeRate'];
		if (myCurrencyProducts['format'] == "numeric") {
			amount = round(convertedAmount, 0);
		} else {
			amount = round(convertedAmount, 2);
		}
		return amount;
	}
	if (symbol) {
		return addCurrencySymbol(amount);
	}
	return amount;
}

/*
 *  this function is for the myCurrencyProducts struct which holds the currency and price info for that currency
 *  takes in a string amount (ex. 123 or '123,456') and appends a currency symbol to it
 */
function addCurrencySymbol(sAmount) {
	symbol = myCurrencyProducts['htmlCode'];
	formattedAmount = (symbol == 'kr') ? (sAmount + 'kr') : (symbol + sAmount);

	suffix = myCurrencyProducts['currency-suffix'];
	if (suffix) {
		return formattedAmount + " " + suffix;
	}
	return formattedAmount;
}

var extras = {}; // global var
function extrasCheck() // used on upload form and also on dashboard album view
	{
	// begin: dynamic extras pricing
	if (howManyTracks() == 1) {
		var youtubePrice = myAvailableExtrasJSON['youtubemoney']['price'];
		var legacyPrice = myAvailableExtrasJSON['legacy']['price'];
		var mqaPrice = myAvailableExtrasJSON['mqa']['price'];
		var smpPrice = myAvailableExtrasJSON['socialmediapack']['price'];
		var loudnormPerTrack = '';
		$('.album_or_single').html('single');
		$('.shazamDetails').hide();
	} else {
		var youtubePrice = myAvailableExtrasJSON['youtubemoney']['multiPrice'];
		var legacyPrice = myAvailableExtrasJSON['legacy']['multiPrice'];
		var mqaPrice = myAvailableExtrasJSON['mqa']['multiPrice'];
		var smpPrice = myAvailableExtrasJSON['socialmediapack']['multiPrice'];
		var loudnormPerTrack = ' x' + howManyTracks();
		$('.album_or_single').html('album');
		$('.shazamDetails').show();
	}

	// dynamic extras display price
	if (howManyTracks() == 1) {
		var youtubeDisplayPrice =  getProductPrice('ytCidSingle');
		var legacyDisplayPrice = getProductPrice('legacySingle');
		var mqaDisplayPrice = getProductPrice('mqaSingle');
		var smpDisplayPrice = getProductPrice('socialMediaPackSingle');
	} else {
		var youtubeDisplayPrice = getProductPrice('ytCidAlbum');
		var legacyDisplayPrice =  getProductPrice('legacyAlbum');
		var mqaDisplayPrice =  getProductPrice('mqaAlbum');
		var smpDisplayPrice = getProductPrice('socialMediaPackAlbum');
	}

	// upgrading from YouTube Content ID to Social Media Pack should be free on album page
	if ($('#youtube-content-id-confirmation').length) {
		smpPrice = 0;
		smpDisplayPrice = 0;
	}

	var storeMaximizerDisplayPrice = getProductPrice('storeMaximizer');

	youtubeDisplayPriceFormat = addCurrencySymbol(youtubeDisplayPrice.toLocaleString('en-US'));
	legacyDisplayPriceFormat = addCurrencySymbol(legacyDisplayPrice.toLocaleString('en-US'));
	mqaDisplayPriceFormat = addCurrencySymbol(mqaDisplayPrice.toLocaleString('en-US'));
	smpDisplayPriceFormat = addCurrencySymbol(smpDisplayPrice.toLocaleString('en-US'));
	storeMaximizerDisplayPriceFormat = addCurrencySymbol(storeMaximizerDisplayPrice.toLocaleString('en-US'));


	var loudnormPrice = howManyTracks() * myAvailableExtrasJSON['loudnorm']['price'];
	var loudnormDisplayPrice = howManyTracks()*getProductPrice('loudnorm');
	$('input[type="checkbox"][extra="youtubemoney"]').attr('price',youtubePrice.toFixed(2));
	$('input[type="checkbox"][extra="legacy"]').attr('price',legacyPrice.toFixed(2));
	$('input[type="checkbox"][extra="mqa"]').attr('price',mqaPrice.toFixed(2));
	$('input[type="checkbox"][extra="loudnorm"]').attr('price',loudnormPrice.toFixed(2));
	$('input[type="checkbox"][extra="socialmediapack"]').attr('price',smpPrice.toFixed(2));

	$('input[type="checkbox"][extra="youtubemoney"]').attr('displayPrice',youtubeDisplayPrice.toFixed(2));
	$('input[type="checkbox"][extra="legacy"]').attr('displayPrice',legacyDisplayPrice.toFixed(2));
	$('input[type="checkbox"][extra="mqa"]').attr('displayPrice',mqaDisplayPrice.toFixed(2));
	$('input[type="checkbox"][extra="loudnorm"]').attr('displayPrice',loudnormDisplayPrice.toFixed(2));
	$('input[type="checkbox"][extra="socialmediapack"]').attr('displayPrice',smpPrice.toFixed(2));

	$('#youtube_money_price').html(youtubeDisplayPriceFormat);
	$('#legacy_price').html(legacyDisplayPriceFormat);
	$('#mqa_price').html(mqaDisplayPriceFormat);
	$('#loudnorm_price').html(loudnormPrice);
	$('#loudnormPerTrack').html(loudnormPerTrack);
	$('#social_media_pack_price').html(smpDisplayPriceFormat);
	$('#social_media_pack_price_alternate').html(smpDisplayPriceFormat);
	$('#store_maximizer_price').html(storeMaximizerDisplayPriceFormat);
	// end: dynamic extras pricing

	// begin: calculate yearly extras
	var totalExtraPrice = 0;
	var displayTotalExtraPrice = 0;
	var extrasCheckboxes = $('input[type="checkbox"][extra][term="yearly"]'); // recurring
	$(extrasCheckboxes).each(function()
		{
		var extraType = $(this).attr('extra');
		var isChecked = $(this).is(':checked');
		var price = $(this).attr('price') * 1;
		var displayPrice = $(this).attr('displayPrice') * 1;
		var idsExcludedFromTotal = [
			"socialmediapack_alternate", // if SMP appears twice on the upload form, do not factor the second one into total price calculations
		];
		if (isChecked)
			{
			if (!idsExcludedFromTotal.includes($(this).attr('id')))
				{
				totalExtraPrice = totalExtraPrice + price;
				displayTotalExtraPrice = displayTotalExtraPrice + displayPrice;
				extras[extraType] = {}; // set global var
				extras[extraType]['term'] = $(this).attr('term');
				extras[extraType]['total'] = price;

				// begin: metadata?
				if (typeof $(this).data('metadata') != 'undefined')
					{
					extras[extraType]['metadata'] = $(this).data('metadata');
					}
				// begin: metadata?

				// begin: instant charge? determines if this gets paid when the release is uploaded ("instant") or when the release is sent to DSPs (not instant)
				if (typeof $(this).attr('instantCharge') != 'undefined')
					{
					extras[extraType]['instantCharge'] = ($(this).attr('instantCharge') == 'true') // boolean
					}
				// end: instant charge? determines if this gets paid when the release is uploaded ("instant") or when the release is sent to DSPs (not instant)
				}
			}
		else
			{
			delete extras[extraType]; // remove from global var
			}
		})
	// end: calculate yearly extras

	// begin: calculate one-time extras
	var totalExtraOneTimePrice = 0;
	var displayTotalExtraOneTimePrice = 0;
	var extrasCheckboxes = $('input[type="checkbox"][extra][term="one-time"]'); // one-time
	$(extrasCheckboxes).each(function()
		{
		var extraType = $(this).attr('extra');
		var isChecked = $(this).is(':checked');
		var price = $(this).attr('price') * 1;
		var displayPrice = $(this).attr('displayPrice') * 1;
		if (isChecked)
			{
			totalExtraOneTimePrice = totalExtraOneTimePrice + price
			displayTotalExtraOneTimePrice = displayTotalExtraOneTimePrice + displayPrice;
			extras[extraType] = {}; // set global var
			extras[extraType]['term'] = 'one-time';
			extras[extraType]['total'] = price;
			}
		else
			{
			delete extras[extraType];
			}
		})
	// end: calculate one-time extras

	// begin: calculate one-time extras, like nail clippers, that are unrelated to this release
	var totalExtraOneTimePurchasesUnrelatedToReleasePrice = 0;
	var displayTotalExtraOneTimePurchasesUnrelatedToReleasePrice = 0;
	var extrasCheckboxes = $('input[type="checkbox"][extra][term="one-time-purchases-unrelated-to-release"]'); // one-time unrelated to release (like nail clippers)
	$(extrasCheckboxes).each(function()
		{
		var extraType = $(this).attr('extra');
		var isChecked = $(this).is(':checked');
		var price = $(this).attr('price') * 1;
		var displayPrice = $(this).attr('displayPrice') * 1;
		if (isChecked)
			{
			totalExtraOneTimePurchasesUnrelatedToReleasePrice = totalExtraOneTimePurchasesUnrelatedToReleasePrice + price
			displayTotalExtraOneTimePurchasesUnrelatedToReleasePrice = displayTotalExtraOneTimePurchasesUnrelatedToReleasePrice + displayPrice
			extras[extraType] = {}; // set global var
			extras[extraType]['term'] = 'one-time-purchases-unrelated-to-release';
			extras[extraType]['total'] = price;

			// begin: metadata?
			if (typeof $(this).data('metadata') != 'undefined')
				{
				extras[extraType]['metadata'] = $(this).data('metadata');
				}
			// begin: metadata?
			}
		else
			{
			delete extras[extraType];
			}
		})
	// end: calculate one-time extras, like nail clippers, that are unrelated to this release

	var displayTotalExtrasAmount = (totalExtraPrice*1+totalExtraOneTimePrice*1+totalExtraOneTimePurchasesUnrelatedToReleasePrice*1);
	var currencyDisplayTotalExtrasAmount = (displayTotalExtraPrice*1 + displayTotalExtraOneTimePrice*1 + displayTotalExtraOneTimePurchasesUnrelatedToReleasePrice*1);
	var formatDisplayTotalExtrasAmount = addCurrencySymbol(currencyDisplayTotalExtrasAmount.toFixed(2));

	// begin: add mandatory checkbox for Sellouts
	if ($('input[extra="sellouts"]:checked').length > 0)
		{
		$('#mandatoryCheckboxSellouts').show();
		}
	else
		{
		$('#mandatoryCheckboxSellouts').hide();
		}
	// end: add mandatory checkbox for Sellouts

	// console.debug('yearly extras: ' + totalExtraPrice*1);
	$('#extrasAmountYearly').val((totalExtraPrice*1).toFixed(2));

	// console.debug('one-time extras: ' + totalExtraOneTimePrice*1);
	$('#extrasAmountOneTime').val((totalExtraOneTimePrice*1).toFixed(2));

	// console.debug('one-time extras: ' + totalExtraOneTimePrice*1);
	$('#extrasAmountOneTimePurchasesUnrelatedToRelease').val((totalExtraOneTimePurchasesUnrelatedToReleasePrice*1).toFixed(2));

	// console.debug('total extras: ' + displayTotalExtrasAmount*1);
	// update dollar amount displayed. make it a string, so it shows correctly in all languages
	$('#extrasAmount').html(formatDisplayTotalExtrasAmount);
	}

function distroDeleteFromStores( albumuuid, stores, obj, csrf, allStores, inserted ){
	console.debug(obj);
	csrf = typeof csrf !== 'undefined' ? csrf : '';
    allStores = typeof allStores !== 'undefined' ? allStores : 0;

	var alertTitle = 'Delete this release';
	var confirmationText = 'Are you sure you want to delete this release?';
	console.debug(['distroDeleteFromStores', inserted, passwordChallengeRequired]);
	if (inserted){

		alertTitle = 'Delete from all services';
        confirmationText = ( incomingFromSpotify ) ? 'Remove this release from stores except Spotify.\n\nTo remove from Spotify, please visit Spotify for Artists.' : confirmationText;
	}

	if ( passwordChallengeRequired ) {
		Swal.fire({
			title: 'Delete from all services',
			text: confirmationText,
			input: 'password',  // This makes the input to be of type password
			inputPlaceholder: 'Enter your password',  // Placeholder for password input
			inputLabel: "Password",
			inputAttributes: {
				'aria-label': 'Type your password here',
				'autocomplete': 'new-password'  // Helps control autocomplete settings
			},
			type: 'warning',
			showCancelButton: false,
			showCloseButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: '<i class="fa fa-trash"></i> Delete',
			cancelButtonText: 'Cancel',
			cancelButtonAriaLabel: 'Cancel',
			confirmButtonClass: 'redbg',
		}).then((result) => {
			if (result.value) {
				const password = result.value;

				var originalHTML = $j( obj ).html();
				$j( obj ).attr( 'originalHTML', originalHTML );
				$j( obj ).removeClass( 'linklike' );
				$j( obj ).html( '<img src="/images/spinner.gif" height="8"> Please wait...' );
				$j( obj ).removeClass( 'buttonSmall' );
				var myURL = '/api/musicToStores/?csrf=' + csrf + '&albumuuid='+encodeURIComponent( albumuuid )+'&stores='+encodeURIComponent( stores )+'&action=delete'+( allStores == 1 ? '&allStores=1' : '' );

				$j.ajax( {
					url: myURL,
					method: 'post',
					data: {'password': password},
					success: function( data ){
						// console.debug( ['distroDeleteFromStores()', 'myURL=/api/musicToStores/...',data] );
						isStoreOwnerDeleteTriggered = false;
						doneDeleting( obj );

						Swal.fire( {
							type: 'success',
							title: 'Deleted',
							text: 'If it\'s in stores already, allow 2-5 days to fully disappear.',
							confirmButtonText: 'OK'
						} );
					},
					error: function( err,type, message ){
						Swal.fire( {
							type: 'error',
							title: 'Not deleted from Stores',
							text: err.responseJSON.message,
							confirmButtonText: 'OK'
						})
						.then((result) => {
							if (result.value) {
								window.location.href = '/';
							}
						});

						// Set a timeout to redirect after 10 seconds
						setTimeout(() => {
							window.location.href = '/';
						}, 10000);
					}
				} );
			} else {
				// dialog cancelled
				isStoreOwnerDeleteTriggered = false;
			}
		});

	} else {
		sweetAlertConfirm(
			alertTitle,
			confirmationText,
			function(){
				var originalHTML = $j( obj ).html();
				$j( obj ).attr( 'originalHTML', originalHTML );
				$j( obj ).removeClass( 'linklike' );
				$j( obj ).html( '<img src="/images/spinner.gif" height="8"> Please wait...' );
				$j( obj ).removeClass( 'buttonSmall' );
				var myURL = '/api/musicToStores/?csrf=' + csrf + '&albumuuid='+encodeURIComponent( albumuuid )+'&stores='+encodeURIComponent( stores )+'&action=delete'+( allStores == 1 ? '&allStores=1' : '' );
				// console.debug( myURL );
				$j.ajax( {
					url: myURL,
					method: 'get',
					success: function( data ){
						// console.debug( data );
						doneDeleting( obj );
						Swal.fire( {
							type: 'success',
							title: 'Deleted',
							text: 'If it\'s in stores already, allow 2-5 days to fully disappear.',
							confirmButtonText: 'OK'
						} );
					},
					error: function( err ){
						// console.warn( err );
						Swal.fire( {
							type: 'error',
							title: 'Not deleted from Stores',
							text: err.responseJSON.message,
							confirmButtonText: 'OK'
						})
						.then((result) => {
							if (result.value) {
								window.location.href = '/';
							}
						});

						// Set a timeout to redirect after 10 seconds
						setTimeout(() => {
							window.location.href = '/';
						}, 10000);
					}
				} );
			},
			function(){},
			'warning',
			'<i class="fa fa-trash"></i> Delete',
			'Cancel',
			'redbg'
		)
	}
}


var isStoreOwnerDeleteTriggered = false;

function distroDeleteFromStoresOwnerEdit( albumuuid, stores, obj, csrf, allStores ){
	console.debug(['distroDeleteFromStoresOwnerEdit,', isStoreOwnerDeleteTriggered, passwordChallengeRequired, obj]);
	if( !isStoreOwnerDeleteTriggered ){

		csrf = typeof csrf !== 'undefined' ? csrf : '';
		allStores = typeof allStores !== 'undefined' ? allStores : 0;

		var confirmationText = 'Are you sure you want to delete this release?';
		confirmationText = ( incomingFromSpotify ) ? 'Remove this release from stores except Spotify.\n\nTo remove from Spotify, please visit Spotify for Artists.' : confirmationText;

		isStoreOwnerDeleteTriggered = true;

		if ( passwordChallengeRequired ) {
			Swal.fire({
				title: 'Delete from all services',
				text: confirmationText,
				input: 'password',  // This makes the input to be of type password
				inputPlaceholder: 'Enter your password',  // Placeholder for password input
				inputLabel: "Password",
				inputAttributes: {
					'aria-label': 'Type your password here',
					'autocomplete': 'new-password'  // Helps control autocomplete settings
				},
				type: 'warning',
				showCancelButton: false,
				showCloseButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: '<i class="fa fa-trash"></i> Delete',
				cancelButtonText: 'Cancel',
				cancelButtonAriaLabel: 'Cancel',
				confirmButtonClass: 'redbg',
			}).then((result) => {
				if (result.value) {
					const password = result.value;

					var originalHTML = $j( obj ).html();
					$j( obj ).attr( 'originalHTML', originalHTML );
					$j( obj ).removeClass( 'linklike' );
					$j( obj ).html( '<img src="/images/spinner.gif" height="8"> Please wait...' );
					$j( obj ).removeClass( 'buttonSmall' );
					var myURL = '/api/musicToStores/?csrf=' + csrf + '&albumuuid='+encodeURIComponent( albumuuid )+'&stores='+encodeURIComponent( stores )+'&action=delete'+( allStores == 1 ? '&allStores=1' : '' );

					$j.ajax( {
						url: myURL,
						method: 'post',
						data: {'password': password},
						success: function( data ){
							// console.debug( ['distroDeleteFromStores()', 'myURL=/api/musicToStores/...',data] );
							isStoreOwnerDeleteTriggered = false;
							doneDeleting( obj );

							Swal.fire( {
								type: 'success',
								title: 'Deleted',
								text: 'If it\'s in stores already, allow 2-5 days to fully disappear.',
								confirmButtonText: 'OK'
							} );
						},
						error: function( err,type, message ){
							console.log(['ERROR: Not deleted from Stores',err,type, message ])
							Swal.fire( {
								type: 'error',
								title: 'Not deleted from Stores',
								text: err.responseJSON.message,
								confirmButtonText: 'OK'
							})
							.then((result) => {
								if (result.value) {
									window.location.href = '/';
								}
							});

							// Set a timeout to redirect after 10 seconds
							setTimeout(() => {
								window.location.href = '/';
							}, 10000);
						}
					} );
				} else {
					// dialog cancelled
					isStoreOwnerDeleteTriggered = false;
				}
			});

		} else {
			sweetAlertConfirm(
				'Delete from all services',
				confirmationText,
				function(){
					var originalHTML = $j( obj ).html();
					$j( obj ).attr( 'originalHTML', originalHTML );
					$j( obj ).removeClass( 'linklike' );
					$j( obj ).html( '<img src="/images/spinner.gif" height="8"> Please wait...' );
					$j( obj ).removeClass( 'buttonSmall' );
					var myURL = '/api/musicToStores/?csrf=' + csrf + '&albumuuid='+encodeURIComponent( albumuuid )+'&stores='+encodeURIComponent( stores )+'&action=delete'+( allStores == 1 ? '&allStores=1' : '' );
					console.debug( myURL );
					$j.ajax( {
						url: myURL,
						method: 'get',
						success: function( data ){
							// console.debug( data );
							isStoreOwnerDeleteTriggered = false;
							doneDeleting( obj );
							location.href = '/release-removed-from-stores/?albumuuid=' + encodeURIComponent( albumuuid );
						},
						error: function( err ){
							//console.warn( err );
							Swal.fire( {
								type: 'error',
								title: 'Not deleted from Stores',
								text: err.responseJSON.message,
								confirmButtonText: 'OK'
							})
							.then((result) => {
								if (result.value) {
									window.location.href = '/';
								}
							});

							// Set a timeout to redirect after 10 seconds
							setTimeout(() => {
								window.location.href = '/';
							}, 10000);
						}
					} );
				},
				function(){
					isStoreOwnerDeleteTriggered = false;
				},
				'warning',
				'<i class="fa fa-trash"></i> Delete',
				'Cancel',
				'redbg'
			)
		}

	}
}


function numberFormat(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function GetXmlHttpObject () {
 var xmlHttp = null;
 try {
   // Firefox, Opera 8.0+, Safari, IE 7+
   xmlHttp = new XMLHttpRequest();
 } catch (e) {
   // Internet Explorer - old IE - prior to version 7
   try {
      xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
   } catch (e) {
      xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
   }
 }
 return xmlHttp;
}

function calculateYouTubeMoneyPercentOwned() {
	var isChecked = $('input[type="checkbox"][extra="youtubemoney"]').is(':checked') || $('input[type="checkbox"][extra="socialmediapack"]').is(':checked');

	if (!isChecked) {
		return 0;
	} else {
		// First check for regular radio buttons in the DOM
		var selectedRadioButton = $('input[wrote][name="youtubeMoneyWriterPercent"][type="radio"]').filter(":checked");

		// If no radio button found in DOM, check for stored SMP selection
		if (selectedRadioButton.length == 0) {
			var pageDataDiv = $('#upload-form-page-data');
			var smpSelection = pageDataDiv.data('smpRadioSelection');
			if (smpSelection) {
				var wrote = smpSelection.wrote;
				console.debug('Using stored SMP selection:', wrote);
				if (wrote == 'all') {
					return 100;
				} else {
					return 0;
				}
			} else {
				return -1; // they havent selected an ownership radio button
			}
		} else {
			var wrote = $(selectedRadioButton).attr('wrote');
			console.debug(wrote);
			if (wrote == 'all') {
				return 100;
			} else if (wrote == 'some') {
				return $('select[name="youtubemoneypercent"]').val()*1;
			} else {
				return -2; // no covers
			}
		}
	}
}

function toggleRequirementsContainerUploadFormVisibility() {
	if ($('.upload-mobile').length && $('.requirements-container-component').length) {
		if (isAppleStoreSelected() && !isGenreSelected("Classical")) {
			$('.requirements-container-component').show();
		} else {
			$(".requirements-performer, .requirements-producer").has(".delete-credit:visible").remove();
			$(".performer-role, .producer-role").val("unselected");
			$(".performer-name, .producer-name").val("");

			$('.requirements-container-component').hide();
		}
	}
}

function clickedDistroStore(obj) {
	var store = $j(obj).val();
	console.log(store)
	if ((typeof incomingFromSpotify != 'undefined' && (typeof incomingFromTully === 'undefined' || !incomingFromTully)) && (store == 'spotify')) {
		alert('You\'ve already uploaded this release to Spotify.');
		return false;
	}

	if (store == 'google') { // used to be youtube, until google & youtube became combined
		if ($j(obj).is(':checked')) {
			$j('#mandatoryCheckboxYouTube').show();
			$j( '#youTubeOAC' ).show()
			$j( '#youtubeChannel0' ).prop( 'checked', true );
			if (typeof youtubeChannelSelector !== 'undefined') {
				youtubeChannelSelector();
			}
		} else {
			$j('#mandatoryCheckboxYouTube').hide();
			$j( '#youTubeOAC' ).hide()
			$j( '#youtubeChannel0' ).prop( 'checked', true );
		}
	}

	if (store == 'applemusic' || store == 'itunes' || store == 'spotify' || store == 'google' || store == 'facebook') {
		toggleArtistMappingTr();
		triggerArtistIdContainers();
	}

	// DC-10159 - pre-order fields to check for visability
	if (store == 'applemusic' || store == 'itunes' || store == 'spotify' || store == 'amazon') {
		changedReleaseDate();
	}

	// DC-18463 conditional emoji warning text for apple music / itunes
	if (store == 'applemusic' || store == 'itunes') {
		if (isAppleStoreSelected()) {
			$('.uploadNotice').addClass('appleStoreSelected');
		} else {
			$('.uploadNotice').removeClass('appleStoreSelected');
			updateArtistBioVisibility(false);
		}
		$(".alert-no-emoji").remove();			// remove alerts so that we do not show a cached warning text
		$("input.no-emoji").trigger("change");	// show alerts if any of the no-emoji fields contains emoji

		toggleRequirementsContainerUploadFormVisibility();
	}

	if (store == 'tidal') {
		if ($j('.distroStore[value="tidal"]').is(':checked')) {
			$j('#mqaContainer').show();
		} else {
			$j('input[type="checkbox"][extra="mqa"]').prop("checked", false);
			$j('#mqaContainer').hide();
		}
	}

	// DC-17713 ByteDance CML opt-in
	if (store == 'tiktok') {
		if ( !$j(obj).is( ':checked' )) {
			$j('#chktiktokcml').attr( 'checked', false );
			$j('#mandatoryCheckboxTicktokCml').hide();
		}
	}

	if (store == 'roblox') {
		if ( $j(obj).is( ':checked' )) {
			showRobloxRequirements(obj);
		}
	}

	genreChange();

	// only attempt to call updateDspIcons if it exists (on desktop upload form & release-preview.js is included)
	if (typeof updateDspIcons === "function") {
		updateDspIcons();
	}
}

function showRobloxRequirements(obj) {

	Swal.fire( {
		title: 'Roblox Eligibility Requirements',
		type: '',
		html: `
			Roblox can only accept releases from artists who have full publishing rights to their music and who aren't registered with a Performing Rights Organization (like ASCAP, BMI, etc).<br><br>
			<span class="roblox-sa-subheader">To distribute to Roblox, confirm:</span><br>
			<div class="roblox-sa-checkbox-row">
				<input type="checkbox" id="confirm-chk-1" name="confirm-chk-1" onclick="robloxConfirmClick()"><label for="confirm-chk-1">I own all publishing rights to this music, including performance rights</label>
			</div>
			<div class="roblox-sa-checkbox-row">
				<input type="checkbox" id="confirm-chk-2" name="confirm-chk-2" onclick="robloxConfirmClick()"><label for="confirm-chk-2">I am not registered with a Performing Rights Organization</label>
			</div>
			<div class="roblox-sa-checkbox-row">
				<input type="checkbox" id="confirm-chk-3" name="confirm-chk-3" onclick="robloxConfirmClick()"><label for="confirm-chk-3">I understand that music on Roblox is not monetized at this time</label>
			</div>
			<div class="roblox-sa-checkbox-row">
				<input type="checkbox" id="confirm-chk-4" name="confirm-chk-4" onclick="robloxConfirmClick()"><label for="confirm-chk-4">I agree to the <a href="/roblox-music-terms-of-service/" target="_blank">Roblox Music Terms of Service</a></label>
			</div>
		`,
		onOpen() { robloxConfirmClick(); },
		reverseButtons: true,
		showCloseButton: false,
		showCancelButton: true,
		focusConfirm: false,
		allowOutsideClick: false,
		allowEscapeKey: false,
		allowEnterKey: false,
		confirmButtonText: 'CONTINUE',
		confirmButtonAriaLabel: 'Continue',
		cancelButtonText: 'CANCEL',
		customClass: {
			title: 'roblox-sa-title',
			content: 'roblox-sa-text-content',
			confirmButton: 'roblox-sa-continue-button',
			cancelButton: 'roblox-sa-cancel-button'
		},
		cancelButtonAriaLabel: 'Cancel'
	} ).then( function( isConfirm ){
		if( isConfirm.value ){
			$j( obj ).prop( 'checked', true );
		} else {
			$j( obj ).prop( 'checked', false );
		}
	} );
}

function robloxConfirmClick() {

	var isChecked1 = $j('#confirm-chk-1').is(':checked');
	var isChecked2 = $j('#confirm-chk-2').is(':checked');
	var isChecked3 = $j('#confirm-chk-3').is(':checked');
	var isChecked4 = $j('#confirm-chk-4').is(':checked');

	if (isChecked1 && isChecked2 && isChecked3 && isChecked4) {
		$j('.roblox-sa-continue-button').removeAttr('disabled');
	}
	else {
		$j('.roblox-sa-continue-button').prop('disabled' , 'disabled');
	}
}

function showSmpModal(obj) {

	Swal.fire( {
		title: '', // Remove the title from here
		type: '',
		html: `
			<div class="smp-modal-header">
				<img src="/new/images/icon-socialmediapack.svg" class="extras-icons icon" />
				<span class="smp-modal-title">Social Media Pack Eligibility Requirements</span>
			</div>
			<div class="smp-modal-content">
				To help protect your music, avoid copyright issues, and keep your release eligible for monetization on social platforms, please confirm that the following are true for this <span class="smp-modal-release-type">[single/album]</span>:
				<ul>
					<li><strong>You own 100% of the sounds</strong>&mdash;including all music, vocals, beats, samples, and effects. Nothing was taken from sample libraries, public domain content, social media, TV, movies, or video games.</li>
					<li><strong>This release is exclusive to you.</strong> It hasn't been (and won't be) uploaded by anyone else, on DistroKid or any other distributor. You haven't given permission to remix or re-upload it.</li>
					<li><strong>You understand the risks.</strong> If any of the above isn't true, monetization may be denied or removed, and your account could be suspended.</li>
				</ul>
				<div class="smp-modal-checkbox-row">
					<input type="checkbox" id="smp-confirm-chk" name="smp-confirm-chk" onclick="smpConfirmClick()"><label for="smp-confirm-chk">Yes, I understand and confirm that all of the above are true.</label>
				</div>
				<span class="smp-modal-subheader">Who wrote the music &amp; lyrics?</span><br>
				This helps us determine whether to collect publishing royalties for you. It's totally fine if you didn't write everything yourself—just let us know:
				<div class="smp-modal-radio-row">
					<label><input id="allOriginalMusic" wrote="all" onclick="clickedSmpRadio();" type="radio" class="smp-radio" name="youtubeMoneyWriterPercent" extra="youtubemoneypercent" value="100"> You are the <strong>only songwriter</strong> on the original songs on this release (not including cover songs)</label>
					<label><input id="coverSongRadioButton" wrote="none" onclick="clickedSmpRadio();" type="radio" class="smp-radio" name="youtubeMoneyWriterPercent" extra="youtubemoneypercent" value="0"> You <strong>co-wrote</strong> this <span class="smp-modal-release-type">[single/album]</span> or it only contains <strong>cover songs</strong></label>
				</div>
			</div>
		`,
		onOpen() {
			smpReplaceAlbumSingleText();
			smpConfirmClick();
		},
		reverseButtons: true,
		showCloseButton: true,
		showCancelButton: true,
		focusConfirm: false,
		allowOutsideClick: false,
		allowEscapeKey: false,
		allowEnterKey: false,
		confirmButtonText: 'Continue',
		confirmButtonAriaLabel: 'Continue',
		cancelButtonText: 'Cancel',
		cancelButtonAriaLabel: 'Cancel',
		customClass: {
			popup: 'smp-modal',
			title: 'smp-sa-title',
			content: 'smp-sa-text-content',
			confirmButton: 'smp-sa-continue-button',
			cancelButton: 'smp-sa-cancel-button'
		},
		width: '800px'
	} ).then( function( isConfirm ){
		if( isConfirm.value ){
			// Sync both checkboxes for spotlight SMP experiment
			$('#socialmediapack, #socialmediapack_alternate').prop('checked', true);
		} else {
			$('#socialmediapack, #socialmediapack_alternate').prop('checked', false);
			// Clear the stored selection if user cancels
			$('#upload-form-page-data').removeData('smpRadioSelection');
			extrasCheck();
		}
	} );
}

function smpReplaceAlbumSingleText() {
	var trackCount = howManyTracks();
	var releaseType = trackCount === 1 ? 'single' : 'album';

	$('.smp-modal-release-type').html(releaseType);
}

function smpConfirmClick() {
	var isChecked = $('#smp-confirm-chk').is(':checked');
	var radioSelected = $('.smp-radio:checked').length > 0;

	if (isChecked && radioSelected) {
		$('.smp-sa-continue-button').removeAttr('disabled');
	} else {
		$('.smp-sa-continue-button').prop('disabled', 'disabled');
	}
}

function clickedSmpRadio() {
	smpConfirmClick();
	var selectedRadio = $('.smp-radio:checked');
	if (selectedRadio.length > 0) {
		// Store the selected radio button in the page data div
		$('#upload-form-page-data').data('smpRadioSelection', {
			wrote: selectedRadio.attr('wrote'),
			value: selectedRadio.val(),
			id: selectedRadio.attr('id')
		});
	}
}

function isStoreSelected(storeId) {
	return $(`.distroStore[value="${storeId}"]`).is(":checked");
}

function isAppleStoreSelected() {
	return isStoreSelected("applemusic") || isStoreSelected("itunes");
}


/**
 * returns true if the selected option of Primary Genre or Secondary Genre has a genre data attribute
 * with the @genre value. We consult the data attribute because the label text could be translated to
 * other languages which modifies the text.
 *
 * TODO: move this to upload-form.js after merging DC-27352
 *
 * @param genre
 * @param primaryOnly
 */
function isGenreSelected(genre, primaryOnly) {

	var genre1 = $("#genrePrimary option:selected").data("genre") || "";

	if (genre1.equalsIgnoreCase(genre))
		return true;

	if (primaryOnly)
		return false;

	var genre2 = $("#genreSecondary option:selected").data("genre") || "";

	return genre2.equalsIgnoreCase(genre);
}

function getEmojiWarningText() {
	var emojiWarningText = "We like emoji too, but not all streaming platforms allow them. You'll need to remove them to upload your release.";
	if (isAppleStoreSelected()) {
		emojiWarningText = "We like emoji too, but Apple Music does not allow them, per the Apple Music Style Guide. You'll need to remove them to upload your release.";
	}
	return emojiWarningText;
}

function isIdCheckRequired(store) {
	switch (store) {
		case 'apple':
			return $j('.distroStore[value="itunes"]').is(':checked') || $j('.distroStore[value="applemusic"]').is(':checked');
		case 'spotify':
			return $j('.distroStore[value="spotify"]').is(':checked');
		case 'google':
			return $j('.distroStore[value="google"]').is(':checked');
		case 'instagramProfile':
		case 'facebookProfile':
			return $j('.distroStore[value="facebook"]').is(':checked');
	}
}

function toggleArtistMappingTr() {
	// DC-9530 only show if Apple/iTunes or Spotify Sevices are selected
	var bandname = getLowerBandname();
	var compoundArray = compoundDetector(bandname);
	var isCompound = compoundArray.length > 0;
	var isBand = $j('input:radio[name=compoundBandName][value="band"]').prop("checked");
	var isColaboration = $j('input:radio[name=compoundBandName][value="collaboration"]').prop("checked");
	var featCount =  $j('.featInput:visible').length;
	if ((isColaboration || featCount > 0) && (isIdCheckRequired('apple') || isIdCheckRequired('spotify') || isIdCheckRequired('google'))) {
		$j('.artistMappingTr').show();
	} else {
		$j('.artistMappingTr').hide();
	}
	var bandname = getLowerBandname();
	if (bandname) {
		toggleArtistIdContainers();
	}
	if (isCompound && !isBand) {
		$j('#appleArtistIdContainer').hide();
		$j('#spotifyArtistIdContainer').hide();
		$j('#googleArtistIdContainer').hide();
		$j('#instagramProfileArtistIdContainer').hide();
		$j('#facebookProfileArtistIdContainer').hide();
	}
}

function toggleArtistIdContainers() {
	var artistName = $j('#artistName').val().trim();

	if (artistName && isIdCheckRequired('apple')) {
		$j('#appleArtistIdContainer').show();
		$j('.artist-mapping-section-apple').show();
	}
	else {
		// $j('#artistName').removeAttr('appleArtistId');
		$j('#appleArtistIdContainer').hide();
		$j('.artist-mapping-section-apple').hide();
	}

	if (artistName && isIdCheckRequired('spotify')) {
		$j('#spotifyArtistIdContainer').show();
		$j('.artist-mapping-section-spotify').show();
	}
	else {
		// $j('#artistName').removeAttr('spotifyArtistId');
		$j('#spotifyArtistIdContainer').hide();
		$j('.artist-mapping-section-spotify').hide();
	}

	if (artistName && isIdCheckRequired('google')) {
		$j('#googleArtistIdContainer').show();
		$j('.artist-mapping-section-google').show();
	}
	else {
		// $j('#artistName').removeAttr('googleArtistId');
		$j('#googleArtistIdContainer').hide();
		$j('.artist-mapping-section-google').hide();
	}

	if (artistName && isIdCheckRequired('instagramProfile')) {
		$j('#instagramProfileArtistIdContainer').show();
		// $j('.artist-mapping-section-instagramProfile').show();
	}
	else {
		// $j('#artistName').removeAttr('instagramProfileArtistId');
		$j('#instagramProfileArtistIdContainer').hide();
		// $j('.artist-mapping-section-instagramProfile').hide();
	}

	if (artistName && isIdCheckRequired('facebookProfile')) {
		$j('#facebookProfileArtistIdContainer').show();
		// $j('.artist-mapping-section-facebookProfile').show();
	}
	else {
		// $j('#artistName').removeAttr('facebookProfileArtistId');
		$j('#facebookProfileArtistIdContainer').hide();
		// $j('.artist-mapping-section-facebookProfile').hide();
	}
}

function triggerArtistIdContainers() {
	if (isIdCheckRequired('apple')) {
		$j('#artistName').attr('oldvalue',''); // just empty old value to trigger validation in keyup
		$j('#artistName').keyup(); // activates artistid detection
		updateArtistBioVisibility(false);
		bandNameVerifyArtist();
	}

	if (isIdCheckRequired('spotify') || isIdCheckRequired('google') || isIdCheckRequired('instagramProfile') || isIdCheckRequired('facebookProfile')) {
		$j('#artistName').attr('oldvalue',''); // just empty value to trigger validation in keyup
		$j('#artistName').keyup(); // activates artistid detection
	}
}

function distroAlbumPayloadInit() {

	if (typeof distroAlbumPayload === 'undefined') { // initialize distroAlbumPayload
		distroAlbumPayload = {
			songs: [],
		};
	}
	distroAlbumPayload.stores = [];

	// save id this user is going to be offered Mixea mastering service
	// for cases when a random x% of artists offered the services
	distroAlbumPayload.doMixeaALaCarte = ($j('#doMixeaALaCarte').val() == 'true');
	distroAlbumPayload.hasSongsMasteredWithMixea = ($j('#hasSongsMasteredWithMixea').val() == 'true');

	distroAlbumPayload.ismobileupload = $("body").hasClass("webview");

	distroAlbumPayload.releaseDate = getReleaseDate();

	if ($j('.releaseHour:visible').length != 0)
		{
		distroAlbumPayload.releaseTime = padString($j('.releaseHour:visible').val(),2) + ':' + padString($j('.releaseMinute:visible').val(),2) + ' ' + $j('.releasePm:visible').val();
		}

	if ((typeof distroAlbumPayload.releaseDate != 'undefined') && (typeof distroAlbumPayload.releaseTime != 'undefined'))
		{
		distroAlbumPayload.releaseDate = distroAlbumPayload.releaseDate + ' ' + distroAlbumPayload.releaseTime;
		}

	if ( $j('#preOrderDateTR').is(':visible') )	{
		distroAlbumPayload.preorderDate = $j('#pre-order-date-dp').val();
	}

	if ($j('#synchronizedYes:visible').is(':checked'))
		{
		distroAlbumPayload.synchronizedReleaseDate = 1;
		}
	else
		{
		distroAlbumPayload.synchronizedReleaseDate = 0;
		}

	distroAlbumPayload.recordlabel = $j('#sessionid').val();

	var bandnameOriginal = $j('#artistName').val().trim();
	var bandname = getLowerBandname(bandnameOriginal);
	var bandnameMD5 = customMD5(bandname);
	var verifyStatus = getVerifiedBandnames(bandnameMD5).status;
	distroAlbumPayload.appleArtistIDVerified = (verifyStatus && (verifyStatus == 'ok' || verifyStatus == 'fail')) ? verifyStatus : '';
	distroAlbumPayload.appleArtistID   = getAppleIdFromForm();
	distroAlbumPayload.spotifyArtistID = getSpotifyIdFromForm();
	distroAlbumPayload.googleArtistID = getGoogleIdFromForm();
	distroAlbumPayload.instagramProfileArtistID = getInstagramProfileIdFromForm();
	distroAlbumPayload.facebookProfileArtistID = getFacebookProfileIdFromForm();
	distroAlbumPayload.hometown = getInputValue("#hometown");
	distroAlbumPayload.yearFormed = getInputValue("#date-formed");

	// begin: compound artist is collaboration? or band name?
	var compoundType = $j('input[type="radio"][name="compoundBandName"]:checked').val();
	if (compoundType != 'undefined')
		{
		distroAlbumPayload.bandnameCompoundType = compoundType;
		}
	// end: compound artist is collaboration? or band name?
	console.log("PAYLOAD CHECK", $j('#recordLabel').val());
	distroAlbumPayload.artworkOriginalFilename = $j('#artwork_originalFilename').val();
	distroAlbumPayload.artworkDominantColor = $j('#artworkDominantColor').val();
	distroAlbumPayload.artworkCropCoordinates = $j('#artworkCropCoordinates').val();
	distroAlbumPayload.recordlabel = $j('#recordLabel').val();
	distroAlbumPayload.bandname = bandnameOriginal;
	distroAlbumPayload.language = $j('#language').val();
	distroAlbumPayload.genre1 = $j('#genrePrimary').val();
	distroAlbumPayload.genre2 = $j('#genreSecondary').val();
	distroAlbumPayload.subgenre1 = $j('#subGenrePrimary').val();
	distroAlbumPayload.subgenre2 = $j('#subGenreSecondary').val();
	distroAlbumPayload.albumtitle = $j('#albumTitleInput').val();
	distroAlbumPayload.upc = $j('#customUpc').val();
	distroAlbumPayload.albumuuid = $j('#albumuuid').val();
	distroAlbumPayload.masterList = getMasterList(); // artist mapping stuff
	distroAlbumPayloadSetExtras();

	distroAlbumPayload.previouslyReleased = $j('.distroPreviouslyReleased:checked').val()*1;
	distroAlbumPayload.songwritersRealNames = createSongwriterRealNameStruct();
	distroAlbumPayload.performerNames = createPerformerNameRolesStruct();
	distroAlbumPayload.producerNames = createProducerNameRolesStruct();

	if( $j( '#youTubeChannelURL' ).length ){
		distroAlbumPayload.youTubeChannelURL = $j( '#youTubeChannelURL' ).val();
		distroAlbumPayload.youTubeChannelName = $j( '#youTubeChannelName' ).val();
		distroAlbumPayload.youTubeChannelId = $j( '#youTubeChannelId' ).val();
		distroAlbumPayload.youTubeAccessToken = $j( '#youTubeAccessToken' ).val();
	}

	if ($j('#checkboxPreserveNonStandardCaps:visible:checked').length > 0) // captool
		{
		distroAlbumPayload.preserveNonstandardCaps = 1;
		}
	else
		{
		distroAlbumPayload.preserveNonstandardCaps = 0;
		}

	if (distroAlbumPayload.price = $j('#priceAlbum').filter(':visible').val())
		{
		distroAlbumPayload.price = $j('#priceAlbum').filter(':visible').val();
		}

	var storeCount = 0;
	$j('.distroStore:checked').each(function()
		{
		distroAlbumPayload.stores[storeCount] = $j(this).val();
		storeCount++;
		})
	}

function distroAlbumPayloadSetExtras() {
	distroAlbumPayload.youtubeMoneyPercentOwned = calculateYouTubeMoneyPercentOwned();
	if (distroAlbumPayload.youtubeMoneyPercentOwned < 0) {
		distroAlbumPayload.youtubeMoneyPercentOwnedNegative = distroAlbumPayload.youtubeMoneyPercentOwned;
		distroAlbumPayload.youtubeMoneyPercentOwned = 0;
	}
	extrasCheck();
	distroAlbumPayload.extrasStruct = extras;
	distroAlbumPayload.extrasAmount = $j('#extrasAmount').text(); // total extras amount (old, don't really use this amuanyore)
	distroAlbumPayload.extrasAmountYearly = $j('#extrasAmountYearly').val(); // yearly recurring fee
	distroAlbumPayload.extrasAmountOneTime = $j('#extrasAmountOneTime').val(); // one-time fee
	distroAlbumPayload.extrasAmountOneTimePurchasesUnrelatedToRelease = $j('#extrasAmountOneTimePurchasesUnrelatedToRelease').val(); // one-time purchses like nail clippers, that have nothing really to do with this release

	// begin: extras
	distroAlbumPayload.extras = [];
	var extraIdsExcludedFromTotal = [
		"socialmediapack_alternate", // if SMP appears twice on the upload form, do not factor the second one into total price calculations
	];
	$j('.extras').filter(':checked').each(function() {
		if (!extraIdsExcludedFromTotal.includes($(this).attr('id'))) {
			distroAlbumPayload.extras.push($j(this).val());
		}
	})
	// end: extras

	if (!distroAlbumPayload.stores.includes('shazam') && $j('.distroStore[value=shazam]').is(':checked')) {
		distroAlbumPayload.stores.push('shazam');
	}

	if (!distroAlbumPayload.stores.includes('audiomack') && $j('.distroStore[value=audiomack]').is(':checked')) {
		distroAlbumPayload.stores.push('audiomack');
	}

}

function arrayOfSongTitles()
	{
	return $j("input.uploadFileTitle").filter(':visible').map(function(){return $j(this).val();}).get();
	}

function clickedExplicit(trackNum)
	{
	var isExplicit = $j('.distroExplicit[track="' + trackNum + '"]:checked').val()*1
	if (isExplicit == 1)
		{
		$j('.cleanedTr[track="' + trackNum + '"]').hide();
		}
	else
		{
		$j('.cleanedTr[track="' + trackNum + '"]').show();
		}
	}

function newFeatForm(tracknum, songid, featRole, featName)
	{
	console.debug('newFeatForm - do it');
	if (typeof songid === 'undefined'){
		songid = 0;
	}
	var template = $j('#newFeaturedArtistForm').html();
	var maxArtistNum = $j('.newFeatFormTemplate[tracknum="' + tracknum + '"]').attr("maxArtistNum");
	var artistNum = maxArtistNum ? maxArtistNum * 1 + 1 : 1;
	$j('.newFeatFormTemplate[tracknum="' + tracknum + '"]').attr("maxArtistNum", artistNum);
	template = template.replace(/\[x]/gi, tracknum);
	template = template.replace(/\[artistNum]/gi, artistNum);
	template = template.replace(/\[songid]/gi, songid);

	var $featFormContainer = $j('.newFeatFormTemplate[tracknum="' + tracknum + '"]:last');
	$featFormContainer.append(template);
	if (albumOrSingle() == "single") {
		$featFormContainer.find(".no-singles").remove();
	}
	if (featRole){
		$featFormContainer.find("select.featRole:last").val(featRole);
	}
	if (String(featName).length > 0){
		$featFormContainer.find(".featInput:last").val(featName);
	}

	// show close button (except first row...)
	$j('.featFormClose[tracknum="' + tracknum + '"]').slice(0,2).hide(); // hide first two "close" buttons (mobile & desktop)
	}

function changedFeat(track, songid)	{
	var hasFeat = parseInt($j('.distroFeat[tracknum="' + track + '"]:checked').val());
	if (hasFeat == 1)		{
		// reeable featured fields
		$j('.featRole[tracknum="' + track + '"]').each(function(){
			$j(this).prop('disabled', false);
		});

		$j('.featInput[tracknum="' + track + '"]').each(function(){
			$j(this).prop('disabled', false);
		});

		$j('.newFeatForm[tracknum="' + track + '"]').show();
	} else {
		$j('.newFeatForm[tracknum="' + track + '"]').hide();

		// disable featured fields so they do not submit
		$j('.featRole[tracknum="' + track + '"]').each(function(){
			$j(this).prop('disabled', true);
		});

		$j('.featInput[tracknum="' + track + '"]').each(function(){
			$j(this).prop('disabled', true);
		});
	}

	// begin: add a form, if there isn't one yet
	if ($j('.featInput[tracknum="' + track + '"]').length == 0){
		if (typeof songid === 'undefined')
			songid = 0;
		newFeatForm(track, songid);
	}
	// end: add a form, if there isn't one yet

	doSongPreviews();
}


function getTrackVersionInfo(track) {
	var radioVal = $j('.distroVersion[tracknum="' + track + '"]:checked').val();

	if (radioVal == "Remix")
		return $j(".versionTextRemix" + track + " input").val();
	if (radioVal == "Other...")
		return $j(".versionTextOther" + track + " input").val();

	return radioVal;
}


function changedVersionInfo(track) {
	var radioVal = $j('.distroVersion[tracknum="' + track + '"]:checked').val();
	console.debug('track: ' + track + ' = ' + radioVal);

	$j('.versionText' + track).hide();
	$j('.versionInput' + track + 'Other').prop('disabled', true);
	$j('.versionInput' + track + 'Remix').prop('disabled', true);

	if (radioVal == 'Other...')
		{
		$j('.versionInput' + track + 'Other').prop('disabled', false);
		$j('.versionTextOther' + track).show();
		}
	else if (radioVal == 'Remix')
		{
		$j('.versionInput' + track + 'Remix').prop('disabled', false);
		$j('.versionTextRemix' + track).show();
		}

	doSongPreviews();

	setTimeout(function()
		{
		doSongPreviews();
		},10)
	}

function uploadFile() {
    var xhr = GetXmlHttpObject();
    var xhrDolby = GetXmlHttpObject();
    // var file = $j('.file').get(distroUploadFileNum);

		// set up default file delivery
		var fd = new FormData();
		var nowTime = (new Date).getTime();
		var fileInput = $j('.distroFile').filter(':visible').eq(distroUploadFileNum)[0];
	    var file = fileInput.files[0];
		var fileSize = file.size ? file.size : 0;
		var prefix = me.id + '--' + albumuuid + '--' + distroUploadFileNum + '--' + fileSize + '--';
		var key = prefix + removeNonAlphaCharacters(file.name);

		if (distroUploadFileNum == 0) {
			// set up artist profile file delivery
			var hasArtistProfile = $('.artist-bio-item:visible');
			var fdArtistProfile = new FormData();
			var artistProfileInput = hasArtistProfile ? $('#artistImageInput')[0] : '';
			var fileArtistProfile = artistProfileInput ? artistProfileInput.files[0] : '';
			var fileArtistProfileSize = fileArtistProfile ? fileArtistProfile.size : 0;
			var prefixArtistProfile = me.id + '--' + albumuuid + '--' + 'artistProfile' + '--' + fileArtistProfileSize + '--';
			var keyArtistProfile = fileArtistProfile ? prefixArtistProfile + removeNonAlphaCharacters(fileArtistProfile.name) : '';
		}

		// set up dolby file delivery
		var currentTrack = $j(fileInput).attr('tracknum');
		var fdDolby = new FormData();
		var dolbyAtmosInput = currentTrack ? $j('.dolbyAtmosInput[tracknum="' + currentTrack + '"]').filter(':visible')[0] : '';
	    var fileDolby = dolbyAtmosInput ? dolbyAtmosInput.files[0] : '';
		var fileDolbySize = fileDolby.size ? fileDolby.size : 0;
		var prefixDolby = me.id + '--' + albumuuid + '--' + distroUploadFileNum + '--' + fileDolbySize + '--';
		var keyDolby = fileDolby ? prefixDolby + 'dolby_' + removeNonAlphaCharacters(fileDolby.name) : '';

		// we will cache here files which were uploaded successfully to s3.
		// so we wouldn't reupload them again on each retry.
		// we use modified time and filesize to not mess with changed files with the same name.
		if (!window.uploadedFiles) {
			window.uploadedFiles = [];
		}

		distroAlbumPayloadInit();

		if (distroUploadFileNum == 0) { // artwork is always the first file
			distroAlbumPayload.artwork = key;
			if (keyArtistProfile) {
				distroAlbumPayload.artistImage = keyArtistProfile;
				distroAlbumPayload.artistHometown = $('#hometown').val();
				distroAlbumPayload.artistYearFormed = $('#date-formed').val();
			}
		} else { // songs
			var dspFormattedStrings = trackLevelRolesToPayload(distroUploadFileNum);
			var dspTrackVersionFormattedStrings = trackLevelVersionsToPayload(distroUploadFileNum);

			distroAlbumPayload.songs[distroUploadFileNum-1] = {}
			distroAlbumPayload.songs[distroUploadFileNum-1].filename = key;
			distroAlbumPayload.songs[distroUploadFileNum-1].filenameDolby = keyDolby;
			distroAlbumPayload.songs[distroUploadFileNum-1].title = $j('.uploadFileTitle').filter(':visible').eq(distroUploadFileNum-1).val();
			distroAlbumPayload.songs[distroUploadFileNum-1].composer = $j('.uploadFileComposer').filter(':visible').eq(distroUploadFileNum-1).val();
			distroAlbumPayload.songs[distroUploadFileNum-1].explicit = $j('.distroExplicit:checked').eq(distroUploadFileNum-1).val();
			distroAlbumPayload.songs[distroUploadFileNum-1].instrumental = $j('.distroInstrumental:checked').eq(distroUploadFileNum-1).val();
			distroAlbumPayload.songs[distroUploadFileNum-1].isrc = $j('.isrc').eq(distroUploadFileNum-1).val();

			distroAlbumPayload.songs[distroUploadFileNum-1].originalArtist = $j('.originalArtist').eq(distroUploadFileNum-1).val();
			distroAlbumPayload.songs[distroUploadFileNum-1].originalSongTitle = $j('.originalSongTitle').eq(distroUploadFileNum-1).val();
			distroAlbumPayload.songs[distroUploadFileNum-1].originalSongwriters = $j('.originalSongwriters').eq(distroUploadFileNum-1).val();
			distroAlbumPayload.songs[distroUploadFileNum-1].dspFormattedRoles = dspFormattedStrings.roles;
			distroAlbumPayload.songs[distroUploadFileNum-1].dspFormattedNames = dspFormattedStrings.names;
			distroAlbumPayload.songs[distroUploadFileNum-1].dspFormattedStoreIds = dspFormattedStrings.storeIds;

			distroAlbumPayload.songs[distroUploadFileNum-1].dspFormattedVersions = dspTrackVersionFormattedStrings.versions;

			// begin: is this a cleaned version of an explicit song?
			if ($j('.distroCleaned:checked').eq(distroUploadFileNum-1).is(':visible')) {
				distroAlbumPayload.songs[distroUploadFileNum-1].cleaned = $j('.distroCleaned:checked').eq(distroUploadFileNum-1).val();
			} else {
				distroAlbumPayload.songs[distroUploadFileNum-1].cleaned = 0;
			}
			// end: is this a cleaned version of an explicit song?

			if ($j('.uploadFilePrice').eq(distroUploadFileNum-1).val()) {
				distroAlbumPayload.songs[distroUploadFileNum-1].price = $j('.uploadFilePrice').eq(distroUploadFileNum-1).val();
			}

			if ($j('.masteringHouseEmailAddressInput_' + distroUploadFileNum + ':visible').val()) {
				distroAlbumPayload.songs[distroUploadFileNum-1].mfit = $j('.masteringHouseEmailAddressInput_' + distroUploadFileNum).val().trim();
			}

			distroAlbumPayload.songs[distroUploadFileNum-1].previewStartSeconds = 0;
			if ($j('.previewStartContainer_' + distroUploadFileNum).is(':visible')) {
				// we add 1 seccond to define non default value, cuz default value in table 0 but in different stores it's not 0 (45 for itunes)
				distroAlbumPayload.songs[distroUploadFileNum-1].previewStartSeconds = 1 + parseInt($j('.previewStartMinutes_' + distroUploadFileNum).val()) * 60 + parseInt($j('.previewStartSeconds_' + distroUploadFileNum).val());
			}
		}

		if (typeof $j('.distroDoneButtonWithAPI').first().attr('albumuuid') != 'undefined') { // used in replacing artwork for borked artwork. /distro/album/
			distroAlbumPayload.albumuuid = $j('.distroDoneButtonWithAPI').first().attr('albumuuid');
		}

		var fileErrorMessage = distroUploadFileNum == 0 ? 'Album cover file' : 'Audio file for Track ' + distroUploadFileNum;

	    fd.append('key', key);
	    fd.append('acl', 'authenticated-read');
	    fd.append('Content-Type', file.type);
	    fd.append('AWSAccessKeyId', distroJavascriptVars.accessKeyId); // saved in s3s[...].cfm
	    fd.append('policy', distroJavascriptVars.PolicyBase64);
		fd.append('signature', distroJavascriptVars.signature);
		fd.append('x-amz-meta-user-id', me.id);
	    fd.append("file", file);

		xhr.upload.addEventListener("progress", uploadProgress, false);
	    xhr.addEventListener("error", uploadFailed, false);
	    xhr.addEventListener("abort", uploadCanceled, false);

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if ((xhr.status != 200) && (xhr.status != 204)) {
					var tryRetry = false;
					if ($j(xhr.responseXML).find('Message').length > 0) {
						var errorText = $j(xhr.responseXML).find('Message').text();
						if (errorText.includes('than the minimum allowed size')) {
							errorText = 'There was an issue with ' + fileErrorMessage + ', please re-select the same file and try again.'
							tryRetry = true;
						}
						alert(errorText);
					}
					if (tryRetry) {
						resetUploadDoneButton();
					} else {
						uploadFailed();
					}
					logErrorXhr(key, xhr, file);
				}
				else {
					window.uploadedFiles.push(key);
					distroAlbumPayloadSetExtras(); // DC-3770 We need it for cases when user click extras while files uploading to S3
					uploadComplete();
				}
			}
		};

		if (distroUploadFileNum == 0) {

			if (keyArtistProfile) {

				var xhrArtistProfile = GetXmlHttpObject();
				fdArtistProfile.append('key', keyArtistProfile);
				fdArtistProfile.append('acl', 'authenticated-read');
				fdArtistProfile.append('Content-Type', fileArtistProfile.type);
				fdArtistProfile.append('AWSAccessKeyId', distroJavascriptVars.accessKeyId); // saved in s3s[...].cfm
				fdArtistProfile.append('policy', distroJavascriptVars.PolicyBase64);
				fdArtistProfile.append('signature', distroJavascriptVars.signature);
				fdArtistProfile.append('x-amz-meta-user-id', me.id);
				fdArtistProfile.append("file", fileArtistProfile);

				xhrArtistProfile.upload.addEventListener("progress", uploadProgress, false);
				xhrArtistProfile.addEventListener("error", uploadFailed, false);
				xhrArtistProfile.addEventListener("abort", uploadCanceled, false);

				xhrArtistProfile.onreadystatechange = function() {
					if (xhrArtistProfile.readyState == 4) {
						if ((xhrArtistProfile.status != 200) && (xhrArtistProfile.status != 204)) {
							var tryRetry = false;
							if ($j(xhrArtistProfile.responseXML).find('Message').length > 0) {
								var errorText = $j(xhrArtistProfile.responseXML).find('Message').text();
								if (errorText.includes('than the minimum allowed size')) {
									errorText = 'There was an issue with the artist profile image, please re-select the same file and try again.'
									tryRetry = true;
								}
								alert(errorText);
							}
							if (tryRetry) {
								resetUploadDoneButton();
							} else {
								uploadFailed();
							}
							logErrorXhr(keyArtistProfile, xhrArtistProfile, fileArtistProfile);
						}
						else {
							window.uploadedFiles.push(keyArtistProfile);
							xhr.open('POST', '//s3.amazonaws.com/' + distroJavascriptVars.BucketName + '/', true); //MUST BE LAST LINE BEFORE YOU SEND
							xhr.send(fd);
						}
					}
				};

				if (window.uploadedFiles.indexOf(keyArtistProfile) > -1) {
					if (window.uploadedFiles.indexOf(key) > -1) {
						distroAlbumPayloadSetExtras(); // DC-3770 We need it for cases when user click extras while files uploading to S3
						uploadComplete();
					} else {
						xhr.open('POST', '//s3.amazonaws.com/' + distroJavascriptVars.BucketName + '/', true); //MUST BE LAST LINE BEFORE YOU SEND
						xhr.send(fd);
					}
				} else {
					xhrArtistProfile.open('POST', '//s3.amazonaws.com/' + distroJavascriptVars.BucketName + '/', true); //MUST BE LAST LINE BEFORE YOU SEND
					xhrArtistProfile.send(fdArtistProfile);
				}
			} else {
				if (window.uploadedFiles.indexOf(key) > -1) {
					distroAlbumPayloadSetExtras(); // DC-3770 We need it for cases when user click extras while files uploading to S3
					uploadComplete();
				} else {
					xhr.open('POST', '//s3.amazonaws.com/' + distroJavascriptVars.BucketName + '/', true); //MUST BE LAST LINE BEFORE YOU SEND
					xhr.send(fd);
				}
			}
		}
		else if (keyDolby) {
			fdDolby.append('key', keyDolby);
			fdDolby.append('acl', 'authenticated-read');
			fdDolby.append('Content-Type', fileDolby.type);
			fdDolby.append('AWSAccessKeyId', distroJavascriptVars.accessKeyId); // saved in s3s[...].cfm
			fdDolby.append('policy', distroJavascriptVars.PolicyBase64);
			fdDolby.append('signature', distroJavascriptVars.signature);
			fdDolby.append('x-amz-meta-user-id', me.id);
			fdDolby.append("file", fileDolby);

			xhrDolby.upload.addEventListener("progress", uploadProgress, false);
			xhrDolby.addEventListener("error", uploadFailed, false);
			xhrDolby.addEventListener("abort", uploadCanceled, false);

			xhrDolby.onreadystatechange = function() {
				if (xhrDolby.readyState == 4) {
					if ((xhrDolby.status != 200) && (xhrDolby.status != 204)) {
						var tryRetry = false;
						if ($j(xhrDolby.responseXML).find('Message').length > 0) {
							var errorText = $j(xhrDolby.responseXML).find('Message').text();
							if (errorText.includes('than the minimum allowed size')) {
								errorText = 'There was an issue with Dolby Atmos ' + fileErrorMessage + ', please re-select the same file and try again.'
								tryRetry = true;
							}
							alert(errorText);
						}
						if (tryRetry) {
							resetUploadDoneButton();
						} else {
							uploadFailed();
						}
						logErrorXhr(keyDolby, xhrDolby, fileDolby);
					}
					else {
						window.uploadedFiles.push(keyDolby);
						xhr.open('POST', '//s3.amazonaws.com/' + distroJavascriptVars.BucketName + '/', true); //MUST BE LAST LINE BEFORE YOU SEND
						xhr.send(fd);
					}
				}
			};

			if (window.uploadedFiles.indexOf(keyDolby) > -1) {
				if (window.uploadedFiles.indexOf(key) > -1) {
					distroAlbumPayloadSetExtras(); // DC-3770 We need it for cases when user click extras while files uploading to S3
					uploadComplete();
				} else {
					xhr.open('POST', '//s3.amazonaws.com/' + distroJavascriptVars.BucketName + '/', true); //MUST BE LAST LINE BEFORE YOU SEND
					xhr.send(fd);
				}
			} else {
				xhrDolby.open('POST', '//s3.amazonaws.com/' + distroJavascriptVars.BucketName + '/', true); //MUST BE LAST LINE BEFORE YOU SEND
				xhrDolby.send(fdDolby);
			}
		} else {
			if (window.uploadedFiles.indexOf(key) > -1) {
				distroAlbumPayloadSetExtras(); // DC-3770 We need it for cases when user click extras while files uploading to S3
				uploadComplete();
			} else {
				xhr.open('POST', '//s3.amazonaws.com/' + distroJavascriptVars.BucketName + '/', true); //MUST BE LAST LINE BEFORE YOU SEND
				xhr.send(fd);
			}
		}
}

function logErrorXhr(key, xhr, file) {
	logError("upload failed", {
		"filename"     : key              || null,
		"readyState"   : xhr.readyState   || null,
		"response"     : xhr.response     || null,
		"responseText" : xhr.responseText || null,
		"responseType" : xhr.responseType || null,
		"responseURL"  : xhr.responseURL  || null,
		"responseXML"  : xhr.responseXML  || null,
		"status"       : xhr.status       || null,
		"statusText"   : xhr.statusText   || null,
		"status"       : xhr.status       || null,
		"timeout"      : xhr.timeout      || null,
		"filesize"     : file.size        || null,
		"filetype"     : file.type        || null
	});
}

function uploadProgress(evt) {
    if (evt.lengthComputable) {
		var percentComplete = (evt.loaded * 100 / evt.total).toFixed(2);
		var distroBytesLoaded = evt.loaded;
		var distroBytesTotal = evt.total;
		$j('.distroProgressBarLabelRight').eq(distroUploadFileNum).text(percentComplete.toString() + '%');
		$j(".distroProgressBar").eq(distroUploadFileNum).progressbar({ max: distroBytesTotal });
		$j(".distroProgressBar").eq(distroUploadFileNum).progressbar({ value: distroBytesLoaded });
		// $j(".distroProgressBar .ui-progressbar-value").eq(distroUploadFileNum).animate({width: percentComplete+'%'}, 40);
		// $j("#progressbar .ui-progressbar-value").animate({width: '80%'}, 'fast')
    } else {
      	$j('.progressNumber').eq(distroUploadFileNum).html('unable to compute');
    }
}

function uploadComplete(evt) {
    /* This event is raised when the server send back a response */
    // alert("Done - " + evt.target.responseText );
    // console.debug('Done. Response:');
    // console.debug(evt.target);

    $j(document).trigger('distroFileUploadDone');
}

function disableUploadForm(disable) {
	var listOfSelectors = '#doneButton, .extras, .distroStore, .socialNumberExtra, .youtubeMoneySamples, .youtubeMoneyPercents, #checkboxtimes input';
	if (disable) {
		$j(listOfSelectors).prop('disabled', true).addClass('disabled');
	} else {
		$j(listOfSelectors).prop('disabled', false).removeClass('disabled');
	}
}


function uploadFailed(evt) {
	distroChangeProgressBar(distroUploadFileNum, 'Error', 'Error');
    console.debug(evt);
	$j('#doneButton').val($j('#doneButton').attr('original'));
	disableUploadForm(false);

	if (evt) {
		logError("upload error", {
			"isTrusted" : evt.isTrusted || null,
			"loaded"    : evt.loaded    || null,
			"message"   : evt.message   || null,
			"target"    : evt.target    || null,
			"timeStamp" : evt.timeStamp || null,
			"total"     : evt.total     || null,
			"type"      : evt.type      || null
		});
	}
}

function uploadCanceled(evt) {
    alert("The upload has been canceled by the user or the browser dropped the connection.");
}

function trackLevelRolesToPayload(distroUploadFileNum) {
	var myFeat = getFeat(distroUploadFileNum);
	var masterList = getMasterList();

	var returnStruct = {};
	returnStruct['names'] = myFeat.artistsAndCorrespondingRoles.artists.join(';');
	returnStruct['roles'] = myFeat.artistsAndCorrespondingRoles.roles.join(';');
	returnStruct['storeIds'] = [];

	$j(myFeat.artistsUnique).each(function(index, value) {
		var idStruct = {};
		idStruct['name'] = value;
		idStruct['appleURI'] = masterList['artistIds'][value]['appleURI'];
		idStruct['spotifyURI'] = masterList['artistIds'][value]['spotifyURI'];
		idStruct['googleURI'] = masterList['artistIds'][value]['googleURI'];
		// TODO instagramProfile, facebookProfile here when we add Searchy thing
		returnStruct['storeIds'].push(idStruct);
	});

	return returnStruct
}

function trackLevelVersionsToPayload( distroUploadFileNum ) {
	var versionsWithTextInputs = $j('.versionInput' + distroUploadFileNum + ':visible').length;
	var versionString = '';

	if (versionsWithTextInputs > 0) {
		versionString = $j('.versionInput' + distroUploadFileNum + ':visible').val();
	} else {
		versionString = $j('.distroVersion[tracknum="' + distroUploadFileNum + '"]:checked').val();
	}

	if (typeof versionString === 'undefined') {
		versionString = ''
	}

	var thisGetFeat = getFeat(distroUploadFileNum);
	var remixString = arrayToSentenceAmpersand(arrayRemoveDuplicates(thisGetFeat['sortedByRole']['Remixer'])).trim();
	if (remixString && versionString) {
		versionString = remixString + ' Remix ' + versionString;
	} else if (remixString && !versionString) {
		versionString = remixString + ' Remix';
	}

	var dspFormattedStrings = {versions:versionString};
	return dspFormattedStrings;
}

function resetUploadDoneButton() {
	$j('#doneButton').val('Try again');
	$j('#distroProgressBarContainer').stop().hide();
	disableUploadForm(false);
}

function distroChangeProgressBar(num, txt, status)
	{
	$j('.ui-progressbar-value').eq(num).hide()
	$j('.distroProgressBar').eq(num).addClass('distroProgressBar' + status)
	$j('.distroProgressBarLabelRight').eq(num).addClass('distroLabel' + status)
	$j('.distroProgressBarLabel').eq(num).addClass('distroLabel' + status)
	$j('.distroProgressBarLabelRight').eq(num).text(txt)
	}

$j(document).on('distroFileUploadDone',function()
	{

	distroChangeProgressBar(distroUploadFileNum, '100%', 'Done');
	console.debug('upload ' + distroUploadFileNum + ' done dude');

	if (distroUploadFileNum < $j('.distroFileInput.distroFile').filter(':visible').length-1)
		{
		distroUploadFileNum++
		uploadFile();
		}
	else
		{
		console.debug('distroAlbumPayload:');
		console.debug(distroAlbumPayload);
		$j('#doneButton').val('Please wait...');
		//return false;
		var mypost = $j.post($j($j('.distroDoneButtonWithAPI')[0]).attr('api'), {payload:JSON.stringify(distroAlbumPayload)}, function(response) // usually /api/distroAlbumSave/
			{
			console.debug('response:')
			console.debug(response)

			// upload form events - upload form submit
			var eventData = {
				eventName: 'upload form',
				action: 'submit',
				albumuuid: distroAlbumPayload.albumuuid
			};
			if (response.ERROR == 'true') {
				eventData.notes = 'fail';
			} else {
				eventData.notes = 'success';
			}
			$.post('/api/uploadFormEvents/',eventData);

			if (response.ERROR == 'true')
				{
				resetUploadDoneButton();
				sweetAlert('', response.MESSAGE, 'error');
				}
			else if (typeof response.forward != 'undefined')
				{
				console.debug('done!');
				firebaseEventTrigger( "upload_form_complete" );
				window.location = response.forward;
				}
			else
				{
				console.debug('done!');
				firebaseEventTrigger( "upload_form_complete" );
				var distroVidParams = boughtDistroVidExtra() ? '&distroVidExtra' : '';
				window.location = "/new/done/?albumuuid=" + distroAlbumPayload.albumuuid + distroVidParams;
				}
			},'json')
		mypost.error(function(jqXHR, textStatus, errorThrown)
			{
			// upload form events - upload form submit
			var eventData = {
				eventName: 'upload form',
				action: 'submit',
				albumuuid: distroAlbumPayload.albumuuid,
				notes: 'error'
			};
			$.post('/api/uploadFormEvents/',eventData);


			console.debug(errorThrown);
			$j.post('/api/apiErrorLog/',{"error":errorThrown,"currentUrl":document.URL},function(){})
			resetUploadDoneButton();
			sweetAlertHTML('', 'Sorry, there was an error and we didn\'t save your upload.<br><br>We know how much it sucks to wait for an upload to finish, only to get an error.<br><br>Try reloading this page and submitting your album again. That usually fixes it.<br><br>If the problem continues, visit <a href="https://distrokid.com/contact" target="_blank">www.distrokid.com/contact</a>.', 'error');
			// location.reload();
			firebaseEventTrigger( "upload_form_error" );
			})
		}
	})

function clickedDistroUploadButton(obj)
	{

	$j(".distroProgressBar").each( function(){
		$j( this ).progressbar( { value: 0.01 } );
		$j( this ).progressbar( { max: 100 } );
	} )

	$j('#distroProgressBarContainer').slideDown('fast');
	if (!$j('#distroProgressBarContainer').attr('originalProgressBarHTML'))
		{
		var originalProgressBarHTML = $j('#distroProgressBarContainer').html();
		$j('#distroProgressBarContainer').attr('originalProgressBarHTML',originalProgressBarHTML);
		console.debug('Grabbing original progress bars');
		}
	else
		{
		var originalProgressBarHTML = $j('#distroProgressBarContainer').attr('originalProgressBarHTML');
		$j('#distroProgressBarContainer').html(originalProgressBarHTML);
		console.debug('Replacing progress bars with original');
		}

	var mobileAlertDisplayEl = $j( '#mobileDisplayMessageContainer' );
	if( mobileAlertDisplayEl.length ){
		mobileAlertDisplayEl.show();
	}

	$j(obj).attr('original', $j(obj).val());
	$j(obj).val('Uploading...');
	disableUploadForm(true);

	// Smoothly scroll to the bottom on the mobile device
	if( $('body').hasClass('webview') ){
		scrollTo('#doneButton');
	}

	distroUploadFileNum=0;

	console.debug('Running uploadFile()');

	firebaseEventTrigger( "upload_form_uploading" );

	uploadFile();
	}

function updateAlbumPriceOptions() // price stuff
	{
	var numberOfTracks = $j('#howManySongsOnThisAlbum').val()*1;
	$j('#priceAlbum').find('option').each(function()
		{
		var hideIfTrackCountMoreThan = $j(this).attr('hideIfTrackCountMoreThan')*1;
		if (numberOfTracks > hideIfTrackCountMoreThan)
			{
			$j(this).hide();
			}
		else
			{
			$j(this).show();
			}

		if ($j('#priceAlbum option').filter(':selected').css('display') == 'none') // if the price we've selected is now invisible, select the next visible one
			{
			$j('#priceAlbum option').filter(function(){return $j(this).css('display') != 'none';}).eq(0).prop('selected',true)
			}
		});

	// begin: set the estimated price if user doesn't have access to customize prices
	var albumPriceDefeault = numberOfTracks*0.99;
	albumPriceDefeault = round(albumPriceDefeault,2).toFixed(2);
	if (albumPriceDefeault > 9.99)
		{
		albumPriceDefeault = 9.99;
		}
	$j('.albumPriceDefault').text(albumPriceDefeault);
	// end: set the estimated price if user doesn't have access to customize prices


	}

function changeAlbumType(albumType)
	{
	$j('#distroUpSell').hide();
	if (albumType == 'single')
		{
		$j('#albumPrice').hide('fast');
		// $j('#howManySongs').hide('fast');
		$j('#albumTitle').hide('fast', function(){});

		/*
		$j('#imasingle').prop('checked', true);
		if ($j('#howManySongsOnThisAlbum').val() == 1)
			{
			$j('#howManySongsOnThisAlbum').val(2);
			}
		*/

		createUploadForm(1);
		}
	else if (albumType == 'album')
		{
		$j('#albumPrice').fadeIn(70).fadeOut(70).fadeIn(70).fadeOut(70).fadeIn(70);
		$j('#albumTitle').fadeIn(70).fadeOut(70).fadeIn(70).fadeOut(70).fadeIn(70); // blink flash thing
		// $j('#howManySongs').fadeIn(70).fadeOut(70).fadeIn(70).fadeOut(70).fadeIn(70);
		$j('#imanalbum').prop('checked', true);
		createUploadForm($j('#howManySongsOnThisAlbum').val());
		}
	extrasCheck();
	genreChange();
	calculateDolby();
	calculateCoverSongLicensing();
	updateAlbumPriceOptions();
	}

function previouslyReleased()
	{
	var isPreviouslyReleased = $j('.distroPreviouslyReleased:checked').val()*1;
	if (isPreviouslyReleased == 1)
		{
		$j('.originalReleaseDateTr').show();
		$j('.originalReleaseDateTr').fadeIn(70).fadeOut(70).fadeIn(70).fadeOut(70).fadeIn(70); // blink thing
		$j('#releaseDate').hide();
		$j('.releaseTimeTr').hide();
		$j('.synchronizationTr').hide();
		$j('.preorderTr').hide();


		// reset values
		$('#release-date-dp').val($('#release-date-dp')[0].defaultValue);

		$('#releaseHour').val($('#releaseHour option').filter(function() {return this.defaultSelected;}).val());
		$('#releaseMinute').val($('#releaseMinute option').filter(function() {return this.defaultSelected;}).val());
		$('#releasePm').val($('#releasePm option').filter(function() {return this.defaultSelected;}).val());

		$('#pre-order-date-dp').val($('#pre-order-date-dp')[0].defaultValue);

		$('#synchronizedNo').prop('checked', $('#synchronizedNo')[0].defaultChecked);
		$('#synchronizedYes').prop('checked', $('#synchronizedYes')[0].defaultChecked);

		$('#iTunesPreorderNo').prop('checked', $('#iTunesPreorderNo')[0].defaultChecked);
		$('#iTunesPreorderYes').prop('checked', $('#iTunesPreorderYes')[0].defaultChecked);

		}
	else
		{
		$j('.originalReleaseDateTr').hide();
		$j('#releaseDate').show();
		}
	}

function extraCost(service)
	{
	console.debug('extraCost: ' + service);

	if ((service == 'shazam') || (typeof service === 'undefined'))
		{
		console.debug('shazam yo: ' + service);
		var cost = howManyTracks() * myAvailableExtrasJSON['shazam']['price'];
		cost = round(cost,2)*1; // round to nearest hundredths
		var displayCost = howManyTracks() * getProductPrice('shazam');
		var isChecked = $j("input[type='checkbox'][name='store'][value='shazam']").prop('checked')

		$j('input[type="checkbox"][extra="shazam"]').attr('price',cost.toFixed(2));
		$j('input[type="checkbox"][extra="shazam"]').attr('displayPrice',displayCost);
		$j('#extra_cost_shazam').html(addCurrencySymbol(displayCost.toLocaleString('en-US')));
		if (howManyTracks() > 1)
			{
			$j('.shazamDetails').show();
			}
		else
			{
			$j('.shazamDetails').hide();
			}
		}

	if ((service == 'mfit') || (typeof service === 'undefined'))
		{
		console.debug('mfit yo: ' + service);

		// begin: figure out pricing
		if (howManyTracks() == 1)
			{
			var pricePerMfit = myAvailableExtrasJSON['mfit']['price'];
			}
		else if (howManyTracks() <= 5)
			{
			var pricePerMfit = myAvailableExtrasJSON['mfit']['price2_5'];
			}
		else
			{
			var pricePerMfit = myAvailableExtrasJSON['mfit']['price6_'];
			}
		// end: figure out pricing

		var cost = howManyTracks() * pricePerMfit;
		cost = round(cost,2)*1; // round to nearest hundredths
		var isChecked = $j("input[type='checkbox'][name='store'][value='mfit']").prop('checked')

		$j('input[type="checkbox"][extra="mfit"]').attr('price',cost.toFixed(2));
		$j('#extra_cost_mfit').html(cost.toFixed(2));
		if (howManyTracks() > 1)
			{
			$j('.pricePerMfit').text(pricePerMfit);
			$j('.mfitDetails').show();
			}
		else
			{
			$j('.mfitDetails').hide();
			}
		}
	}


function howManyTracks()
	{
	var returnNum = $j('#howManySongsOnThisAlbum').val()*1; // this works if we're on the upload form
	var isMups = $('#editReleaseForm').length ? true : false;

	if (isNaN(returnNum))
		{
		returnNum = $j('.trackRow').length; // this works if we're looking at the dashboard/album page
		}

	if (isMups){
		returnNum = $('.tableHeader2').length; // should only work for MUPS on dashboard/album/edit
	}

	return returnNum;

	}

function changedSongCount(obj)
	{
	var obj = $j('#howManySongsOnThisAlbum');
	console.log(['changedSongCount()', 'number of songs', $j(obj).val()]);

	$j('#distroProgressBarContainer').stop().hide();
	$j('#distroProgressBarContainer').html('');
	if ($j(obj).val() == 1)
		{
		changeAlbumType('single');
		}
	else
		{
		changeAlbumType('album');
		}

	createUploadForm($j(obj).val());

	// bindFileNameOnChange();
	extrasCheck();
	genreChange();
	calculateDolby();
	calculateCoverSongLicensing();
	updateAlbumPriceOptions();

	// begin: show link to copy songwriters
	var numberOfTracks = howManyTracks();
	if ( numberOfTracks > 1)
		{
		$j('.copySongwritersLink').show();
		}
	// end: show link to copy songwriters

	doSongPreviews();

	songsMasteredWithMixea = Array.from({ length: numberOfTracks }, () => false); // array of songs that have been mastered with Mixea
	}

function copySongwriters(trackNum)
	{
	sweetAlertConfirm('Copy songwriters?','This will pre-fill all songwriters on this album with the songwriter(s) you specified for track ' + trackNum,function()
		{
		copySongwritersFromTrack(trackNum)
		},function(){},'warning','Do it','Cancel')
	}

function copySongwritersFromTrack(trackNum)
	{
	var songwriterSource = createSongwriterRealNameStruct()[trackNum-1].songwriters;

	// delete all extra songwriter rows
	$j('.deleteSongwriterRealName:visible').click();

	/* loop through songwriters and add to each tracs
	$j(songwriterSource).each(function()
		{

		})
	*/

	// loop through tracks and then loop through songwriters
	var thisTrackNum = 0
	$j('.songwriter_real_name_block').each(function()
		{
		thisTrackNum++;
		var thisBlock = this;
		var thisSongwriterName = 0;
		$j(songwriterSource).each(function()
			{
			console.debug(this);
			thisSongwriterName++;

			if (thisSongwriterName > 1)
				{
				// add songwriter row
				addAnotherSongwriter(thisTrackNum);
				}

			$j(thisBlock).find('.songwriter_real_name_role:last').val(this.role);
			$j(thisBlock).find('.songwriter_real_name_first:last').val(this.name_first);
			$j(thisBlock).find('.songwriter_real_name_middle:last').val(this.name_middle);
			$j(thisBlock).find('.songwriter_real_name_last:last').val(this.name_last);
			})
		})

	//
	console.debug(songwriterSource);
	sweetAlert('Done!','Happy to save you some time');
	}

	function addAnotherSongwriter(trackNum) {
		var songwriterNames = $j('.songwriter_real_name_block');
		var curCount = songwriterNames.find(".songwriter_red_name_block_sub[tracknum='"+ trackNum +"']").length;
		var songwriterTemplate = songwriterNames.first().find('.songwriter_red_name_block_sub').outerHTML();

		songwriterTemplate = songwriterTemplate.replaceAll('tracknum="1"', 'tracknum="' + trackNum + '"').replaceAll('-name-1', '-name-' + trackNum);
		songwriterTemplate = songwriterTemplate.replaceAll('track-1', 'track-' + trackNum);

		var $songwriterTemplate = $(songwriterTemplate);
		$songwriterTemplate.attr("data-songwriter-num", curCount + 1);
		var curId = $songwriterTemplate.attr("id");
		var newId = curId.substring(0, curId.lastIndexOf("-")) + "-" + (curCount + 1);
		$songwriterTemplate.attr("id", newId);
		$j('.songwriter_real_name_block[tracknum=' + trackNum + ']').append($songwriterTemplate);
		$j('.songwriter_real_name_block[tracknum=' + trackNum + ']').find('.deleteSongwriterRealName').last().show() // show "delete row" link
	}
/**
 * returns an array of structs {role, name_first, name_middle, name_last} for
 * each track that has a visible songwriter_real_name_block.  if a block is
 * not visible then it's a cover song and we don't add it here
 */
function createSongwriterRealNameStruct() {

	var result = [];
	$j('.songwriter_real_name_block').each(function(ix, el) {

		var $el = $j(el);
		// skip tracks that do not have a visible block
		if ($el.is(":visible")) {
			var trackWriters = {
				trackNum   : $el.attr('tracknum') * 1,
				songwriters: []
			};

			// loop through songwriters of this track
			$el.find('.songwriter_red_name_block_sub').each(function(ix2, el2) {
				var $el2 = $j(el2);
				var songWriter = {
					role       : $el2.find('.songwriter_real_name_role').val() * 1,
					name_first : $el2.find('.songwriter_real_name_first').val(),
					name_middle: $el2.find('.songwriter_real_name_middle').val(),
					name_last  : $el2.find('.songwriter_real_name_last').val()
				};
				trackWriters.songwriters.push(songWriter);
			});

			result.push(trackWriters);
		}
	});

	return result;
}

function createPerformerNameRolesStruct() {
	var result = [];
	$j('.requirements-performer-section').each(function(ix, el) {

		var $el = $j(el);
		var trackPerformers = {
			trackNum   : $el.attr('tracknum') * 1,
			performers: []
		};

		// loop through performers of this track
		$el.find('.requirements-performer').each(function(ix2, el2) {
			var $el2 = $j(el2);
			var performer = {
				role : $el2.find('.performer-role option:selected').val(),
				name : $el2.find('.performer-name').val()
			};
			if (performer['name'] != null && performer['name'] !== '') {
				trackPerformers.performers.push(performer);
			}
		});

		result.push(trackPerformers);
	});

	return result;
}

function createProducerNameRolesStruct() {
	var result = [];
	$j('.requirements-producer-section').each(function(ix, el) {

		var $el = $j(el);
		var trackProducers = {
			trackNum   : $el.attr('tracknum') * 1,
			producers: []
		};

		// loop through producers of this track
		$el.find('.requirements-producer').each(function(ix2, el2) {
			var $el2 = $j(el2);
			var producer = {
				role : $el2.find('.producer-role option:selected').val(),
				name : $el2.find('.producer-name').val()
			};
			if (producer['name'] != null && producer['name'] !== '') {
				trackProducers.producers.push(producer);
			}
		});

		result.push(trackProducers);
	});

	return result;
}

function deleteSongwriterRealName(obj) {
	console.debug('deleteSongwriterRealName()');

	var allNameBlocks = $j(obj).parents('.songwriter_red_name_block_sub').siblings().not($(obj));

	$j.each( allNameBlocks, function (index){
		var nameBlock = $(this);
		var songwriterNumber = index + 1;
		var curId = nameBlock.attr("id");
		var newId = curId.substring(0, curId.lastIndexOf("-")) + "-" + songwriterNumber;
		nameBlock.attr("id", newId);
		nameBlock.attr("data-songwriter-num", songwriterNumber);
	});

	$j(obj).parents('.songwriter_red_name_block_sub').remove();
}

function createUploadForm(numOfTracks)
	{
	var numOfTracks = numOfTracks*1;
	console.debug('createUploadForm(numOfTracks=' + numOfTracks + ')');
	$( ".trackTableBody" ).remove();

	$j('#distroProgressBarContainer').html('');
	for (var x=numOfTracks; x>0; x--)
		{
		var uploadTemplate = $j('#uploadTemplate').html()
		uploadTemplate = uploadTemplate.replace(/\[myuuid\]/gi, uuid());
		uploadTemplate = uploadTemplate.replace(/\[x]/gi, x);

		$j('#uploadTableBody').after(uploadTemplate);
		}

	$j('.mixea-upsell-link').first().show();

	for (var x=1; x<numOfTracks+2; x++) // we add an extra for album artwork
		{
		var progressTemplate = $j('#distroProgressBarTemplate').html()
		if (x == 1)
			{
			progressTemplate = progressTemplate.replace(/\[label]/gi, "Album artwork");
			}
		else
			{
			progressTemplate = progressTemplate.replace(/\[label]/gi, "Track " + (x-1));
			}
		$j('#distroProgressBarContainer').append(progressTemplate);
		}
	extraCost();
	bindFileNameChangeHandler();

	addReleasePreviewChangeListenerForFirstSongTitle();
	addReleasePreviewChangeListenerForFirstSongArtist();

	initializeReleasePreviewTitle(numOfTracks);

	//instantUpgrade
	if ( window.globalInstantUpgrade ) {
		var albumPriceVisible = $("#albumPrice").is(":visible");
		var releaseDateVisible = $("#releaseDate").is(":visible");
		$(".musician-plan-upload").hide();
		$(".musician-plus-plan-upload").slideDown(1000, function() {

			if (albumPriceVisible && numOfTracks > 1) {
				$j("#albumPrice").show();
			} else {
				$("#albumPrice").hide();
			}

			if (releaseDateVisible) {
				$("#releaseDate").show();
			}
		});
	}
	}

function previewStartClick(obj)
	{
	var trackNum = $j(obj).attr('tracknum');
	var whichIsChecked = $j('input[name=previewStart_' + trackNum + ']:checked').val();
	if (whichIsChecked == 'yes')
		{
		$j('.previewStartContainer_' + trackNum).show();
		previewStartChange(obj);
		}
	else
		{
		$j('.previewStartContainer_' + trackNum).hide();
		var resultObj = $j(obj).closest('.preview-clip-settings').find('.previewStartResult');
		if (resultObj.length)
			{
			resultObj.val(0);
			}
		}
	}

function previewStartChange(obj)
	{

	var resultObj = $j(obj).closest('.preview-clip-settings').find('.previewStartResult') ;
	if (resultObj.length)
		{
		var previewMinutes = $j(obj).closest('.preview-clip-settings').find('.previewStartMinutes');
		var previewSeconds = $j(obj).closest('.preview-clip-settings').find('.previewStartSeconds');
		var options = previewSeconds.find('option');
		$j.each(options, function(key, option) {
			$j(option).show();
		});
		var maxMinutes = parseInt(previewMinutes.attr('max-value'));
		var maxSeconds = parseInt(previewSeconds.attr('max-value'));
		if (parseInt(previewMinutes.val()) >= maxMinutes) {
			$j.each(options, function(key, option) {
				if (parseInt($j(option).val()) > maxSeconds) {
					$j(option).hide();
				}
			});
			if (parseInt(previewSeconds.val()) > maxSeconds) {
				previewSeconds.val(maxSeconds);
			}
		}
		// we add 1 seccond to define non default value, cuz default value in table 0 but in different stores it's not 0 (45 for itunes)
		$j(obj).closest('.preview-clip-settings').find('.previewStartResult').val(1 + parseInt(previewMinutes.val()) * 60 + parseInt(previewSeconds.val()));
		}
	}


/**
 * retrieves the apple artist id from the form
 */
function getAppleIdFromForm() {
	var result = "";
	var visibleInput = $j('.myCustomAppleUri:visible');
	if (visibleInput.length) {
		result = parseAppleId(visibleInput.val());
	}
	else if ($j('#appleArtistIdContainer').is(':visible') && (!$j('#appleArtistIdSpinner').is(':visible'))) {
		if ($j('[name="appleArtistID"]:visible:checked').length == 1) {
			result = $j('[name="appleArtistID"]:visible:checked').val();
		}
		else if ($j('#artistName').attr('appleArtistId')) {
			result = $j('#artistName').attr('appleArtistId');
		}
	}
	return result;
}

/**
 * retrieves the spotify artist id from the form
 */
function getSpotifyIdFromForm() {
	var result = "";
	var visibleInput = $j('.myCustomSpotifyUri:visible');
	if (visibleInput.length) {
		result = parseSpotifyId(visibleInput.val());
	}
	else if ($j('#spotifyArtistIdContainer').is(':visible') && (!$j('#spotifyArtistIdSpinner').is(':visible'))) {
		if ($j('[name="spotifyArtistID"]:visible:checked').length == 1) {
			result = $j('[name="spotifyArtistID"]:visible:checked').val();
		}
		else if ($j('#artistName').attr('spotifyArtistId')) {
			result = $j('#artistName').attr('spotifyArtistId');
		}
	}
	return result;
}

/**
 * retrieves the google artist id from the form
 */
function getGoogleIdFromForm() {
	var result = "";
	var visibleInput = $j('.myCustomGoogleUri:visible');
	if (visibleInput.length) {
		result = parseGoogleId(visibleInput.val());
	}
	else if ($j('#googleArtistIdContainer').is(':visible') && (!$j('#googleArtistIdSpinner').is(':visible'))) {
		if ($j('[name="googleArtistID"]:visible:checked').length == 1) {
			result = $j('[name="googleArtistID"]:visible:checked').val();
		}
		else if ($j('#artistName').attr('googleArtistId')) {
			result = $j('#artistName').attr('googleArtistId');
		}
	}
	return result;
}

/**
 * retrieves the Instagram Profile id from the form
 */
function getInstagramProfileIdFromForm() {
	var result = "";
	var visibleInput = $j('.myCustomInstagramProfileUri:visible');
	if (visibleInput.length) {
		result = parseInstagramProfileId(visibleInput.val());
	}
	else if ($j('#instagramProfileArtistIdContainer').is(':visible') && (!$j('#instagramProfileArtistIdSpinner').is(':visible'))) {
		if ($j('[name="instagramProfileArtistID"]:visible:checked').length == 1) {
			result = $j('[name="instagramProfileArtistID"]:visible:checked').val();
		}
		else if ($j('#artistName').attr('instagramProfileArtistId')) {
			result = $j('#artistName').attr('instagramProfileArtistId');
		}
	}
	return result;
}

/**
 * retrieves the Facebook Profile id from the form
 */
 function getFacebookProfileIdFromForm() {
	var result = "";
	var visibleInput = $j('.myCustomFacebookProfileUri:visible');
	if (visibleInput.length) {
		result = parseFacebookProfileId(visibleInput.val());
	}
	else if ($j('#facebookProfileArtistIdContainer').is(':visible') && (!$j('#facebookProfileArtistIdSpinner').is(':visible'))) {
		if ($j('[name="facebookProfileArtistID"]:visible:checked').length == 1) {
			result = $j('[name="facebookProfileArtistID"]:visible:checked').val();
		}
		else if ($j('#artistName').attr('facebookProfileArtistId')) {
			result = $j('#artistName').attr('facebookProfileArtistId');
		}
	}
	return result;
}

function getInputValue(selector) {
    return $(selector).val() || "";
}

/**
 * scrolls the page to just above the first element found by the selector
 */
function scrollTo(selector, speed) {
	speed = speed || 400;
	var $el = $(selector);
	if ($el && $el.length && $el.first() && $el.first().offset()) {
		var top = $el.first().offset().top - 60;
		$([document.documentElement, document.body]).animate({
			scrollTop: top
		}, speed);
	}
}

/**
 * parses input in the format https://....apple.com/us/artist/.../{id}?uo=4
 * and returns the id or empty string if invalid
 */
function parseAppleId(input) {
	if (containsEmojis(input, false)) {
		return "";
	}
	if (isNumeric(input)) {
		return input;
	}
	if (input.startsWith("http") && input.indexOf("/artist/") >= 0) {
		var strParts = (input.replace('/?', '?').split("?")[0]).split("/");   // get only value before ? and then split on /
		var artistId = strParts[ strParts.length - 1 ];    // get last part
		if (isNumeric(artistId)) {
			return artistId;
		}
	}

	return "";
}

/**
 * parses input in the format https://open.spotify.com/artist/{id} or spotify:artist:{id}
 * and returns the full Spotify URI or empty string if invalid
 */
function parseSpotifyId(input) {
	var idPrefix = "spotify:artist:";
	if (containsEmojis(input, false)) {
		return "";
	}

	var artistId = "";
	input = input.trim();
	if ( input.split( "/" ).length > 1 ) { // url
		var strParts = (input.replace('/?', '?').split("?")[0]).split("/");   // get only value before ? and then split on /
		strParts = strParts.filter( function( e ){ return e; } ); // remove empty due to potential trailing slash
		if ( strParts[ 0 ].startsWith( "http" ) ){
			strParts.shift();
		}
		if ( strParts.length == 3
				&& strParts[0].toLowerCase() == "open.spotify.com"
				&& strParts[1].toLowerCase() == "artist" ) {
			artistId = strParts[ strParts.length - 1 ].trim();
		}
	} else if ( input.startsWith( idPrefix ) ) { // uri
		if ( input.includes( '?' ) ) {
			input = input.split( "?" )[ 0 ];
		}
		artistId = input.slice( idPrefix.length ).trim();
	}

	var artistIdRegEx = /[0-9a-zA-Z]*/;
	if ( artistId.length == 0 || !artistIdRegEx.test( artistId ) ){
		return "";
	}
	return idPrefix + artistId;
}

/**
 * parses input in the format https://....youtube.com/channel/{id}
 * and returns the id or empty string if invalid
 */
function parseGoogleId(input) {

	if ((input.length == 24) && /[a-zA-Z0-9\-_]{24}/.test(input)) {
		return input;
	}

	if (containsEmojis(input, false)) {
		return "";
	}
	// https://music.youtube.com/channel/UC1GnYJ6I2bzjdHMzK0uGU4A
	if (input.startsWith("http") && input.indexOf("music.youtube.com/channel/") >= 0) {
		var strParts = (input.replace('/?', '?').split("?")[0]).split("/");   // get only value before ? and then split on /
		var artistId = strParts[ strParts.length - 1 ];    // get last part
		if (artistId.indexOf("/") < 0 && artistId.indexOf("?") < 0 && artistId.length == 24) {
			return artistId;
		}
	}

	return "";
}

function parseInstagramProfileId( input ) {
	if ( containsEmojis( input, false ) ) {
		return "";
	}
	var strParts = ( input.trim().replace( '/?', '?' ).split( "?" )[ 0 ]).split( "/" );   // get only value before ? and then split on /
	strParts = strParts.filter( function( e ){ return e; } ); // remove empty due to potential trailing slash
	if ( strParts.length === 2 ){
		if ( strParts[ 0 ].toLowerCase() !== "www.instagram.com"
				&& strParts[ 0 ].toLowerCase() !== "instagram.com" ){
			return "";
		}
	} else if ( strParts.length === 3 ) {
		if ( strParts[ 0 ].toLowerCase() !== "https:"
				&& strParts[ 0 ].toLowerCase() !== "http:" ) {
			return "";
		}
		if ( strParts[ 1 ].toLowerCase() !== "www.instagram.com"
				&& strParts[ 1 ].toLowerCase() !== "instagram.com" ){
			return "";
		}
	} else if ( strParts.length != 1 ) {
		return "";
	}
	var artistId = String( strParts[ strParts.length - 1 ] ).trim();    // get last part
	if ( artistId.charAt( 0 ) == '@' ) {
		artistId = artistId.slice( 1 ).trim();
	}
	var artistIdRegEx = /^[a-zA-Z0-9._]+$/;
	if ( artistId.indexOf( "/" ) < 0 && artistId.indexOf( "?" ) < 0
		&& artistId.length > 0 && artistId.length < 31
		&& artistId.toLowerCase().slice(-4) != ".com"
		&& artistId.indexOf( " " ) === -1
		&& artistIdRegEx.test( artistId )
		&& isNaN( artistId )
	) {
		return "https://www.instagram.com/" + artistId + "/";
	}
	return "";
}

function parseFacebookProfileId( input ) {
	if ( containsEmojis( input, false ) ) {
		return "";
	}
	var strParts = ( input.trim().replace( '/?', '?' ).split( "?" )[ 0 ]).split( "/" );   // get only value before ? and then split on /
	strParts = strParts.filter( function( e ){ return e; } ); // remove empty due to potential trailing slash
	if ( strParts.length === 2 ){
		if ( strParts[ 0 ].toLowerCase() !== "www.facebook.com"
				&& strParts[ 0 ].toLowerCase() !== "facebook.com" ){
			return "";
		}
	} else if ( strParts.length === 3 ) {
		if ( strParts[ 0 ].toLowerCase() !== "https:"
				&& strParts[ 0 ].toLowerCase() !== "http:" ) {
			return "";
		}
		if ( strParts[ 1 ].toLowerCase() !== "www.facebook.com"
				&& strParts[ 1 ].toLowerCase() !== "facebook.com" ){
			return "";
		}
	} else if ( strParts.length != 1 ) {
		return "";
	}

	var artistId = String(strParts[ strParts.length - 1 ]).trim(); // get last part

	if ( artistId == "profile.php" || artistId == "settings" ){
		return "";
	}

	if ( artistId.charAt( 0 ) == '@' ) {
		artistId = artistId.slice( 1 ).trim();
	}
	var artistIdRegEx = /^[a-zA-Z0-9.]+$/;
	if (artistId.indexOf( "/" ) < 0 && artistId.indexOf( "?" ) < 0
		&& artistId.length > 4 && artistId.length < 31
		&& artistId.toLowerCase().slice(-4) != ".com"
		&& artistId.indexOf( " " ) === -1
		&& artistIdRegEx.test( artistId )
	) {
		return "https://www.facebook.com/" + artistId + "/";
	}
	return "";
}

/**
 * Escapes special Regex characters, e.g. "[" => "\["
 */
function escapeRegexInput(input) {
	return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Returns the input if it is a String, or its JSON.stringify representation otherwise
 */
function stringify(input) {
	if ((typeof input === "string") || (input instanceof String))
		return input;

	return JSON.stringify(input);
}

/**
 * Calls /api/distroLog/logUserEvent.cfm to log data using navigator.sendBeacon
 * https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
 *
 * logUserEvent(page='My Music', section='Get started card', event='click', action='Upload music button', notes='Share your Spotify pre-save page')
 */
function logUserEvent(page, section, action, event, notes, userid, albumuuid, songid) {
	if (navigator.sendBeacon) {
		if (typeof event === 'undefined')
			event = 'click';
		if (typeof notes === 'undefined')
			notes = '';
		if (typeof userid === 'undefined')
			userid = 0;
		if (typeof albumuuid === 'undefined')
			albumuuid = '';
		if (typeof songid === 'undefined')
			songid = 0;

		var dataForm = new FormData();
		dataForm.append('page', page);
		dataForm.append('section', section);
		dataForm.append('action', action);
		dataForm.append('event', event);
		dataForm.append('notes', notes);
		dataForm.append('userid', userid);
		dataForm.append('albumuuid', albumuuid);
		dataForm.append('songid', songid);

		navigator.sendBeacon("/api/distroLog/logUserEvent.cfm", dataForm);
		return true;
	}

	// No Beacon. Must be very old browser.
	return false;
}

/**
 * Calls /api/uploadFormEvents/ to log data using navigator.sendBeacon
 * https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
 *
 * logUploadFormEvent(eventName='mixea a-la-carte', action='reject', albumuuid='albumuuid',notes='notes')
 */
function logUploadFormEvent({eventName, action, albumuuid = '', notes = '', isSavedToSql = true}) {
	if (navigator.sendBeacon) {
		if (typeof eventName === 'undefined') {
			console.error('the "eventName" param cannot be empty');
			return false;
		}
		if (typeof action === 'undefined') {
			console.error('the "action" param cannot be empty');
			return false;
		}

		var isMobileupload = $("body").hasClass("webview");

		var dataForm = new FormData();
		dataForm.append('eventName', eventName);
		dataForm.append('action', action);
		dataForm.append('albumuuid', albumuuid);
		dataForm.append('notes', notes);
		dataForm.append('applicationName', isMobileupload ? "mobile-app" : "web");
		dataForm.append('isSavedToSql', isSavedToSql);

		navigator.sendBeacon("/api/uploadFormEvents/", dataForm);
		return true;
	}

	// No Beacon. Must be very old browser.
	return false;
}

/**
 * Calls /api/apiErrorLog/ to log the error
 */
function logError(msg, notes, callback) {
	notes = notes || {};
	if (!notes.userAgent && navigator.userAgent)
		notes.userAgent = navigator.userAgent;

	window.loggedErrors = window.loggedErrors || {};

	var serializedMsg = stringify(msg);
	var errorCount = (window.loggedErrors[serializedMsg] || 0) + 1;

	// report the first 100 errors and then only once per 100 times
	var doReport = errorCount < 100 || (errorCount % 100 == 0);
	if (doReport) {

		try {
			notes.errorCount = errorCount;

			$j.post("/api/apiErrorLog/", {
				"error": serializedMsg,
				"notes": stringify(notes),
				"currentUrl": document.URL
			}, callback);
		}
		catch (ex) {
			if (console && console.log)
				console.log(ex);
		}
	}

	window.loggedErrors[serializedMsg] = errorCount;
}

function logFuuExperimentEvent() {
	var data = $(this).data();
	var eventData = {
		"name": data.experimentName,
		"page": window.location.pathname,
		"action": data.experimentAction,
	}

	$.post("/api/experimentEvents/freeUserOnUpload/", eventData);

	return;
}

$(document).on("click", ".experiment-event-log", logFuuExperimentEvent);

var customMD5 = function (string) {

	function RotateLeft(lValue, iShiftBits) {
			return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}

	function AddUnsigned(lX,lY) {
			var lX4,lY4,lX8,lY8,lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
			if (lX4 & lY4) {
					return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			}
			if (lX4 | lY4) {
					if (lResult & 0x40000000) {
							return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
					} else {
							return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
					}
			} else {
					return (lResult ^ lX8 ^ lY8);
			}
	}

	function F(x,y,z) { return (x & y) | ((~x) & z); }
	function G(x,y,z) { return (x & z) | (y & (~z)); }
	function H(x,y,z) { return (x ^ y ^ z); }
	function I(x,y,z) { return (y ^ (x | (~z))); }

	function FF(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
	};

	function GG(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
	};

	function HH(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
	};

	function II(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
	};

	function ConvertToWordArray(string) {
			var lWordCount;
			var lMessageLength = string.length;
			var lNumberOfWords_temp1=lMessageLength + 8;
			var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
			var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
			var lWordArray=Array(lNumberOfWords-1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while ( lByteCount < lMessageLength ) {
					lWordCount = (lByteCount-(lByteCount % 4))/4;
					lBytePosition = (lByteCount % 4)*8;
					lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
					lByteCount++;
			}
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
			lWordArray[lNumberOfWords-2] = lMessageLength<<3;
			lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
			return lWordArray;
	};

	function WordToHex(lValue) {
			var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
			for (lCount = 0;lCount<=3;lCount++) {
					lByte = (lValue>>>(lCount*8)) & 255;
					WordToHexValue_temp = "0" + lByte.toString(16);
					WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
			}
			return WordToHexValue;
	};

	function Utf8Encode(string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

					var c = string.charCodeAt(n);

					if (c < 128) {
							utftext += String.fromCharCode(c);
					}
					else if((c > 127) && (c < 2048)) {
							utftext += String.fromCharCode((c >> 6) | 192);
							utftext += String.fromCharCode((c & 63) | 128);
					}
					else {
							utftext += String.fromCharCode((c >> 12) | 224);
							utftext += String.fromCharCode(((c >> 6) & 63) | 128);
							utftext += String.fromCharCode((c & 63) | 128);
					}

			}

			return utftext;
	};

	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;

	string = Utf8Encode(string);

	x = ConvertToWordArray(string);

	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

	for (k=0;k<x.length;k+=16) {
			AA=a; BB=b; CC=c; DD=d;
			a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
			d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
			c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
			b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
			a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
			d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
			c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
			b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
			a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
			d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
			c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
			b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
			a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
			d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
			c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
			b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
			a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
			d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
			c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
			b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
			a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
			d=GG(d,a,b,c,x[k+10],S22,0x2441453);
			c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
			b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
			a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
			d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
			c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
			b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
			a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
			d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
			c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
			b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
			a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
			d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
			c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
			b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
			a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
			d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
			c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
			b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
			a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
			d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
			c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
			b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
			a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
			d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
			c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
			b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
			a=II(a,b,c,d,x[k+0], S41,0xF4292244);
			d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
			c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
			b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
			a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
			d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
			c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
			b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
			a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
			d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
			c=II(c,d,a,b,x[k+6], S43,0xA3014314);
			b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
			a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
			d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
			c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
			b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
			a=AddUnsigned(a,AA);
			b=AddUnsigned(b,BB);
			c=AddUnsigned(c,CC);
			d=AddUnsigned(d,DD);
			}

		var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

		return temp.toLowerCase();
 }


/**
 * parses the query string and returns an object with key value pairs
 *
 * @param q - if not passed defaults to window.location.search
 */
function parseQueryString(q) {

    var result = {}, key, val;
    q = q || window.location.search;
    q = q.split("#")[0];
    if (q.length == 0 || q == "?")
        return result;

    if (q[0] == "?")
        q = q.substring(1);

    var parts = q.split("&");
    for (var i=0; i < parts.length; i++) {
        var sep = parts[i].indexOf("=");
        if (sep > -1) {
			key = parts[i].substring(0, sep);
			val = parts[i].substring(sep + 1);
            result[key] = decodeURIComponent(val);
        }
        else {
			key = parts[i];
            result[key] = "";
        }
    }

    return result;
}

function removeKeyFromQueryString(q, keyToRemove) {

    var arrResult = [], key, val;
    q = q || window.location.search;
    q = q.split("#")[0];
    if (q.length == 0 || q == "?")
        return "";

    if (q[0] == "?") {
        q = q.substring(1);
		arrResult.push("?");
	}

    var parts = q.split("&");
    for (var i=0; i < parts.length; i++) {
        var sep = parts[i].indexOf("=");
        if (sep > -1) {
			key = parts[i].substring(0, sep);
			val = parts[i].substring(sep + 1);

			if (keyToRemove != key) {
				arrResult.push(key);
				arrResult.push("=");
				arrResult.push(decodeURIComponent(val));
			}
        }
        else {
			key = parts[i];
			if (keyToRemove != key) {
				arrResult.push(key);
			}
        }

		if (i < (parts.length - 1) && arrResult.length > 0 && !"?&".includes(arrResult[arrResult.length - 1])) {
			arrResult.push("&");
		}
    }

    var result = arrResult.join("");

	if (result == "?")
		return "";

	return result;
}


function fieldContainsEmojis(field, includeBasic) {
	if (typeof includeBasic === 'undefined')
		includeBasic = true;
	var value = $j(field).val();

	// console.log("Field '" + $j(field).attr('name') + "' Contains Emoji in value '"+value+"' : " +  containsEmojis(value, includeBasic));
	return containsEmojis(value, includeBasic);
}

/**
* iterates over the code points of an input string and returns true if an emoji is found.
*
* an emoji is found if the hex code for the character is 5 characters starting with "1F",
* or if @includeBasic is true, the character is 4 and starts with one of the prefixes of
* a basic emoji as defined in the Unicode specification version 13
* see https://unicode.org/Public/emoji/13.0/emoji-sequences.txt
*
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes
*    via via: https://www.stefanjudis.com/snippets/how-to-detect-emojis-in-javascript-strings/
*    {Emoji} returns true for numbers; I emailed auther and comfirmed my testing to use {Emoji_Presentation}
*
* @param input the string to check
* @param includeBasic include also the basic emojis that only take 3 characters
*/
function containsEmojis(input, includeBasic) {
	if (typeof includeBasic === 'undefined')
		includeBasic = true;
	const regexExp = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;
	return regexExp.test(input);
}

/**
 * Returns an object that can be used to prevent more than one click action by setting
 * a flag in the body data attribute.  For multiple flags on the same page that should
 * work independently you must pass an id.
 *
 * @param _id allows to specify multiple click actions that can work independently
 * from one another
 */
function ClickOnce(_id) {

    this.id = _id || "clicked";

    this.isClicked = function() {
        return $("body").data("clickonce-" + this.id) || false;
    }

    this.setClicked = function() {
        $("body").data("clickonce-" + this.id, true);
    }

    this.unsetClicked = function() {
        $("body").data("clickonce-" + this.id, false);
    }
}

// returns true if any track on the upload form is currently marked as a cover song
function releaseContainsCoverSong() {
	return $('.distroCoverSong[value="1"]:checked').length > 0;
}

function tiktokcmlStoreUploadSelection( obj ){

	var $obj = $(obj);

	if( $obj.is( ':checked' ) ){

		if (releaseContainsCoverSong()) {

			Swal.fire( {
				title: 'TikTok Commercial Music Library doesn\'t accept cover songs',
				type: '',
				html: 'TikTok Commercial Music Library can only accept releases from artists with full publishing rights to the music, which doesn\'t include cover songs. If you want to send this release to TikTok Commercial Music Library, remove the cover songs first.',
				reverseButtons: true,
				showCloseButton: false,
				showCancelButton: false,
				focusConfirm: false,
				allowOutsideClick: false,
				allowEscapeKey: false,
				allowEnterKey: false,
				confirmButtonText: 'GOT IT',
				confirmButtonAriaLabel: 'Confirm',
				customClass: {
					title: 'snapSATitle',
					content: 'snapSATextContent',
					confirmButton: 'snapSAConfirmButton',
				},
			} ).then( $obj.prop( 'checked', false ) );
		} else {

			Swal.fire( {
				title: 'Do you own 100% of the publishing rights for this release?',
				type: '',
				html: 'TikTok Commercial Music Library can only accept releases from artists with full publishing rights to the music. That usually means you wrote and performed all the songs.',
				reverseButtons: true,
				showCloseButton: false,
				showCancelButton: true,
				focusConfirm: false,
				allowOutsideClick: false,
				allowEscapeKey: false,
				allowEnterKey: false,
				confirmButtonText: 'YES, I OWN 100% OF THE PUBLISHING',
				confirmButtonAriaLabel: 'Confirm',
				cancelButtonText: 'NO I DON&rsquo;T',
				customClass: {
					title: 'snapSATitle',
					content: 'snapSATextContent',
					confirmButton: 'snapSAConfirmButton',
					cancelButton: 'snapSACancelButton'
				},
				cancelButtonAriaLabel: 'Cancel'
			} ).then( function( isConfirm ){
				if ( isConfirm.value ){
					$obj.prop( 'checked', true );
					$( '#chktiktok' ).prop( 'checked', true ); // both need to be checked
					$('#mandatoryCheckboxTicktokCml').show();
				} else {
					$obj.prop( 'checked', false );
					$('#mandatoryCheckboxTicktokCml').hide();
				}

				// only attempt to call updateDspIcons if it exists (on desktop upload form & release-preview.js is included)
				if (typeof updateDspIcons === "function") {
					updateDspIcons();
				}
			} );
		}
	} else {
		$('#mandatoryCheckboxTicktokCml').hide();

		// only attempt to call updateDspIcons if it exists (on desktop upload form & release-preview.js is included)
		if (typeof updateDspIcons === "function") {
			updateDspIcons();
		}
	}
}

function snapStoreUploadSelection( obj, albumUUID, albumId ){

	var thisAlbumUUID = albumUUID;
	var thisAlbumId   = albumId;

	if( $j( obj ).is( ':checked' ) ){

		Swal.fire( {
			title: 'Do you own 100% of the publishing rights for this release?',
			type: '',
			html: 'Snapchat can only accept releases from artists with full publishing rights to the music. That usually means you wrote and performed all the songs.',
			reverseButtons: true,
			showCloseButton: false,
			showCancelButton: true,
			focusConfirm: false,
			allowOutsideClick: false,
			allowEscapeKey: false,
			allowEnterKey: false,
			confirmButtonText: 'YES, I OWN 100% OF THE PUBLISHING',
			confirmButtonAriaLabel: 'Confirm',
			cancelButtonText: 'NO I DON&rsquo;T',
			customClass: {
				title: 'snapSATitle',
				content: 'snapSATextContent',
				confirmButton: 'snapSAConfirmButton',
				cancelButton: 'snapSACancelButton'
			},
			cancelButtonAriaLabel: 'Cancel'
		} ).then( function( isConfirm ){
			if( isConfirm.value ){
				$j.ajax( {
					url: '/api/snap/snapGrant/',
					method: 'post',
					returnType: 'json',
					data: { albumUUID: thisAlbumUUID, albumId: thisAlbumId, action: 'add' },
					success: function( data ){
						console.debug( data );
					},
					error: function( err ){
						console.warn( err );
					}
				} );
				$j( obj ).prop( 'checked', true );
				$j('#mandatoryCheckboxSnap').show();
			} else {
				removeSnapGrant( thisAlbumUUID );
				$j( obj ).prop( 'checked', false );
				$j('#mandatoryCheckboxSnap').hide();
			}
		} );

	} else {
		removeSnapGrant( thisAlbumUUID );
		$j('#mandatoryCheckboxSnap').hide();
	}

	// only attempt to call updateDspIcons if it exists (on desktop upload form & release-preview.js is included)
	if (typeof updateDspIcons === "function") {
		updateDspIcons();
	}
}


function removeSnapGrant( albumUUID ){
	$j.ajax( {
		url: '/api/snap/snapGrant/',
		method: 'post',
		returnType: 'json',
		data: { albumUUID: albumUUID, action: 'clear' },
		success: function( data ){
			console.debug( data );
		},
		error: function( err ){
			console.warn( err );
		}
	} );
}


function showSongTitleError(fieldId, errorType, trackNumber){
	$j("#" + fieldId).css({"border-color": "rgb(220, 38, 38)"});
	$j('.title-'+errorType+'-error' + trackNumber).slideDown('fast');
}

function hideSongTitleError(fieldId, errorType, trackNumber){
	//Remove red border around title field.
	$j("#" + fieldId).removeAttr('style');
	//Remove the error message.
	$j('.title-'+errorType+'-error' + trackNumber).slideUp('fast');
}

function validateRecordLabel(obj)
	{
	var val = $j(obj).val();

	if(containsEmojis(val, false)){
		//songTitleEmojiWarning
		$j('.recordLabelEmojiWarning').slideDown('fast');
	}
	else {
		$j('.recordLabelEmojiWarning').slideUp('fast');
	}
}
function hasSpecialCharacter(obj){

	var str = $j(obj).val();
	var SURROGATE_CHARACTERS_RANGE = [55296,57343];
	var carr = Array.from(str);

	for (var i = 0; i < carr.length; i++) {
		var a = carr[i].charCodeAt(0);
		if ( a >= SURROGATE_CHARACTERS_RANGE[0] && a <= SURROGATE_CHARACTERS_RANGE[1]) {
			return true;
		}
	}
	return false;
}

function coverSongNotice(tracknum){
	var isChecked = $j(".coverSongRequiredCheckbox" + tracknum).is(":checked");
	if (isChecked){
		$j('.coverSongNotice' + tracknum).slideDown('fast');
	}
	else{
		$j('.coverSongNotice' + tracknum).slideUp('fast');
	}
}

function boughtDistroVidExtra(){
	var isChecked = $j('input[type="checkbox"][extra="distrovid"]').is(':checked');

	return isChecked;
}

function validateSongTitle(obj,tracknum){
	var title = $j(obj).val();
	var id = $(obj).attr('id');

	var validationErrors = 0;

	function showSongTitleError(fieldId, errorType, trackNumber){
		validationErrors++;
		$j("#" + fieldId).css({"border-color": "rgb(220, 38, 38)"});
		$j('.track-level-error-text .title-'+errorType+'-error' + trackNumber).slideDown('fast');
	}

	function hideSongTitleError(fieldId, errorType, trackNumber){
		//Remove red border around title field.
		$j("#" + fieldId).removeAttr('style');
		//Remove the error message.
		$j('.track-level-error-text .title-'+errorType+'-error' + trackNumber).slideUp('fast');
	}

	if(containsEmojis(title, false)){
		//songTitleEmojiWarning
		$j('.songTitleEmojiWarning' + tracknum).slideDown('fast');
	}
	else {
		$j('.songTitleEmojiWarning' + tracknum).slideUp('fast');
	}

	var isStandardCaps   = checkStandardCapitalization( title );

	if( !isStandardCaps ){
		// SomEThInG sTRanGe HaS bEEn sUbMiTTeD
		$j( '#nonStandardCapsCheckbox' ).show();
	} else {
		$j( '#nonStandardCapsCheckbox' ).hide();
	}

	if 	(titleContainsFeaturing(title)) {
		showSongTitleError(id, 'featuring', tracknum);
	} else {
		hideSongTitleError(id, 'featuring', tracknum);
	}

	if 	(titleContainsVersion(title)) {
		showSongTitleError(id, 'version', tracknum);
	} else {
		hideSongTitleError(id, 'version', tracknum);
	}

	if 	(titleContainsProducer(title)) {
		showSongTitleError(id, 'producer', tracknum);
	} else {
		hideSongTitleError(id, 'producer', tracknum);
	}

	if 	(titleContainsCurseWordVersion(title)) {
		showSongTitleError(id, 'curse-words', tracknum);
	} else {
		hideSongTitleError(id, 'curse-words', tracknum);
	}

	if 	(titleContainsCensoring(title)) {
		showSongTitleError(id, 'censoring', tracknum);
	} else {
		hideSongTitleError(id, 'censoring', tracknum);
	}
	$j(".track-level-error-text").toggle(validationErrors > 0);
}

function validateAlbumTitle(field){
	if(fieldContainsEmojis('#albumTitleInput', false)){
		$j('.albumTitleEmojiWarning').slideDown('fast');
		return false;
	}
	$j('.albumTitleEmojiWarning').slideUp('fast');
	return true;
}

// Start Sitetran / Zendesk knowledge articles
if( window.ReactNativeWebView ){
	//
} else {
	//  Event handler for Zendesk links
	document.addEventListener( "click", function( e ){
		let target = e.target;
		// Handle clicks on links or elements inside links
		while( target && target.tagName !== "A" ){
			target = target.parentElement;
		}
		if( !target ) return;

		var href = target.getAttribute( "href" );
		if( !href || !href.startsWith( "https://distrokid.zendesk.com/hc/" ) ) return;

		e.preventDefault();

		// Get Zendesk language code (pre-computed on server, or fallback lookup)
		let zendeskLang = "en-us";
		if( typeof sitetran !== 'undefined' && sitetran.zendeskLanguageCode ){
			// Use pre-computed value from server (single source of truth)
			zendeskLang = sitetran.zendeskLanguageCode;
		} else {
			// Fallback: get preferred language and look it up in mapping
			const preferredLang = ( typeof sitetran !== 'undefined' && sitetran.preferredLanguage )
				? sitetran.preferredLanguage
				: getCookie( 'sitetran_lang' );

			if( preferredLang && typeof zendeskLanguageMapping !== 'undefined' && zendeskLanguageMapping ){
				// Try exact match, then lowercase, then base language code
				zendeskLang = zendeskLanguageMapping[ preferredLang ]
					|| zendeskLanguageMapping[ preferredLang.toLowerCase() ]
					|| zendeskLanguageMapping[ preferredLang.toLowerCase().split( '-' )[0] ]
					|| "en-us";
			}
		}

		// Update URL with Zendesk language code
		href = href.replace( /(\/hc\/)[^\/]+(\/|$)/, '$1' + zendeskLang + '$2' );

		openInNewTab( href );
	}, true ); // Use capture phase to catch events early
}

function getCookie( cookieName ){
	var name = cookieName + "=";
	var ca = document.cookie.split(';');
	for( var i = 0; i < ca.length; i++ ){
		var c = ca[i];
		while( c.charAt(0) == ' ' ){
			c = c.substring(1);
		}
		if( c.indexOf( name ) == 0 ){
			return c.substring( name.length, c.length );
		}
	}
	return "";
}

function openInNewTab( url ){
	var win = window.open( url, '_blank' );
	win.focus();
}
// End Sitetran / Zendesk knowledge articles

/**
 * calls the function func once within the within time window. this is a debounce function which
 * actually calls the func as opposed to returning a function that would call func.
 *
 * @param func    the function to call
 * @param within  the time window in milliseconds, defaults to 300
 * @param timerId an optional key, defaults to func
 */
function callOnce(func, within, timerId){
	if (typeof within === 'undefined')
		within = 300;
	if (typeof timerId === 'undefined' || timerId == null)
		timerId = func;
	window.callOnceTimers = window.callOnceTimers || {};
	var timer = window.callOnceTimers[timerId];
	clearTimeout(timer);
	timer = setTimeout( func, within );
	window.callOnceTimers[timerId] = timer;
}

function validatePostcode(country, postcode, onValid, onInvalid) {
	$.ajax(`/api/validate/postcode/?country=${country}&postcode=${postcode}`, {
		complete: function(jqXHR) {
			if (jqXHR.status == "200") {
				if (jqXHR.responseJSON.is_valid) {
					if (onValid)
						onValid();
				}
				else {
					if (onInvalid)
						onInvalid();
				}
			}
			else {
				console.debug(jqXHR);
			}
		}
	});
}

/**
 * Checks if string contains contains "http:" or "https:" and returns true if so.
 *
 */
function checkForHttpUrl(artistName) {
	var noUrlArtistName = artistName.trim().toLowerCase();

	if (noUrlArtistName !== "") {
		if (noUrlArtistName.includes("http:") || noUrlArtistName.includes("https:")) {
			return true;
		}
	}

	return false;
}

/**
 * Checks all inputs with the class "no-url" if any contain "http:" or "https:".
 *
 */
function checkAllNoUrlInputsForHttp() {
	var inputHasHttp = false;

	$("input.no-url").each(function () {
		if (checkForHttpUrl($(this).val())) {
			inputHasHttp = true;
		}
	})

	return inputHasHttp;
}

function splitString(string, splitters) {
    var list = [string];
    for(var i=0, len=splitters.length; i<len; i++) {
        traverseList(list, splitters[i], 0);
    }
    return flatten(list);
}


function traverseList(list, splitter, index) {
    if(list[index]) {
        if((list.constructor !== String) && (list[index].constructor === String))
            (list[index] != list[index].split(splitter)) ? list[index] = list[index].split(splitter) : null;
        (list[index].constructor === Array) ? traverseList(list[index], splitter, 0) : null;
        (list.constructor === Array) ? traverseList(list, splitter, index+1) : null;
    }
}

function flatten(arr) {
    return arr.reduce(function(acc, val) {
        return acc.concat(val.constructor === Array ? flatten(val) : val.trim());
    },[]);
}


function buildArrayDNDCheck( primaryArtistName ){
	var splitList = [" and ", " & ", "&", " with ", " x ", " a ", " y ", " / ", "/", " , ", ", ", ","];
	var arrSplitPrimaryArtistsTemp = splitString( primaryArtistName.toLowerCase(), splitList );
	console.log( arrSplitPrimaryArtistsTemp, 'arrSplitPrimaryArtistsTemp' );
	var tempList = arrSplitPrimaryArtistsTemp.join();
	// console.log( tempList, 'tempList' );
	var arrSplitPrimaryArtists = tempList.split(/[,]+/).filter(Boolean);
	console.log( arrSplitPrimaryArtists, 'arrSplitPrimaryArtists' );
	return arrSplitPrimaryArtists;
}

function checkDoNotDistributeWatchlist(){
	var arrMatchesDNDArtists = [];
	var primaryArtistEl = $( '#artistName' ),
		primaryArtistName = primaryArtistEl.val().trim();

	// Primary artist always goes first
	if( $j('input[type="radio"][name="compoundBandName"]:visible').length > 0 ){
		if( $j('input[type="radio"][name="compoundBandName"]:checked').length > 0 ){ // selected
			if( $j('input[type="radio"][name="compoundBandName"]:checked').val() == 'collaboration' ){
				var arrSplitPrimaryArtists = buildArrayDNDCheck( primaryArtistName );
				for( var x = 0; x < dndistributeList.length; x++ ){
					if( arrSplitPrimaryArtists.length ){
						for( var j = 0; j < arrSplitPrimaryArtists.length; j++ ){
							if( arrSplitPrimaryArtists[ j ] == dndistributeList[ x ] ){
								arrMatchesDNDArtists.push( {
									'name': arrSplitPrimaryArtists[ j ],
									'role': 'Primary Collaboration',
									'isPrimary': true,
									'isCollab': true
								} );
							}
						}
					} else {
						if( primaryArtistName.toLowerCase().indexOf( dndistributeList[ x ] ) >= 0 ){
							arrMatchesDNDArtists.push( {
								'name': dndistributeList[ x ],
								'role': 'Primary Collaboration',
								'isPrimary': true,
								'isCollab': true
							} );
						}
					}
				}
			}
		}
	} else {
		// Just a "standard" artist / band name
		if( dndistributeList.indexOf( primaryArtistName.toLowerCase() ) >= 0 ){
			arrMatchesDNDArtists.push( {
				'name': primaryArtistName,
				'role': 'Primary',
				'isPrimary': true,
				'isCollab': false
			} );
		}
	}

	for (let x = 1; x <= howManyTracks(); x++){
		var thisGetFeat = getFeat(x);
		for( var i = 0; i < thisGetFeat.artistsUnique.length; i++ ){
			var thisArtistName = thisGetFeat.artistsUnique[ i ];
			if( dndistributeList.indexOf( thisArtistName.toLowerCase() ) >= 0 ){
				arrMatchesDNDArtists.push( {
					'name': thisArtistName,
					'role': thisGetFeat.artistRole[ thisArtistName ][ 0 ],
					'isPrimary': false,
					'track': x
				} );
			}
		}
	}

	if( arrMatchesDNDArtists.length ){
		var strMatchHTML = '';
		var arrMatchOutput = [];
		var isMultiple = ( arrMatchesDNDArtists.length > 1 ) ? true : false;
		for( var x = 0; x < arrMatchesDNDArtists.length; x++ ){
			if( arrMatchesDNDArtists[ x ][ 'isPrimary' ] ){
				var str = '<strong>' + arrMatchesDNDArtists[ x ][ 'name' ]  + '</strong>';
				if( arrMatchesDNDArtists[ x ][ 'isCollab' ] ){
					str = str + ' as a collaborative primary artist';
				} else {
					str = str + ' as the primary artist';
				}
			} else {
				var str = '<strong>' + arrMatchesDNDArtists[ x ][ 'name' ] + '</strong> as a collaborator on track ' + arrMatchesDNDArtists[ x ][ 'track' ];
			}
			arrMatchOutput.push( str );
			strMatchHTML = strMatchHTML + str + '<br />';
		}
		if( isMultiple ){
			var strMessageIntro = 'You have used the following names:';
			var strArtistMessage = 'Due to legal reasons beyond DistroKid&rsquo;s control, these artist names are unavailable. Please use different artist names.';
		} else {
			var strMessageIntro = 'You have used the following name:';
			var strArtistMessage = 'Due to legal reasons beyond DistroKid&rsquo;s control, this artist name is unavailable. Please use a different artist name.';
		}
		errorMessages.push('<p>' + strMessageIntro + '</p>' + strMatchHTML + '<p>' + strArtistMessage + '</p>');
	}

}

/**
 *
 * @param {Selector} container - Container for the alert, eg. .alert-container
 * @param {Boolean} validation - Whether the class needs an alert based on user input
 * @param {String} alertClass - Class for validation, eg. .no-emoji, .no-url
 * @param {Object} alertMessage - Object with the boldText and text property
 */
function manageInlineValidationAlert(container, validation, alertClass, alertMessage) {
	var alert = container.find(alertClass);
	var fieldNameText = alertMessage.fieldNameText ? alertMessage.fieldNameText : "";

	if (validation) {
		if (!alert.length) {
			alert = $(`<div class="${alertClass.substring(1)} alert-validation hidden">
								<div class="bold">${alertMessage.boldText}${fieldNameText}.</div>
								<div>${alertMessage.text}</div>
							</div>`);
			alert.appendTo(container).slideDown();
		} else {
			alert.slideDown();
		}
	} else {
		alert.slideUp();
	}
}


/**
 * DUPLICATE ??
 * returns the date as string in the format yyyy-mm-dd, e.g. converts a JS date
 * of "Wed Oct 23 2024 20:57:06 GMT-0700 (Pacific Daylight Time)" to "2024-10-23"
 * if @utc is false (default), or "2024-10-24" if @utc is true.
 *
 * if the @datetime input is not a valid date an empty string if it is not a valid date
 *
 * @datetime a string, integer, or Date object, defaults to current timestamp
 * @localtz  if false (default) use the browser local time, otherwise use UTC Time Zone
 * @return   a string in the format yyyy-mm-dd or empty if the input is not valid

function getDateIso(datetime, localtz) {
	if (typeof datetime === "undefined")
		datetime = Date.now();
	if (typeof localtz === "undefined")
		localtz = false;
	var date = new Date(datetime);
	if (isNaN(date.getYear()))
		return "";
	if (localtz) {
		// use Swedish locale format [yyyy-mm-dd HH:nn:ss] and return the first part
		return date.toLocaleString("sv").split(' ')[0];
	}
	return date.toISOString().split('T')[0];
}
 */

/** lazy loads images with data-src attribute */
function lazyLoadImages() {
	var sleep  = 0;
	var images = $("img[data-src]");
	images.each(
		function(ix, el) {
			sleep += 125;
			setTimeout(
				function(){
					var $el = $(el);
					var src = $el.attr("data-src");
					$el.attr("src", src)
						.removeAttr("data-src");
				},
				sleep
			)
		}
	);
}


/**
 * returns an array of input elements that are marked with .no-emoji but do contain emjoi
 */
function findIllegalEmojis() {
	var result = [];
	$("input.no-emoji").each((ix, el) => {
		if (containsEmojis( $(el).val() ))
			result.push(el);
	});
	return result;
}

/**
 * returns a list of track numbers that share a common ISRC
 * or an empty array if all tracks have a unique ISRC
 */
function getDuplicateIsrcTracks() {

	var mapIsrcCodes = new Map();  // key=ISRC code, value=List of track indexes that use that code
	var isrcCode;
	var trackNum;
	var trackNumArray;

	// populate the ISRC/tracknum map from the ISRC form input controls
	var isrcInputs = $('input.isrc').filter((i, el) => !!el.value.trim());
	isrcInputs.each((ix, el) => {
		isrcCode = $(el).val();
		trackNum = $(el).attr('tracknum');

		if (!mapIsrcCodes.has(isrcCode))  {
			mapIsrcCodes.set(isrcCode, []);
		}

		trackNumArray = mapIsrcCodes.get(isrcCode);
		trackNumArray.push(trackNum);
	});

	// return any ISRC code that has more than one track
	var indexArray = [];
	mapIsrcCodes.forEach((value, key, map) => {
		if (value.length > 1) {
			indexArray = value;
		}
	});

	return indexArray;
}

/**
 * Shows warning message if given Isrc code is already used on the form
 */
function verifyIsrcCodeUnused(isrcInputElement) {

	// get all other ISRC values on the form
	var otherIsrcValues = new Set();
	var isrcInputs = $('input.isrc').filter((i, el) => !!el.value.trim());
	isrcInputs.each((ix, el) => {
		if (!el.isSameNode(isrcInputElement)) {
			otherIsrcValues.add($(el).val());
		}
	});

	var thisValue = isrcInputElement.value;
	var isrcWarningEl = $j(isrcInputElement).closest('.customIsrcRow').find('.isrcWarning');
	var isrcSmallTextEl = $j(isrcInputElement).closest('.customIsrcRow').find('.isrcTextUnderInput');

	// show/hide warning message depending on whether this ISRC has already been input elsewhere
	if (otherIsrcValues.has(thisValue)) {
		isrcSmallTextEl.slideUp('fast');
		isrcWarningEl.slideDown('fast');
	} else {
		isrcWarningEl.slideUp('fast');
		isrcSmallTextEl.slideDown('fast');
	}
}

function toggleSkipRequirementsWarning() {
    var checkbox = document.getElementById('skipRequirements');
    var warningText = document.getElementById('skipRequirementsWarningText');
    var warningIcon = document.getElementById('skipRequirementsWarningIcon');

    if (checkbox.checked) {
        // Add the warning class when the checkbox is checked
        warningText.classList.add('skipRequirementsWarningText');
		warningIcon.innerHTML = ' <i class="fa fa-exclamation-triangle"></i> ';
    } else {
        // Remove the warning class when unchecked
        warningText.classList.remove('skipRequirementsWarningText');
		warningIcon.innerHTML = '';
    }
}


/**
 *
 * @param {Selector} selector - input selector for checkbox type
 * @returns boolean true or false based on whether the input is checked
 */
function isCheckboxChecked(selector) {
	var $checkbox = $(selector);
	if ($checkbox.length === 0) {
		return false;
	}
	return $checkbox.is(":checked");
}

/**
 * Removes semicolons from a given string.
 *
 * @param {string} text - The input text to sanitize.
 * @returns {Object} - An object containing the sanitized text and a flag indicating whether a change occured.
 */
function removeSemicolons(text) {
	let modified = false;
	let sanitizedText = text;

	if (text.includes(';')) {
		sanitizedText = text.replaceAll(';', '');
		modified = true;
	}

	return { sanitizedText, modified };
}

/**
 * Removes HTML tags from the given string.
 *
 * @param {string} text - The input text to sanitize.
 * @returns {Object} - An object containing the sanitized text and a flag indicating whether a change occured.
 */
function removeHtml(text) {
	let modified = false;
	let sanitizedText = text;

	if (text.match(/(<([^>]+)>)/gi)) {
		sanitizedText = text.replace(/(<([^>]+)>)/gi, '');
		modified = true;
	}

	return { sanitizedText, modified };
}
// for remote use in release-preview.js
/**
 * Sanitizes an input field's value by removing HTML and/or semicolons based on the given options.
 * Triggers a change event after sanitization.
 *
 * @param {Selector} obj - jQuery selector for the input field.
 * @param {Object} [options] - Configuration options.
 * @param {boolean} [options.removeHtml=true] - Whether to remove HTML.
 * @param {boolean} [options.removeSemicolons=true] - Whether to remove semicolons.
 */
function sanitizeInput(obj, options = { removeHtml: true, removeSemicolons: true }) {
	let updatedValue = $(obj).val();

	if (options.removeHtml) {
		let result = removeHtml(updatedValue);
		updatedValue = result.sanitizedText;
		if (result.modified) {
			Swal.fire({ type: 'warning', text: "HTML isn't allowed in any metadata fields." });
		}
	}
	if (options.removeSemicolons) {
		let result = removeSemicolons(updatedValue);
		updatedValue = result.sanitizedText;
		if (result.modified) {
			Swal.fire({ type: 'warning', text: "Sorry, semicolons aren't allowed in any metadata fields. Please remove any and try again." });
		}
	}

	$(obj).val(updatedValue).change();
}

/**
 * Removes and hides all alerts on the artist bio section
 */
function resetAllArtistBioError() {
	$(".missing-alert").removeClass("missing-alert");
	$(".missing-bio-image-alert").hide();
	$(".missing-bio-info-alert").hide();
	return;
}

/**
 * Removes and hides all alerts on the additional credits section
 */
function resetAllAdditionalCreditsError() {
	$(".missing-alert").removeClass("missing-alert");
	$(".missing-credits-alert").hide();
	return;
}

/**
 *
 * @param {Selector} selector
 * @returns True if an element exists on the dom, and is visually available to the user
 */
function isElementShownToUser(selector) {
	return ($(selector).length && $(selector).css("display") !== "none" && $(selector).css("visibility") !== "hidden");
}

/**
 *
 * @returns Resets the status indicator on the additional requirements container to it's default
 */
function resetAdditionalRequirementsStatus() {
	$("#statusIndicator").removeClass("completed");
	$("#statusIndicator .fa").removeClass("fa-check-circle-o");
	$("#statusIndicator .fa").addClass("fa-exclamation-circle");
	$("#statusIndicator .status").text("Not yet complete");
	return;
}

// watch for changes on the song title preview and update release preview to match
function addReleasePreviewChangeListenerForFirstSongTitle() {
    const firstSongTitleDiv = $('.songTitlePreview[tracknum="1"]');

    const titleObserver = new MutationObserver(
        function(mutationList, observer) {
            if (howManyTracks() == 1) {
                var releaseTitle = mutationList[0].target.textContent;
                var previewTitleDiv = $('.rp-title');
                if (previewTitleDiv.length) {
                    previewTitleDiv.text(releaseTitle);
                }
            }
    });

    const titleObserverConfig =  { attributes: false, childList: true, characterData: true, subtree: false };
    titleObserver.observe(firstSongTitleDiv.get(0), titleObserverConfig);
}

// watch for changes on the song artist preview and update release preview to match
function addReleasePreviewChangeListenerForFirstSongArtist() {
    const firstSongArtistDiv = $('.songTitlePreviewSmall[tracknum="1"]');

    const artistObserver = new MutationObserver(
        function(mutationList, observer) {
            if (howManyTracks() == 1) {
                var releaseArtist = mutationList[0].target.textContent;
                var previewArtistDiv = $('.rp-artist-name');
                if (previewArtistDiv.length) {
                    previewArtistDiv.text(releaseArtist);
                }
            }
    });

    const artistObserverConfig =  { attributes: false, childList: true, characterData: true, subtree: false };
    artistObserver.observe(firstSongArtistDiv.get(0), artistObserverConfig);
}

function initializeReleasePreviewTitle(numTracks) {
	var previewTitle = '';
	var previewArtist = '';
	if (numTracks == 1) {
		previewTitle = $('.songTitlePreview[tracknum="1"]').text();
		previewArtist = $('.songTitlePreviewSmall[tracknum="1"]').text();
	}
	else {
		previewTitle = $('#albumTitleInput').val();
		previewArtist = $('#artistName').val();
	}

	previewTitle = (previewTitle) ? previewTitle : "Release Name";
	previewArtist = (previewArtist) ? previewArtist : "Artist Name";

	if ($('.rp-title').length) {
		$('.rp-title').text(previewTitle);
	}
	if ($('.rp-artist-name').length) {
		$('.rp-artist-name').text(previewArtist);
	}
}

// release preview title functions
function updatePreviewReleaseTitleFromAlbum(obj) {
	var releaseTitle = $(obj).val();
	releaseTitle = (releaseTitle) ? releaseTitle : "Release Name";
    var previewTitleDiv = $('.rp-title');
    if (previewTitleDiv.length) {
        previewTitleDiv.text(releaseTitle);
    }
}

// Release Preview Artist functions
function updatePreviewReleaseArtist(obj) {
    if (howManyTracks() > 1) {
	    var artistName = $(obj).val();
		artistName = (artistName) ? artistName : "Artist Name";
        var previewArtistDiv = $('.rp-artist-name');
        if (previewArtistDiv.length) {
            previewArtistDiv.text(artistName);
        }
    }
}

// Release Preview Label functions
function updatePreviewReleaseLabel(obj) {
	var labelName = $(obj).val();
	labelName = (labelName) ? labelName : "DistroKid.com";
	$('#rp-record-label-label-value').text(labelName);
	$('#rp-record-label-input').val(labelName)
}

// only attempt to call toggleArtistBio() if it exists
function updateArtistBioVisibility(showArtistBio) {
	if (typeof toggleArtistBio === "function") {
		toggleArtistBio(showArtistBio);
	}
}

/**
 * returns the date as string in the format yyyy-mm-dd, e.g. converts a JS date
 * of "Wed Oct 23 2024 20:57:06 GMT-0700 (Pacific Daylight Time)" to "2024-10-23"
 * if @utc is false (default), or "2024-10-24" if @utc is true.
 *
 * if the @datetime input is not a valid date an empty string if it is not a valid date
 *
 * @datetime a string, integer, or Date object, defaults to current timestamp
 * @localtz  if false (default) use the browser local time, otherwise use UTC Time Zone
 * @return   a string in the format yyyy-mm-dd or empty if the input is not valid
 */
function getDateIso(datetime, localtz) {

	if (typeof datetime === "undefined")
		datetime = Date.now();

	if (typeof localtz === "undefined")
		localtz = false;

	var date = new Date(datetime);
	if (isNaN(date.getYear()))
		return "";

	if (localtz) {
		// use Swedish locale format [yyyy-mm-dd HH:nn:ss] and return the first part
		return date.toLocaleString("sv").split(' ')[0];
	}

	return date.toISOString().split('T')[0];
}


/**
 * returns true if the Array contains an string, or if an Object contains a key, with the search being case insensitive
 *
 * @param haystack either an Array or an Object whose keys would be checked
 * @param needle   the item to search for
 */
function containsNoCase(haystack, needle) {

    var elements = $.isPlainObject(haystack) ? Object.keys(haystack) : haystack;

    if (!Array.isArray(elements))
        throw("Not an array");

    var lcNeedle = needle.toLowerCase();

    for (let e of elements) {
        if (e.toLowerCase() == lcNeedle)
            return true;
    }

    return false;
}

/**
 * Sends event to Kinesis
 *
 * @param {string} type - The event type, e.g. "discoblock-event"
 * @param {string} eventName - The name of event to be sent, e.g. "mobile-discoblock banner cta"
 * @param {string} action - The type of action, e.g. "click"
 * @param {string} notes - Optional notes to send, e.g. window.location.pathname
 * @param {Object} details - Optional extra details to send, should be an object
 */
function sendEventToKinesis(type, eventName, action, notes = "", details = null) {
	if (!type || !eventName || !action) {
		return;
	}

	const eventData = {
		type,
		eventName,
		action,
		notes
	};

	if (details && typeof details === 'object') {
		eventData.details = JSON.stringify(details);
	}

	fetch('/api/kinesisEvents/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams(eventData),
	}).catch(err => {
		console.error('sendEventToKinesis: Failed to send event', err);
	});
}


$(function(){

	lazyLoadImages();

	$j("a[data-user-event]").on("click", function(){
		var data = $j(this).data();
		logUserEvent(data.userEventPage, data.userEventSection, data.userEventAction, data.userEvent, '', data.userEventUserId, '', 0);
	});

	if (document.location.search.includes("lat=")) {
		var newQs = removeKeyFromQueryString(document.location.search, "lat");
		var newUrl = document.URL.split("?")[0] + newQs;
		console.log(newUrl);
		window.history.pushState(document.URL, 'DistroKid', newUrl);
	}

	/**
	 * To make an input no-emoji aware, add the no-emoji class to the input and alert-container to the alert container
	 * optionally add data-field-name attribute for better message to the user
	 *
	 * To make an input no-url aware, add the no-url class to the input and alert-container to the alert container
	 */
	$(document).on("change", "input.no-emoji, input.no-url", function(e){
		var $this = $(this);
		var container = $this.closest(".alert-container");
		var fieldName = $this.data("fieldName") || "";

		var hasEmojis = $this.closest(".alert-container")	// check all no-emoji fields in this alert-container
				.find(".no-emoji")
				.filter(function(ix, el){ return containsEmojis($(el).val()); })
				.length > 0;
		var noEmojiText = {
			boldText: "It looks like you're using an emoji",
			text: getEmojiWarningText(),
			fieldNameText: fieldName ? " in the " + fieldName : ""
		}

		var hasUrl = container.find(".no-url").filter(function (ix, el) { return checkForHttpUrl($(el).val()) }).length > 0;
		var artistTypeText = fieldName ? fieldName : "artist name";
		var noUrlText = {
			boldText: `URLs can&rsquo;t be used as the ${artistTypeText}`,
			text: `Streaming services don&rsquo;t allow URLs in the ${artistTypeText}, so you&rsquo;ll need to select a new name to upload your release.`
		}

		manageInlineValidationAlert(container, hasEmojis, ".alert-no-emoji", noEmojiText);
		manageInlineValidationAlert(container, hasUrl, ".alert-no-url", noUrlText);

		return false;	// prevent page jump
	});

}); // jQuery ready

;(function() {

    const onSmoothScrollClick = function(event) {
        event.preventDefault();
        const scrollToElement = event.target.closest('[data-scroll-to-element]').dataset.scrollToElement;
        document.querySelector(scrollToElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const setupEventHandlers = function() {

        // Adds smooth scroll functionality to all elements with a scroll-to-element data attribute
        document.querySelectorAll("[data-scroll-to-element]").forEach((elem) => {
            elem.addEventListener('click', onSmoothScrollClick);
        });

    }

    if(document.readyState !== "loading") {
        setupEventHandlers();
    }
    else {
        document.addEventListener("DOMContentLoaded", setupEventHandlers);
    }

})();
