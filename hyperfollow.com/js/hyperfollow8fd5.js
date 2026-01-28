"use strict";
/**
 * @namespace Hyperfollow
 */
$j(document).ready(function()
	{
	// var input = $j('#usernameChooser'); /* turning off autofocus, because it does weird things, esp in mobile */
	// input.focus();
	})

/**
 * @memberof Hyperfollow
 * @param {string} id 
 * @param {string} hash 
 */
function deleteOrRestoreThisPage2(id,hash)
	{
	sweetAlertConfirm('Hide page. Are you sure?','You can unhide it any time.',function()
		{
		deleteOrRestoreThisPageReally2(id,hash,'delete')
		},
		function(){},'warning','Hide','Don\'t hide','redbg');
	}

/**
 * Placeholder description of the deleteOrRestoreThisPageReally2 function
 * @memberof Hyperfollow
 * @param {string} id Description of id
 * @param {string} hash Description of hash parameter
 * @param {string} action Description of action parameter
 */
function deleteOrRestoreThisPageReally2(id,hash,action)
	{
	window.location.href = '/hyperfollow/hide/?version=2&id=' + id + '&stuff=' + hash + '&action=' + action;
 	}


function hfBioChange()
	{
	var maxLength = $j('#hfBio').prop('maxlength');
	var bio = $j('#hfBio').val();
	var bioLength = bio.length;
	$j('.hfBioChars').text(bioLength);
	if (bio.length >= maxLength-10)
		{
		$j('.hfBioCharsContainer').addClass('formSubLabelRed').removeClass('formSubLabel');
		}
	else 
		{
		$j('.hfBioCharsContainer').addClass('formSubLabel').removeClass('formSubLabelRed');
		}

	// bio = bio.substring(0, maxLength-1);
	// $j('#hfBio').val(bio);
	}
		
function hfOpenInNewTab()
	{
	var realUrl = hfRealUrl();
	window.open(realUrl.url, '_blank').focus();
	}

function hfCopyToClipboard()
	{
	var url = hfRealUrl().url;
	copyTextToClipboard(url);
	// $j('.hfCopy').val('Copied!');
	$j('.hfCopy').text('COPIED!');
	var myTimeout = setTimeout(function()
		{
		$j('.hfCopy').text('COPY ADDRESS');
		// $j('.hfCopy').val('Copy');
		}, 1250)
	}
	
function hfShowUsernameSpinner(action = true)
	{
	if (action == true)
		{
		if (!$j('#hfUsernameSpinner').is(':visible'))
			{
			$j('#hfUsernameWarning').text('');
			$j('#hfUsernameSpinner').show();
			}
		}
	else 
		{
		if ($j('#hfUsernameSpinner').is(':visible'))
			{
			$j('#hfUsernameSpinner').hide();
			}
		}
	}

function hfUsernameInputKeyDown(obj,e)
	{
	// click submit button 
	if ((e.which == 13) && $j('#hyperSignupButton:visible').length > 0)
		{
		$j('#hyperSignupButton:visible').click();
		}
	}
	
function usernameChooserInput(obj)
	{
	var username1 = $j('.usernameChooser:visible').val();
	var username2 = removeNonAlphaCharactersButDashesUnderscoresOkay(username1.trim());
	$j('.usernameChooser:visible').val(username2); // replace username with cleaned up version 

	// hide if blank 
	if (username2 == '')
		{
		hfShowUsernameSpinner(false);
		$j('#hfUsernameWarning').text('');
		return false 
		}

	// warning if unsupported chars 
	$j('#hfUsernameChars').html('');
	if (username1 != username2)
		{
		hfShowUsernameSpinner(false);
		$j('#hfUsernameChars').html('<span class=hfOrange><i class="hfSpinnerWidth fa fa-exclamation-triangle" aria-hidden="true"></i>Only letters, numbers & hyphens are allowed</span>').show();
		}

	// look up username
	hfLookupUsername(username2);
	}
	
function hfNewPageUsernameSpinner()
	{
	$j('#hfUsernameWarning').html('<i class="fa fa-cog fa-spin fa-fw gray"></i>');
	}
	
function hfLookupUsername(username)
	{

	// hide if blank 
	if (username == '')
		{
		$j('#hfUsernameWarning').text('');
		return false 
		}

	// abort existing lookup 
	if (typeof hfGetUsername != 'undefined')
		{
		hfGetUsername.abort(); 
		}

	var data = {};
	data.username = username;

	var hfGetUsername = $j.get('/api/hyperfollow/usernameCheck/',data,function(response)
		{
		hfShowUsernameSpinner(false);
		
		// hide if blank 
		if (username == '')
			{
			$j('#hfUsernameWarning').text('');
			return false 
			}

		if (response.available == true) 
			{
			$j('#hfUsernameWarning').html('<span class="hfGreen"><i class="hfSpinnerWidth fa fa-check-circle hfCheckIcon" aria-hidden="true"></i>Available</span>');
			}
		else 
			{
			$j('#hfUsernameWarning').html('<span class=hfOrange><i class="hfSpinnerWidth fa fa-times-circle hfTimesIcon" aria-hidden="true"></i>' + response.message + '</span>');
			}
		},'json')
	
	hfGetUsername.error(function(a,b,c)
		{
		hfShowUsernameSpinner(false);
		if (b != 'abort') // don't show error if we intentionally aborted the request 
			{
			debug(b);
			$j('#hfUsernameWarning').html('<span class=gray>Error looking up username</span>');
			}
		})
	}
	
function submitHyperfollowSignup()
	{
	var username = $j('.usernameChooser:visible').val().trim();
	var code = $j('#hfCode').val().trim();
	debug('signup button');
	
	if (username == '')
		{
		$j('.usernameChooser:visible').focus();
		sweetAlert('','Please choose a username','error');
		return false 
		}
	
	setCookie('hf_username',username);
	
	document.location.href = 'https://distrokid.com/hyperfollow/claim/?HF_USERNAME=' + username + '&hfcode=' + code;
	
	/*
	if (typeof me == 'undefined')
		{
		document.location.href = 'https://distrokid.com/signup/?app=hyperfollow&hf_username=' + username + '&hfcode=' + code;
		}
	else 
		{
		document.location.href = 'https://distrokid.com/hyperfollow/new/';
		}
	*/
	
	$j('#hyperSignupButton').val('Please wait...');
	}

// begin: init global vars 
var hfContent = {}
hfContent['links'] = [];
hfContent['socialmedia'] = [];
hfContent['audio'] = [];
hfContent['video'] = [];
hfContent['settings'] = {};
hfContent['settings']['pixels'] = {};
hfContent['settings']['pixels']['google'] = '';
hfContent['settings']['pixels']['facebook'] = '';
// end: init global vars 

function hfSaveButton()
	{
	var data = $("#page-data").data();
	data['main'] = {}
	data['links'] = []
	data['audio'] = []

	// get main content
	data['main']['domain'] = $j('#hfUrlDomain').text().trim();
	data['main']['username'] = hfRealUrl().username;
	data['main']['image'] = $j('#hfPrimaryImage').attr('src');
	data['main']['title'] = $j('#hfTitle').val().trim();
	data['main']['location'] = $j('#hfLocation').val().trim();
	data['main']['bio'] = $j('#hfBio').val().trim();
	data['main']['foo'] = 'bar';
	
	// artist? 	
	if ($j('#hfArtist').length > 0)
		{
		data['main']['artist'] = $j('#hfArtist').val().trim();
		}
		
	// albumIdShortcut?  	
	if ($j('#albumIdShortcut').length > 0)
		{
		data['main']['albumIdShortcut'] = $j('#albumIdShortcut').val().trim();
		}
	
	// begin: data validation 
	if (data['main']['username'] == '')
		{
		$j('.usernameChooser:visible').focus();
		sweetAlert('','Please choose a username','error');
		return false 
		}
	// end: data validation 
	
	// get links 
	$j('#hfLinksGoHere .hfThisIssaLink:visible').each(function()
		{
		var link = [];
		var section = $j(this).find('.hfSectionText').text().trim();
		if (section != '')
			{
			// is a section divider? 
			link['section'] = section;
			}
		else 
			{
			// is a link? 
			link['title'] = $j(this).find('.hfLinkTitle').text().trim();
			link['url'] = $j(this).find('a').attr('href');
			link['image'] = $j(this).find('.hfLinkBlob').attr('src');
			}
		data['links'].push(link);
		})

	// get audio 
	$j('#hfAudioGoHere .hfAudioParent:visible').each(function()
		{
		var link = [];
		link['audio'] = $j(this).data('blob');
		link['title'] = $j(this).find('.hfSongTitle').text().trim();
		link['filename_original'] = $j(this).find('.hfSongOriginalFilename').text().trim();
		data['audio'].push(link);
		})
		
	// get youtube
	if ($j('.youTubeEmbedPreview2').is(':visible'))
		{
		data['main']['youtube'] = $j('.youTubeEmbedPreview2').data('url').trim();
		}
	
	
	// start chain of events, to save everything
	hfChainOfEvents(data);
	}
	
function hfUsernameInput()
	{
	var element = $j('input.usernameChooser[type="text"]');
	var username = removeNonAlphaCharacters($j(element).val());
	hfNewPageUsernameSpinner();
	$j(element).val(username);
	var realUrl = hfRealUrl();
	$j('.hfRealUrl').text(realUrl.url);
	$j('.hfRealUrlLink').attr('href',realUrl.url);
	}
	
function hfRealUrl()
	{
	var returnStruct = {};
	returnStruct.username = '';
	var hfBaseUrl = $j('#hyperfollowSiteUrl');
	if (hfBaseUrl.length)
		{
		returnStruct.url = hfBaseUrl.val();
		if (!returnStruct.url.endsWith("/"))
			returnStruct.url += "/";
		}
	else 
		{
		returnStruct.url = 'https://hyperfollow.com/';
		}
	
	// begin: get root dir 
	if (typeof hfEdit != 'undefined')
		{
		returnStruct.username = hfEdit.page[0].username;
		}
	else if (typeof hfContent.saved != 'undefined')
		{
		returnStruct.username = hfContent.saved.username;
		}
	else if ($j('input.usernameChooser[type="text"]').length > 0)
		{
		returnStruct.username = $j('input.usernameChooser[type="text"]').val();
		}
	// end: get root dir 
	
	// begin: get subdir 
	var subpage = '';
	if (typeof hfEdit != 'undefined')
		{
		if (typeof hfEdit.page[0].albumidshortcut != 'undefined')
			{
			if (hfEdit.page[0].albumidshortcut != '')
				{
				var hfEditUrl = $j('#hyperfollowEditUrl');
				if (hfEditUrl.length)
					returnStruct.url = hfEditUrl.val() + 'hyperfollow/';
				else 
					returnStruct.url = 'https://distrokid.com/hyperfollow/';
				subpage = '/' + hfEdit.page[0].albumidshortcut;
				}
			}
		}
	// end: get subdir 
	
	// begin: put it all together 
	returnStruct.url = returnStruct.url.trim() + returnStruct.username.trim() + subpage.trim();
	// end: put it all together 
		
	return returnStruct
	}
	
function hideProgressModals()
	{
	hfStartScrolling();
	$j('.hfProgressModal').hide();
	}

function hfChainOfEvents(data)
	{
	// here we step through the chain of events, to save a page. 

	// SAVE AVATAR 
	hfProgressBar('Uploading avatar image...');
	uploadHyperfollowFile($j('#hfPrimaryImage').attr('src'),'image',function(response)
		{
		// SAVE PAGE METADATA (title, bio, etc) 
		data['artwork'] = response;
		$j('#hfPrimaryImage').attr('src','https://s3.amazonaws.com/gather.fandalism.com/' + response);
		hfProgressBar('Saving metadata...');
		hfSaveMetadata(data,function(responseFromMetadata)
			{
			// SAVE LINKS 
			data['pageId'] = responseFromMetadata.pageId;
			hfProgressBar('Saving links...');
			hfSaveLinks(data,function(responseFromLinks)
				{
				// SAVING SOCIAL MEDIA 
				hfProgressBar('Saving social media...');
				hfSaveSocialMedias(data,function()
					{
					// SAVING AUDIO
					hfProgressBar('Uploading audio...');
					hfSaveAudio(data,function()
						{
						hfProgressBar('Finalizing...');
						hideProgressModals();
						hfPageExitWarning(false);
						$j('.hfDoneButtonModal').show(); // woo, done! 
						hfUsernameInput(); // populates display link 
						$j('.username_inputContainer').hide();
						$j('.username_noneditable').show();
						// window.location.href = "/hyperfollow/new/?id=" + Number(hfContent.saved.pageId) + '#new';
						/*
						var urlFormWidth = $j('#hfCustomUrlFormContainer_editable').width();
						var realLink = 'https://hyperfollow.com/' + hfContent.saved.username;
						$j('.hfRealLink').attr('href',realLink);
						$j('.hfRealLink').text(realLink);
						$j('#hfCustomUrlFormContainer_editable').hide();
						$j('#hfCustomUrlFormContainer_noneditable').show();
						$j('#hfCustomUrlFormContainer_noneditable').css('max-width',urlFormWidth + 'px');
						$j('.hfUsernameWarningContainer').css('visibility','hidden');
						$j('#hfCustomUrlFormContainer_noneditable').css('width','100%');
						
						*/
						})
					});
				});
			});
		});
	}

function hfProgressBar(desc = '')
	{
	// begin: snapshot of original 
	if (typeof $j('.hfProgressModal').data('original') == 'undefined')
		{
		var myHtml = $j('.hfProgressModal').html();
		$j('.hfProgressModal').data('original',myHtml)
		}
	// end: snapshot of original 
	
	// begin: reset modal 
	var myHtml = $j('.hfProgressModal').data('original');
	$j('.hfProgressModal').html(myHtml);
	// end: reset modal 
	
	hfStopScrolling();
	$j('.hfProgressModalPercent').addClass('hfNoTransition').width('0%');
	$j('.hfProgressModal').show();
	$j('.hfProgressModalDescription').text(desc);
	}
			
function hfStopScrolling()
	{
	const scrollY = window.scrollY;
	$j('body').addClass('hfStopScrolling');
	document.body.style.top = '-' + scrollY + 'px';
	}

function hfStartScrolling()
	{
	const scrollY = document.body.style.top;
	$j('body').removeClass('hfStopScrolling');
	document.body.style.top = '';
	window.scrollBy(0, parseInt(scrollY || '0') * -1);
	}
	
function hfContinueEditing()
	{
	hfStartScrolling();
	$j('.hfDoneButtonModal').hide();
	// window.location.href = "/hyperfollow/new/?id=" + Number(hfContent.saved.pageId);
	}
	
function hfContentSettings()
	{
	hfContent['settings']['holidayCheer'] = $j('input[type="checkbox"]#holidayCheer:checked').length;
	return hfContent.settings
	}
	
function hfSaveLinks(data,callback)
	{
	var allLinks = [];
	
	// begin: no links? no problem. 
	if (hfNonDeletedCount(hfContent.links) == 0)
		{
		callback();
		return false 
		}
	// end: no links? no problem. 
	
	// hfProgressBar('Uploading link images',hfContent.links.length)
	
	$j(hfContent.links).each(function(count)
		{
		// upload link image 
		if (hfContent.links[count].deleted == false)
			{
			uploadHyperfollowFile(this.image,'image',function(response)
				{
				// debug('uploading file response:');
				// debug(response);
				// debug(this.image);
				// hfContent.links[count].filename = response;
				var linkData = {};
				linkData.image = response;
				linkData.href = hfContent.links[count].url;
				linkData.title = hfContent.links[count].title;
				linkData.sortOrder = $('#hfLinksGoHere').sortable('toArray').indexOf(String(count)); 

				// begin: replace blob with actual URL 
				hfContent.links[count].image = 'https://s3.amazonaws.com/gather.fandalism.com/' + response;
				// end: replace blob with actual URL 

				allLinks.push(linkData);
				if (allLinks.length == hfNonDeletedCount(hfContent.links))
					{
					var postData = {};
					postData['links'] = JSON.stringify(allLinks);
					postData['pageId'] = data.pageId;
					postData['session'] = data.session;
					$j.post('/api/hyperfollow/saveLinks/',postData,function(responseFromSave)
						{
						callback(responseFromSave);
						})
					}
				})
			}
		})
	}


function hfSaveAudio(data,callback)	{
	let allLinks = [];
	
	// begin: no audio? no problem.
	if (hfNonDeletedCount(hfContent.audio) == 0) {
		callback();
		return false 
	}
	// end: no audio? no problem.

	$j(hfContent.audio).each(function(count) {
		// upload audio 

		if (hfContent.audio[count].deleted == false) {
			uploadHyperfollowFile(this.blob,'audio',function(response) {
				if (response.error) {
					hideProgressModals();
					hfContent.audio[count].deleted = true;
					sweetAlert(`Upload audio [${hfContent.audio[count].title}] error!`,response.message,'error');
				}
				else {
					let linkData = response;
					linkData.title = hfContent.audio[count].title;
					linkData.filename_original = hfContent.audio[count].filename_original;
					linkData.sortOrder = $('#hfAudioGoHere').sortable('toArray').indexOf(String(count));
					// debug('response:');
					// debug(response);

					// begin: replace blob with actual URL
					hfContent.audio[count].blob = linkData.audio_streamable;
					hfContent.audio[count].file = linkData.audio_streamable;
					// end: replace blob with actual URL

					allLinks.push(linkData);
				}

				if (allLinks.length == hfNonDeletedCount(hfContent.audio)) {
					let postData = {};
					postData['audio'] = JSON.stringify(allLinks);
					postData['pageId'] = data.pageId;
					postData['session'] = data.session;
					$j.post('/api/hyperfollow/audio/saveMetadata/',postData,function(responseFromSave) {
						callback(responseFromSave);
					})
				}
			})
		}
	})
}
	
function hfNonDeletedCount(struct)
	{
	var count = 0;
	$j(struct).each(function()
		{
		if (this.deleted == false)
			{
			count++
			}
		})
	return count 
	}

function hfSaveSocialMedias(data,callback)
	{
	var allLinks = [];
	
	// begin: no social media? no problem. 
	if (hfNonDeletedCount(hfContent.socialmedia) == 0)
		{
		callback();
		return false 
		}
	// end: no social media? no problem. 
	
	$j(hfContent.socialmedia).each(function(count)
		{
		if (hfContent.socialmedia[count].deleted == false)
			{
			var linkData = {};
			linkData.service = hfContent.socialmedia[count].service;
			linkData.url = hfContent.socialmedia[count].url;
			linkData.sortOrder = $('#hfSocialMediaGoHere').sortable('toArray').indexOf(String(count)); 
			allLinks.push(linkData);
			if (allLinks.length == hfNonDeletedCount(hfContent.socialmedia))
				{
				var postData = {};
				postData['links'] = JSON.stringify(allLinks);
				postData['pageId'] = data.pageId;
				postData['session'] = data.session;
				$j.post('/api/hyperfollow/saveSocialMedia/',postData,function(responseFromSave)
					{
					callback(responseFromSave);
					})
				}
			}
		})
	}
	
function hfSaveMetadata(data,callback)
	{
	var metadata = {};
	metadata['settings'] = JSON.stringify(hfContent.settings);
	metadata['username'] = data['main']['username'];
	metadata['title'] = data['main']['title'];	
	metadata['location'] = data['main']['location'];	
	metadata['subtitle'] = '';	
	metadata['artwork'] = data['artwork'];	
	metadata['bio'] = data['main']['bio'];	
	metadata['youtubeUrl'] = data['main']['youtube'];	
	metadata['youtubeEmbed'] = data['main']['youtube'];
	metadata['session'] = data.session;
	if (typeof data['main']['artist'] != 'undefined')
		{
		metadata['artist'] = data['main']['artist'];	
		}

	if (typeof data['main']['albumIdShortcut'] != 'undefined')
		{
		metadata['albumIdShortcut'] = data['main']['albumIdShortcut'];	
		}
	
	var myPost = $j.post('/api/hyperfollow/savePage/',metadata,function(response)
		{
		if (response.error)
			{
			hideProgressModals();
			sweetAlert('',response.message,'error');
			}
		else 
			{
			hfContent['saved'] = {};
			hfContent['saved']['username'] = response.username;
			hfContent['saved']['pageId'] = response.pageId;
			callback(response);
			}
		},'json')

	myPost.error(function()
		{
		hideProgressModals();
		sweetAlert('','There was an error saving your page. Please try again.','error');
		})
	}
	
function hfOnKeydown(obj,event)
	{
	var croppieIsVisible = $j('#croppieModal').is(':visible');
	if ((event.which == 13) && (!croppieIsVisible))
		{
		$j('.hfDoneButton:visible').click();
		}
	else if ((event.which == 13) && (croppieIsVisible))
		{
		$j('.croppieDoneButton:visible').click();
		}
	}
	
function hfEditLink(index)
	{
	hfNewLink('open',true);
	var link = hfContent['links'][index];
	populateNewLinkForm(link.title, link.url, link.image, link.index);
	}
	
function hfEditSection(index)
	{
	hfModal('open','#newSectionModal',true);
	var link = hfContent['links'][index];
	populateNewSectionForm(link.title, link.url, link.image, link.index);
	}
	
function hfEditAudio(index)
	{
	hfModal('open','#newAudioModal',true);
	var audio = hfContent['audio'][index];
	populateNewAudioForm(audio.title, audio.blob, audio.file, audio.index);
	}
	
function hfEditSocialMedia(index)
	{
	hfModal('open','#newSocialMediaModal',true);
	var content = hfContent['socialmedia'][index];
	populateNewSocialMediaForm(content.service, content.url, content.index);
	}
	
function populateNewLinkForm(title, url, image, index)
	{
	if (typeof index == 'undefined')
		{
		index = '';
		}
		
	$j('#hfLinkTitle').val(title);			
	$j('#hfLinkUrl').val(url);			
	$j('#hfLinkPreview').attr('src',image);
	$j('#hfLinkIndex').val(index);
	}
	
function populateNewSectionForm(title, url, image, index)
	{
	if (typeof index == 'undefined')
		{
		index = '';
		}
		
	$j('#hfSectionTitle').val(title);			
	$j('#hfSectionIndex').val(index);
	}
	
function populateNewAudioForm(title, blob, file, index)
	{
	if (typeof index == 'undefined')
		{
		index = '';
		}
		
	$j('#hfAudioTitle').val(title);			
	$j('#audioFileInput').data('blob',blob);
	$j('#trackFilename').val(file);
	$j('#hfAudioIndex').val(index);
	}
	
function populateNewSocialMediaForm(service, url, index)
	{
	if (typeof index == 'undefined')
		{
		index = '';
		}
		
	$j('#hfSocialMediaService').val(service);			
	$j('#hfSocialMediaUrl').val(url);			
	$j('#hfSocialMediaIndex').val(index);
	}

function hfMoveToTop(index)
	{
	var parent = $j('.hfLinkParent[index=' + index + ']');
	var parentClone = parent.clone();
	parent.remove();
	$j('#hfLinksGoHere').prepend(parentClone);
	}
	
function hfDeleteLink(index)
	{
	sweetAlertConfirm('','Delete link. Are you sure?',function()
		{
		var parent = $j('.hfLinkParent[index=' + index + ']');
		hfContent.links[index].deleted = true;
		parent.slideUp(100,function()
			{
			addOrRemoveUpArrow();
			});
		},
		function(){},'warning','Delete','Don\'t hide','redbg');
	}
	
function hfDeleteAudio(index)
	{
	var parent = $j('.hfAudioParent[index=' + index + ']');
	hfContent.audio[index].deleted = true;
	parent.slideUp(100,function()
		{
		parent.remove();
		});
	}

function hfDeleteSocialMedia(index)
	{
	var parent = $j('.hfSocialMediaParent[index=' + index + ']');
	hfContent.socialmedia[index].deleted = true;
	parent.slideUp(100,function()
		{
		parent.remove();
		});
	}

function hfCheckAudioFile(input)
	{
	$j('#audioUploadError').hide();
	if (input.files && input.files[0]) 
		{
		var blob = input.files[0];
		var isAudioType = blob.type.split('/')[0] == 'audio';
		if (!isAudioType)
			{
			$j('#audioUploadError').text('Only valid audio files are allowed (.wav, .mp3, .flac, .aac)');
			$j(input).val('');
			$j('#audioUploadError').show();
			}
		else 
			{
			// read file into client-side memory 
			var reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = function() 
				{
				let base64String = reader.result;
				$j('#trackFilename').val(input.files[0].name); // save filename 
				$j(input).data('blob',base64String); // assign blob file to input 
				}
			}
		}
	}
	
function croppieUnfurledImage(url)
	{
	$('.croppieThumb').croppie('destroy');
	$j('.waitingForCroppieImage').removeClass('waitingForCroppieImage');
	$j('#hfLinkPreview').addClass('waitingForCroppieImage');
	var crop=$(".croppieThumb").croppie({
	enableExif:true,
	format: 'jpeg',
	enableOrientation:true,
	viewport:{width:200,height:200,type:"square"},
	boundary:{width:300,height:300},
	url:'/hyperfollow/new/imageProxy/?url=' + encodeURIComponent(url)
	});
	hfStartScrolling();
	hfModal('open','#croppieModal');
	}
	
function hfUrlInput()
	{
	$j('.unfurlSpinner').show();
	$j('#hfLinkPreviewContainer').hide();
	clearLinkUnfurledImage(false);
	hfClearModalErrors();
	}

function hfUploadThumb(input,target)
	{
	// debug(input.files[0]);
	// debug('hfUploadThumb()');
	
	$('.croppieThumb').croppie('destroy');
	var crop=$(".croppieThumb").croppie(
		{
		enableExif:true,
		enableOrientation:true,
		viewport:{width:200,height:200,type:"square"},
		boundary:{width:300,height:300}
		});
	
	if (input.files && input.files[0]) 
	{
	var fileExtension = input.files[0].name.split('.').pop();
	var reader = new FileReader();
	reader.onload = function (e) 
		{
		// begin: do stuff (https://github.com/Lxstr/Croppie-upload-demo/blob/master/demo/demo.js)
		$('.upload-demo').addClass('ready');
		crop.croppie('bind', 
		{
			url: e.target.result
			}).then(function () {
				console.log('jQuery bind complete');
				$j('#hfLinkFile').val('');
				crop.croppie('setZoom', 0);
		 	}).catch(hfCroppieError)
		}
		
		// begin: some client-side data validation 
		var blob = input.files[0];
		var isImageType = blob.type.split('/')[0] == 'image';
		if (!isImageType)
			{
			hfCroppieError();
			return false 
			}
		// end: some client-side data validation 
		
		reader.readAsDataURL(input.files[0]);
		} else {
			sweetAlert('',"Sorry, please upgrade your browser to a later version. Your current browser doesn't support the FileReader API.",'error');
		}
	// end: do stuff 
			
	// begin: set up target 
	$j('.waitingForCroppieImage').removeClass('waitingForCroppieImage');
	$j(target).addClass('waitingForCroppieImage');
	$j(target).data('fileinfo',input.files[0]);
	// end: set up target 

	hfModal('open','#croppieModal');
	}
	
function hfCroppieError()
	{
	hfModal('close','#croppieModal');
	$j('input[type="file"]:visible').val('');
	if ($j('#newLinkModal').is(':visible'))
		{
		$j('#hfLinkError').show().text('Sorry, only image files are allowed (and must end with .jpg, .png, or .gif)');
		}
	else 
		{
		sweetAlert('','Sorry, only image files are allowed (and must end with .jpg, .png, or .gif)','error');
		}
	}
	
function putDefaultLinkPreview()
	{
	var defaultSrc = $j('#hfLinkPreview').attr('defaultSrc');
	$j('#hfLinkPreview').attr('src',defaultSrc);
	}
	
function clearLinkUnfurledImage(stopSpinner)
	{
	if (stopSpinner)
		{
		$j('.unfurlSpinner').hide();
		$j('#hfLinkPreviewContainer').show();
		}
	putDefaultLinkPreview();
	}
	
function hfAddAudio(filename_original,title,file,blob,index)
	{
	if (typeof index == 'undefined')
		{
		index = '';
		}
		
	if (typeof hfContent['audio'] == 'undefined')
		{
		hfContent['audio'] = []; // global variable 
		}

	var thisAudio = {};
	thisAudio['filename_original'] = filename_original;
	thisAudio['title'] = title;
	thisAudio['file'] = file;
	thisAudio['blob'] = blob;
	thisAudio['deleted'] = false;

	// begin: append or replace? 
	if (index == '') // no index? this is a new audio, so let's append.
		{
		var action = 'append';
		thisAudio['index'] = Number(hfContent['audio'].length);
		hfContent['audio'].push(thisAudio);
		}
	else // has an index? this an an edit, so let's replace 
		{
		var action = 'replace';
		thisAudio['index'] = Number(index);
		hfContent['audio'][index] = thisAudio;
		}
	// end: append or replace? 

	// begin: prepare template  
	var template = $j('#newAudioTemplate').html();
	template = template.replace(/\[title\]/gi, thisAudio['title']);
	// template = template.replace(/\[file\]/gi, thisAudio['file']);
	template = template.replace(/\[file\]/gi, thisAudio['filename_original']);
	template = template.replace(/\[index\]/gi, thisAudio['index']);
	// end: prepare template  

	// begin: append or replace?
	if (action == 'append')
		{
		$j('#hfAudioGoHere').append(template);
		$j('#hfAudioGoHere li').last().data('blob',blob); // attach blob
		}
	else 
		{
		$j('.hfAudioParent[index=' + index + ']').replaceWith(template);
		$j('.hfAudioParent[index=' + index + ']').data('blob',blob); // attach blob
		}
	// end: append or replace? 
	}
	
function hfAddSocialMedia(service,url,index, faClass)
	{

	if (typeof index == 'undefined')
		{
		index = '';
		}
		
	var thisSocialMedia = {};
	thisSocialMedia['service'] = service;
	thisSocialMedia['url'] = url;
	thisSocialMedia['url_pretty'] = removeHttp(url);
	thisSocialMedia['deleted'] = false;
	thisSocialMedia['faClass'] = faClass;

	// begin: append or replace? 
	if (index == '') // no index? this is a new audio, so let's append.
		{
		var action = 'append';
		thisSocialMedia['index'] = Number(hfContent['socialmedia'].length);
		hfContent['socialmedia'].push(thisSocialMedia);
		}
	else // has an index? this an an edit, so let's replace 
		{
		var action = 'replace';
		thisSocialMedia['index'] = Number(index);
		hfContent['socialmedia'][index] = thisSocialMedia;
		}
	// end: append or replace? 

	// begin: prepare template  
	var template = $j('#newSocialMediaTemplate').html();
	template = template.replace(/\[service\]/gi, thisSocialMedia['service']);
	template = template.replace(/\[image\]/gi, thisSocialMedia['service'].toLowerCase());
	template = template.replace(/\[url\]/gi, thisSocialMedia['url']);
	template = template.replace(/\[url_pretty\]/gi, thisSocialMedia['url_pretty']);
	template = template.replace(/\[index\]/gi, thisSocialMedia['index']);
	template = template.replace(/\[faClass\]/gi, thisSocialMedia['faClass']);
	// end: prepare template  

	// begin: append or replace?
	if (action == 'append')
		{
		$j('#hfSocialMediaGoHere').append(template);
		}
	else 
		{
		$j('.hfSocialMediaParent[index=' + index + ']').replaceWith(template);
		}
	// end: append or replace? 
	}
	
function hfPixelTrash(obj)
	{
	var service = $(obj).attr('service');
	
	hfContent.settings.pixels[service] = '';
	$j('.hfPixelPillContainer[service="' + service + '"]').hide();
	}

function hfAddPixels(content)
	{
	hfContent['settings']['pixels'] = {};
	hfContent['settings']['pixels']['google'] = content.google.trim(); 
	hfContent['settings']['pixels']['facebook'] = content.facebook.trim(); 

	// begin: draw template 
	var template = $j('#newPixelsTemplate').html();	
	template = template.replace(/\[pixel_google\]/gi, hfContent['settings']['pixels']['google']);
	template = template.replace(/\[pixel_facebook\]/gi, hfContent['settings']['pixels']['facebook']);
	$j('#hfPixelsGoHere').html(template);
	// end: draw template
	
	// begin: hide empty ones
	$j('.hfPixelPillContainer').show();
	if (hfContent['settings']['pixels']['google'] == '')
		{
		$j('.hfPixelPillContainer[service="google"]').hide(); 
		}

	if (hfContent['settings']['pixels']['facebook'] == '')
		{
		$j('.hfPixelPillContainer[service="facebook"]').hide(); 
		}
	// end: hide empty ones 
	
	}
	
function hfAddLink(url,title,image,index)
	{
	if (typeof hfContent['links'] == 'undefined')
		{
		hfContent['links'] = []; // global variable 
		}
		
	var thisLink = {};
	thisLink['title'] = title;
	thisLink['url'] = url;
	thisLink['url_pretty'] = removeHttp(url);
	thisLink['image'] = image;
	thisLink['deleted'] = false;
	
	// begin: append or replace? 
	if (index == '') // no index? this is a new link, so let's append.
		{
		var action = 'append';
		thisLink['index'] = Number(hfContent['links'].length);
		hfContent['links'].push(thisLink);
		}
	else // has an index? this an an edit, so let's replace 
		{
		var action = 'replace';
		thisLink['index'] = Number(index);
		hfContent['links'][index] = thisLink;
		}
	// end: append or replace? 
	
	// begin: prepare template 
	if ((url == '') && (image == ''))
		{
		var template = $j('#newSectionTemplate').html();		
		}
	else 
		{
		var template = $j('#newLinkTemplate').html();		
		}
		
	template = template.replace(/\[title\]/gi, thisLink['title']);
	template = template.replace(/\[url\]/gi, thisLink['url']);
	template = template.replace(/\[url_pretty\]/gi, thisLink['url_pretty']);
	template = template.replace(/\[image\]/gi, thisLink['image']);
	template = template.replace(/\[index\]/gi, thisLink['index']);
	template = template.replace(/\[faClass\]/gi, thisLink['faClass']);
	// end: prepare template  
	
	// begin: append or replace?
	if (action == 'append')
		{
		$j('#hfLinksGoHere').append(template);
		}
	else 
		{
		$j('.hfLinkParent[index=' + index + ']').replaceWith(template);
		}
	// end: append or replace? 
	
	// begin: show "move to top" link?
	addOrRemoveUpArrow();
	// end: show "move to top" link?
	}
	
function addOrRemoveUpArrow()
	{
	if ($j('.hfLinkParent:visible').length >= 5)
		{
		$j('.moveUpArrow').show();
		}
	else 
		{
		$j('.moveUpArrow').hide();
		}
	}

function hfUnfurlLinkUrl()
	{
	var data = {};
	data.url = $j('#hfLinkUrl').val();
	
	if (!isValidUrl(data.url))
		{
		clearLinkUnfurledImage(true);
		}
	else 
		{
		var myGet = $j.get('/api/unfurl/',data,function(response)
			{
			if (typeof response.image == 'undefined')
				{
				response.image = '';
				}
			if ( response.isLocal )
				{
					// response.image = location.origin + response.image; // this doesn't work locally
					response.image = "https://distrokid.com" + response.image;
				}
			if (!isValidUrl(response.image))
				{
				clearLinkUnfurledImage(true);
				}
			else
				{
				$j('.unfurlSpinner').hide();
				// $j('#hfLinkPreview').attr('src',response.image);
				// alert(response.image);
				croppieUnfurledImage(response.image);
				$j('.unfurlSpinner').hide();
				$j('#hfLinkPreviewContainer').show()
				}
			},'json');
		
		myGet.error(function()
			{
			clearLinkUnfurledImage(true);
			})
		}
	}
	
function hfSaveThumb()
	{
	$(".croppieThumb").croppie('result', {
			type: 'canvas',
			quality: .7,
			format: 'jpeg',
			size: 'original'
		}).then(function (newUrl) {
			// hfNewLink('open',false);
			$j('.waitingForCroppieImage').attr('src', newUrl);
			$j('.waitingForCroppieImage').removeClass('waitingForCroppieImage');
			hfModal('close','#croppieModal');
			// alert(newUrl);
			// https://helpx.adobe.com/coldfusion/cfml-reference/coldfusion-functions/functions-h-im/imagereadbase64.html
			// popupResult({
			// 	src: resp
			// });
		});
	}
	
function removeYouTubeVideo()
	{
	hfContent['video'][0] = [];
	$j('.youTubePreview2').hide();
	$j('#addYouTube').show();
	$j('#removeYouTube').hide();
	}

function hfSaveYouTube()
	{
	var url = $j('#youTubeEmbedInput').val().trim();
	var preview = $j('.youTubeEmbedPreview').attr('src');
	$j('.hfYouTubeError').hide();
	if ((url == '') || (preview == ''))
		{
		$j('.hfYouTubeError').show();
		return false 
		}
	$j('.youTubeEmbedPreview2').attr('src',preview);
	$j('.youTubeEmbedPreview2').data('url',url);
	$j('.youTubePreview2').show();
	hfContent['video'][0] = url;
	hfModal('close','#newYouTubeModal');
	$j('#addYouTube').hide();
	$j('#removeYouTube').show();
	}
	
function hfSaveSection()
	{
	var title = $j('#hfSectionTitle').val().trim();
	var index = $j('#hfSectionIndex').val();
	hfAddLink('',title,'',index);
	initNewLink();
	hfModal('close','#newSectionModal');
	}
	
function hfClearModalErrors()
	{
	$j('.hfModalError').hide().text('');
	}

function initNewLink()
	{
	$j('.hfModalInput').val('');
	putDefaultLinkPreview();
	}

function hfSaveLink()
	{
	var url = $j('#hfLinkUrl').val().trim();	
	var title = $j('#hfLinkTitle').val().trim();	
	var image = $j('#hfLinkPreview').attr('src').trim();
	var index = $j('#hfLinkIndex').val();
	
	// append http if missing 
	if (!/^https?:\/\//i.test(url))
		{
	    url = 'http://' + url;
		}
	
	// begin: defaults 
	if (title == '')
		{
		title = 'Untitled link';
		}

	if (image == '')
		{
		image = 'https://s3.amazonaws.com/gather.fandalism.com/hfLink.png';
		}
	// end: defaults 
	
	// begin: data validation 
	if (url == ''){
		$j('#hfLinkError').show().text('Please enter a website address ("URL")');
		return false;
	}
	else if (!isValidUrl(url)){
		$j('#hfLinkError').show().text('The URL you entered isn\'t a valid website address');
		return false;
	}
	else if (url.length > 500){
		$j('#hfLinkError').show().text('The URL you entered is too long');
		return false;
	}
	// end: data validation 
	
	hfAddLink(url,title,image,index);
	initNewLink();
	hfNewLink('close');
	
	}
	
function hfModalInit()
	{
	// begin: init 
	hfStartScrolling();
	$j('.hfIssaModal').hide();
	// close: init 
	}
	
function hfNewLink(action,initForm)
	{
	hfModalInit();
	$j('.hfModalError').hide();
	
	if (typeof initForm == 'undefined')
		{
		initForm = true;
		}
	
	if (initForm)
		{
		initNewLink();
		}
		
	if (action == 'open')
		{
		hfModal('open','#newLinkModal');
		}
	}
	
function hfModal(action,element,reset)
	{
	if (reset)
		{
		$j('.hfModalInput').val('');
		}
		
	if (action == 'open')
		{
		hfStopScrolling();
		$j(element).css('display','flex');
		$j(element).find('input[focus="true"]:visible').first().focus();

		}
	else 
		{
		$j('.hfModalError').hide();
		$j(element).hide();
		hfStartScrolling();
		}
	}

function youtubeEmbed()
	{
	$j('.youtubeEmbed').toggle();
	}

function hfAddAudioPlayer()
	{
	$j('.addAudioPlayer').toggle();
	}
	
function hyperfollowSaveAudio()
{
// do data validation.... then:
// uploadHyperfollowAudio();
var title = $j('#hfAudioTitle').val().trim();	
var file = $j('#trackFilename').val();
var filename_original = $j('#trackFilename').val();
var blob = $j('#audioFileInput').data('blob');
var index = $j('#hfAudioIndex').val();

// begin: data validation 
if (title == '')
	{
	$j('#audioUploadError').text('Please enter a track title');
	$j('#audioUploadError').show();
	return false 
	}
else if (file == '')
	{
	$j('#audioUploadError').text('Please select an audio file (WAV, MP3, or similar)');
	$j('#audioUploadError').show();
	return false 
	}
// end: data validation 

hfAddAudio(filename_original,title,file,blob,index);
hfModal('close','#newAudioModal',true);
}

function hyperfollowSavePixel()
	{
	var content = {};
	content.facebook = $j('#hfPixelFacebook:visible').val().trim();
	content.google = $j('#hfPixelGoogle:visible').val().trim();
	hfAddPixels(content);
	hfModal('close','#newPixelModal',false);
	}

function hfSaveSocialMedia(){
	var selectedOption = $j('#hfSocialMediaService option:selected'); 
	var service = selectedOption.val().trim();
	var faClass = selectedOption.data('fa-classs'); // Get the data attribute
	var url = $j('#hfSocialMediaUrl').val().trim();
	var index = $j('#hfSocialMediaIndex').val();

	// begin: data validation 
	if (service == ''){
		$j('#hfSocialMediaError').text('Please select a service').show();
		return false;
	}
	
	if (url == ''){
		$j('#hfSocialMediaError').text('Please add your social media web address (URL)').show();
		return false;
	}
	// end: data validation 

	// append https if missing 
	if (!/^https?:\/\//i.test(url)){
		url = 'https://' + url;
	}
	hfAddSocialMedia(service,url,index, faClass);
	hfModal('close','#newSocialMediaModal',true);
}

function hfUploadFailed()
{
debug('slapsUploadFailed()');
}

function hfUploadCancelled()
{
debug('slapsUploadCancelled()');
}

function hfUploadProgress(evt)
	{
	if (evt.lengthComputable) {
		var percentComplete = (evt.loaded * 100 / evt.total).toFixed(2);
		var distroBytesLoaded = evt.loaded;
		var distroBytesTotal = evt.total;
		// debug(evt);
		$j('.hfProgressModalPercent').css('width',percentComplete + '%');
		$j('.vizyUploadComplete').show();
		$j('.newAudioProgressBar').css('width',percentComplete + '%');
		// debug(percentComplete);
	}
	else {
	  $j('.progressNumber').eq(distroUploadFileNum).html('unable to compute');
	}
}

function base64UrltoBlob(base64Data, contentType) {

	base64Data = base64Data.split(',').pop(); // converts base64url to base64 
	
	contentType = contentType || '';
	var sliceSize = 1024;
	var byteCharacters = atob(base64Data);
	var bytesLength = byteCharacters.length;
	var slicesCount = Math.ceil(bytesLength / sliceSize);
	var byteArrays = new Array(slicesCount);
	
	for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
	    var begin = sliceIndex * sliceSize;
	    var end = Math.min(begin + sliceSize, bytesLength);
	
	    var bytes = new Array(end - begin);
	    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
	        bytes[i] = byteCharacters[offset].charCodeAt(0);
	    }
	    byteArrays[sliceIndex] = new Uint8Array(bytes);
	}
	return new Blob(byteArrays, { type: contentType });
}

function uploadHyperfollowFile(element,type = 'audio',callback)
	{
	
	debug('uploadHyperfollowFile:');

	
	// begin: skip uploading 
	// example: if file is already uploaded (it's a URL, as usually seen when editing a HyperFollow page) 
	if (element == '')
		{
		callback('');
		return false 
		}
	else if (type == 'audio' && isValidUrl(element))
		{
		hfAudioFileComplete(element,callback);
		return false 
		}
	else if (type != 'audio' && isValidUrl(element)) 
		{
		var urlSplit = element.split('/');
		var filename = urlSplit[urlSplit.length-1];
		callback(filename);
		return false 
		}
	// end: skip uploading 
	
	var xhr = GetXmlHttpObject();
	// var file = $j('#audioFileInput').filter(':visible').eq(0)[0].files[0];
	var file = base64UrltoBlob(element,type); // convert base64 to binary 
	var fd = new FormData();
	// var key = "hyperfollow-" + me.id + "_" + (new Date).getTime() + '_' + removeNonAlphaCharacters(file.name);
	var key = "hyperfollow-blob_" + type + "_" + me.id + "_" + randomString() + '_' + (new Date).getTime();
	
	// add jpg extension 
	if (type == 'image')
		{
		key = key + '.jpg';
		}
	else 
		{
		// wish we easily knew the audio file extension here 
		// key = key + $j(element).data('fileinfo').name;
		}
		
	$j('#trackFilename').val(key);
	fd.append('key', key);
	fd.append('acl', 'public-read');
	fd.append('Content-Type', file.type);
	fd.append('AWSAccessKeyId', distroJavascriptVars.accessKeyId); // saved in s3s[...].cfm
	fd.append('policy', distroJavascriptVars.PolicyBase64);
	fd.append('signature',distroJavascriptVars.signature);
	
	fd.append("file",file);

	// https://stackoverflow.com/questions/6728750/html5-file-uploading-with-multiple-progress-bars
	xhr.upload.addEventListener("loadstart", function(e){
        // generate unique id for progress bars. This is important because we'll use it on progress event for modifications
        this.progressId = "progress_" + uuid(); 
		var template = $j('#hfPercentTemplate').html();
		$j('.hfProgressPageInner').append(template);
		$j('.hfProgressModalPercent').last().attr('id',this.progressId);
        // append progress elements to somewhere you want
        // $("body").append('<div id="' + this.progressId + '" class="myCustomProgressBar" ></div>');
    });
    	   
    //xhr.upload.addEventListener("progress", hfUploadProgress, false);

    xhr.upload.addEventListener("progress", function(e){
        var total = e.total;
        var loaded = e.loaded;
        var percent = (100 / total) * loaded; // Calculate percentage of loaded data

        // I animate progress object. Notice that i use "this.progressId" which i created on loadstart event.
		$j('#' + this.progressId).css('width',percent + '%');
        // debug(this.progressId);
        // debug(percent);
    });

    //xhr.addEventListener("load", uploadComplete, false);
    xhr.addEventListener("error", hfUploadFailed, false);
    xhr.addEventListener("abort", hfUploadCancelled, false);
	xhr.onreadystatechange = function() {
		// debug('xhr.readyState: ' + xhr.readyState);
		if (xhr.readyState == 4) {
			// debug('xhr.status: ' + xhr.status);
			if ((xhr.status != 200) && (xhr.status != 204)) {
				// debug('error xhr:');
				// debug(xhr);
				uploadFailed();
				if ($j(xhr.responseXML).find('Message').length > 0) {
					alert($j(xhr.responseXML).find('Message').text());
				}
				// removehtml(xmlToString($j(foo).find('Message')[0]))

				logError("upload failed", {
					"filename"     : key              || null,
					"readyState"   : xhr.readyState   || null,
					"response"     : xhr.response     || null,
					"responseText" : xhr.responseText || null,
					"responseType" : xhr.responseType || null,
					"responseURL"  : xhr.responseURL  || null,
					"responseXML"  : xhr.responseXML  || null,
					"statusText"   : xhr.statusText   || null,
					"status"       : xhr.status       || null,
					"timeout"      : xhr.timeout      || null
				});
			}
			else {
				// debug('That worked, file uploaded: ' + key);
				if (type == 'audio')
					{
					hfAudioFileComplete(key,callback);
					debug('key:');
					debug(key);
					}
				else 
					{
					// $j(element).attr('src',key);
					callback(key);
					}
			}
		}
	};

    xhr.open('POST', '//s3.amazonaws.com/' + distroJavascriptVars.BucketName + '/', true); //MUST BE LAST LINE BEFORE YOU SEND

	// debug('sending xhr');
    xhr.send(fd);
}

function hfAudioFileComplete(filename,callback)
	{
	var data = {};
	data.filename = filename;
	// debug('data:');
	// debug(data);

	// begin: editing 
	if (isValidUrl(filename))
		{
		// begin: remove path 
		var urlSplit = filename.split('/');
		var filename = urlSplit[urlSplit.length-1];
		// end: remove path 

		// some data validation & sorta security 
		var returnStruct = {};
		returnStruct['audio_original'] = filename;
		
		if (urlSplit[4] == 'hyperfollow') // related to old auto-generated previews versus new ones 
			{
			returnStruct['audio_streamable'] = 'https://s3.amazonaws.com/audio.distrokid.com/hyperfollow/' + filename;
			}
		else 
			{
			returnStruct['audio_streamable'] = 'https://s3.amazonaws.com/audio.distrokid.com/' + filename;
			}
			
		returnStruct['audio_streamable_domain'] = 'https://s3.amazonaws.com/audio.distrokid.com';
		// some data validation & sorta security 
		
		// debug('static returnStruct');
		// debug(returnStruct);
		callback(returnStruct);
		return false
		}
	// end: editing 

	$j.post('/api/hyperfollow/audio/saveFile/',data,function(response)
		{
		// debug('dynamic returnStruct:');
		// debug(response);
		callback(response);
		},'json')
	}
	
function hfGetYouTubeEmbed(myUrl,callback)
	{
	$j('.hfYouTubeSpinner').show();
	var myGet = $j.getJSON("//www.youtube.com/oembed?",
		    {"format": "json", "url": myUrl}, function (data)
			{
			$j('.hfYouTubeSpinner').hide();
			if ((typeof data.error != "undefined") || (data.provider_name != 'YouTube'))
				{
				sweetAlert('Problem with YouTube Embed','That\'s not a valid YouTube video URL. Please try again.','warning');
				return false 				
				}
			else 
				{
				$j('.youTubeEmbedPreview').attr('src',data.thumbnail_url);
				$j('.youTubePreview').show();
				if (typeof callback != 'undefined')
					{
					callback(data);
					}
				return true 
				}
			});
	myGet.error(function()
		{
		// ex: https://www.youtube.com/watch?v=TgUXP63yWkc 
		$j('.hfYouTubeSpinner').hide();
		debug('Either rhat\'s not a valid YouTube URL, or the owner has disallowed embeds. Please try again.');
		return false 				
		})
	}
	
function checkYouTubeEmbed()
	{
	debug('checkYouTubeEmebed()');
	$j('.youTubePreview').hide();
	$j('.hfYouTubeError').hide();
	$j('.youTubeEmbedPreview').attr('src','');
	var myUrl = $j('.youTubeEmbed').val().trim();
	if (myUrl == '')
		{
		return true 
		}
	// example: /* myUrl = 'http://www.youtube.com/watch?v=bDOYN-6gdRE'; */
	hfGetYouTubeEmbed(myUrl);
	}
	
function enableSectionDrag()
	{
	debug('enable section drag');
	$j('.hfLinkParentTraditionalLink').addClass('child');
	// $( "#hfLinksGoHere" ).sortable({ axis: 'y',handle: '.hfLinkHandle,.dragAll',change: hfSortableChange});
	}
	
function hfPageExitWarning(enable = true)
	{
	if (enable)
		{
		window.onbeforeunload = confirmOnPageExit;
		}
	else 
		{
		window.onbeforeunload = null;
		}
	}
	
function hfSortableChange()
	{
	hfPageExitWarning(true);
	}
	
$j(document).ready(function()
	{
	// set throttle, so we don't hit the api too much 
	$j('#hfLinkUrl').on('input', function(){
		callOnce(hfUnfurlLinkUrl, 300);
	});

	// listen for esc key, to close modals 
	$(document).keydown(function(e) {
	     if (e.key === "Escape") { // escape key maps to keycode `27`
	        hfModalInit();
	    }
	});
	
	// listen for clicking outside of a modal, to close the modal 
	$('.hfIssaModalInner, #addLinkButton').on('clickout',function(){ // 
		if ($j('.hfIssaModalInner').is(':visible')) 
			{
			hfModalInit();
			}
	});
	
	// enable drag & drop sorting
	// $( "#hfLinksGoHere").multisortable();
	$( "#hfLinksGoHere" ).sortable({ axis: 'y',handle: '.hfLinkHandle,.dragAll',change: hfSortableChange});
	$( "#hfAudioGoHere" ).sortable({ axis: 'y',handle: '.hfAudioHandle',change: hfSortableChange});
	$( "#hfSocialMediaGoHere" ).sortable({ axis: 'y',handle: '.hfSocialMediaHandle',change: hfSortableChange});
	// $( "#hfLinksGoHere" ).disableSelection(); // in jquery example, but seems unecessary 

	hfContentSettings(); // initializes some vars 
	})

