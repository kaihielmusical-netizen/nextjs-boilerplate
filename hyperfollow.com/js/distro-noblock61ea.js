"use strict";

/**
 * @returns true if window.me.plan is label or musician 
 */
function hasMusicDistSubscription() {
    return (window.me != null) && (window.me.plan != null) && ["label", "musician"].includes(window.me.plan);
}

/**
 * @param   input a string 
 * @returns a lowercase version of the input with all spaces and underscores replaced with a hyphen
 */
function toKebabCase(input) {
    return input.toLowerCase().replace(/\s+|_/g, '-');
}

/**
 * @param   input a string 
 * @returns a lowercase version of the input with all spaces and hyphens replaced with an underscore
 */
function toSnakeCase(input) {
    return input.toLowerCase().replace(/\s+|-/g, '_');
}

/**
 * returns true if document.location.pathname contains any of the paths passed
 * 
 * @param paths a string or an array of strings
 * @param prefixMatch if true then a prefix match is checked 
 */
function isPathIn(paths, prefixMatch=false) {

    if (paths.length == 0)
        return false;

    if (!Array.isArray(paths))
        paths = [ paths ];

    const fnExact  = (p => document.location.pathname == p);
    const fnPrefix = (p => document.location.pathname.indexOf(p) == 0);
    const fn = prefixMatch ? fnPrefix : fnExact;

    return paths.some(fn);
}

/**
 * from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
 */
async function digestMessage(message, algo="SHA-1") {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest(algo, msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

$(function(){

    if (window.analytics && window.me) {

        // Segment identify
        if (window.me.email && window.localStorage) {
            let me = window.me;
            let hashPromise = digestMessage(`${me.id}:${me.email}`);    // we can change the arg to force identify when we add new traits
            hashPromise.then(digest => {
                if (!window.localStorage.segmentIdentified || (window.localStorage.segmentIdentified != digest)) {
                    window.localStorage.segmentIdentified = digest;
                        let userId = me.id.toString();
                        let traits = {
                            email: me.email,
                        };
                        console.debug("identify to api.segment.io/v1/i");
                        window.analytics.identify(userId, traits);
                }
            })
            .catch(err => {
                console.error("error", err)
            });
        }

        // Segment track
        if (isPathIn([ "/plan/" ])) {
            var event = "Plans Viewed";
            var properties = {
                has_existing_subscription: hasMusicDistSubscription()
            };

            window.dkDataLayer.push({
                type: "event",
                name: event,
                details: properties
            });
        }

        //* DC-12085
        if (isPathIn([ "/plan/musician/", "/plan/musicianplus/", "/plan/ultimate/", "/plan/label/" ])) {
            // update pageData if we have a select list for label plans
            function updatePageDataIfNeeded() {

                var labelPricesByArtists = $("#labelPrice").data("labelPricesByArtists");
                var numArtists = $("#subscriptionPlan :selected").text();
                var planNameFromURL = window.location.pathname.split('/')[2];
                var coupon = (new URLSearchParams(window.location.search)).get('c');

                if (!labelPricesByArtists || !numArtists)
                    return;

                $("#page-data").data("numArtists", numArtists);
                $("#page-data").data("planPrice", labelPricesByArtists[numArtists]);
                $("#page-data").data("planNameFromURL", planNameFromURL);
                $("#page-data").data("coupon", coupon);
            }

            updatePageDataIfNeeded();

            var pageData = $("#page-data").data();
           
            var event = "Checkout Started";
            var properties = {
                user_id:         me.id,
                value:           pageData.planPrice,
                revenue:         pageData.planPrice,
                tax:             "",
                discount:        pageData.discountAmount,
                coupon:          pageData.coupon,
                currency:        $('.checkout-form').data('wallet-currency'),
                products: [              
                  {                      
                    name: pageData.planNameFromURL,
                    brand: 'distrokid',
                    price: pageData.planPrice,
                    quantity: 1,
                    category: "subscription",
                    variant: '1'
                  }
                ]
            }

            window.dkDataLayer.push({
                type: "event",
                name: event,
                details: properties
            });
        }

    } // if (window.analytics && window.me)

    /** process async-resolve */
    var arProcessed = {};
    $(".async-resolve").each((ix, el) => {

        var $el = $(el);
        if ($el.is(".bz-title")) {
            /** bandzoogle dynamic title */
            if (!(".bz-title" in arProcessed)) {        // call once even if referenced multiple times

                arProcessed[".bz-title"] = true;

                $.ajax("/api/bandzoogle/domainSuggestions/", {
                    success: function(data, textStatus, jqXHR) {

                        if (data.suggestion) {
                            // append the new span after the original one and remove the original
                            $(".bz-title")
                                .after(`<span class="bz-title async-resolved"><span class="linklike">${data.suggestion}</span> is available</span>`)
                                .remove();
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.error(errorThrown);     // TODO: log remotely?
                    }
                });
            }
        } // if ($el.is(".bz-title"))
    });

});
