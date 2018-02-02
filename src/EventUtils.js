/**
 * Provides mainly event handlers.
 */
export default class EventUtils {
    static filterNumericInput(ev) {
        let keyCode = ev.keyCode;
        if (keyCode != 8 && keyCode != 37 && keyCode != 39 && (keyCode < 48 || keyCode > 57)) {
            //  Non-numeric
            ev.preventDefault();
        }
    }
}