/**
 * Backend communication.
 */

const backendUrlBase = "http://partlight.tech/scripts/fuzz/backend.php?";

export default class Backend {
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
            settings.body = JSON.stringify(postParams);
        }

        fetch(backendUrlBase + getParams, settings).then((response) => 
            response.text()
        ).then((responseText) => {
            callback(responseText);
        });
    }
}