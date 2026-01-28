/**
 * @namespace Header
 */
$j = jQuery;
window.dkDataLayer = window.dkDataLayer || [];


// Polyfills - for older browsers that dont have the cool stuff

	/**
	 * String.prototype.replaceAll() polyfill
	 * https://vanillajstoolkit.com/polyfills/stringreplaceall/
	 * https://gomakethings.com/how-to-replace-a-section-of-a-string-with-another-one-with-vanilla-js/
	 * @author Chris Ferdinandi
	 * @license MIT
	 */

	if (!String.prototype.replaceAll) {
		String.prototype.replaceAll = function(str, newStr){

			// If a regex pattern
			if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
				return this.replace(str, newStr);
			}

			// If a string
			return this.replace(new RegExp(str, 'g'), newStr);

		};
	}




// begin: language detection
// usage: languageDetection['hebrew'].test('test')
languageDetection = []
languageDetection['Hebrew'] = new RegExp("^[\u0590-\u05FF0-9\ ]+$");
// end: language detection

$j.fn.findNextAll = function( selector ){
  var that = this[ 0 ],
    selection = $j( selector ).get();
  return this.pushStack(
    !that && selection || $j.grep( selection, function(n){
       return that.compareDocumentPosition(n) & (1<<2);
       // if you are looking for previous elements it should be & (1<<1);
    })
  );
}
$j.fn.findNext = function( selector ){
  return this.pushStack( this.findNextAll( selector ).first() );
}

jQuery.fn.extend({ // auto-resize textareas. usage: $('textarea').autoHeight()
  autoHeight: function () {
    function autoHeight_(element) {
      return jQuery(element)
        .css({ 'height': 'auto', 'overflow-y': 'hidden' })
        .height(element.scrollHeight);
    }
    return this.each(function() {
      autoHeight_(this).on('input', function() {
        autoHeight_(this);
      });
    });
  }
});

/**
 * Counts the number of sets of parentheces in a string
 * @function containsParens
 * @memberOf Header
 * @param {string} str
 * @returns {number} Number of sets of parentheces in String str
 */
function containsParens(str) // returns integer of how many sets of parens in string (0 or more)
	{
	if (typeof str == 'undefined')
		{
		return 0
		}

	parensMatch = str.match(/\((.*?)\)/g);
	if (!parensMatch)
		{
		parensMatch = [];
		}
	return parensMatch.length
	}

function arrayRemoveDuplicates(a) {
	if (typeof a == 'undefined')
		{
		return []
		}
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

function minutesSecondsFormatted(seconds,decimalPlaces)
	{
	var decimalPlaces = decimalPlaces || 0;
	var minSec = secondsToMinutesAndSeconds(seconds);

	if (decimalPlaces == 0)
		{
		ret = (minSec.minutes + ':' + padString(toFixedDecimalPlaces(minSec.seconds,0),2))
		}
	else
		{
		ret = (minSec.minutes + ':' + padString(toFixedDecimalPlaces(minSec.seconds,decimalPlaces),3+decimalPlaces))
		}
	return ret
	}

function removeHttp(url)
	{
	// removes 'http://' and 'https://' from URL
	var urlNoProtocol = url.replace(/^https?\:\/\//i, "");
	return urlNoProtocol
	}

function structKeyExists(struct,key)
	{
	// usage example: structKeyExists(foo,'barf')
	return typeof struct[key] != 'undefined';
	}

function arrayToSentenceAmpersand(arr)
	{
	var returnString = '';
	if (typeof arr != 'undefined')
		{
		returnString = 	arr.slice(0, -2).join(', ') +
	    					(arr.slice(0, -2).length ? ', ' : '') +
							arr.slice(-2).join(' & ');
		}
	return returnString
	}

function arrayToCommaSeparated(arr)
	{
	var returnString = '';
	if (typeof arr != 'undefined')
		{
		returnString = arr.join(", ")
		}
	return returnString
	}

function dollarFormat(obj)
	{
	var currentVal = numbersAndDecimalOnly(obj.value);
	var newVal = parseFloat(currentVal.replace(/(.*){1}/, '0$1').replace(/[^\d]/g, '').replace(/(\d\d?)$/, '.$1')).toFixed(2);
	obj.value = numberWithCommas(newVal);
	}

function numbersOnly(str)
	{
	if (str == '')
		{
		return ''
		}
	else
		{
		var numb = str.match(/\d/g);
		numb = numb.join("");
		return numb
		}
	}

function numbersAndDecimalOnly(str)
	{
	if (str == '')
		{
		return ''
		}
	else
		{
		// return Number(str.replace(/[^0-9\.]+/g,""));
		var numb = str.match(/\d/g);
		numb = numb.join("");
		return numb
		}
	}

function removeURLParameter(url, parameter) {
	// usage: window.history.replaceState(null, null, removeURLParameter(document.location.href,'who'));
    //better to use l.search if you have a location/link object
    var urlparts= url.split('?');
    if (urlparts.length>=2) {

        var prefix= encodeURIComponent(parameter)+'=';
        var pars= urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i= pars.length; i-- > 0;) {
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }

        url= urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
        return url;
    } else {
        return url;
    }
}

function toggleText(a,b)
	{
	return b ? a : b;
	}

jQuery.fn.outerHTML = function(s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
}

function shuffle(a) { // randomizes an array
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function calculateAge(birthday) { // birthday is a date
   var ageDifMs = Date.now() - birthday;
   var ageDate = new Date(ageDifMs); // miliseconds from epoch
   return Math.abs(ageDate.getUTCFullYear() - 1970);
 }

function formatPhoneNumber(phoneNumberString) { // changes a string of numbers into (xxx) yyy-zzzz
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return null
}


function toFixedDecimalPlaces(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return Number(num.toString().match(re)[0]).toFixed(fixed);
}

function realWidth(obj){ // get the width of hidden elements. usage: realWidth($("#parent").find("table:first"));
    var clone = obj.clone();
    clone.css("visibility","hidden");
    $('body').append(clone);
    var width = clone.outerWidth();
    clone.remove();
    return width;
}

function mobileAlertClick()
	{
	if ($j('#alertsYes').is(':checked'))
		{
		debug('yes');
		$j('.mobilePhoneInputContainer').show();
		}
	else if ($j('#alertsNo').is(':checked'))
		{
		debug('no')
		$j('.mobilePhoneInputContainer').hide();
		}
	else
		{
		debug('maybe');
		$j('.mobilePhoneInputContainer').show();
		}
	}

function scrollToElement(selector)
	{
    $j([document.documentElement, document.body]).animate({
    scrollTop: $j(selector).offset().top
	}, 2000);
    }

function isScrolledIntoView(elem) // source: https://stackoverflow.com/questions/487073/how-to-check-if-element-is-visible-after-scrolling
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    // var elemBottom = elemTop + $(elem).height(); // bottom of the element
    var elemBottom = elemTop - 200; // x pixels above the top of the element

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function truncateLines($element,lines) // add a "more" link to long text...
	{
	var height = $element.outerHeight();
	var font_size = parseInt($element.css('font-size'));
	var num = Math.floor(height / font_size);
	var lineHeight = height / num;
	var newHeight = height / num * lines;
	$j($element).css('max-height',newHeight);
	$j($element).css('overflow','hidden');
	}

function superClamp(selector,lines) // truncate lots of text into specified number of lines
	{
	// requires <script src="/js/clamp_pud_version.js"></script>
	// debug('superClamp: ' + lines);
	var elements = $j(selector);
	$j(selector).each(function()
		{
		$j(this).data('clampOriginal',$j(this).html());
		var myClamp = $clamp(this, {clamp:lines})
		if (myClamp.clamped)
			{
			var withLink = myClamp.clamped.replace('more', '<span onclick="$j(this).parent().html($j(this).parent().data(' + "'clampOriginal'" + '));" class="clampMore">more</span>');
			$j(this).html(withLink);
			}
		})
	}

// Add / Update a key-value pair in the URL query parameters
function updateUrlParameter(uri, key, value) {
    // example usage: window.history.replaceState('', '', updateURLParameter(window.location.href, "param", "value"));
    // remove the hash part before operating on the uri
    var i = uri.indexOf('#');
    var hash = i === -1 ? ''  : uri.substr(i);
         uri = i === -1 ? uri : uri.substr(0, i);

    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        uri = uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        uri = uri + separator + key + "=" + value;
    }
    return uri + hash;  // finally append the hash as well
}

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

var date_diff_indays = function(date1, date2)
	{
	dt1 = new Date(date1);
	dt2 = new Date(date2);
	return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
	}

$j.fn.sendkeys = function (x){
  x = x.replace(/([^{])\n/g, '$1{enter}'); // turn line feeds into explicit break insertions, but not if escaped
  return this.each( function(){
    bililiteRange(this).bounds('selection').sendkeys(x).select();
    this.focus();
  });
};

function secondsToMinutesAndSeconds(seconds)
	{
	var timing = {};
	timing.minutes = Math.floor(seconds / 60);
	timing.seconds = seconds - timing.minutes * 60;
	return timing
	}

function secondsToMinutesAndSecondsAndMiliseconds(seconds)
	{
	var timing = {};
	timing.minutes = Math.floor(seconds / 60);
	timing.seconds = Math.floor(seconds - timing.minutes * 60);
	timing.miliseconds = Number((seconds.toLocaleString("en")).split(".")[1]);
	if (!timing.miliseconds)
		{
		timing.miliseconds = 0
		}
	return timing
	}

function flashDiv(obj,color,originalBgColor,duration)
	{
	var originalPadding = $j(obj).css('padding');
	var originalMargin = $j(obj).css('margin');
	$j(obj).data('flashDivOriginalBg',originalBgColor)
	$j(obj).data('flashDivOriginalPadding',originalPadding)
	$j(obj).data('flashDivOriginalMargin',originalMargin)
	$j(obj).css('background-color',color);
	// $j(obj).css('padding','2px 4px 2px 4px');
	// $j(obj).css('margin','-2px -4px -2px -4px');
	$j(obj).css('position','relative');
	$j(obj).stop(true,true).animate(
		{
		backgroundColor: originalBgColor
		},{duration: duration},'linear',function()
		{
		// $j(obj).css('padding',originalPadding);
		// $j(obj).css('margin',originalMargin);
		})
	}

function maybePluralize(word,num)
	{
	if (num == 1)
		{
		return word
		}
	else
		{
		return word + 's';
		}
	}

function prettySeconds(seconds)
	{
	// begin: make pretty seconds
	if (seconds < 3600)
		{
		// don't show hours
		var myPrettySeconds = moment().startOf('day').seconds(seconds).format('m') + 'm ' + moment().startOf('day').seconds(seconds).format('s') + 's';
		}
	else
		{
		// show hours
		var myPrettySeconds = moment().startOf('day').seconds(seconds).format('h') + 'h ' + moment().startOf('day').seconds(seconds).format('m') + 'm ' + moment().startOf('day').seconds(seconds).format('s') + 's';
		}
	// end: make pretty seconds
	return myPrettySeconds
	}


function positionNavMoreMenu()
	{
	if ($j('.moreMenuLink').length == 0)
		{
		return false
		}

	$j('.navDropdown').css({"left":"auto"});
	var left = $j('.moreMenuLink').position().left - $j('.navDropdown').width() + $j('.moreMenuLink').width();
	left = left + parseInt($j('.moreMenuLink').css('padding-left')) + parseInt($j('.navLink').css('padding')); // account for padding
	if (left >= 0)
		{
		$j('.navDropdown').css({"left":left});
		}
	$j('.navDropdown').width($j('.moreMenuContainer').outerWidth());
	}

function randomString()
	{
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}

function clickedMoreMenu()
	{
	if ($j('.navDropdown').hasClass('navDropdownShow'))
		{
		$j('.navDropdown').removeClass('navDropdownShow');
		$j('.navDropdown').addClass('navDropdownHide');
		}
	else
		{
		$j('.navDropdown').addClass('navDropdownShow');
		$j('.navDropdown').removeClass('navDropdownHide');
		}

	if ($j('.moreMenuChevron.fa-chevron-up').length > 0)
		{
		$j('.moreMenuChevron').removeClass('fa-chevron-up');
		$j('.moreMenuChevron').addClass('fa-chevron-down');
		}
	else
		{
		$j('.moreMenuChevron').removeClass('fa-chevron-down');
		$j('.moreMenuChevron').addClass('fa-chevron-up');
		}
	positionNavMoreMenu();
	}

$j(window).resize(function()
	{
	positionNavMoreMenu();
	})

function closeMoreMenu()
	{
	$j('.navDropdown').addClass('navDropdownHide');
	$j('.navDropdown').removeClass('navDropdownShow');
	$j('.moreMenuChevron').removeClass('fa-chevron-up');
	$j('.moreMenuChevron').addClass('fa-chevron-down');
	}

function objectifyForm(selector) //turns an HTML form into a javascript object. usage: objectifyForm('#vizyForm')
	{
		var formArray = $j(selector).serializeArray()
		var returnArray = {};
		for (var i = 0; i < formArray.length; i++)
			{
			returnArray[formArray[i]['name']] = formArray[i]['value'];
			}
		return returnArray;
	}

function peopleOrPerson(num)
	{
	if (num == 1)
		{
		return 'person'
		}
	else
		{
		return 'people'
		}
	}

function numberWithCommas(x) { // thousands separator
	if (x !== undefined)
    	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	else
		return '';
}

function pad(n, width, z) // pad with zeros (or whatever)
	{
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

function hardValue(obj)
	{
	var values = {};
	values.myHardValue = $j(obj).attr('hardValue');
	values.myHardValueLength = values.myHardValue.length;

	values.myValue = $j(obj).val();

	// begin: convert http to https
	values.myValue = values.myValue.replace('http://','https://');
	$j(obj).val(values.myValue);
	// end: convert http to https

	// begin: remove www
	values.myValue = values.myValue.replace('www.','');
	$j(obj).val(values.myValue);
	// end: remove www

	// begin: remove duplicate hardValue
	values.myValue = values.myValue.replace(values.myHardValue+values.myHardValue,values.myHardValue);
	$j(obj).val(values.myValue);
	// end: remove duplicate hardValue

	// begin: fix first x chars
	if (values.myValue.substring(0, values.myHardValueLength) !=  values.myHardValue)
		{
		var myRegex = new RegExp('^.{' + values.myHardValueLength + '}', "g");
		$j(obj).val(values.myHardValue);
		debug('resetting hardValue()');
		debug(values);
		return false
		}
	// end: fix first x chars
	}

function notificationDismiss(notificationName)
	{
	$j('.notification_banner').hide();
	var data = {}
	data.notificationName = notificationName;
	var myPost = $j.post('/api/notificationDismiss/',data,function(response)
		{
		debug(response);
		},'json')
	}

function inWords (num) {
	var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
	var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim();
	}


var messagePollAjaxRequest = '';

function pollNewMessageCounter( pollingInterval ){
	// begin: stop polling
	if( typeof newMessagePolling != 'undefined' && newMessagePolling ){
		return;
	}
	// end: stop polling

	if( ! pollingInterval || pollingInterval < 20000 ){
		pollingInterval = 20000;
	}

	debug( 'running pollNewMessageCounter method call in the next ' + ( pollingInterval / 1000 ) + ' seconds' );
	// begin: start polling
	var pollingMilliseconds = pollingInterval;
	newMessagePolling = setTimeout( function(){
		var data = {};
		messagePollAjaxRequest = $j.ajax( {
			url: '/api/messageUnreadCount/',
			type: 'GET',
			data: data,
			dataType: 'JSON',
			beforeSend: function(){
				if( messagePollAjaxRequest != '' && messagePollAjaxRequest.readyState < 4 ){
					messagePollAjaxRequest.abort();
				}
			},
			success: function( response ){

				newMessagePolling = false;
				if( response.unreadMessages == 0 ){
					$j( '.unreadMessageCount' ).hide();
				} else {
					$j( '.unreadMessageCount' )
						.show()
						.text( response.unreadMessages );
				}

				pollNewMessageCounter( response.pollingMilliseconds );
			},
			error: function ( res ){
				newMessagePolling = false;
				pollingInterval = Math.min(pollingInterval * 1.61, 3600 * 1000);
				pollNewMessageCounter( pollingInterval );
			}
		} );
	}, pollingMilliseconds )
// end: start polling
}

function sweetAlertCorner(text,type)
	{
	type = typeof type !== 'undefined' ? type : 'success';
	Swal.fire({
	  position: 'top-end',
	  type: type,
	  title: text,
	  showConfirmButton: false,
	  timer: 1500
	})
	}

function sweetAlert(title,text,type,confirmButtonText,position)
	{
	confirmButtonText = typeof confirmButtonText !== 'undefined' ? confirmButtonText : 'OK';
	type = typeof type !== 'undefined' ? type : 'success';
	Swal.fire({
	  title: title,
	  html: text,
	  type: type,
	  confirmButtonText: confirmButtonText,
	  position: position
	})
	}

function sweetAlertHTML(title,html,type,confirmButtonText,position)
	{
	confirmButtonText = typeof confirmButtonText !== 'undefined' ? confirmButtonText : 'OK';
	type = typeof type !== 'undefined' ? type : 'success';
	Swal.fire({
	  title: title,
	  html: html,
	  type: type,
	  confirmButtonText: confirmButtonText,
	  position: position
	})
	}

function sweetAlertConfirm(title,body,onConfirm,onCancel,type,confirmHtml,cancelHtml,confirmButtonClass,cancelButtonClass,showCancelButton,allowOutsideClick)
	{
	type = typeof type !== 'undefined' ? type : 'warning'; // can be: success, error, warning, info, question
	confirmHtml = typeof confirmHtml !== 'undefined' ? confirmHtml : '<i class="fa fa-thumbs-up"></i> Great!';
	cancelHtml = typeof cancelHtml !== 'undefined' ? cancelHtml : '<i class="fa fa-thumbs-down"></i>';
	confirmButtonClass = typeof confirmButtonClass !== 'undefined' ? confirmButtonClass : '';
	cancelButtonClass = typeof cancelButtonClass !== 'undefined' ? cancelButtonClass : '';
	showCancelButton = typeof showCancelButton !== 'undefined' ? showCancelButton : false;
	allowOutsideClick = typeof allowOutsideClick !== 'undefined' ? allowOutsideClick : true;

	Swal.fire({
	  title: title,
	  type: type,
	  html: body,
	  reverseButtons: true,
	  showCloseButton: true,
	  showCancelButton: showCancelButton,
	  focusConfirm: false,
	  confirmButtonText: confirmHtml,
	  confirmButtonAriaLabel: 'Confirm',
	  cancelButtonText: cancelHtml,
      allowOutsideClick:allowOutsideClick,
	  customClass:
	  	{
	  	confirmButton:confirmButtonClass,
	  	cancelButton:cancelButtonClass
	  	},
	  cancelButtonAriaLabel: 'Cancel'
	}).then(function(isConfirm)
		{


        if (isConfirm.value)
			{
			onConfirm(isConfirm);
			}
		else
			{
			onCancel(isConfirm);
			}
		}
		)

	}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.prepend(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

function copyTextToClipboardFormatted(element) {
	var $temp = $j("<textarea>");
	var brRegex = /<br\s*[\/]?>/gi;
	$("body").append($temp);
	$temp.val($j(element).html().replace(brRegex, "\r\n").replace(/&amp;/g, "&")).select();
	document.execCommand("copy");
	$temp.remove();
}

function getOrientation(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {

        var view = new DataView(e.target.result);
        if (view.getUint16(0, false) != 0xFFD8)
        {
            return callback(-2);
        }
        var length = view.byteLength, offset = 2;
        while (offset < length)
        {
            if (view.getUint16(offset+2, false) <= 8) return callback(-1);
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1)
            {
                if (view.getUint32(offset += 2, false) != 0x45786966)
                {
                    return callback(-1);
                }

                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++)
                {
                    if (view.getUint16(offset + (i * 12), little) == 0x0112)
                    {
                        return callback(view.getUint16(offset + (i * 12) + 8, little));
                    }
                }
            }
            else if ((marker & 0xFF00) != 0xFF00)
            {
                break;
            }
            else
            {
                offset += view.getUint16(offset, false);
            }
        }
        return callback(-1);
    };
    reader.readAsArrayBuffer(file);
}

function createRotatedImage(img, angle) {
     angle = (angle == 'N') ?  -Math.PI/2 :
             (angle == 'S') ?   Math.PI/2 :
             (angle == 'W') ?   Math.PI   :
              angle ;
     var newCanvas = document.createElement('canvas');
     newCanvas.width  = img.width  ;
     newCanvas.height = img.height ;
     var newCtx = newCanvas.getContext('2d') ;
     newCtx.save      () ;
     newCtx.translate ( img.width / 2, img.height / 2) ;
     newCtx.rotate  (angle);
     newCtx.drawImage ( img, - img.width / 2, - img.height / 2) ;
     newCtx.restore   () ;
}

var cyrb53 = function(str, seed) { // this makes a hash() of any string
    var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (var i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

function getHash()
	{
	if(window.location.hash)
		{
		return window.location.hash
		}
	else
		{
		  return ''
		}
	}

function removeHash()
	{
	// remove hash from url
    history.pushState("", document.title, window.location.pathname + window.location.search);
	}

function placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

function get_timezone_offset_in_minutes()
	{
	// get timezone offset
	var current_date = new Date();
	return parseInt(-current_date.getTimezoneOffset()); // divide by 60 to get hours
	}


function removeEmojis(string)
	{
	var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|[\ud83c[\ude50\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
	return string.replace(regex, '');
	}

function setUpPhoneInput(selector) // used for intlTelInput plugin
	{
	var phoneInput = document.querySelector(selector);
	var phoneData = window.intlTelInput(phoneInput,
		{
		initialCountry: "auto",
		geoIpLookup: function(callback)
			{
		    var myGet = $j.get('https://ipinfo.io', function() {}, "jsonp").always(function(resp)
		    	{
			    debug('ipinfo:');
			   	debug(resp);
				var countryCode = (resp && resp.country) ? resp.country : "";
				callback(countryCode);
				});
			myGet.error(function()
				{
				debug('error with ipinfo. defaulting to US');
				callback("US");
				})
		  },
		utilsScript: "/js/phoneInput/utils.js?7"
		});
	return phoneData
	}

function removehtml(str)
	{
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

function removehtml2(str) // doesn't really work as hoped
	{
	var d = document.createElement('div');
	d.innerHTML = "<p>" + str + "</p>";
	return (d.textContent || d.innerText);
	}

function filenameIsImage(myUrl)
	{
	if (!myUrl.match(/.(jpg|jpeg|png|gif)$/i))
		{
		return false
		}
	else
		{
		return true
		}
	}

function padString(str, max) {
  str = str.toString();
  return str.length < max ? padString("0" + str, max) : str;
}

// begin: heartbeat
function heartbeat(myString,seconds)
	{
    data = {};
    data.string = myString;
    data.seconds = seconds;
    $j.post('/api/heartbeat/',data,function(response)
    	{
	    /*debug(response);*/
        heartbeatDelay(myString,seconds);  //call your function again after successfully calling the first time.
    	},'json')
	}

function heartbeatDelay(myString,seconds)
	{
    setTimeout( function() {
	    heartbeat(myString,seconds);
        },seconds*1000);
    }
// end: heartbeat

// begin: for signup form
function emailSignupBlur(obj) // you're looking in registrationForm
	{
	$j('#emailDidYouMeanContainer').hide();
	var myMailCheck = $j(obj).mailcheck({
										suggested:function(element,suggestion)
											{
											debug(suggestion);
											$j('#emailDidYouMeanContainer').show();
											$j('#emailDidYouMean').attr('full',suggestion.full);
											$j('#emailDidYouMean').html(suggestion.address + '@<b>' + suggestion.domain + '</b>');
											}
										})
	}

function clickedEmailSuggestion(obj)
	{
	var emailSuggestion = $j(obj).attr('full');
	$j('#inputEmail').val(emailSuggestion);
	$j('#emailDidYouMeanContainer').hide();
	}
// end: for signup form

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getTwentyFourHourTime(amPmString) // get 24 hour time from 12 hour time
	{
    var d = new Date("1/1/2013 " + amPmString);
    return d.getHours() + ':' + d.getMinutes();
    }

function stripHTML(dirtyString) {
  var container = document.createElement('div');
  var text = document.createTextNode(dirtyString);
  container.appendChild(text);
  return container.innerHTML; // innerHTML will be a xss safe string
}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

jQuery.fn.automail = function() {
        return this.each(function() {
            var re = /(([a-z0-9*._+]){1,}\@(([a-z0-9]+[-]?){1,}[a-z0-9]+\.){1,}([a-z]{2,4}|museum)(?![\w\s?&.\/;#~%"=-]*>))/g
            $j(this).html($j(this).html().replace(re, '<a href="mailto:$1">$1</a>'
                    ));
        });
    }
jQuery.fn.autolink = function() {
        return this.each(function() {
            var re = /(^|\s)(((([^:\/?#\s]+):)?\/\/)?(([A-Za-z0-9-]+\.)+[A-Za-z0-9-]+)(:\d+)?([^?#\s]*)(\?([^#\s]*))?(#(\S*))?)/g;
            $j(this).html($j(this).html().replace(re,
                    function(match, optionalWhitespace, uri, scheme, p4, protocol, fqdn, p7, port,
                            path, query, queryVal, fragment, fragId) {
                        return (optionalWhitespace ? optionalWhitespace : '')
                                + '<a href="' + (protocol ? uri : 'http://' + uri)
                                + '" target="_blank">' + uri + '<\/a>';
                    }) );
        });
    }

function isSpotifyArtistUri(uri)
	{
	if ($j.trim(uri).length == 0)
		return false;

	var uriArray = uri.split(':')
	var isGood = true;
	if (uriArray.length < 3)
		{
		isGood = false;
		}
	else if (uriArray[0] != 'spotify')
		{
		isGood = false;
		}
	else if (uriArray[1] != 'artist')
		{
		isGood = false;
		}
	return isGood
	}

function s4aVerify()
	{
	var spotifyArtistUri = $j('#spotifyConnectArtistPulldown').val();
	debug(spotifyArtistUri);
	if (spotifyArtistUri == '')
		{
		return false;
		}
	var data = {}
	data.spotifyArtistUri = spotifyArtistUri;
	data.sessionID = $j('.s4aSessionId').val();
	$j('.s4aSpinner').show();
	$j('.s4aErrorContainer').hide();
	$j('.s4aButton').prop("disabled",true);

	var myPost = $j.post('/api/spotifyForArtists/',data,function(response)
		{
		window.location.href = response.link; // send em to the link
		debug(response);
		},'json')
	myPost.error(function()
		{
		$j('.s4aOneClickContainer').hide();
		$j('.spotifySuperContainer').show();
		$j('.s4aSpinner').hide();
		$j('.s4aButton').prop("disabled",false);
		setTimeout(function()
			{
			alert('Sorry, an error happened. Please try again or visit www.distrokid.com/contact with details.');
			},50)
		})
	}

function optOutOfAlert(alertName)
	{
	debug('optOutOfAlert(' + alertName + ')');
	$j('.alert-' + alertName).slideUp(100);
	var data = {}
	data.session = $j('#alertSessionId').val();
	data.alertName = alertName;
	$j.post('/api/alertOptOut/',data,function(){})
	}

function waitForWebfonts(fonts, callback) {
    var loadedFonts = 0;
    for(var i = 0, l = fonts.length; i < l; ++i) {
        (function(font) {
            var node = document.createElement('span');
            // Characters that vary significantly among different fonts
            node.innerHTML = 'giItT1WQy@!-/#';
            // Visible - so we can measure it - but not on the screen
            node.style.position      = 'absolute';
            node.style.left          = '-10000px';
            node.style.top           = '-10000px';
            // Large font size makes even subtle changes obvious
            node.style.fontSize      = '300px';
            // Reset any font properties
            node.style.fontFamily    = 'sans-serif';
            node.style.fontVariant   = 'normal';
            node.style.fontStyle     = 'normal';
            node.style.fontWeight    = 'normal';
            node.style.letterSpacing = '0';
            document.body.appendChild(node);

            // Remember width with no applied web font
            var width = node.offsetWidth;

            node.style.fontFamily = font + ', sans-serif';

            var interval;
            function checkFont() {
                // Compare current width with original width
                if(node && node.offsetWidth != width) {
                    ++loadedFonts;
                    node.parentNode.removeChild(node);
                    node = null;
                }

                // If all fonts have been loaded
                if(loadedFonts >= fonts.length) {
                    if(interval) {
                        clearInterval(interval);
                    }
                    if(loadedFonts == fonts.length) {
                        callback();
                        return true;
                    }
                }
            };

            if(!checkFont()) {
                interval = setInterval(checkFont, 50);
            }
        })(fonts[i]);
    }
};

function bytesToSize(bytes)
	{
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return '0 Bytes';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	};

function addCommasToNumber(num)
	{
	var value = num.toLocaleString(
	  undefined, // use a string like 'en-US' to override browser locale
	  { minimumFractionDigits: 0 }
	);
	return value;
	}

function changeCss(className, classValue) { // change css class element
    // we need invisible container to store additional css definitions
    var cssMainContainer = $j('#css-modifier-container');
    if (cssMainContainer.length == 0) {
        var cssMainContainer = $j('<div id="css-modifier-container"></div>');
        cssMainContainer.hide();
        cssMainContainer.appendTo($j('body'));
    }

    // and we need one div for each class
    classContainer = cssMainContainer.find('div[data-class="' + className + '"]');
    if (classContainer.length == 0) {
        classContainer = $j('<div data-class="' + className + '"></div>');
        classContainer.appendTo(cssMainContainer);
    }

    // append additional style
    classContainer.html('<style>' + className + ' {' + classValue + '}</style>');
}

function fixMultipleSetsOfParensAndBracketsInSongTitle(strCorrected)
	{
	var parensArr = strCorrected.match(/[\(\[\{].*?[\)\]\}]/g);
	if ((parensArr != null) && (parensArr.length > 1))
		{
		for (var i = 0; i < parensArr.length; i++) // start at 2nd (array pos 1) set of parens
			{
			var thisParens = parensArr[i];
			if (i == 0)
				{
				thisParens = thisParens.replace(/[\(\[\{]/g,'(')
				thisParens = thisParens.replace(/[\)\]\}]/g,')')
				}
			else
				{
				thisParens = thisParens.replace(/[\(\[\{]/g,'[')
				thisParens = thisParens.replace(/[\)\]\}]/g,']')
				}
			strCorrected = strCorrected.replace(parensArr[i],thisParens);
			}
		}
	strCorrected = strCorrected.replace(/\)\[/g,') ['); // just in case they forgot a space
	return strCorrected;
	}

function separateStringParensAndBrackets(txt,reverseParensParts)
	{
	var regExp = /[^\(]*/
	var firstPart = txt.match(regExp);
	regExp = /(\(|\[)([^()\])]+)(\)|\])/g;
	var lastPart = txt.match(regExp);
	var finalVersion = firstPart;
	if (!lastPart)
		{
		return firstPart[0];
		}

	if (!reverseParensParts)
		{
		var countBegin = 0;
		var countEnd = lastPart.length-1;
		for (var i = countBegin; i <= countEnd; i++)
			{
			finalVersion = finalVersion + lastPart[i] + ' ';
			}
		}
	else
		{
		var countBegin = lastPart.length-1;
		var countEnd = 0;
		debug('countBegin ' + countBegin);
		debug('countEnd ' + countEnd);
		if (!((countBegin == 0) && (countEnd == 0)))
			{
			for (var i = countBegin; i >= countEnd; i--)
				{
				finalVersion = finalVersion + lastPart[i] + ' ';
				}
			}
		else
			{
			finalVersion = txt;
			}
 		}

	finalVersion = finalVersion.replace(/\s+/g,' ').trim();
	finalVersion = fixMultipleSetsOfParensAndBracketsInSongTitle(finalVersion);

	return finalVersion
	}

function randRange(min,max)
	{
	    return Math.floor(Math.random()*(max-min+1)+min);
	}

var confirmOnPageExit = function (e)
{
    // If we haven't been passed the event get the window.event
    e = e || window.event;

    var message = 'Any text will block the navigation and display a prompt';

    // For IE6-8 and Firefox prior to version 4
    if (e)
    {
        e.returnValue = message;
    }


	// Turn it on - assign the function that returns the string
	// window.onbeforeunload = confirmOnPageExit;

	// Turn it off - remove the function entirely
	// window.onbeforeunload = null;


    // For Chrome, Safari, IE8+ and Opera 12+
    return message;
};

function parseDate(input)
	{
	var parts = input.match(/(\d+)/g);
	return new Date(parts[0], parts[1]-1, parts[2]);
	}


function escapeRegExp(str)
	{
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

/* replaced with linkify jquery plugin
function linkify(text) {
	if (!text) {
		return "";
	}
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a target=_blank href='$1'>$1</a>");
}
*/

function selectText(element) {
    var doc = document;
    var text = doc.getElementById(element);

    if (doc.body.createTextRange) { // ms
        var range = doc.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) { // moz, opera, webkit
        var selection = window.getSelection();
        var range = doc.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function resendTeamInviteLink(albumuuid,umbrellauuid,email,row)
	{
	var data = {}
	data.umbrellauuid = umbrellauuid;
	data.email = email;
	data.albumuuid = albumuuid;
	$j('#resendInviteSpinner-' + row).show();
	$j('#resendInviteIcon-' + row).hide();
	$j('#resendInviteContainer-' + row).html('');
	var myPost = $j.post('/api/teamResendInviteLink/',data,function(response)
		{
		$j('#resendInviteSpinner-' + row).hide();
		$j('#resendInviteIcon-' + row).show();
		$j('#resendInviteContainer-' + row).html('- <b>Sent!</b>');
		debug(response);
		},'json');
	myPost.error(function()
		{
		$j('#resendInviteSpinner-' + row).hide();
		$j('#resendInviteIcon-' + row).show();
		setTimeout(function()
			{
			alert('An error happened. Please visit www.distrokid.com/contact and tell us what happened, so we can fix it. Thanks!');
			},100)
		})
	}

function teamsShowOptions(email,umbrellauuid,currentRow)
	{
	$j(".teamsMoreInfo[currentRow=" + currentRow + "]").toggle()
	$j(".teamsDisplayEmail[umbrellauuid='" + umbrellauuid + "'][email='" + email + "']").toggleClass('bold')
	}

function removeTeamInviteLink(csrf,songid,albumuuid,teamuuid,umbrellauuid,email,row)
	{
	/* prevents double-click */
	var clickOnce = new ClickOnce("removeTeamInviteLink");
	if (clickOnce.isClicked()) {
		return false;
	}
	clickOnce.setClicked();

	var myConfirm = confirm('Remove ' + email + ' from the team.\n\nTheir percentage will be reallocated back to you.\n\nAre you sure?');
	if (!myConfirm)
		{
		clickOnce.unsetClicked();
		return false;
		}
	else
		{
		var data = {}
		data.songid = songid;
		data.albumuuid = albumuuid;
		data.teamuuid = teamuuid;
		data.umbrellauuid = umbrellauuid;
		data.email = email;
		data.csrf = csrf;
		$j('#removeInviteSpinner-' + row).show();
		$j('#removeInviteIcon-' + row).hide();


		var myPost = $j.post('/api/teamRemoveInviteLink/',data,function(response) {
			$j('#removeInviteSpinner-' + row).hide();
			$j('#removeInviteIcon-' + row).show();

			setTimeout(function() {
				alert('Reallocation complete. Please allow 2-4 hours for any new funds to appear in your DistroKid Bank. This page will refresh...');
				location.href = location.href;
			},300);
			clickOnce.unsetClicked();
			// reload the page
			debug(response);
		},'json');
		myPost.error(function()
			{
			$j('#removeInviteSpinner-' + row).hide();
			$j('#removeInviteIcon-' + row).show();

			clickOnce.unsetClicked();

			setTimeout(function()
				{
				alert('An error happened. Please visit www.distrokid.com/contact and tell us what happened, so we can fix it. Thanks!');
				},100)
			})
		}
	}


function capitalizeLetterAfterPeriod(str)
{
	var capitalizeNext = false;
	var newString = ''
	for (var i = 0, len = str.length; i < len; i++) {
	  if(capitalizeNext)
	    {
	    newString = newString + str[i].toUpperCase();
	    }
	  else
	    {
	    newString = newString + str[i];
	    }
	  if (str[i] == '.')
	    {
	    capitalizeNext = true;
	    }
	  else if (str[i] != ' ')
	    {
	    capitalizeNext = false;
	    }
	}
	return newString;
}

function isValidUrl(userInput) {
	if ($j.trim(userInput).length == 0)
		return false;

    var res = userInput.match(/^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,8}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)/g);


    // goes well with addHttp()

    if(res == null)
        return false;
    else
        return true;
}

function containsUrl(userInput) {
	if ($j.trim(userInput).length == 0)
		return false;

    // Same regex as isValidUrl but without the ^ anchor, so it matches URLs anywhere in the string
    var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,8}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)/g);

    return res != null;
}


function addHttp(url) {
   if (!/^(f|ht)tps?:\/\//i.test(url)) {
      url = "http://" + url;
   }
   return url;
}

function isValidYouTubeURL(myurl)
	{

		// https://youtu.be/o_AmrKGTqrE
		// https://www.youtube.com/watch?v=o_AmrKGTqrE
		// https://www.youtube.com/shorts/o_AmrKGTqrE

		var matches = myurl.match(/youtu(?:.*\/v\/|.*v=|.be\/)([A-Za-z0-9_-]{11})/);
		var shortsMatches = myurl.match(/youtube.com\/shorts\/([A-Za-z0-9_-]{11})/);
		var isValidURL = (matches != null) || (shortsMatches != null);

		debug('isValidYouTubeURL: ' + myurl + ' = ' + isValidURL);

		return isValidURL;
	}

Number.prototype.toRoman= function () {
    var num = Math.floor(this),
        val, s= '', i= 0,
        v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
        r = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

    function toBigRoman(n) {
        var ret = '', n1 = '', rem = n;
        while (rem > 1000) {
            var prefix = '', suffix = '', n = rem, s = '' + rem, magnitude = 1;
            while (n > 1000) {
                n /= 1000;
                magnitude *= 1000;
                prefix += '(';
                suffix += ')';
            }
            n1 = Math.floor(n);
            rem = s - (n1 * magnitude);
            ret += prefix + n1.toRoman() + suffix;
        }
        return ret + rem.toRoman();
    }

    if (this - num || num < 1) num = 0;
    if (num > 3999) return toBigRoman(num);

    while (num) {
        val = v[i];
        while (num >= val) {
            num -= val;
            s += r[i];
        }
        ++i;
    }
    return s;
};

Number.fromRoman = function (roman, accept) {
    var s = roman.toUpperCase().replace(/ +/g, ''),
        L = s.length, sum = 0, i = 0, next, val,
        R = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };

    function fromBigRoman(rn) {
        var n = 0, x, n1, S, rx =/(\(*)([MDCLXVI]+)/g;

        while ((S = rx.exec(rn)) != null) {
            x = S[1].length;
            n1 = Number.fromRoman(S[2])
            if (isNaN(n1)) return NaN;
            if (x) n1 *= Math.pow(1000, x);
            n += n1;
        }
        return n;
    }

    if (/^[MDCLXVI)(]+$/.test(s)) {
        if (s.indexOf('(') == 0) return fromBigRoman(s);

        while (i < L) {
            val = R[s.charAt(i++)];
            next = R[s.charAt(i)] || 0;
            if (next - val > 0) val *= -1;
            sum += val;
        }
        if (accept || sum.toRoman() === s) return sum;
    }
    return NaN;
};

function getParameterByName(url, name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getVideo(myurl)
	{
	// http://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=UuMmT3E-KVU&format=json
	debug('getvideo(): ' + myurl);
	if (myurl.match(/^http:\/\/youtu.be\/(.+)$/))
		{
		debug('short style youtube url:');
		debug(myurl.match(/^http:\/\/youtu.be\/(.+)$/)[1]);
		var youtubeid = myurl.match(/^http:\/\/youtu.be\/(.+)$/)[1];
		}
	else
		{
		var youtubeid = getParameterByName(myurl,'v');
		}
	// debug('is ' + $j('#videoEmbedToken').val() + ' different than ' + youtubeid + ' ?');
	if ($j('#videoEmbedToken').val() != youtubeid) // just do the ajax if the youtubeid is different...
		{
		// debug('indeed it is different');
		if (isValidYouTubeURL(myurl))
			{
			$j('#videoEmbedToken').val(youtubeid);
			$j('#VideoOembedContainer').html('<img src="/images/spinner2.gif">');
			debug('getting thumbnail');
			getYoutubeThumbnailAjax = $j.get("/api/youtubeOembed/?myurl=http://www.youtube.com/watch?v=" + youtubeid, null, function(data)
				{
				gotYouTubeData(data);
				})
			getYoutubeThumbnailAjax.error(function()
				{
				debug('Error getting YouTube thumbnail');
				$j('#VideoOembedContainer').html('');
				})
			}
		}

	}



function distroLog(action,notes,albumuuid,userid,songid,longnotes)
	{
	action = typeof action !== 'undefined' ? action : '';
	notes = typeof notes !== 'undefined' ? notes : '';
	albumuuid = typeof albumuuid !== 'undefined' ? albumuuid : '';
	userid = typeof userid !== 'undefined' ? userid : 0;
	songid = typeof songid !== 'undefined' ? songid : 0;
	longnotes = typeof longnotes !== 'undefined' ? longnotes : '';

	data = {};
	data.action = action;
	data.notes = notes;
	data.albumuuid = albumuuid;
	data.userid = userid;
	data.songid = songid;
	data.longnotes = longnotes;

	$j.post('/api/distroLog/',data,function(response)
		{
		debug('distroLog():');
		debug(response);
		},'json')
	}

function getYouTubeID(url)
	{
	var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	var match = url.match(regExp);
	if (match && match[2].length == 11) {
	  return match[2];
	} else {
	  debug('couldnt find youtube id, yo.');
	}
	}

function uniqueArray(names)
	{
	var uniqueNames = [];
	jQuery.each(names, function(i, el)
		{
	    if(jQuery.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
		})
	return uniqueNames;
	}

function daysInMonth(y, m) { // m is 0 indexed: 0-11
    switch (m) {
        case 2 :
            return (y % 4 == 0 && y % 100) || y % 400 == 0 ? 29 : 28;
        case 9 : case 4 : case 6 : case 11 :
            return 30;
        default :
            return 31
    }
}

function capitalizeFirstLetter(string)
	{
    return string.charAt(0).toUpperCase() + string.slice(1);
	}

function isValidDate(y, m, d) {
    return y >= 1900 && y <= 2100 && m > 0 && m <= 12 && d > 0 && d <= daysInMonth(y, m);
}

function containsEnglishChars(str)
	{
	var englishChars = new RegExp("[a-zA-Z]+");
	return englishChars.test(str);
	}

function focusIfScreenBigEnough(selector)
	{
	if (!(detectIE() || navigator.sayswho[1] == 'Opera'))
		{
		if ($j(window).height() > 700)
			{
			$j(selector).focus();
			}
		}
	}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

function isElementInViewport (el) {

    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}

function isElementVisible(el) {
    var rect     = el.getBoundingClientRect(),
        vWidth   = window.innerWidth || doc.documentElement.clientWidth,
        vHeight  = window.innerHeight || doc.documentElement.clientHeight,
        efp      = function (x, y) { return document.elementFromPoint(x, y) };

    // Return false if it's not in the viewport
    if (rect.right < 0 || rect.bottom < 0
            || rect.left > vWidth || rect.top > vHeight)
        return false;

    // Return true if any of its four corners are visible
    return (
          el.contains(efp(rect.left,  rect.top))
      ||  el.contains(efp(rect.right, rect.top))
      ||  el.contains(efp(rect.right, rect.bottom))
      ||  el.contains(efp(rect.left,  rect.bottom))
    );
}

String.prototype.toTitleCase = function() {
// from http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
// usage: "MY WOnKy sTring".toTitleCase()

// casing
var i, str, lowers, uppers;
str = this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
});

// Certain minor words should be left lowercase unless
// they are the first or last words in the string
lowers = ['Y','La','De','En','El','A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'At',
'By', 'For', 'From', 'In', 'Near', 'Of', 'On', 'Onto', 'To']; // Dec 22, 2017 - Removed: With, Into, As
for (i = 0; i < lowers.length; i++)
str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
function(txt) {
return txt.toLowerCase();
});

// Some words want to be left in upper case
uppers = ['ID','TV'];
if (this.match(/\b([A-Z]{2,})\b/g) != null)
	{
	if (this.match(/\b([A-Z]{2,3})\b/g) != null)
		{
		uppers = uppers.concat(this.match(/\b([A-Z]{2,3})\b/g));
		}
	for (i = 0; i < uppers.length; i++)
		{
		uppers[i] = uppers[i].capitalize()
		}
	}
// Certain words such as initialisms or acronyms should be left uppercase
for (i = 0; i < uppers.length; i++)
str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
uppers[i].toUpperCase());

// keep initials intact
var initials = [];
if (this.match(/([A-Z]\.)+/g) != null)
	{
	initials = this.match(/([A-Z]\.)+/g);
	}
for (var i = 0; i < initials.length; i++)
	{
    var WhatWeAreLookingFor = initials[i].charAt(0).toUpperCase() + initials[i].substr(1).toLowerCase();
    str = str.replace(WhatWeAreLookingFor,initials[i]);
	}

// keep CamelCase intact
var initials = [];
if (this.match(/([A-Z][a-z0-9]+){2,}/g) != null)
	{
	initials = this.match(/([A-Z][a-z0-9]+){2,}/g);
	}
for (var i = 0; i < initials.length; i++)
	{
    var WhatWeAreLookingFor = initials[i].charAt(0).toUpperCase() + initials[i].substr(1).toLowerCase();
    str = str.replace(WhatWeAreLookingFor,initials[i]);
	}

return str;
}

function debug(str)
	{
	if (typeof console.log != 'undefined')
		{
		console.log(str);
		}
	}

function addUrlParam(key,value) // add parameter to url
	{
	if (history.pushState)
		{
		var queryString = window.location.search; // get query string
		queryString = queryString.replace("?", ""); // remove question mark

		if (queryString == '')
			{
			queryString = '?' + key + '=' + value; // add question mark and new param
			}
		else
			{
			queryString = '?' + key + '=' + value + '&' + queryString; // add question mark and new param
			}
		history.pushState(null, '', queryString);
		}
	}

function addOrReplaceUrlParam(key, value) {
    if (history.pushState) {
        var urlParams = new URLSearchParams(window.location.search);

        // Update the parameter or add it if it doesn't exist
        urlParams.set(key, value);

        // Reconstruct the query string
        var newQueryString = urlParams.toString();

        // Update the URL
        history.pushState(null, '', '?' + newQueryString);
    }
}

function addParameterToURL(param){
    _url = location.href;
    _url += (_url.split('?')[1] ? '&':'?') + param;
    return _url;
}


// for /signinMobile
function signinSubmitMobileCaptcha(obj)
	{
	$j('#signInButtonStandalonePage').attr('originalVal',$j('#signInButtonStandalonePage').val());
	$j('#signInButtonStandalonePage').val('Please wait...');
	if ($j('#invisibleRecaptchaSigninSubmitStandalone').html() != '')
		{
		$j('#invisibleRecaptchaSigninSubmitStandalone').html('');
		grecaptcha.reset(widget_invisibleRecaptchaSigninSubmitStandalone);
		}
	else
		{
		widget_invisibleRecaptchaSigninSubmitStandalone = grecaptcha.render('invisibleRecaptchaSigninSubmitStandalone',
			{
			sitekey:captchaSiteKey?captchaSiteKey:"6Ld_vDcUAAAAABBf4b4MfIPqz5XA53JWQyOh6MX0",
			size: 'invisible',
			callback: function(token)
				{
					signinSubmitMobile(obj, token)
				}
			})
		}
	grecaptcha.execute(widget_invisibleRecaptchaSigninSubmitStandalone);
	}

// for /slaps/signinMobile
function signinSubmitSlapsMobileCaptcha(obj)
	{
	$j('#signInButtonStandalonePage').attr('originalVal',$j('#signInButtonStandalonePage').val());
	$j('#signInButtonStandalonePage').val('Please wait...');
	if ($j('#invisibleRecaptchaSigninSubmitStandalone').html() != '')
		{
		$j('#invisibleRecaptchaSigninSubmitStandalone').html('');
		grecaptcha.reset(widget_invisibleRecaptchaSigninSubmitStandalone);
		}
	else
		{
		widget_invisibleRecaptchaSigninSubmitStandalone = grecaptcha.render('invisibleRecaptchaSigninSubmitStandalone',
			{
			sitekey:captchaSiteKey?captchaSiteKey:"6Ld_vDcUAAAAABBf4b4MfIPqz5XA53JWQyOh6MX0",
			size: 'invisible',
			callback: function(token)
				{
					signinSubmitSlapsMobile(obj, token)
				}
			})
		}
	grecaptcha.execute(widget_invisibleRecaptchaSigninSubmitStandalone);
	}

// for /signin and /tidaldiscovery
function signinSubmitStandalonePageCaptcha(obj){
    $('#signInButtonStandalonePage').attr('originalVal',$j('#signInButtonStandalonePage').val());
    $('#signInButtonStandalonePage').val('Please wait...');

    // Do not proceed with signin if grecaptcha is not loaded yet
    if (!window.grecaptcha || typeof window.grecaptcha.render != "function") {
        $('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
        $('.signinBoxNotification')
            .fadeIn('fast')
            .text("Something went wrong. Please try again.");
        return;
    }

    if ($('#invisibleRecaptchaSigninSubmitStandalone').html() != ''){
        $('#invisibleRecaptchaSigninSubmitStandalone').html('');
        grecaptcha.reset(widget_invisibleRecaptchaSigninSubmitStandalone);
    }
    else {
        widget_invisibleRecaptchaSigninSubmitStandalone = grecaptcha.render('invisibleRecaptchaSigninSubmitStandalone',
            {
                sitekey:captchaSiteKey?captchaSiteKey:"6Ld_vDcUAAAAABBf4b4MfIPqz5XA53JWQyOh6MX0",
                size: 'invisible',
                callback: function(token){
                    signinSubmitStandalonePage(obj, token)
                }
            }
        );
    }

    grecaptcha.execute(widget_invisibleRecaptchaSigninSubmitStandalone);
}

function signinSubmitMobile( obj, token ){
	$j('.signinBoxNotification').hide();
	var thisClientId = $j('#client_id').val();
	var thisDeviceId = $j('#deviceId').val();
	var data = {
		'email'     : $j('#inputEmail').val(),
		'password'  : $j('#inputPassword').val(),
		'client_id' : thisClientId,
		'grant_type': 'password',
		'token': token,
		'sessionid': $j('#forgotPasswordSessionID').val(),
		'deviceId': thisDeviceId
	};

	if( !isLatin1Only( data.email ) || !isValidEmailAddress( data.email ) || containsEmojis( data.email ) ){
		$j('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
		$j('.signinBoxNotification').fadeIn('fast');
		$j('.signinBoxNotification').text('Oops, invalid email address');
		firebaseEventTrigger( "sign_in_form_error" );
		return false;
	}

	var loginCheckPost = $j.post('/api/v1/user/login/', data, function( response ){
		if (response.success == 1){
			if( typeof response.access_token != 'undefined' && typeof response.token_type != 'undefined' && response.token_type == 'bearer' ){
				// Response contains the full access_token data struct needed for auth
				response[ 'event_type' ] = 'sign_in';
				if( typeof response.isfreeplan != 'undefined' && response.isfreeplan == true ){
					response[ 'url' ] = "/mobileapp/webviews/plans.cfm?token=" + response.token + "&isNewFreeSignIn=true"; // window.location.href = "/mobileapp/webviews/plans.cfm";
				}
				reactNativePost(response);
			} else {
				window.location.href = '/mobileapp/webviews/2fa/?token=' + response.token + '&isMobileView=true&mobileDeviceId=' + thisDeviceId + '&mobileClientId=' + thisClientId;
			}
		} else {
			$j('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
			$j('.signinBoxNotification').fadeIn('fast');
			$j('.signinBoxNotification').text(response.message);
		}
	},'json')
	loginCheckPost.error( function(){
		$j('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
		$j('.signinBoxNotification')
			.fadeIn('fast')
			.text('Dang! There was an error. Please try again');
	} );

}

function signinSubmitSlapsMobile( obj, token ){
	$j('.signinBoxNotification').hide();
	var data = {
		'email'     : $j('#inputEmail').val(),
		'password'  : $j('#inputPassword').val(),
		'client_id' : $j('#client_id').val(),
		'grant_type': 'password'
	};

	if( !isLatin1Only( data.email ) || !isValidEmailAddress( data.email ) || containsEmojis( data.email ) ){
		$j('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
		$j('.signinBoxNotification').fadeIn('fast');
		$j('.signinBoxNotification').text('Oops, invalid email address');
		return false;
	}

	var myPost = $j.post( '/oauth2/token/', data, function( response ){
		if( response.success == 1 ){
			// Response contains the full access_token data struct needed for auth
			response[ 'event_type' ] = 'sign_in';
			response[ 'event']       = 'completed';
			webkit.messageHandlers.loginCallback.postMessage( JSON.stringify( response ) );
		} else {
			if( response.redirect ){
				window.location.href = response.redirect;
			} else {
				$j('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
				$j('.signinBoxNotification').fadeIn('fast');
				$j('.signinBoxNotification').text(response.message);
			}
		}
	}, 'json' );
	myPost.error(function(jqXhr, textStatus, errorThrown){
		$j('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
		if (jqXhr.status == 401 && jqXhr.responseJSON && jqXhr.responseJSON.message) {
			alert(jqXhr.responseJSON.message);
		}
		else {
			alert("Dang! There was an error. That didn't work. Try reloading this page.");
		}
	});
}

function signinSubmitStandalonePage(obj, token)
	{
	var data = {}
	$j('.signinBoxNotification').hide();
	data.email = $j('#inputEmail').val();
	data.password = $j('#inputPassword').val();
	data.sessionid = $j('#forgotPasswordSessionID').val();
	data.coupon = $j('#coupon').val();
	data.token = token;

	if (!isLatin1Only(data.email) || !isValidEmailAddress(data.email) || containsEmojis(data.email))
		{
		$j('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
		$j('.signinBoxNotification').fadeIn('fast');
		$j('.signinBoxNotification').text('Oops, invalid email address');
		return false;
		}

	var myPost = $j.post('/api/loginCheck/?now', data, function(response)
		{
		if (response.success == 1)
			{

			trackSigninEvent(response.userid, data.email);

			if (typeof getUrlVars().forward == 'undefined')
				{
					var forwardURL = data.coupon ? '/?c='+data.coupon : '/';
					window.location.href = forwardURL;
				}
			else
				{
				// begin: clean up string. gets rid of sneakiness like distrokid.com/signin/?forward=.hackerwebsite.com
				var forwardString = window.location.host + '/' + getUrlVars().forward;
				forwardString = forwardString.replace(/\/+/g,'/').trim();
				// end: clean up string

				var forwardURL = new URL(location.protocol + '//' + forwardString);
				// forwardURL.searchParams.append('wasForward', getUrlVars().forward);
				if (forwardURL.href.indexOf("@") > -1)
					{
					window.location.href = '/'; // root out sneakiness like https://distrokid.com/signin/?forward=bypass@fake_distrokid.com
					}
				else
					{
					window.location.href = forwardURL.href;
					}
				}
			}
		else
			{
				if (response.redirect){
					window.location.href = response.redirect;
				} else {
					$j('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
					$j('.signinBoxNotification').fadeIn('fast');
					$j('.signinBoxNotification').text(response.message);
				}
			}
		},'json')
	myPost.error(function()
		{
		$j('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
		alert('Dang! There was an error. That didn\'t work. Try reloading this page.');
		})
	}

function signinSubmitApiAuthPageCaptcha(obj)
	{
	$j('#signInButtonApiAuthPage').attr('originalVal',$j('#signInButtonApiAuthPage').val());
	$j('#signInButtonApiAuthPage').val('Please wait...');
	if ($j('#invisibleRecaptchaSigninSubmitApiAuth').html() != '')
		{
		$j('#invisibleRecaptchaSigninSubmitApiAuth').html('');
		grecaptcha.reset(widget_invisibleRecaptchaSigninSubmitApiAuth);
		}
	else
		{
		widget_invisibleRecaptchaSigninSubmitApiAuth = grecaptcha.render('invisibleRecaptchaSigninSubmitApiAuth',
			{
			sitekey:captchaSiteKey?captchaSiteKey:"6Ld_vDcUAAAAABBf4b4MfIPqz5XA53JWQyOh6MX0",
			size: 'invisible',
			callback: function(token)
				{
				signinSubmitApiAuthPage(obj, token)
				}
			})
		}
	grecaptcha.execute(widget_invisibleRecaptchaSigninSubmitApiAuth);
	}

function signinSubmitApiAuthPage(obj, token)
	{
	var data = {}
	$j('.signinBoxNotification').hide();
	data.email = $j('#inputEmail').val();
	data.password = $j('#inputPassword').val();
	data.sessionid = $j('#forgotPasswordSessionID').val();
	data.key = getUrlVars().key;
	data.token = token;

	if (!isLatin1Only(data.email) || !isValidEmailAddress(data.email) || containsEmojis(data.email))
		{
		$j('#signInButtonApiAuthPage').val($j('#signInButtonStandalonePage').attr('originalVal'));
		$j('.signinBoxNotification').fadeIn('fast');
		$j('.signinBoxNotification').text('Oops, invalid email address');
		return false;
		}

	var myPost = $j.post('/api/loginCheck/?now=1&key=' + getUrlVars().redirect, data, function(response)
		{
		if (response.success == 1)
			{

			trackSigninEvent(response.userid, data.email);

			// begin: api state
			var myState = '';
			if (typeof getUrlVars().state != 'undefined')
				{
				myState = getUrlVars().state;
				}
			// end: api state

			if (typeof urlRedirect != 'undefined')
				{
				var forwardURL = new URL(urlRedirect);
				forwardURL.searchParams.append('token', response.token);
				forwardURL.searchParams.append('state', myState);
				if ((forwardURL.href.indexOf("@") > -1) || (forwardURL.href.indexOf(";") > -1))
					{
					window.location.href = '/'; // root out sneakiness like https://distrokid.com/signin/?forward=bypass@fake_distrokid.com
					}
				else
					{
					window.location.href = forwardURL.href;
					}
				}
			else if (typeof getUrlVars().redirect != 'undefined')
				{
				var forwardURL = new URL(getUrlVars().redirect);
				forwardURL.searchParams.append('token', response.token);
				forwardURL.searchParams.append('state', myState);
 				if (forwardURL.href.indexOf("@") > -1)
					{
					window.location.href = '/'; // root out sneakiness like https://distrokid.com/signin/?forward=bypass@fake_distrokid.com
					}
				else
					{
					window.location.href = forwardURL.href;
					}
				}
			else
				{
				var forwardURL = '/';
				window.location.href = forwardURL;
				}
			}
		else
			{
				if (response.redirect){
					window.location.href = response.redirect;
				} else {
					$j('#signInButtonApiAuthPage').val($j('#signInButtonApiAuthPage').attr('originalVal'));
					$j('.signinBoxNotification').fadeIn('fast');
					$j('.signinBoxNotification').text(response.message);
				}
			}
		},'json')
	myPost.error(function()
		{
		$j('#signInButtonStandalonePage').val($j('#signInButtonStandalonePage').attr('originalVal'));
		alert('Dang! There was an error. That didn\'t work. Try reloading this page.');
		})
	}

function sentenceCase(string)
	{
	var n=string.split(".");
	var vfinal=""
	for(i=0;i<n.length;i++)
	{
	   var spaceput=""
	   var spaceCount=n[i].replace(/^(\s*).*$/,"$1").length;
	   n[i]=n[i].replace(/^\s+/,"");
	   var newstring=n[i].charAt(n[i]).toUpperCase() + n[i].slice(1);
	   for(j=0;j<spaceCount;j++)
	   spaceput=spaceput+" ";
	   vfinal=vfinal+spaceput+newstring+".";
	 }
	 vfinal=vfinal.substring(0, vfinal.length - 1);
	 return vfinal;
	}

function stringContains(str1,str2)
	// case insensitive
	{
	if (str1.toLowerCase().indexOf(str2.toLowerCase()) >= 0)
		{
		return true;
		}
	else
		{
		return false;
		}
	}

function popup(url, title, w, h) {

	w = typeof w !== 'undefined' ? w : 350;
	h = typeof h !== 'undefined' ? h : 250;
	title = typeof title !== 'undefined' ? title : 'popup';

    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus && newWindow) {
        newWindow.focus();
    }

	return newWindow;

}

function mailingListSelector(obj,admin)
	{
	var shortcut = $j(obj).val();
	if (shortcut == '')
		{
		return false;
		}
	if (admin)
		{
		url = '/pages/admin/' + shortcut;
		}
	else
		{
		setCookie('PAGECHANGE','1',1);
		url = '/' + shortcut;
		}
	window.location.href = url;
	}


function redirToThanksPage() {
	var redirTo = "thanks/";
	var urlScope = parseQueryString();		// TODO: move function from distro.js
	if (urlScope.upgrade == "1")
		redirTo += "?upgrade=1";

	window.location = redirTo;
}

// uses Stripe Elements
function stripeResponseHandler(response){

    debug('response:');
    debug(response);

    if (response.error){

        $j('.button__text').show();
        $j('#payButton').removeClass('button--');
        $j('#payButton').removeClass('button--loading');
        $j('#payButton').removeClass('disabled');
        $j('#payButton').removeAttr('disabled');

        if ((response.error.code == 'invalid_number') || (response.error.code == 'incorrect_number')){
            $j('.cardNumber').addClass('distroErrorForm');
            $j('#errorNumber').show();
            $j('.cardNumber').focus();
        } else if ((response.error.code == 'invalid_cvc') || (response.error.code == 'incomplete_cvc')){
            $j('.cardCVC').addClass('distroErrorForm');
            $j('#errorCVC').show();
            $j('.cardCVC').focus();
        } else if (response.error.code.includes('invalid_expiry') || response.error.code.includes('incomplete_expiry')){
            $j('.cardExpiration').addClass('distroErrorForm');
            $j('#errorExpiration').show();
        } else {
            showErrorMessage(response.error.message);
        }

    } else {

        var customerData = {}
        customerData.subscriptionPlan =  $j('#subscriptionPlan').val();

        if ($j('#cardName').val() != undefined){
            customerData.name = $j('#cardName').val();
        } else {
            customerData.name = "";
        }
        customerData.email = $j('#emailAddress').val();
        customerData.stripeToken = response['token']['id'];
        customerData.coupon = $j('#coupon').val();
        customerData.country = $j('select[name="country"]').val();
        customerData.postalCode = response['token']['card']['address_zip'];

        $j('#payment-form').append("<input type='hidden' name='stripeToken' value='" + response['token']['id'] + "'>");

        // Create Stripe Customer
        $.ajax({
            type: "POST",
            url: "/api/stripe/createCustomer/",
            data: customerData,
            dataType: "json",
            success: function (result, status, xhr) {

                debug("customer result");
                debug(result);

                var stripeCustomerId = result.data.id;

                // Create Subscription
                var subData = {};
                subData.stripeCustomerId = stripeCustomerId;
                subData.subscriptionPlan = customerData.subscriptionPlan;
                subData.coupon = customerData.coupon;
                subData.paymentBehavior = "allow_incomplete"; // needs to be this in order to deal with 3DS

                $.ajax({
                    type: "POST",
                    url: "/api/stripe/createSubscription/",
                    data: subData,
                    dataType: "json",
                    success: function (result, status, xhr) {

                        debug("sub result");
                        debug(result);

                        var subscriptionId = result.data.id;

                        var saveData = {};
                        saveData.subscriptionId = subscriptionId;
                        saveData.stripeCustomerToken = stripeCustomerId;
                        saveData.name = customerData.name;
                        saveData.subscriptionPlan = subData.subscriptionPlan;
                        saveData.stripeSingleUseToken = customerData.stripeToken;
                        saveData.email = customerData.email;
                        saveData.myValidCoupon = customerData.coupon;
                        saveData.postalCode = customerData.postalCode;
                        saveData.country = customerData.country;

                        // Success, now finish up on our side
                        if (result.data.status == "active") {

                            saveStripeCustomer(saveData);

                        // uh oh, something went wrong, see if we need to
                        // confirm payment (3DS), otherwise, cancel and throw error
                        } else if (result.data.status == "incomplete") {

                            // Confirm payment method (3DS)
                            if (result.data.latest_invoice.payment_intent.status == "requires_action" || result.data.latest_invoice.payment_intent.status == "requires_confirmation") {

                                stripe.confirmCardPayment(result.data.latest_invoice.payment_intent.client_secret, {
                                    payment_method: result.data.latest_invoice.payment_intent.source,
                                    setup_future_usage: "off_session" // this allows authenticated payment to work for future payments
                                }).then(function(result) {

                                    if (result.error){
                                        deleteStripeCustomer(stripeCustomerId, subscriptionId);
                                        debug("error");
                                        debug(result.error);
                                        hideLoader();
                                        showErrorMessage(result.error.message);
                                    }

                                    if (result.paymentIntent){

                                        // Success, now finish up on our side
                                        if (result.paymentIntent.status == "succeeded"){
                                            debug("success");
                                            debug(result.paymentIntent);
                                            saveStripeCustomer(saveData);
                                        } else {
                                            deleteStripeCustomer(stripeCustomerId, subscriptionId);
                                            hideLoader();
                                            showErrorMessage();
                                        }
                                    }

                                });

                            } else {
                                deleteStripeCustomer(stripeCustomerId, subscriptionId);
                                hideLoader();
                                showErrorMessage();
                            }

                        } else {
                            debug("sub error");
                            debug(error);
                            deleteStripeCustomer(stripeCustomerId, subscriptionId);
                            hideLoader();
                            showErrorMessage();
                        }

                    },

                    //Subsription error
                    error: function (xhr, status, error) {
                        debug("sub error");
                        debug(error);
                        deleteStripeCustomer(stripeCustomerId,"");
                        hideLoader();
						if (typeof xhr.responseJSON.error === 'undefined'){
							showErrorMessage();
						} else {
							showErrorMessage(xhr.responseJSON.error);
						}
                    }
                });

            },

            // Create Customer error
            error: function (xhr, status, error) {
                debug("customer error");
                debug(error);
                hideLoader();
                if (typeof xhr.responseJSON.error === 'undefined'){
                    showErrorMessage("There is an issue charging your card.");
                } else {
                    showErrorMessage(xhr.responseJSON.error);
                }
            }
        });

    }

}

function saveStripeCustomer(data) {

    var customerId = data.stripeCustomerToken;
    var subscriptionId = data.subscriptionId;

    $.ajax({
        type: "POST",
        url: "/api/stripe/saveCustomer/",
        data: data,
        dataType: "json",
        success: function (result, status, xhr) {
            debug(result);
            redirToThanksPage();
        },
        error: function (xhr, status, error) {
            debug(error);
            deleteStripeCustomer(customerId, subscriptionId, true);
            hideLoader();
            showErrorMessage();
        }
    });
}

function deleteStripeCustomer(customerId, subscriptionId, performNewCustomerRefund=false) {

	if ( !performNewCustomerRefund ) {
		deleteStripeCustomerNew(customerId, subscriptionId);
	}
	else {
		var data = {};
		data.stripeCustomerToken = customerId;
		$.ajax({
			type: "POST",
			url: "/api/stripe/refundNewCustomer/",
			data: data,
			dataType: "json",
			success: function (result, status, xhr) {
				debug(result);
				deleteStripeCustomerNew(customerId, subscriptionId);
			},
			error: function (xhr, status, error) {
				debug(error);
				deleteStripeCustomerNew(customerId, subscriptionId);
			}
		});
	}

}

function deleteStripeCustomerNew(customerId, subscriptionId) {

	var data = {};
    data.stripeCustomerId = customerId;
    data.subscriptionId = subscriptionId;
    $.ajax({
        type: "POST",
        url: "/api/stripe/deleteCustomer/",
        data: data,
        dataType: "json",
        success: function (result, status, xhr) {
            debug(result);
        },
        error: function (xhr, status, error) {
            debug(error);
        }
    });

}

function showLoader() {
    $j('.button__text').hide();
    $j('#payButton').addClass('button--');
    $j('#payButton').addClass('button--loading');
    $j('#payButton').addClass('disabled');
    $j('#payButton').attr('disabled','disabled');
}

function hideLoader() {
    $j('.button__text').show();
    $j('#payButton').removeClass('button--');
    $j('#payButton').removeClass('button--loading');
    $j('#payButton').removeClass('disabled');
    $j('#payButton').removeAttr('disabled');
}

function showErrorMessage(message) {
	var errMessage = 'There was an error. Please try again, or visit www.distrokid.com/contact if it still isn\'t working';
	if (typeof message != 'undefined'){
		errMessage = message;
	}
    $j('#errorFromStripeContainer').show();
    $j('#errorFromStripe').text(errMessage);
}

// uses Stripe Elements
function processPayment(obj) {
	$j('.paymentInput').removeClass('distroErrorForm')
	$j('.distroErrorFormMessage').hide();
	$j('.plan-cc-form-error').hide();

	if (!$j(obj).hasClass('disabled')){
		$j(obj).addClass('disabled');
		showLoader();

		var tokenData = {}
		tokenData.name = $j('#cardName').val();
		tokenData.address_country = $j('select[name="country"]').val();
		tokenData.address_zip = $('#zipcode').val();
		stripe.createToken(cardNumber,tokenData).then(stripeResponseHandler);
	}
}

function setCookie(name,value,days)
{
if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function getCookie(c_name)
{
var i,x,y,ARRcookies=document.cookie.split(";");
for (i=0;i<ARRcookies.length;i++)
{
  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
  x=x.replace(/^\s+|\s+$/g,"");
  if (x==c_name)
    {
    return unescape(y);
    }
  }
}

/**
 * Store URL utm params in cookies
 */
function setUtmCookies(){
	var utm_source = (new URLSearchParams(window.location.search)).get('utm_source');
	var utm_medium = (new URLSearchParams(window.location.search)).get('utm_medium');

	if (utm_source != null){
		setCookie('utm_source', utm_source);
	}

	if (utm_medium != null){
		setCookie('utm_medium', utm_medium);
	}

}

function deleteCookie(name) {
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=distrokid.com';
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=.distrokid.com';

}


function round(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

function titleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


function urldecode(str) {
   return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}

function detectIE() { // also known as: isIE()
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');

    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    if (trident > 0) {
        // IE 11 (or newer) => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    // other browser
    return false;
}

navigator.sayswho= (function(){ // detect browser and version
    var N= navigator.appName, ua= navigator.userAgent, tem;
    var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    M= M? [M[1], M[2]]: [N, navigator.appVersion, '-?'];

    return M;
})();


function removeNonAlphaCharacters(str)
	{
	return str.replace(/[^a-zA-Z0-9\.]/g, '')
	}

function removeNonAlphaCharactersButDashesOkay(str)
	{
	return str.replace(/[^a-zA-Z0-9\-]/g, '')
	}

function removeNonAlphaCharactersButDashesUnderscoresOkay(str)
	{
	return str.replace(/[^a-zA-Z0-9\-\_]/g, '')
	}

function removeNonValidUsernameChars(str)
	{
	return str.replace(/[^a-zA-Z0-9\_]/g, '')
	}

function getUrlVars(myurl) // myurl param is optional and defaults to current url
{
	myurl = typeof myurl !== 'undefined' ? myurl : window.location.href;
    var rock = new Object();
    var hashes = myurl.slice(myurl.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
    	rock[hash[0]] = urldecode(hash[1]);
    }
    return rock;
}

function uuid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function saveNewPassword()
	{
	$j('#passwordsDontMatch').hide();
	var data = {}
	if ($j('#oldPassword').length > 0)
		{
		data.oldPassword = $j('#oldPassword').val();
		}
	data.password1 = $j('#newPassword1').val();
	data.password2 = $j('#newPassword2').val();
	data.sessionid = $j('#forgotPasswordSessionID').val();
	data.SocialLogin = $j('#forgotPasswordSocialLogin').val();

	var SocialFoward = $j('#forgotPasswordSocialForward').val();
	if (SocialFoward == '') {
		SocialFoward = '/';
	}

	data.code = getUrlVars().code;

	if (data.password1 != data.password2)
		{
		$j('#passwordsDontMatch').text('The passwords you entered don\'t match.');
		$j('#passwordsDontMatch').fadeIn('fast');
		return false;
		}
	if (data.password1 == '')
		{
		$j('#passwordsDontMatch').html('Passwords can\'t be blank');
		$j('#passwordsDontMatch').show();
		return false;
		}
	if (data.password1.length < 6)
		{
		$j('#passwordsDontMatch').html('Password must be at least 6 characters long');
		$j('#passwordsDontMatch').show();
		return false;
		}

	$j("#newPasswordButton").prop("disabled",true);
	$j('.newPasswordSpinner').css('display','inline-block')
	var myPost = $j.post('/api/passwordReset/', data, function(response)
		{
		if (response.success == 1)
			{
				if(response.hasOwnProperty("auth_data")){
					if (window.ReactNativeWebView) {
						window.ReactNativeWebView.postMessage( JSON.stringify( { "event_type": "new_token", 'data': response[ 'auth_data' ] } ) );
					}
				}
			document.location.href = SocialFoward;
			}
		else
			{
			$j("#newPasswordButton").prop("disabled",false);
			$j('.newPasswordSpinner').hide();
			setTimeout(function()
				{
				alert(response.message);
				},100)
			}
		},'json');

		myPost.error(function(response)	{
			$j("#newPasswordButton").prop("disabled",false);
			$j('.newPasswordSpinner').hide();
			setTimeout(function() {
				alert(response.responseJSON.message);
			},100);
		});
		} // saveNewPassword

function homeFormClassError(elClass, msg)
	{
	$j('.' + elClass).html( msg );
	$j('.' + elClass).show();
	}

function homeFormError(id, msg)
	{
	$j('#' + id).html(msg);
	$j('#' + id).show();
	}

function disableButton(obj)
	{
	debug('disableButton()');
	$j(obj).addClass('disabled');
	$j(obj).attr('original',$j(obj).val());
	$j(obj).val('Wait...');
	}

function enableButton(obj)
	{
	debug('enableButton()');
	$j(obj).removeClass('disabled');
	$j(obj).removeAttr('disabled');
	$j(obj).val($j(obj).attr('original'));
	}

function signinSubmitCaptcha(obj, form)
	{
	$j('#signinButton').attr('originalVal',$j('#signinButton').val());
	$j('#signinButton').val('Please wait...');
	if ($j('#invisibleRecaptchaSigninSubmit').html() != '')
		{
		$j('#invisibleRecaptchaSigninSubmit').html('');
		grecaptcha.reset(widget_invisibleRecaptchaSigninSubmit);
		}
	else
		{
		widget_invisibleRecaptchaSigninSubmit = grecaptcha.render('invisibleRecaptchaSigninSubmit',
			{
			sitekey:captchaSiteKey?captchaSiteKey:"6Ld_vDcUAAAAABBf4b4MfIPqz5XA53JWQyOh6MX0",
			size: 'invisible',
			callback: function(token)
				{
				signinSubmit(obj, form, token)
				}
			})
		}
	grecaptcha.execute(widget_invisibleRecaptchaSigninSubmit);
	}

function signinSubmit(obj, form, token)
	{

	$j('.signinBoxNotification').hide();
	var data = {};
	data.email = $j('#inputSigninEmail').val();
	data.password = $j('#inputSigninPassword').val();
	data.sessionid = $j('#forgotPasswordSessionID').val();
	data.token = token;
	data.coupon = $j('#coupon').val();
	if (!isLatin1Only(data.email) || !isValidEmailAddress(data.email) || containsEmojis(data.email))
		{
		$j('#signinButton').val($j('#signinButton').attr('originalVal'));
		$j('.signinBoxNotification').fadeIn('fast');
		$j('.signinBoxNotification').text('Oops, invalid email address');
		return false;
	}

	var myPost = $j.post('/api/loginCheck/?now', data, function(response)
		{
		if (response.success == 1) {

			trackSigninEvent(response.userid, data.email);

			var loc = window.location.href.replace('#top','');
			window.location.href = loc;
		}
		else
			{
				if (response.redirect){
					window.location.href = response.redirect;
				} else {
					$j('#signinButton').val($j('#signinButton').attr('originalVal'));
					$j('.signinBoxNotification').fadeIn('fast');
					$j('.signinBoxNotification').text(response.message);
				}
			}
		},'json')
	myPost.error(function()
		{
		$j('#signinButton').val($j('#signinButton').attr('originalVal'));
		alert('Dang! There was an error. That didn\'t work. Try reloading this page.');
		})
	}


function forgotPasswordSubmitCaptcha(obj, form)
	{
	if ($j('#invisibleRecaptchaForgotPassword').html() != '')
		{
		$j('#invisibleRecaptchaForgotPassword').html('');
		grecaptcha.reset(widget_invisibleRecaptchaForgotPassword);
		}
	else
		{
		widget_invisibleRecaptchaForgotPassword = grecaptcha.render('invisibleRecaptchaForgotPassword',
			{
			sitekey:captchaSiteKey?captchaSiteKey:"6Ld_vDcUAAAAABBf4b4MfIPqz5XA53JWQyOh6MX0",
			size: 'invisible',
			callback: function(token)
				{
				$j('.forgotPasswordSpinner').show();
				forgotPasswordSubmit(obj, form, token)
				}
			})
		}
	grecaptcha.execute(widget_invisibleRecaptchaForgotPassword);
	}

function forgotPasswordSubmitCaptchaMobile(obj)
	{
	if ($j('#invisibleRecaptchaForgotPassword').html() != '')
		{
		$j('#invisibleRecaptchaForgotPassword').html('');
		grecaptcha.reset(widget_invisibleRecaptchaForgotPassword);
		}
	else
		{
		widget_invisibleRecaptchaForgotPassword = grecaptcha.render('invisibleRecaptchaForgotPassword',
			{
			sitekey:captchaSiteKey?captchaSiteKey:"6Ld_vDcUAAAAABBf4b4MfIPqz5XA53JWQyOh6MX0",
			size: 'invisible',
			callback: function(token)
				{
				$j('.forgotPasswordSpinner').show();
				forgotPasswordSubmitMobile(obj, token)
				}
			})
		}
	grecaptcha.execute(widget_invisibleRecaptchaForgotPassword);
	}


function forgotPasswordSubmitMobile( obj, token ){
	var data = {};
	data.email = $j('.inputForgotPasswordEmail:visible').first().val();
	data.sessionid = $j('#forgotPasswordSessionID').val();
	data.ismobile = true;
	data.token = token;
	$j('.signinBoxNotification').hide();
	$j('.forgotPasswordSpinner').show();
	var myPost = $j.post('/api/passwordResetEmail/',data,function(results)
		{
		$j('.forgotPasswordSpinner').hide();
		debug(results);
		$j('.signinBoxNotificationContainer').show();
		if (results.success == 1)
			{
			forgotYourPassword();
			$j('.signinBoxNotification').fadeIn('fast');
			$j('.signinBoxNotification').text('Done. We just emailed instructions.');
			$j('.js-hideOnSuccess').hide();
			$j('.js-showOnSuccess').show();

			firebaseEventTrigger( "forgot_password_sent_reset" );
			}
		else
			{
			$j('.signinBoxNotification').fadeIn('fast');
			$j('.signinBoxNotification').text('That email wasn\'t found.');
			$j('#signinForm').find('input').eq(0).focus();
			}
		},'json')
	myPost.error(function()
		{
		$j('.forgotPasswordSpinner').hide();
		alert('Oops, there was an error.');
		})
}


function forgotPasswordSubmit(obj, form, token)
	{
	var data = {};
	data.email = $j('.inputForgotPasswordEmail:visible').first().val();
	data.sessionid = $j('#forgotPasswordSessionID').val();
	data.token = token;
	$j('.signinBoxNotification').hide();
	$j('.forgotPasswordSpinner').show();
	var myPost = $j.post('/api/passwordResetEmail/',data,function(results)
		{
		$j('.forgotPasswordSpinner').hide();
		debug(results);
		$j('.signinBoxNotificationContainer').show();
		if (results.success == 1)
			{
			forgotYourPassword();
			$j('.signinBoxNotification').fadeIn('fast');
			$j('.signinBoxNotification').text('Done. We just emailed instructions to you.');
			}
		else
			{
			$j('.signinBoxNotification').fadeIn('fast');
			$j('.signinBoxNotification').text('That email wasn\'t found.');
			$j('#signinForm').find('input').eq(0).focus();
			}
		},'json')
	myPost.error(function()
		{
		$j('.forgotPasswordSpinner').show();
		alert('Oops, there was an error.');
		})
	}

function hashObj(obj)
	{
	return cyrb53(JSON.stringify(foo))
	}

function getCaptchaToken(cb, eID, action){
	if (window.captchaProcessor === 'turnstile') {
		return getTokenTurnstile(function(token) {
			// console.log(`Challenge Turnstile Success -- ${token}`);
			$("#turnstile-container").addClass('hidden');
			cb(token);
		}, eID, action);
	} else {
		return getTokenCaptchaV2(function(token) {
			// console.log(`Challenge reCaptchaV2 Success -- ${token}`);
			cb(token);
		}, eID);
	}
}

function getTokenTurnstile(cb, eID, action = 'unset'){
	turnstile.ready(function () {
		let $container = $("#turnstile-container");
		$container.removeClass('hidden');
		let $parent = $container;
		let showBackground = true;
		if ($(`#${eID}`).length) {
			$(`#${eID}`).append($container);
			$parent = $(`#${eID}`);
			showBackground = false;
		}
		if (window.tsWidgetId) {
			// if (!turnstile.isExpired(window.tsWidgetId)) {
			// 	return cb(turnstile.getResponse(window.tsWidgetId));
			// }
			turnstile.reset(window.tsWidgetId);
		} else {
			window.tsWidgetId = turnstile.render('#turnstile-container', {
				sitekey: window.turnstileSiteKey,
				appearance: 'interaction-only',
				retry: 'never',
				action: action,
				callback: cb,
				"before-interactive-callback": ()=>{
					$parent.addClass("visible");
					$(".turnstile-badge").addClass("visible");
					if (showBackground) {
						$(".turnstile-badge").addClass("with-background");
					}
				},
				"after-interactive-callback": ()=>{
					$parent.removeClass("visible");
					$(".turnstile-badge").removeClass("visible");
				}
			});
		}
	});
}

function getTokenCaptchaV2(cb, eID) {
	if(typeof window.c_widgets === 'undefined') {
		window.c_widgets = {};
	}
	if ($j(`#${eID}`).html() != '') {
		$j(`#${eID}`).html('');
		grecaptcha.reset(window.c_widgets[eID]);
	} else {
		window.c_widgets[eID] = grecaptcha.render(eID, {
			sitekey: captchaSiteKey ? captchaSiteKey : "6Ld_vDcUAAAAABBf4b4MfIPqz5XA53JWQyOh6MX0",
			size: 'invisible',
			callback: cb
		});
	}
	grecaptcha.execute(window.c_widgets[eID]);
}

function registrationSubmitCaptcha(obj, form){
	disableButton(obj);
	var indexOfObj = $j('.register-button').index(obj);
	if (typeof widget_invisibleRecaptchaRegistrationSubmit == 'undefined') {
		widget_invisibleRecaptchaRegistrationSubmit = {};
	}

	// begin: make div
	var divName = 'invisibleRecaptchaRegistrationSubmit' + indexOfObj;
	var divBody = `<div id="${divName}" class="captcha-div"></div>`;
	if ($j(obj).length) {
		$j(obj).before(divBody);
	} else {
		$j('.homeFormInputContainer').first().closest('form').append(divBody);
	}
	var captchaDiv = document.getElementById(divName);
	// end: make div

	var eventData = {
		type: 'recaptcha-turnstile-experiment',
		eventName: 'registration-start',
		action: getCookie('LD_REP_ID'),
		notes: JSON.stringify({"page": location.pathname, 'js': 'header'}),
		details: JSON.stringify({
			"source_type": (window.captchaProcessor ? window.captchaProcessor : 'recaptcha').slice(0,4)
		})
	};
	$j.post('/api/kinesisEvents/', eventData);

	getCaptchaToken((token) => {
		eventData.eventName = 'token-received'
		$j.post('/api/kinesisEvents/', eventData);

		// console.log(`Challenge ${window.captchaProcessor} Success ${token}`);
		var sanctionedCountries = ['CD', 'CG', 'CU', 'IR', 'KP', 'SD', 'SS', 'SY']; // check for sanctioned countries

		// begin: init variable
		if (typeof window.countryCode == 'undefined') {
			window.countryCode = '';
		}
		// end: init variable

		if (sanctionedCountries.indexOf(window.countryCode.toUpperCase()) == -1) {
			// if counry blank or not sanctioned
			registrationSubmit(obj, form, token)
		} else {
			sweetAlertConfirm('Country Issue (' + window.countryCode + ')',
				'DistroKid\'s bank partners may not be able to send any payments to your country (' + window.countryCode + '). Sign up anyway?',
				function () {
					registrationSubmit(obj, form, token);
				}, function () {
					enableButton(obj);
				}, 'question', 'Proceed', 'Cancel');
		}
	}, divName, 'header_registration_submit');
}

function regFormKeypress(e,obj)
	{
	if(e && e.keyCode == 13)
		{
		$j(obj).closest('form').find('.register-button').click();
		}
	}

// validates addresses containing .edu or .ac. for our student discount program
function validateEduEmail(email){

	var eduReg = /^[\w._+-]+@([-\w]+\.)*[-\w]+\.edu/;
	var acReg = /^[\w._+-]+@([-\w]+\.)*[-\w]+\.ac./;

	if (!eduReg.test(email) && !acReg.test(email)){
		return false;
	}

	domain = email.split('@')[1];
	restrictedDomains = ["student.edu", "students.edu", "gmail", "omail", "mailer", "mailers", "distrokid", "st.edu", "staff.edu"];

	return !restrictedDomains.some(function(restrictedDomain) {
		return domain.includes(restrictedDomain);
	});

}

function registrationSubmit(obj, form, token)
	{
	obj = typeof obj !== 'undefined' ? obj : $j('.loginSubmitButton:visible').first();
	form = typeof form !== 'undefined' ? form : $j('#registrationForm');
	var data = {};

	// begin: stuff to handle when there are multiple reg forms with multiple IDs
	var thisForm = {};
	thisForm.closestForm = $j(obj).closest('form');
	thisForm.email = $j(obj).closest('form').find('[id="inputEmail"]');
	thisForm.password = $j(obj).closest('form').find('[id="inputPassword"]');
	thisForm.password2 = $j(obj).closest('form').find('[id="inputPassword2"]');
	thisForm.phone = $j(obj).closest('form').find('[id="inputPhone"]');
	thisForm.passwordMatch = $j(obj).closest('form').find('[id="errorPasswordMatch"]');
	thisForm.errorPassword = $j(obj).closest('form').find('.errorPassword');
	thisForm.errorEmail = $j(obj).closest('form').find('[id="errorEmail"]');
	thisForm.errorPhone = $j(obj).closest('form').find('[id="errorPhone"]');
	thisForm.specialAccessError = $j(obj).closest('form').find('[id="specialAccessError"]');
	thisForm.obj = $j(obj);
	debug('thisForm');
	debug(thisForm);

	if (form.length > 1)
		{
		form = $j(obj).closest('form')[0];
		}
	// end: stuff to handle when there are multiple reg forms with multiple IDs

	var isSiteAccessLandingPage = $('#siteAccessToken').val() ? true : false;

	data.artistName = '';
	data.email = $j(thisForm.email).val().toLowerCase();
	data.password = $j(thisForm.password).val();
	data.token = token;
	var APIsRunning = 0;
	$j('.homeError').hide();
	// error handling for attempted email signups on student discount page for non-.edu addresses
	if (typeof $j(thisForm.email).attr('validateDomain') != 'undefined' && (!validateEduEmail($j(thisForm.email).val()))) {
		// error markup (styles on Figma are different from standard error styling)
		var errorContainer = '<div class="flex-container" style="display: flex; color: #000; margin-bottom: 10px;">\
							  	<div class="flex-child" style="flex: 0.2; text-align: center"><i class="fa fa-exclamation-triangle" \
							  		aria-hidden="true" style="font-size: 20px; margin-top: 6px; color: #B91C1C"></i></div> \
							  	<div class="flex-child" style="flex: 2;">The email you entered is not eligible for the student discount. \
							    	Please try a different email address (.edu).\ </div></div>'
        $j(thisForm.errorEmail).html(errorContainer).show();
	}
	if ($j(thisForm.password).val() != $j(thisForm.password2).val())
		{
		$j(thisForm.passwordMatch).show();
		$j('.js-passwordinput').on('keypress', function(e){
			$j(thisForm.passwordMatch).hide();
		});
		enableButton(obj);
		return false;
		}
	if (data.password.trim().length < 6)
		{
		$j(thisForm.errorPassword).html('The password must be at least 6 characters long').show();
		// homeFormClassError('errorPassword','The password must be at least 6 characters long');
		$j(thisForm.password).focus();
		$j(thisForm.password).on('keypress', function(e){
			$j('.js-password').hide();
		});
		}

	if ($j(thisForm.password2).val().trim().length < 6)
		{
		$j('.js-password2').html('The password must be at least 6 characters long').show();
		// homeFormClassError('errorPassword','The password must be at least 6 characters long');
		$j(thisForm.password2).focus();
		$j(thisForm.password2).on('keypress', function(e){
			$j('.js-password2').hide();
		});
		}

	if (data.email.trim() == '')
		{
		$j(thisForm.errorEmail).html('Enter your email address').show();
		// homeFormError('errorEmail','Enter your email address');
		$j(thisForm.email).focus();
		$j(thisForm.email).on('keypress', function(e){
			$j('.js-email').hide();
		});
		}
	else if (!isLatin1Only(data.email) || !isValidEmailAddress(data.email.trim()) || containsEmojis(data.email))
		{
		$j(thisForm.errorEmail).html('That\'s not a valid email address, yo.').show();
		// homeFormError('errorEmail','That\'s not a valid email address, yo.');
		$j(thisForm.email).focus();
		$j(thisForm.email).on('keypress', function(e){
			$j(thisForm.errorEmail).hide();
		});
		}
	else
		{
		APIsRunning++;
		var myPost = $j.post('/api/dupeCheck/email/',data,function(response)
			{
			debug(response);
			if (response.occurrences > 0)
				{
				$j(thisForm.errorEmail).html('Email already registered with DistroKid').show();

				$j(thisForm.email).focus();
				}
			APIsRunning = APIsRunning - 1;
			},'json')
		myPost.error(function()
			{
			alert('Oops, there was an error');
			})
		}

	// If a Phone field is present on this form
	if ((thisForm.phone.length > 0)){

		if ((thisForm.phone.val() == "")){
			$j(thisForm.errorPhone).html('Enter your phone number').show();
			$j(thisForm.phone).focus();
			$j(thisForm.phone).on('keypress', function(e){
				$j(thisForm.errorPhone).hide();
			});
		}
		else if ((typeof phoneInput != "undefined") && (!phoneInput.isValidNumber())){
			$j(thisForm.errorPhone).html('Enter a valid phone number').show();
			$j(thisForm.phone).focus();
			$j(thisForm.phone).on('keypress', function(e){
				$j(thisForm.errorPhone).hide();
			});
		}
	}


		var checking = setInterval(function()
			{
			if (APIsRunning == 0)
				{
				clearInterval(checking);
				if ($j('.homeError').is(':visible'))
					{
					firebaseEventTrigger( "sign_up_form_error" );
					enableButton(obj);
					return false;
					}
				else
					{

					// begin: is there anything else we should be saving? i.e. HyperFollow private messaging
					$j('.saveThisContentForAfterWeRegister').each(function()
						{
						var myName = $j(this).attr('name');
						var myValue = $j(this).val()
						$j('<input type="hidden">').attr({
							name: myName,
							value: myValue
						}).appendTo(form);
						})
					// end: is there anything else we should be saving? i.e. HyperFollow private messaging

					debug(form);

					if (isSiteAccessLandingPage) {

						specialData = {};
						specialData.userEmail = data.email;
						specialData.userPassword = data.password;
						specialData.userToken = $('#siteAccessToken').val();

						$.ajax({
							type: "POST",
							url: "/api/flcloud/signup/",
							data: specialData,
							dataType: "json",
							success: function (result, status, xhr) {
								debug(result);
								window.location.href="/plan/musician/thanks/";
							},
							error: function (result) {
								debug(result);
								var rslt = result.responseJSON;
								$j(thisForm.specialAccessError).html(rslt.error).show();
								enableButton(obj);
								return false;
							}
						});

					} else {
						form.submit();
					}

					}
				}
			},100)
		}

function trackSigninEvent(userid, email){
	try {
		const event = "Signed In";
		const properties = {
			"user_id" : userid,
			"email"   : email,
		}

		window.dkDataLayer.push({
			type: "event",
			name: event,
			details: properties
		});
	}
	catch (error) {
		console.log(error);
	}
}

function forgotYourPassword()
	{
	var originalHTML = $j('#signinBox').html();
	var newHTML = $j('#templateForgotPassword').html()
	$j('#signinBox').data('originalHTML',originalHTML);
	$j('#signinBox').html(newHTML);
	if (navigator.sayswho[0] != 'MSIE')
		{
		$j('#signinForm').find('input').eq(0).focus();
		}
	$j('#templateForgotPassword').html(originalHTML);
	$j('.signinBoxNotification').hide();
	}

function checkEnter(e, obj, form, submitButtonID, submitFunction)
{
	if(e && e.keyCode == 13)
		{
		submitFunction($j('#' & submitButtonID), form);
		return false;
		}
}

function runFunctionOnEnter(e,func)
// usage: onkeydown="runFunctionOnEnter(event,functionName);"
{
	if(e && e.keyCode == 13)
		{
		func();
		return false;
		}
}

function isSafari()
	{
	return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	}

var scrolling = function(e, c) {
  e.scrollIntoView();
  if (c < 5) setTimeout(scrolling, 300, e, c + 1);
};
var ensureVisible = function(e) {
  setTimeout(scrolling, 300, e, 0);
};

function isMobile()
	{
	var isMobile = false; //initiate as false
	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
	    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
	    isMobile = true;
	}
	return isMobile
	}

function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}

$j(window).bind('orientationchange',function()
	{
	$j(window).scrollLeft(0); // fixes some weird bug, sort of not really, when you rotate your iPhone back & forth
	})

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
};

function isLatin1Only(emailAddress) {
	var pattern = new RegExp(/^[\x00-\x7F]*$/);
	return pattern.test(emailAddress);
}

function preload(image) {
	var pic1= new Image();
	pic1.src = image;
}

function preloadAudio(url) {
	var myAudio = new Audio();
	myAudio.src = url;
	myAudio.load();
	return url
}

function openSignInAria(event) {
	var KEY_ENTER = 13;
	var KEY_SPACE = 32;
	var KEY_ESCAPE = 27;

	switch (event.which) {
		case KEY_ENTER:
		case KEY_SPACE:
		case KEY_ESCAPE: {

			openSignIn();

			event.stopPropagation();
			return false;
		}

	}
	return true;

} // end button keydown handler

// keyboard close signin modal
function signinBoxContainerClose(event) {
	var KEY_ESCAPE = 27;

	switch (event.which) {

		case KEY_ESCAPE: {

			if ($j('.signinBox').is(':visible')) {
				$j('.signinBox').hide();
			}

			hideMobileURLBar();

			event.stopPropagation();
        	return false;
		}

	}
	return true;
}

function openSignIn()
	{

	if ($j('.signinBox').is(':visible'))
		{
		$j('.signinBox').hide();
		}
	else
		{
		$j('.signinBox').show();
		}
	if (navigator.sayswho[0] != 'MSIE')
		{
		$j('#inputSigninEmail').focus();
		}
	hideMobileURLBar();
	}

function hideMobileURLBar()
	{
	/mobi/i.test(navigator.userAgent) && !location.hash && setTimeout(function () { // hides URL bar on mobile
	  if (!pageYOffset) window.scrollTo(0, 1);
	}, 0);
	}

function parseJwt( token ){
	var base64Url = token.split( '.' )[ 1 ];
	var base64 = base64Url.replace( /-/g, '+' ).replace( /_/g, '/' );
	var jsonPayload = decodeURIComponent( atob( base64 ).split( '' ).map( function( c ){
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	} ).join( '' ) );
	return JSON.parse( jsonPayload );
};

$j(function(){
	$j("#logo_gremlin")
		.on("mousedown", function(){
			$j(this).css("top", "2px");
		})
		.on("mouseup", function(){
			$j(this).css("top", "0");
		});
	initAnnouncementBanner();
}); // ready

$j(document).ready(function()
	{
	hideMobileURLBar();
	})

$j(document).mouseup(function (e)
{
    var container = $j(".dismissOnOutsideClick");
	if ($j(e.target).hasClass('outsideClickLink'))
		{
		return false;
		}
    if (container.has(e.target).length === 0)
    {
	container.hide();
    }
});

$j(document).ready(function()
	{
	$j('input, textarea').placeholder();
	$j('img', '#img').kenburns({debug:false});
	})

function userIsLoggedIn() {
	var bRet = false;
	$j.ajax({
		url:"/api/isLoggedIn/index.cfm",
		type:"GET",
		async: false,
		cache: false,
		timeout: 30000,
		dataType: "json",
		success: function(stUser) {
			var iParsed = parseInt(stUser.userid);
			if (isNaN(iParsed) || iParsed == 0) {
				bRet = false;
			} else {
				bRet = true;
			}
		}
	});
	return bRet;
}


/**
 * Encode to Base64 allowing non-Latin1 characters
 * @function base64Encode
 * @memberOf header
 * @param {string} str - String to encode
 * */
function base64Encode(str) {
	return btoa(encodeURIComponent(str));
};

/**
 * Decode from Base64 allowing non-Latin1 characters
 * @function base64Decode
 * @memberOf Header
 * @param {string} b64 - String to decode
 * */
function base64Decode(b64) {
	return decodeURIComponent(atob(b64));
};

/**
 * @function logAbTest
 * @memberOf Header
 * @param {*} event
 * @param {*} details
 */
function logAbTest(event, details) {
	var abtestData = $("#abtest").data();
	if (!abtestData)
		return;
	if (!details)
		details = {};

	var pageData = $("#page-data").data();
	if (pageData)
		details.pageData = pageData;

	details.url     = document.location.href;
	details.testId  = abtestData.id;
	details.variant = abtestData.variant;
	details.event   = abtestData.event;

	distroLog("abtest-" + abtestData.id, abtestData.variant + ":" + event, "", me.id, 0, JSON.stringify(details));
}


function firebaseEventTrigger(eventType){
	reactNativePost( { "event_type": "firebase_event", "event": eventType } );
}

function reactNativePost(msg){
	debug('not running mobile post');
}

function initAnnouncementBanner() {
	$(".announcement-banner-container").on("click", ".close-banner", (e)=> {
		var target = $(e.currentTarget);
		var container = target.closest(".announcement-banner-container");
		var name = container.data("name");
		notificationDismiss(`announcement_closed_${name}`);
		// setCookie(`announcement_closed_${name}`,'1');
		container.slideUp();
		console.log('closed announcement',name);
	})
}

// Dispatch a Custom Event to indicate header.js has finished loading and these
// functions are available. Gives finer timing than DOMContentLoaded in most cases.
const HeaderJSLoadedEvent = new CustomEvent("header-js-loaded");
window.dispatchEvent(HeaderJSLoadedEvent);
window.distrokid = window.distrokid || {};
window.distrokid.headerJSLoaded = true;
