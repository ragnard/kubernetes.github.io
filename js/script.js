 //modal close button
(function(){
	//π.modalCloseButton = function(closingFunction){
	//	return π.button('pi-modal-close-button', null, null, closingFunction);
	//};
})();

// globals
var body;

//helper functions
function booleanAttributeValue(element, attribute, defaultValue){
	// returns true if an attribute is present with no value
	// e.g. booleanAttributeValue(element, 'data-modal', false);
	if (element.hasAttribute(attribute)) {
		var value = element.getAttribute(attribute);
		if (value === '' || value === 'true') {
			return true;
		} else if (value === 'false') {
			return false;
		}
	}

	return defaultValue;
}

function classOnCondition(element, className, condition) {
	if (condition)
		$(element).addClass(className);
	else
		$(element).removeClass(className);
}

function highestZ() {
	var Z = 1000;

	$("*").each(function(){
		var thisZ = $(this).css('z-index');

		if (thisZ != "auto" && thisZ > Z) Z = ++thisZ;
	});

	return Z;
}

function newDOMElement(tag, className, id){
	var el = document.createElement(tag);

	if (className) el.className = className;
	if (id) el.id = id;

	return el;
}

function px(n){
	return n + 'px';
}

var kub = (function () {
	var HEADER_HEIGHT;
	var html, header, mainNav, quickstartButton, hero, encyclopedia, footer, wishField, headlineWrapper;

	$(document).ready(function () {
		html = $('html');
		body = $('body');
		header = $('header');
		mainNav = $('#mainNav');
		wishField = $('#wishField');
		quickstartButton = $('#quickstartButton');
		hero = $('#hero');
		encyclopedia = $('#encyclopedia');
		footer = $('footer');
		headlineWrapper = $('#headlineWrapper');
		HEADER_HEIGHT = header.outerHeight();

		resetTheView();

		window.addEventListener('resize', resetTheView);
		window.addEventListener('scroll', resetTheView);
		window.addEventListener('keydown', handleKeystrokes);
		wishField[0].addEventListener('keydown', handleKeystrokes);

		document.onunload = function(){
			window.removeEventListener('resize', resetTheView);
			window.removeEventListener('scroll', resetTheView);
			window.removeEventListener('keydown', handleKeystrokes);
			wishField[0].removeEventListener('keydown', handleKeystrokes);
		};

		$('.dropdown').each(function () {
			var dropdown = $(this);
			var readout = dropdown.find('.readout');

			dropdown.find('a').each(function(){
				if (location.href.indexOf(this.href) != -1) {
					readout.html($(this).html());
				}
			});

			readout.click(function () {
				dropdown.toggleClass('on');
				window.addEventListener('click', closeOpenDropdown);

				function closeOpenDropdown(e) {
					if (dropdown.hasClass('on') && !(dropdownWasClicked(e))) {
						dropdown.removeClass('on');
						window.removeEventListener('click', closeOpenDropdown);
					}
				}

				function dropdownWasClicked(e) {
					return $(e.target).parents('.dropdown').length;
				}
			});
		});

		setInterval(setFooterType, 10);
	});

	function setFooterType() {
		var windowHeight = window.innerHeight;
		var bodyHeight;

		switch (html[0].id) {
			case 'docs': {
				bodyHeight = hero.outerHeight() + encyclopedia.outerHeight();
				break;
			}

			case 'home':
				bodyHeight = windowHeight;
				break;

			default: {
				bodyHeight = hero.outerHeight() + $('#mainContent').outerHeight();
			}
		}

		var footerHeight = footer.outerHeight();
		classOnCondition(body, 'fixed', windowHeight - footerHeight > bodyHeight);
	}

	function resetTheView() {
		if (html.hasClass('open-nav')) {
			toggleMenu();
		} else {
			HEADER_HEIGHT = header.outerHeight();
		}

		if (html.hasClass('open-toc')) {
			toggleToc();
		}

		classOnCondition(html, 'flip-nav', window.pageYOffset > 0);

		if (html[0].id == 'home') {
			setHomeHeaderStyles();
		}
	}

	function setHomeHeaderStyles() {
		var Y = window.pageYOffset;
		var quickstartBottom = quickstartButton[0].getBoundingClientRect().bottom;

		classOnCondition(html[0], 'y-enough', Y > quickstartBottom);
	}

	function toggleMenu() {
		if (window.innerWidth < 800) {
			pushmenu.show('primary');
		}

		else {
			var newHeight = HEADER_HEIGHT;

			if (!html.hasClass('open-nav')) {
				newHeight = mainNav.outerHeight();
			}

			header.css({height: px(newHeight)});
			html.toggleClass('open-nav');
		}
	}

	function submitWish(textfield) {
		window.location.replace("https://github.com/kubernetes/kubernetes.github.io/issues/new?title=I%20wish%20" +
			window.location.pathname + "%20" + textfield.value + "&body=I%20wish%20" +
			window.location.pathname + "%20" + textfield.value);

		textfield.value = '';
		textfield.blur();
	}

	function handleKeystrokes(e) {
		switch (e.which) {
			case 13: {
				if (e.currentTarget === wishField[0]) {
					submitWish(wishField[0]);
				}
				break;
			}

			case 27: {
				if (html.hasClass('open-nav')) {
					toggleMenu();
				}
				break;
			}
		}
	}

	function showVideo() {
		$('body').css({overflow: 'hidden'});

		var videoPlayer = $("#videoPlayer");
		var videoIframe = videoPlayer.find("iframe")[0];
		videoIframe.src = videoIframe.getAttribute("data-url");
		videoPlayer.css({zIndex: highestZ()});
		videoPlayer.fadeIn(300);
		videoPlayer.click(function(){
			$('body').css({overflow: 'auto'});

			videoPlayer.fadeOut(300, function(){
				videoIframe.src = '';
			});
		});
	}

	function tocWasClicked(e) {
		var target = $(e.target);
		var docsToc = $("#docsToc");
		return (target[0] === docsToc[0] || target.parents("#docsToc").length > 0);
	}

	function listenForTocClick(e) {
		if (!tocWasClicked(e)) toggleToc();
	}

	function toggleToc() {
		html.toggleClass('open-toc');

		setTimeout(function () {
			if (html.hasClass('open-toc')) {
				window.addEventListener('click', listenForTocClick);
			} else {
				window.removeEventListener('click', listenForTocClick);
			}
		}, 100);
	}

	return {
		toggleToc: toggleToc,
		toggleMenu: toggleMenu,
		showVideo: showVideo
	};
})();


// accordion
(function(){
	var yah = true;
	var moving = false;
	var CSS_BROWSER_HACK_DELAY = 25;

	$(document).ready(function(){
		// Safari chokes on the animation here, so...
		if (navigator.userAgent.indexOf('Chrome') == -1 && navigator.userAgent.indexOf('Safari') != -1){
			var hackStyle = newDOMElement('style');
			hackStyle.innerHTML = '.pi-accordion .wrapper{transition: none}';
			body.append(hackStyle);
		}
		// Gross.

		$('.pi-accordion').each(function () {
			var accordion = this;
			var content = this.innerHTML;
			var container = newDOMElement('div', 'container');
			container.innerHTML = content;
			$(accordion).empty();
			accordion.appendChild(container);
			CollapseBox($(container));
		});

		setYAH();

		setTimeout(function () {
			yah = false;
		}, 500);
	});

	function CollapseBox(container){
		container.children('.item').each(function(){
			// build the TOC DOM
			// the animated open/close is enabled by having each item's content exist in the flow, at its natural height,
			// enclosed in a wrapper with height = 0 when closed, and height = contentHeight when open.
			var item = this;

			// only add content wrappers to containers, not to links
			var isContainer = item.tagName === 'DIV';

			var titleText = item.getAttribute('data-title');
			var title = newDOMElement('div', 'title');
			title.innerHTML = titleText;

			var wrapper, content;

			if (isContainer) {
				wrapper = newDOMElement('div', 'wrapper');
				content = newDOMElement('div', 'content');
				content.innerHTML = item.innerHTML;
				wrapper.appendChild(content);
			}

			item.innerHTML = '';
			item.appendChild(title);

			if (wrapper) {
				item.appendChild(wrapper);
				$(wrapper).css({height: 0});
			}


			$(title).click(function(){
				if (!yah) {
					if (moving) return;
					moving = true;
				}

				if (container[0].getAttribute('data-single')) {
					var openSiblings = item.siblings().filter(function(sib){return sib.hasClass('on');});
					openSiblings.forEach(function(sibling){
						toggleItem(sibling);
					});
				}

				setTimeout(function(){
					if (!isContainer) {
						moving = false;
						return;
					}
					toggleItem(item);
				}, CSS_BROWSER_HACK_DELAY);
			});

			function toggleItem(thisItem){
				var thisWrapper = $(thisItem).find('.wrapper').eq(0);

				if (!thisWrapper) return;

				var contentHeight = thisWrapper.find('.content').eq(0).innerHeight() + 'px';

				if ($(thisItem).hasClass('on')) {
					thisWrapper.css({height: contentHeight});
					$(thisItem).removeClass('on');

					setTimeout(function(){
						thisWrapper.css({height: 0});
						moving = false;
					}, CSS_BROWSER_HACK_DELAY);
				} else {
					$(item).addClass('on');
					thisWrapper.css({height: contentHeight});

					var duration = parseFloat(getComputedStyle(thisWrapper[0]).transitionDuration) * 1000;

					setTimeout(function(){
						thisWrapper.css({height: ''});
						moving = false;
					}, duration);
				}
			}

			if (content) {
				var innerContainers = $(content).children('.container');
				if (innerContainers.length > 0) {
					innerContainers.each(function(){
						CollapseBox($(this));
					});
				}
			}
		});
	}

	function setYAH() {
		var pathname = location.href.split('#')[0]; // on page load, make sure the page is YAH even if there's a hash
		var currentLinks = [];

		$('.pi-accordion a').each(function () {
			if (pathname === this.href) currentLinks.push(this);
		});

		currentLinks.forEach(function (yahLink) {
			$(yahLink).parents('.item').each(function(){
				$(this).addClass('on');
				$(this).find('.wrapper').eq(0).css({height: 'auto'});
				$(this).find('.content').eq(0).css({opacity: 1});
			});

			$(yahLink).addClass('yah');
			yahLink.onclick = function(e){e.preventDefault();};
		});
	}
})();


var pushmenu = (function(){
	var allPushMenus = {};

	$(document).ready(function(){
		$('[data-auto-burger]').each(function(){
			var container = this;
			var id = container.getAttribute('data-auto-burger');

			var autoBurger = document.getElementById(id) || newDOMElement('div', 'pi-pushmenu', id);
			var ul = autoBurger.querySelector('ul') || newDOMElement('ul');

			$(container).find('a[href], button').each(function () {
				if (!booleanAttributeValue(this, 'data-auto-burger-exclude', false)) {
					var clone = this.cloneNode(true);
					clone.id = '';

					if (clone.tagName == "BUTTON") {
						var aTag = newDOMElement('a');
						aTag.href = '';
						aTag.innerHTML = clone.innerHTML;
						aTag.onclick = clone.onclick;
						clone = aTag;
					}
					var li = newDOMElement('li');
					li.appendChild(clone);
					ul.appendChild(li);
				}
			});

			autoBurger.appendChild(ul);
			body.append(autoBurger);
		});

		$(".pi-pushmenu").each(function(){
			allPushMenus[this.id] = PushMenu(this);
		});
	});

	function show(objId) {
		allPushMenus[objId].expose();
	}

	function PushMenu(el) {
		var html = document.querySelector('html');

		var overlay = newDOMElement('div', 'overlay');
		var content = newDOMElement('div', 'content');
		content.appendChild(el.querySelector('*'));

		var side = el.getAttribute("data-side") || "right";

		var sled = newDOMElement('div', 'sled');
		$(sled).css(side, 0);

		sled.appendChild(content);

		var closeButton = newDOMElement('button', 'push-menu-close-button');
		closeButton.onclick = closeMe;

		sled.appendChild(closeButton);

		overlay.appendChild(sled);
		el.innerHTML = '';
		el.appendChild(overlay);

		sled.onclick = function(e){
			e.stopPropagation();
		};

		overlay.onclick = closeMe;

		window.addEventListener('resize', closeMe);

		function closeMe(e) {
			if (e.target == sled) return;

			$(el).removeClass('on');
			setTimeout(function(){
				$(el).css({display: 'none'});

				$(body).removeClass('overlay-on');
			}, 300);
		}

		function exposeMe(){
			$(body).addClass('overlay-on'); // in the default config, kills body scrolling

			$(el).css({
				display: 'block',
				zIndex: highestZ()
			});

			setTimeout(function(){
				$(el).addClass('on');
			}, 10);
		}

		return {
			expose: exposeMe
		};
	}

	return {
		show: show
	};
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIs+ALWJhc2VDb21wb25lbnRzLmpzIiwic2NyaXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIC8vbW9kYWwgY2xvc2UgYnV0dG9uXG4oZnVuY3Rpb24oKXtcblx0Ly/PgC5tb2RhbENsb3NlQnV0dG9uID0gZnVuY3Rpb24oY2xvc2luZ0Z1bmN0aW9uKXtcblx0Ly9cdHJldHVybiDPgC5idXR0b24oJ3BpLW1vZGFsLWNsb3NlLWJ1dHRvbicsIG51bGwsIG51bGwsIGNsb3NpbmdGdW5jdGlvbik7XG5cdC8vfTtcbn0pKCk7XG4iLCIvLyBnbG9iYWxzXG52YXIgYm9keTtcblxuLy9oZWxwZXIgZnVuY3Rpb25zXG5mdW5jdGlvbiBib29sZWFuQXR0cmlidXRlVmFsdWUoZWxlbWVudCwgYXR0cmlidXRlLCBkZWZhdWx0VmFsdWUpe1xuXHQvLyByZXR1cm5zIHRydWUgaWYgYW4gYXR0cmlidXRlIGlzIHByZXNlbnQgd2l0aCBubyB2YWx1ZVxuXHQvLyBlLmcuIGJvb2xlYW5BdHRyaWJ1dGVWYWx1ZShlbGVtZW50LCAnZGF0YS1tb2RhbCcsIGZhbHNlKTtcblx0aWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSkpIHtcblx0XHR2YXIgdmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuXHRcdGlmICh2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09ICd0cnVlJykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIGlmICh2YWx1ZSA9PT0gJ2ZhbHNlJykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBkZWZhdWx0VmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNsYXNzT25Db25kaXRpb24oZWxlbWVudCwgY2xhc3NOYW1lLCBjb25kaXRpb24pIHtcblx0aWYgKGNvbmRpdGlvbilcblx0XHQkKGVsZW1lbnQpLmFkZENsYXNzKGNsYXNzTmFtZSk7XG5cdGVsc2Vcblx0XHQkKGVsZW1lbnQpLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGhpZ2hlc3RaKCkge1xuXHR2YXIgWiA9IDEwMDA7XG5cblx0JChcIipcIikuZWFjaChmdW5jdGlvbigpe1xuXHRcdHZhciB0aGlzWiA9ICQodGhpcykuY3NzKCd6LWluZGV4Jyk7XG5cblx0XHRpZiAodGhpc1ogIT0gXCJhdXRvXCIgJiYgdGhpc1ogPiBaKSBaID0gKyt0aGlzWjtcblx0fSk7XG5cblx0cmV0dXJuIFo7XG59XG5cbmZ1bmN0aW9uIG5ld0RPTUVsZW1lbnQodGFnLCBjbGFzc05hbWUsIGlkKXtcblx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuXG5cdGlmIChjbGFzc05hbWUpIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcblx0aWYgKGlkKSBlbC5pZCA9IGlkO1xuXG5cdHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gcHgobil7XG5cdHJldHVybiBuICsgJ3B4Jztcbn1cblxudmFyIGt1YiA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciBIRUFERVJfSEVJR0hUO1xuXHR2YXIgaHRtbCwgaGVhZGVyLCBtYWluTmF2LCBxdWlja3N0YXJ0QnV0dG9uLCBoZXJvLCBlbmN5Y2xvcGVkaWEsIGZvb3Rlciwgd2lzaEZpZWxkLCBoZWFkbGluZVdyYXBwZXI7XG5cblx0JChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuXHRcdGh0bWwgPSAkKCdodG1sJyk7XG5cdFx0Ym9keSA9ICQoJ2JvZHknKTtcblx0XHRoZWFkZXIgPSAkKCdoZWFkZXInKTtcblx0XHRtYWluTmF2ID0gJCgnI21haW5OYXYnKTtcblx0XHR3aXNoRmllbGQgPSAkKCcjd2lzaEZpZWxkJyk7XG5cdFx0cXVpY2tzdGFydEJ1dHRvbiA9ICQoJyNxdWlja3N0YXJ0QnV0dG9uJyk7XG5cdFx0aGVybyA9ICQoJyNoZXJvJyk7XG5cdFx0ZW5jeWNsb3BlZGlhID0gJCgnI2VuY3ljbG9wZWRpYScpO1xuXHRcdGZvb3RlciA9ICQoJ2Zvb3RlcicpO1xuXHRcdGhlYWRsaW5lV3JhcHBlciA9ICQoJyNoZWFkbGluZVdyYXBwZXInKTtcblx0XHRIRUFERVJfSEVJR0hUID0gaGVhZGVyLm91dGVySGVpZ2h0KCk7XG5cblx0XHRyZXNldFRoZVZpZXcoKTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNldFRoZVZpZXcpO1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCByZXNldFRoZVZpZXcpO1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5c3Ryb2tlcyk7XG5cdFx0d2lzaEZpZWxkWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlzdHJva2VzKTtcblxuXHRcdGRvY3VtZW50Lm9udW5sb2FkID0gZnVuY3Rpb24oKXtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNldFRoZVZpZXcpO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHJlc2V0VGhlVmlldyk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUtleXN0cm9rZXMpO1xuXHRcdFx0d2lzaEZpZWxkWzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlzdHJva2VzKTtcblx0XHR9O1xuXG5cdFx0JCgnLmRyb3Bkb3duJykuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgZHJvcGRvd24gPSAkKHRoaXMpO1xuXHRcdFx0dmFyIHJlYWRvdXQgPSBkcm9wZG93bi5maW5kKCcucmVhZG91dCcpO1xuXG5cdFx0XHRkcm9wZG93bi5maW5kKCdhJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRpZiAobG9jYXRpb24uaHJlZi5pbmRleE9mKHRoaXMuaHJlZikgIT0gLTEpIHtcblx0XHRcdFx0XHRyZWFkb3V0Lmh0bWwoJCh0aGlzKS5odG1sKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmVhZG91dC5jbGljayhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGRyb3Bkb3duLnRvZ2dsZUNsYXNzKCdvbicpO1xuXHRcdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZU9wZW5Ecm9wZG93bik7XG5cblx0XHRcdFx0ZnVuY3Rpb24gY2xvc2VPcGVuRHJvcGRvd24oZSkge1xuXHRcdFx0XHRcdGlmIChkcm9wZG93bi5oYXNDbGFzcygnb24nKSAmJiAhKGRyb3Bkb3duV2FzQ2xpY2tlZChlKSkpIHtcblx0XHRcdFx0XHRcdGRyb3Bkb3duLnJlbW92ZUNsYXNzKCdvbicpO1xuXHRcdFx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VPcGVuRHJvcGRvd24pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIGRyb3Bkb3duV2FzQ2xpY2tlZChlKSB7XG5cdFx0XHRcdFx0cmV0dXJuICQoZS50YXJnZXQpLnBhcmVudHMoJy5kcm9wZG93bicpLmxlbmd0aDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRzZXRJbnRlcnZhbChzZXRGb290ZXJUeXBlLCAxMCk7XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIHNldEZvb3RlclR5cGUoKSB7XG5cdFx0dmFyIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblx0XHR2YXIgYm9keUhlaWdodDtcblxuXHRcdHN3aXRjaCAoaHRtbFswXS5pZCkge1xuXHRcdFx0Y2FzZSAnZG9jcyc6IHtcblx0XHRcdFx0Ym9keUhlaWdodCA9IGhlcm8ub3V0ZXJIZWlnaHQoKSArIGVuY3ljbG9wZWRpYS5vdXRlckhlaWdodCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0Y2FzZSAnaG9tZSc6XG5cdFx0XHRcdGJvZHlIZWlnaHQgPSB3aW5kb3dIZWlnaHQ7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdGJvZHlIZWlnaHQgPSBoZXJvLm91dGVySGVpZ2h0KCkgKyAkKCcjbWFpbkNvbnRlbnQnKS5vdXRlckhlaWdodCgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBmb290ZXJIZWlnaHQgPSBmb290ZXIub3V0ZXJIZWlnaHQoKTtcblx0XHRjbGFzc09uQ29uZGl0aW9uKGJvZHksICdmaXhlZCcsIHdpbmRvd0hlaWdodCAtIGZvb3RlckhlaWdodCA+IGJvZHlIZWlnaHQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gcmVzZXRUaGVWaWV3KCkge1xuXHRcdGlmIChodG1sLmhhc0NsYXNzKCdvcGVuLW5hdicpKSB7XG5cdFx0XHR0b2dnbGVNZW51KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdEhFQURFUl9IRUlHSFQgPSBoZWFkZXIub3V0ZXJIZWlnaHQoKTtcblx0XHR9XG5cblx0XHRpZiAoaHRtbC5oYXNDbGFzcygnb3Blbi10b2MnKSkge1xuXHRcdFx0dG9nZ2xlVG9jKCk7XG5cdFx0fVxuXG5cdFx0Y2xhc3NPbkNvbmRpdGlvbihodG1sLCAnZmxpcC1uYXYnLCB3aW5kb3cucGFnZVlPZmZzZXQgPiAwKTtcblxuXHRcdGlmIChodG1sWzBdLmlkID09ICdob21lJykge1xuXHRcdFx0c2V0SG9tZUhlYWRlclN0eWxlcygpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHNldEhvbWVIZWFkZXJTdHlsZXMoKSB7XG5cdFx0dmFyIFkgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG5cdFx0dmFyIHF1aWNrc3RhcnRCb3R0b20gPSBxdWlja3N0YXJ0QnV0dG9uWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbTtcblxuXHRcdGNsYXNzT25Db25kaXRpb24oaHRtbFswXSwgJ3ktZW5vdWdoJywgWSA+IHF1aWNrc3RhcnRCb3R0b20pO1xuXHR9XG5cblx0ZnVuY3Rpb24gdG9nZ2xlTWVudSgpIHtcblx0XHRpZiAod2luZG93LmlubmVyV2lkdGggPCA4MDApIHtcblx0XHRcdHB1c2htZW51LnNob3coJ3ByaW1hcnknKTtcblx0XHR9XG5cblx0XHRlbHNlIHtcblx0XHRcdHZhciBuZXdIZWlnaHQgPSBIRUFERVJfSEVJR0hUO1xuXG5cdFx0XHRpZiAoIWh0bWwuaGFzQ2xhc3MoJ29wZW4tbmF2JykpIHtcblx0XHRcdFx0bmV3SGVpZ2h0ID0gbWFpbk5hdi5vdXRlckhlaWdodCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRoZWFkZXIuY3NzKHtoZWlnaHQ6IHB4KG5ld0hlaWdodCl9KTtcblx0XHRcdGh0bWwudG9nZ2xlQ2xhc3MoJ29wZW4tbmF2Jyk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gc3VibWl0V2lzaCh0ZXh0ZmllbGQpIHtcblx0XHR3aW5kb3cubG9jYXRpb24ucmVwbGFjZShcImh0dHBzOi8vZ2l0aHViLmNvbS9rdWJlcm5ldGVzL2t1YmVybmV0ZXMuZ2l0aHViLmlvL2lzc3Vlcy9uZXc/dGl0bGU9SSUyMHdpc2glMjBcIiArXG5cdFx0XHR3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBcIiUyMFwiICsgdGV4dGZpZWxkLnZhbHVlICsgXCImYm9keT1JJTIwd2lzaCUyMFwiICtcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIFwiJTIwXCIgKyB0ZXh0ZmllbGQudmFsdWUpO1xuXG5cdFx0dGV4dGZpZWxkLnZhbHVlID0gJyc7XG5cdFx0dGV4dGZpZWxkLmJsdXIoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGhhbmRsZUtleXN0cm9rZXMoZSkge1xuXHRcdHN3aXRjaCAoZS53aGljaCkge1xuXHRcdFx0Y2FzZSAxMzoge1xuXHRcdFx0XHRpZiAoZS5jdXJyZW50VGFyZ2V0ID09PSB3aXNoRmllbGRbMF0pIHtcblx0XHRcdFx0XHRzdWJtaXRXaXNoKHdpc2hGaWVsZFswXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cblx0XHRcdGNhc2UgMjc6IHtcblx0XHRcdFx0aWYgKGh0bWwuaGFzQ2xhc3MoJ29wZW4tbmF2JykpIHtcblx0XHRcdFx0XHR0b2dnbGVNZW51KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gc2hvd1ZpZGVvKCkge1xuXHRcdCQoJ2JvZHknKS5jc3Moe292ZXJmbG93OiAnaGlkZGVuJ30pO1xuXG5cdFx0dmFyIHZpZGVvUGxheWVyID0gJChcIiN2aWRlb1BsYXllclwiKTtcblx0XHR2YXIgdmlkZW9JZnJhbWUgPSB2aWRlb1BsYXllci5maW5kKFwiaWZyYW1lXCIpWzBdO1xuXHRcdHZpZGVvSWZyYW1lLnNyYyA9IHZpZGVvSWZyYW1lLmdldEF0dHJpYnV0ZShcImRhdGEtdXJsXCIpO1xuXHRcdHZpZGVvUGxheWVyLmNzcyh7ekluZGV4OiBoaWdoZXN0WigpfSk7XG5cdFx0dmlkZW9QbGF5ZXIuZmFkZUluKDMwMCk7XG5cdFx0dmlkZW9QbGF5ZXIuY2xpY2soZnVuY3Rpb24oKXtcblx0XHRcdCQoJ2JvZHknKS5jc3Moe292ZXJmbG93OiAnYXV0byd9KTtcblxuXHRcdFx0dmlkZW9QbGF5ZXIuZmFkZU91dCgzMDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZpZGVvSWZyYW1lLnNyYyA9ICcnO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiB0b2NXYXNDbGlja2VkKGUpIHtcblx0XHR2YXIgdGFyZ2V0ID0gJChlLnRhcmdldCk7XG5cdFx0dmFyIGRvY3NUb2MgPSAkKFwiI2RvY3NUb2NcIik7XG5cdFx0cmV0dXJuICh0YXJnZXRbMF0gPT09IGRvY3NUb2NbMF0gfHwgdGFyZ2V0LnBhcmVudHMoXCIjZG9jc1RvY1wiKS5sZW5ndGggPiAwKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGxpc3RlbkZvclRvY0NsaWNrKGUpIHtcblx0XHRpZiAoIXRvY1dhc0NsaWNrZWQoZSkpIHRvZ2dsZVRvYygpO1xuXHR9XG5cblx0ZnVuY3Rpb24gdG9nZ2xlVG9jKCkge1xuXHRcdGh0bWwudG9nZ2xlQ2xhc3MoJ29wZW4tdG9jJyk7XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChodG1sLmhhc0NsYXNzKCdvcGVuLXRvYycpKSB7XG5cdFx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGxpc3RlbkZvclRvY0NsaWNrKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGxpc3RlbkZvclRvY0NsaWNrKTtcblx0XHRcdH1cblx0XHR9LCAxMDApO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHR0b2dnbGVUb2M6IHRvZ2dsZVRvYyxcblx0XHR0b2dnbGVNZW51OiB0b2dnbGVNZW51LFxuXHRcdHNob3dWaWRlbzogc2hvd1ZpZGVvXG5cdH07XG59KSgpO1xuXG5cbi8vIGFjY29yZGlvblxuKGZ1bmN0aW9uKCl7XG5cdHZhciB5YWggPSB0cnVlO1xuXHR2YXIgbW92aW5nID0gZmFsc2U7XG5cdHZhciBDU1NfQlJPV1NFUl9IQUNLX0RFTEFZID0gMjU7XG5cblx0JChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblx0XHQvLyBTYWZhcmkgY2hva2VzIG9uIHRoZSBhbmltYXRpb24gaGVyZSwgc28uLi5cblx0XHRpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdDaHJvbWUnKSA9PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ1NhZmFyaScpICE9IC0xKXtcblx0XHRcdHZhciBoYWNrU3R5bGUgPSBuZXdET01FbGVtZW50KCdzdHlsZScpO1xuXHRcdFx0aGFja1N0eWxlLmlubmVySFRNTCA9ICcucGktYWNjb3JkaW9uIC53cmFwcGVye3RyYW5zaXRpb246IG5vbmV9Jztcblx0XHRcdGJvZHkuYXBwZW5kKGhhY2tTdHlsZSk7XG5cdFx0fVxuXHRcdC8vIEdyb3NzLlxuXG5cdFx0JCgnLnBpLWFjY29yZGlvbicpLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIGFjY29yZGlvbiA9IHRoaXM7XG5cdFx0XHR2YXIgY29udGVudCA9IHRoaXMuaW5uZXJIVE1MO1xuXHRcdFx0dmFyIGNvbnRhaW5lciA9IG5ld0RPTUVsZW1lbnQoJ2RpdicsICdjb250YWluZXInKTtcblx0XHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPSBjb250ZW50O1xuXHRcdFx0JChhY2NvcmRpb24pLmVtcHR5KCk7XG5cdFx0XHRhY2NvcmRpb24uYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblx0XHRcdENvbGxhcHNlQm94KCQoY29udGFpbmVyKSk7XG5cdFx0fSk7XG5cblx0XHRzZXRZQUgoKTtcblxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0eWFoID0gZmFsc2U7XG5cdFx0fSwgNTAwKTtcblx0fSk7XG5cblx0ZnVuY3Rpb24gQ29sbGFwc2VCb3goY29udGFpbmVyKXtcblx0XHRjb250YWluZXIuY2hpbGRyZW4oJy5pdGVtJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0Ly8gYnVpbGQgdGhlIFRPQyBET01cblx0XHRcdC8vIHRoZSBhbmltYXRlZCBvcGVuL2Nsb3NlIGlzIGVuYWJsZWQgYnkgaGF2aW5nIGVhY2ggaXRlbSdzIGNvbnRlbnQgZXhpc3QgaW4gdGhlIGZsb3csIGF0IGl0cyBuYXR1cmFsIGhlaWdodCxcblx0XHRcdC8vIGVuY2xvc2VkIGluIGEgd3JhcHBlciB3aXRoIGhlaWdodCA9IDAgd2hlbiBjbG9zZWQsIGFuZCBoZWlnaHQgPSBjb250ZW50SGVpZ2h0IHdoZW4gb3Blbi5cblx0XHRcdHZhciBpdGVtID0gdGhpcztcblxuXHRcdFx0Ly8gb25seSBhZGQgY29udGVudCB3cmFwcGVycyB0byBjb250YWluZXJzLCBub3QgdG8gbGlua3Ncblx0XHRcdHZhciBpc0NvbnRhaW5lciA9IGl0ZW0udGFnTmFtZSA9PT0gJ0RJVic7XG5cblx0XHRcdHZhciB0aXRsZVRleHQgPSBpdGVtLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpO1xuXHRcdFx0dmFyIHRpdGxlID0gbmV3RE9NRWxlbWVudCgnZGl2JywgJ3RpdGxlJyk7XG5cdFx0XHR0aXRsZS5pbm5lckhUTUwgPSB0aXRsZVRleHQ7XG5cblx0XHRcdHZhciB3cmFwcGVyLCBjb250ZW50O1xuXG5cdFx0XHRpZiAoaXNDb250YWluZXIpIHtcblx0XHRcdFx0d3JhcHBlciA9IG5ld0RPTUVsZW1lbnQoJ2RpdicsICd3cmFwcGVyJyk7XG5cdFx0XHRcdGNvbnRlbnQgPSBuZXdET01FbGVtZW50KCdkaXYnLCAnY29udGVudCcpO1xuXHRcdFx0XHRjb250ZW50LmlubmVySFRNTCA9IGl0ZW0uaW5uZXJIVE1MO1xuXHRcdFx0XHR3cmFwcGVyLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpdGVtLmlubmVySFRNTCA9ICcnO1xuXHRcdFx0aXRlbS5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cblx0XHRcdGlmICh3cmFwcGVyKSB7XG5cdFx0XHRcdGl0ZW0uYXBwZW5kQ2hpbGQod3JhcHBlcik7XG5cdFx0XHRcdCQod3JhcHBlcikuY3NzKHtoZWlnaHQ6IDB9KTtcblx0XHRcdH1cblxuXG5cdFx0XHQkKHRpdGxlKS5jbGljayhmdW5jdGlvbigpe1xuXHRcdFx0XHRpZiAoIXlhaCkge1xuXHRcdFx0XHRcdGlmIChtb3ZpbmcpIHJldHVybjtcblx0XHRcdFx0XHRtb3ZpbmcgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGNvbnRhaW5lclswXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2luZ2xlJykpIHtcblx0XHRcdFx0XHR2YXIgb3BlblNpYmxpbmdzID0gaXRlbS5zaWJsaW5ncygpLmZpbHRlcihmdW5jdGlvbihzaWIpe3JldHVybiBzaWIuaGFzQ2xhc3MoJ29uJyk7fSk7XG5cdFx0XHRcdFx0b3BlblNpYmxpbmdzLmZvckVhY2goZnVuY3Rpb24oc2libGluZyl7XG5cdFx0XHRcdFx0XHR0b2dnbGVJdGVtKHNpYmxpbmcpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGlmICghaXNDb250YWluZXIpIHtcblx0XHRcdFx0XHRcdG1vdmluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0b2dnbGVJdGVtKGl0ZW0pO1xuXHRcdFx0XHR9LCBDU1NfQlJPV1NFUl9IQUNLX0RFTEFZKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRmdW5jdGlvbiB0b2dnbGVJdGVtKHRoaXNJdGVtKXtcblx0XHRcdFx0dmFyIHRoaXNXcmFwcGVyID0gJCh0aGlzSXRlbSkuZmluZCgnLndyYXBwZXInKS5lcSgwKTtcblxuXHRcdFx0XHRpZiAoIXRoaXNXcmFwcGVyKSByZXR1cm47XG5cblx0XHRcdFx0dmFyIGNvbnRlbnRIZWlnaHQgPSB0aGlzV3JhcHBlci5maW5kKCcuY29udGVudCcpLmVxKDApLmlubmVySGVpZ2h0KCkgKyAncHgnO1xuXG5cdFx0XHRcdGlmICgkKHRoaXNJdGVtKS5oYXNDbGFzcygnb24nKSkge1xuXHRcdFx0XHRcdHRoaXNXcmFwcGVyLmNzcyh7aGVpZ2h0OiBjb250ZW50SGVpZ2h0fSk7XG5cdFx0XHRcdFx0JCh0aGlzSXRlbSkucmVtb3ZlQ2xhc3MoJ29uJyk7XG5cblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHR0aGlzV3JhcHBlci5jc3Moe2hlaWdodDogMH0pO1xuXHRcdFx0XHRcdFx0bW92aW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0fSwgQ1NTX0JST1dTRVJfSEFDS19ERUxBWSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JChpdGVtKS5hZGRDbGFzcygnb24nKTtcblx0XHRcdFx0XHR0aGlzV3JhcHBlci5jc3Moe2hlaWdodDogY29udGVudEhlaWdodH0pO1xuXG5cdFx0XHRcdFx0dmFyIGR1cmF0aW9uID0gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKHRoaXNXcmFwcGVyWzBdKS50cmFuc2l0aW9uRHVyYXRpb24pICogMTAwMDtcblxuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdHRoaXNXcmFwcGVyLmNzcyh7aGVpZ2h0OiAnJ30pO1xuXHRcdFx0XHRcdFx0bW92aW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0fSwgZHVyYXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb250ZW50KSB7XG5cdFx0XHRcdHZhciBpbm5lckNvbnRhaW5lcnMgPSAkKGNvbnRlbnQpLmNoaWxkcmVuKCcuY29udGFpbmVyJyk7XG5cdFx0XHRcdGlmIChpbm5lckNvbnRhaW5lcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGlubmVyQ29udGFpbmVycy5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRDb2xsYXBzZUJveCgkKHRoaXMpKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gc2V0WUFIKCkge1xuXHRcdHZhciBwYXRobmFtZSA9IGxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXTsgLy8gb24gcGFnZSBsb2FkLCBtYWtlIHN1cmUgdGhlIHBhZ2UgaXMgWUFIIGV2ZW4gaWYgdGhlcmUncyBhIGhhc2hcblx0XHR2YXIgY3VycmVudExpbmtzID0gW107XG5cblx0XHQkKCcucGktYWNjb3JkaW9uIGEnKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChwYXRobmFtZSA9PT0gdGhpcy5ocmVmKSBjdXJyZW50TGlua3MucHVzaCh0aGlzKTtcblx0XHR9KTtcblxuXHRcdGN1cnJlbnRMaW5rcy5mb3JFYWNoKGZ1bmN0aW9uICh5YWhMaW5rKSB7XG5cdFx0XHQkKHlhaExpbmspLnBhcmVudHMoJy5pdGVtJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdvbicpO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJy53cmFwcGVyJykuZXEoMCkuY3NzKHtoZWlnaHQ6ICdhdXRvJ30pO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJy5jb250ZW50JykuZXEoMCkuY3NzKHtvcGFjaXR5OiAxfSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCh5YWhMaW5rKS5hZGRDbGFzcygneWFoJyk7XG5cdFx0XHR5YWhMaW5rLm9uY2xpY2sgPSBmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7fTtcblx0XHR9KTtcblx0fVxufSkoKTtcblxuXG52YXIgcHVzaG1lbnUgPSAoZnVuY3Rpb24oKXtcblx0dmFyIGFsbFB1c2hNZW51cyA9IHt9O1xuXG5cdCQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cdFx0JCgnW2RhdGEtYXV0by1idXJnZXJdJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGNvbnRhaW5lciA9IHRoaXM7XG5cdFx0XHR2YXIgaWQgPSBjb250YWluZXIuZ2V0QXR0cmlidXRlKCdkYXRhLWF1dG8tYnVyZ2VyJyk7XG5cblx0XHRcdHZhciBhdXRvQnVyZ2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpIHx8IG5ld0RPTUVsZW1lbnQoJ2RpdicsICdwaS1wdXNobWVudScsIGlkKTtcblx0XHRcdHZhciB1bCA9IGF1dG9CdXJnZXIucXVlcnlTZWxlY3RvcigndWwnKSB8fCBuZXdET01FbGVtZW50KCd1bCcpO1xuXG5cdFx0XHQkKGNvbnRhaW5lcikuZmluZCgnYVtocmVmXSwgYnV0dG9uJykuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmICghYm9vbGVhbkF0dHJpYnV0ZVZhbHVlKHRoaXMsICdkYXRhLWF1dG8tYnVyZ2VyLWV4Y2x1ZGUnLCBmYWxzZSkpIHtcblx0XHRcdFx0XHR2YXIgY2xvbmUgPSB0aGlzLmNsb25lTm9kZSh0cnVlKTtcblx0XHRcdFx0XHRjbG9uZS5pZCA9ICcnO1xuXG5cdFx0XHRcdFx0aWYgKGNsb25lLnRhZ05hbWUgPT0gXCJCVVRUT05cIikge1xuXHRcdFx0XHRcdFx0dmFyIGFUYWcgPSBuZXdET01FbGVtZW50KCdhJyk7XG5cdFx0XHRcdFx0XHRhVGFnLmhyZWYgPSAnJztcblx0XHRcdFx0XHRcdGFUYWcuaW5uZXJIVE1MID0gY2xvbmUuaW5uZXJIVE1MO1xuXHRcdFx0XHRcdFx0YVRhZy5vbmNsaWNrID0gY2xvbmUub25jbGljaztcblx0XHRcdFx0XHRcdGNsb25lID0gYVRhZztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dmFyIGxpID0gbmV3RE9NRWxlbWVudCgnbGknKTtcblx0XHRcdFx0XHRsaS5hcHBlbmRDaGlsZChjbG9uZSk7XG5cdFx0XHRcdFx0dWwuYXBwZW5kQ2hpbGQobGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0YXV0b0J1cmdlci5hcHBlbmRDaGlsZCh1bCk7XG5cdFx0XHRib2R5LmFwcGVuZChhdXRvQnVyZ2VyKTtcblx0XHR9KTtcblxuXHRcdCQoXCIucGktcHVzaG1lbnVcIikuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0YWxsUHVzaE1lbnVzW3RoaXMuaWRdID0gUHVzaE1lbnUodGhpcyk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIHNob3cob2JqSWQpIHtcblx0XHRhbGxQdXNoTWVudXNbb2JqSWRdLmV4cG9zZSgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gUHVzaE1lbnUoZWwpIHtcblx0XHR2YXIgaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcblxuXHRcdHZhciBvdmVybGF5ID0gbmV3RE9NRWxlbWVudCgnZGl2JywgJ292ZXJsYXknKTtcblx0XHR2YXIgY29udGVudCA9IG5ld0RPTUVsZW1lbnQoJ2RpdicsICdjb250ZW50Jyk7XG5cdFx0Y29udGVudC5hcHBlbmRDaGlsZChlbC5xdWVyeVNlbGVjdG9yKCcqJykpO1xuXG5cdFx0dmFyIHNpZGUgPSBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNpZGVcIikgfHwgXCJyaWdodFwiO1xuXG5cdFx0dmFyIHNsZWQgPSBuZXdET01FbGVtZW50KCdkaXYnLCAnc2xlZCcpO1xuXHRcdCQoc2xlZCkuY3NzKHNpZGUsIDApO1xuXG5cdFx0c2xlZC5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuXHRcdHZhciBjbG9zZUJ1dHRvbiA9IG5ld0RPTUVsZW1lbnQoJ2J1dHRvbicsICdwdXNoLW1lbnUtY2xvc2UtYnV0dG9uJyk7XG5cdFx0Y2xvc2VCdXR0b24ub25jbGljayA9IGNsb3NlTWU7XG5cblx0XHRzbGVkLmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcblxuXHRcdG92ZXJsYXkuYXBwZW5kQ2hpbGQoc2xlZCk7XG5cdFx0ZWwuaW5uZXJIVE1MID0gJyc7XG5cdFx0ZWwuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XG5cblx0XHRzbGVkLm9uY2xpY2sgPSBmdW5jdGlvbihlKXtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0fTtcblxuXHRcdG92ZXJsYXkub25jbGljayA9IGNsb3NlTWU7XG5cblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgY2xvc2VNZSk7XG5cblx0XHRmdW5jdGlvbiBjbG9zZU1lKGUpIHtcblx0XHRcdGlmIChlLnRhcmdldCA9PSBzbGVkKSByZXR1cm47XG5cblx0XHRcdCQoZWwpLnJlbW92ZUNsYXNzKCdvbicpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHQkKGVsKS5jc3Moe2Rpc3BsYXk6ICdub25lJ30pO1xuXG5cdFx0XHRcdCQoYm9keSkucmVtb3ZlQ2xhc3MoJ292ZXJsYXktb24nKTtcblx0XHRcdH0sIDMwMCk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZXhwb3NlTWUoKXtcblx0XHRcdCQoYm9keSkuYWRkQ2xhc3MoJ292ZXJsYXktb24nKTsgLy8gaW4gdGhlIGRlZmF1bHQgY29uZmlnLCBraWxscyBib2R5IHNjcm9sbGluZ1xuXG5cdFx0XHQkKGVsKS5jc3Moe1xuXHRcdFx0XHRkaXNwbGF5OiAnYmxvY2snLFxuXHRcdFx0XHR6SW5kZXg6IGhpZ2hlc3RaKClcblx0XHRcdH0pO1xuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoZWwpLmFkZENsYXNzKCdvbicpO1xuXHRcdFx0fSwgMTApO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRleHBvc2U6IGV4cG9zZU1lXG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0c2hvdzogc2hvd1xuXHR9O1xufSkoKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
