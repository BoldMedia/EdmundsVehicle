(function(window) {
    'use strict';

    var EdmundsVehicle = function(apiKey, state, view) {
        this.baseUrl = 'https://api.edmunds.com/api/vehicle/v2/makes?fmt=json';
        this.apiKey = apiKey;
        this.view = view || 'basic';

        if (state === 'new' || state === 'used' || state === 'future') {
            this.state = state;
        }
    };

    EdmundsVehicle.prototype.getMakesAndModels = function(year, cb) {
        if (!year) {
            throw new TypeError('year cannot be an instance of ' + typeof year);
        }

        this.sendRequest(this.generateFinalUrl(year), cb);
    };

    // @rawMakes (property) must be the makes value from the response of
    // a @getMakesAndModels call.  i.e:
    //
    // edmunds.getMakesAndModels("2001", function(response) {
    //     var makes_and_models = edmunds.extractMakesAndModels(response.makes);
    // });
    EdmundsVehicle.prototype.extractMakesAndModels = function(rawMakes) {
        var makeIndex = null,
            modelIndex = null,
            makeName = null,
            makesAndModels = {};

        for (makeIndex in rawMakes) {
            makeName = rawMakes[makeIndex].name;
            makesAndModels[makeName] = [];

            for (modelIndex in rawMakes[makeIndex].models) {
                makesAndModels[makeName].push(rawMakes[makeIndex].models[modelIndex].name);
            }
        }

        return makesAndModels;
    };

    EdmundsVehicle.prototype.generateFinalUrl = function(year) {
        var finalURL = this.baseUrl + '&api_key=' + this.apiKey + '&year=' + year
                                       + '&view=' + this.view;

        if (this.state) {
            finalURL += '&state=' + this.state;
        }

        return finalURL;
    };

    EdmundsVehicle.prototype.sendRequest = function(url, cb) {
        var xmlhttp = new XMLHttpRequest(),
            instance = this;

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === xmlhttp.DONE) {
                if (xmlhttp.status === 200) {
                    return cb(JSON.parse(xmlhttp.response));
                }

                if (xmlhttp.status >= 400 && xmlhttp.status <= 499) {
                    return instance.handleFourHundredError(xmlhttp.status);
                }

                if (xmlhttp.status >= 500 && xmlhttp.status <= 599) {
                    return instance.handleFiveHundredError();
                }
            }
        };
        xmlhttp.open('GET', url, true);
        xmlhttp.send();
    };

    EdmundsVehicle.prototype.handleFourHundredError = function(httpStatus) {
        if (httpStatus === 400) {
            throw new Error('There seems to be an issue with the generated URL, ' +
                            'please submit a ticket over at our GitHub repository.');
        }

        if (httpStatus === 401 || httpStatus === 403) {
            throw new Error('either your API key is wrong, inactive or you do ' +
                            'do not have access to this resource. Check to make ' +
                            'sure you are using the correct API key.');
        }
    };

    EdmundsVehicle.prototype.handleFiveHundredError = function() {
        throw new Error('There seems to be an issue with Edmunds\' API, check out ' +
                        'their status page, over at http://edmunds.statuspage.io/, ' +
                        'for more information.');
    };

    window.EdmundsVehicle = EdmundsVehicle;
})(window);
