;(function() {
    const dataElement = document.querySelector("[data-social-signin]");
    if(dataElement === null) {
        throw "[data-social-signin] element not found when trying to initialize social-signin.";
    }

    const getRequiredAttribute = function(element, dataAttribute) {
        const attribute = element.getAttribute(dataAttribute);
        if(attribute == "" || attribute === null) {
            throw `[${dataAttribute}] cannot be empty, or null, when trying to initialize social signin`;
        }
        return attribute;
    }

    const domain = getRequiredAttribute(dataElement, "data-domain");
    const redirectUri = getRequiredAttribute(dataElement, "data-redirect-uri");
    const appClientId = getRequiredAttribute(dataElement, "data-app-client-id");
    const state = dataElement.getAttribute('data-state');

    const onSocialSigninClick = function(event) {
        const thisProvider = event.target.closest('[data-provider]').getAttribute('data-provider');
        const strTarget = `https://${domain}/oauth2/authorize?identity_provider=${thisProvider}&redirect_uri=${redirectUri}&response_type=CODE&client_id=${appClientId}&scope=email%20openid%20phone%20profile&state=${state}`;
        popup( strTarget, 'DistroKidSocial', 1000, 635 );
        return false;
    }

    const setupSocialSigninClicks = function() {
        document.querySelectorAll('[data-social-signup-button]').forEach(function(element) {
            element.addEventListener('click', onSocialSigninClick);
        });
    }

    if(document.readyState !== "loading") {
        setupSocialSigninClicks();
    }
    else {
        document.addEventListener("DOMContentLoaded", setupSocialSigninClicks);
    }
})();

function socialSweetAlerts(
    title, body, confirmCallback, type, confirmHtml
) {
    sweetAlertConfirm(
        title,
        body,
        confirmCallback,
        function() {},
        type,
        confirmHtml,
        null,
        null,
        null,
        false,
        false //dont allow to dismiss outside
    );
}

// Social Login - popup window sets this value
window.addEventListener("storage", function(event) {
    if (event.key == 'resultSocialLogin') {
        stResult = JSON.parse(event.newValue);
        forwardToUrl = stResult['urlForward'] || '/';

        const dataElement = document.querySelector('[data-social-signin]');
        const isMobileSocialView = dataElement.getAttribute("data-is-mobile-signin-view") || false;

        const redirectToForwardToUrl = function() {
            window.location.href = forwardToUrl;
        };
        const noop = function() {};
        const sweetAlertCallback = isMobileSocialView ? redirectToForwardToUrl : noop;

        localStorage.removeItem('resultSocialLogin');

        switch (stResult['error']) {
            case 'distrokid-account':
                socialSweetAlerts(
                    'Social Sign-in Error',
                    'Social Login is not available for DistroKid email address',
                    sweetAlertCallback,
                    'warning',
                    "Ok"
                );
                break;

            case 'distrokid-madmin':
                socialSweetAlerts(
                    'Social Sign In Error',
                    'Social sign-in can not be used on accounts with access to DistroKid Madmin',
                    sweetAlertCallback,
                    'warning',
                    "Ok"
                );
                break;

            case 'error':
                socialSweetAlerts(
                    'Oops',
                    'Sorry, Social sign-in is currently not working.<br><br>Please sign in with your DistroKid login',
                    sweetAlertCallback,
                    '',
                    "Ok"
                );
                break;

            case 'expired-login':
                socialSweetAlerts(
                    'Oops',
                    'Sorry, Social sign-in code has expired.<br><br>Please try login again.',
                    sweetAlertCallback,
                    '',
                    "Ok"
                );
                break;

            case 'invalid_request_email':
                socialSweetAlerts(
                    'Oops',
                    'Sorry, Looks like your Social sign-in is not configured to return email address. This is required by DistroKid. Please check your settings.',
                    sweetAlertCallback,
                    '',
                    "Ok"
                );
                break;

            default:
                if( stResult.hasOwnProperty( 'mobile_auth' ) ){
                    var mobileResponse = stResult['mobile_auth'];
                    var tempToken = mobileResponse[ 'token' ];
                    if( typeof mobileResponse.access_token != 'undefined' && typeof mobileResponse.token_type != 'undefined' && mobileResponse.token_type == 'bearer' ){
                        // Response contains the full access_token data struct needed for auth
                        mobileResponse[ 'event_type' ] = 'sign_in';
                        if( typeof mobileResponse.isfreeplan != 'undefined' && mobileResponse.isfreeplan == true ){
                            mobileResponse[ 'url' ] = "/mobileapp/webviews/plans.cfm?token=" + tempToken + "&isNewFreeSignIn=true";
                        }
                        reactNativePost(mobileResponse);
                    } else {
                        window.location.href = '/mobileapp/webviews/2fa/?token=' + tempToken + '&isMobileView=true&mobileDeviceId=' + mobileResponse[ 'deviceid' ] + '&mobileClientId=' + mobileResponse[ 'clientid' ];
                    }
                } else {
                    window.location.href = stResult.urlForward;
                }

                break;
        }
    }
});
