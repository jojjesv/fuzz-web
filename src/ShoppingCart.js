import React, { Component } from 'react'
import Backend from './Backend';
import './ShoppingCart.css'
import Article from './Article';
import ModalDialog from './ModalDialog';
import StripeIntegration from './StripePayment'
import LoadingIndicator from './Loading';
import ic_card from './assets/ic_card.png';
import ic_cash from './assets/ic_cash.png';
import ic_message from './assets/ic_message.png';
import ic_person from './assets/ic_person_24dp.png';
import ic_phone from './assets/ic_phone_24dp.png';
import ic_location from './assets/ic_location_24dp.png';
import ic_floor from './assets/ic_floor.png';
import ic_door_code from './assets/ic_door_code.png';
import ic_expand from './assets/ic_expand.png';
import EventUtils from './EventUtils';
import CartItems from './CartItems'

//  Cookies for the shopping cart uses the sc_ prefix and a very short description
import cookie from 'react-cookies';

const styles = {
    articleLi: {
        display: 'inline-block'
    }
};

const previewItemCount = 6;

/**
 * Shopping cart view and management.
 */
export default class ShoppingCart extends ModalDialog {
    static addToCart(srcItem) {
        let item = {
            quantity: srcItem.quantity,
            cost: srcItem.cost,
            id: srcItem.id,
            name: srcItem.name,
            image: srcItem.image,
        }
        ShoppingCart.cartItems.push(item);

        const merged = ShoppingCart.mergedCartItems;

        if (merged.length == 0) {
            merged.push(item);
        } else {
            //  Add to merged cart
            for (let i = 0, n = merged.length - 1; i <= n; i++) {
                if (merged[i].id == item.id) {
                    merged[i].quantity += item.quantity;
                    merged[i].cost += item.cost;
                    break
                }

                if (i == n) {
                    //  Item doesn't exist in array
                    merged.push(item);
                }
            }
        }

        ShoppingCart.onCartChanged();

        if (ShoppingCart.onCartAddListener) {
            ShoppingCart.onCartAddListener();
        }
    }

    static removeFromCart(item){
        function remove(array, item) {
            for (let i = 0, n = array.length; i < n; i++) {
                if (array[i].id = item.id) {
                    array.splice(i, 1);
                    break;
                }
            }
        }

        remove(ShoppingCart.cartItems, item);
        remove(ShoppingCart.mergedCartItems, item);

        ShoppingCart.onCartChanged();
    }

    static onCartChanged(){
        let merged = ShoppingCart.mergedCartItems;
        let component = ShoppingCart.component
        let cartCost = ShoppingCart.cartCost();

        if (component) {
            component.setState({
                cartItems: merged,
                cartCost: cartCost
            });
            if (merged.length == 0) {
                component.dismiss();
            }
        }

        let listener = ShoppingCart.onCartChangedListener;
        if (listener) {
            listener({
                cost: cartCost
            });
        }
    }

    /**
     * Formats the cart to a string suitable for placing an order.
     */
    static cartToString(){
        var str = "";
        let items = ShoppingCart.cartItems;

        var i = 0;
        for (let item of items) {
            str += item.id + "x" + item.quantity;

            i++;
            if (i < items.length - 1) {
                // Append delimiter
                str += ","; 
            }
        }

        return str;
    }

    static onCartAddListener = null;

    //  Function which takes an object as param.
    static onCartChangedListener = null;

    //  Mounted ShoppingCart component.
    static component = null;

    static cartItems = [];
    static mergedCartItems = [];

    /**
     * Returns the cost of items in the cart.
     */
    static cartCost(){
        let items = ShoppingCart.mergedCartItems;
        var cost = 0;

        for (let item of items) {
            cost += item.cost;
        }

        return cost;
    }

    placeOrderTries = 3;
    placeOrderTriesRemaining = 0;

    checkedDefaultPaymentMethod = false;
    stripePayment = null;
    itemsDialog = null;

    state = {
        cartItems: [],
        cartCost: 0,
        selectedPaymentMethod: null,
        input: {
            billing_address: cookie.load("sc_addr"),
            floor: cookie.load("sc_floor"),
            door_code: cookie.load("sc_dcode"),
            full_name: cookie.load("sc_fname"),
            phone_num: cookie.load("sc_pnum"),
        },
        invalidFormMessage: null,
        loading: false
    };

    constructor(props) {
        super(props);

        this.inputWillChange = this.inputWillChange.bind(this);
    }

    componentDidMount(){
        super.componentDidMount();
        ShoppingCart.component = this;

        this.inputDidChange(this.state.input);
    }

    componentWillUnmount(){
        ShoppingCart.component = null;

        this.setState({
            loading: false
        });
    }

    /**
     * Called once a field in the form will change value.
     */
    inputWillChange(event){
        const target = event.target;
        const val = target.value;

        this.setState((old) => {
            let input = old.input;

            console.log("VAL: " + val);

            if (val.length == 0) {
                delete input[target.name];
            } else {
                input[target.name] = val;
            }

            this.inputDidChange(input);

            return old;
        });
    }

    /**
     * Called once the input data has changed.
     */
    inputDidChange(input){
        let msg = this.validateForm(input);
        if (msg != undefined || this.state.invalidFormMessage != undefined) {
            //  Called once if just became undefined
            this.setState({
                invalidFormMessage: msg
            });
        }
    }

    /**
     * Validates the form, and returns a message if a field has invalid input.
     */
    validateForm(input){
        var e = null;

        e = input.billing_address;
        if (e == undefined || e.trim().length < 3) {
            return "Ange din adress.";
        }

        e = input.full_name;
        if (e == undefined || e.trim().length < 3) {
            return "Ange ditt fullständiga namn.";
        }

        e = input.phone_num;
        if (e == undefined || ((e = e.trim()).length != 10 && e.length != 12)) {
            return "Ange ditt telefonnummer.";
        }
    }

    /**
     * Submits; places order.
     */
    placeOrder(){
        let paymentMethod = this.state.payment_method;
        this.setState((old) => {
            let input = old.input;
            
            input.postal_code = "35052"; //ShoppingCart.postalCode;
            input.payment_method = paymentMethod;
            input.cart_items = "1x5,1x5,1x5";
            input.fcm_token = "";

            const cookiesData = {
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
            }

            //  Save order data
            cookie.save("sc_addr", input.billing_address, cookiesData);
            cookie.save("sc_floor", input.floor, cookiesData);
            cookie.save("sc_dcode", input.door_code, cookiesData);
            cookie.save("sc_fname", input.full_name, cookiesData);
            cookie.save("sc_pnum", input.phone_num, cookiesData);

            switch (paymentMethod) {
                case 'card':
                this.stripePayment.submit(old.input, this.parsePlaceOrder.bind(this));
                break;

                case 'cash':
                Backend.request("action=place_order", old.input, this.parsePlaceOrder.bind(this))
                break;
            }

            old.loading = true

            return old;
        });
    }

    /**
     * Parses a backend response after placing an order.
     * @param {String} response 
     */
    parsePlaceOrder(response){
        this.setState({
            loading: false
        });

        if (response == null) {
            //  Error occurred
            return;
        }

        let json = JSON.parse(response);

        if (json.status == Backend.SUCCESS) {
            this.onPlacedOrder(json.order_id);
        } else {
            if (--this.placeOrderTriesRemaining <= 0) {
                this.onPlaceOrderError();
            } else {
                this.placeOrder();
            }
        }
    }

    /**
     * Called if an order was successfully placed.
     * @param {Number} orderId 
     */
    onPlacedOrder(orderId){
        this.props.onPlacedOrder(orderId);
    }

    onPlaceOrderError(message){
        this.props.showMessage(message);
    }

    handleMethodRadioClick(target){
        let parent = target.parentNode

        //  Reset all containers
        for (let c of document.querySelectorAll(".payment-method-c")) {
            c.removeAttribute("checked");
        }

        if (target.checked) {
            parent.setAttribute("checked", "");
        }

        this.inputWillChange({
            target: target
        });

        this.setState({
            payment_method: target.value
        });
    }

    renderContent(){
        //  State shorthand
        const st = this.state;
        let config = this.props.config;
        let input = st.input;
        const deliveryCost = config.delivery_cost;
        const cartCost = st.cartCost;
        const minCost = config.min_order_cost;
        const minCostDelta = minCost - cartCost;

        let totalCost = cartCost + Math.max(minCostDelta, 0) + deliveryCost;

        return (
            <div>

                <label style={{
                    marginBottom: '12px',
                    display: 'inline-block',
                    color: '#757575'
                }}>Artiklar</label>
                <ul id="cart-items">{
                    st.cartItems.map((e, i) => {
                        return i < previewItemCount ? (
                            <li style={styles.articleLi}>
                                <Article
                                    name={e.name}
                                    image={e.image}
                                    removable={true}
                                    isNew={false}
                                    quantity={e.quantity}
                                    cost={e.cost}
                                    onRemoveItem={() => {
                                        ShoppingCart.removeFromCart(e);
                                    }}/>
                            </li>
                        ) : null
                    })
                }</ul>
                {
                    st.cartItems.length > previewItemCount &&
                    <div style={{
                        textAlign: 'right'
                    }}>
                        <a onClick={() => {
                            if (this.itemsDialog) {
                                this.itemsDialog.show();
                            }
                        }}><img src={ic_expand} alt="" style={{
                            position: 'relative',
                            top: 6,
                            marginRight: 6
                        }}/>Visa alla</a>
                    </div>
                }

                <div>
                    <ul id="cost-details">
                        <li>Kundvagn
                            <span className="amount">{st.cartCost}kr</span></li>
                        { minCostDelta > 0 && 
                            <li>Mellanskillnad (minst {minCost}kr)
                                <span className="amount">{minCostDelta}kr</span>
                            </li>
                        }
                        <li>Utkörning
                            <span className="amount">{deliveryCost}kr</span>
                        </li>
                        <li style={ {fontSize: '20px'} }>Summa
                            <span className="amount">{totalCost}kr</span>
                        </li>
                    </ul>
                </div>

                <div id="payment-form">
                    <label>Betalningsmetod</label>
                    <div id="payment-methods">
                        <div className="payment-method-c">
                                
                            <input className="radio" type="radio"
                                onChange={(e) => {
                                    this.handleMethodRadioClick(e.target)
                                }}
                                name="payment_method" value="card"
                                ref={(e) => {
                                    if (e != null && !this.checkedDefaultPaymentMethod) {
                                        this.checkedDefaultPaymentMethod = true;
                                        this.handleMethodRadioClick(e)
                                    }
                                }}
                                defaultChecked={true} />

                            <p>Kort</p>
                        </div>
                        <div className="payment-method-c">
                            <input className="radio" type="radio"
                                onChange={(e) => {
                                    this.handleMethodRadioClick(e.target)
                                }}
                                name="payment_method" value="cash" />

                            <p>Kontant</p>
                        </div>
                    </div>

                    { //    Payment method fields
                    <div>
                        <StripeIntegration hidden={st.payment_method != 'card'}
                            ref={
                                (e) => this.stripePayment = e
                            }
                            />

                        {
                            st.payment_method == 'cash' &&
                            <div>
                                <p style={{
                                    marginTop: '32px',
                                    color: '#546E7A',
                                    textAlign: 'center'
                                }}>Var beredd med kontanter</p>
                            </div>
                        }
                    </div>
                    }

                    <label><img src={ic_location} alt="" /> Adress <span className="reqd">*</span></label>
                    <input type="text" name="billing_address" value={input.billing_address}
                        onChange={this.inputWillChange} maxLength="255" />

                    <div>
                        <div className='half-column'>
                            <label><img src={ic_floor} alt="" /> Våning</label>
                            <input type="text" name="floor" value={input.floor}
                                onChange={this.inputWillChange} onKeyDown={EventUtils.filterNumericInput} maxLength="3" />
                        </div>
                        <div className='half-column'>
                            <label><img src={ic_door_code} alt="" /> Portkod</label>
                            <input type="text" name="door_code" value={input.door_code}
                                onChange={this.inputWillChange} onKeyDown={EventUtils.filterNumericInput} maxLength="5" />
                        </div>
                    </div>

                    <label><img src={ic_person} alt="" /> Fullständigt namn <span className="reqd">*</span></label>
                    <input type="text" name="full_name" value={input.full_name}
                        onChange={this.inputWillChange} maxLength="255" />

                    <label><img src={ic_phone} alt="" /> Telefonnummer <span className="reqd">*</span></label>
                    <input type="text" name="phone_num" value={input.phone_num}
                        onChange={this.inputWillChange} maxLength="12" />

                    <label><img src={ic_message} alt="" /> Meddelande</label>
                    <textarea className="text-input" name="message" onChange={this.inputWillChange} maxLength="255"></textarea>

                    <div style={ { textAlign: 'center' } }>
                        {
                            st.invalidFormMessage != null &&
                            <p>
                                {st.invalidFormMessage}
                            </p>
                        }
                        <button disabled={st.invalidFormMessage != null}
                            onClick={
                            () => {
                                this.placeOrderTriesRemaining = this.placeOrderTries;
                                this.placeOrder();
                            }
                        }>Beställ</button>
                    </div>
                </div>
                <LoadingIndicator visible={st.loading} />

                <CartItems ref={(e) => this.itemsDialog = e} items={st.cartItems}/>
            </div>
        );
    }
}