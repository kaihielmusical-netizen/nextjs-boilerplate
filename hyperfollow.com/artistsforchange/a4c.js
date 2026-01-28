

$j(function() {
    
    var donateInstructions  = $j('.donateInstructions');

   

    function justiceShowMeHow2(orgs, orgKey){
        Swal.fire({
            'title':	'Auto-donate instructions',
            'type': 	'success',
            'html':		'Sign into DistroKid, click "Splits", then add the email address below: <br><br><strong>'+orgs[orgKey].name+':</strong><br><span class="copyText">'+ orgs[orgKey].email+' <i class="fa fa-copy"></i></span><br><br> Donate any percentage you\'d like. That\'s it!'
        });
    }

    
    function justiceShowMeHow(){
        Swal.fire({
            'title':	'Auto-donate instructions',
            'html':		'<div id="instructionsChooseOrg">'+orgDropDown+'</div><div id="orgSpecificDonateInstructions"></div></div>'
        });
        var orgSelector                     = $j('#orgSelector'); //need to find this again in the dom when SWAL recreates it each time.
        var instructionsChooseOrg           = $j('#instructionsChooseOrg');
        var orgSpecificDonateInstructions   = $j('#orgSpecificDonateInstructions');
        orgSelector.change(function(){
            orgSelectorUpdate(orgSelector, orgSpecificDonateInstructions);
        });
        orgSelectorUpdate(orgSelector, orgSpecificDonateInstructions);
    }

    donateInstructions.click(function(){
        justiceShowMeHow();
    });

    function orgSelectorUpdate(orgSelector, orgSpecificDonateInstructions){
        console.log(orgSelector.children('option:selected').val());
        if (orgSelector.children('option:selected').val() != '') {
            var email = orgSelector.children('option:selected').data('email');
            orgSpecificDonateInstructions.html(
                '<div class="donationSubInstruction">Sign into DistroKid, click "Splits", <br>then add the email address below:</div><span class="copyText copy-btn" data-type="attribute" data-attr-name="data-clipboard-text" data-model="couponCode" data-clipboard-text="'+ email +'">'+ email +'<i class="fa fa-copy"></i></span><span id="copyNotificationWrapper"></span><div>Donate any percentage you\'d like. That\'s it!</div>'
            )
            $('.copy-btn').on("click", function(){
                value = $(this).data('clipboard-text'); //Upto this I am getting value
                copyNotificationWrapper = $('#copyNotificationWrapper');
                var $temp = $("<input>");
                  $("body").append($temp);
                  $temp.val(value).select();
                  document.execCommand("copy");
                  $temp.remove();
                  copyNotificationWrapper.html('<div class="copiedNotification">Copied!</div>')
                  
            })
        } else {
            orgSpecificDonateInstructions.html(
                ''
            )
        }
        
    }
    
    function copyText(element) {
        /* Get the text field */
        console.log()
      
        /* Select the text field */
        element.select();
        element.setSelectionRange(0, 99999); /* For mobile devices */
      
        /* Copy the text inside the text field */
        document.execCommand("copy");
      
        /* Alert the copied text */
        alert("Copied the text: " + copyText.value);
      } 
    $j('.lazy').Lazy({
        // your configuration goes here
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        visibleOnly: true,
        onError: function(element) {
            console.log('error loading ' + element.data('src'));
        }
    });
});