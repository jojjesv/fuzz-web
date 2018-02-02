import React, { Component } from 'react';
import Backend from './Backend';
import ShoppingCart from './ShoppingCart';
import Article from './Article';
import ArticlesBackground from './ArticlesBackground';
import LoadingIndicator from './Loading'

const headerPopular = "Populärt denna vecka";

/**
 * Articles management.
 */
export default class Articles extends React.Component {
    state = {
        articleElements: [],
        header: headerPopular,
        isFetching: false
    }

    fetchResultCount = 20
    fetchPage = 0
    fetchedLastPage = false
    appendFetchedItems = true

    //  Categories used in fetch (object with ID, name).
    categories = null;

    constructor(params) {
        super(params);

        window.addEventListener('scroll', this.handleWindowScroll.bind(this));
    }

    componentWillMount(){
        this.fetch();
    }

    handleWindowScroll(ev) {
        const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight;

        if (atBottom) {
            this.fetchNextPage();
        }
    }

    /**
     * Fetches articles.
     */
    fetch() {
        if (this.state.isFetching) {
            return;
        }

        this.setState({
            isFetching: true
        });

        //  Show loading indicator

        var get = "out=articles&count=" + this.fetchResultCount
            + "&page=" + this.fetchPage;

        if (this.categories && this.categories.length > 0) {
            get += "&categories=";

            var i = 0;
            for (let c of this.categories) {
                get += c;

                if (i < this.categories.length - 1) {
                    get += ",";
                }
            }

        } else {
            //  Request popular articles
            get += "&popular";
        }

        Backend.request(get, null, this.parse.bind(this))
    }

    /**
     * Fetches the next page of articles, if not already fetching.
     * Typically called once scrolled to the bottom.
     */
    fetchNextPage() {
        if (!this.state.isFetching && !this.fetchedLastPage) {
            this.appendFetchedItems = true;
            this.fetchPage++;
            this.fetch();
        }
    }

    /**
     * Parses fetched articles response.
     */
    parse(response){
        this.setState({
            isFetching: false
        });

        let json = JSON.parse(response);

        if (!json) {
            this.onParseError();
            return;
        }

        let baseImageUrl = json.base_image_url;
        let articles = json.articles;

        if (articles.length > 0) {

            this.fetchedLastPage = articles.length < this.fetchResultCount;

            var elementData = {};
            var quantities;
            var costs;
            for (let article of articles) {
                quantities = article.quantities.split(",");
                costs = article.costs.split(",");

                for (var i = 0; i < quantities.length; i++) {
                    elementData[article.id] = {
                        id: article.id,
                        image: baseImageUrl + article.image,
                        quantity: Number.parseInt(quantities[i]),
                        cost: Number.parseFloat(costs[i]),
                        name: article.name,
                        isNew: article.is_new
                    };
                }
            }

            //  Array of new article elements
            var elements = [];
            for (let e in elementData) {
                e = elementData[e];
                elements.push((
                    <Article image={e.image} name={e.name} infoCallback={
                        (ev) => this.showInfo(e, ev.target)
                    } addToCartCallback={
                        (ev) => this.addToCart(e, ev.target)
                    } quantity={e.quantity} isNew={e.isNew}
                    cost={e.cost}/>
                ));
            }

            const newElements = elements;

            this.setState((old) => {
                let append = this.appendFetchedItems;

                if (append && old.articleElements) {
                    old.articleElements = old.articleElements.concat(newElements);
                } else {
                    old.articleElements = newElements;
                }

                return old;
            });
        } else {
            this.fetchedLastPage = true;
        }
    }

    /**
     * Called if an error occurred during parse.
     */
    onParseError(){

    }

    /**
     * Adds an article to the cart. Provides the caller element.
     */
    addToCart(item, sender) {
        ShoppingCart.addToCart(item);
    }
    
    /**
     * Shows article info. Provides the caller element.
     */
    showInfo(item, sender) {
        this.props.showArticleInfo(item);
    }

    componentWillReceiveProps(next){
        //  New categories by IDs
        let newCategories = next.activeCategories || [];

        //  New categories by full object
        let newCategoryObjs = next.activeCategoryObjs || [];
        
        if (this.categories == null || newCategories.length != this.categories.length) {
            if (newCategories) {
                //  Categories did change, copy by value
                this.categories = newCategories.slice();
                this.appendFetchedItems = false;
                this.fetchPage = 0;
                this.fetch();

                var newHeader = headerPopular;
                if (newCategoryObjs.length > 0) {
                    newHeader = "";
                    for (let i = 0, n = newCategoryObjs.length - 1; i <= n; i++) {
                        newHeader += newCategoryObjs[i].name;

                        if (i < n) {
                            newHeader += i < n - 1 ? ", " : " och ";
                        }
                    }
                }

                this.setState({
                    header: newHeader
                });
            } else {
                this.fetchPage = 0;
                this.appendFetchedItems = false;
                this.categories = {};
                this.fetch();
            }
        }
    }

    render(){
        let state = this.state;
        return (
            <div>
                <ArticlesBackground />
                <div className="articles">
                    <h2 style={{
                            color: '#fafafa',
                            fontSize: '30px'
                        }} className="shadowed">{state.header}</h2>
                    <div>
                        { this.state.articleElements }
                    </div>
                    {
                        !this.fetchedLastPage &&
                        <button onClick={
                            this.fetchNextPage.bind(this)
                        }
                        >Ladda in fler</button>
                    }
                </div>

                <LoadingIndicator visible={state.isFetching}/>
            </div>
        );
    }
}