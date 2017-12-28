/**
 * Backend communication.
 */

const backendUrlBase = "http://partlight.tech/scripts/fuzz/backend.php?";

export default class Backend {

    //  Response codes
    static POSITIVE = "2";
    static NEGATIVE = "3";
    static FAILED = "1";
    static SUCCESS = "0";

    /**
     * Performs a default backend request.
     * @param {String} getParams GET parameters.
     * @param {Array} postParams Optional POST parameters.
     * @param {function} callback Success callback.
     */
    static request(getParams, postParams, callback){
        var settings = {};

        settings.method = postParams ? "POST" : "GET";
        
        if (postParams) {
            settings.headers = {
                "Content-Type" : "application/x-www-form-urlencoded"
            };
            
            settings.body = "";
            for (let name in postParams) {
                settings.body += encodeURIComponent(name) + "=" +
                    encodeURIComponent(postParams[name]);
                settings.body += "&";
            }
            //  Remove last delimiter
            settings.body = settings.body.substr(0, settings.body.length - 1);
        }
        

        fetch(backendUrlBase + getParams, settings).then((response) => 
            response.text()
        ).then((responseText) => {
            callback(responseText);
        });
    }
}