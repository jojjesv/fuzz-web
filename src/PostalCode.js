import React, { Component } from 'react';
import Backend from './Backend';
import ShoppingCart from './ShoppingCart'
import './PostalCode.css';
import ETATimer from './PostOrder'
import logo from './assets/ic_logo_full_white.png'
import ic_continue from './assets/ic_continue_24dp.png'
import ic_loading_logo from './assets/ic_logo_white_36dp.png'
import ic_yes from './assets/ic_yes.png'
import ic_no from './assets/ic_no.png'
import Truck from './Truck'
import AnimatedComponent from './AnimatedComponent'
import ic_phone from './assets/ic_phone.png'
import app_store_badge from './assets/app_store_badge.svg'
import speech_notch_red from './assets/speech_notch_red.png'
import speech_notch_blue from './assets/speech_notch_blue.png'
import speech_notch_orange from './assets/speech_notch_orange.png'
import LoadingIndicator from './Loading';
import EventUtils from './EventUtils';
import { Transition } from 'react-transition-group'

const styles = {
    logoContainer: {
        textAlign: 'center',
        marginLeft: '50vw',
        position: 'absolute',
        transform: 'translateX(-50%)',
        top: '36px'
    },
    logoSubheader: {
        color: '#fafafa',
        fontSize: 24,
        margin: '8px 0 0 0'
    },
    inputContainer: {
        position: 'absolute',
        textAlign: 'center',
        top: '45vh',
        left: '50vw',
        transform: 'translate(-50%, -50%)',
    },
    inputHeading: {
        color: '#fafafa'
    },
    aboutContainer: {
        marginTop: '85vh',
    },
    aboutHeading: {
        textAlign: 'center',
        fontSize: '32px',
        color: '#fafafa'
    },
    aboutText: {
        width: '640px',
        padding: '48px',
        background: 'rgba(227, 82, 120, 0.75)',
        color: '#fafafa',
        margin: '8px auto 0 auto',
        fontSize: '16px',
        borderRadius: 24
    },
    postalCodeStatus: {
        position: 'absolute',
        transition: 'all 250ms'
    },
    postalCodeStatusHidden: {
        opacity: 0,
        transform: 'scale(0.75)'
    }
};

/**
 * An animated arrow.
 */
class ScrollDownArrow extends AnimatedComponent {
    state = {
        offset: 0
    }

    update(){
        this.setState({
            offset: (0.5 + Math.cos(Date.now() * 0.01)) * 2.5
        })
        super.update();
    }

    render(){
        return (
            <img style={{
                transform: 'translateY(' + this.state.offset + 'px) rotate(90deg)'
            }} alt="" src={ic_continue} />
        )
    }
}

/**
 * Component which manages postal code input.
 */
export default class PostalCode extends React.Component {

    /**
     * Inputted postal code.
     */
    postalCode = "";

    state = {
        loading: false,
        deliverable: false,
        undeliverable: false
    }

    checkDeliverableTimeout = null;

    /**
     * Whether to continue to main if the current postal code is deliverable, e.g. if entered directly in the URL.
     */
    continueIfDeliverable = false;

    constructor(props) {
        super(props);

        var storedPostalCode = document.cookie.match(/(^|;)\s*postalCode\s*=\s*([^;]+)/);

        if (storedPostalCode && storedPostalCode.length) {
            this.postalCode = storedPostalCode.pop();
            this.checkDeliverable();
        }
    }

    componentDidMount(){
        this.checkUrl();
    }

    /**
     * Checks the URL for a postal code param and submits it.
     */
    checkUrl(){
        let query = document.location.pathname;
        let queryMatch = query.match(/\/(\d+)/);
        if (queryMatch && queryMatch.length) {
            this.postalCode = queryMatch.pop();
            this.continueIfDeliverable = true;
            this.checkDeliverable();
        }
    }

    /**
     * Submits the postal code and maybe proceeds to the main screen.
     */
    checkDeliverable(){
        if (this.postalCode.length < 3) {
            if (this.state.deliverable || this.state.undeliverable) {
                this.setState({
                    deliverable: false,
                    undeliverable: false
                })
            }
            return;
        }

        this.setState({
            loading: true
        })
        let get = "out=check_deliverable&postal_code=" + this.postalCode;
        Backend.request(get, null, this.parseDeliverable.bind(this));
    }

    parseDeliverable(response){
        this.setState({
            loading: false
        });
        if (response == Backend.POSITIVE) {
            this.onDeliverable();
        } else {
            this.onNotDeliverable();
        }
    }

    /**
     * Called if the submitted postal code is deliverable.
     */
    onDeliverable(){
        if (this.continueIfDeliverable) {
            this.continueToMain();
        } else {
            this.setState({
                undeliverable: false,
                deliverable: true
            });
        }
    }

    /**
     * Settles on the inputted postal code and proceeds to main.
     */
    continueToMain(){
        document.cookie = "postalCode=" + this.postalCode +
        ";expires=Fri, 31 Dec 9999 23:59:59 GMT";

        ShoppingCart.postalCode = this.postalCode;

        this.props.parent.setState({
            postalCode: this.postalCode
        })
    }

    /**
     * Called if the submitted postal code isn't deliverable.
     */
    onNotDeliverable(){
        this.setState({
            deliverable: false,
            undeliverable: true
        })
    }

    /**
     * Handles a keydown event in the postal code input.
     */
    handlePCInputKeyDown(ev){
        EventUtils.filterNumericInput(ev)
    }

    scheduleCheckDeliverable(){
        if (this.checkDeliverableTimeout !== null) {
            clearTimeout(this.checkDeliverableTimeout);
        }
        this.checkDeliverableTimeout = setTimeout(this.checkDeliverable.bind(this), 300);
    }

    render(){
        let state = this.state;

        return (
            <div>
                <div className="bg" ref={
                    (e) => {
                        if (e) {
                            setTimeout(() => {
                                e.classList.add('visible');
                            }, 1000);
                        }
                    }
                }></div>
                <div style={styles.logoContainer}>
                    <img style={styles.logo} src={logo} alt="Logotyp" />
                    <h4 style={styles.logoSubheader}>Godis via nätet har aldrig varit enklare</h4>
                </div>

                <div style={styles.inputContainer}>
                    <h2 style={styles.inputHeading}>Skriv in ditt postnummer för att komma igång</h2>
                    <div>
                    <input id="postal-code-input" type="text"
                        maxLength="5"
                        defaultValue={this.postalCode}
                        onChange={(ev) => {
                            this.postalCode = ev.target.value;
                            this.scheduleCheckDeliverable();
                        }}
                        onKeyDown={this.handlePCInputKeyDown.bind(this)} />
                        

                        <div style={{
                                display: 'inline-block',
                                position: 'absolute',
                                margin: '18px 0 0 13px'
                            }}>
                            
                            <Transition in={!state.loading && state.undeliverable} unmountOnExit={true} timeout={{
                                enter: 0,
                                exit: 250
                            }}>
                                {
                                    (state) => (
                                        <img style={
                                            Object.assign({}, styles.postalCodeStatus, state == 'entering' || state == 'exiting' ? styles.postalCodeStatusHidden : {})
                                        } src={ic_no} alt="Kryss" />
                                    )
                                }
                            </Transition>
                            
                            <Transition in={!state.loading && state.deliverable} unmountOnExit={true} timeout={{
                                enter: 0,
                                exit: 250
                            }}>
                            {
                                (state) => (
                                    <img style={
                                        Object.assign({}, styles.postalCodeStatus, state == 'entering' || state == 'exiting' ? styles.postalCodeStatusHidden : {})
                                    } src={ic_yes} alt="Bock" />
                                )
                            }
                            </Transition>

                            <Transition in={state.loading} unmountOnExit={true} timeout={{
                                enter: 0,
                                exit: 250
                            }}>
                            {
                                (state) => (
                                    <img style={
                                        Object.assign(
                                            { animation: 'loading-spin 1s linear infinite' },
                                            styles.postalCodeStatus, state == 'entering' || state == 'exiting' ? styles.postalCodeStatusHidden : {}
                                        )
                                    } src={ic_loading_logo} alt="Laddar" />
                                )
                            }
                            </Transition>
                        </div>
                    </div>

                    <Transition in={state.deliverable} unmountOnExit={true} timeout={{
                        enter: 16,
                        exit: 250
                    }}>
                    {
                        (state) => {
                            let hidden = state == 'entering' || state == 'exiting';

                            return (
                                <div style={{
                                    transition: 'all 250ms',
                                    transformOrigin: '0 0',
                                    display: 'inline-block',
                                    position: 'absolute',
                                    transform: hidden ? 'scale(0.8)' : '',
                                    opacity: hidden ? 0 : 1,
                                    margin: '-8px 0 0 0'
                                }}>
                                    
                                    <button id="submit" onClick={this.continueToMain.bind(this)}>Fortsätt</button>

                                    <img src={ic_continue} alt="" style={{
                                        position: 'absolute',
                                        pointerEvents: 'none',
                                        transform: 'translate(10px, 7px)',
                                        zIndex: 24
                                    }} />
                                </div>
                            )
                        }

                    }
                    </Transition>

                    <Transition in={state.undeliverable} unmountOnExit={true} timeout={{
                        enter: 0,
                        exit: 250
                    }}>
                    {
                        (state) => {
                            let hidden = state == 'exiting' || state == 'entering';

                            return (
                                <div>
                                    <p id="undeliverable" style={{
                                        transition: 'all 250ms',
                                        transformOrigin: '0 0',
                                        opacity: hidden ? 0 : 1,
                                        transform: hidden ? 'scale(0.8) ' : ''
                                    }}>Just nu levererar vi inte till {this.postalCode}. Kolla förbi senare!</p>
                                </div>
                            );
                        }
                    }
                    </Transition>
                </div>

                <div style={styles.aboutContainer}>
                    <h3 style={styles.aboutHeading}>Sockra till din vardag <ScrollDownArrow /></h3>
                    <p style={styles.aboutText}>Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth.
                    Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth.
                    Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. 
                    </p>
                    <img src={speech_notch_red} style={{
                        marginLeft: '65vw'
                    }}/>

                    <div className="feature"
                        style={{
                            backgroundColor: 'rgba(90, 198, 217, 0.75)'
                        }}>
                        <h3 className="heading"><Truck /> Supersnabb leverans</h3>
                        <p className="text">Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth.
                        Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth.
                        Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. 
                        </p>
                    </div>
                    <img src={speech_notch_blue} style={{
                        marginLeft: '35vw'
                    }}/>

                    <div className="feature"
                        style={{
                            backgroundColor: 'rgba(246, 134, 32, 0.75)'
                        }}>
                        <h3 className="heading">
                            <img src={ic_phone} alt="Telefon" style={{
                                position: 'relative',
                                top: 16
                            }}/> Fuzz + smidighet = ❤️
                        </h3>
                        <p className="text">Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth.
                        Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth.
                        Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. Fuzz lorem ipsum dolor set ameth. 
                        </p>
                        <a href='http://play.google.com/store/?pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'
                            target='_blank'>
                            <img
                                alt='Ladda ned på Google Play'
                                src='https://play.google.com/intl/en_us/badges/images/generic/sv_badge_web_generic.png'
                                height='80'/>
                        </a>
                        <a href='http://play.google.com/store/?pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'
                            target='_blank'>
                            <img
                                style={{
                                    position: 'relative',
                                    bottom: '12px'
                                }}
                                alt='Hämta i App Store'
                                src={app_store_badge}
                                height='55'/>
                        </a>
                    </div>
                    <img src={speech_notch_orange} style={{
                        marginLeft: '65vw',
                        marginBottom: '64px'
                    }}/>
                </div>
            </div>
        );
    }
}