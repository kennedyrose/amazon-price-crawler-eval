'use strict'

// Gets URL where prices can be crawled
exports.url = function (id, page) {
	var append = ''
	if (page && page !== 1) {
		append = '&startIndex=' + page + '0'
	}
	return 'https://www.amazon.com/gp/offer-listing/' + id + '/ref=olp_page_previous?ie=UTF8&overridePriceSuppression=1' + append
}

// Gets price, estimated tax, condition, description, and seller name
exports.eval = function () {

	// Element selectors
	var els = {
		container: '.olpOffer',
		price: '.olpOfferPrice',
		condition: '.olpCondition',
		description: '.olpConditionColumn .expandedNote',
		seller: '.olpSellerName',
		pagination: '.a-pagination'
	}
	var res = {
		pages: 1
	}

	// Gets content from element or returns error object
	var spaceReg = /\s\s+/g
	function getContent(el, selector, purpose, allowEmpty) {
		el = el.querySelector(selector)
		if (!el) {
			if (allowEmpty) {
				return ''
			}
			return { error: 'Cannot find ' + purpose + ' element.' }
		}
		el = el.textContent.trim()
		if (!el) {
			if (allowEmpty) {
				return ''
			}
			return { error: 'Cannot find ' + purpose + ' string in element.' }
		}
		el = el.replace(spaceReg, ' ')
		return el
	}

	// Get page total
	var pagination = [].slice.call(document.querySelectorAll('.a-pagination li'))
	if (pagination.length) {
		res.pages = pagination.length - 2
	}

	// Get all offers
	var offers = document.querySelectorAll(els.container)
	var prices = []
	for (var i = 0; i < offers.length; i++) {
		var obj = {}

		// Get price
		obj.price = getContent(offers[i], els.price, 'price')
		if (typeof obj.price === 'object') return JSON.stringify(obj.price)
		obj.price = obj.price.replace(/[^0-9.]/, '').replace(/,/g, '')
		obj.price = parseFloat(obj.price)
		if (obj.price === NaN) {
			return JSON.stringify({ error: 'Cannot parse price from string.' })
		}

		// Get condition
		obj.condition = getContent(offers[i], els.condition, 'condition')
		if (typeof obj.condition === 'object') return JSON.stringify(obj.condition)

		// Get description
		obj.description = getContent(offers[i], els.description, 'description', true)
		if (typeof obj.description === 'object') return JSON.stringify(obj.description)
		obj.description = obj.description.replace(' « Show less', '')

		// Get seller
		var seller = offers[i].querySelector(els.seller)
		if (!seller) return JSON.stringify('Cannot find seller element.')
		obj.seller = seller.textContent.trim()
		if (!obj.seller) {
			obj.seller = seller.querySelector('img')
			if (!obj.seller) {
				return JSON.stringify('Cannot find seller image element.')
			}
			obj.seller = obj.seller.getAttribute('alt')
			if (!obj.seller) {
				return JSON.stringify('Cannot find seller image alt attribute.')
			}
			obj.seller = obj.seller.trim()
		}
		obj.seller = obj.seller.replace(spaceReg, ' ')

		// Add to results
		prices.push(obj)
	}
	res.prices = prices

	return JSON.stringify(res)
}