import React, { Component } from 'react';
import Articles from './Articles'
import Backend from './Backend'
import Categories from "./Categories";
import ArticleInfo from "./ArticleInfo";
import ShoppingCart from "./ShoppingCart";
import PostalCode from "./PostalCode";
import PostOrder from "./PostOrder";
import Footer from "./Footer";
import Header from "./Header";
import TextDialog from './TextDialog';
import CookieConsent from './CookieConsent';
import PostOrderShortcut from './PostOrderShortcut';
import './App.css';

class App extends Component {
	static version = "1.0"

	state = {
		cartCost: 0,
		listeningOrderId: null,
		showExpandCategories: false,	//	Whether to show the button
		expandedCategoriesVisible: false,	//	Whether to show the modal view
		dialogMessage: null,
		dialogCaption: null,
		postOrderDialog: null
	}

	textDialog = null;
	header = null;

	shoppingCart = null;
	articleInfoDialog = null;

	constructor(params) {
		super(params);

		ShoppingCart.onCartChangedListener = (params) => {
			this.setState({
				cartCost: params.cost
			});
		};

		this.fetchConfig()

		ShoppingCart.onCartAddListener = () => {
			if (this.header) {
				this.header.createCartRipple();
			}
		}
	}

	fetchConfig() {
		const get = 'out=config&names=min_order_cost,company_address,' +
			'company_email,company_name,company_phone_num,delivery_cost,' +
			'open_days,open_time,closing_time';

		Backend.request(get, null, this.parseConfig.bind(this));

	}

	parseConfig(response) {
		let json = JSON.parse(response);
		json.min_order_cost = Number.parseFloat(json.min_order_cost);
		json.delivery_cost = Number.parseFloat(json.delivery_cost);

		this.setState({
			config: json
		});
	}

	showShoppingCart(){
		if (ShoppingCart.mergedCartItems.length == 0) {
			//	Don't show an empty cart.
			this.showMessage("Kundvagnen är tom. Klicka på den gröna knappen för att lägga till en artikel.", "Kundvagn");
			return;
		}

		this.shoppingCart.show()
	}

	/**
	 * Called if an order was just placed.
	 */
	onPlacedOrder(orderId){
		if (this.shoppingCart){
			this.shoppingCart.dismiss();
		}
		this.setState({
			listeningOrderId: orderId
		});
	}

	expandCategoriesClicked(){
		this.setState((old) => {
			old.expandedCategoriesVisible = !old.expandedCategoriesVisible
			return old;
		});
	}

	/**
	 * Shows a modal message to the user.
	 * @param {String} message 
	 * @param {String} caption 
	 */
	showMessage(message, caption) {
		this.textDialog.show();
		this.setState({
			dialogMessage: message,
			dialogCaption: caption
		});
	}

	render() {
		let postalCode = this.state.postalCode;

		let state = this.state;

		return (
			<div className="App">
				{
					postalCode ? <div>
						<Header ref={(e) => this.header = e}
						cartCost={state.cartCost} showShoppingCart={
							this.showShoppingCart.bind(this)
						} showExpandCategories={state.showExpandCategories}
						expandCategoriesClicked={this.expandCategoriesClicked.bind(this)}  />

						<ShoppingCart ref={
							(e) => this.shoppingCart = e
						} config={state.config}
						showMessage={this.showMessage.bind(this)}
						onPlacedOrder={this.onPlacedOrder.bind(this)}/>

						<Categories onChanged={(newCategoryIds, newCategories) => {
							this.setState({
								activeCategories: newCategoryIds,
								activeCategoryObjs: newCategories
							})
						}} changeExpandButtonVisibility={
							(visible) => {
								this.setState({
									showExpandCategories: visible
								});
							}
						} categoriesExpandedVisible={state.expandedCategoriesVisible}
						dismissExpandCategories={this.expandCategoriesClicked.bind(this)}/>

						{
							state.showExpandCategories &&
							<a id="expand-categories" onClick={this.expandCategoriesClicked.bind(this)}></a>
						}

						<Articles
							activeCategories={state.activeCategories}
							activeCategoryObjs={state.activeCategoryObjs}
							showArticleInfo={(data) => {
								this.setState({
									articleForInfo: data
								});
								this.articleInfoDialog.show(data)
							}}/>
						
						<PostOrderShortcut dialog={this.state.postOrderDialog} />

						<ArticleInfo ref={
							(e) => this.articleInfoDialog = e
						} data={state.articleForInfo}
						onDismiss={() => {
							this.setState({
								articleForInfo: undefined
							})
						}} />
						
						{
							state.listeningOrderId &&
							<PostOrder ref={(e) => {
								if (e != null && this.state.postOrderDialog == null) {
									this.setState({postOrderDialog: e});
								}
							}} orderId={state.listeningOrderId} visible={true} />
						}

					</div> : <PostalCode parent={this} 
						onPlacedOrder={this.onPlacedOrder.bind(this)}/>
				}

				<CookieConsent />

				<TextDialog ref={(e) => this.textDialog = e}
					message={state.dialogMessage} caption={state.dialogCaption} />
				
				
				{	state.config && 
					<Footer config={state.config} visible={true} />
				}

			</div>
		);
	}
}

export default App;
