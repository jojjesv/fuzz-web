import React, { Component } from 'react';
import {
    StripeProvider,
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCVCElement,
    injectStripe
} from 'react-stripe-elements';
import Backend from './Backend';

const apiKey = "pk_test_pUCEDa47lAxtjphvdwdVT7j2";

/**
 * Low-level card form.
 */
class _CardForm extends React.Component {
    render(){
        return (
            <form onSubmit={(e) => { e.preventDefault(); }}>
                <div style={{
                    marginBottom: '16px'
                }}>
                    <div style={{
                        marginTop: '18px',
                        marginBottom: '12px'
                    }}>
                        <label>Kortnummer <span className="reqd">*</span></label>
                        <div className="text-input">
                            <CardNumberElement />
                        </div>
                    </div>
                    <div className='half-column'>
                        <label>Utgångsdatum <span className="reqd">*</span></label>
                        <div className="text-input">
                            <CardExpiryElement />
                        </div>
                    </div>
                    <div className='half-column'>
                        <label>CVC-kod <span className="reqd">*</span></label>
                        <div className="text-input">
                            <CardCVCElement />
                        </div>
                    </div>
                </div>
            </form>
        )
    }
}

const CardForm = injectStripe(_CardForm);

/**
 * Stripe payment.
 */
export default class StripeIntegration extends React.Component {
    
    elements = null;
    cardNumElement = null;
    cardExpElement = null;
    cardCvcElement = null;

    //  Whether this component is ready to submit payment.
    canSubmit = true;
    cardForm = null;

    state = {
        orderData: null,
        submitCallback: null,
        submitCard: false,
        invalidCard: false
    }

    onError(){
        this.setState({
            invalidCard: true
        })
    }

    onRetrievedToken(token){

    }

    /**
     * Requests a Stripe token with current card credentials.
     * @param orderData {any} POST data for the rest of the form.
     * @param callback {function} Called if a card payment process response was retrieved.
     */
    submit(orderData, callback){
        this.cardForm.wrappedCreateToken().then((e) => {
            if (e.token) {
                Backend.request("action=process_card_payment", Object.assign({}, orderData, {
                    token_id: e.token.id
                }), (response) => {
                    callback(response);
                });
            } else if (e.error) {
                callback(null);
                console.log(e.error);
                this.onError();
            }
        }).catch((error) => {
            callback(null);
            console.log(error);
            this.onError();
        });
    }

    render() {
        const st = this.state;
        const props = this.props;
        return (
            <StripeProvider apiKey={apiKey}>
                <Elements>
                    <div style={{ display: props.hidden ? 'none' : 'initial' }}>
                        {
                            st.invalidCard &&
                            <p>Kontrollera kortuppgifter</p>
                        }
                        <CardForm ref={(e) => this.cardForm = e}/>
                    </div>
                </Elements>
            </StripeProvider>
        );
    }
}